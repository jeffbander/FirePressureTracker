import { Switch, Route } from "wouter";
import { useState } from "react";
import { Menu, X, Activity, Users, Clipboard, TrendingUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import PatientDetail from "@/pages/PatientDetail";
import Workflow from "@/pages/Workflow";
import BPTrends from "@/pages/BPTrends";
import Communications from "@/pages/Communications";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Activity },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Workflow', href: '/workflow', icon: Clipboard },
  { name: 'BP Trends', href: '/bp-trends', icon: TrendingUp },
  { name: 'Communications', href: '/communications', icon: MessageSquare },
];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Fire Dept BP</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={onClose}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="flex items-center justify-between h-16 px-4 bg-white shadow-sm lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-blue-600" />
            <span className="ml-2 text-lg font-bold text-gray-900">Fire Dept BP</span>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
        
        {/* Main content */}
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/patients" component={Patients} />
            <Route path="/patients/:id" component={PatientDetail} />
            <Route path="/workflow" component={Workflow} />
            <Route path="/bp-trends" component={BPTrends} />
            <Route path="/communications" component={Communications} />
            <Route>
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h2>
                  <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
                </div>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}

export default App;