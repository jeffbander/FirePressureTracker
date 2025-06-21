import { Request, Response } from "express";
import { PatientService } from "../services/PatientService";
import { BpReadingService } from "../services/BpReadingService";
import { WorkflowService } from "../services/WorkflowService";
import { MemStorage } from "../storage";

export class DashboardController {
  private patientService: PatientService;
  private bpReadingService: BpReadingService;
  private workflowService: WorkflowService;

  constructor() {
    const storage = new MemStorage();
    this.patientService = new PatientService(storage);
    this.workflowService = new WorkflowService(storage);
    this.bpReadingService = new BpReadingService(storage, this.patientService, this.workflowService);
  }

  // Get comprehensive dashboard statistics
  public async getStats(req: Request, res: Response): Promise<void> {
    try {
      // Get statistics from all services
      const [
        patientStats,
        bpStats,
        workflowStats
      ] = await Promise.all([
        this.patientService.getPatientStatistics(),
        this.bpReadingService.getDashboardStats(),
        this.workflowService.getTaskStatistics()
      ]);

      // Combine all statistics
      const dashboardStats = {
        patients: {
          total: patientStats.totalPatients,
          needingCheckup: patientStats.needingCheckup,
          withAbnormalReadings: patientStats.withAbnormalReadings,
          byDepartment: patientStats.byDepartment,
          byUnion: patientStats.byUnion
        },
        bpReadings: {
          total: bpStats.totalReadings,
          abnormal: bpStats.abnormalReadings,
          today: bpStats.todayReadings,
          hypertensiveCrisis: bpStats.hypertensiveCrisisCount,
          averages: {
            systolic: bpStats.averageSystolic,
            diastolic: bpStats.averageDiastolic
          }
        },
        workflow: {
          total: workflowStats.total,
          overdue: workflowStats.overdue,
          dueToday: workflowStats.dueToday,
          byStatus: workflowStats.byStatus,
          byPriority: workflowStats.byPriority
        },
        alerts: {
          urgentTasks: workflowStats.byPriority.urgent || 0,
          overdueTasks: workflowStats.overdue,
          hypertensiveCrisis: bpStats.hypertensiveCrisisCount,
          patientsNeedingCheckup: patientStats.needingCheckup
        }
      };

      res.json({
        success: true,
        data: dashboardStats
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics"
      });
    }
  }

  // Get dashboard alerts and priority items
  public async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const [
        priorityTasks,
        overdueTasks,
        abnormalReadings,
        patientsNeedingCheckup
      ] = await Promise.all([
        this.workflowService.getPriorityTasks(),
        this.workflowService.getOverdueTasks(),
        this.bpReadingService.getAbnormalReadings(),
        this.patientService.getPatientsNeedingCheckup()
      ]);

      // Filter recent abnormal readings (last 24 hours)
      const recentAbnormal = abnormalReadings.filter(reading => 
        reading.isRecent(24)
      );

      const alerts = {
        urgentTasks: priorityTasks.filter(task => task.priority === 'urgent'),
        overdueTasks: overdueTasks,
        recentAbnormalReadings: recentAbnormal.slice(0, 10),
        patientsNeedingCheckup: patientsNeedingCheckup.slice(0, 5),
        summary: {
          totalAlerts: priorityTasks.length + overdueTasks.length + recentAbnormal.length,
          urgentCount: priorityTasks.filter(task => task.priority === 'urgent').length,
          overdueCount: overdueTasks.length,
          abnormalReadingsToday: recentAbnormal.length
        }
      };

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Get dashboard alerts error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard alerts"
      });
    }
  }

  // Get recent activity across the system
  public async getRecentActivity(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 20 } = req.query;
      const limitNum = parseInt(limit as string);

      const [
        recentReadings,
        recentTasks,
        abnormalReadings
      ] = await Promise.all([
        this.bpReadingService.getRecentReadings(limitNum),
        this.workflowService.getAllTasks(),
        this.bpReadingService.getAbnormalReadings()
      ]);

      // Get recent workflow tasks (created in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentWorkflowTasks = recentTasks
        .filter(task => task.createdAt >= sevenDaysAgo)
        .slice(0, limitNum);

      // Create activity timeline
      const activities = [
        ...recentReadings.map(reading => ({
          type: 'bp_reading',
          timestamp: reading.recordedAt,
          data: reading,
          priority: reading.isAbnormal ? 'high' : 'normal'
        })),
        ...recentWorkflowTasks.map(task => ({
          type: 'workflow_task',
          timestamp: task.createdAt,
          data: task,
          priority: task.priority
        }))
      ];

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const recentActivity = {
        activities: activities.slice(0, limitNum),
        summary: {
          totalActivities: activities.length,
          bpReadings: recentReadings.length,
          workflowTasks: recentWorkflowTasks.length,
          abnormalReadings: abnormalReadings.filter(r => r.isRecent(24)).length
        }
      };

      res.json({
        success: true,
        data: recentActivity
      });
    } catch (error) {
      console.error('Get recent activity error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recent activity"
      });
    }
  }

  // Get system health and performance metrics
  public async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      const [
        patientCount,
        readingCount,
        taskCount
      ] = await Promise.all([
        this.patientService.getAllPatients(),
        this.bpReadingService.getRecentReadings(1000),
        this.workflowService.getAllTasks()
      ]);

      const systemHealth = {
        status: 'healthy',
        timestamp: new Date(),
        metrics: {
          patients: {
            total: patientCount.length,
            active: patientCount.filter(p => !p.needsCheckup()).length
          },
          readings: {
            total: readingCount.length,
            today: readingCount.filter(r => r.isRecent(24)).length,
            abnormalRate: readingCount.length > 0 
              ? Math.round((readingCount.filter(r => r.isAbnormal).length / readingCount.length) * 100)
              : 0
          },
          workflow: {
            total: taskCount.length,
            active: taskCount.filter(t => t.isActive()).length,
            completionRate: taskCount.length > 0
              ? Math.round((taskCount.filter(t => t.status === 'completed').length / taskCount.length) * 100)
              : 0
          }
        },
        services: {
          authentication: true,
          patients: true,
          bpReadings: true,
          workflow: true,
          storage: true
        }
      };

      res.json({
        success: true,
        data: systemHealth
      });
    } catch (error) {
      console.error('Get system health error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch system health"
      });
    }
  }
}