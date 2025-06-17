export interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'nurse' | 'coach' | 'firefighter';
  email?: string;
  phone?: string;
  createdAt: Date;
}

export interface Patient {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  union: string;
  age: number;
  email?: string;
  phone?: string;
  emergencyContact?: string;
  medications?: string;
  allergies?: string;
  lastCheckup?: Date;
  customSystolicThreshold?: number;
  customDiastolicThreshold?: number;
  createdAt: Date;
}

export interface BpReading {
  id: number;
  patientId: number;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  notes?: string;
  recordedBy: number;
  recordedAt: Date;
  isAbnormal: boolean;
  category: 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis' | 'low';
}

export interface WorkflowTask {
  id: number;
  patientId: number;
  assignedTo: number;
  title: string;
  description: string;
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
  type: 'call' | 'email' | 'note' | 'visit';
  message: string;
  notes?: string;
  outcome?: 'resolved' | 'unresolved' | 'escalated' | 'no_answer' | 'scheduled';
  followUpDate?: Date;
  createdAt: Date;
}

export interface BPCategory {
  name: string;
  code: string;
  color: string;
  priority: number;
  isAbnormal: boolean;
}