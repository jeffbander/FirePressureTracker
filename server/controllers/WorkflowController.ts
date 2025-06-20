import { Request, Response } from "express";
import { WorkflowService } from "../services/WorkflowService";
import { MemStorage } from "../storage";

export class WorkflowController {
  private workflowService: WorkflowService;

  constructor() {
    const storage = new MemStorage();
    this.workflowService = new WorkflowService(storage);
  }

  // Get all workflow tasks with filtering
  public async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      const { status, priority, assignedTo } = req.query;
      let tasks = await this.workflowService.getAllTasks();

      // Apply filters
      if (status && status !== 'all') {
        tasks = tasks.filter(task => task.status === status);
      }

      if (priority && priority !== 'all') {
        tasks = tasks.filter(task => task.priority === priority);
      }

      if (assignedTo) {
        const assignedToNum = parseInt(assignedTo as string);
        if (!isNaN(assignedToNum)) {
          tasks = tasks.filter(task => task.assignedTo === assignedToNum);
        }
      }

      res.json({
        success: true,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      console.error('Get all tasks error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch workflow tasks"
      });
    }
  }

  // Get priority tasks
  public async getPriorityTasks(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this.workflowService.getPriorityTasks();

      res.json({
        success: true,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      console.error('Get priority tasks error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch priority tasks"
      });
    }
  }

  // Get overdue tasks
  public async getOverdueTasks(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this.workflowService.getOverdueTasks();

      res.json({
        success: true,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      console.error('Get overdue tasks error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch overdue tasks"
      });
    }
  }

  // Get tasks by user
  public async getTasksByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const userIdNum = parseInt(userId);

      if (isNaN(userIdNum)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID"
        });
        return;
      }

      const tasks = await this.workflowService.getTasksByAssignee(userIdNum);

      res.json({
        success: true,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      console.error('Get tasks by user error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user tasks"
      });
    }
  }

  // Get tasks by patient
  public async getTasksByPatient(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const patientIdNum = parseInt(patientId);

      if (isNaN(patientIdNum)) {
        res.status(400).json({
          success: false,
          message: "Invalid patient ID"
        });
        return;
      }

      const tasks = await this.workflowService.getTasksByPatient(patientIdNum);

      res.json({
        success: true,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      console.error('Get tasks by patient error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch patient tasks"
      });
    }
  }

  // Create new workflow task
  public async createTask(req: Request, res: Response): Promise<void> {
    try {
      const taskData = req.body;

      // Validate required fields
      if (!taskData.patientId || !taskData.title || !taskData.priority) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: patientId, title, priority"
        });
        return;
      }

      const newTask = await this.workflowService.createTaskForAbnormalReading(
        taskData.bpReading,
        taskData.patient
      );

      res.status(201).json({
        success: true,
        data: newTask,
        message: "Workflow task created successfully"
      });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to create workflow task"
      });
    }
  }

  // Update task status
  public async updateTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, completedBy } = req.body;
      const taskId = parseInt(id);

      if (isNaN(taskId)) {
        res.status(400).json({
          success: false,
          message: "Invalid task ID"
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          success: false,
          message: "Status is required"
        });
        return;
      }

      const updatedTask = await this.workflowService.updateTaskStatus(
        taskId,
        status,
        completedBy
      );

      if (!updatedTask) {
        res.status(404).json({
          success: false,
          message: "Task not found"
        });
        return;
      }

      res.json({
        success: true,
        data: updatedTask,
        message: "Task status updated successfully"
      });
    } catch (error) {
      console.error('Update task status error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to update task status"
      });
    }
  }

  // Assign task to user
  public async assignTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const taskId = parseInt(id);

      if (isNaN(taskId)) {
        res.status(400).json({
          success: false,
          message: "Invalid task ID"
        });
        return;
      }

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "User ID is required"
        });
        return;
      }

      const updatedTask = await this.workflowService.assignTask(taskId, userId);

      if (!updatedTask) {
        res.status(404).json({
          success: false,
          message: "Task not found"
        });
        return;
      }

      res.json({
        success: true,
        data: updatedTask,
        message: "Task assigned successfully"
      });
    } catch (error) {
      console.error('Assign task error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to assign task"
      });
    }
  }

  // Get task statistics
  public async getTaskStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.workflowService.getTaskStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Get task statistics error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch task statistics"
      });
    }
  }

  // Escalate overdue tasks
  public async escalateOverdueTasks(req: Request, res: Response): Promise<void> {
    try {
      const escalatedTasks = await this.workflowService.escalateOverdueTasks();

      res.json({
        success: true,
        data: escalatedTasks,
        count: escalatedTasks.length,
        message: `${escalatedTasks.length} tasks escalated successfully`
      });
    } catch (error) {
      console.error('Escalate tasks error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to escalate overdue tasks"
      });
    }
  }
}