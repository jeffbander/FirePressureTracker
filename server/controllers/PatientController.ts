import { Request, Response } from "express";
import { PatientService } from "../services/PatientService";
import { BpReadingService } from "../services/BpReadingService";
import { WorkflowService } from "../services/WorkflowService";
import { MemStorage } from "../storage";

export class PatientController {
  private patientService: PatientService;
  private bpReadingService: BpReadingService;
  private workflowService: WorkflowService;

  constructor() {
    const storage = new MemStorage();
    this.patientService = new PatientService(storage);
    this.workflowService = new WorkflowService(storage);
    this.bpReadingService = new BpReadingService(storage, this.patientService, this.workflowService);
  }

  // Get all patients with filtering
  public async getAllPatients(req: Request, res: Response): Promise<void> {
    try {
      const { search, department, status } = req.query;

      let patients;
      
      if (search) {
        patients = await this.patientService.searchPatients(search as string);
      } else {
        patients = await this.patientService.getAllPatients();
      }

      // Filter by department if provided
      if (department && department !== 'all') {
        patients = patients.filter(p => p.department === department);
      }

      // Get latest BP reading for each patient if status filter is applied
      if (status && status !== 'all') {
        const patientsWithReadings = await Promise.all(
          patients.map(async (patient) => {
            const readings = await this.bpReadingService.getReadingsByPatient(patient.id);
            const latestReading = readings[0] || null;
            return {
              ...patient,
              latestReading
            };
          })
        );

        const filteredPatients = patientsWithReadings.filter(p => 
          p.latestReading?.category === status
        );

        res.json({
          success: true,
          data: filteredPatients,
          count: filteredPatients.length
        });
        return;
      }

      res.json({
        success: true,
        data: patients,
        count: patients.length
      });
    } catch (error) {
      console.error('Get patients error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch patients"
      });
    }
  }

  // Get patient by ID with full details
  public async getPatientById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const patientId = parseInt(id);

      if (isNaN(patientId)) {
        res.status(400).json({
          success: false,
          message: "Invalid patient ID"
        });
        return;
      }

      const patient = await this.patientService.getPatientById(patientId);

      if (!patient) {
        res.status(404).json({
          success: false,
          message: "Patient not found"
        });
        return;
      }

      // Get related data
      const bpReadings = await this.bpReadingService.getReadingsByPatient(patientId);
      const workflowTasks = await this.workflowService.getTasksByPatient(patientId);
      const trends = await this.bpReadingService.analyzeTrends(patientId);

      res.json({
        success: true,
        data: {
          patient,
          bpReadings,
          workflowTasks,
          trends
        }
      });
    } catch (error) {
      console.error('Get patient by ID error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch patient details"
      });
    }
  }

  // Create new patient
  public async createPatient(req: Request, res: Response): Promise<void> {
    try {
      const patientData = req.body;

      // Validate required fields
      const requiredFields = ['employeeId', 'firstName', 'lastName', 'department', 'union', 'age'];
      const missingFields = requiredFields.filter(field => !patientData[field]);

      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
        return;
      }

      // Check if employee ID already exists
      const existingPatient = await this.patientService.getPatientByEmployeeId(patientData.employeeId);
      if (existingPatient) {
        res.status(409).json({
          success: false,
          message: "Employee ID already exists"
        });
        return;
      }

      const newPatient = await this.patientService.createPatient(patientData);

      res.status(201).json({
        success: true,
        data: newPatient,
        message: "Patient created successfully"
      });
    } catch (error) {
      console.error('Create patient error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to create patient"
      });
    }
  }

  // Update patient
  public async updatePatient(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const patientId = parseInt(id);
      const updates = req.body;

      if (isNaN(patientId)) {
        res.status(400).json({
          success: false,
          message: "Invalid patient ID"
        });
        return;
      }

      const updatedPatient = await this.patientService.updatePatient(patientId, updates);

      if (!updatedPatient) {
        res.status(404).json({
          success: false,
          message: "Patient not found"
        });
        return;
      }

      res.json({
        success: true,
        data: updatedPatient,
        message: "Patient updated successfully"
      });
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to update patient"
      });
    }
  }

  // Get patients needing checkup
  public async getPatientsNeedingCheckup(req: Request, res: Response): Promise<void> {
    try {
      const patients = await this.patientService.getPatientsNeedingCheckup();

      res.json({
        success: true,
        data: patients,
        count: patients.length
      });
    } catch (error) {
      console.error('Get patients needing checkup error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch patients needing checkup"
      });
    }
  }

  // Get patients with abnormal readings
  public async getPatientsWithAbnormalReadings(req: Request, res: Response): Promise<void> {
    try {
      const patients = await this.patientService.getPatientsWithAbnormalReadings();

      res.json({
        success: true,
        data: patients,
        count: patients.length
      });
    } catch (error) {
      console.error('Get patients with abnormal readings error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch patients with abnormal readings"
      });
    }
  }

  // Get patient statistics
  public async getPatientStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.patientService.getPatientStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Get patient statistics error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch patient statistics"
      });
    }
  }
}