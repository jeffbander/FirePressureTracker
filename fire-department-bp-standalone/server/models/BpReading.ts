import { BpReading as BpReadingType } from "@shared/schema";
import { categorizeBP, BP_CATEGORIES } from "@shared/bp-utils";

export class BpReading {
  public id: number;
  public patientId: number;
  public systolic: number;
  public diastolic: number;
  public heartRate?: number;
  public notes?: string;
  public recordedBy: number;
  public recordedAt: Date;
  public isAbnormal: boolean;
  public category: string;

  constructor(data: BpReadingType) {
    this.id = data.id;
    this.patientId = data.patientId;
    this.systolic = data.systolic;
    this.diastolic = data.diastolic;
    this.heartRate = data.heartRate;
    this.notes = data.notes;
    this.recordedBy = data.recordedBy;
    this.recordedAt = data.recordedAt;
    this.isAbnormal = data.isAbnormal;
    this.category = data.category;
  }

  // Calculate BP category using AHA guidelines
  public static calculateCategory(systolic: number, diastolic: number, customSystolic?: number, customDiastolic?: number): string {
    const category = categorizeBP(systolic, diastolic, customSystolic, customDiastolic);
    return category.code;
  }

  // Check if reading is considered abnormal
  public static isAbnormalReading(systolic: number, diastolic: number, customSystolic?: number, customDiastolic?: number): boolean {
    const category = categorizeBP(systolic, diastolic, customSystolic, customDiastolic);
    return category.isAbnormal;
  }

  // Get BP category display information
  public getCategoryInfo() {
    return BP_CATEGORIES[this.category] || BP_CATEGORIES.unknown;
  }

  // Check if this reading indicates hypertensive crisis
  public isHypertensiveCrisis(): boolean {
    return this.category === 'hypertensive_crisis';
  }

  // Check if this reading is within normal range
  public isNormal(): boolean {
    return this.category === 'normal';
  }

  // Get risk level for workflow prioritization
  public getRiskLevel(): 'low' | 'medium' | 'high' | 'urgent' {
    switch (this.category) {
      case 'normal':
        return 'low';
      case 'elevated':
        return 'low';
      case 'stage_1_hypertension':
        return 'medium';
      case 'stage_2_hypertension':
        return 'high';
      case 'hypertensive_crisis':
        return 'urgent';
      default:
        return 'medium';
    }
  }

  // Get formatted reading string
  public getFormattedReading(): string {
    const heartRateStr = this.heartRate ? ` (HR: ${this.heartRate})` : '';
    return `${this.systolic}/${this.diastolic}${heartRateStr}`;
  }

  // Check if reading was taken recently (within hours)
  public isRecent(hours: number = 24): boolean {
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);
    return this.recordedAt > hoursAgo;
  }

  // Compare with another reading to detect trends
  public compareTo(otherReading: BpReading): { systolicChange: number; diastolicChange: number; trend: 'improving' | 'worsening' | 'stable' } {
    const systolicChange = this.systolic - otherReading.systolic;
    const diastolicChange = this.diastolic - otherReading.diastolic;
    
    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    
    if (systolicChange > 5 || diastolicChange > 5) {
      trend = 'worsening';
    } else if (systolicChange < -5 || diastolicChange < -5) {
      trend = 'improving';
    }
    
    return { systolicChange, diastolicChange, trend };
  }

  // Create new reading instance with proper categorization
  public static create(
    patientId: number,
    systolic: number,
    diastolic: number,
    recordedBy: number,
    heartRate?: number,
    notes?: string,
    customSystolic?: number,
    customDiastolic?: number
  ): Omit<BpReadingType, 'id'> {
    const category = BpReading.calculateCategory(systolic, diastolic, customSystolic, customDiastolic);
    const isAbnormal = BpReading.isAbnormalReading(systolic, diastolic, customSystolic, customDiastolic);

    return {
      patientId,
      systolic,
      diastolic,
      heartRate: heartRate || null,
      notes: notes || null,
      recordedBy,
      recordedAt: new Date(),
      isAbnormal,
      category
    };
  }
}