import { useState } from "react";
import { TrendingUp, TrendingDown, Activity, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPatients, mockBpReadings } from "@/lib/mockData";

export default function BPTrends() {
  const [selectedPatient, setSelectedPatient] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("30");

  const filteredReadings = mockBpReadings.filter(reading => {
    const patientMatch = selectedPatient === "all" || reading.patientId.toString() === selectedPatient;
    const now = new Date();
    const daysAgo = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);
    const timeMatch = new Date(reading.recordedAt) >= daysAgo;
    return patientMatch && timeMatch;
  });

  const getCategoryDisplay = (category: string) => {
    switch (category) {
      case 'normal':
        return { text: 'Normal', color: 'text-green-600 bg-green-50', icon: '✓' };
      case 'elevated':
        return { text: 'Elevated', color: 'text-yellow-600 bg-yellow-50', icon: '⚠' };
      case 'stage_1_hypertension':
        return { text: 'Stage 1 HTN', color: 'text-orange-600 bg-orange-50', icon: '⚠' };
      case 'stage_2_hypertension':
        return { text: 'Stage 2 HTN', color: 'text-red-600 bg-red-50', icon: '⚠' };
      case 'hypertensive_crisis':
        return { text: 'Crisis', color: 'text-red-800 bg-red-100', icon: '🚨' };
      default:
        return { text: category, color: 'text-gray-600 bg-gray-50', icon: '-' };
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getPatientReadings = (patientId: number) => {
    return filteredReadings
      .filter(r => r.patientId === patientId)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  };

  const abnormalReadings = filteredReadings.filter(r => r.isAbnormal);
  const avgSystolic = filteredReadings.length > 0 
    ? Math.round(filteredReadings.reduce((sum, r) => sum + r.systolic, 0) / filteredReadings.length)
    : 0;
  const avgDiastolic = filteredReadings.length > 0
    ? Math.round(filteredReadings.reduce((sum, r) => sum + r.diastolic, 0) / filteredReadings.length)
    : 0;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">BP Trends Analysis</h1>
        <p className="mt-2 text-gray-600">Monitor blood pressure patterns and trends</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Patients</option>
            {mockPatients.map((patient) => (
              <option key={patient.id} value={patient.id.toString()}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-50">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Readings</p>
                <p className="text-xl font-bold text-gray-900">{filteredReadings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-red-50">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Abnormal</p>
                <p className="text-xl font-bold text-gray-900">{abnormalReadings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-50">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Systolic</p>
                <p className="text-xl font-bold text-gray-900">{avgSystolic}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-50">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Diastolic</p>
                <p className="text-xl font-bold text-gray-900">{avgDiastolic}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Trends */}
      <div className="space-y-6">
        {selectedPatient === "all" ? (
          mockPatients.map((patient) => {
            const patientReadings = getPatientReadings(patient.id);
            if (patientReadings.length === 0) return null;

            const latestReading = patientReadings[patientReadings.length - 1];
            const previousReading = patientReadings.length > 1 ? patientReadings[patientReadings.length - 2] : null;

            return (
              <Card key={patient.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{patient.firstName} {patient.lastName}</span>
                    <span className="text-sm font-normal text-gray-500">
                      {patientReadings.length} readings
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patientReadings.slice(-5).map((reading, index) => {
                      const category = getCategoryDisplay(reading.category);
                      const prevReading = index > 0 ? patientReadings[patientReadings.length - 5 + index - 1] : null;
                      
                      return (
                        <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {reading.systolic}/{reading.diastolic}
                              </span>
                              {prevReading && getTrendIcon(reading.systolic, prevReading.systolic)}
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                {new Date(reading.recordedAt).toLocaleDateString()}
                              </p>
                              {reading.pulse && (
                                <p className="text-xs text-gray-500">Pulse: {reading.pulse}</p>
                              )}
                            </div>
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
            );
          })
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {mockPatients.find(p => p.id.toString() === selectedPatient)?.firstName}{' '}
                {mockPatients.find(p => p.id.toString() === selectedPatient)?.lastName} - Detailed Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredReadings
                  .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                  .map((reading, index, array) => {
                    const category = getCategoryDisplay(reading.category);
                    const nextReading = array[index + 1];
                    
                    return (
                      <div key={reading.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {reading.systolic}/{reading.diastolic}
                            </span>
                            {nextReading && getTrendIcon(reading.systolic, nextReading.systolic)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">
                              {new Date(reading.recordedAt).toLocaleString()}
                            </p>
                            {reading.pulse && (
                              <p className="text-sm text-gray-600">Pulse: {reading.pulse} bpm</p>
                            )}
                            {reading.notes && (
                              <p className="text-sm text-gray-600 mt-1">{reading.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {reading.isAbnormal && (
                            <span className="text-red-500 text-sm font-medium">⚠ Abnormal</span>
                          )}
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${category.color}`}>
                            {category.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {filteredReadings.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No readings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or check back when more data is available.
          </p>
        </div>
      )}
    </div>
  );
}