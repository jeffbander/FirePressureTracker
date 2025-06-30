import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, AlertCircle, XCircle, User, Phone, Mail, Calendar } from "lucide-react";
import { formatDate } from "@shared/date-utils";
import { apiRequest } from "@/lib/queryClient";
import type { Patient } from "@shared/schema";

const STATUS_CONFIG = {
  awaiting_confirmation: {
    label: "Awaiting Confirmation",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Patient registration needs approval"
  },
  awaiting_cuff: {
    label: "Awaiting Cuff",
    icon: AlertCircle,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Patient approved, waiting for BP cuff"
  },
  awaiting_first_reading: {
    label: "Awaiting First Reading",
    icon: Clock,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Cuff delivered, waiting for first BP reading"
  },
  active: {
    label: "Active",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Fully enrolled in program"
  },
  inactive: {
    label: "Inactive",
    icon: AlertCircle,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "No BP reading in 6+ months"
  },
  out_of_program: {
    label: "Out of Program",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
    description: "No longer participating"
  }
};

interface UnionSummary {
  union: string;
  pendingCount: number;
  awaitingConfirmation: number;
  awaitingCuff: number;
}

export default function Approvals() {
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedUnion, setSelectedUnion] = useState<string | "all">("all");
  const queryClient = useQueryClient();

  // Fetch union summary for admin view
  const { data: unionSummary = [], isLoading: isUnionSummaryLoading } = useQuery<UnionSummary[]>({
    queryKey: ['/api/unions/pending-summary'],
    enabled: selectedStatus === "pending"
  });

  // Fetch pending patients (all or by union)
  const { data: pendingPatients = [], isLoading: isPendingLoading } = useQuery<Patient[]>({
    queryKey: selectedUnion === "all" 
      ? ['/api/patients/pending'] 
      : ['/api/patients/pending-by-union', selectedUnion],
    enabled: selectedStatus === "pending"
  });

  // Fetch patients by status
  const { data: statusPatients = [], isLoading: isStatusLoading } = useQuery<Patient[]>({
    queryKey: ['/api/patients/status', selectedStatus],
    enabled: selectedStatus !== "pending" && selectedStatus !== "inactive"
  });

  // Fetch inactive patients
  const { data: inactivePatients = [], isLoading: isInactiveLoading } = useQuery<Patient[]>({
    queryKey: ['/api/patients/inactive'],
    enabled: selectedStatus === "inactive"
  });

  // Approve patient mutation
  const approveMutation = useMutation({
    mutationFn: async ({ patientId, newStatus }: { patientId: number; newStatus: string }) => {
      const response = await fetch(`/api/patients/${patientId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newStatus,
          approvedBy: 1 // In real app, this would be current user ID
        })
      });
      if (!response.ok) throw new Error('Failed to approve patient');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patients/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patients/status'] });
    }
  });

  const handleApproval = (patientId: number, newStatus: string) => {
    approveMutation.mutate({ patientId, newStatus });
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const renderPatientCard = (patient: Patient) => (
    <Card key={patient.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {patient.firstName} {patient.lastName}
            </CardTitle>
            <CardDescription>
              DOB: {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'N/A'}
            </CardDescription>
          </div>
          {getStatusBadge(patient.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-700">Union</div>
            <div className="text-sm">{patient.union}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-700">Phone</div>
            <div className="text-sm">{patient.phone || 'Not provided'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-700">Email</div>
            <div className="text-sm">{patient.email || 'Not provided'}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mb-4">
          <Calendar className="h-3 w-3 inline mr-1" />
          Registered: {patient.createdAt ? formatDate(patient.createdAt) : 'N/A'}
        </div>

        {selectedStatus === "pending" && (
          <div className="space-y-3 pt-4 border-t">
            {/* Next Step Buttons */}
            <div className="flex gap-2">
              {patient.status === "awaiting_confirmation" && (
                <>
                  <Button
                    onClick={() => handleApproval(patient.id, "awaiting_cuff")}
                    disabled={approveMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve → Awaiting Cuff
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleApproval(patient.id, "out_of_program")}
                    disabled={approveMutation.isPending}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
              {patient.status === "awaiting_cuff" && (
                <Button
                  onClick={() => handleApproval(patient.id, "active")}
                  disabled={approveMutation.isPending}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate → Active
                </Button>
              )}
            </div>
            
            {/* Status Dropdown for Manual Override */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Or set status manually:</span>
              <Select
                onValueChange={(newStatus) => handleApproval(patient.id, newStatus)}
                disabled={approveMutation.isPending}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Change status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awaiting_confirmation">Awaiting Confirmation</SelectItem>
                  <SelectItem value="awaiting_cuff">Awaiting Cuff</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="out_of_program">Out of Program</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {selectedStatus !== "pending" && patient.status === "active" && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => handleApproval(patient.id, "out_of_program")}
              disabled={approveMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Remove from Program
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const currentPatients = selectedStatus === "pending" ? pendingPatients : statusPatients;
  const isLoading = selectedStatus === "pending" ? isPendingLoading : isStatusLoading;

  return (
    <div className="space-y-6 ml-64 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Approvals</h1>
        <p className="text-muted-foreground mt-2">
          Manage patient registration approvals and status changes
        </p>
      </div>

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">
            Pending Approval
            {pendingPatients.length > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white">
                {pendingPatients.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="awaiting_confirmation">Awaiting Confirmation</TabsTrigger>
          <TabsTrigger value="awaiting_cuff">Awaiting Cuff</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="out_of_program">Out of Program</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Patient Approvals</CardTitle>
              <CardDescription>
                Review and approve new patient registrations
              </CardDescription>
            </CardHeader>
          </Card>
          
          {isLoading ? (
            <div className="text-center py-8">Loading pending patients...</div>
          ) : currentPatients.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No patients pending approval</p>
              </CardContent>
            </Card>
          ) : (
            currentPatients.map(renderPatientCard)
          )}
        </TabsContent>

        {Object.keys(STATUS_CONFIG).map(status => (
          <TabsContent key={status} value={status} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label} Patients</CardTitle>
                <CardDescription>
                  {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].description}
                </CardDescription>
              </CardHeader>
            </Card>
            
            {isLoading ? (
              <div className="text-center py-8">Loading patients...</div>
            ) : currentPatients.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No patients with this status</p>
                </CardContent>
              </Card>
            ) : (
              currentPatients.map(renderPatientCard)
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}