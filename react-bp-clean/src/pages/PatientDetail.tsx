import { useParams } from "wouter";
import { ArrowLeft, Phone, Mail, AlertTriangle, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockPatients, mockBpReadings, mockWorkflowTasks, mockCommunicationLogs } from "@/lib/mockData";

export default function PatientDetail() {
  const { id } = useParams();
  const patientId = parseInt(id || '1');
  
  const patient = mockPatients.find(p => p.id === patientId);
  
  if (!patient) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Patient Not Found</h2>
          <p className="mt-2 text-gray-600">The patient you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const patientReadings = mockBpReadings.filter(r => r.patientId === patientId);
  const patientTasks = mockWorkflowTasks.filter(t => t.patientId === patientId);
  const patientComms = mockCommunicationLogs.filter(c => c.patientId === patientId);

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
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {patient.firstName} {patient.lastName}
        </h1>
        <p className="text-gray-600">{patient.department} • {patient.employeeId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Employee ID</label>
                <p className="text-gray-900">{patient.employeeId}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Department</label>
                <p className="text-gray-900">{patient.department}</p>
              </div>
              
              {patient.union && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Union</label>
                  <p className="text-gray-900">{patient.union}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500">Age</label>
                <p className="text-gray-900">{patient.age || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Information</label>
                <div className="space-y-2 mt-1">
                  {patient.phone && (
                    <div className="flex items-center text-gray-900">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {patient.phone}
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center text-gray-900">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {patient.email}
                    </div>
                  )}
                </div>
              </div>
              
              {patient.emergencyContact && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                  <p className="text-gray-900">{patient.emergencyContact}</p>
                  {patient.emergencyPhone && (
                    <p className="text-gray-600 text-sm">{patient.emergencyPhone}</p>
                  )}
                </div>
              )}
              
              {patient.medicalNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Medical Notes</label>
                  <p className="text-gray-900">{patient.medicalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* BP Readings and Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent BP Readings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent BP Readings</CardTitle>
            </CardHeader>
            <CardContent>
              {patientReadings.length > 0 ? (
                <div className="space-y-3">
                  {patientReadings
                    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                    .map((reading) => {
                      const category = getCategoryDisplay(reading.category);
                      return (
                        <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {reading.systolic}/{reading.diastolic} mmHg
                              </span>
                              {reading.pulse && (
                                <span className="text-sm text-gray-600">
                                  • Pulse: {reading.pulse}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(reading.recordedAt).toLocaleString()}
                            </p>
                            {reading.notes && (
                              <p className="text-sm text-gray-700 mt-1">{reading.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {reading.isAbnormal && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${category.color}`}>
                              {category.text}
                            </span>
                          </div>
                        </div>
                    );})}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No BP readings recorded</p>
              )}
            </CardContent>
          </Card>

          {/* Workflow Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {patientTasks.length > 0 ? (
                <div className="space-y-3">
                  {patientTasks.map((task) => {
                    const priorityColor = {
                      low: 'text-green-600 bg-green-50',
                      medium: 'text-yellow-600 bg-yellow-50',
                      high: 'text-orange-600 bg-orange-50',
                      urgent: 'text-red-600 bg-red-50',
                    }[task.priority];

                    const statusColor = {
                      pending: 'text-orange-600 bg-orange-50',
                      in_progress: 'text-blue-600 bg-blue-50',
                      completed: 'text-green-600 bg-green-50',
                      cancelled: 'text-gray-600 bg-gray-50',
                    }[task.status];

                    return (
                      <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                              {task.dueDate && (
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColor}`}>
                              {task.priority.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                              {task.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No workflow tasks</p>
              )}
            </CardContent>
          </Card>

          {/* Communication Log */}
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
            </CardHeader>
            <CardContent>
              {patientComms.length > 0 ? (
                <div className="space-y-3">
                  {patientComms
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((comm) => (
                      <div key={comm.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-gray-900 capitalize">
                                {comm.type.replace('_', ' ')}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(comm.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comm.message}</p>
                            {comm.outcome && (
                              <p className="text-xs text-gray-600 mt-1">
                                Outcome: {comm.outcome.replace('_', ' ')}
                              </p>
                            )}
                            {comm.followUpRequired && comm.followUpDate && (
                              <p className="text-xs text-orange-600 mt-1">
                                Follow-up required by: {new Date(comm.followUpDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No communication history</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}