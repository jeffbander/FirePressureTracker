import { useState, useEffect } from "react";
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
import { Users, Activity, Heart, Calendar, Building, UserCheck, TrendingUp, BarChart3, PieChart, Bell, CalendarDays, Clock, Phone } from "lucide-react";

export default function Patients() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [unionFilter, setUnionFilter] = useState('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState('all');
  const [employmentStatusFilter, setEmploymentStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, unionFilter, ageGroupFilter, employmentStatusFilter, genderFilter, activityFilter]);
  
  const { data: patientsData, isLoading } = useQuery({
    queryKey: ['/api/patients', currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/patients?page=${currentPage}&limit=20`);
      return response.json();
    },
  });

  // Extract patients array and pagination from response
  const patients = patientsData?.data || [];
  const pagination = patientsData?.pagination || {};

  // Filter patients based on all criteria
  const filteredPatients = patients.filter((patient: any) => {
    // Search filter - support both fullName (AppSheet) and firstName/lastName (legacy)
    const fullName = patient.fullName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
    if (search && !fullName.toLowerCase().includes(search.toLowerCase()) &&
        !patient.employeeId?.toLowerCase().includes(search.toLowerCase()) &&
        !patient.unionMemberId?.toLowerCase().includes(search.toLowerCase()) &&
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

    // Activity filter (based on last BP reading timeframe)
    if (activityFilter !== 'all') {
      const latestReading = patient.latestReading;
      const now = new Date();
      const readingDate = latestReading ? new Date(latestReading.recordedAt) : null;
      
      if (!readingDate) {
        if (activityFilter !== 'never-tested') return false;
      } else {
        const daysDiff = Math.floor((now.getTime() - readingDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (activityFilter) {
          case 'active-7':
            if (daysDiff > 7) return false;
            break;
          case 'active-30':
            if (daysDiff > 30) return false;
            break;
          case 'active-90':
            if (daysDiff > 90) return false;
            break;
          case 'inactive-90':
            if (daysDiff <= 90) return false;
            break;
          case 'inactive-180':
            if (daysDiff <= 180) return false;
            break;
          case 'never-tested':
            return false; // Has reading, so not never-tested
        }
      }
    }

    // Hypertension status filter
    if (statusFilter !== 'all') {
      const latestReading = patient.latestReading;
      if (!latestReading) {
        // No reading, so can't match any status filter
        return false;
      }
      
      // Map BP categories to filter values
      const categoryMapping: Record<string, string[]> = {
        'normal': ['normal'],
        'elevated': ['elevated'],
        'stage1': ['stage1_hypertension'],
        'stage2': ['stage2_hypertension'],
        'hypertensive_crisis': ['hypertensive_crisis'],
        'low': ['low']
      };
      
      const acceptableCategories = categoryMapping[statusFilter] || [];
      if (!acceptableCategories.includes(latestReading.category)) {
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

    const byActivity = filteredPatients.reduce((acc: any, patient: any) => {
      const latestReading = patient.latestReading;
      const now = new Date();
      const readingDate = latestReading ? new Date(latestReading.recordedAt) : null;
      
      let activityStatus = 'never-tested';
      if (readingDate) {
        const daysDiff = Math.floor((now.getTime() - readingDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 7) activityStatus = 'active-7';
        else if (daysDiff <= 30) activityStatus = 'active-30';
        else if (daysDiff <= 90) activityStatus = 'active-90';
        else if (daysDiff <= 180) activityStatus = 'inactive-90';
        else activityStatus = 'inactive-180';
      }
      
      acc[activityStatus] = (acc[activityStatus] || 0) + 1;
      return acc;
    }, {});

    return { byUnion, byHypertensionStatus, byAgeGroup, byEmploymentStatus, byGender, byActivity };
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

  // Advanced Analytics Functions
  const runTrendAnalysis = (groupPatients: any[]) => {
    const trends = {
      hypertensionTrend: calculateHypertensionTrend(groupPatients),
      agingRisk: calculateAgingRisk(groupPatients),
      complianceTrend: calculateComplianceTrend(groupPatients),
      riskProgression: calculateRiskProgression(groupPatients)
    };
    return trends;
  };

  const calculateHypertensionTrend = (patients: any[]) => {
    const hypertensiveCount = patients.filter(p => 
      p.latestReading?.category === 'stage1' || 
      p.latestReading?.category === 'stage2' || 
      p.latestReading?.category === 'hypertensive_crisis'
    ).length;
    
    const rate = patients.length > 0 ? (hypertensiveCount / patients.length) * 100 : 0;
    
    let severity = 'Low';
    if (rate > 40) severity = 'Critical';
    else if (rate > 25) severity = 'High';
    else if (rate > 15) severity = 'Moderate';
    
    return {
      rate: rate.toFixed(1),
      count: hypertensiveCount,
      total: patients.length,
      severity,
      benchmark: rate > 31.3 ? 'Above National Average' : 'Below National Average' // US average ~31.3%
    };
  };

  const calculateAgingRisk = (patients: any[]) => {
    const ageGroups = patients.reduce((acc: any, patient: any) => {
      const age = patient.age;
      if (age >= 50) acc.higherRisk++;
      else acc.lowerRisk++;
      return acc;
    }, { higherRisk: 0, lowerRisk: 0 });

    const higherRiskRate = patients.length > 0 ? 
      (ageGroups.higherRisk / patients.length) * 100 : 0;

    return {
      higherRiskCount: ageGroups.higherRisk,
      higherRiskRate: higherRiskRate.toFixed(1),
      recommendation: higherRiskRate > 60 ? 
        'Increase monitoring frequency for aging workforce' : 
        'Current age distribution manageable'
    };
  };

  const calculateComplianceTrend = (patients: any[]) => {
    const now = new Date();
    const compliance = patients.reduce((acc: any, patient: any) => {
      const lastReading = patient.latestReading;
      if (!lastReading) {
        acc.neverTested++;
        return acc;
      }

      const daysSince = Math.floor((now.getTime() - new Date(lastReading.recordedAt).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSince <= 90) acc.compliant++;
      else if (daysSince <= 180) acc.moderateRisk++;
      else acc.nonCompliant++;
      
      return acc;
    }, { compliant: 0, moderateRisk: 0, nonCompliant: 0, neverTested: 0 });

    const complianceRate = patients.length > 0 ? 
      (compliance.compliant / patients.length) * 100 : 0;

    return {
      ...compliance,
      complianceRate: complianceRate.toFixed(1),
      status: complianceRate > 80 ? 'Excellent' : 
              complianceRate > 60 ? 'Good' : 
              complianceRate > 40 ? 'Needs Improvement' : 'Critical'
    };
  };

  const calculateRiskProgression = (patients: any[]) => {
    const riskLevels = patients.reduce((acc: any, patient: any) => {
      const category = patient.latestReading?.category;
      const age = patient.age;
      
      let riskScore = 0;
      if (category === 'hypertensive_crisis') riskScore = 4;
      else if (category === 'stage2') riskScore = 3;
      else if (category === 'stage1') riskScore = 2;
      else if (category === 'elevated') riskScore = 1;
      
      if (age > 60) riskScore += 1;
      else if (age > 50) riskScore += 0.5;
      
      if (riskScore >= 4) acc.critical++;
      else if (riskScore >= 2.5) acc.high++;
      else if (riskScore >= 1) acc.moderate++;
      else acc.low++;
      
      return acc;
    }, { critical: 0, high: 0, moderate: 0, low: 0 });

    return riskLevels;
  };

  const runPatternAnalysis = (groupPatients: any[]) => {
    return {
      departmentPatterns: analyzeDepartmentPatterns(groupPatients),
      ageVsBP: analyzeAgeVsBPPatterns(groupPatients),
      retirementImpact: analyzeRetirementImpact(groupPatients),
      seasonalPatterns: analyzeSeasonalPatterns(groupPatients)
    };
  };

  const analyzeDepartmentPatterns = (patients: any[]) => {
    const deptData = patients.reduce((acc: any, patient: any) => {
      const dept = patient.department || 'Unknown';
      if (!acc[dept]) acc[dept] = { total: 0, hypertensive: 0 };
      acc[dept].total++;
      
      if (patient.latestReading?.category === 'stage1' || 
          patient.latestReading?.category === 'stage2' || 
          patient.latestReading?.category === 'hypertensive_crisis') {
        acc[dept].hypertensive++;
      }
      return acc;
    }, {});

    const highestRiskDept = Object.entries(deptData).reduce((max: any, [dept, data]: [string, any]) => {
      const rate = data.total > 0 ? (data.hypertensive / data.total) * 100 : 0;
      return rate > max.rate ? { dept, rate, ...data } : max;
    }, { dept: '', rate: 0, total: 0, hypertensive: 0 });

    return {
      departmentBreakdown: deptData,
      highestRiskDepartment: highestRiskDept,
      insight: highestRiskDept.rate > 40 ? 
        `${highestRiskDept.dept} shows elevated hypertension risk (${highestRiskDept.rate.toFixed(1)}%)` :
        'Hypertension risk relatively balanced across departments'
    };
  };

  const analyzeAgeVsBPPatterns = (patients: any[]) => {
    const correlation = patients.reduce((acc: any, patient: any) => {
      const age = patient.age;
      const reading = patient.latestReading;
      
      if (reading) {
        const ageGroup = age < 40 ? 'young' : age < 55 ? 'middle' : 'senior';
        if (!acc[ageGroup]) acc[ageGroup] = { total: 0, elevated: 0, avgSystolic: 0, avgDiastolic: 0 };
        
        acc[ageGroup].total++;
        acc[ageGroup].avgSystolic += reading.systolic;
        acc[ageGroup].avgDiastolic += reading.diastolic;
        
        if (reading.category !== 'normal' && reading.category !== 'low') {
          acc[ageGroup].elevated++;
        }
      }
      return acc;
    }, {});

    Object.keys(correlation).forEach(group => {
      const data = correlation[group];
      data.avgSystolic = Math.round(data.avgSystolic / data.total);
      data.avgDiastolic = Math.round(data.avgDiastolic / data.total);
      data.elevatedRate = ((data.elevated / data.total) * 100).toFixed(1);
    });

    return correlation;
  };

  const analyzeRetirementImpact = (patients: any[]) => {
    const active = patients.filter(p => !p.isRetired);
    const retired = patients.filter(p => p.isRetired);

    const activeHypertension = active.filter(p => 
      p.latestReading?.category === 'stage1' || 
      p.latestReading?.category === 'stage2' || 
      p.latestReading?.category === 'hypertensive_crisis'
    ).length;

    const retiredHypertension = retired.filter(p => 
      p.latestReading?.category === 'stage1' || 
      p.latestReading?.category === 'stage2' || 
      p.latestReading?.category === 'hypertensive_crisis'
    ).length;

    const activeRate = active.length > 0 ? (activeHypertension / active.length) * 100 : 0;
    const retiredRate = retired.length > 0 ? (retiredHypertension / retired.length) * 100 : 0;

    return {
      activeRate: activeRate.toFixed(1),
      retiredRate: retiredRate.toFixed(1),
      difference: Math.abs(activeRate - retiredRate).toFixed(1),
      insight: activeRate > retiredRate ? 
        'Active firefighters show higher hypertension rates' :
        'Retired firefighters show higher hypertension rates'
    };
  };

  const analyzeSeasonalPatterns = (patients: any[]) => {
    const readingsByMonth = patients.reduce((acc: any, patient: any) => {
      if (patient.latestReading) {
        const month = new Date(patient.latestReading.recordedAt).getMonth();
        if (!acc[month]) acc[month] = { total: 0, elevated: 0 };
        acc[month].total++;
        
        if (patient.latestReading.category !== 'normal' && patient.latestReading.category !== 'low') {
          acc[month].elevated++;
        }
      }
      return acc;
    }, {});

    return readingsByMonth;
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                <Select value={unionFilter} onValueChange={setUnionFilter}>
                  <SelectTrigger>
                    <Building className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Union" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Unions</SelectItem>
                    <SelectItem value="UFOA">UFOA</SelectItem>
                    <SelectItem value="ufa">ufa</SelectItem>
                    <SelectItem value="lba">lba</SelectItem>
                    <SelectItem value="sinai">sinai</SelectItem>
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

                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger>
                    <Activity className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activity</SelectItem>
                    <SelectItem value="active-7">Active (7 days)</SelectItem>
                    <SelectItem value="active-30">Active (30 days)</SelectItem>
                    <SelectItem value="active-90">Active (90 days)</SelectItem>
                    <SelectItem value="inactive-90">Inactive (90+ days)</SelectItem>
                    <SelectItem value="inactive-180">Inactive (180+ days)</SelectItem>
                    <SelectItem value="never-tested">Never Tested</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger>
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cards">Card View</SelectItem>
                    <SelectItem value="table">Table View</SelectItem>
                    <SelectItem value="summary">Summary View</SelectItem>
                    <SelectItem value="union-breakdown">Union Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {(search || statusFilter !== 'all' || unionFilter !== 'all' || ageGroupFilter !== 'all' || 
                employmentStatusFilter !== 'all' || genderFilter !== 'all' || activityFilter !== 'all') && (
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
                    setActivityFilter('all');
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="cards">Card View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="summary">Summary View</TabsTrigger>
            <TabsTrigger value="union-breakdown">Union Breakdown</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="call-center">Call Center</TabsTrigger>
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
                                {(() => {
                                  const fullName = patient.fullName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
                                  const nameParts = fullName.split(' ');
                                  return (nameParts[0]?.[0] || '') + (nameParts[1]?.[0] || '');
                                })()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {patient.fullName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim()}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Union {patient.union || 'N/A'} • ID: {patient.unionMemberId || patient.employeeId || 'N/A'} • Age: {patient.age || 'N/A'}
                                {patient.dateOfBirth && (
                                  <span> • DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                                )}
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
                        {patient.readingCount > 0 ? (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-2">
                              BP History ({patient.readingCount} reading{patient.readingCount !== 1 ? 's' : ''})
                            </div>
                            <div className="space-y-2">
                              {patient.latestReading && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Latest Reading:</span>
                                  <span className="font-mono font-semibold text-lg">
                                    {patient.latestReading.systolic}/{patient.latestReading.diastolic}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                            No blood pressure readings recorded
                          </div>
                        )}
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
              
              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} patients
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={!pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === pagination.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      {pagination.totalPages > 5 && (
                        <>
                          <span className="px-2">...</span>
                          <Button
                            variant={pagination.page === pagination.totalPages ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pagination.totalPages)}
                          >
                            {pagination.totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
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
                      <TableHead>Age / DOB</TableHead>
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
                          {patient.fullName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim()}
                        </TableCell>
                        <TableCell>{patient.unionMemberId || patient.employeeId || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{patient.age || 'N/A'} years</div>
                            {patient.dateOfBirth && (
                              <div className="text-gray-500 text-xs">
                                {new Date(patient.dateOfBirth).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{patient.unionId || patient.union || 'N/A'}</TableCell>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

              {/* BP Testing Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    By Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byActivity || {}).map(([activity, count]) => (
                      <div key={activity} className="flex items-center justify-between">
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => setActivityFilter(activity)}
                        >
                          {activity === 'active-7' ? 'Active (7 days)' :
                           activity === 'active-30' ? 'Active (30 days)' :
                           activity === 'active-90' ? 'Active (90 days)' :
                           activity === 'inactive-90' ? 'Inactive (90+ days)' :
                           activity === 'inactive-180' ? 'Inactive (180+ days)' :
                           activity === 'never-tested' ? 'Never Tested' : activity}
                        </span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="union-breakdown" className="mt-6">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Union-by-Union Breakdown</h2>
                <span className="text-sm text-gray-600">
                  Detailed analysis of {filteredPatients.length} patients across all unions
                </span>
              </div>
              
              {Object.entries(stats.byUnion || {}).map(([unionName, unionTotal]) => {
                // Get patients for this specific union
                const unionPatients = filteredPatients.filter(p => p.union === unionName);
                
                // Calculate detailed breakdowns for this union
                const unionBPStatus = unionPatients.reduce((acc: any, patient: any) => {
                  const status = patient.latestReading?.category || 'no-data';
                  acc[status] = (acc[status] || 0) + 1;
                  return acc;
                }, {});

                const unionAgeGroups = unionPatients.reduce((acc: any, patient: any) => {
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

                const unionEmployment = unionPatients.reduce((acc: any, patient: any) => {
                  const status = patient.isRetired ? 'retired' : 'active';
                  acc[status] = (acc[status] || 0) + 1;
                  return acc;
                }, {});

                const unionActivity = unionPatients.reduce((acc: any, patient: any) => {
                  const latestReading = patient.latestReading;
                  const now = new Date();
                  const readingDate = latestReading ? new Date(latestReading.recordedAt) : null;
                  
                  let activityStatus = 'never-tested';
                  if (readingDate) {
                    const daysDiff = Math.floor((now.getTime() - readingDate.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (daysDiff <= 7) activityStatus = 'active-7';
                    else if (daysDiff <= 30) activityStatus = 'active-30';
                    else if (daysDiff <= 90) activityStatus = 'active-90';
                    else if (daysDiff <= 180) activityStatus = 'inactive-90';
                    else activityStatus = 'inactive-180';
                  }
                  
                  acc[activityStatus] = (acc[activityStatus] || 0) + 1;
                  return acc;
                }, {});

                // Calculate communication statistics for this union
                const unionCommunications = unionPatients.reduce((acc: any, patient: any) => {
                  // Mock communication data based on patient risk level and reading status
                  const hasReading = !!patient.latestReading;
                  const isHighRisk = patient.latestReading?.category === 'stage2' || 
                                   patient.latestReading?.category === 'hypertensive_crisis';
                  const isElevated = patient.latestReading?.category === 'stage1' || 
                                   patient.latestReading?.category === 'elevated';
                  
                  // Simulate contact attempts based on risk level
                  let contactAttempts = 0;
                  let lastContactDays = null;
                  let contactType = 'none';
                  
                  if (isHighRisk) {
                    contactAttempts = Math.floor(Math.random() * 5) + 2; // 2-6 attempts for high risk
                    lastContactDays = Math.floor(Math.random() * 30); // Within last 30 days
                    contactType = Math.random() > 0.3 ? 'phone' : 'email'; // Prefer phone for high risk
                  } else if (isElevated) {
                    contactAttempts = Math.floor(Math.random() * 3) + 1; // 1-3 attempts for elevated
                    lastContactDays = Math.floor(Math.random() * 60); // Within last 60 days
                    contactType = Math.random() > 0.5 ? 'phone' : 'email';
                  } else if (hasReading) {
                    contactAttempts = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0; // Occasional contact for normal
                    lastContactDays = contactAttempts > 0 ? Math.floor(Math.random() * 90) : null;
                    contactType = Math.random() > 0.6 ? 'email' : 'phone';
                  }
                  
                  if (contactAttempts > 0) {
                    acc.contacted++;
                    acc.totalContacts += contactAttempts;
                    
                    if (contactType === 'phone') acc.phoneContacts++;
                    else acc.emailContacts++;
                    
                    if (lastContactDays !== null) {
                      if (lastContactDays <= 7) acc.recentContacts++;
                      else if (lastContactDays <= 30) acc.moderateContacts++;
                      else acc.oldContacts++;
                    }
                  } else {
                    acc.neverContacted++;
                  }
                  
                  return acc;
                }, { 
                  contacted: 0, 
                  neverContacted: 0, 
                  totalContacts: 0, 
                  phoneContacts: 0, 
                  emailContacts: 0,
                  recentContacts: 0,
                  moderateContacts: 0,
                  oldContacts: 0
                });

                return (
                  <Card key={unionName} className="p-6">
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-blue-600 cursor-pointer hover:text-blue-800"
                            onClick={() => setUnionFilter(unionName)}>
                          {unionName}
                        </h3>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            {unionTotal as number} Total Members
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => setUnionFilter(unionName)}>
                            View Only {unionName}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                      {/* BP Status Breakdown */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            BP Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {Object.entries(unionBPStatus).map(([status, count]) => (
                            <div key={status} 
                                 className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded"
                                 onClick={() => {
                                   setUnionFilter(unionName);
                                   setStatusFilter(status);
                                 }}>
                              <span className="text-sm">{getStatusLabel(status)}</span>
                              <Badge className={getStatusColor(status)} variant="outline">
                                {count as number}
                              </Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Age Group Breakdown */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Age Groups
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {Object.entries(unionAgeGroups).map(([ageGroup, count]) => (
                            <div key={ageGroup} 
                                 className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded"
                                 onClick={() => {
                                   setUnionFilter(unionName);
                                   setAgeGroupFilter(ageGroup);
                                 }}>
                              <span className="text-sm">{getAgeGroupLabel(ageGroup)}</span>
                              <Badge variant="outline">{count as number}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Employment Status */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            Employment
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {Object.entries(unionEmployment).map(([status, count]) => (
                            <div key={status} 
                                 className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded"
                                 onClick={() => {
                                   setUnionFilter(unionName);
                                   setEmploymentStatusFilter(status);
                                 }}>
                              <span className="text-sm capitalize">{status}</span>
                              <Badge variant="outline">{count as number}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* BP Testing Activity */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Testing Activity
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {Object.entries(unionActivity).map(([activity, count]) => (
                            <div key={activity} 
                                 className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded"
                                 onClick={() => {
                                   setUnionFilter(unionName);
                                   setActivityFilter(activity);
                                 }}>
                              <span className="text-xs">
                                {activity === 'active-7' ? 'Active (7d)' :
                                 activity === 'active-30' ? 'Active (30d)' :
                                 activity === 'active-90' ? 'Active (90d)' :
                                 activity === 'inactive-90' ? 'Inactive (90d+)' :
                                 activity === 'inactive-180' ? 'Inactive (180d+)' :
                                 activity === 'never-tested' ? 'Never Tested' : activity}
                              </span>
                              <Badge variant="outline">{count as number}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Communication Tracking */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Communications
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Contacted</span>
                            <Badge variant="outline" className="bg-green-50">
                              {unionCommunications.contacted}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Never Contacted</span>
                            <Badge variant="outline" className="bg-red-50">
                              {unionCommunications.neverContacted}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Total Contacts</span>
                            <Badge variant="outline">
                              {unionCommunications.totalContacts}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Phone Calls</span>
                            <Badge variant="outline" className="bg-blue-50">
                              {unionCommunications.phoneContacts}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Recent (7d)</span>
                            <Badge variant="outline" className="bg-green-50">
                              {unionCommunications.recentContacts}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Analytics Section */}
                    <div className="mt-6 space-y-4">
                      {/* Quick Stats Row */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-red-600">
                              {(unionBPStatus.stage2 || 0) + (unionBPStatus.hypertensive_crisis || 0)}
                            </div>
                            <div className="text-xs text-gray-600">High Risk BP</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {(unionActivity['active-30'] || 0) + (unionActivity['active-7'] || 0)}
                            </div>
                            <div className="text-xs text-gray-600">Active (30d)</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">
                              {unionEmployment.retired || 0}
                            </div>
                            <div className="text-xs text-gray-600">Retired</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600">
                              {unionActivity['never-tested'] || 0}
                            </div>
                            <div className="text-xs text-gray-600">Never Tested</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {unionCommunications.contacted}
                            </div>
                            <div className="text-xs text-gray-600">Contacted</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-600">
                              {unionCommunications.neverContacted}
                            </div>
                            <div className="text-xs text-gray-600">No Contact</div>
                          </div>
                        </div>
                      </div>

                      {/* Analytics Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const trends = runTrendAnalysis(unionPatients);
                            alert(`${unionName} Trend Analysis:\n\nHypertension Rate: ${trends.hypertensionTrend.rate}% (${trends.hypertensionTrend.severity})\nBenchmark: ${trends.hypertensionTrend.benchmark}\n\nAging Risk: ${trends.agingRisk.higherRiskRate}% over 50\nRecommendation: ${trends.agingRisk.recommendation}\n\nCompliance: ${trends.complianceTrend.complianceRate}% (${trends.complianceTrend.status})\nNon-compliant: ${trends.complianceTrend.nonCompliant} members\n\nRisk Distribution:\n- Critical: ${trends.riskProgression.critical}\n- High: ${trends.riskProgression.high}\n- Moderate: ${trends.riskProgression.moderate}\n- Low: ${trends.riskProgression.low}`);
                          }}
                        >
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Trend Analysis
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const patterns = runPatternAnalysis(unionPatients);
                            const deptInsight = patterns.departmentPatterns.insight;
                            const retirementInsight = patterns.retirementImpact.insight;
                            
                            let ageInsight = 'Age vs BP Analysis:\n';
                            Object.entries(patterns.ageVsBP).forEach(([group, data]: [string, any]) => {
                              ageInsight += `${group.charAt(0).toUpperCase() + group.slice(1)}: ${data.avgSystolic}/${data.avgDiastolic} avg, ${data.elevatedRate}% elevated\n`;
                            });

                            alert(`${unionName} Pattern Analysis:\n\n${deptInsight}\n\n${retirementInsight}\nActive HTN Rate: ${patterns.retirementImpact.activeRate}%\nRetired HTN Rate: ${patterns.retirementImpact.retiredRate}%\n\n${ageInsight}`);
                          }}
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Pattern Analysis
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const riskAnalysis = unionPatients.reduce((acc: any, patient: any) => {
                              const age = patient.age;
                              const category = patient.latestReading?.category;
                              const lastReading = patient.latestReading;
                              
                              // Risk factors
                              let riskFactors = [];
                              if (age > 55) riskFactors.push('Age 55+');
                              if (category === 'stage2' || category === 'hypertensive_crisis') riskFactors.push('Severe HTN');
                              if (category === 'stage1') riskFactors.push('Stage 1 HTN');
                              
                              const daysSince = lastReading ? 
                                Math.floor((new Date().getTime() - new Date(lastReading.recordedAt).getTime()) / (1000 * 60 * 60 * 24)) : 999;
                              if (daysSince > 180) riskFactors.push('No Recent Testing');
                              
                              if (riskFactors.length >= 2) acc.highRisk++;
                              else if (riskFactors.length === 1) acc.mediumRisk++;
                              else acc.lowRisk++;
                              
                              return acc;
                            }, { highRisk: 0, mediumRisk: 0, lowRisk: 0 });

                            const totalRisk = riskAnalysis.highRisk + riskAnalysis.mediumRisk + riskAnalysis.lowRisk;
                            const highRiskPercent = totalRisk > 0 ? ((riskAnalysis.highRisk / totalRisk) * 100).toFixed(1) : 0;

                            alert(`${unionName} Risk Assessment:\n\nHigh Risk: ${riskAnalysis.highRisk} members (${highRiskPercent}%)\nMedium Risk: ${riskAnalysis.mediumRisk} members\nLow Risk: ${riskAnalysis.lowRisk} members\n\nRecommendation: ${Number(highRiskPercent) > 25 ? 'Immediate intervention needed for high-risk members' : 'Continue current monitoring protocols'}`);
                          }}
                        >
                          <PieChart className="h-4 w-4 mr-1" />
                          Risk Assessment
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const benchmark = {
                              nationalHypertension: 31.3, // US average
                              optimalCompliance: 85,      // Target compliance rate
                              maxAcceptableRisk: 20       // Max acceptable high-risk percentage
                            };

                            const currentHypertension = unionPatients.filter(p => 
                              p.latestReading?.category === 'stage1' || 
                              p.latestReading?.category === 'stage2' || 
                              p.latestReading?.category === 'hypertensive_crisis'
                            ).length;
                            
                            const hypertensionRate = unionPatients.length > 0 ? 
                              (currentHypertension / unionPatients.length) * 100 : 0;

                            const compliance = calculateComplianceTrend(unionPatients);

                            let recommendations = [];
                            if (hypertensionRate > benchmark.nationalHypertension) {
                              recommendations.push('• Implement targeted BP reduction programs');
                            }
                            if (Number(compliance.complianceRate) < benchmark.optimalCompliance) {
                              recommendations.push('• Increase monitoring frequency and outreach');
                            }
                            if (compliance.neverTested > 0) {
                              recommendations.push('• Priority screening for never-tested members');
                            }

                            alert(`${unionName} Performance Benchmarking:\n\nHypertension Rate: ${hypertensionRate.toFixed(1)}%\nNational Average: ${benchmark.nationalHypertension}%\nStatus: ${hypertensionRate > benchmark.nationalHypertension ? 'Above Average ⚠️' : 'Below Average ✓'}\n\nCompliance Rate: ${compliance.complianceRate}%\nTarget: ${benchmark.optimalCompliance}%\nStatus: ${Number(compliance.complianceRate) >= benchmark.optimalCompliance ? 'Meeting Target ✓' : 'Below Target ⚠️'}\n\nRecommendations:\n${recommendations.length > 0 ? recommendations.join('\n') : '• Continue current excellent performance'}`);
                          }}
                        >
                          <Activity className="h-4 w-4 mr-1" />
                          Benchmarking
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const contactRate = unionPatients.length > 0 ? 
                              (unionCommunications.contacted / unionPatients.length) * 100 : 0;
                            
                            const avgContactsPerPerson = unionCommunications.contacted > 0 ? 
                              (unionCommunications.totalContacts / unionCommunications.contacted).toFixed(1) : 0;

                            const recentContactRate = unionPatients.length > 0 ? 
                              (unionCommunications.recentContacts / unionPatients.length) * 100 : 0;

                            const phoneVsEmailRatio = unionCommunications.emailContacts > 0 ? 
                              (unionCommunications.phoneContacts / unionCommunications.emailContacts).toFixed(1) : 'N/A';

                            const highRiskContactRate = (() => {
                              const highRiskCount = unionPatients.filter(p => 
                                p.latestReading?.category === 'stage2' || 
                                p.latestReading?.category === 'hypertensive_crisis'
                              ).length;
                              
                              // Assume high-risk patients have higher contact rates
                              const highRiskContacted = Math.min(highRiskCount, unionCommunications.phoneContacts);
                              return highRiskCount > 0 ? 
                                ((highRiskContacted / highRiskCount) * 100).toFixed(1) : 0;
                            })();

                            let outreachInsights = [];
                            if (contactRate < 70) {
                              outreachInsights.push('• Increase overall outreach efforts');
                            }
                            if (unionCommunications.neverContacted > 0) {
                              outreachInsights.push(`• ${unionCommunications.neverContacted} members never contacted - priority outreach needed`);
                            }
                            if (recentContactRate < 30) {
                              outreachInsights.push('• Recent contact rate low - schedule follow-ups');
                            }
                            if (unionCommunications.phoneContacts < unionCommunications.emailContacts) {
                              outreachInsights.push('• Consider more phone outreach for personal engagement');
                            }

                            alert(`${unionName} Communication Analysis:\n\nContact Coverage: ${contactRate.toFixed(1)}% (${unionCommunications.contacted}/${unionPatients.length})\nNever Contacted: ${unionCommunications.neverContacted} members\n\nContact Frequency:\nTotal Contacts: ${unionCommunications.totalContacts}\nAvg per Person: ${avgContactsPerPerson} contacts\n\nContact Methods:\nPhone Calls: ${unionCommunications.phoneContacts}\nEmails: ${unionCommunications.emailContacts}\nPhone/Email Ratio: ${phoneVsEmailRatio}:1\n\nRecency:\nRecent (7d): ${unionCommunications.recentContacts} (${recentContactRate.toFixed(1)}%)\nModerate (30d): ${unionCommunications.moderateContacts}\nOlder: ${unionCommunications.oldContacts}\n\nHigh-Risk Contact Rate: ${highRiskContactRate}%\n\nInsights:\n${outreachInsights.length > 0 ? outreachInsights.join('\n') : '• Excellent communication coverage maintained'}`);
                          }}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Communication Analysis
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="communications" className="mt-6">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1200px] space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Communication Management</h2>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button size="sm">
                      <Activity className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Communication Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredPatients.filter(p => {
                        // Calculate mock contacted status
                        const isHighRisk = p.latestReading?.category === 'stage2' || 
                                         p.latestReading?.category === 'hypertensive_crisis';
                        const isElevated = p.latestReading?.category === 'stage1' || 
                                         p.latestReading?.category === 'elevated';
                        return isHighRisk || isElevated || (p.latestReading && Math.random() > 0.7);
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600">Total Contacted</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">
                      {filteredPatients.filter(p => {
                        const isHighRisk = p.latestReading?.category === 'stage2' || 
                                         p.latestReading?.category === 'hypertensive_crisis';
                        return isHighRisk && Math.random() > 0.2; // Most high risk get phone calls
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600">Phone Calls Made</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold text-orange-600">
                      {filteredPatients.filter(p => {
                        const hasReading = !!p.latestReading;
                        const isElevated = p.latestReading?.category === 'stage1' || 
                                         p.latestReading?.category === 'elevated';
                        return hasReading && (isElevated || Math.random() > 0.6);
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600">Recent Follow-ups</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
                    <div className="text-2xl font-bold text-red-600">
                      {filteredPatients.filter(p => {
                        const isHighRisk = p.latestReading?.category === 'stage2' || 
                                         p.latestReading?.category === 'hypertensive_crisis';
                        const hasNoReading = !p.latestReading;
                        const isInactive = p.latestReading && 
                          Math.floor((new Date().getTime() - new Date(p.latestReading.recordedAt).getTime()) / (1000 * 60 * 60 * 24)) > 180;
                        return !isHighRisk && (hasNoReading || isInactive);
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600">Need Contact</div>
                  </CardContent>
                </Card>
              </div>

              {/* Communication Log Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Patient Communication Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Union</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Last Contact</TableHead>
                        <TableHead>Contact Type</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead>Next Follow-up</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient: any) => {
                        // Mock communication data based on patient profile
                        const isHighRisk = patient.latestReading?.category === 'stage2' || 
                                         patient.latestReading?.category === 'hypertensive_crisis';
                        const isElevated = patient.latestReading?.category === 'stage1' || 
                                         patient.latestReading?.category === 'elevated';
                        
                        let riskLevel = 'Low';
                        let riskColor = 'text-green-600';
                        if (isHighRisk) {
                          riskLevel = 'High';
                          riskColor = 'text-red-600';
                        } else if (isElevated) {
                          riskLevel = 'Medium';
                          riskColor = 'text-orange-600';
                        }

                        // Mock last contact data
                        const hasContact = isHighRisk || isElevated || (patient.latestReading && Math.random() > 0.6);
                        const lastContactDays = hasContact ? Math.floor(Math.random() * 60) : null;
                        const contactType = hasContact ? (isHighRisk ? 'Phone' : (Math.random() > 0.5 ? 'Phone' : 'Email')) : 'None';
                        const outcome = hasContact ? 
                          ['done', 'left vm', 'in progress', 'needs call'][Math.floor(Math.random() * 4)] : 
                          'needs call';
                        
                        const needsFollowup = isHighRisk || (isElevated && Math.random() > 0.3) || (!hasContact);
                        const followupDays = needsFollowup ? Math.floor(Math.random() * 30) + 1 : null;

                        return (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div>{patient.firstName} {patient.lastName}</div>
                                <div className="text-sm text-gray-500">ID: {patient.employeeId}</div>
                              </div>
                            </TableCell>
                            <TableCell>{patient.union}</TableCell>
                            <TableCell>
                              <Badge className={`${riskColor} bg-opacity-10`} variant="outline">
                                {riskLevel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {lastContactDays !== null ? (
                                <div>
                                  <div>{lastContactDays} days ago</div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(Date.now() - lastContactDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500">Never</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={contactType === 'Phone' ? 'default' : contactType === 'Email' ? 'secondary' : 'outline'}>
                                {contactType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                outcome === 'done' ? 'default' :
                                outcome === 'in progress' ? 'secondary' :
                                outcome === 'needs call' ? 'destructive' : 'outline'
                              }>
                                {outcome}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {followupDays ? (
                                <div>
                                  <div className="font-medium">
                                    {followupDays <= 7 ? 'Urgent' : followupDays <= 14 ? 'Soon' : 'Scheduled'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    In {followupDays} days
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500">None needed</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    const followupDate = prompt(`Schedule follow-up for ${patient.firstName} ${patient.lastName}:\n\nEnter follow-up date (YYYY-MM-DD):`);
                                    if (followupDate) {
                                      const reason = prompt('Follow-up reason:', 'BP check-in');
                                      if (reason) {
                                        alert(`Follow-up scheduled:\n\nPatient: ${patient.firstName} ${patient.lastName}\nDate: ${followupDate}\nReason: ${reason}\n\nThis patient will appear in your call list on the scheduled date.`);
                                      }
                                    }
                                  }}
                                >
                                  <Calendar className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    const outcome = prompt(`Record call for ${patient.firstName} ${patient.lastName}:\n\nSelect outcome:\n1. Done\n2. Left VM\n3. In Progress\n4. Needs Call\n\nEnter number (1-4):`);
                                    const outcomes = ['', 'done', 'left vm', 'in progress', 'needs call'];
                                    const selectedOutcome = outcomes[parseInt(outcome || '0')];
                                    
                                    if (selectedOutcome) {
                                      let followupNeeded = false;
                                      if (selectedOutcome === 'done') {
                                        const needsFollowup = confirm('Was a follow-up call scheduled during this conversation?');
                                        if (needsFollowup) {
                                          const followupDate = prompt('Enter follow-up date (YYYY-MM-DD):');
                                          if (followupDate) {
                                            followupNeeded = true;
                                            alert(`Call recorded as "${selectedOutcome}"\nFollow-up scheduled for: ${followupDate}\n\nPatient will reappear in your call list on ${followupDate}.`);
                                          }
                                        } else {
                                          alert(`Call recorded as "${selectedOutcome}"\nNo follow-up needed.`);
                                        }
                                      } else {
                                        alert(`Call recorded as "${selectedOutcome}"`);
                                      }
                                    }
                                  }}
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Follow-up Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Follow-up Schedule & Call List
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Quick Add Follow-up */}
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Schedule New Follow-up</h4>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <select className="px-3 py-2 border rounded-lg text-sm">
                          <option>Select Patient...</option>
                          {filteredPatients.map(patient => (
                            <option key={patient.id} value={patient.id}>
                              {patient.firstName} {patient.lastName} ({patient.employeeId})
                            </option>
                          ))}
                        </select>
                        <input 
                          type="date" 
                          className="px-3 py-2 border rounded-lg text-sm"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <select className="px-3 py-2 border rounded-lg text-sm">
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                          <option value="high">High Priority</option>
                          <option value="urgent">Urgent</option>
                        </select>
                        <Button size="sm" className="bg-blue-600 text-white">
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>

                    {/* Follow-up Lists - Horizontal Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Today's Follow-ups */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Bell className="h-4 w-4 text-red-500" />
                          Due Today ({(() => {
                            const today = new Date();
                            return filteredPatients.filter(p => {
                              const isHighRisk = p.latestReading?.category === 'stage2' || 
                                               p.latestReading?.category === 'hypertensive_crisis';
                              const needsCall = !p.latestReading || isHighRisk;
                              return needsCall && Math.random() > 0.7; 
                            }).length;
                          })()})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredPatients
                          .filter(p => {
                            const isHighRisk = p.latestReading?.category === 'stage2' || 
                                           p.latestReading?.category === 'hypertensive_crisis';
                            return (isHighRisk || !p.latestReading) && Math.random() > 0.7;
                          })
                          .slice(0, 5)
                          .map(patient => (
                            <div key={patient.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <div>
                                  <div className="font-medium text-red-900">
                                    {patient.firstName} {patient.lastName}
                                  </div>
                                  <div className="text-sm text-red-600">
                                    {patient.employeeId} • {patient.union} • 
                                    {patient.latestReading?.category === 'stage2' || 
                                     patient.latestReading?.category === 'hypertensive_crisis' ? 
                                     ' High BP Follow-up' : ' Initial Contact'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                                  <Phone className="h-4 w-4 mr-1" />
                                  Call Now
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                      {/* This Week's Follow-ups */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          This Week ({(() => {
                            return filteredPatients.filter(p => {
                              const isElevated = p.latestReading?.category === 'stage1' || 
                                               p.latestReading?.category === 'elevated';
                              return isElevated && Math.random() > 0.5;
                            }).length;
                          })()})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredPatients
                          .filter(p => {
                            const isElevated = p.latestReading?.category === 'stage1' || 
                                             p.latestReading?.category === 'elevated';
                            return isElevated && Math.random() > 0.5;
                          })
                          .slice(0, 6)
                          .map(patient => {
                            const daysFromNow = Math.floor(Math.random() * 6) + 1;
                            const followupDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
                            return (
                              <div key={patient.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <div>
                                  <div className="font-medium text-orange-900">
                                    {patient.firstName} {patient.lastName}
                                  </div>
                                  <div className="text-sm text-orange-600">
                                    {followupDate.toLocaleDateString()} • BP Follow-up
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" className="text-orange-600 border-orange-200">
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Upcoming Follow-ups */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                        Next 30 Days ({(() => {
                          return filteredPatients.filter(p => {
                            return p.latestReading && Math.random() > 0.6;
                          }).length;
                        })()})
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {filteredPatients
                          .filter(p => p.latestReading && Math.random() > 0.6)
                          .slice(0, 8)
                          .map(patient => {
                            const daysFromNow = Math.floor(Math.random() * 30) + 7;
                            const followupDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
                            const reasons = [
                              'Medication check-in',
                              'Lifestyle coaching',
                              'BP trend review',
                              'Progress assessment',
                              'Wellness check'
                            ];
                            const reason = reasons[Math.floor(Math.random() * reasons.length)];
                            
                            return (
                              <div key={patient.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border">
                                <div className="flex items-center gap-3">
                                  <div className="text-sm text-gray-500 min-w-[80px]">
                                    {followupDate.toLocaleDateString()}
                                  </div>
                                  <div>
                                    <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                                    <div className="text-sm text-gray-600">{reason}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {daysFromNow <= 14 ? 'Soon' : 'Scheduled'}
                                  </Badge>
                                  <Button size="sm" variant="ghost">
                                    <Calendar className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Communication Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Contact Effectiveness by Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Phone Calls</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '78%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">78% Success</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Email</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '45%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">45% Success</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Text Messages</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{width: '62%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">62% Success</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Follow-up Effectiveness
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-green-700 font-medium">Completed on Time</span>
                        <Badge className="bg-green-600 text-white">85%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                        <span className="text-yellow-700 font-medium">Overdue (1-7 days)</span>
                        <Badge className="bg-yellow-600 text-white">12%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-red-700 font-medium">Significantly Overdue</span>
                        <Badge className="bg-red-600 text-white">3%</Badge>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="text-sm text-gray-600 text-center">
                          Average Response Time: <span className="font-medium">2.3 days</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="call-center" className="mt-6">
            <div className="space-y-6">
              {/* Call Center Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Call Center Dashboard</h2>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Start Calling Session
                  </Button>
                  <Button size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Follow-up
                  </Button>
                </div>
              </div>

              {/* Priority Call Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Urgent Calls */}
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-800 flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Urgent - Call Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredPatients
                        .filter(p => {
                          const isHighRisk = p.latestReading?.category === 'stage2' || 
                                           p.latestReading?.category === 'hypertensive_crisis';
                          return isHighRisk;
                        })
                        .slice(0, 4)
                        .map(patient => (
                          <div key={patient.id} className="p-3 bg-white rounded border border-red-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-red-900">
                                  {patient.firstName} {patient.lastName}
                                </div>
                                <div className="text-sm text-red-600">
                                  {patient.employeeId} • {patient.union}
                                </div>
                                <div className="text-xs text-red-500 mt-1">
                                  High BP: {patient.latestReading?.systolic || 'N/A'}/{patient.latestReading?.diastolic || 'N/A'}
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => {
                                  const outcome = prompt(`Calling ${patient.firstName} ${patient.lastName}\n\nCall outcome:\n1. Answered - Completed\n2. Left Voicemail\n3. No Answer\n4. Busy\n\nEnter number (1-4):`);
                                  const outcomes = ['', 'done', 'left vm', 'needs call', 'needs call'];
                                  const selectedOutcome = outcomes[parseInt(outcome || '0')];
                                  
                                  if (selectedOutcome === 'done') {
                                    const followup = confirm('Schedule follow-up call?');
                                    if (followup) {
                                      const date = prompt('Follow-up date (YYYY-MM-DD):');
                                      const reason = prompt('Reason for follow-up:', 'BP check-in');
                                      if (date && reason) {
                                        alert(`Call completed and follow-up scheduled:\n\nPatient: ${patient.firstName} ${patient.lastName}\nFollow-up: ${date}\nReason: ${reason}\n\nPatient will appear in call list on ${date}`);
                                      }
                                    } else {
                                      alert(`Call completed for ${patient.firstName} ${patient.lastName}`);
                                    }
                                  } else if (selectedOutcome) {
                                    alert(`Call logged as: ${selectedOutcome}\nPatient remains in call queue.`);
                                  }
                                }}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* This Week */}
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-orange-800 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredPatients
                        .filter(p => {
                          const isElevated = p.latestReading?.category === 'stage1' || 
                                           p.latestReading?.category === 'elevated';
                          return isElevated;
                        })
                        .slice(0, 4)
                        .map(patient => (
                          <div key={patient.id} className="p-3 bg-white rounded border border-orange-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-orange-900">
                                  {patient.firstName} {patient.lastName}
                                </div>
                                <div className="text-sm text-orange-600">
                                  {patient.employeeId} • {patient.union}
                                </div>
                                <div className="text-xs text-orange-500 mt-1">
                                  Elevated BP: {patient.latestReading?.systolic || 'N/A'}/{patient.latestReading?.diastolic || 'N/A'}
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-orange-300 text-orange-700"
                                onClick={() => {
                                  const date = prompt(`Schedule call for ${patient.firstName} ${patient.lastName}\n\nEnter date (YYYY-MM-DD):`);
                                  if (date) {
                                    alert(`Call scheduled for ${patient.firstName} ${patient.lastName} on ${date}`);
                                  }
                                }}
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Never Contacted */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Never Contacted
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredPatients
                        .filter(p => !p.latestReading)
                        .slice(0, 4)
                        .map(patient => (
                          <div key={patient.id} className="p-3 bg-white rounded border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-blue-900">
                                  {patient.firstName} {patient.lastName}
                                </div>
                                <div className="text-sm text-blue-600">
                                  {patient.employeeId} • {patient.union}
                                </div>
                                <div className="text-xs text-blue-500 mt-1">
                                  No BP readings on file
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-blue-300 text-blue-700"
                                onClick={() => {
                                  const outcome = prompt(`Initial contact with ${patient.firstName} ${patient.lastName}\n\nOutcome:\n1. Completed - Scheduled BP test\n2. Left message\n3. No answer\n4. Refused\n\nEnter number (1-4):`);
                                  const outcomes = ['', 'done', 'left vm', 'needs call', 'needs call'];
                                  const selectedOutcome = outcomes[parseInt(outcome || '0')];
                                  
                                  if (selectedOutcome) {
                                    alert(`Initial contact logged: ${selectedOutcome}`);
                                  }
                                }}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Call Log & Follow-up Scheduler */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Call Log */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Today's Call Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                        <div>
                          <div className="font-medium">John Smith</div>
                          <div className="text-sm text-gray-600">9:15 AM - Completed call</div>
                        </div>
                        <Badge className="bg-green-600 text-white">Done</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded border">
                        <div>
                          <div className="font-medium">Maria Garcia</div>
                          <div className="text-sm text-gray-600">10:30 AM - Left voicemail</div>
                        </div>
                        <Badge variant="outline">Left VM</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded border">
                        <div>
                          <div className="font-medium">Robert Johnson</div>
                          <div className="text-sm text-gray-600">11:45 AM - No answer</div>
                        </div>
                        <Badge variant="destructive">Needs Call</Badge>
                      </div>
                      <div className="text-center pt-3">
                        <Button size="sm" variant="outline">
                          View Full Call History
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Follow-up Scheduler */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Schedule Follow-up
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Patient</label>
                        <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                          <option>Select patient...</option>
                          {filteredPatients.map(patient => (
                            <option key={patient.id} value={patient.id}>
                              {patient.firstName} {patient.lastName} ({patient.employeeId})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Follow-up Date</label>
                        <input 
                          type="date" 
                          className="w-full mt-1 px-3 py-2 border rounded-lg"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Reason</label>
                        <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                          <option>BP check-in</option>
                          <option>Medication review</option>
                          <option>Lifestyle coaching</option>
                          <option>Test results follow-up</option>
                          <option>Emergency follow-up</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Priority</label>
                        <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <Button className="w-full">
                        Schedule Follow-up Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Call Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Call Performance Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">12</div>
                      <div className="text-sm text-gray-600">Completed Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">8</div>
                      <div className="text-sm text-gray-600">Voicemails Left</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">5</div>
                      <div className="text-sm text-gray-600">No Answers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">15</div>
                      <div className="text-sm text-gray-600">Follow-ups Scheduled</div>
                    </div>
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
