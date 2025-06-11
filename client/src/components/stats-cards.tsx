import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface StatsCardsProps {
  onCardClick?: (cardType: string) => void;
}

export function StatsCards({ onCardClick }: StatsCardsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Patients",
      value: stats && typeof stats === 'object' && 'totalPatients' in stats ? stats.totalPatients : 0,
      change: "+12% from last month",
      icon: "fas fa-users",
      color: "blue",
      type: "patients",
    },
    {
      title: "Abnormal Readings",
      value: stats && typeof stats === 'object' && 'abnormalReadings' in stats ? stats.abnormalReadings : 0,
      change: "Requires follow-up",
      icon: "fas fa-heartbeat",
      color: "red",
      type: "abnormal",
    },
    {
      title: "Pending Calls",
      value: stats && typeof stats === 'object' && 'pendingCalls' in stats ? stats.pendingCalls : 0,
      change: "Need contact today",
      icon: "fas fa-phone",
      color: "orange",
      type: "calls",
    },
    {
      title: "This Week",
      value: stats && typeof stats === 'object' && 'todayReadings' in stats ? stats.todayReadings : 0,
      change: "New readings",
      icon: "fas fa-chart-line",
      color: "green",
      type: "weekly",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onCardClick?.(card.type)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className={`text-3xl font-bold mt-2 ${
                card.color === 'red' ? 'text-destructive' :
                card.color === 'orange' ? 'text-orange-600' :
                card.color === 'green' ? 'text-green-600' :
                'text-gray-900'
              }`}>
                {card.value}
              </p>
              <p className={`text-sm mt-2 ${
                card.color === 'red' ? 'text-destructive' :
                card.color === 'orange' ? 'text-orange-600' :
                'text-green-600'
              }`}>
                <i className={`${
                  card.color === 'red' ? 'fas fa-exclamation-triangle' :
                  'fas fa-arrow-up'
                } mr-1`}></i>
                <span>{card.change}</span>
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              card.color === 'red' ? 'bg-red-100' :
              card.color === 'orange' ? 'bg-orange-100' :
              card.color === 'green' ? 'bg-green-100' :
              'bg-blue-100'
            }`}>
              <i className={`${card.icon} text-xl ${
                card.color === 'red' ? 'text-destructive' :
                card.color === 'orange' ? 'text-orange-600' :
                card.color === 'green' ? 'text-green-600' :
                'text-primary'
              }`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
