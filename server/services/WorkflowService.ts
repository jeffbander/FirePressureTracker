import { WorkflowTask } from "../models/WorkflowTask";
import { BpReading } from "../models/BpReading";
import { Patient } from "../models/Patient";
import { User } from "../models/User";
import { MemStorage } from "../storage";
import { InsertWorkflowTask } from "@shared/schema";
import { triageHypertensionCase, getWorkflowTaskTitle, getWorkflowTaskDescription } from "@shared/hypertension-workflow";

export class WorkflowService {
  private storage: MemStorage;

  constructor(storage: MemStorage) {
    this.storage = storage;
  }

  // Create workflow task for abnormal BP reading
  public async createTaskForAbnormalReading(reading: BpReading, patient: Patient): Promise<WorkflowTask | null> {
    if (!reading.isAbnormal) {
      return null;
    }

    // Get triage result based on BP reading
    const triageResult = triageHypertensionCase(
      reading.systolic,
      reading.diastolic,
      reading.category as any
    );

    if (triageResult.action === 'no_action') {
      return null;
    }

    // Find appropriate assignee based on role
    const assignee = await this.findAssigneeByRole(triageResult.assigneeRole);

    const taskData: InsertWorkflowTask = {
      patientId: patient.id,
      assignedTo: assignee?.id || null,
      title: getWorkflowTaskTitle(triageResult, patient.getFullName()),
      description: getWorkflowTaskDescription(triageResult, reading.systolic, reading.diastolic, reading.category),
      priority: triageResult.priority,
      status: 'pending',
      dueDate: triageResult.dueDate
    };

    const createdTask = await this.storage.createWorkflowTask(taskData);
    return new WorkflowTask(createdTask);
  }

  // Get all workflow tasks
  public async getAllTasks(): Promise<WorkflowTask[]> {
    const tasks = await this.storage.getAllWorkflowTasks();
    return tasks.map(task => new WorkflowTask(task));
  }

  // Get tasks by assignee
  public async getTasksByAssignee(userId: number): Promise<WorkflowTask[]> {
    const tasks = await this.storage.getWorkflowTasksByAssignee(userId);
    return tasks.map(task => new WorkflowTask(task));
  }

  // Get tasks by patient
  public async getTasksByPatient(patientId: number): Promise<WorkflowTask[]> {
    const tasks = await this.storage.getWorkflowTasksByPatient(patientId);
    return tasks.map(task => new WorkflowTask(task));
  }

  // Update task status
  public async updateTaskStatus(taskId: number, status: string, completedBy?: number): Promise<WorkflowTask | null> {
    const updates: any = { status };
    
    if (status === 'completed') {
      updates.completedAt = new Date();
      if (completedBy) {
        updates.completedBy = completedBy;
      }
    }

    const updatedTask = await this.storage.updateWorkflowTask(taskId, updates);
    return updatedTask ? new WorkflowTask(updatedTask) : null;
  }

  // Assign task to user
  public async assignTask(taskId: number, userId: number): Promise<WorkflowTask | null> {
    const updatedTask = await this.storage.updateWorkflowTask(taskId, { assignedTo: userId });
    return updatedTask ? new WorkflowTask(updatedTask) : null;
  }

  // Get task statistics
  public async getTaskStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    overdue: number;
    dueToday: number;
  }> {
    const allTasks = await this.getAllTasks();
    
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let overdue = 0;
    let dueToday = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    allTasks.forEach(task => {
      // Count by status
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;
      
      // Count by priority
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
      
      // Check if overdue or due today
      if (task.dueDate && task.status !== 'completed') {
        if (task.dueDate < today) {
          overdue++;
        } else if (task.dueDate >= today && task.dueDate < tomorrow) {
          dueToday++;
        }
      }
    });

    return {
      total: allTasks.length,
      byStatus,
      byPriority,
      overdue,
      dueToday
    };
  }

  // Get priority tasks (urgent and high priority)
  public async getPriorityTasks(): Promise<WorkflowTask[]> {
    const allTasks = await this.getAllTasks();
    return allTasks.filter(task => 
      (task.priority === 'urgent' || task.priority === 'high') && 
      task.status !== 'completed'
    );
  }

  // Get overdue tasks
  public async getOverdueTasks(): Promise<WorkflowTask[]> {
    const allTasks = await this.getAllTasks();
    const now = new Date();
    
    return allTasks.filter(task => 
      task.dueDate && 
      task.dueDate < now && 
      task.status !== 'completed'
    );
  }

  // Find assignee by role
  private async findAssigneeByRole(role: 'coach' | 'nurse' | null): Promise<User | null> {
    if (!role) return null;

    const allUsers = await this.storage.getAllUsers();
    const user = allUsers.find(u => u.role === role);
    return user ? new User(user) : null;
  }

  // Auto-escalate overdue tasks
  public async escalateOverdueTasks(): Promise<WorkflowTask[]> {
    const overdueTasks = await this.getOverdueTasks();
    const escalatedTasks: WorkflowTask[] = [];

    for (const task of overdueTasks) {
      // Escalate priority if not already urgent
      if (task.priority !== 'urgent') {
        const newPriority = task.priority === 'high' ? 'urgent' : 'high';
        const updatedTask = await this.storage.updateWorkflowTask(task.id, { 
          priority: newPriority 
        });
        
        if (updatedTask) {
          escalatedTasks.push(new WorkflowTask(updatedTask));
        }
      }
    }

    return escalatedTasks;
  }
}