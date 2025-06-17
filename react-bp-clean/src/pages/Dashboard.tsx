import { Activity, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPatients, mockBpReadings, mockWorkflowTasks } from "@/lib/mockData";

export default function Dashboard() {
  const totalPatients = mockPatients.length;
  const abnormalReadings = mockBpReadings.filter(reading => reading.isAbnormal).length;
  const pendingTasks = mockWorkflowTasks.filter(task => task.status === 'pending').length;

  const stats = [
    {
      title: "Total Patients",
      value: totalPatients,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Abnormal Readings",
      value: abnormalReadings,
      icon: AlertTriangle,
      color: "text-red-600", 
      bg: "bg-red-50",
    },
    {
      title: "Pending Tasks",
      value: pendingTasks,
      icon: Activity,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Total Readings",
      value: mockBpReadings.length,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  const recentReadings = mockBpReadings
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    .slice(0, 5);

  const getCategoryDisplay = (category: string) => {
    switch (category) {
      case 'normal':
        return { text: 'Normal', color: 'text-green-600 bg-green-50' };
      case 'elevated':
        return { text: 'Elevated', color: 'text-yellow-600 bg-yellow-50' };
      case 'stage_1_hypertension':
        return { text: 'Stage 1 HTN', color: 'text-orange-600 bg-orange-50' };
      case 'stage_2_hypertension':
        return { text: 'Stage 2 HTN', color: 'text-red-600 bg-red-50' };
      case 'hypertensive_crisis':
        return { text: 'Crisis', color: 'text-red-800 bg-red-100' };
      default:
        return { text: category, color: 'text-gray-600 bg-gray-50' };
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Fire Department Blood Pressure Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Readings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent BP Readings</CardTitle>
            <CardDescription>Latest blood pressure measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReadings.map((reading) => {
                const patient = mockPatients.find(p => p.id === reading.patientId);
                const category = getCategoryDisplay(reading.category);
                
                return (
                  <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {patient?.firstName} {patient?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {reading.systolic}/{reading.diastolic} mmHg
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(reading.recordedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${category.color}`}>
                      {category.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Workflow Tasks</CardTitle>
            <CardDescription>Outstanding tasks requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockWorkflowTasks.filter(task => task.status === 'pending').map((task) => {
                const patient = mockPatients.find(p => p.id === task.patientId);
                const priorityColor = {
                  low: 'text-green-600 bg-green-50',
                  medium: 'text-yellow-600 bg-yellow-50',
                  high: 'text-orange-600 bg-orange-50',
                  urgent: 'text-red-600 bg-red-50',
                }[task.priority];

                return (
                  <div key={task.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColor}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}