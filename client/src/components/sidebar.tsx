import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'fas fa-chart-pie' },
  { name: 'Patients', href: '/patients', icon: 'fas fa-users' },
  { name: 'Workflow', href: '/workflow', icon: 'fas fa-tasks' },
  { name: 'Reports', href: '/reports', icon: 'fas fa-chart-bar' },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full z-10">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-heartbeat text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Fire Dept BP</h2>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-6 mb-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Main</p>
        </div>
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center px-6 py-3 text-sm font-medium transition-colors cursor-pointer",
                isActive
                  ? "text-primary bg-blue-50 border-r-3 border-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <i className={cn(item.icon, "w-5 h-5 mr-3")}></i>
                <span>{item.name}</span>
                {item.name === 'Workflow' && (
                  <span className="ml-auto bg-destructive text-white text-xs px-2 py-1 rounded-full">3</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 w-full p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button 
            onClick={logout}
            className="text-gray-400 hover:text-gray-600"
            title="Sign out"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
