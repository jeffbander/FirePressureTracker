import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { WorkflowTaskCard } from "@/components/workflow-task-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Users, CheckCircle, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Workflow() {
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['/api/workflow'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Header 
          title="Hypertension Workflow" 
          subtitle="Automated blood pressure triage and outreach management"
        />
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  const getPatientName = (patientId: number) => {
    const patient = patients.find((p: any) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const filteredTasks = tasks.filter((task: any) => {
    if (priorityFilter === 'all') return true;
    return task.priority === priorityFilter;
  });

  const urgentTasks = filteredTasks.filter((task: any) => task.priority === 'urgent');
  const highTasks = filteredTasks.filter((task: any) => task.priority === 'high');
  const pendingTasks = filteredTasks.filter((task: any) => task.status === 'pending');
  const activeTasks = filteredTasks.filter((task: any) => task.status === 'in_progress');

  return (
    <div className="container mx-auto p-6">
      <Header 
        title="Hypertension Workflow" 
        subtitle="Automated blood pressure triage and outreach management"
      >
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4" />
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Header>

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{urgentTasks.length}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highTasks.length}</div>
            <p className="text-xs text-muted-foreground">Due within 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeTasks.length}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="urgent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="urgent">Urgent ({urgentTasks.length})</TabsTrigger>
          <TabsTrigger value="high">High Priority ({highTasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="all">All Tasks ({filteredTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="urgent" className="space-y-4">
          {urgentTasks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No urgent tasks at this time.
              </CardContent>
            </Card>
          ) : (
            urgentTasks.map((task: any) => (
              <WorkflowTaskCard 
                key={task.id} 
                task={task} 
                patientName={getPatientName(task.patientId)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          {highTasks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No high priority tasks at this time.
              </CardContent>
            </Card>
          ) : (
            highTasks.map((task: any) => (
              <WorkflowTaskCard 
                key={task.id} 
                task={task} 
                patientName={getPatientName(task.patientId)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingTasks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending tasks at this time.
              </CardContent>
            </Card>
          ) : (
            pendingTasks.map((task: any) => (
              <WorkflowTaskCard 
                key={task.id} 
                task={task} 
                patientName={getPatientName(task.patientId)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No tasks match the current filter.
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task: any) => (
              <WorkflowTaskCard 
                key={task.id} 
                task={task} 
                patientName={getPatientName(task.patientId)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Workflow Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Hypertension Workflow Information</CardTitle>
          <CardDescription>
            Automated triage system following clinical guidelines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-purple-600">Urgent (160/100+)</h4>
              <p className="text-sm text-muted-foreground">
                Patient must be called within 2 hours regardless of recent contact
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">High Priority (150/96+)</h4>
              <p className="text-sm text-muted-foreground">
                Nurse practitioner follow-up within 24 hours
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-orange-600">Medium Priority (140-149/90-95)</h4>
              <p className="text-sm text-muted-foreground">
                Hypertension coach outreach within 48 hours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}