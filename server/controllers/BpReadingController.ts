import { Request, Response } from "express";
import { BpReadingService } from "../services/BpReadingService";
import { PatientService } from "../services/PatientService";
import { WorkflowService } from "../services/WorkflowService";
import { MemStorage } from "../storage";
import { insertBpReadingSchema } from "@shared/schema";

export class BpReadingController {
  private bpReadingService: BpReadingService;
  private patientService: PatientService;
  private workflowService: WorkflowService;

  constructor() {
    const storage = new MemStorage();
    this.patientService = new PatientService(storage);
    this.workflowService = new WorkflowService(storage);
    this.bpReadingService = new BpReadingService(storage, this.patientService, this.workflowService);
  }

  // Get all BP readings with filtering
  public async getAllReadings(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50 } = req.query;
      const readings = await this.bpReadingService.getRecentReadings(parseInt(limit as string));

      res.json({
        success: true,
        data: readings,
        count: readings.length
      });
    } catch (error) {
      console.error('Get all readings error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch BP readings"
      });
    }
  }

  // Get abnormal BP readings
  public async getAbnormalReadings(req: Request, res: Response): Promise<void> {
    try {
      const readings = await this.bpReadingService.getAbnormalReadings();

      res.json({
        success: true,
        data: readings,
        count: readings.length
      });
    } catch (error) {
      console.error('Get abnormal readings error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch abnormal readings"
      });
    }
  }

  // Get BP readings for specific patient
  public async getReadingsByPatient(req: Request, res: Response): Promise<void> {
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

      const readings = await this.bpReadingService.getReadingsByPatient(patientIdNum);

      res.json({
        success: true,
        data: readings,
        count: readings.length
      });
    } catch (error) {
      console.error('Get readings by patient error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch patient readings"
      });
    }
  }

  // Get BP trends for patient
  public async getTrends(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const { days = 30 } = req.query;
      const patientIdNum = parseInt(patientId);
      const daysNum = parseInt(days as string);

      if (isNaN(patientIdNum)) {
        res.status(400).json({
          success: false,
          message: "Invalid patient ID"
        });
        return;
      }

      const trends = await this.bpReadingService.analyzeTrends(patientIdNum, daysNum);

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Get trends error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to analyze BP trends"
      });
    }
  }

  // Create new BP reading
  public async createReading(req: Request, res: Response): Promise<void> {
    try {
      const readingData = req.body;

      // Validate input data
      const validation = insertBpReadingSchema.safeParse(readingData);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid reading data",
          errors: validation.error.errors
        });
        return;
      }

      // Verify patient exists
      const patient = await this.patientService.getPatientById(readingData.patientId);
      if (!patient) {
        res.status(404).json({
          success: false,
          message: "Patient not found"
        });
        return;
      }

      // Create reading (will automatically create workflow task if abnormal)
      const newReading = await this.bpReadingService.createBpReading(validation.data);

      res.status(201).json({
        success: true,
        data: newReading,
        message: `BP reading created successfully${newReading.isAbnormal ? ' - Workflow task generated' : ''}`
      });
    } catch (error) {
      console.error('Create reading error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to create BP reading"
      });
    }
  }

  // Get dashboard statistics for BP readings
  public async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.bpReadingService.getDashboardStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch BP reading statistics"
      });
    }
  }
}