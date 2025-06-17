import { useState } from "react";
import { MessageSquare, Phone, Mail, Calendar, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockCommunicationLogs, mockPatients, mockUsers } from "@/lib/mockData";

export default function Communications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterOutcome, setFilterOutcome] = useState<string>("all");

  const filteredLogs = mockCommunicationLogs.filter(log => {
    const patient = mockPatients.find(p => p.id === log.patientId);
    const user = mockUsers.find(u => u.id === log.userId);
    
    const searchMatch = searchTerm === "" || 
      patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatch = filterType === "all" || log.type === filterType;
    const outcomeMatch = filterOutcome === "all" || log.outcome === filterOutcome;
    
    return searchMatch && typeMatch && outcomeMatch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4 text-blue-600" />;
      case 'email':
        return <Mail className="h-4 w-4 text-green-600" />;
      case 'text':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'in_person':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'no_response':
        return 'text-red-600 bg-red-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      case 'neutral':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const commStats = {
    total: mockCommunicationLogs.length,
    calls: mockCommunicationLogs.filter(c => c.type === 'call').length,
    emails: mockCommunicationLogs.filter(c => c.type === 'email').length,
    followUps: mockCommunicationLogs.filter(c => c.followUpRequired).length,
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
        <p className="mt-2 text-gray-600">Track patient interactions and follow-ups</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-50">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Communications</p>
                <p className="text-xl font-bold text-gray-900">{commStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-50">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Phone Calls</p>
                <p className="text-xl font-bold text-gray-900">{commStats.calls}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-50">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Emails</p>
                <p className="text-xl font-bold text-gray-900">{commStats.emails}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-50">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Follow-ups Required</p>
                <p className="text-xl font-bold text-gray-900">{commStats.followUps}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search communications by patient name, staff, or message..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="call">Phone Calls</option>
            <option value="email">Emails</option>
            <option value="text">Text Messages</option>
            <option value="in_person">In Person</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Outcomes</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
            <option value="no_response">No Response</option>
          </select>
        </div>

        <Button className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          New Communication
        </Button>
      </div>

      {/* Communications List */}
      <div className="space-y-4">
        {filteredLogs
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((log) => {
            const patient = mockPatients.find(p => p.id === log.patientId);
            const user = mockUsers.find(u => u.id === log.userId);
            const outcomeColor = getOutcomeColor(log.outcome);

            return (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getTypeIcon(log.type)}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {patient?.firstName} {patient?.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {user?.name} • {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-gray-700">{log.message}</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Type:</span>
                          <span className="capitalize">{log.type.replace('_', ' ')}</span>
                        </div>
                        
                        {log.outcome && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Outcome:</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${outcomeColor}`}>
                              {log.outcome.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {log.followUpRequired && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800">
                              Follow-up Required
                            </span>
                          </div>
                          {log.followUpDate && (
                            <p className="text-sm text-orange-700 mt-1">
                              Due: {new Date(log.followUpDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                      
                      {log.followUpRequired && (
                        <Button size="sm" variant="outline">
                          Complete Follow-up
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No communications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== "all" || filterOutcome !== "all"
              ? 'Try adjusting your search terms or filters.'
              : 'Get started by logging a new patient communication.'}
          </p>
        </div>
      )}
    </div>
  );
}