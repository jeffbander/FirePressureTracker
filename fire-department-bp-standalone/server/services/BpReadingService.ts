import { BpReading } from "../models/BpReading";
import { Patient } from "../models/Patient";
import { PatientService } from "./PatientService";
import { WorkflowService } from "./WorkflowService";
import { MemStorage } from "../storage";
import { InsertBpReading } from "@shared/schema";

export class BpReadingService {
  private storage: MemStorage;
  private patientService: PatientService;
  private workflowService: WorkflowService;

  constructor(storage: MemStorage, patientService: PatientService, workflowService: WorkflowService) {
    this.storage = storage;
    this.patientService = patientService;
    this.workflowService = workflowService;
  }

  // Create new BP reading with automatic workflow generation
  public async createBpReading(readingData: InsertBpReading): Promise<BpReading> {
    // Get patient to check custom thresholds
    const patient = await this.patientService.getPatientById(readingData.patientId);
    if (!patient) {
      throw new Error(`Patient with ID ${readingData.patientId} not found`);
    }

    // Create reading with proper categorization
    const readingToCreate = BpReading.create(
      readingData.patientId,
      readingData.systolic,
      readingData.diastolic,
      readingData.recordedBy,
      readingData.heartRate || undefined,
      readingData.notes || undefined,
      patient.customSystolicThreshold || undefined,
      patient.customDiastolicThreshold || undefined
    );

    // Save to storage
    const createdReading = await this.storage.createBpReading(readingToCreate);
    const bpReading = new BpReading(createdReading);

    // Generate workflow task if reading is abnormal
    if (bpReading.isAbnormal) {
      await this.workflowService.createTaskForAbnormalReading(bpReading, patient);
    }

    return bpReading;
  }

  // Get BP readings for a patient
  public async getReadingsByPatient(patientId: number): Promise<BpReading[]> {
    const readings = await this.storage.getBpReadingsByPatient(patientId);
    return readings.map(reading => new BpReading(reading));
  }

  // Get all abnormal readings
  public async getAbnormalReadings(): Promise<BpReading[]> {
    const readings = await this.storage.getAbnormalReadings();
    return readings.map(reading => new BpReading(reading));
  }

  // Get recent readings
  public async getRecentReadings(limit: number = 10): Promise<BpReading[]> {
    const readings = await this.storage.getRecentReadings(limit);
    return readings.map(reading => new BpReading(reading));
  }

  // Analyze BP trends for a patient
  public async analyzeTrends(patientId: number, days: number = 30): Promise<{
    readings: BpReading[];
    trend: 'improving' | 'worsening' | 'stable';
    averageSystolic: number;
    averageDiastolic: number;
    riskLevel: 'low' | 'medium' | 'high' | 'urgent';
  }> {
    const allReadings = await this.getReadingsByPatient(patientId);
    
    // Filter readings within specified days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentReadings = allReadings.filter(reading => 
      reading.recordedAt >= cutoffDate
    );

    if (recentReadings.length === 0) {
      return {
        readings: [],
        trend: 'stable',
        averageSystolic: 0,
        averageDiastolic: 0,
        riskLevel: 'low'
      };
    }

    // Calculate averages
    const totalSystolic = recentReadings.reduce((sum, r) => sum + r.systolic, 0);
    const totalDiastolic = recentReadings.reduce((sum, r) => sum + r.diastolic, 0);
    const averageSystolic = Math.round(totalSystolic / recentReadings.length);
    const averageDiastolic = Math.round(totalDiastolic / recentReadings.length);

    // Determine trend (compare first half vs second half)
    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    if (recentReadings.length >= 4) {
      const midPoint = Math.floor(recentReadings.length / 2);
      const firstHalf = recentReadings.slice(0, midPoint);
      const secondHalf = recentReadings.slice(midPoint);

      const firstAvgSystolic = firstHalf.reduce((sum, r) => sum + r.systolic, 0) / firstHalf.length;
      const secondAvgSystolic = secondHalf.reduce((sum, r) => sum + r.systolic, 0) / secondHalf.length;

      const systolicChange = secondAvgSystolic - firstAvgSystolic;
      if (systolicChange > 5) {
        trend = 'worsening';
      } else if (systolicChange < -5) {
        trend = 'improving';
      }
    }

    // Determine overall risk level
    const highestRisk = recentReadings.reduce((maxRisk, reading) => {
      const readingRisk = reading.getRiskLevel();
      const riskOrder = { low: 0, medium: 1, high: 2, urgent: 3 };
      return riskOrder[readingRisk] > riskOrder[maxRisk] ? readingRisk : maxRisk;
    }, 'low' as 'low' | 'medium' | 'high' | 'urgent');

    return {
      readings: recentReadings,
      trend,
      averageSystolic,
      averageDiastolic,
      riskLevel: highestRisk
    };
  }

  // Get dashboard statistics
  public async getDashboardStats(): Promise<{
    totalReadings: number;
    abnormalReadings: number;
    todayReadings: number;
    hypertensiveCrisisCount: number;
    averageSystolic: number;
    averageDiastolic: number;
  }> {
    const recentReadings = await this.getRecentReadings(100);
    const abnormalReadings = await this.getAbnormalReadings();
    
    const today = new Date();
    const todayReadings = recentReadings.filter(reading => 
      reading.recordedAt.toDateString() === today.toDateString()
    );

    const hypertensiveCrisisCount = recentReadings.filter(reading => 
      reading.isHypertensiveCrisis()
    ).length;

    const totalSystolic = recentReadings.reduce((sum, r) => sum + r.systolic, 0);
    const totalDiastolic = recentReadings.reduce((sum, r) => sum + r.diastolic, 0);
    const averageSystolic = recentReadings.length > 0 ? Math.round(totalSystolic / recentReadings.length) : 0;
    const averageDiastolic = recentReadings.length > 0 ? Math.round(totalDiastolic / recentReadings.length) : 0;

    return {
      totalReadings: recentReadings.length,
      abnormalReadings: abnormalReadings.length,
      todayReadings: todayReadings.length,
      hypertensiveCrisisCount,
      averageSystolic,
      averageDiastolic
    };
  }
}