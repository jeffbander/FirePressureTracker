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

  // Priority patients (those requiring follow-up)
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

  // Communication logs
  app.post("/api/communication", async (req, res) => {
    try {
      const validated = insertCommunicationLogSchema.parse(req.body);
      const log = await storage.createCommunicationLog(validated);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ message: "Invalid communication log data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
