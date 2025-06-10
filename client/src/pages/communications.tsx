import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Phone, Mail, FileText, Calendar as CalendarIcon, User, Search, Filter, BarChart3, TrendingUp, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function Communications() {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    outcome: 'all',
    userId: 'all',
    patientId: 'all',
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d');

  // Build query string for API call
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.type !== 'all') params.append('type', filters.type);
    if (filters.outcome !== 'all') params.append('outcome', filters.outcome);
    if (filters.userId !== 'all') params.append('userId', filters.userId);
    if (filters.patientId !== 'all') params.append('patientId', filters.patientId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
    params.append('sortBy', filters.sortBy);
    params.append('sortOrder', filters.sortOrder);
    
    return params.toString();
  }, [filters]);

  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['/api/communications', queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/communications?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/communications/analytics', analyticsPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/communications/analytics?period=${analyticsPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: async () => {
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      case 'unresolved': return 'bg-yellow-100 text-yellow-800';
      case 'no_answer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      outcome: 'all',
      userId: 'all',
      patientId: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Header 
          title="Communication Logs" 
          subtitle="Loading communication records..."
        />
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Header 
        title="Communication Logs" 
        subtitle="Interactive analysis of all patient communications and call records"
      />

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">Communication Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Dashboard */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Communication Analytics</h2>
            <Select value={analyticsPeriod} onValueChange={setAnalyticsPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {analytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Communications</CardTitle>
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalCommunications}</div>
                    <p className="text-xs text-muted-foreground">All communication records</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{analytics.responseRate}%</div>
                    <p className="text-xs text-muted-foreground">Calls successfully answered</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Phone Calls</CardTitle>
                    <Phone className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{analytics.byType.call || 0}</div>
                    <p className="text-xs text-muted-foreground">Total phone calls made</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved Cases</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{analytics.byOutcome.resolved || 0}</div>
                    <p className="text-xs text-muted-foreground">Successfully resolved</p>
                  </CardContent>
                </Card>
              </div>

              {/* Communication Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Communication Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(analytics.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(type)}
                          <span className="capitalize">{type}</span>
                        </div>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Outcome Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(analytics.byOutcome).map(([outcome, count]) => (
                      <div key={outcome} className="flex items-center justify-between">
                        <span className="capitalize">{outcome.replace('_', ' ')}</span>
                        <Badge className={getOutcomeColor(outcome)}>{count as number}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Top Staff */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Staff</CardTitle>
                  <CardDescription>Staff members with most patient communications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.topStaff)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([name, count]) => (
                        <div key={name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{name}</span>
                          </div>
                          <Badge variant="outline">{count as number} communications</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages, notes, patients..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Communication Type</label>
                  <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="call">Phone Calls</SelectItem>
                      <SelectItem value="email">Emails</SelectItem>
                      <SelectItem value="note">Notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Outcome</label>
                  <Select value={filters.outcome} onValueChange={(value) => setFilters(prev => ({ ...prev, outcome: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Outcomes</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="unresolved">Unresolved</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="no_answer">No Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select 
                    value={`${filters.sortBy}-${filters.sortOrder}`} 
                    onValueChange={(value) => {
                      const [sortBy, sortOrder] = value.split('-');
                      setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt-desc">Newest First</SelectItem>
                      <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                      <SelectItem value="patientName-asc">Patient A-Z</SelectItem>
                      <SelectItem value="patientName-desc">Patient Z-A</SelectItem>
                      <SelectItem value="type-asc">Type A-Z</SelectItem>
                      <SelectItem value="outcome-asc">Outcome A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Patient</label>
                  <Select value={filters.patientId} onValueChange={(value) => setFilters(prev => ({ ...prev, patientId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Patients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Patients</SelectItem>
                      {patients.map((patient: any) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.firstName} {patient.lastName} ({patient.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date From</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date To</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? format(filters.dateTo, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Showing {communications.length} communication{communications.length !== 1 ? 's' : ''}
                </div>
                <Button variant="outline" onClick={resetFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Communications List */}
          <div className="space-y-4">
            {communications.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No communication logs found matching your filters.</p>
                </CardContent>
              </Card>
            ) : (
              communications.map((comm: any) => (
                <Card key={comm.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(comm.type)}
                          <h3 className="font-semibold">
                            {comm.patient.firstName} {comm.patient.lastName}
                          </h3>
                          <Badge variant="outline">{comm.patient.employeeId}</Badge>
                          <Badge variant="outline">{comm.patient.department}</Badge>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{comm.message}</p>
                        
                        {comm.notes && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-600 mb-1">Notes:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{comm.notes}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {comm.user?.name || 'Unknown'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(comm.createdAt).toLocaleString()}
                          </div>
                          {comm.followUpDate && (
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              Follow-up: {new Date(comm.followUpDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Badge className="bg-blue-100 text-blue-800">
                          {comm.type.toUpperCase()}
                        </Badge>
                        {comm.outcome && (
                          <Badge className={getOutcomeColor(comm.outcome)}>
                            {comm.outcome.replace('_', ' ').toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}