import { Patient } from "../models/Patient";
import { BpReading } from "../models/BpReading";
import { DatabaseStorage } from "../storage";
import { Patient as PatientType, InsertPatient } from "@shared/schema";

export class PatientService {
  private storage: DatabaseStorage;

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  // Get all patients with enhanced functionality
  public async getAllPatients(): Promise<Patient[]> {
    const patientsData = await this.storage.getAllPatients();
    return patientsData.map(data => new Patient(data));
  }

  // Search patients with multiple criteria
  public async searchPatients(query: string): Promise<Patient[]> {
    const allPatients = await this.getAllPatients();
    return allPatients.filter(patient => patient.matchesSearch(query));
  }

  // Get patient by ID
  public async getPatientById(id: number): Promise<Patient | null> {
    const patientData = await this.storage.getPatient(id);
    return patientData ? new Patient(patientData) : null;
  }

  // Get patient by employee ID
  public async getPatientByEmployeeId(employeeId: string): Promise<Patient | null> {
    const patientData = await this.storage.getPatientByEmployeeId(employeeId);
    return patientData ? new Patient(patientData) : null;
  }

  // Create new patient
  public async createPatient(patientData: InsertPatient): Promise<Patient> {
    const createdPatient = await this.storage.createPatient(patientData);
    return new Patient(createdPatient);
  }

  // Update patient information
  public async updatePatient(id: number, updates: Partial<PatientType>): Promise<Patient | null> {
    const updatedPatient = await this.storage.updatePatient(id, updates);
    return updatedPatient ? new Patient(updatedPatient) : null;
  }

  // Get patients requiring checkups
  public async getPatientsNeedingCheckup(): Promise<Patient[]> {
    const allPatients = await this.getAllPatients();
    return allPatients.filter(patient => patient.needsCheckup());
  }

  // Get patients by department
  public async getPatientsByDepartment(department: string): Promise<Patient[]> {
    const allPatients = await this.getAllPatients();
    return allPatients.filter(patient => patient.department === department);
  }

  // Get patients with abnormal readings
  public async getPatientsWithAbnormalReadings(): Promise<{ patient: Patient; readingCount: number }[]> {
    const abnormalReadings = await this.storage.getAbnormalReadings();
    const patientReadingCounts = new Map<number, number>();

    // Count abnormal readings per patient
    abnormalReadings.forEach(reading => {
      const count = patientReadingCounts.get(reading.patientId) || 0;
      patientReadingCounts.set(reading.patientId, count + 1);
    });

    // Get patient objects and combine with counts
    const results: { patient: Patient; readingCount: number }[] = [];
    for (const [patientId, count] of patientReadingCounts.entries()) {
      const patient = await this.getPatientById(patientId);
      if (patient) {
        results.push({ patient, readingCount: count });
      }
    }

    return results.sort((a, b) => b.readingCount - a.readingCount);
  }

  // Get patient statistics
  public async getPatientStatistics(): Promise<{
    totalPatients: number;
    byDepartment: Record<string, number>;
    byUnion: Record<string, number>;
    needingCheckup: number;
    withAbnormalReadings: number;
  }> {
    const allPatients = await this.getAllPatients();
    const patientsNeedingCheckup = allPatients.filter(p => p.needsCheckup());
    const patientsWithAbnormal = await this.getPatientsWithAbnormalReadings();

    const byDepartment: Record<string, number> = {};
    const byUnion: Record<string, number> = {};

    allPatients.forEach(patient => {
      byDepartment[patient.department] = (byDepartment[patient.department] || 0) + 1;
      byUnion[patient.union] = (byUnion[patient.union] || 0) + 1;
    });

    return {
      totalPatients: allPatients.length,
      byDepartment,
      byUnion,
      needingCheckup: patientsNeedingCheckup.length,
      withAbnormalReadings: patientsWithAbnormal.length
    };
  }
}