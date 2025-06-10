import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, User } from "lucide-react";

export default function Workflow() {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['/api/workflow'],
    queryFn: async () => {
      const response = await fetch('/api/workflow');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  const { data: patients } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: async () => {
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Header title="Workflow Management" subtitle="Loading workflow tasks..." />
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Header title="Workflow Management" subtitle="Error loading workflow" />
        <div className="text-center py-8 text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  const taskList = Array.isArray(tasks) ? tasks : [];
  const patientList = Array.isArray(patients) ? patients : [];

  const getPatientName = (patientId: number) => {
    const patient = patientList.find((p: any) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const urgentCount = taskList.filter((task: any) => task.priority === 'urgent').length;
  const highCount = taskList.filter((task: any) => task.priority === 'high').length;
  const pendingCount = taskList.filter((task: any) => task.status === 'pending').length;

  return (
    <div className="container mx-auto p-6">
      <Header 
        title="Hypertension Workflow Management" 
        subtitle="Automated blood pressure triage and outreach tasks"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskList.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Urgent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Workflow Tasks ({taskList.length})</h2>
        
        {taskList.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No workflow tasks found.</p>
            </CardContent>
          </Card>
        ) : (
          taskList.map((task: any) => (
            <Card key={task.id} className="border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {task.priority === 'urgent' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      Patient: {getPatientName(task.patientId)} • Task ID: {task.id}
                    </p>
                    
                    <p className="text-sm mb-3">{task.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Assigned: {task.assignee.name}
                        </div>
                      )}
                      
                      <div>
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Workflow Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Hypertension Workflow Protocol</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-red-600 mb-1">Urgent (≥160/≥100)</h4>
              <p className="text-sm text-gray-600">Call within 2 hours regardless of recent contact</p>
            </div>
            <div>
              <h4 className="font-medium text-orange-600 mb-1">High Priority (≥150/≥96)</h4>
              <p className="text-sm text-gray-600">Nurse follow-up within 24 hours</p>
            </div>
            <div>
              <h4 className="font-medium text-yellow-600 mb-1">Medium Priority (140-149/90-95)</h4>
              <p className="text-sm text-gray-600">Coach outreach within 48 hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}