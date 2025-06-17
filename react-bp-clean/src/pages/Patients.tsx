import { useState } from "react";
import { Search, Plus, Eye, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockPatients } from "@/lib/mockData";

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = mockPatients.filter(patient =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <p className="mt-2 text-gray-600">Manage firefighter patient records</p>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search patients by name, ID, or department..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {patient.firstName} {patient.lastName}
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Employee ID:</span>
                  <p className="font-medium">{patient.employeeId}</p>
                </div>
                <div>
                  <span className="text-gray-500">Age:</span>
                  <p className="font-medium">{patient.age || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <span className="text-gray-500 text-sm">Department:</span>
                <p className="font-medium">{patient.department}</p>
              </div>
              
              {patient.union && (
                <div>
                  <span className="text-gray-500 text-sm">Union:</span>
                  <p className="font-medium">{patient.union}</p>
                </div>
              )}
              
              <div>
                <span className="text-gray-500 text-sm">Contact:</span>
                <p className="font-medium">{patient.phone || 'No phone'}</p>
                <p className="text-sm text-gray-600">{patient.email || 'No email'}</p>
              </div>
              
              {patient.medicalNotes && (
                <div>
                  <span className="text-gray-500 text-sm">Medical Notes:</span>
                  <p className="text-sm text-gray-700 line-clamp-2">{patient.medicalNotes}</p>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <span className="text-xs text-gray-500">
                  Added: {new Date(patient.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new patient.'}
          </p>
        </div>
      )}
    </div>
  );
}