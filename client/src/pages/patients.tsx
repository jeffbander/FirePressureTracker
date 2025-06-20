import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddPatientDialog } from "@/components/add-patient-dialog";
import { IndividualBPChart } from "@/components/individual-bp-chart";
import { Users, Activity, Heart, Calendar, Building, UserCheck } from "lucide-react";

export default function Patients() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [unionFilter, setUnionFilter] = useState('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState('all');
  const [employmentStatusFilter, setEmploymentStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: patientsResponse, isLoading } = useQuery({
    queryKey: ['/api/patients', { search, status: statusFilter, union: unionFilter }],
  });

  // Extract patients array from response
  const patients = Array.isArray(patientsResponse) ? patientsResponse : [];

  // Filter patients based on all criteria
  const filteredPatients = patients.filter((patient: any) => {
    // Search filter
    if (search && !patient.firstName?.toLowerCase().includes(search.toLowerCase()) && 
        !patient.lastName?.toLowerCase().includes(search.toLowerCase()) &&
        !patient.employeeId?.toLowerCase().includes(search.toLowerCase()) &&
        !patient.department?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Union filter
    if (unionFilter !== 'all' && patient.union !== unionFilter) {
      return false;
    }

    // Age group filter
    if (ageGroupFilter !== 'all') {
      const age = patient.age;
      switch (ageGroupFilter) {
        case 'under-30':
          if (age >= 30) return false;
          break;
        case '30-39':
          if (age < 30 || age >= 40) return false;
          break;
        case '40-49':
          if (age < 40 || age >= 50) return false;
          break;
        case '50-59':
          if (age < 50 || age >= 60) return false;
          break;
        case '60-plus':
          if (age < 60) return false;
          break;
      }
    }

    // Employment status filter
    if (employmentStatusFilter !== 'all') {
      const isRetired = patient.isRetired || false;
      if (employmentStatusFilter === 'active' && isRetired) return false;
      if (employmentStatusFilter === 'retired' && !isRetired) return false;
    }

    // Gender filter
    if (genderFilter !== 'all' && patient.gender !== genderFilter) {
      return false;
    }

    // Hypertension status filter
    if (statusFilter !== 'all') {
      const latestReading = patient.latestReading;
      if (!latestReading || latestReading.category !== statusFilter) {
        return false;
      }
    }

    return true;
  });

  // Group patients by different criteria for summary stats
  const getPatientStats = () => {
    if (!filteredPatients) return {};
    
    const byUnion = filteredPatients.reduce((acc: any, patient: any) => {
      acc[patient.union] = (acc[patient.union] || 0) + 1;
      return acc;
    }, {});

    const byHypertensionStatus = filteredPatients.reduce((acc: any, patient: any) => {
      const status = patient.latestReading?.category || 'no-data';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const byAgeGroup = filteredPatients.reduce((acc: any, patient: any) => {
      const age = patient.age;
      let group = 'unknown';
      if (age < 30) group = 'under-30';
      else if (age < 40) group = '30-39';
      else if (age < 50) group = '40-49';
      else if (age < 60) group = '50-59';
      else group = '60-plus';
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});

    const byEmploymentStatus = filteredPatients.reduce((acc: any, patient: any) => {
      const status = patient.isRetired ? 'retired' : 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const byGender = filteredPatients.reduce((acc: any, patient: any) => {
      const gender = patient.gender || 'unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    return { byUnion, byHypertensionStatus, byAgeGroup, byEmploymentStatus, byGender };
  };

  const stats = getPatientStats();

  const getStatusColor = (category: string) => {
    switch (category) {
      case 'hypertensive_crisis':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'stage2':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'stage1':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'elevated':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'normal':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (category: string) => {
    switch (category) {
      case 'hypertensive_crisis':
        return 'Crisis';
      case 'stage2':
        return 'Stage 2';
      case 'stage1':
        return 'Stage 1';
      case 'elevated':
        return 'Elevated';
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Low BP';
      default:
        return 'No Data';
    }
  };

  const getAgeGroupLabel = (ageGroup: string) => {
    switch (ageGroup) {
      case 'under-30': return 'Under 30';
      case '30-39': return '30-39 years';
      case '40-49': return '40-49 years';
      case '50-59': return '50-59 years';
      case '60-plus': return '60+ years';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex-1 ml-64">
      <Header 
        title="Patient Management" 
        subtitle="View and manage patient records with advanced filtering"
      >
        <Button onClick={() => setShowAddDialog(true)}>
          <Users className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
        <Button variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Export
        </Button>
      </Header>

      <main className="p-8">
        {/* Advanced Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search patients by name, ID, department, or station..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Select value={unionFilter} onValueChange={setUnionFilter}>
                  <SelectTrigger>
                    <Building className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Union" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Unions</SelectItem>
                    <SelectItem value="Union 1">Union 1</SelectItem>
                    <SelectItem value="Union 3">Union 3</SelectItem>
                    <SelectItem value="Union 7">Union 7</SelectItem>
                    <SelectItem value="Union 15">Union 15</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Heart className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="BP Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All BP Status</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="elevated">Elevated</SelectItem>
                    <SelectItem value="stage1">Stage 1 HTN</SelectItem>
                    <SelectItem value="stage2">Stage 2 HTN</SelectItem>
                    <SelectItem value="hypertensive_crisis">Crisis</SelectItem>
                    <SelectItem value="low">Low BP</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Age Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="under-30">Under 30</SelectItem>
                    <SelectItem value="30-39">30-39 years</SelectItem>
                    <SelectItem value="40-49">40-49 years</SelectItem>
                    <SelectItem value="50-59">50-59 years</SelectItem>
                    <SelectItem value="60-plus">60+ years</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={employmentStatusFilter} onValueChange={setEmploymentStatusFilter}>
                  <SelectTrigger>
                    <UserCheck className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger>
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger>
                    <Activity className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cards">Card View</SelectItem>
                    <SelectItem value="table">Table View</SelectItem>
                    <SelectItem value="summary">Summary View</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {(search || statusFilter !== 'all' || unionFilter !== 'all' || ageGroupFilter !== 'all' || 
                employmentStatusFilter !== 'all' || genderFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setUnionFilter('all');
                    setAgeGroupFilter('all');
                    setEmploymentStatusFilter('all');
                    setGenderFilter('all');
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patient Statistics Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setUnionFilter('all')}>
            <CardContent className="p-4 text-center">
              <Building className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{filteredPatients.length}</div>
              <div className="text-sm text-gray-600">Total Patients</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('stage2')}>
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{stats.byHypertensionStatus?.stage2 || 0}</div>
              <div className="text-sm text-gray-600">Stage 2 HTN</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('stage1')}>
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">{stats.byHypertensionStatus?.stage1 || 0}</div>
              <div className="text-sm text-gray-600">Stage 1 HTN</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setEmploymentStatusFilter('retired')}>
            <CardContent className="p-4 text-center">
              <UserCheck className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{stats.byEmploymentStatus?.retired || 0}</div>
              <div className="text-sm text-gray-600">Retired</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('normal')}>
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats.byHypertensionStatus?.normal || 0}</div>
              <div className="text-sm text-gray-600">Normal BP</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Views */}
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cards">Card View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="summary">Summary View</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Patient Records</h2>
                <span className="text-sm text-gray-600">
                  Showing {filteredPatients.length} of {patients.length} patients
                </span>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-64 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredPatients.map((patient: any) => (
                    <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-bold text-lg">
                                {patient.firstName?.[0]}{patient.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {patient.firstName} {patient.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {patient.union} • ID: {patient.employeeId} • Age: {patient.age}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {patient.department}
                                </Badge>
                                {patient.isRetired && (
                                  <Badge variant="secondary" className="text-xs">
                                    Retired
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {patient.latestReading && (
                              <Badge className={getStatusColor(patient.latestReading.category)}>
                                {getStatusLabel(patient.latestReading.category)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <IndividualBPChart
                          patientName={`${patient.firstName} ${patient.lastName}`}
                          readings={patient.readings || []}
                          height="h-48"
                        />
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            {patient.latestReading ? (
                              <span>
                                Latest: <span className="font-mono font-semibold">
                                  {patient.latestReading.systolic}/{patient.latestReading.diastolic}
                                </span> on {new Date(patient.latestReading.recordedAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span>No recent readings</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link href={`/patients/${patient.id}`}>
                              <Button size="sm" variant="outline">
                                <Users className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline">
                              <Activity className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Union</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Latest BP</TableHead>
                      <TableHead>BP Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient: any) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </TableCell>
                        <TableCell>{patient.employeeId}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.union}</TableCell>
                        <TableCell>{patient.department}</TableCell>
                        <TableCell>
                          {patient.isRetired ? (
                            <Badge variant="secondary">Retired</Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {patient.latestReading ? (
                            <span className="font-mono">
                              {patient.latestReading.systolic}/{patient.latestReading.diastolic}
                            </span>
                          ) : (
                            <span className="text-gray-500">No data</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {patient.latestReading && (
                            <Badge className={getStatusColor(patient.latestReading.category)}>
                              {getStatusLabel(patient.latestReading.category)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link href={`/patients/${patient.id}`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Union Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    By Union
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byUnion || {}).map(([union, count]) => (
                      <div key={union} className="flex items-center justify-between">
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => setUnionFilter(union)}
                        >
                          {union}
                        </span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Age Group Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    By Age Group
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byAgeGroup || {}).map(([ageGroup, count]) => (
                      <div key={ageGroup} className="flex items-center justify-between">
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => setAgeGroupFilter(ageGroup)}
                        >
                          {getAgeGroupLabel(ageGroup)}
                        </span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Hypertension Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    By BP Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byHypertensionStatus || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => setStatusFilter(status)}
                        >
                          {getStatusLabel(status)}
                        </span>
                        <Badge className={getStatusColor(status)}>{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <AddPatientDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog} 
        />
      </main>
    </div>
  );
}
