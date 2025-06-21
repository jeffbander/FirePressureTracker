import { Patient as PatientType } from "@shared/schema";
import { BpReading } from "./BpReading";

export class Patient {
  public id: number;
  public employeeId: string;
  public firstName: string;
  public lastName: string;
  public department: string;
  public union: string;
  public age: number;
  public email?: string;
  public phone?: string;
  public emergencyContact?: string;
  public medications?: string;
  public allergies?: string;
  public lastCheckup?: Date;
  public customSystolicThreshold?: number;
  public customDiastolicThreshold?: number;
  public createdAt: Date;

  constructor(data: PatientType) {
    this.id = data.id;
    this.employeeId = data.employeeId;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.department = data.department;
    this.union = data.union;
    this.age = data.age;
    this.email = data.email;
    this.phone = data.phone;
    this.emergencyContact = data.emergencyContact;
    this.medications = data.medications;
    this.allergies = data.allergies;
    this.lastCheckup = data.lastCheckup;
    this.customSystolicThreshold = data.customSystolicThreshold;
    this.customDiastolicThreshold = data.customDiastolicThreshold;
    this.createdAt = data.createdAt;
  }

  // Get full name
  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Check if patient has custom BP thresholds
  public hasCustomThresholds(): boolean {
    return !!(this.customSystolicThreshold && this.customDiastolicThreshold);
  }

  // Get custom systolic threshold or default
  public getSystolicThreshold(): number {
    return this.customSystolicThreshold || 140;
  }

  // Get custom diastolic threshold or default
  public getDiastolicThreshold(): number {
    return this.customDiastolicThreshold || 90;
  }

  // Check if patient needs checkup (based on last checkup date)
  public needsCheckup(): boolean {
    if (!this.lastCheckup) return true;
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    return this.lastCheckup < sixMonthsAgo;
  }

  // Get parsed medications list
  public getMedicationsList(): string[] {
    if (!this.medications) return [];
    
    try {
      return JSON.parse(this.medications);
    } catch {
      return [this.medications];
    }
  }

  // Update last checkup date
  public updateLastCheckup(): void {
    this.lastCheckup = new Date();
  }

  // Check if reading is abnormal for this patient
  public isReadingAbnormal(systolic: number, diastolic: number): boolean {
    return systolic >= this.getSystolicThreshold() || diastolic >= this.getDiastolicThreshold();
  }

  // Get search terms for patient
  public getSearchTerms(): string[] {
    return [
      this.firstName.toLowerCase(),
      this.lastName.toLowerCase(),
      this.getFullName().toLowerCase(),
      this.employeeId.toLowerCase(),
      this.department.toLowerCase(),
      this.union.toLowerCase()
    ];
  }

  // Check if patient matches search query
  public matchesSearch(query: string): boolean {
    const searchQuery = query.toLowerCase();
    return this.getSearchTerms().some(term => term.includes(searchQuery));
  }
}