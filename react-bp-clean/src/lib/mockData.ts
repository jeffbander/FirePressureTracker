export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  createdAt: Date;
}

export interface Patient {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  department: string;
  union?: string;
  dateOfBirth?: Date;
  age?: number;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  createdAt: Date;
}

export interface BpReading {
  id: number;
  patientId: number;
  systolic: number;
  diastolic: number;
  pulse?: number;
  category: string;
  isAbnormal: boolean;
  notes?: string;
  recordedBy: number;
  recordedAt: Date;
}

export interface WorkflowTask {
  id: number;
  patientId: number;
  assignedTo?: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface CommunicationLog {
  id: number;
  patientId: number;
  userId: number;
  type: 'call' | 'email' | 'text' | 'in_person' | 'other';
  message: string;
  outcome?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  createdAt: Date;
}

// Mock data
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    name: 'Sarah Johnson',
    role: 'admin',
    email: 'sarah.johnson@firedept.gov',
    phone: '555-0101',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    username: 'nurse.martinez',
    name: 'Maria Martinez',
    role: 'nurse',
    email: 'maria.martinez@firedept.gov',
    phone: '555-0102',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 3,
    username: 'coach.williams',
    name: 'David Williams',
    role: 'coach',
    email: 'david.williams@firedept.gov',
    phone: '555-0103',
    createdAt: new Date('2024-02-01'),
  },
];

export const mockPatients: Patient[] = [
  {
    id: 1,
    employeeId: 'FF001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@firedept.gov',
    phone: '555-0201',
    department: 'Engine Company 1',
    union: 'IAFF Local 123',
    dateOfBirth: new Date('1985-03-15'),
    age: 39,
    emergencyContact: 'Jane Smith',
    emergencyPhone: '555-0301',
    medicalNotes: 'History of hypertension, on medication',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 2,
    employeeId: 'FF002',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@firedept.gov',
    phone: '555-0202',
    department: 'Ladder Company 2',
    union: 'IAFF Local 123',
    dateOfBirth: new Date('1978-07-22'),
    age: 46,
    emergencyContact: 'Lisa Johnson',
    emergencyPhone: '555-0302',
    createdAt: new Date('2024-01-12'),
  },
  {
    id: 3,
    employeeId: 'FF003',
    firstName: 'Robert',
    lastName: 'Davis',
    email: 'robert.davis@firedept.gov',
    phone: '555-0203',
    department: 'Engine Company 3',
    union: 'IAFF Local 123',
    dateOfBirth: new Date('1990-11-08'),
    age: 34,
    emergencyContact: 'Susan Davis',
    emergencyPhone: '555-0303',
    medicalNotes: 'Regular exercise routine, no known conditions',
    createdAt: new Date('2024-01-15'),
  },
];

export const mockBpReadings: BpReading[] = [
  {
    id: 1,
    patientId: 1,
    systolic: 148,
    diastolic: 95,
    pulse: 82,
    category: 'stage_1_hypertension',
    isAbnormal: true,
    notes: 'Patient reported stress at work',
    recordedBy: 2,
    recordedAt: new Date('2024-06-15T10:30:00'),
  },
  {
    id: 2,
    patientId: 1,
    systolic: 142,
    diastolic: 88,
    pulse: 78,
    category: 'stage_1_hypertension',
    isAbnormal: true,
    recordedBy: 2,
    recordedAt: new Date('2024-06-10T14:15:00'),
  },
  {
    id: 3,
    patientId: 2,
    systolic: 165,
    diastolic: 102,
    pulse: 88,
    category: 'stage_2_hypertension',
    isAbnormal: true,
    notes: 'Urgent follow-up required',
    recordedBy: 2,
    recordedAt: new Date('2024-06-16T09:20:00'),
  },
  {
    id: 4,
    patientId: 3,
    systolic: 118,
    diastolic: 76,
    pulse: 72,
    category: 'normal',
    isAbnormal: false,
    recordedBy: 2,
    recordedAt: new Date('2024-06-14T11:45:00'),
  },
];

export const mockWorkflowTasks: WorkflowTask[] = [
  {
    id: 1,
    patientId: 1,
    assignedTo: 3,
    title: 'Health Coaching Follow-up - John Smith',
    description: 'Stage 1 hypertension detected. Provide lifestyle counseling and schedule follow-up.',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date('2024-06-20'),
    createdAt: new Date('2024-06-15T10:35:00'),
  },
  {
    id: 2,
    patientId: 2,
    assignedTo: 2,
    title: 'Urgent Nurse Consultation - Michael Johnson',
    description: 'Stage 2 hypertension reading (165/102). Immediate medical evaluation required.',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: new Date('2024-06-17'),
    createdAt: new Date('2024-06-16T09:25:00'),
  },
];

export const mockCommunicationLogs: CommunicationLog[] = [
  {
    id: 1,
    patientId: 1,
    userId: 3,
    type: 'call',
    message: 'Discussed stress management techniques and dietary changes. Patient receptive to lifestyle modifications.',
    outcome: 'positive',
    followUpRequired: true,
    followUpDate: new Date('2024-06-25'),
    createdAt: new Date('2024-06-16T15:30:00'),
  },
  {
    id: 2,
    patientId: 2,
    userId: 2,
    type: 'call',
    message: 'Left voicemail regarding urgent BP reading. Requested immediate callback.',
    outcome: 'no_response',
    followUpRequired: true,
    followUpDate: new Date('2024-06-17'),
    createdAt: new Date('2024-06-16T16:45:00'),
  },
];