export interface HypertensionTriageResult {
  action: 'no_action' | 'coach_outreach' | 'nurse_outreach' | 'urgent_call';
  assigneeRole: 'coach' | 'nurse' | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  dueDate: Date;
  mustCall: boolean;
}

export interface ContactHistory {
  lastContactDate?: Date;
  lastCallNotes?: string;
  followUpRecommended?: Date;
  unresolved?: boolean;
}

export function triageHypertensionCase(
  systolic: number,
  diastolic: number,
  contactHistory?: ContactHistory
): HypertensionTriageResult {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  // Check if patient was contacted within 14 days
  const recentlyContacted = contactHistory?.lastContactDate && 
    contactHistory.lastContactDate > fourteenDaysAgo;
  
  // Check for urgent BP levels (160/100 or higher)
  const isUrgentBP = systolic >= 160 || diastolic >= 100;
  
  // Check for early follow-up recommendation
  const earlyFollowUpNeeded = contactHistory?.followUpRecommended && 
    contactHistory.followUpRecommended <= now;
  
  // Determine if we should skip outreach due to recent contact
  if (recentlyContacted && !isUrgentBP && !earlyFollowUpNeeded) {
    return {
      action: 'no_action',
      assigneeRole: null,
      priority: 'low',
      reason: 'Patient contacted within 14 days, no urgent BP or early follow-up needed',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Check again in 7 days
      mustCall: false
    };
  }
  
  // Urgent BP - must call regardless of recent contact
  if (isUrgentBP) {
    return {
      action: 'urgent_call',
      assigneeRole: 'nurse',
      priority: 'urgent',
      reason: `Critical BP reading ${systolic}/${diastolic} - immediate nurse intervention required`,
      dueDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Due in 2 hours
      mustCall: true
    };
  }
  
  // High BP requiring nurse intervention (150+ systolic OR 96+ diastolic)
  if (systolic >= 150 || diastolic >= 96) {
    return {
      action: 'nurse_outreach',
      assigneeRole: 'nurse',
      priority: 'high',
      reason: `Elevated BP ${systolic}/${diastolic} requires nurse practitioner assessment`,
      dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Due in 24 hours
      mustCall: false
    };
  }
  
  // Moderate elevation requiring coach intervention (140-149 systolic OR 90-95 diastolic)
  if ((systolic >= 140 && systolic <= 149) || (diastolic >= 90 && diastolic <= 95)) {
    return {
      action: 'coach_outreach',
      assigneeRole: 'coach',
      priority: 'medium',
      reason: `Moderate BP elevation ${systolic}/${diastolic} - hypertension coach outreach indicated`,
      dueDate: new Date(now.getTime() + 48 * 60 * 60 * 1000), // Due in 48 hours
      mustCall: false
    };
  }
  
  // Normal BP or below threshold
  return {
    action: 'no_action',
    assigneeRole: null,
    priority: 'low',
    reason: `BP ${systolic}/${diastolic} within acceptable range`,
    dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Check again in 30 days
    mustCall: false
  };
}

export function getWorkflowTaskTitle(triageResult: HypertensionTriageResult, patientName: string): string {
  switch (triageResult.action) {
    case 'urgent_call':
      return `URGENT: Call ${patientName} for critical BP reading`;
    case 'nurse_outreach':
      return `Nurse follow-up for ${patientName} - elevated BP`;
    case 'coach_outreach':
      return `Hypertension coaching for ${patientName}`;
    default:
      return `Monitor ${patientName} BP status`;
  }
}

export function getWorkflowTaskDescription(
  triageResult: HypertensionTriageResult, 
  patientName: string, 
  systolic: number, 
  diastolic: number
): string {
  const baseInfo = `Patient: ${patientName}\nBP Reading: ${systolic}/${diastolic} mmHg\nTriage Reason: ${triageResult.reason}\n\n`;
  
  switch (triageResult.action) {
    case 'urgent_call':
      return baseInfo + 
        "IMMEDIATE ACTION REQUIRED:\n" +
        "• Call patient within 2 hours\n" +
        "• Assess for symptoms (headache, chest pain, shortness of breath)\n" +
        "• Review current medications\n" +
        "• Consider emergency department referral if symptomatic\n" +
        "• Document all findings and recommendations";
        
    case 'nurse_outreach':
      return baseInfo +
        "NURSE PRACTITIONER TASKS:\n" +
        "• Contact patient within 24 hours\n" +
        "• Review medication adherence and effectiveness\n" +
        "• Assess for medication adjustment needs\n" +
        "• Evaluate symptoms and side effects\n" +
        "• Schedule telehealth/in-person visit if needed\n" +
        "• Update treatment plan as appropriate";
        
    case 'coach_outreach':
      return baseInfo +
        "HYPERTENSION COACH TASKS:\n" +
        "• Contact patient within 48 hours\n" +
        "• Review medication adherence\n" +
        "• Discuss lifestyle factors (diet, exercise, stress)\n" +
        "• Provide educational resources\n" +
        "• Schedule follow-up monitoring\n" +
        "• Coordinate with healthcare provider if needed";
        
    default:
      return baseInfo + "Continue routine monitoring per protocol.";
  }
}