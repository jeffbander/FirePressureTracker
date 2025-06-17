import { QueryClient } from "@tanstack/react-query";
import { mockApi } from './mockData';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  // Route requests to mock API functions
  if (method === 'POST') {
    if (url === '/api/patients') {
      return mockApi.createPatient(data as any);
    }
    if (url === '/api/bp-readings') {
      return mockApi.createBpReading(data as any);
    }
    if (url === '/api/workflow-tasks') {
      return mockApi.createWorkflowTask(data as any);
    }
    if (url === '/api/communication-logs') {
      return mockApi.createCommunicationLog(data as any);
    }
  }
  
  if (method === 'PATCH' && url.startsWith('/api/workflow-tasks/')) {
    const taskId = parseInt(url.split('/')[3]);
    return mockApi.updateWorkflowTask(taskId, data as any);
  }
  
  throw new Error(`Unsupported request: ${method} ${url}`);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [endpoint, ...params] = Array.isArray(queryKey) ? queryKey : [queryKey];
        
        // Route to mock API functions based on endpoint
        switch (endpoint) {
          case '/api/auth/me':
            return mockApi.getCurrentUser();
          case '/api/users':
            return mockApi.getUsers();
          case '/api/patients':
            return mockApi.getPatients();
          case '/api/bp-readings':
            return mockApi.getBpReadings();
          case '/api/workflow-tasks':
            return mockApi.getWorkflowTasks();
          case '/api/communication-logs':
            return mockApi.getCommunicationLogs();
          default:
            if (typeof endpoint === 'string' && endpoint.startsWith('/api/patients/') && params.length === 0) {
              const patientId = parseInt(endpoint.split('/')[3]);
              return mockApi.getPatient(patientId);
            }
            if (typeof endpoint === 'string' && endpoint.startsWith('/api/patients/') && params[0] === 'bp-readings') {
              const patientId = parseInt(endpoint.split('/')[3]);
              return mockApi.getBpReadingsByPatient(patientId);
            }
            if (typeof endpoint === 'string' && endpoint.startsWith('/api/patients/') && params[0] === 'communication-logs') {
              const patientId = parseInt(endpoint.split('/')[3]);
              return mockApi.getCommunicationLogsByPatient(patientId);
            }
            if (endpoint === '/api/workflow-tasks/my-tasks') {
              return mockApi.getWorkflowTasksByAssignee(2); // Sarah Johnson's tasks
            }
            throw new Error(`Unknown endpoint: ${endpoint}`);
        }
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
