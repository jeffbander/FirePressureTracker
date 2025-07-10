import { Router } from "express";
import { aiTriageService } from "../services/ai-triage-service";
import { memberService } from "../services/member-service";

const router = Router();

// Get pending triage cases for clinical review
router.get("/triage/pending", async (req, res) => {
  try {
    const pendingCases = await aiTriageService.getPendingTriageCases();
    
    // Include member details for clinical review
    const casesWithMembers = await Promise.all(
      pendingCases.map(async (triageCase) => {
        const member = await memberService.getMember(triageCase.memberId);
        return {
          ...triageCase,
          member: member ? {
            fullName: member.fullName,
            dateOfBirth: member.dateOfBirth,
            union: member.union,
            email: member.email,
            mobilePhone: member.mobilePhone,
            pastMedicalHistory: member.pastMedicalHistory,
            currentMedications: member.currentMedications
          } : null
        };
      })
    );
    
    res.json({ 
      success: true, 
      pendingCases: casesWithMembers,
      count: casesWithMembers.length
    });
  } catch (error) {
    console.error('Get pending triage cases error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch pending triage cases" });
  }
});

// Clinical staff review and override AI recommendation
router.patch("/triage/:id/review", async (req, res) => {
  try {
    const triageId = parseInt(req.params.id);
    const { reviewedBy, decision, notes, newAssignee } = req.body;
    
    if (!reviewedBy || !decision || !notes) {
      return res.status(400).json({ success: false, message: "Missing required review information" });
    }
    
    const updatedTriage = await aiTriageService.reviewTriage(
      triageId,
      reviewedBy,
      decision,
      notes,
      newAssignee
    );
    
    if (!updatedTriage) {
      return res.status(404).json({ success: false, message: "Triage case not found" });
    }
    
    res.json({
      success: true,
      message: "Triage case reviewed successfully",
      triage: updatedTriage
    });
  } catch (error) {
    console.error('Review triage error:', error);
    res.status(500).json({ success: false, message: "Failed to review triage case" });
  }
});

// Get triage cases assigned to specific staff member
router.get("/triage/staff/:staffId", async (req, res) => {
  try {
    const staffId = parseInt(req.params.staffId);
    const assignedCases = await aiTriageService.getTriageCasesByStaff(staffId);
    
    // Include member details
    const casesWithMembers = await Promise.all(
      assignedCases.map(async (triageCase) => {
        const member = await memberService.getMember(triageCase.memberId);
        return {
          ...triageCase,
          member: member ? {
            fullName: member.fullName,
            dateOfBirth: member.dateOfBirth,
            union: member.union,
            email: member.email,
            mobilePhone: member.mobilePhone
          } : null
        };
      })
    );
    
    res.json({ 
      success: true, 
      assignedCases: casesWithMembers,
      count: casesWithMembers.length
    });
  } catch (error) {
    console.error('Get staff triage cases error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch staff triage cases" });
  }
});

// Get triage cases for specific member
router.get("/triage/member/:memberId", async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    const memberCases = await aiTriageService.getTriageCasesByMember(memberId);
    
    res.json({ 
      success: true, 
      triageCases: memberCases,
      count: memberCases.length
    });
  } catch (error) {
    console.error('Get member triage cases error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch member triage cases" });
  }
});

// Process new BP reading through AI triage (called when abnormal BP is detected)
router.post("/triage/process-bp", async (req, res) => {
  try {
    const { memberId, bpReadingId, bpReading } = req.body;
    
    if (!memberId || !bpReadingId || !bpReading) {
      return res.status(400).json({ success: false, message: "Missing required BP reading information" });
    }
    
    // Get member details for AI analysis
    const member = await memberService.getMember(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }
    
    // Process through AI triage
    const triageResult = await aiTriageService.processBpReading(memberId, bpReadingId, bpReading, member);
    
    res.status(201).json({
      success: true,
      message: "BP reading processed through AI triage",
      triage: triageResult
    });
  } catch (error) {
    console.error('Process BP triage error:', error);
    res.status(500).json({ success: false, message: "Failed to process BP reading through triage" });
  }
});

export default router;