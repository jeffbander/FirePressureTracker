import { WorkflowTask as WorkflowTaskType } from "@shared/schema";

export class WorkflowTask {
  public id: number;
  public patientId: number;
  public assignedTo: number | null;
  public title: string;
  public description: string | null;
  public priority: 'low' | 'medium' | 'high' | 'urgent';
  public status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  public dueDate: Date | null;
  public completedAt: Date | null;
  public createdAt: Date;

  constructor(data: WorkflowTaskType) {
    this.id = data.id;
    this.patientId = data.patientId;
    this.assignedTo = data.assignedTo;
    this.title = data.title;
    this.description = data.description;
    this.priority = data.priority;
    this.status = data.status;
    this.dueDate = data.dueDate;
    this.completedAt = data.completedAt;
    this.createdAt = data.createdAt;
  }

  // Check if task is overdue
  public isOverdue(): boolean {
    if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
      return false;
    }
    return this.dueDate < new Date();
  }

  // Check if task is due today
  public isDueToday(): boolean {
    if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
      return false;
    }
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.dueDate >= today && this.dueDate < tomorrow;
  }

  // Check if task is high priority
  public isHighPriority(): boolean {
    return this.priority === 'urgent' || this.priority === 'high';
  }

  // Check if task is active (not completed or cancelled)
  public isActive(): boolean {
    return this.status !== 'completed' && this.status !== 'cancelled';
  }

  // Get days until due date
  public getDaysUntilDue(): number | null {
    if (!this.dueDate) return null;
    
    const today = new Date();
    const diffTime = this.dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Get priority weight for sorting
  public getPriorityWeight(): number {
    switch (this.priority) {
      case 'urgent': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  // Mark task as completed
  public complete(): void {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  // Mark task as in progress
  public start(): void {
    if (this.status === 'pending') {
      this.status = 'in_progress';
    }
  }

  // Cancel task
  public cancel(): void {
    this.status = 'cancelled';
  }

  // Update priority
  public updatePriority(newPriority: 'low' | 'medium' | 'high' | 'urgent'): void {
    this.priority = newPriority;
  }

  // Get formatted status display
  public getStatusDisplay(): string {
    switch (this.status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return this.status;
    }
  }

  // Get formatted priority display
  public getPriorityDisplay(): string {
    switch (this.priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return this.priority;
    }
  }

  // Get time since creation
  public getTimeSinceCreation(): string {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  }

  // Check if task can be assigned to a user role
  public canBeAssignedTo(userRole: string): boolean {
    // Urgent tasks can be assigned to nurses or admins
    if (this.priority === 'urgent') {
      return userRole === 'nurse' || userRole === 'admin';
    }
    
    // High priority tasks to nurses, coaches, or admins
    if (this.priority === 'high') {
      return userRole === 'nurse' || userRole === 'coach' || userRole === 'admin';
    }
    
    // Medium and low priority can be assigned to any role
    return true;
  }
}