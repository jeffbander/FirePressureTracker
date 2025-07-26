import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'fas fa-chart-pie' },
  { name: 'Patients', href: '/patients', icon: 'fas fa-users' },
  { name: 'BP Trends', href: '/bp-trends', icon: 'fas fa-chart-line' },
  { name: 'Workflow', href: '/workflow', icon: 'fas fa-tasks' },
  { name: 'Communications', href: '/communications', icon: 'fas fa-phone' },
  { name: 'Approvals', href: '/approvals', icon: 'fas fa-user-check' },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const SidebarContent = () => (
    <div className="h-full bg-white shadow-lg border-r border-gray-200">
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
        <div className="text-center">
          <p className="text-xs text-gray-500">Fire Department</p>
          <p className="text-xs text-gray-500">BP Management v1.0</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-heartbeat text-white text-sm"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Fire Dept BP</h2>
            </div>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="p-2">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed h-full z-10">
        <SidebarContent />
      </div>
    </>
  );
}
