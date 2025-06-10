import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddPatientDialog } from "@/components/add-patient-dialog";
import { IndividualBPChart } from "@/components/individual-bp-chart";

export default function Patients() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [unionFilter, setUnionFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: patients, isLoading } = useQuery({
    queryKey: ['/api/patients', { search, status: statusFilter, union: unionFilter }],
  });

  const getStatusColor = (category: string) => {
    switch (category) {
      case 'stage2':
        return 'bg-red-100 text-destructive';
      case 'stage1':
        return 'bg-orange-100 text-orange-600';
      case 'elevated':
        return 'bg-yellow-100 text-yellow-600';
      case 'low':
        return 'bg-blue-100 text-blue-600';
      case 'normal':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (category: string) => {
    switch (category) {
      case 'stage2':
        return 'Critical';
      case 'stage1':
        return 'Stage 1';
      case 'elevated':
        return 'Elevated';
      case 'low':
        return 'Low BP';
      case 'normal':
        return 'Normal';
      default:
        return 'No Data';
    }
  };

  return (
    <div className="flex-1 ml-64">
      <Header 
        title="Patient Management" 
        subtitle="View and manage patient records and readings"
      >
        <Button onClick={() => setShowAddDialog(true)}>
          <i className="fas fa-plus mr-2"></i>
          Add Patient
        </Button>
        <Button variant="outline">
          <i className="fas fa-download mr-2"></i>
          Export
        </Button>
      </Header>

      <main className="p-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
              <div className="flex-1 lg:mr-6">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <Input
                    type="text"
                    placeholder="Search patients by name, ID, or station..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="elevated">Elevated</SelectItem>
                    <SelectItem value="stage1">Stage 1 Hypertension</SelectItem>
                    <SelectItem value="stage2">Stage 2 Hypertension</SelectItem>
                    <SelectItem value="low">Low BP</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={unionFilter} onValueChange={setUnionFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Unions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Unions</SelectItem>
                    <SelectItem value="Union 1">Union 1</SelectItem>
                    <SelectItem value="Union 3">Union 3</SelectItem>
                    <SelectItem value="Union 7">Union 7</SelectItem>
                    <SelectItem value="Union 15">Union 15</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Cards with BP Trends */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Patient Records</h2>
            <span className="text-sm text-gray-600">
              Showing {patients?.length || 0} patients
            </span>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-64 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {patients?.map((patient: any) => (
                <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold text-lg">
                            {patient.firstName?.[0]}{patient.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {patient.union} • ID: {patient.employeeId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {patient.latestReading && (
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                            getStatusColor(patient.latestReading.category)
                          }`}>
                            {getStatusLabel(patient.latestReading.category)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <IndividualBPChart
                      patientName={`${patient.firstName} ${patient.lastName}`}
                      readings={patient.readings || []}
                      height="h-48"
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {patient.latestReading ? (
                          <span>
                            Latest: <span className="font-mono font-semibold">
                              {patient.latestReading.systolic}/{patient.latestReading.diastolic}
                            </span> on {new Date(patient.latestReading.recordedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span>No recent readings</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/patients/${patient.id}`}>
                          <Button size="sm" variant="outline">
                            <i className="fas fa-eye mr-1"></i>
                            View Details
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          <i className="fas fa-phone"></i>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <AddPatientDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog} 
        />
      </main>
    </div>
  );
}
