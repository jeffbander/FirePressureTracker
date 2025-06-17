import { User, Patient, BpReading, WorkflowTask, CommunicationLog } from '../schema'

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'hashed_password',
    name: 'System Administrator',
    role: 'admin',
    email: 'admin@firestation.gov',
    phone: '555-0101',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    username: 'nurse_sarah',
    password: 'hashed_password',
    name: 'Sarah Johnson',
    role: 'nurse',
    email: 'sarah.johnson@firestation.gov',
    phone: '555-0102',
    createdAt: new Date('2024-01-02'),
  },
  {
    id: 3,
    username: 'coach_mike',
    password: 'hashed_password',
    name: 'Mike Williams',
    role: 'coach',
    email: 'mike.williams@firestation.gov',
    phone: '555-0103',
    createdAt: new Date('2024-01-03'),
  },
]

export const mockPatients: Patient[] = [
  {
    id: 1,
    employeeId: 'FF001',
    firstName: 'John',
    lastName: 'Smith',
    department: 'Station 1',
    union: 'IAFF Local 123',
    age: 35,
    email: 'john.smith@firestation.gov',
    phone: '555-1001',
    emergencyContact: '555-1002',
    medications: JSON.stringify(['Lisinopril 10mg']),
    allergies: 'None',
    lastCheckup: new Date('2024-06-01'),
    customSystolicThreshold: null,
    customDiastolicThreshold: null,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 2,
    employeeId: 'FF002',
    firstName: 'Maria',
    lastName: 'Garcia',
    department: 'Station 2',
    union: 'IAFF Local 123',
    age: 42,
    email: 'maria.garcia@firestation.gov',
    phone: '555-1003',
    emergencyContact: '555-1004',
    medications: JSON.stringify(['Metoprolol 25mg']),
    allergies: 'Penicillin',
    lastCheckup: new Date('2024-05-15'),
    customSystolicThreshold: 130,
    customDiastolicThreshold: 85,
    createdAt: new Date('2024-01-16'),
  },
  {
    id: 3,
    employeeId: 'FF003',
    firstName: 'Robert',
    lastName: 'Johnson',
    department: 'Station 1',
    union: 'IAFF Local 123',
    age: 28,
    email: 'robert.johnson@firestation.gov',
    phone: '555-1005',
    emergencyContact: '555-1006',
    medications: JSON.stringify([]),
    allergies: 'Shellfish',
    lastCheckup: new Date('2024-06-10'),
    customSystolicThreshold: null,
    customDiastolicThreshold: null,
    createdAt: new Date('2024-01-17'),
  },
  {
    id: 4,
    employeeId: 'FF004',
    firstName: 'David',
    lastName: 'Miller',
    department: 'Station 3',
    union: 'IAFF Local 123',
    age: 45,
    email: 'david.miller@firestation.gov',
    phone: '555-1007',
    emergencyContact: '555-1008',
    medications: JSON.stringify(['Amlodipine 5mg', 'Atorvastatin 20mg']),
    allergies: 'None',
    lastCheckup: new Date('2024-05-20'),
    customSystolicThreshold: 140,
    customDiastolicThreshold: 90,
    createdAt: new Date('2024-01-18'),
  },
  {
    id: 5,
    employeeId: 'FF005',
    firstName: 'Jennifer',
    lastName: 'Davis',
    department: 'Station 2',
    union: 'IAFF Local 123',
    age: 38,
    email: 'jennifer.davis@firestation.gov',
    phone: '555-1009',
    emergencyContact: '555-1010',
    medications: JSON.stringify(['Hydrochlorothiazide 25mg']),
    allergies: 'Sulfa drugs',
    lastCheckup: new Date('2024-06-05'),
    customSystolicThreshold: null,
    customDiastolicThreshold: null,
    createdAt: new Date('2024-01-19'),
  },
]

export const mockBpReadings: BpReading[] = [
  {
    id: 1,
    patientId: 1,
    systolic: 145,
    diastolic: 92,
    heartRate: 78,
    notes: 'Post-exercise reading',
    recordedBy: 2,
    recordedAt: new Date('2024-06-15T10:30:00'),
    isAbnormal: true,
    category: 'stage1',
  },
  {
    id: 2,
    patientId: 2,
    systolic: 165,
    diastolic: 98,
    heartRate: 82,
    notes: 'Patient reported stress',
    recordedBy: 2,
    recordedAt: new Date('2024-06-14T14:15:00'),
    isAbnormal: true,
    category: 'stage2',
  },
  {
    id: 3,
    patientId: 3,
    systolic: 118,
    diastolic: 76,
    heartRate: 72,
    notes: 'Normal routine check',
    recordedBy: 2,
    recordedAt: new Date('2024-06-13T09:45:00'),
    isAbnormal: false,
    category: 'normal',
  },
  {
    id: 4,
    patientId: 1,
    systolic: 135,
    diastolic: 88,
    heartRate: 75,
    notes: 'Follow-up reading',
    recordedBy: 2,
    recordedAt: new Date('2024-06-12T11:20:00'),
    isAbnormal: true,
    category: 'stage1',
  },
  {
    id: 5,
    patientId: 4,
    systolic: 175,
    diastolic: 105,
    heartRate: 85,
    notes: 'Emergency reading - patient experiencing chest pain',
    recordedBy: 2,
    recordedAt: new Date('2024-06-16T16:45:00'),
    isAbnormal: true,
    category: 'stage2',
  },
  {
    id: 6,
    patientId: 5,
    systolic: 125,
    diastolic: 82,
    heartRate: 68,
    notes: 'Routine monthly check',
    recordedBy: 3,
    recordedAt: new Date('2024-06-11T08:30:00'),
    isAbnormal: true,
    category: 'elevated',
  },
  {
    id: 7,
    patientId: 2,
    systolic: 155,
    diastolic: 95,
    heartRate: 79,
    notes: 'Follow-up after medication adjustment',
    recordedBy: 2,
    recordedAt: new Date('2024-06-10T13:15:00'),
    isAbnormal: true,
    category: 'stage2',
  },
  {
    id: 8,
    patientId: 3,
    systolic: 122,
    diastolic: 78,
    heartRate: 74,
    notes: 'Pre-shift screening',
    recordedBy: 2,
    recordedAt: new Date('2024-06-09T07:00:00'),
    isAbnormal: false,
    category: 'elevated',
  },
]

export const mockWorkflowTasks: WorkflowTask[] = [
  {
    id: 1,
    patientId: 1,
    assignedTo: 2,
    title: 'Follow-up on Stage 1 Hypertension - John Smith',
    description: 'Patient has consistent Stage 1 readings. Schedule follow-up appointment and discuss lifestyle modifications.',
    priority: 'high',
    status: 'pending',
    dueDate: new Date('2024-06-20'),
    completedAt: null,
    createdAt: new Date('2024-06-15'),
  },
  {
    id: 2,
    patientId: 2,
    assignedTo: 3,
    title: 'Urgent: Stage 2 Hypertension - Maria Garcia',
    description: 'Patient shows Stage 2 hypertension. Immediate intervention required. Contact patient within 24 hours.',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: new Date('2024-06-16'),
    completedAt: null,
    createdAt: new Date('2024-06-14'),
  },
  {
    id: 3,
    patientId: 4,
    assignedTo: 2,
    title: 'Emergency Follow-up - David Miller',
    description: 'Patient had critical BP reading with chest pain. Ensure medical evaluation completed and follow-up scheduled.',
    priority: 'urgent',
    status: 'pending',
    dueDate: new Date('2024-06-17'),
    completedAt: null,
    createdAt: new Date('2024-06-16'),
  },
  {
    id: 4,
    patientId: 5,
    assignedTo: 3,
    title: 'Lifestyle Counseling - Jennifer Davis',
    description: 'Patient shows elevated readings. Provide counseling on diet, exercise, and stress management.',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date('2024-06-22'),
    completedAt: null,
    createdAt: new Date('2024-06-11'),
  },
]

export const mockCommunicationLogs: CommunicationLog[] = [
  {
    id: 1,
    patientId: 1,
    userId: 2,
    type: 'call',
    message: 'Called patient regarding elevated BP reading. Discussed dietary changes and exercise routine.',
    notes: 'Patient receptive to recommendations. Scheduled follow-up in 2 weeks.',
    outcome: 'resolved',
    followUpDate: new Date('2024-06-29'),
    createdAt: new Date('2024-06-15T16:30:00'),
  },
  {
    id: 2,
    patientId: 2,
    userId: 3,
    type: 'call',
    message: 'Attempted to contact patient about Stage 2 hypertension reading.',
    notes: 'No answer. Left voicemail requesting callback.',
    outcome: 'no_answer',
    followUpDate: new Date('2024-06-16'),
    createdAt: new Date('2024-06-14T17:45:00'),
  },
  {
    id: 3,
    patientId: 4,
    userId: 2,
    type: 'visit',
    message: 'In-person consultation following emergency BP reading and chest pain episode.',
    notes: 'Patient referred to cardiologist. Medication review scheduled. Patient understanding good.',
    outcome: 'escalated',
    followUpDate: new Date('2024-06-18'),
    createdAt: new Date('2024-06-16T18:15:00'),
  },
  {
    id: 4,
    patientId: 5,
    userId: 3,
    type: 'email',
    message: 'Sent educational materials about hypertension management and lifestyle modifications.',
    notes: 'Patient replied with questions about exercise recommendations.',
    outcome: 'scheduled',
    followUpDate: new Date('2024-06-20'),
    createdAt: new Date('2024-06-12T09:30:00'),
  },
]

// Current user for authentication
export const currentUser: User = mockUsers[1] // Sarah Johnson (nurse)

// Mock API functions to replace actual API calls
export const mockApi = {
  // Authentication
  getCurrentUser: async (): Promise<User> => {
    return Promise.resolve(currentUser)
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    return Promise.resolve(mockUsers)
  },

  // Patients
  getPatients: async (): Promise<Patient[]> => {
    return Promise.resolve(mockPatients)
  },

  getPatient: async (id: number): Promise<Patient | null> => {
    const patient = mockPatients.find(p => p.id === id)
    return Promise.resolve(patient || null)
  },

  createPatient: async (patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> => {
    const newPatient: Patient = {
      ...patient,
      id: Math.max(...mockPatients.map(p => p.id)) + 1,
      createdAt: new Date(),
    }
    mockPatients.push(newPatient)
    return Promise.resolve(newPatient)
  },

  // BP Readings
  getBpReadings: async (): Promise<BpReading[]> => {
    return Promise.resolve(mockBpReadings)
  },

  getBpReadingsByPatient: async (patientId: number): Promise<BpReading[]> => {
    const readings = mockBpReadings.filter(r => r.patientId === patientId)
    return Promise.resolve(readings)
  },

  createBpReading: async (reading: Omit<BpReading, 'id' | 'recordedAt' | 'isAbnormal' | 'category'>): Promise<BpReading> => {
    const newReading: BpReading = {
      ...reading,
      id: Math.max(...mockBpReadings.map(r => r.id)) + 1,
      recordedAt: new Date(),
      isAbnormal: reading.systolic >= 130 || reading.diastolic >= 80,
      category: categorizeBP(reading.systolic, reading.diastolic),
    }
    mockBpReadings.push(newReading)
    return Promise.resolve(newReading)
  },

  // Workflow Tasks
  getWorkflowTasks: async (): Promise<WorkflowTask[]> => {
    return Promise.resolve(mockWorkflowTasks)
  },

  getWorkflowTasksByAssignee: async (userId: number): Promise<WorkflowTask[]> => {
    const tasks = mockWorkflowTasks.filter(t => t.assignedTo === userId)
    return Promise.resolve(tasks)
  },

  createWorkflowTask: async (task: Omit<WorkflowTask, 'id' | 'createdAt'>): Promise<WorkflowTask> => {
    const newTask: WorkflowTask = {
      ...task,
      id: Math.max(...mockWorkflowTasks.map(t => t.id)) + 1,
      createdAt: new Date(),
    }
    mockWorkflowTasks.push(newTask)
    return Promise.resolve(newTask)
  },

  updateWorkflowTask: async (id: number, updates: Partial<WorkflowTask>): Promise<WorkflowTask | null> => {
    const taskIndex = mockWorkflowTasks.findIndex(t => t.id === id)
    if (taskIndex === -1) return Promise.resolve(null)
    
    mockWorkflowTasks[taskIndex] = { ...mockWorkflowTasks[taskIndex], ...updates }
    return Promise.resolve(mockWorkflowTasks[taskIndex])
  },

  // Communication Logs
  getCommunicationLogs: async (): Promise<CommunicationLog[]> => {
    return Promise.resolve(mockCommunicationLogs)
  },

  getCommunicationLogsByPatient: async (patientId: number): Promise<CommunicationLog[]> => {
    const logs = mockCommunicationLogs.filter(l => l.patientId === patientId)
    return Promise.resolve(logs)
  },

  createCommunicationLog: async (log: Omit<CommunicationLog, 'id' | 'createdAt'>): Promise<CommunicationLog> => {
    const newLog: CommunicationLog = {
      ...log,
      id: Math.max(...mockCommunicationLogs.map(l => l.id)) + 1,
      createdAt: new Date(),
    }
    mockCommunicationLogs.push(newLog)
    return Promise.resolve(newLog)
  },
}

// Helper function for BP categorization
function categorizeBP(systolic: number, diastolic: number): BpReading['category'] {
  if (systolic < 90 || diastolic < 60) return 'low'
  if (systolic >= 180 || diastolic >= 120) return 'crisis'
  if (systolic >= 140 || diastolic >= 90) return 'stage2'
  if (systolic >= 130 || diastolic >= 80) return 'stage1'
  if (systolic >= 120 && diastolic < 80) return 'elevated'
  return 'normal'
}