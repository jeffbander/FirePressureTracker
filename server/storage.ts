import { 
  users, patients, bpReadings, workflowTasks, communicationLog,
  type User, type InsertUser,
  type Patient, type InsertPatient,
  type BpReading, type InsertBpReading,
  type WorkflowTask, type InsertWorkflowTask,
  type CommunicationLog, type InsertCommunicationLog
} from "@shared/schema";
import { categorizeBP } from "@shared/bp-utils";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patient operations
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByEmployeeId(employeeId: string): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  searchPatients(query: string): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, updates: Partial<Patient>): Promise<Patient | undefined>;
  
  // BP Reading operations
  getBpReading(id: number): Promise<BpReading | undefined>;
  getBpReadingsByPatient(patientId: number): Promise<BpReading[]>;
  getAbnormalReadings(): Promise<BpReading[]>;
  getRecentReadings(limit?: number): Promise<BpReading[]>;
  createBpReading(reading: InsertBpReading): Promise<BpReading>;
  
  // Workflow operations
  getWorkflowTask(id: number): Promise<WorkflowTask | undefined>;
  getWorkflowTasksByAssignee(userId: number): Promise<WorkflowTask[]>;
  getWorkflowTasksByPatient(patientId: number): Promise<WorkflowTask[]>;
  getAllWorkflowTasks(): Promise<WorkflowTask[]>;
  createWorkflowTask(task: InsertWorkflowTask): Promise<WorkflowTask>;
  updateWorkflowTask(id: number, updates: Partial<WorkflowTask>): Promise<WorkflowTask | undefined>;
  
  // Communication log operations
  getCommunicationLogByPatient(patientId: number): Promise<CommunicationLog[]>;
  createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private bpReadings: Map<number, BpReading>;
  private workflowTasks: Map<number, WorkflowTask>;
  private communicationLogs: Map<number, CommunicationLog>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.bpReadings = new Map();
    this.workflowTasks = new Map();
    this.communicationLogs = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    // Create demo users
    const adminUser: User = {
      id: this.currentId++,
      username: 'admin',
      password: 'admin123',
      name: 'Dr. Jane Smith',
      role: 'admin',
      email: 'admin@firestation.gov',
      phone: '(555) 001-0001',
      createdAt: new Date(),
    };

    const nurseUser: User = {
      id: this.currentId++,
      username: 'nurse',
      password: 'nurse123',
      name: 'Sarah Johnson, RN',
      role: 'nurse',
      email: 'nurse@firestation.gov',
      phone: '(555) 002-0002',
      createdAt: new Date(),
    };

    const coachUser: User = {
      id: this.currentId++,
      username: 'coach',
      password: 'coach123',
      name: 'Mike Wilson',
      role: 'coach',
      email: 'coach@firestation.gov',
      phone: '(555) 003-0003',
      createdAt: new Date(),
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(nurseUser.id, nurseUser);
    this.users.set(coachUser.id, coachUser);

    // Create demo patients
    const patients = [
      {
        id: this.currentId++,
        employeeId: 'FF-001',
        firstName: 'John',
        lastName: 'Rodriguez',
        department: 'Engine Company',
        union: 'Union 15',
        age: 42,
        email: 'j.rodriguez@firestation.gov',
        phone: '(555) 123-4567',
        emergencyContact: '(555) 987-6543',
        medications: JSON.stringify(['Lisinopril 10mg daily', 'Amlodipine 5mg daily']),
        allergies: 'Penicillin',
        lastCheckup: new Date('2024-10-15'),
        customSystolicThreshold: 140,
        customDiastolicThreshold: 90,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        employeeId: 'FF-032',
        firstName: 'Sarah',
        lastName: 'Chen',
        department: 'Ladder Company',
        union: 'Union 7',
        age: 35,
        email: 's.chen@firestation.gov',
        phone: '(555) 234-5678',
        emergencyContact: '(555) 876-5432',
        medications: JSON.stringify(['Metoprolol 25mg twice daily']),
        allergies: 'None known',
        lastCheckup: new Date('2024-11-01'),
        customSystolicThreshold: 130,
        customDiastolicThreshold: 85,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        employeeId: 'FF-018',
        firstName: 'Mike',
        lastName: 'Thompson',
        department: 'Rescue Squad',
        union: 'Union 3',
        age: 38,
        email: 'm.thompson@firestation.gov',
        phone: '(555) 345-6789',
        emergencyContact: '(555) 765-4321',
        medications: JSON.stringify([]),
        allergies: 'Shellfish',
        lastCheckup: new Date('2024-09-20'),
        customSystolicThreshold: null,
        customDiastolicThreshold: null,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        employeeId: 'FF-045',
        firstName: 'Lisa',
        lastName: 'Garcia',
        department: 'Paramedic Unit',
        union: 'Union 1',
        age: 29,
        email: 'l.garcia@firestation.gov',
        phone: '(555) 456-7890',
        emergencyContact: '(555) 654-3210',
        medications: JSON.stringify([]),
        allergies: 'None known',
        lastCheckup: new Date('2024-11-10'),
        customSystolicThreshold: null,
        customDiastolicThreshold: null,
        createdAt: new Date(),
      }
    ];

    patients.forEach(patient => {
      this.patients.set(patient.id, patient);
    });

    // Create comprehensive BP readings for trend analysis
    const readings = [
      // John Rodriguez (FF-001) - Stage 2 hypertension trending
      {
        id: this.currentId++,
        patientId: 4,
        systolic: 165,
        diastolic: 98,
        heartRate: 78,
        notes: 'Initial assessment',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        isAbnormal: true,
        category: 'stage1',
      },
      {
        id: this.currentId++,
        patientId: 4,
        systolic: 172,
        diastolic: 105,
        heartRate: 82,
        notes: 'Stress from major fire incident',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        isAbnormal: true,
        category: 'stage2',
      },
      {
        id: this.currentId++,
        patientId: 4,
        systolic: 175,
        diastolic: 108,
        heartRate: 85,
        notes: 'Medication adjustment needed',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        isAbnormal: true,
        category: 'stage2',
      },
      {
        id: this.currentId++,
        patientId: 4,
        systolic: 180,
        diastolic: 110,
        heartRate: 88,
        notes: 'Post-shift reading, patient reports stress',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isAbnormal: true,
        category: 'stage2',
      },

      // Sarah Chen (FF-032) - Stage 1 hypertension with improving trend
      {
        id: this.currentId++,
        patientId: 5,
        systolic: 155,
        diastolic: 100,
        heartRate: 80,
        notes: 'Started new medication regimen',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
        isAbnormal: true,
        category: 'stage1',
      },
      {
        id: this.currentId++,
        patientId: 5,
        systolic: 152,
        diastolic: 98,
        heartRate: 78,
        notes: 'Medication compliance good',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        isAbnormal: true,
        category: 'stage1',
      },
      {
        id: this.currentId++,
        patientId: 5,
        systolic: 148,
        diastolic: 96,
        heartRate: 75,
        notes: 'Showing improvement',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        isAbnormal: true,
        category: 'stage1',
      },
      {
        id: this.currentId++,
        patientId: 5,
        systolic: 150,
        diastolic: 95,
        heartRate: 76,
        notes: 'Regular check, medication compliance good',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isAbnormal: true,
        category: 'stage1',
      },

      // Mike Thompson (FF-018) - Hypotension episodes
      {
        id: this.currentId++,
        patientId: 6,
        systolic: 110,
        diastolic: 70,
        heartRate: 65,
        notes: 'Normal baseline reading',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
        isAbnormal: false,
        category: 'normal',
      },
      {
        id: this.currentId++,
        patientId: 6,
        systolic: 95,
        diastolic: 62,
        heartRate: 58,
        notes: 'Post-rescue operation fatigue',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        isAbnormal: true,
        category: 'low',
      },
      {
        id: this.currentId++,
        patientId: 6,
        systolic: 88,
        diastolic: 58,
        heartRate: 60,
        notes: 'Dehydration after long shift',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        isAbnormal: true,
        category: 'low',
      },
      {
        id: this.currentId++,
        patientId: 6,
        systolic: 85,
        diastolic: 55,
        heartRate: 62,
        notes: 'Low reading after long shift',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isAbnormal: true,
        category: 'low',
      },

      // Lisa Garcia (FF-045) - Consistently normal readings
      {
        id: this.currentId++,
        patientId: 7,
        systolic: 118,
        diastolic: 75,
        heartRate: 68,
        notes: 'Pre-shift baseline',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
        isAbnormal: false,
        category: 'normal',
      },
      {
        id: this.currentId++,
        patientId: 7,
        systolic: 122,
        diastolic: 78,
        heartRate: 72,
        notes: 'Post-training assessment',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        isAbnormal: false,
        category: 'normal',
      },
      {
        id: this.currentId++,
        patientId: 7,
        systolic: 120,
        diastolic: 76,
        heartRate: 69,
        notes: 'Routine monthly check',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        isAbnormal: false,
        category: 'normal',
      },
      {
        id: this.currentId++,
        patientId: 7,
        systolic: 125,
        diastolic: 80,
        heartRate: 70,
        notes: 'Normal reading',
        recordedBy: 2,
        recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isAbnormal: false,
        category: 'normal',
      }
    ];

    readings.forEach(reading => {
      this.bpReadings.set(reading.id, reading);
    });

    // Create demo workflow tasks
    const tasks = [
      {
        id: this.currentId++,
        patientId: 4,
        assignedTo: 1,
        title: 'Follow-up call for high BP reading',
        description: 'Patient John Rodriguez had a critical BP reading of 180/110. Requires immediate follow-up call to assess symptoms and medication compliance.',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // Due in 2 hours
        completedAt: null,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        patientId: 5,
        assignedTo: 2,
        title: 'Schedule medication review',
        description: 'Patient Sarah Chen needs medication review appointment with cardiologist due to elevated BP readings over past month.',
        priority: 'medium',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
        completedAt: null,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        patientId: 6,
        assignedTo: 1,
        title: 'Weekly BP monitoring setup',
        description: 'Set up weekly BP monitoring schedule for Mike Thompson following low BP incident.',
        priority: 'medium',
        status: 'completed',
        dueDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      }
    ];

    tasks.forEach(task => {
      this.workflowTasks.set(task.id, task);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentId++,
      email: insertUser.email ?? null,
      phone: insertUser.phone ?? null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Patient operations
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByEmployeeId(employeeId: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(patient => patient.employeeId === employeeId);
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.patients.values()).filter(patient =>
      patient.firstName.toLowerCase().includes(lowerQuery) ||
      patient.lastName.toLowerCase().includes(lowerQuery) ||
      patient.employeeId.toLowerCase().includes(lowerQuery) ||
      patient.department.toLowerCase().includes(lowerQuery) ||
      patient.union.toLowerCase().includes(lowerQuery)
    );
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const patient: Patient = {
      ...insertPatient,
      id: this.currentId++,
      email: insertPatient.email ?? null,
      phone: insertPatient.phone ?? null,
      emergencyContact: insertPatient.emergencyContact ?? null,
      medications: insertPatient.medications ?? null,
      allergies: insertPatient.allergies ?? null,
      lastCheckup: insertPatient.lastCheckup ?? null,
      customSystolicThreshold: insertPatient.customSystolicThreshold ?? null,
      customDiastolicThreshold: insertPatient.customDiastolicThreshold ?? null,
      createdAt: new Date(),
    };
    this.patients.set(patient.id, patient);
    return patient;
  }

  async updatePatient(id: number, updates: Partial<Patient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient = { ...patient, ...updates };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  // BP Reading operations
  async getBpReading(id: number): Promise<BpReading | undefined> {
    return this.bpReadings.get(id);
  }

  async getBpReadingsByPatient(patientId: number): Promise<BpReading[]> {
    return Array.from(this.bpReadings.values())
      .filter(reading => reading.patientId === patientId)
      .sort((a, b) => new Date(b.recordedAt!).getTime() - new Date(a.recordedAt!).getTime());
  }

  async getAbnormalReadings(): Promise<BpReading[]> {
    return Array.from(this.bpReadings.values())
      .filter(reading => reading.isAbnormal)
      .sort((a, b) => new Date(b.recordedAt!).getTime() - new Date(a.recordedAt!).getTime());
  }

  async getRecentReadings(limit: number = 10): Promise<BpReading[]> {
    return Array.from(this.bpReadings.values())
      .sort((a, b) => new Date(b.recordedAt!).getTime() - new Date(a.recordedAt!).getTime())
      .slice(0, limit);
  }

  async createBpReading(insertReading: InsertBpReading): Promise<BpReading> {
    const { systolic, diastolic, patientId } = insertReading;
    
    // Get patient to check for custom thresholds
    const patient = await this.getPatient(patientId);
    
    // Categorize BP using AHA guidelines and custom thresholds
    const bpCategory = categorizeBP(
      systolic, 
      diastolic,
      patient?.customSystolicThreshold || undefined,
      patient?.customDiastolicThreshold || undefined
    );
    
    const reading: BpReading = {
      ...insertReading,
      id: this.currentId++,
      heartRate: insertReading.heartRate || null,
      notes: insertReading.notes || null,
      recordedAt: new Date(),
      isAbnormal: bpCategory.isAbnormal,
      category: bpCategory.code,
    };
    
    // Auto-create workflow task for abnormal readings
    if (bpCategory.isAbnormal) {
      const priority = bpCategory.priority >= 4 ? 'high' : bpCategory.priority >= 3 ? 'medium' : 'low';
      await this.createWorkflowTask({
        patientId: reading.patientId,
        assignedTo: reading.recordedBy,
        title: `Follow-up for ${bpCategory.name} reading`,
        description: `Patient ${patient?.firstName} ${patient?.lastName} recorded ${systolic}/${diastolic} mmHg`,
        priority,
        status: 'pending',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 24 hours
      });
    }
    
    this.bpReadings.set(reading.id, reading);
    return reading;
  }

  // Workflow operations
  async getWorkflowTask(id: number): Promise<WorkflowTask | undefined> {
    return this.workflowTasks.get(id);
  }

  async getWorkflowTasksByAssignee(userId: number): Promise<WorkflowTask[]> {
    return Array.from(this.workflowTasks.values())
      .filter(task => task.assignedTo === userId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async getWorkflowTasksByPatient(patientId: number): Promise<WorkflowTask[]> {
    return Array.from(this.workflowTasks.values())
      .filter(task => task.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getAllWorkflowTasks(): Promise<WorkflowTask[]> {
    return Array.from(this.workflowTasks.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createWorkflowTask(insertTask: InsertWorkflowTask): Promise<WorkflowTask> {
    const task: WorkflowTask = {
      ...insertTask,
      id: this.currentId++,
      status: insertTask.status ?? 'pending',
      description: insertTask.description ?? null,
      dueDate: insertTask.dueDate ?? null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.workflowTasks.set(task.id, task);
    return task;
  }

  async updateWorkflowTask(id: number, updates: Partial<WorkflowTask>): Promise<WorkflowTask | undefined> {
    const task = this.workflowTasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    if (updates.status === 'completed' && !updatedTask.completedAt) {
      updatedTask.completedAt = new Date();
    }
    
    this.workflowTasks.set(id, updatedTask);
    return updatedTask;
  }

  // Communication log operations
  async getCommunicationLogByPatient(patientId: number): Promise<CommunicationLog[]> {
    return Array.from(this.communicationLogs.values())
      .filter(log => log.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createCommunicationLog(insertLog: InsertCommunicationLog): Promise<CommunicationLog> {
    const log: CommunicationLog = {
      ...insertLog,
      id: this.currentId++,
      createdAt: new Date(),
    };
    this.communicationLogs.set(log.id, log);
    return log;
  }
}

export const storage = new MemStorage();
