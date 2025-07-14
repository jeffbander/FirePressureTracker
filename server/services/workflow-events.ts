import { storage } from "../storage";
import { triageHypertensionCase, getWorkflowTaskTitle, getWorkflowTaskDescription } from "@shared/hypertension-workflow";
import { BpReading } from "@shared/schema";

export class WorkflowEventService {
  async handleNewBpReading(reading: BpReading) {
    // Get patient information
    const patient = await storage.getPatient(reading.patientId);
    if (!patient) {
      console.error(`Patient not found for reading ${reading.id}`);
      return;
    }

    // Perform triage analysis
    const triageResult = triageHypertensionCase(
      reading.systolic,
      reading.diastolic,
      patient.age || 0,
      patient.gender || 'unknown',
      {
        hypertension: patient.pastMedicalHistory?.hypertension || false,
        diabetes: patient.pastMedicalHistory?.diabetes || false,
        heartDisease: patient.pastMedicalHistory?.heartDisease || false
      }
    );

    // Create workflow task if action is needed
    if (triageResult.action !== 'no_action') {
      let assignedTo = null;
      
      // Find appropriate assignee based on role
      if (triageResult.assigneeRole === 'nurse') {
        const nurse = await storage.findUserByRole('nurse');
        assignedTo = nurse?.id || null;
      } else if (triageResult.assigneeRole === 'coach') {
        const coach = await storage.findUserByRole('coach');
        assignedTo = coach?.id || null;
      }

      // Create workflow task
      const task = {
        patientId: reading.patientId,
        assignedTo,
        title: getWorkflowTaskTitle(triageResult, patient.firstName + ' ' + patient.lastName),
        description: getWorkflowTaskDescription(triageResult, reading.systolic, reading.diastolic),
        priority: triageResult.priority,
        status: 'pending' as const,
        dueDate: triageResult.dueDate,
        createdAt: new Date()
      };

      await storage.createWorkflowTask(task);
    }
  }

  async sendWelcomeEmail(patient: any) {
    // This would integrate with email service
    console.log(`Welcome email sent to ${patient.firstName} ${patient.lastName}`);
  }

  async sendCuffRequestEmail(patient: any) {
    // This would integrate with email service
    console.log(`Cuff request email sent for ${patient.firstName} ${patient.lastName}`);
  }
}

export const workflowEventService = new WorkflowEventService();