import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { mockPatients, mockBpReadings } from "../lib/mockData"
import { categorizeBP, getBPColorClass } from "../lib/bp-utils"
import { Search, Plus, Eye } from "lucide-react"

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredPatients = mockPatients.filter(patient => 
    patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getLatestReading = (patientId: number) => {
    const readings = mockBpReadings
      .filter(reading => reading.patientId === patientId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    return readings[0]
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-blue-900">Patient Management</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Firefighter Patients</CardTitle>
          <CardDescription>Manage patient records and blood pressure monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, ID, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Latest BP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => {
                const latestReading = getLatestReading(patient.id)
                const category = latestReading ? categorizeBP(latestReading.systolic, latestReading.diastolic) : null
                
                return (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.employeeId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{patient.department}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>
                      {latestReading ? (
                        <div>
                          <p className="font-medium">{latestReading.systolic}/{latestReading.diastolic}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(latestReading.recordedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No readings</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {category ? (
                        <Badge className={`${getBPColorClass(category)} text-white`}>
                          {category.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">No Data</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}