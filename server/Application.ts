import { Express } from "express";
import { AuthController } from "./controllers/AuthController";
import { PatientController } from "./controllers/PatientController";
import { BpReadingController } from "./controllers/BpReadingController";
import { WorkflowController } from "./controllers/WorkflowController";
import { DashboardController } from "./controllers/DashboardController";

/**
 * Main Application Class - Orchestrates all controllers and services
 * Implements Dependency Injection and Single Responsibility principles
 */
export class Application {
  private authController: AuthController;
  private patientController: PatientController;
  private bpReadingController: BpReadingController;
  private workflowController: WorkflowController;
  private dashboardController: DashboardController;

  constructor() {
    // Initialize all controllers with dependency injection
    this.authController = new AuthController();
    this.patientController = new PatientController();
    this.bpReadingController = new BpReadingController();
    this.workflowController = new WorkflowController();
    this.dashboardController = new DashboardController();
  }

  /**
   * Register all application routes using object-oriented controllers
   */
  public registerRoutes(app: Express): void {
    // Authentication routes
    app.post("/api/auth/login", this.authController.login.bind(this.authController));
    app.post("/api/auth/logout", this.authController.logout.bind(this.authController));
    app.post("/api/auth/validate", this.authController.validateSession.bind(this.authController));
    app.post("/api/auth/permission", this.authController.checkPermission.bind(this.authController));

    // Dashboard routes
    app.get("/api/dashboard/stats", this.dashboardController.getStats.bind(this.dashboardController));
    app.get("/api/dashboard/alerts", this.dashboardController.getAlerts.bind(this.dashboardController));
    app.get("/api/dashboard/recent", this.dashboardController.getRecentActivity.bind(this.dashboardController));

    // Patient routes
    app.get("/api/patients", this.patientController.getAllPatients.bind(this.patientController));
    app.get("/api/patients/priority", this.patientController.getPatientsWithAbnormalReadings.bind(this.patientController));
    app.get("/api/patients/checkup", this.patientController.getPatientsNeedingCheckup.bind(this.patientController));
    app.get("/api/patients/stats", this.patientController.getPatientStatistics.bind(this.patientController));
    app.get("/api/patients/:id", this.patientController.getPatientById.bind(this.patientController));
    app.post("/api/patients", this.patientController.createPatient.bind(this.patientController));
    app.patch("/api/patients/:id", this.patientController.updatePatient.bind(this.patientController));

    // BP Reading routes
    app.get("/api/bp-readings", this.bpReadingController.getAllReadings.bind(this.bpReadingController));
    app.get("/api/bp-readings/abnormal", this.bpReadingController.getAbnormalReadings.bind(this.bpReadingController));
    app.get("/api/bp-readings/patient/:patientId", this.bpReadingController.getReadingsByPatient.bind(this.bpReadingController));
    app.get("/api/bp-readings/trends/:patientId", this.bpReadingController.getTrends.bind(this.bpReadingController));
    app.post("/api/bp-readings", this.bpReadingController.createReading.bind(this.bpReadingController));

    // Workflow routes
    app.get("/api/workflow/tasks", this.workflowController.getAllTasks.bind(this.workflowController));
    app.get("/api/workflow/tasks/priority", this.workflowController.getPriorityTasks.bind(this.workflowController));
    app.get("/api/workflow/tasks/overdue", this.workflowController.getOverdueTasks.bind(this.workflowController));
    app.get("/api/workflow/tasks/user/:userId", this.workflowController.getTasksByUser.bind(this.workflowController));
    app.get("/api/workflow/tasks/patient/:patientId", this.workflowController.getTasksByPatient.bind(this.workflowController));
    app.get("/api/workflow/stats", this.workflowController.getTaskStatistics.bind(this.workflowController));
    app.post("/api/workflow/tasks", this.workflowController.createTask.bind(this.workflowController));
    app.patch("/api/workflow/tasks/:id/status", this.workflowController.updateTaskStatus.bind(this.workflowController));
    app.patch("/api/workflow/tasks/:id/assign", this.workflowController.assignTask.bind(this.workflowController));
    app.post("/api/workflow/escalate", this.workflowController.escalateOverdueTasks.bind(this.workflowController));
  }

  /**
   * Get application health status
   */
  public getHealthStatus(): { status: string; timestamp: Date; services: Record<string, boolean> } {
    return {
      status: 'healthy',
      timestamp: new Date(),
      services: {
        authentication: true,
        patients: true,
        bpReadings: true,
        workflow: true,
        dashboard: true
      }
    };
  }
}