import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Workflow() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/workflow', { status: statusFilter, priority: priorityFilter }],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/workflow/${taskId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Task updated successfully",
        description: "The task status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartTask = (taskId: number) => {
    updateTaskMutation.mutate({ taskId, status: 'in_progress' });
  };

  const handleCompleteTask = (taskId: number) => {
    updateTaskMutation.mutate({ taskId, status: 'completed' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-destructive';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filterCounts = {
    all: tasks?.length || 0,
    high: tasks?.filter((t: any) => t.priority === 'high').length || 0,
    pending: tasks?.filter((t: any) => t.status === 'pending').length || 0,
    overdue: tasks?.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date()).length || 0,
  };

  return (
    <div className="flex-1 ml-64">
      <Header 
        title="Workflow Management" 
        subtitle="Manage patient follow-up tasks and care coordination"
      >
        <Button>
          <i className="fas fa-plus mr-2"></i>
          Create Task
        </Button>
      </Header>

      <main className="p-8">
        {/* Task Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === 'all' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Tasks ({filterCounts.all})
              </button>
              <button 
                onClick={() => setPriorityFilter('high')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  priorityFilter === 'high' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                High Priority ({filterCounts.high})
              </button>
              <button 
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === 'pending' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Due Today ({filterCounts.pending})
              </button>
              <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium">
                Overdue ({filterCounts.overdue})
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-4 h-4 bg-gray-200 rounded mt-1"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            tasks?.map((task: any) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-4 h-4 border-2 border-primary rounded mt-1 hover:bg-primary hover:border-primary cursor-pointer ${
                        task.status === 'completed' ? 'bg-green-600 border-green-600' : ''
                      }`}></div>
                      <div className={`flex-1 ${task.status === 'completed' ? 'opacity-75' : ''}`}>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`font-semibold text-gray-900 ${
                            task.status === 'completed' ? 'line-through' : ''
                          }`}>
                            {task.title}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            getPriorityColor(task.priority)
                          }`}>
                            {task.priority} Priority
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            getStatusColor(task.status)
                          }`}>
                            {task.status === 'in_progress' ? 'In Progress' : 
                             task.status === 'completed' ? 'Completed' : 
                             'Pending'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          {task.description}
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <i className="fas fa-user mr-2"></i>
                            <span>
                              {task.patient?.firstName} {task.patient?.lastName} ({task.patient?.employeeId})
                            </span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-user-md mr-2"></i>
                            <span>{task.assignee?.name}</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-calendar mr-2"></i>
                            <span>
                              {task.status === 'completed' ? 'Completed: ' : 'Due: '}
                              {task.status === 'completed' && task.completedAt 
                                ? new Date(task.completedAt).toLocaleDateString()
                                : task.dueDate 
                                  ? new Date(task.dueDate).toLocaleDateString()
                                  : 'No due date'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {task.status !== 'completed' && (
                        <Button 
                          size="sm" 
                          onClick={() => task.status === 'pending' ? handleStartTask(task.id) : handleCompleteTask(task.id)}
                          disabled={updateTaskMutation.isPending}
                        >
                          {task.status === 'pending' ? 'Start Task' : 'Mark Complete'}
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Patient
                      </Button>
                      <Button size="sm" variant="ghost">
                        <i className="fas fa-ellipsis-v"></i>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {tasks && tasks.length > 10 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
