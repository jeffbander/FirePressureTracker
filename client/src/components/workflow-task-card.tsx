import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Phone, UserCheck, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WorkflowTaskCardProps {
  task: {
    id: number;
    patientId: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    dueDate: string | null;
    assignedTo: number;
    createdAt: string;
    completedAt: string | null;
  };
  patientName?: string;
}

export function WorkflowTaskCard({ task, patientName }: WorkflowTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<typeof task> }) => {
      const response = await fetch(`/api/workflow/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflow-tasks'] });
      toast({
        title: "Task Updated",
        description: "Workflow task has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
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

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const isUrgent = task.priority === 'urgent' || task.title.includes('URGENT');

  const handleStartTask = () => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { status: 'in_progress' }
    });
  };

  const handleCompleteTask = () => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { 
        status: 'completed',
        completedAt: new Date().toISOString()
      }
    });
  };

  return (
    <Card className={`${isOverdue ? 'border-red-500 shadow-md' : ''} ${isUrgent ? 'border-purple-500 shadow-lg' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isUrgent && <AlertTriangle className="h-4 w-4 text-purple-600" />}
              <CardTitle className="text-base font-semibold">{task.title}</CardTitle>
            </div>
            <CardDescription className="text-sm">
              Patient: {patientName} • Created {new Date(task.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 items-end">
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
      </CardHeader>

      <CardContent className="pt-0">
        <div className={`text-sm text-gray-700 ${isExpanded ? '' : 'line-clamp-2'}`}>
          {task.description}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
          
          <div className="flex gap-2">
            {task.status === 'pending' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleStartTask}
                disabled={updateTaskMutation.isPending}
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Start Task
              </Button>
            )}
            
            {task.status === 'in_progress' && (
              <Button 
                size="sm"
                onClick={handleCompleteTask}
                disabled={updateTaskMutation.isPending}
              >
                <Phone className="h-3 w-3 mr-1" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}