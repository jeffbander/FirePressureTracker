import { 
  clinicalTriage, bpReadings, members, communications,
  type ClinicalTriage, type InsertClinicalTriage,
  type BpReading, type Member, type Communication
} from "@shared/schema";

/**
 * AI-driven triage and clinical decision support service
 */
export class AiTriageService {
  private triageStorage: Map<number, ClinicalTriage>;
  private currentId: number;

  constructor() {
    this.triageStorage = new Map();
    this.currentId = 1;
  }

  /**
   * Process abnormal BP reading through AI triage system
   */
  async processBpReading(memberId: number, bpReadingId: number, bpReading: BpReading, member: Member): Promise<ClinicalTriage> {
    // Get member's BP history for trend analysis
    const bpTrends = await this.analyzeBpTrends(memberId);
    
    // Get communication history for context
    const communicationHistory = await this.getCommunicationContext(memberId);
    
    // Run AI triage algorithm
    const aiResult = this.runAiTriage(bpReading, member, bpTrends, communicationHistory);
    
    // Create triage record
    const triage: ClinicalTriage = {
      id: this.currentId++,
      memberId,
      bpReadingId,
      aiRecommendation: aiResult.recommendation,
      aiConfidence: aiResult.confidence,
      aiReasoning: aiResult.reasoning,
      flaggedTrends: aiResult.flaggedTrends,
      bpTrends,
      communicationHistory,
      clinicalReview: "pending",
      clinicalDecision: null,
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
      assignedStaffId: aiResult.assignedStaffId,
      interventionDueDate: aiResult.interventionDueDate,
      createdAt: new Date()
    };

    this.triageStorage.set(triage.id, triage);
    return triage;
  }

  /**
   * AI triage algorithm that determines intervention type
   */
  private runAiTriage(
    bpReading: BpReading, 
    member: Member, 
    bpTrends: any, 
    communicationHistory: any
  ): {
    recommendation: string;
    confidence: number;
    reasoning: string;
    flaggedTrends: any[];
    assignedStaffId: number | null;
    interventionDueDate: Date | null;
  } {
    const { systolic, diastolic } = bpReading;
    const flaggedTrends: any[] = [];
    let recommendation = "none";
    let confidence = 0.95;
    let reasoning = "";
    let assignedStaffId: number | null = null;
    let interventionDueDate: Date | null = null;

    // Critical BP levels - immediate NP intervention
    if (systolic >= 180 || diastolic >= 120) {
      recommendation = "nurse_practitioner";
      confidence = 0.98;
      reasoning = "Critical hypertension detected (BP: " + systolic + "/" + diastolic + "). Immediate clinical intervention required.";
      flaggedTrends.push({
        type: "critical_bp",
        value: `${systolic}/${diastolic}`,
        severity: "high"
      });
      assignedStaffId = this.getAvailableNursePractitioner();
      interventionDueDate = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
    }
    // Severe hypertension with concerning trends
    else if (systolic >= 160 || diastolic >= 100) {
      const hasUpwardTrend = this.analyzeUpwardTrend(bpTrends);
      const hasRecentFailedContact = this.checkRecentFailedContact(communicationHistory);
      
      if (hasUpwardTrend || hasRecentFailedContact) {
        recommendation = "nurse_practitioner";
        confidence = 0.90;
        reasoning = "Stage 2 hypertension with " + (hasUpwardTrend ? "upward trend" : "previous communication challenges") + ". Clinical intervention warranted.";
        flaggedTrends.push({
          type: hasUpwardTrend ? "upward_trend" : "communication_difficulty",
          severity: "medium"
        });
        assignedStaffId = this.getAvailableNursePractitioner();
        interventionDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      } else {
        recommendation = "coach";
        confidence = 0.85;
        reasoning = "Stage 2 hypertension detected. Health coaching recommended for lifestyle intervention.";
        assignedStaffId = this.getAvailableCoach();
        interventionDueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
      }
    }
    // Stage 1 hypertension
    else if (systolic >= 140 || diastolic >= 90) {
      const riskFactors = this.assessRiskFactors(member);
      
      if (riskFactors.score >= 3) {
        recommendation = "nurse_practitioner";
        confidence = 0.80;
        reasoning = "Stage 1 hypertension with multiple risk factors (score: " + riskFactors.score + "). Clinical assessment recommended.";
        flaggedTrends.push({
          type: "multiple_risk_factors",
          factors: riskFactors.factors,
          severity: "medium"
        });
        assignedStaffId = this.getAvailableNursePractitioner();
        interventionDueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
      } else {
        recommendation = "coach";
        confidence = 0.85;
        reasoning = "Stage 1 hypertension detected. Health coaching for lifestyle modification.";
        assignedStaffId = this.getAvailableCoach();
        interventionDueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days
      }
    }
    // Elevated BP
    else if (systolic >= 120 && systolic < 140 && diastolic < 90) {
      const hasConsistentElevation = this.checkConsistentElevation(bpTrends);
      
      if (hasConsistentElevation) {
        recommendation = "coach";
        confidence = 0.75;
        reasoning = "Consistently elevated BP readings. Preventive health coaching recommended.";
        flaggedTrends.push({
          type: "consistent_elevation",
          severity: "low"
        });
        assignedStaffId = this.getAvailableCoach();
        interventionDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      } else {
        recommendation = "none";
        reasoning = "Elevated BP reading but within monitoring range. Continue regular monitoring.";
      }
    }

    return {
      recommendation,
      confidence,
      reasoning,
      flaggedTrends,
      assignedStaffId,
      interventionDueDate
    };
  }

  /**
   * Analyze BP trends over time
   */
  private async analyzeBpTrends(memberId: number): Promise<any> {
    // In a real implementation, this would query the BP readings table
    // For now, return mock trend analysis
    return {
      readingCount: 5,
      averageSystolic: 145,
      averageDiastolic: 92,
      trend: "stable",
      variability: "low",
      lastReading: new Date(),
      concerningPatterns: []
    };
  }

  /**
   * Get communication context for AI decision making
   */
  private async getCommunicationContext(memberId: number): Promise<any> {
    // In a real implementation, this would query communications table
    return {
      totalContacts: 2,
      lastContactDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      lastOutcome: "resolved",
      unsuccessfulAttempts: 0,
      memberResponsiveness: "high"
    };
  }

  /**
   * Check for upward BP trend
   */
  private analyzeUpwardTrend(bpTrends: any): boolean {
    return bpTrends.trend === "increasing" || bpTrends.concerningPatterns.includes("upward_trend");
  }

  /**
   * Check for recent failed contact attempts
   */
  private checkRecentFailedContact(communicationHistory: any): boolean {
    return communicationHistory.unsuccessfulAttempts >= 2 || 
           communicationHistory.lastOutcome === "no_answer";
  }

  /**
   * Assess cardiovascular risk factors from member profile
   */
  private assessRiskFactors(member: Member): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    // Age factor
    const age = new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();
    if (age >= 65) {
      factors.push("age_over_65");
      score += 2;
    } else if (age >= 45) {
      factors.push("age_over_45");
      score += 1;
    }

    // Medical history
    if (member.pastMedicalHistory) {
      const history = member.pastMedicalHistory as any;
      if (history.diabetes) {
        factors.push("diabetes");
        score += 2;
      }
      if (history.heartDisease) {
        factors.push("heart_disease");
        score += 3;
      }
      if (history.hypertension) {
        factors.push("existing_hypertension");
        score += 1;
      }
    }

    // Lifestyle factors
    if (member.lifestyleQuestions) {
      const lifestyle = member.lifestyleQuestions as any;
      if (lifestyle.smoking === "current") {
        factors.push("current_smoking");
        score += 2;
      }
      if (lifestyle.exercise === "rarely" || lifestyle.exercise === "never") {
        factors.push("sedentary");
        score += 1;
      }
      if (lifestyle.sleep && (lifestyle.sleep.includes("less than 6") || lifestyle.sleep.includes("5-6"))) {
        factors.push("poor_sleep");
        score += 1;
      }
    }

    // BMI calculation
    if (member.height && member.weight) {
      const heightM = member.height * 0.0254; // inches to meters
      const weightKg = member.weight * 0.453592; // pounds to kg
      const bmi = weightKg / (heightM * heightM);
      
      if (bmi >= 30) {
        factors.push("obesity");
        score += 2;
      } else if (bmi >= 25) {
        factors.push("overweight");
        score += 1;
      }
    }

    return { score, factors };
  }

  /**
   * Check for consistent BP elevation pattern
   */
  private checkConsistentElevation(bpTrends: any): boolean {
    return bpTrends.readingCount >= 3 && 
           bpTrends.averageSystolic >= 125 && 
           bpTrends.variability === "low";
  }

  /**
   * Get available nurse practitioner for assignment
   */
  private getAvailableNursePractitioner(): number {
    // In a real implementation, this would check staff availability
    // Return ID of nurse practitioner (from seeded users)
    return 2; // Nurse user ID
  }

  /**
   * Get available health coach for assignment
   */
  private getAvailableCoach(): number {
    // In a real implementation, this would check staff availability
    // Return ID of health coach (from seeded users)
    return 3; // Coach user ID
  }

  /**
   * Clinical staff review and override AI recommendation
   */
  async reviewTriage(
    triageId: number, 
    reviewedBy: number, 
    decision: string, 
    notes: string,
    newAssignee?: number
  ): Promise<ClinicalTriage | undefined> {
    const triage = this.triageStorage.get(triageId);
    if (!triage) return undefined;

    const updatedTriage: ClinicalTriage = {
      ...triage,
      clinicalReview: decision === triage.aiRecommendation ? "confirmed" : "overridden",
      clinicalDecision: decision,
      reviewedBy,
      reviewedAt: new Date(),
      reviewNotes: notes,
      assignedStaffId: newAssignee || triage.assignedStaffId
    };

    this.triageStorage.set(triageId, updatedTriage);
    return updatedTriage;
  }

  /**
   * Get pending triage cases for clinical review
   */
  async getPendingTriageCases(): Promise<ClinicalTriage[]> {
    return Array.from(this.triageStorage.values()).filter(t => t.clinicalReview === "pending");
  }

  /**
   * Get triage cases assigned to specific staff member
   */
  async getTriageCasesByStaff(staffId: number): Promise<ClinicalTriage[]> {
    return Array.from(this.triageStorage.values()).filter(t => t.assignedStaffId === staffId);
  }

  /**
   * Get triage case by member ID
   */
  async getTriageCasesByMember(memberId: number): Promise<ClinicalTriage[]> {
    return Array.from(this.triageStorage.values()).filter(t => t.memberId === memberId);
  }
}

export const aiTriageService = new AiTriageService();