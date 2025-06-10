import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBpReadingSchema, insertWorkflowTaskSchema, insertCommunicationLogSchema, insertPatientSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you'd use proper JWT/session management
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      const abnormalReadings = await storage.getAbnormalReadings();
      const workflowTasks = await storage.getAllWorkflowTasks();
      const recentReadings = await storage.getRecentReadings();
      
      const pendingTasks = workflowTasks.filter(task => task.status === 'pending');
      const todayReadings = recentReadings.filter(reading => {
        const today = new Date();
        const readingDate = new Date(reading.recordedAt!);
        return readingDate.toDateString() === today.toDateString();
      });

      res.json({
        totalPatients: patients.length,
        abnormalReadings: abnormalReadings.length,
        pendingCalls: pendingTasks.length,
        todayReadings: todayReadings.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Patients
  app.get("/api/patients", async (req, res) => {
    try {
      const { search, status, station } = req.query;
      
      let patients = await storage.getAllPatients();
      
      if (search) {
        patients = await storage.searchPatients(search as string);
      }
      
      // Get latest reading for each patient
      const patientsWithReadings = await Promise.all(
        patients.map(async (patient) => {
          const readings = await storage.getBpReadingsByPatient(patient.id);
          const latestReading = readings[0];
          return {
            ...patient,
            latestReading,
          };
        })
      );

      // Filter by status if provided
      let filteredPatients = patientsWithReadings;
      if (status && status !== 'all') {
        filteredPatients = patientsWithReadings.filter(patient => 
          patient.latestReading?.category === status
        );
      }

      // Filter by station if provided
      if (station && station !== 'all') {
        filteredPatients = filteredPatients.filter(patient => 
          patient.station === station
        );
      }

      res.json(filteredPatients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Priority patients (those requiring follow-up) - must come before parameterized route
  app.get("/api/patients/priority", async (req, res) => {
    try {
      const abnormalReadings = await storage.getAbnormalReadings();
      const patientIds = Array.from(new Set(abnormalReadings.map(r => r.patientId)));
      
      const priorityPatients = await Promise.all(
        patientIds.map(async (patientId) => {
          const patient = await storage.getPatient(patientId);
          const readings = await storage.getBpReadingsByPatient(patientId);
          const latestReading = readings[0];
          return {
            ...patient,
            latestReading,
          };
        })
      );

      res.json(priorityPatients.filter(p => p));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch priority patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const patient = await storage.getPatient(patientId);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const readings = await storage.getBpReadingsByPatient(patientId);
      const tasks = await storage.getWorkflowTasksByPatient(patientId);
      const communications = await storage.getCommunicationLogByPatient(patientId);

      res.json({
        ...patient,
        readings,
        tasks,
        communications,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient details" });
    }
  });

  // Create patient
  app.post("/api/patients", async (req, res) => {
    try {
      const validated = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validated);
      res.status(201).json(patient);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  // BP Readings
  app.post("/api/readings", async (req, res) => {
    try {
      const validated = insertBpReadingSchema.parse(req.body);
      const reading = await storage.createBpReading(validated);
      res.status(201).json(reading);
    } catch (error) {
      res.status(400).json({ message: "Invalid reading data" });
    }
  });

  app.get("/api/readings/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const readings = await storage.getRecentReadings(limit);
      
      // Get patient info for each reading
      const readingsWithPatients = await Promise.all(
        readings.map(async (reading) => {
          const patient = await storage.getPatient(reading.patientId);
          return {
            ...reading,
            patient,
          };
        })
      );

      res.json(readingsWithPatients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent readings" });
    }
  });

  app.get("/api/readings/abnormal", async (req, res) => {
    try {
      const readings = await storage.getAbnormalReadings();
      
      // Get patient info for each reading
      const readingsWithPatients = await Promise.all(
        readings.map(async (reading) => {
          const patient = await storage.getPatient(reading.patientId);
          return {
            ...reading,
            patient,
          };
        })
      );

      res.json(readingsWithPatients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch abnormal readings" });
    }
  });

  // BP Trends data
  app.get("/api/readings/trends", async (req, res) => {
    try {
      const { period = '7d' } = req.query;
      const recentReadings = await storage.getRecentReadings(100);
      
      // Filter by period
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (period) {
        case '7d':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '3m':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        default:
          cutoffDate.setDate(now.getDate() - 7);
      }

      const filteredReadings = recentReadings.filter(reading => 
        new Date(reading.recordedAt!) >= cutoffDate
      );

      // Group by date and calculate averages
      const trendData = new Map();
      
      filteredReadings.forEach(reading => {
        const date = new Date(reading.recordedAt!).toISOString().split('T')[0];
        if (!trendData.has(date)) {
          trendData.set(date, { systolic: [], diastolic: [], normal: 0, abnormal: 0 });
        }
        
        const dayData = trendData.get(date);
        dayData.systolic.push(reading.systolic);
        dayData.diastolic.push(reading.diastolic);
        
        if (reading.isAbnormal) {
          dayData.abnormal++;
        } else {
          dayData.normal++;
        }
      });

      // Calculate averages and format response
      const trends = Array.from(trendData.entries()).map(([date, data]) => ({
        date,
        avgSystolic: Math.round(data.systolic.reduce((a, b) => a + b, 0) / data.systolic.length),
        avgDiastolic: Math.round(data.diastolic.reduce((a, b) => a + b, 0) / data.diastolic.length),
        normalCount: data.normal,
        abnormalCount: data.abnormal,
      }));

      res.json(trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch BP trends" });
    }
  });

  // Workflow Tasks
  app.get("/api/workflow", async (req, res) => {
    try {
      const { assignee, status, priority } = req.query;
      
      let tasks = await storage.getAllWorkflowTasks();
      
      if (assignee) {
        tasks = await storage.getWorkflowTasksByAssignee(parseInt(assignee as string));
      }
      
      if (status && status !== 'all') {
        tasks = tasks.filter(task => task.status === status);
      }
      
      if (priority && priority !== 'all') {
        tasks = tasks.filter(task => task.priority === priority);
      }

      // Get patient and assignee info for each task
      const tasksWithDetails = await Promise.all(
        tasks.map(async (task) => {
          const patient = await storage.getPatient(task.patientId);
          const assignee = await storage.getUser(task.assignedTo);
          return {
            ...task,
            patient,
            assignee,
          };
        })
      );

      res.json(tasksWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow tasks" });
    }
  });

  app.post("/api/workflow", async (req, res) => {
    try {
      const validated = insertWorkflowTaskSchema.parse(req.body);
      const task = await storage.createWorkflowTask(validated);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.patch("/api/workflow/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;
      
      const task = await storage.updateWorkflowTask(taskId, updates);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Get all communication logs with filtering and search
  app.get("/api/communications", async (req, res) => {
    try {
      const { 
        patientId, 
        userId, 
        type, 
        outcome, 
        dateFrom, 
        dateTo,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Get all patients to fetch their communication logs
      const patients = await storage.getAllPatients();
      let allCommunications: any[] = [];

      for (const patient of patients) {
        const communications = await storage.getCommunicationLogByPatient(patient.id);
        const enhancedComms = communications.map(comm => ({
          ...comm,
          patient: {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            employeeId: patient.employeeId,
            department: patient.department,
            phone: patient.phone,
            email: patient.email
          }
        }));
        allCommunications = [...allCommunications, ...enhancedComms];
      }

      // Add user information
      const communicationsWithUsers = await Promise.all(
        allCommunications.map(async (comm) => {
          const user = await storage.getUser(comm.userId);
          return {
            ...comm,
            user: user ? {
              id: user.id,
              name: user.name,
              role: user.role,
              email: user.email
            } : null
          };
        })
      );

      // Apply filters
      let filteredComms = communicationsWithUsers;

      if (patientId) {
        filteredComms = filteredComms.filter(comm => comm.patientId === parseInt(patientId as string));
      }

      if (userId) {
        filteredComms = filteredComms.filter(comm => comm.userId === parseInt(userId as string));
      }

      if (type) {
        filteredComms = filteredComms.filter(comm => comm.type === type);
      }

      if (outcome) {
        filteredComms = filteredComms.filter(comm => comm.outcome === outcome);
      }

      if (dateFrom) {
        const fromDate = new Date(dateFrom as string);
        filteredComms = filteredComms.filter(comm => new Date(comm.createdAt!) >= fromDate);
      }

      if (dateTo) {
        const toDate = new Date(dateTo as string);
        filteredComms = filteredComms.filter(comm => new Date(comm.createdAt!) <= toDate);
      }

      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredComms = filteredComms.filter(comm => 
          comm.message.toLowerCase().includes(searchTerm) ||
          (comm.notes && comm.notes.toLowerCase().includes(searchTerm)) ||
          `${comm.patient.firstName} ${comm.patient.lastName}`.toLowerCase().includes(searchTerm) ||
          comm.patient.employeeId.toLowerCase().includes(searchTerm)
        );
      }

      // Apply sorting
      filteredComms.sort((a, b) => {
        let aVal = a[sortBy as string];
        let bVal = b[sortBy as string];
        
        if (sortBy === 'patientName') {
          aVal = `${a.patient.firstName} ${a.patient.lastName}`;
          bVal = `${b.patient.firstName} ${b.patient.lastName}`;
        }
        
        if (sortBy === 'userName') {
          aVal = a.user?.name || '';
          bVal = b.user?.name || '';
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      res.json(filteredComms);
    } catch (error) {
      console.error('Error fetching communications:', error);
      res.status(500).json({ message: "Failed to fetch communication logs" });
    }
  });

  // Get communication analytics
  app.get("/api/communications/analytics", async (req, res) => {
    try {
      const { period = '30d' } = req.query;
      
      // Get all communications
      const patients = await storage.getAllPatients();
      let allCommunications: any[] = [];

      for (const patient of patients) {
        const communications = await storage.getCommunicationLogByPatient(patient.id);
        allCommunications = [...allCommunications, ...communications];
      }

      // Filter by period
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (period) {
        case '7d':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          cutoffDate.setDate(now.getDate() - 30);
      }

      const filteredComms = allCommunications.filter(comm => 
        new Date(comm.createdAt!) >= cutoffDate
      );

      // Calculate analytics
      const analytics = {
        totalCommunications: filteredComms.length,
        byType: {} as Record<string, number>,
        byOutcome: {} as Record<string, number>,
        byDay: {} as Record<string, number>,
        responseRate: 0,
        topStaff: {} as Record<string, number>,
        dailyTrend: [] as any[]
      };

      // Group by type
      filteredComms.forEach(comm => {
        analytics.byType[comm.type] = (analytics.byType[comm.type] || 0) + 1;
      });

      // Group by outcome
      filteredComms.forEach(comm => {
        if (comm.outcome) {
          analytics.byOutcome[comm.outcome] = (analytics.byOutcome[comm.outcome] || 0) + 1;
        }
      });

      // Group by day for trend analysis
      filteredComms.forEach(comm => {
        const date = new Date(comm.createdAt!).toISOString().split('T')[0];
        analytics.byDay[date] = (analytics.byDay[date] || 0) + 1;
      });

      // Create daily trend data
      const sortedDays = Object.keys(analytics.byDay).sort();
      analytics.dailyTrend = sortedDays.map(date => ({
        date,
        count: analytics.byDay[date]
      }));

      // Calculate response rate (calls that weren't "no_answer")
      const calls = filteredComms.filter(comm => comm.type === 'call');
      const answeredCalls = calls.filter(comm => comm.outcome && comm.outcome !== 'no_answer');
      analytics.responseRate = calls.length > 0 ? Math.round((answeredCalls.length / calls.length) * 100) : 0;

      // Group by staff
      for (const comm of filteredComms) {
        const user = await storage.getUser(comm.userId);
        if (user) {
          analytics.topStaff[user.name] = (analytics.topStaff[user.name] || 0) + 1;
        }
      }

      res.json(analytics);
    } catch (error) {
      console.error('Error calculating analytics:', error);
      res.status(500).json({ message: "Failed to calculate analytics" });
    }
  });

  // Communication logs
  app.post("/api/communications", async (req, res) => {
    try {
      const validated = insertCommunicationLogSchema.parse(req.body);
      const log = await storage.createCommunicationLog(validated);
      
      // Get enhanced data for response
      const patient = await storage.getPatient(log.patientId);
      const user = await storage.getUser(log.userId);
      
      const enhancedLog = {
        ...log,
        patient: patient ? {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          employeeId: patient.employeeId
        } : null,
        user: user ? {
          id: user.id,
          name: user.name,
          role: user.role
        } : null
      };

      res.status(201).json(enhancedLog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid communication data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create communication log" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
