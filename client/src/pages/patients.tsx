import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Patients() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');

  const { data: patients, isLoading } = useQuery({
    queryKey: ['/api/patients', { search, status: statusFilter, station: stationFilter }],
  });

  const getStatusColor = (category: string) => {
    switch (category) {
      case 'stage2':
        return 'bg-red-100 text-destructive';
      case 'stage1':
        return 'bg-orange-100 text-orange-600';
      case 'elevated':
        return 'bg-yellow-100 text-yellow-600';
      case 'low':
        return 'bg-blue-100 text-blue-600';
      case 'normal':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
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
        return 'No Data';
    }
  };

  return (
    <div className="flex-1 ml-64">
      <Header 
        title="Patient Management" 
        subtitle="View and manage patient records and readings"
      >
        <Button>
          <i className="fas fa-plus mr-2"></i>
          Add Patient
        </Button>
        <Button variant="outline">
          <i className="fas fa-download mr-2"></i>
          Export
        </Button>
      </Header>

      <main className="p-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
              <div className="flex-1 lg:mr-6">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <Input
                    type="text"
                    placeholder="Search patients by name, ID, or station..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="elevated">Elevated</SelectItem>
                    <SelectItem value="stage1">Stage 1 Hypertension</SelectItem>
                    <SelectItem value="stage2">Stage 2 Hypertension</SelectItem>
                    <SelectItem value="low">Low BP</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={stationFilter} onValueChange={setStationFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Stations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    <SelectItem value="Station 1">Station 1</SelectItem>
                    <SelectItem value="Station 3">Station 3</SelectItem>
                    <SelectItem value="Station 7">Station 7</SelectItem>
                    <SelectItem value="Station 15">Station 15</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Patient Records</CardTitle>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Showing {patients?.length || 0} patients
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Latest Reading</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients?.map((patient: any) => (
                    <TableRow key={patient.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-medium text-sm">
                              {patient.firstName?.[0]}{patient.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm text-gray-600">
                              ID: {patient.employeeId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.latestReading ? (
                          <div>
                            <div className="font-medium">
                              {patient.latestReading.systolic}/{patient.latestReading.diastolic}
                            </div>
                            <div className="text-xs text-gray-600">
                              {new Date(patient.latestReading.recordedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No readings</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getStatusColor(patient.latestReading?.category || '')
                        }`}>
                          {getStatusLabel(patient.latestReading?.category || '')}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {patient.station}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {patient.lastCheckup 
                          ? new Date(patient.lastCheckup).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            Call
                          </Button>
                          <Link href={`/patients/${patient.id}`}>
                            <Button size="sm" variant="ghost">
                              View
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
