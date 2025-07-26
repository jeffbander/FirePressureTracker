import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IndividualBPChart } from "@/components/individual-bp-chart";

export default function PatientDetail() {
  const params = useParams();
  const patientId = parseInt(params.id!);

  const { data: patient, isLoading } = useQuery({
    queryKey: [`/api/patients/${patientId}`],
  });

  if (isLoading) {
    return (
      <div className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0">
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0">
        <div className="p-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">Patient not found</p>
              <Link href="/patients">
                <Button className="mt-4">Back to Patients</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusColor = (category: string) => {
    switch (category) {
      case 'stage2':
        return 'bg-red-100 text-destructive border-red-200';
      case 'stage1':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'elevated':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'normal':
        return 'bg-green-100 text-green-600 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (category: string) => {
    switch (category) {
      case 'stage2':
        return 'Critical - Stage 2 Hypertension';
      case 'stage1':
        return 'Stage 1 Hypertension';
      case 'elevated':
        return 'Elevated Blood Pressure';
      case 'low':
        return 'Low Blood Pressure';
      case 'normal':
        return 'Normal';
      default:
        return 'Unknown';
    }
  };

  const latestReading = patient.readings?.[0];
  const medications = patient.medications ? JSON.parse(patient.medications) : [];

  return (
    <div className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0">
      <Header 
        title="Patient Details" 
        subtitle="Detailed patient information and blood pressure trends"
      >
        <Link href="/patients">
          <Button variant="outline">
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Patients
          </Button>
        </Link>
      </Header>

      <main className="p-8">
        {/* Patient Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">
                    {patient.firstName?.[0]}{patient.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <p className="text-gray-600">
                    {patient.department} • {patient.union} • ID: {patient.employeeId}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    {latestReading && (
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${
                        getStatusColor(latestReading.category)
                      }`}>
                        {getStatusLabel(latestReading.category)}
                      </span>
                    )}
                    <span className="text-sm text-gray-600">Age: {patient.age} years</span>
                    {latestReading && (
                      <span className="text-sm text-gray-600">
                        Latest: {latestReading.systolic}/{latestReading.diastolic} mmHg
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button>
                  <i className="fas fa-phone mr-2"></i>Call Patient
                </Button>
                <Button variant="outline">
                  <i className="fas fa-envelope mr-2"></i>Send Message
                </Button>
                <Button variant="outline">
                  <i className="fas fa-download mr-2"></i>Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BP Trend Chart - Full Width */}
        <div className="mb-6">
          <IndividualBPChart
            patientName={`${patient.firstName} ${patient.lastName}`}
            readings={patient.readings || []}
            height="h-96"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Readings & Patient Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Readings Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Blood Pressure Readings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Systolic</TableHead>
                      <TableHead>Diastolic</TableHead>
                      <TableHead>HR</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patient.readings?.slice(0, 10).map((reading: any) => (
                      <TableRow key={reading.id}>
                        <TableCell>
                          {new Date(reading.recordedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(reading.recordedAt).toLocaleTimeString()}
                        </TableCell>
                        <TableCell className="font-mono text-lg font-semibold">{reading.systolic}</TableCell>
                        <TableCell className="font-mono text-lg font-semibold">{reading.diastolic}</TableCell>
                        <TableCell className="font-mono">{reading.heartRate || '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            getStatusColor(reading.category)
                          }`}>
                            {getStatusLabel(reading.category).split(' - ')[0]}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-500 max-w-xs truncate">
                          {reading.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Patient Information Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-gray-900">{patient.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{patient.email || 'Not provided'}</p>
                </div>

              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Medications</label>
                  {medications.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {medications.map((med: string, index: number) => (
                        <li key={index} className="text-gray-900 text-sm">• {med}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-900">None reported</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Allergies</label>
                  <p className="text-gray-900">{patient.allergies || 'None known'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Checkup</label>
                  <p className="text-gray-900">
                    {patient.lastCheckup 
                      ? new Date(patient.lastCheckup).toLocaleDateString()
                      : 'Not scheduled'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Communication Log */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Communications</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.communications && patient.communications.length > 0 ? (
                  <div className="space-y-3">
                    {patient.communications.slice(0, 5).map((comm: any) => (
                      <div key={comm.id} className="border-l-2 border-gray-200 pl-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{comm.type}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comm.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{comm.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recent communications</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}