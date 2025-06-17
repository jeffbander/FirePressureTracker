import { useState } from "react";
import { Filter, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockWorkflowTasks, mockPatients, mockUsers } from "@/lib/mockData";

export default function Workflow() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const filteredTasks = mockWorkflowTasks.filter(task => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus;
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'urgent':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-orange-600 bg-orange-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const taskStats = {
    total: mockWorkflowTasks.length,
    pending: mockWorkflowTasks.filter(t => t.status === 'pending').length,
    inProgress: mockWorkflowTasks.filter(t => t.status === 'in_progress').length,
    completed: mockWorkflowTasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Workflow Management</h1>
        <p className="mt-2 text-gray-600">Track and manage patient care tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-50">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-xl font-bold text-gray-900">{taskStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-50">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-900">{taskStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-50">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-xl font-bold text-gray-900">{taskStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-bold text-gray-900">{taskStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const patient = mockPatients.find(p => p.id === task.patientId);
          const assignedUser = task.assignedTo ? mockUsers.find(u => u.id === task.assignedTo) : null;
          const priorityColor = getPriorityColor(task.priority);
          const statusColor = getStatusColor(task.status);

          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Patient:</span> {patient?.firstName} {patient?.lastName}
                      </div>
                      {assignedUser && (
                        <div>
                          <span className="font-medium">Assigned to:</span> {assignedUser.name}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Created:</span> {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                      {task.dueDate && (
                        <div>
                          <span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {task.completedAt && (
                        <div>
                          <span className="font-medium">Completed:</span> {new Date(task.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColor}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    {task.status === 'pending' && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          Start Task
                        </Button>
                        <Button size="sm">
                          Complete
                        </Button>
                      </div>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          Pause
                        </Button>
                        <Button size="sm">
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or check back later for new tasks.
          </p>
        </div>
      )}
    </div>
  );
}