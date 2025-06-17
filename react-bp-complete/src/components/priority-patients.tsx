import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function PriorityPatients() {
  const { data: patients, isLoading } = useQuery({
    queryKey: ['/api/patients/priority'],
  });

  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Patients Requiring Follow-up</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (category: string) => {
    switch (category) {
      case 'stage2':
        return 'Critical';
      case 'stage1':
        return 'High BP';
      case 'elevated':
        return 'Elevated';
      case 'low':
        return 'Low BP';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Patients Requiring Follow-up</h3>
          <div className="flex items-center space-x-2">
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary focus:border-transparent">
              <option>All Priorities</option>
              <option>High Priority</option>
              <option>Medium Priority</option>
            </select>
            <button className="text-primary hover:text-blue-700 p-1.5">
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {patients?.map((patient: any) => (
          <div key={patient.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {patient.firstName?.[0]}{patient.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h4>
                  <p className="text-sm text-gray-500">{patient.department}</p>
                  <p className="text-sm text-gray-500">
                    Last reading: {patient.latestReading?.systolic}/{patient.latestReading?.diastolic} mmHg
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatusColor(patient.latestReading?.category || '')
                  }`}>
                    {getStatusLabel(patient.latestReading?.category || '')}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {patient.latestReading && new Date(patient.latestReading.recordedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <i className="fas fa-phone mr-1"></i>
                    Call
                  </Button>
                  <Link href={`/patients/${patient.id}`}>
                    <Button size="sm" variant="ghost">
                      <i className="fas fa-chevron-right"></i>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <Link href="/patients">
          <button className="w-full text-primary hover:text-blue-700 text-sm font-medium py-2">
            View All Patients Requiring Follow-up
          </button>
        </Link>
      </div>
    </div>
  );
}
