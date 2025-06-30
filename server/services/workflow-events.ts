import { Patient, User } from "@shared/schema";

export interface WorkflowEvent {
  type: 'status_change' | 'approval' | 'notification';
  patientId: number;
  oldStatus?: string;
  newStatus: string;
  approvedBy?: number;
  timestamp: Date;
}

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  patientData: {
    name: string;
    employeeId: string;
    department: string;
    union: string;
    email?: string;
    phone?: string;
    allergies?: string;
  };
}

export class WorkflowEventService {
  
  /**
   * Process workflow events when patient status changes
   */
  async processStatusChange(patient: Patient, oldStatus: string, approvedBy?: User): Promise<void> {
    const event: WorkflowEvent = {
      type: 'status_change',
      patientId: patient.id,
      oldStatus,
      newStatus: patient.status,
      approvedBy: approvedBy?.id,
      timestamp: new Date()
    };

    console.log(`[Workflow Event] Patient ${patient.employeeId} status changed from ${oldStatus} to ${patient.status}`);

    // Handle specific status transitions
    switch (patient.status) {
      case 'awaiting_cuff':
        await this.handleCuffApproval(patient, approvedBy);
        break;
      case 'awaiting_first_reading':
        await this.handleAwaitingFirstReading(patient, approvedBy);
        break;
      case 'active':
        await this.handleActivation(patient, approvedBy);
        break;
      case 'inactive':
        await this.handleInactiveStatus(patient, approvedBy);
        break;
      case 'out_of_program':
        await this.handleProgramExit(patient, approvedBy);
        break;
    }
  }

  /**
   * Handle patient approved for cuff - send notification to equipment provider
   */
  private async handleCuffApproval(patient: Patient, approvedBy?: User): Promise<void> {
    const emailNotification: EmailNotification = {
      to: 'sbzakow@mswheart.com',
      subject: `BP Cuff Request - ${patient.firstName} ${patient.lastName} (${patient.employeeId})`,
      body: this.generateCuffRequestEmail(patient, approvedBy),
      patientData: {
        name: `${patient.firstName} ${patient.lastName}`,
        employeeId: patient.employeeId,
        department: patient.department,
        union: patient.union,
        email: patient.email || undefined,
        phone: patient.phone || undefined,
        allergies: patient.allergies || undefined
      }
    };

    await this.sendEmailNotification(emailNotification);
    console.log(`[Email] Cuff request sent to Cuffs@Htn.org for patient ${patient.employeeId}`);
  }

  /**
   * Handle patient activation - send welcome email and setup instructions
   */
  private async handleActivation(patient: Patient, approvedBy?: User): Promise<void> {
    // Send welcome email to patient
    if (patient.email) {
      const welcomeEmail: EmailNotification = {
        to: patient.email,
        subject: `Welcome to Fire Department BP Monitoring Program`,
        body: this.generateWelcomeEmail(patient),
        patientData: {
          name: `${patient.firstName} ${patient.lastName}`,
          employeeId: patient.employeeId,
          department: patient.department,
          union: patient.union,
          email: patient.email,
          phone: patient.phone || undefined,
          allergies: patient.allergies || undefined
        }
      };

      await this.sendEmailNotification(welcomeEmail);
      console.log(`[Email] Welcome email sent to ${patient.email} for patient ${patient.employeeId}`);
    }

    // Notify admin of new active patient
    const adminNotification: EmailNotification = {
      to: 'admin@firestation.gov',
      subject: `New Active Patient - ${patient.firstName} ${patient.lastName}`,
      body: this.generateAdminActivationEmail(patient, approvedBy),
      patientData: {
        name: `${patient.firstName} ${patient.lastName}`,
        employeeId: patient.employeeId,
        department: patient.department,
        union: patient.union,
        email: patient.email || undefined,
        phone: patient.phone || undefined,
        allergies: patient.allergies || undefined
      }
    };

    await this.sendEmailNotification(adminNotification);
  }

  /**
   * Handle patient awaiting first reading - send setup instructions
   */
  private async handleAwaitingFirstReading(patient: Patient, approvedBy?: User): Promise<void> {
    if (patient.email) {
      const setupEmail: EmailNotification = {
        to: patient.email,
        subject: `BP Monitoring Setup Complete - First Reading Required`,
        body: this.generateFirstReadingInstructions(patient),
        patientData: {
          name: `${patient.firstName} ${patient.lastName}`,
          employeeId: patient.employeeId,
          department: patient.department,
          union: patient.union,
          email: patient.email,
          phone: patient.phone || undefined,
          allergies: patient.allergies || undefined
        }
      };

      await this.sendEmailNotification(setupEmail);
      console.log(`[Email] First reading instructions sent to ${patient.email} for patient ${patient.employeeId}`);
    }
  }

  /**
   * Handle patient marked as inactive - send reactivation reminder
   */
  private async handleInactiveStatus(patient: Patient, approvedBy?: User): Promise<void> {
    if (patient.email) {
      const reactivationEmail: EmailNotification = {
        to: patient.email,
        subject: `BP Monitoring Reminder - Please Take Your Next Reading`,
        body: this.generateReactivationReminder(patient),
        patientData: {
          name: `${patient.firstName} ${patient.lastName}`,
          employeeId: patient.employeeId,
          department: patient.department,
          union: patient.union,
          email: patient.email,
          phone: patient.phone || undefined,
          allergies: patient.allergies || undefined
        }
      };

      await this.sendEmailNotification(reactivationEmail);
      console.log(`[Email] Reactivation reminder sent to ${patient.email} for patient ${patient.employeeId}`);
    }
  }

  /**
   * Handle patient exiting program - send notification to relevant parties
   */
  private async handleProgramExit(patient: Patient, approvedBy?: User): Promise<void> {
    const exitNotification: EmailNotification = {
      to: 'admin@firestation.gov',
      subject: `Patient Removed from Program - ${patient.firstName} ${patient.lastName}`,
      body: this.generateExitNotificationEmail(patient, approvedBy),
      patientData: {
        name: `${patient.firstName} ${patient.lastName}`,
        employeeId: patient.employeeId,
        department: patient.department,
        union: patient.union,
        email: patient.email || undefined,
        phone: patient.phone || undefined,
        allergies: patient.allergies || undefined
      }
    };

    await this.sendEmailNotification(exitNotification);
    console.log(`[Email] Exit notification sent for patient ${patient.employeeId}`);
  }

  /**
   * Generate email content for cuff request
   */
  private generateCuffRequestEmail(patient: Patient, approvedBy?: User): string {
    return `
Dear Equipment Team,

A new firefighter has been approved for blood pressure monitoring and requires a BP cuff.

PATIENT DETAILS:
Name: ${patient.firstName} ${patient.lastName}
Employee ID: ${patient.employeeId}
Department: ${patient.department}
Union: ${patient.union}
Age: ${patient.age}

CONTACT INFORMATION:
Email: ${patient.email || 'Not provided'}
Phone: ${patient.phone || 'Not provided'}


MEDICAL INFORMATION:
Allergies: ${patient.allergies || 'None reported'}
Current Medications: ${patient.medications || 'None reported'}

APPROVAL DETAILS:
Approved by: ${approvedBy ? `${approvedBy.name} (${approvedBy.role})` : 'System Administrator'}
Approval Date: ${new Date().toLocaleDateString()}
Status: Awaiting BP Cuff

Please arrange for a blood pressure monitoring cuff to be sent to this firefighter. Once the equipment is delivered and set up, they can be activated in the monitoring program.

For questions or delivery confirmation, please contact the Fire Department BP Management System administrators.

Best regards,
Fire Department BP Management System
    `.trim();
  }

  /**
   * Generate welcome email for newly active patients
   */
  private generateWelcomeEmail(patient: Patient): string {
    return `
Dear ${patient.firstName} ${patient.lastName},

Welcome to the Fire Department Blood Pressure Monitoring Program!

You have been successfully enrolled and are now active in our health monitoring system. Your BP monitoring equipment should arrive soon, and you'll receive instructions on how to use it.

PROGRAM DETAILS:
- Regular blood pressure monitoring
- Health alerts and notifications
- Access to health coaching support
- Integration with department health initiatives

NEXT STEPS:
1. Set up your BP monitoring equipment when it arrives
2. Take your first reading to test the system
3. Follow the monitoring schedule provided
4. Contact support if you have any questions

Your health and safety are our top priority. This program is designed to help you maintain optimal health while serving our community.

If you have any questions or concerns, please contact your department health coordinator or reply to this email.

Stay safe and healthy,
Fire Department Health Team

Employee ID: ${patient.employeeId}
Department: ${patient.department}
Program Start Date: ${new Date().toLocaleDateString()}
    `.trim();
  }

  /**
   * Generate admin notification for new active patient
   */
  private generateAdminActivationEmail(patient: Patient, approvedBy?: User): string {
    return `
A new patient has been activated in the Fire Department BP Monitoring Program.

PATIENT: ${patient.firstName} ${patient.lastName} (${patient.employeeId})
DEPARTMENT: ${patient.department}
UNION: ${patient.union}
ACTIVATED BY: ${approvedBy ? `${approvedBy.name} (${approvedBy.role})` : 'System'}
ACTIVATION DATE: ${new Date().toLocaleDateString()}

The patient should now have access to all monitoring features and will begin receiving health alerts and notifications.

Fire Department BP Management System
    `.trim();
  }

  /**
   * Generate setup instructions for first BP reading
   */
  private generateFirstReadingInstructions(patient: Patient): string {
    return `
Dear ${patient.firstName} ${patient.lastName},

Your BP monitoring equipment has been delivered and is ready to use! 

NEXT STEPS:
1. Set up your blood pressure cuff according to the included instructions
2. Download the Fire Department BP app (if not already installed)
3. Take your first blood pressure reading to activate your account
4. Submit the reading through the app or call your health coordinator

IMPORTANT:
- Take your first reading within the next 7 days to complete your enrollment
- Once your first reading is recorded, you'll be fully active in the program
- You'll receive regular monitoring schedules and health alerts

SUPPORT:
If you need help setting up your equipment or have questions, contact:
- Your Department Health Coordinator
- Technical Support: (555) 123-HELP
- Email: support@firestation.gov

Thank you for participating in the Fire Department Blood Pressure Monitoring Program!

Employee ID: ${patient.employeeId}
Department: ${patient.department}
Setup Date: ${new Date().toLocaleDateString()}
    `.trim();
  }

  /**
   * Generate reactivation reminder for inactive patients
   */
  private generateReactivationReminder(patient: Patient): string {
    return `
Dear ${patient.firstName} ${patient.lastName},

We noticed you haven't taken a blood pressure reading in over 6 months. Your health and safety are important to us!

PLEASE TAKE ACTION:
- Take a blood pressure reading today using your monitoring equipment
- Submit the reading through the Fire Department BP app
- Contact your health coordinator if you need assistance

BENEFITS OF REGULAR MONITORING:
- Early detection of health issues
- Personalized health coaching
- Integration with department wellness programs
- Better overall health outcomes

NEED HELP?
If your equipment needs replacement or you're having technical issues:
- Contact your Department Health Coordinator
- Technical Support: (555) 123-HELP
- Email: support@firestation.gov

Your participation in the BP monitoring program helps keep you healthy and ready to serve our community.

Employee ID: ${patient.employeeId}
Department: ${patient.department}
Reminder Date: ${new Date().toLocaleDateString()}
    `.trim();
  }

  /**
   * Generate notification for patient program exit
   */
  private generateExitNotificationEmail(patient: Patient, approvedBy?: User): string {
    return `
A patient has been removed from the Fire Department BP Monitoring Program.

PATIENT: ${patient.firstName} ${patient.lastName} (${patient.employeeId})
DEPARTMENT: ${patient.department}
REMOVED BY: ${approvedBy ? `${approvedBy.name} (${approvedBy.role})` : 'System'}
REMOVAL DATE: ${new Date().toLocaleDateString()}
STATUS: Out of Program

The patient will no longer receive monitoring alerts or have access to program features.

Fire Department BP Management System
    `.trim();
  }

  /**
   * Send email notification (placeholder for actual email service)
   */
  private async sendEmailNotification(notification: EmailNotification): Promise<void> {
    // In production, this would integrate with SendGrid or similar service
    console.log(`[EMAIL NOTIFICATION]`);
    console.log(`To: ${notification.to}`);
    console.log(`Subject: ${notification.subject}`);
    console.log(`Patient: ${notification.patientData.name} (${notification.patientData.employeeId})`);
    console.log(`Body: ${notification.body.substring(0, 100)}...`);
    console.log(`---`);
    
    // TODO: Integrate with actual email service using SENDGRID_API_KEY
    // const emailService = new SendGridService();
    // await emailService.send(notification);
  }
}

export const workflowEventService = new WorkflowEventService();