import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Users, Calendar, Building2, AlertTriangle } from "lucide-react";

type GroupingType = 'union' | 'department' | 'age_group' | 'status' | 'intervention_type';
type TimeRange = '30d' | '90d' | '6m' | '1y';

export default function BPTrends() {
  const [groupBy, setGroupBy] = useState<GroupingType>('union');
  const [timeRange, setTimeRange] = useState<TimeRange>('90d');
  
  const { data: patients, isLoading } = useQuery({
    queryKey: ['/api/patients'],
  });

  const { data: readings, isLoading: readingsLoading } = useQuery({
    queryKey: ['/api/readings/recent', 1000],
  });

  if (isLoading || readingsLoading) {
    return (
      <div className="flex-1 ml-64">
        <Header 
          title="BP Trends & Intervention Analytics" 
          subtitle="Loading intervention analytics..." 
        />
        <div className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions for data processing
  const processDataByGroup = () => {
    if (!readings || !patients || !Array.isArray(readings) || !Array.isArray(patients)) return {};
    
    const grouped: Record<string, any[]> = {};
    
    readings.forEach((reading: any) => {
      const patient = patients.find((p: any) => p.id === reading.patientId);
      if (!patient) return;
      
      let groupKey = '';
      switch (groupBy) {
        case 'union':
          groupKey = patient.union || 'Unknown Union';
          break;
        case 'department':
          groupKey = patient.department || 'Unknown Department';
          break;
        case 'age_group':
          const age = patient.age || 0;
          if (age < 30) groupKey = 'Under 30';
          else if (age < 40) groupKey = '30-39';
          else if (age < 50) groupKey = '40-49';
          else groupKey = '50+';
          break;
        case 'status':
          groupKey = patient.status || 'Unknown Status';
          break;
        case 'intervention_type':
          // Determine intervention type based on BP category
          if (reading.category === 'stage2') groupKey = 'High-Risk Intervention';
          else if (reading.category === 'stage1') groupKey = 'Medium-Risk Intervention';
          else if (reading.category === 'elevated') groupKey = 'Lifestyle Intervention';
          else groupKey = 'Monitoring Only';
          break;
      }
      
      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push({ ...reading, patient });
    });
    
    return grouped;
  };

  const calculateGroupStats = (groupData: any[]) => {
    if (!groupData.length) return null;
    
    const avgSystolic = groupData.reduce((sum, r) => sum + r.systolic, 0) / groupData.length;
    const avgDiastolic = groupData.reduce((sum, r) => sum + r.diastolic, 0) / groupData.length;
    const abnormalCount = groupData.filter(r => r.isAbnormal).length;
    const totalReadings = groupData.length;
    const uniquePatients = new Set(groupData.map(r => r.patientId)).size;
    
    return {
      avgSystolic: Math.round(avgSystolic),
      avgDiastolic: Math.round(avgDiastolic),
      abnormalRate: Math.round((abnormalCount / totalReadings) * 100),
      totalReadings,
      uniquePatients,
      trend: calculateTrend(groupData)
    };
  };

  const calculateTrend = (data: any[]) => {
    if (data.length < 2) return 0;
    
    // Sort by date and calculate trend
    const sortedData = data.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, r) => sum + r.systolic, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.systolic, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
  };

  const groupedData = processDataByGroup();
  const groupNames = Object.keys(groupedData);

  const prepareTrendChartData = () => {
    const timePoints: Record<string, Record<string, number[]>> = {};
    
    // Group readings by date and group
    Object.entries(groupedData).forEach(([groupName, readings]) => {
      readings.forEach((reading: any) => {
        const date = new Date(reading.recordedAt).toISOString().split('T')[0];
        if (!timePoints[date]) timePoints[date] = {};
        if (!timePoints[date][groupName]) timePoints[date][groupName] = [];
        timePoints[date][groupName].push(reading.systolic);
      });
    });

    // Calculate averages for each time point
    return Object.entries(timePoints)
      .map(([date, groups]) => {
        const dataPoint: any = { date };
        Object.entries(groups).forEach(([groupName, values]) => {
          dataPoint[groupName] = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
        });
        return dataPoint;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 data points
  };

  const trendChartData = prepareTrendChartData();
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  return (
    <div className="flex-1 ml-64">
      <Header 
        title="BP Trends & Intervention Analytics" 
        subtitle="Compare blood pressure trends across patient groups to evaluate intervention effectiveness" 
      />
      <div className="p-6 space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analytics Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Group By</label>
                <Select value={groupBy} onValueChange={(value: GroupingType) => setGroupBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="union">Union</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="age_group">Age Group</SelectItem>
                    <SelectItem value="status">Patient Status</SelectItem>
                    <SelectItem value="intervention_type">Intervention Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Time Range</label>
                <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trends">Trend Comparison</TabsTrigger>
            <TabsTrigger value="stats">Group Statistics</TabsTrigger>
            <TabsTrigger value="effectiveness">Intervention Effectiveness</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>BP Trends by {groupBy.replace('_', ' ').toUpperCase()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[100, 180]} />
                      <Tooltip />
                      <Legend />
                      {groupNames.map((groupName, index) => (
                        <Line
                          key={groupName}
                          type="monotone"
                          dataKey={groupName}
                          stroke={colors[index % colors.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedData).map(([groupName, data]) => {
                const stats = calculateGroupStats(data);
                if (!stats) return null;

                return (
                  <Card key={groupName}>
                    <CardHeader>
                      <CardTitle className="text-lg">{groupName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="text-sm text-gray-600">
                          {stats.uniquePatients} patients • {stats.totalReadings} readings
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {stats.avgSystolic}
                          </div>
                          <div className="text-sm text-gray-600">Avg Systolic</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {stats.avgDiastolic}
                          </div>
                          <div className="text-sm text-gray-600">Avg Diastolic</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Abnormal Rate:</span>
                        <Badge variant={stats.abnormalRate > 50 ? "destructive" : stats.abnormalRate > 25 ? "secondary" : "default"}>
                          {stats.abnormalRate}%
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Trend:</span>
                        <div className="flex items-center gap-1">
                          {stats.trend > 0 ? (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          )}
                          <span className={`text-sm font-medium ${stats.trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {Math.abs(Math.round(stats.trend))} mmHg
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="effectiveness" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Intervention Effectiveness Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(groupedData).map(([groupName, data]) => {
                    const stats = calculateGroupStats(data);
                    if (!stats) return null;

                    const effectivenessScore = Math.max(0, 100 - stats.abnormalRate - Math.abs(stats.trend));
                    const effectivenessLevel = effectivenessScore > 80 ? 'Excellent' : 
                                            effectivenessScore > 60 ? 'Good' : 
                                            effectivenessScore > 40 ? 'Fair' : 'Needs Improvement';

                    return (
                      <div key={groupName} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{groupName}</h3>
                          <Badge variant={effectivenessScore > 60 ? "default" : "destructive"}>
                            {effectivenessLevel}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Effectiveness Score</div>
                            <div className="font-medium">{Math.round(effectivenessScore)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-600">BP Control</div>
                            <div className={`font-medium ${stats.abnormalRate < 25 ? 'text-green-600' : 'text-red-600'}`}>
                              {100 - stats.abnormalRate}%
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Trend Direction</div>
                            <div className={`font-medium ${stats.trend <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stats.trend <= 0 ? 'Improving' : 'Worsening'}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Patients</div>
                            <div className="font-medium">{stats.uniquePatients}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}