import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { mockPatients, mockBpReadings, mockWorkflowTasks } from "../lib/mockData"
import { categorizeBP, getBPColorClass } from "../lib/bp-utils"
import { Activity, Users, AlertTriangle, Clock } from "lucide-react"

export default function Dashboard() {
  const totalPatients = mockPatients.length
  const abnormalReadings = mockBpReadings.filter(reading => reading.isAbnormal).length
  const pendingTasks = mockWorkflowTasks.filter(task => task.status === 'pending').length
  const urgentTasks = mockWorkflowTasks.filter(task => task.priority === 'urgent').length

  const recentReadings = mockBpReadings
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    .slice(0, 5)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-blue-900">Dashboard</h2>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">Active firefighters</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abnormal Readings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{abnormalReadings}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Workflow items</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentTasks}</div>
            <p className="text-xs text-muted-foreground">Immediate action</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Readings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Recent Blood Pressure Readings</CardTitle>
          <CardDescription>Latest readings from all patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReadings.map((reading) => {
              const patient = mockPatients.find(p => p.id === reading.patientId)
              const category = categorizeBP(reading.systolic, reading.diastolic)
              
              return (
                <div key={reading.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{patient?.firstName} {patient?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{patient?.employeeId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{reading.systolic}/{reading.diastolic} mmHg</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(reading.recordedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`${getBPColorClass(category)} text-white`}>
                      {category.name}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              View All Readings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Active Workflow Tasks</CardTitle>
          <CardDescription>Tasks requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockWorkflowTasks.map((task) => {
              const patient = mockPatients.find(p => p.id === task.patientId)
              
              return (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{patient?.firstName} {patient?.lastName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={task.priority === 'urgent' ? 'destructive' : 'secondary'}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline">
                      {task.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              View All Tasks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}