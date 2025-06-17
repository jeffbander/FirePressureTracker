import { useState } from 'react'
import { Route, Switch, Link, useLocation } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import { Button } from './components/ui/button'
import { cn } from './lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  FileText, 
  MessageSquare,
  Menu,
  X
} from 'lucide-react'

const queryClient = new QueryClient()

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [location] = useLocation()
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Readings', href: '/readings', icon: Activity },
    { name: 'Tasks', href: '/tasks', icon: FileText },
    { name: 'Communications', href: '/communications', icon: MessageSquare },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden" onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-blue-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-4 bg-blue-800">
          <h1 className="text-lg font-semibold">Fire Dept BP</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-blue-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <a
                      className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-blue-700 text-white"
                          : "text-blue-100 hover:bg-blue-800 hover:text-white"
                      )}
                      onClick={onClose}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </a>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-gray-600 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-blue-900">Fire Department BP</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>
    </header>
  )
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            
            <main className="flex-1 overflow-auto">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/patients" component={Patients} />
                <Route path="/readings">
                  <div className="flex-1 space-y-4 p-8 pt-6">
                    <h2 className="text-3xl font-bold tracking-tight text-blue-900">Blood Pressure Readings</h2>
                    <p className="text-muted-foreground">Blood pressure readings management coming soon...</p>
                  </div>
                </Route>
                <Route path="/tasks">
                  <div className="flex-1 space-y-4 p-8 pt-6">
                    <h2 className="text-3xl font-bold tracking-tight text-blue-900">Workflow Tasks</h2>
                    <p className="text-muted-foreground">Task management coming soon...</p>
                  </div>
                </Route>
                <Route path="/communications">
                  <div className="flex-1 space-y-4 p-8 pt-6">
                    <h2 className="text-3xl font-bold tracking-tight text-blue-900">Communications</h2>
                    <p className="text-muted-foreground">Communication logs coming soon...</p>
                  </div>
                </Route>
                <Route>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h2>
                      <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
                      <Link href="/">
                        <a className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                          Go Home
                        </a>
                      </Link>
                    </div>
                  </div>
                </Route>
              </Switch>
            </main>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App