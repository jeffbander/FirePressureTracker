import { Router } from "express";
import { memberService } from "../services/member-service";
import { aiTriageService } from "../services/ai-triage-service";
import { communicationService } from "../services/communication-service";
import { insertMemberSchema, insertCuffFulfillmentSchema } from "@shared/schema";
import { calculateAge } from "@shared/date-utils";

const router = Router();

// Member registration (from mobile app)
router.post("/members/register", async (req, res) => {
  try {
    // Calculate age from date of birth
    const age = calculateAge(req.body.dateOfBirth);
    
    // Determine union from URL parameters or request header
    const unionId = req.query.union_id as string || req.headers['x-union-id'] as string;
    
    const memberData = {
      ...req.body,
      unionId,
      status: "pending_verification" // Always start with pending verification
    };

    const validated = insertMemberSchema.parse(memberData);
    const member = await memberService.createMember(validated);
    
    res.status(201).json({
      success: true,
      message: "Registration received - awaiting union verification",
      member: {
        id: member.id,
        fullName: member.fullName,
        union: member.union,
        status: member.status,
        submittedAt: member.createdAt
      }
    });
  } catch (error) {
    console.error('Member registration error:', error);
    res.status(400).json({ 
      success: false,
      message: "Invalid registration data",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get all members (admin view)
router.get("/members", async (req, res) => {
  try {
    const { union, status } = req.query;
    
    let members;
    if (union) {
      members = await memberService.getMembersByUnion(union as string);
    } else if (status) {
      members = await memberService.getMembersByStatus(status as string);
    } else {
      members = await memberService.getAllMembers();
    }
    
    res.json({ success: true, members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch members" });
  }
});

// Get member by ID
router.get("/members/:id", async (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const member = await memberService.getMember(memberId);
    
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    // Get member's fulfillment info
    const fulfillment = await memberService.getFulfillmentByMember(memberId);
    
    // Get member's communications
    const communications = await communicationService.getCommunicationsByMember(memberId);
    
    // Get member's triage cases
    const triageCases = await aiTriageService.getTriageCasesByMember(memberId);
    
    res.json({
      success: true,
      data: {
        member,
        fulfillment,
        communications,
        triageCases
      }
    });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch member details" });
  }
});

// Union verification endpoints
router.get("/members/verification/pending", async (req, res) => {
  try {
    const { union } = req.query;
    
    let pendingMembers;
    if (union) {
      const allPending = await memberService.getPendingVerificationMembers();
      pendingMembers = allPending.filter(m => m.union === union);
    } else {
      pendingMembers = await memberService.getPendingVerificationMembers();
    }
    
    // Return limited fields for verification queue
    const verificationQueue = pendingMembers.map(member => ({
      id: member.id,
      fullName: member.fullName,
      dateOfBirth: member.dateOfBirth,
      email: member.email,
      mobilePhone: member.mobilePhone,
      union: member.union,
      unionId: member.unionId,
      createdAt: member.createdAt
    }));
    
    res.json({ success: true, pendingMembers: verificationQueue });
  } catch (error) {
    console.error('Get pending verification error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch pending verifications" });
  }
});

// Verify member (approve/reject)
router.patch("/members/:id/verify", async (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const { approved, verifiedBy, rejectionReason } = req.body;
    
    if (typeof approved !== 'boolean' || !verifiedBy) {
      return res.status(400).json({ success: false, message: "Invalid verification data" });
    }
    
    const updatedMember = await memberService.verifyMember(
      memberId,
      verifiedBy,
      approved,
      rejectionReason
    );
    
    if (!updatedMember) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    // If approved, automatically set up for cuff fulfillment
    if (approved) {
      // Member status is now "awaiting_shipment" and ready for cuff request
      res.json({
        success: true,
        message: "Member approved and ready for cuff fulfillment",
        member: updatedMember
      });
    } else {
      res.json({
        success: true,
        message: "Member registration rejected",
        member: updatedMember
      });
    }
  } catch (error) {
    console.error('Member verification error:', error);
    res.status(500).json({ success: false, message: "Failed to verify member" });
  }
});

// Cuff fulfillment endpoints
router.post("/members/:id/request-cuff", async (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const { shippingAddress } = req.body;
    
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: "Shipping address required" });
    }
    
    const fulfillment = await memberService.requestCuff(memberId, shippingAddress);
    
    if (!fulfillment) {
      return res.status(404).json({ success: false, message: "Member not found or not eligible" });
    }
    
    res.status(201).json({
      success: true,
      message: "Cuff request submitted to fulfillment queue",
      fulfillment
    });
  } catch (error) {
    console.error('Cuff request error:', error);
    res.status(500).json({ success: false, message: "Failed to request cuff" });
  }
});

// Get fulfillment queue
router.get("/fulfillment/queue/:queueName", async (req, res) => {
  try {
    const queueName = req.params.queueName;
    const fulfillments = await memberService.getFulfillmentsByQueue(queueName);
    
    // Include member details for fulfillment team
    const fulfillmentWithMembers = await Promise.all(
      fulfillments.map(async (fulfillment) => {
        const member = await memberService.getMember(fulfillment.memberId);
        return {
          ...fulfillment,
          member: {
            fullName: member?.fullName,
            email: member?.email,
            mobilePhone: member?.mobilePhone
          }
        };
      })
    );
    
    res.json({ success: true, fulfillments: fulfillmentWithMembers });
  } catch (error) {
    console.error('Get fulfillment queue error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch fulfillment queue" });
  }
});

// Update tracking information
router.patch("/fulfillment/:id/tracking", async (req, res) => {
  try {
    const fulfillmentId = parseInt(req.params.id);
    const { trackingNumber, carrier, trackingUrl, updatedBy } = req.body;
    
    if (!trackingNumber || !carrier || !updatedBy) {
      return res.status(400).json({ success: false, message: "Missing required tracking information" });
    }
    
    const updatedFulfillment = await memberService.updateFulfillmentTracking(
      fulfillmentId,
      trackingNumber,
      carrier,
      trackingUrl,
      updatedBy
    );
    
    if (!updatedFulfillment) {
      return res.status(404).json({ success: false, message: "Fulfillment record not found" });
    }
    
    res.json({
      success: true,
      message: "Tracking information updated",
      fulfillment: updatedFulfillment
    });
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({ success: false, message: "Failed to update tracking" });
  }
});

// Mark as delivered (webhook endpoint for carrier notifications)
router.post("/fulfillment/:id/delivered", async (req, res) => {
  try {
    const fulfillmentId = parseInt(req.params.id);
    
    const updatedFulfillment = await memberService.markDelivered(fulfillmentId);
    
    if (!updatedFulfillment) {
      return res.status(404).json({ success: false, message: "Fulfillment record not found" });
    }
    
    res.json({
      success: true,
      message: "Delivery confirmed - member reassigned to pending_first_reading",
      fulfillment: updatedFulfillment
    });
  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({ success: false, message: "Failed to mark as delivered" });
  }
});

// Member list management
router.get("/members/lists/active", async (req, res) => {
  try {
    const activeMembers = await memberService.getActiveMembers();
    res.json({ success: true, members: activeMembers });
  } catch (error) {
    console.error('Get active members error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch active members" });
  }
});

router.get("/members/lists/inactive", async (req, res) => {
  try {
    const inactiveMembers = await memberService.getInactiveMembers();
    res.json({ success: true, members: inactiveMembers });
  } catch (error) {
    console.error('Get inactive members error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch inactive members" });
  }
});

router.get("/members/lists/pending-first-reading", async (req, res) => {
  try {
    const pendingMembers = await memberService.getMembersByStatus("pending_first_reading");
    res.json({ success: true, members: pendingMembers });
  } catch (error) {
    console.error('Get pending first reading error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch pending first reading members" });
  }
});

// Get abnormal BP list
router.get("/members/lists/abnormal-bp", async (req, res) => {
  try {
    // This would need to be implemented to check latest BP readings
    // For now, return empty array
    res.json({ success: true, members: [] });
  } catch (error) {
    console.error('Get abnormal BP list error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch abnormal BP list" });
  }
});

export default router;