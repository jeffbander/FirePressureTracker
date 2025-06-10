import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Phone, User } from "lucide-react";

export default function Workflow() {
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
        <div className="text-center py-8">Loading workflow tasks...</div>
      </div>
    );
  }

  const getPatientName = (patientId: number) => {
    const patient = (patients as any[]).find((p: any) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return 'No due date';
    const date = new Date(dueDate);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) {
      return `Overdue by ${Math.abs(diffHours).toFixed(0)} hours`;
    } else if (diffHours < 24) {
      return `Due in ${diffHours.toFixed(0)} hours`;
    } else {
      return `Due ${date.toLocaleDateString()}`;
    }
  };

  const urgentTasks = (tasks as any[]).filter(task => task.priority === 'urgent');
  const highTasks = (tasks as any[]).filter(task => task.priority === 'high');
  const mediumTasks = (tasks as any[]).filter(task => task.priority === 'medium');
  const pendingTasks = (tasks as any[]).filter(task => task.status === 'pending');

  return (
    <div className="container mx-auto p-6">
      <Header 
        title="Hypertension Workflow" 
        subtitle="Automated blood pressure triage and outreach management"
      />

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(tasks as any[]).length}</div>
            <p className="text-xs text-muted-foreground">Active workflow items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentTasks.length}</div>
            <p className="text-xs text-muted-foreground">Critical BP readings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highTasks.length}</div>
            <p className="text-xs text-muted-foreground">Nurse follow-ups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
      </div>

      {/* All Tasks List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">All Workflow Tasks</h2>
        
        {(tasks as any[]).length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No workflow tasks at this time.
            </CardContent>
          </Card>
        ) : (
          (tasks as any[]).map((task: any) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
            const isUrgent = task.priority === 'urgent';
            
            return (
              <Card key={task.id} className={`${isOverdue ? 'border-red-500 shadow-md' : ''} ${isUrgent ? 'border-red-400 shadow-lg' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {isUrgent && <AlertTriangle className="h-4 w-4 text-red-600" />}
                        <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
                      </div>
                      <CardDescription className="text-sm mb-2">
                        Patient: {getPatientName(task.patientId)} • Created {new Date(task.createdAt).toLocaleDateString()}
                      </CardDescription>
                      <p className="text-sm text-gray-700 mb-3">{task.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end ml-4">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  {task.dueDate && (
                    <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      <Clock className="h-3 w-3" />
                      {formatDueDate(task.dueDate)}
                    </div>
                  )}

                  {task.assignee && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <User className="h-3 w-3" />
                      Assigned to: {task.assignee.name} ({task.assignee.role})
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-gray-500">
                      Task ID: {task.id}
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <Button size="sm" variant="outline">
                          Start Task
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button size="sm">
                          <Phone className="h-3 w-3 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>

      {/* Workflow Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Hypertension Workflow Information</CardTitle>
          <CardDescription>
            Automated triage system following clinical guidelines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Urgent (≥160/≥100)</h4>
              <p className="text-sm text-muted-foreground">
                Patient must be called within 2 hours regardless of recent contact
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-orange-600">High Priority (≥150/≥96)</h4>
              <p className="text-sm text-muted-foreground">
                Nurse practitioner follow-up within 24 hours
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-600">Medium Priority (140-149/90-95)</h4>
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