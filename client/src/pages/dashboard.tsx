import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { StatsCards } from "@/components/stats-cards";
import { PriorityPatients } from "@/components/priority-patients";
import { BPChart } from "@/components/bp-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddReadingDialog } from "@/components/add-reading-dialog";

export default function Dashboard() {
  const [showAddReadingDialog, setShowAddReadingDialog] = useState(false);
  const [location, setLocation] = useLocation();
  const { data: recentActivity } = useQuery({
    queryKey: ['/api/readings/recent', { limit: 5 }],
  });

  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case 'patients':
        setLocation('/patients');
        break;
      case 'abnormal':
        setLocation('/patients?filter=abnormal');
        break;
      case 'calls':
        setLocation('/workflow?filter=pending');
        break;
      case 'weekly':
        setLocation('/bp-trends?period=week');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex-1 ml-64">
      <Header 
        title="Dashboard Overview" 
        subtitle="Fire Department Blood Pressure Management"
      >
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search patients..." 
            className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
        </div>
        <Button onClick={() => setShowAddReadingDialog(true)}>
          <i className="fas fa-plus mr-2"></i>
          Add Reading
        </Button>
        <div className="relative">
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <i className="fas fa-bell text-xl"></i>
            <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">2</span>
          </button>
        </div>
      </Header>

      <main className="p-8">
        <StatsCards onCardClick={handleCardClick} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <PriorityPatients />

          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-plus text-white"></i>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">New BP Reading</p>
                    <p className="text-sm text-gray-500">Add patient reading</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-chart-bar text-white"></i>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Generate Report</p>
                    <p className="text-sm text-gray-500">Weekly summary</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-download text-white"></i>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-gray-500">CSV/PDF export</p>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* BP Trends */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>BP Trends</CardTitle>
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="3m">Last 3 months</option>
                </select>
              </CardHeader>
              <CardContent>
                <BPChart />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.isAbnormal ? 'bg-destructive' : 'bg-green-600'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.isAbnormal ? 'Abnormal reading recorded' : 'Normal reading recorded'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.patient?.firstName} {activity.patient?.lastName} - {activity.systolic}/{activity.diastolic} mmHg
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.recordedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AddReadingDialog 
        open={showAddReadingDialog} 
        onOpenChange={setShowAddReadingDialog} 
      />
    </div>
  );
}
