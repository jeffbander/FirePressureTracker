import { useRef, useEffect } from "react";
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
  const chartRef = useRef<HTMLCanvasElement>(null);

  const { data: patient, isLoading } = useQuery({
    queryKey: [`/api/patients/${patientId}`],
  });

  useEffect(() => {
    if (!patient?.readings || !chartRef.current) return;

    import('chart.js/auto').then(({ default: Chart }) => {
      const ctx = chartRef.current?.getContext('2d');
      if (!ctx) return;

      const existingChart = Chart.getChart(ctx);
      if (existingChart) {
        existingChart.destroy();
      }

      const readings = patient.readings.slice(0, 10).reverse();

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: readings.map((r: any) => new Date(r.recordedAt).toLocaleDateString()),
          datasets: [
            {
              label: 'Systolic',
              data: readings.map((r: any) => r.systolic),
              borderColor: '#DC2626',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Diastolic',
              data: readings.map((r: any) => r.diastolic),
              borderColor: '#EA580C',
              backgroundColor: 'rgba(234, 88, 12, 0.1)',
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              min: 60,
              max: 200,
            },
          },
        },
      });
    });
  }, [patient]);

  if (isLoading) {
    return (
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex-1 ml-64">
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
        return 'Normal Blood Pressure';
      default:
        return 'No Recent Readings';
    }
  };

  const latestReading = patient.readings?.[0];
  const medications = patient.medications ? JSON.parse(patient.medications) : [];

  return (
    <div className="flex-1 ml-64">
      <Header 
        title="Patient Details" 
        subtitle="Detailed patient information and history"
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
                    <span className="text-sm text-gray-600">
                      {patient.dateOfBirth && (
                        <>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()} • </>
                      )}
                      Age: {patient.age} years
                    </span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BP Trend Chart & Recent Readings */}
          <div className="lg:col-span-2 space-y-6">
            {/* BP Trend Chart */}
            <IndividualBPChart
              patientName={`${patient.firstName} ${patient.lastName}`}
              readings={patient.readings || []}
              height="h-96"
            />

            {/* Recent Readings Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Readings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Systolic</TableHead>
                      <TableHead>Diastolic</TableHead>
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
                        <TableCell className="font-mono">{reading.systolic}</TableCell>
                        <TableCell className="font-mono">{reading.diastolic}</TableCell>
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

          {/* Patient Info Sidebar */}
          <div className="space-y-6">
            {/* Latest Reading */}
            {latestReading && (
              <Card className={`border-l-4 ${
                latestReading.category === 'stage2' ? 'border-l-red-500 bg-red-50' :
                latestReading.category === 'stage1' ? 'border-l-orange-500 bg-orange-50' :
                'border-l-blue-500 bg-blue-50'
              }`}>
                <CardHeader>
                  <CardTitle className="text-lg">Latest Reading</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      latestReading.category === 'stage2' ? 'text-destructive' :
                      latestReading.category === 'stage1' ? 'text-orange-600' :
                      'text-blue-600'
                    }`}>
                      {latestReading.systolic}/{latestReading.diastolic}
                    </div>
                    <p className="text-sm text-gray-600">mmHg</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(latestReading.recordedAt).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span>{patient.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-sm">{patient.email || 'Not provided'}</span>
                </div>

                <div className="mt-4 space-y-2">
                  <Button className="w-full">
                    <i className="fas fa-phone mr-2"></i>Call Patient
                  </Button>
                  <Button variant="outline" className="w-full">
                    <i className="fas fa-envelope mr-2"></i>Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-gray-600 block text-sm mb-1">Current Medications:</span>
                  {medications.length > 0 ? (
                    <ul className="space-y-1">
                      {medications.map((med: string, index: number) => (
                        <li key={index} className="text-sm">• {med}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-gray-500">None reported</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600 block text-sm">Allergies:</span>
                  <span className="text-sm">{patient.allergies || 'None known'}</span>
                </div>
                <div>
                  <span className="text-gray-600 block text-sm">Last Checkup:</span>
                  <span className="text-sm">
                    {patient.lastCheckup 
                      ? new Date(patient.lastCheckup).toLocaleDateString()
                      : 'No recent checkup'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Communication Log */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Communication Log</CardTitle>
                <Button size="sm" variant="outline">Add Note</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.communications?.length > 0 ? (
                  patient.communications.map((log: any) => (
                    <div key={log.id} className="border-l-2 border-primary pl-3">
                      <p className="text-sm">{log.message}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(log.createdAt).toLocaleString()} • {log.type}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No communication history</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
