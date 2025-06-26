import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import PatientDetail from "@/pages/patient-detail-new";
import Workflow from "@/pages/workflow";
import BPTrends from "@/pages/bp-trends";
import Communications from "@/pages/communications";
import Approvals from "@/pages/approvals";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/patients" component={Patients} />
        <Route path="/patients/:id" component={PatientDetail} />
        <Route path="/workflow" component={Workflow} />
        <Route path="/bp-trends" component={BPTrends} />
        <Route path="/communications" component={Communications} />
        <Route path="/approvals" component={Approvals} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
