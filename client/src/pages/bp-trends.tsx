import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { IndividualBPChart } from "@/components/individual-bp-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BPTrends() {
  const { data: patients, isLoading } = useQuery({
    queryKey: ['/api/patients'],
  });

  const getStatusColor = (category: string) => {
    switch (category) {
      case 'stage2':
        return 'destructive';
      case 'stage1':
        return 'secondary';
      case 'elevated':
        return 'outline';
      case 'low':
        return 'outline';
      case 'normal':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (category: string) => {
    switch (category) {
      case 'stage2':
        return 'Critical';
      case 'stage1':
        return 'Stage 1';
      case 'elevated':
        return 'Elevated';
      case 'low':
        return 'Low BP';
      case 'normal':
        return 'Normal';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 ml-64">
        <Header 
          title="Blood Pressure Trends" 
          subtitle="Individual BP trend analysis for all firefighters"
        />
        <main className="p-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 ml-64">
      <Header 
        title="Blood Pressure Trends" 
        subtitle="Individual BP trend analysis for all firefighters"
      />
      
      <main className="p-8">
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                This page shows individual blood pressure trend charts for each firefighter. 
                Each chart displays the last 10 readings with systolic and diastolic values over time.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="destructive">Critical (Stage 2)</Badge>
                <Badge variant="secondary">Stage 1 Hypertension</Badge>
                <Badge variant="outline">Elevated/Low BP</Badge>
                <Badge variant="default">Normal</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {patients?.map((patient: any) => (
            <div key={patient.id} className="space-y-4">
              {/* Patient Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium text-sm">
                          {patient.firstName?.[0]}{patient.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {patient.firstName} {patient.lastName}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {patient.department} • {patient.union} • ID: {patient.employeeId}
                        </p>
                      </div>
                    </div>
                    {patient.latestReading && (
                      <Badge variant={getStatusColor(patient.latestReading.category)}>
                        {getStatusLabel(patient.latestReading.category)}
                      </Badge>
                    )}
                  </div>
                  {patient.latestReading && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <span>
                        Latest: {patient.latestReading.systolic}/{patient.latestReading.diastolic} mmHg
                      </span>
                      <span>
                        {new Date(patient.latestReading.recordedAt).toLocaleDateString()}
                      </span>
                      {patient.latestReading.heartRate && (
                        <span>
                          HR: {patient.latestReading.heartRate} bpm
                        </span>
                      )}
                    </div>
                  )}
                </CardHeader>
              </Card>

              {/* Individual BP Chart */}
              <IndividualBPChart
                patientName={`${patient.firstName} ${patient.lastName}`}
                readings={patient.readings || []}
                height="h-80"
              />
            </div>
          ))}
        </div>

        {(!patients || patients.length === 0) && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">No patient data available</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}