import { Router } from "express";
import { memberService } from "../services/member-service";
import { communicationService } from "../services/communication-service";
import { aiTriageService } from "../services/ai-triage-service";

const router = Router();

// Operational metrics dashboard
router.get("/analytics/dashboard", async (req, res) => {
  try {
    // Get member counts by status
    const allMembers = await memberService.getAllMembers();
    const pendingVerification = await memberService.getPendingVerificationMembers();
    const activeMembers = await memberService.getActiveMembers();
    const inactiveMembers = await memberService.getInactiveMembers();
    const pendingFirstReading = await memberService.getMembersByStatus("pending_first_reading");
    
    // Get member counts by union
    const unionBreakdown = {
      UFA: allMembers.filter(m => m.union === "UFA").length,
      "Mount Sinai": allMembers.filter(m => m.union === "Mount Sinai").length,
      LBA: allMembers.filter(m => m.union === "LBA").length,
      UFOA: allMembers.filter(m => m.union === "UFOA").length
    };
    
    // Get fulfillment metrics
    const fulfillmentMetrics = {
      awaiting_shipment: allMembers.filter(m => m.status === "awaiting_shipment").length,
      shipped: allMembers.filter(m => m.status === "shipped").length,
      delivered: allMembers.filter(m => m.status === "delivered").length
    };
    
    // Get triage metrics
    const pendingTriageCases = await aiTriageService.getPendingTriageCases();
    
    // Get communication metrics
    const communicationAnalytics = await communicationService.getCommunicationAnalytics();
    
    const dashboardData = {
      members: {
        total: allMembers.length,
        pendingVerification: pendingVerification.length,
        active: activeMembers.length,
        inactive: inactiveMembers.length,
        pendingFirstReading: pendingFirstReading.length,
        unionBreakdown
      },
      fulfillment: {
        ...fulfillmentMetrics,
        totalRequested: fulfillmentMetrics.awaiting_shipment + fulfillmentMetrics.shipped + fulfillmentMetrics.delivered
      },
      clinical: {
        pendingTriageCases: pendingTriageCases.length,
        // BP control rate would be calculated from BP readings
        bpControlRate: 75, // Mock percentage
        interventionConversionRate: 85 // Mock percentage
      },
      communication: communicationAnalytics
    };
    
    res.json({ success: true, dashboard: dashboardData });
  } catch (error) {
    console.error('Get analytics dashboard error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics dashboard" });
  }
});

// Member analytics by union
router.get("/analytics/members/union/:union", async (req, res) => {
  try {
    const union = req.params.union;
    const unionMembers = await memberService.getMembersByUnion(union);
    
    const analytics = {
      total: unionMembers.length,
      byStatus: {
        pending_verification: unionMembers.filter(m => m.status === "pending_verification").length,
        awaiting_shipment: unionMembers.filter(m => m.status === "awaiting_shipment").length,
        pending_first_reading: unionMembers.filter(m => m.status === "pending_first_reading").length,
        active_members: unionMembers.filter(m => m.status === "active_members").length,
        inactive_members: unionMembers.filter(m => m.status === "inactive_members").length
      },
      registrationTrend: {
        // Mock monthly registration data
        thisMonth: Math.floor(unionMembers.length * 0.1),
        lastMonth: Math.floor(unionMembers.length * 0.08),
        twoMonthsAgo: Math.floor(unionMembers.length * 0.12)
      }
    };
    
    res.json({ success: true, union, analytics });
  } catch (error) {
    console.error('Get union analytics error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch union analytics" });
  }
});

// Fulfillment queue analytics
router.get("/analytics/fulfillment", async (req, res) => {
  try {
    const queues = [
      "ShipNYC_UFA_Queue",
      "ShipNYC_MountSinai_Queue", 
      "Union_LBA_Fulfillment_Queue",
      "Union_UFOA_Fulfillment_Queue"
    ];
    
    const queueAnalytics = await Promise.all(
      queues.map(async (queueName) => {
        const fulfillments = await memberService.getFulfillmentsByQueue(queueName);
        return {
          queue: queueName,
          total: fulfillments.length,
          awaitingShipment: fulfillments.filter(f => f.fulfillmentStatus === "awaiting_shipment").length,
          shipped: fulfillments.filter(f => f.fulfillmentStatus === "shipped").length,
          delivered: fulfillments.filter(f => f.fulfillmentStatus === "delivered").length,
          averageProcessingTime: "2.5 days" // Mock data
        };
      })
    );
    
    res.json({ success: true, queueAnalytics });
  } catch (error) {
    console.error('Get fulfillment analytics error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch fulfillment analytics" });
  }
});

// Clinical intervention analytics
router.get("/analytics/clinical", async (req, res) => {
  try {
    const { timeRange } = req.query;
    
    // Get all triage cases (in real app, filter by time range)
    const allTriageCases = await Promise.all([
      aiTriageService.getPendingTriageCases(),
      // In real implementation, get completed cases too
    ]);
    
    const pendingCases = allTriageCases[0];
    
    const clinicalAnalytics = {
      totalTriageCases: pendingCases.length,
      aiRecommendations: {
        none: pendingCases.filter(t => t.aiRecommendation === "none").length,
        coach: pendingCases.filter(t => t.aiRecommendation === "coach").length,
        nurse_practitioner: pendingCases.filter(t => t.aiRecommendation === "nurse_practitioner").length
      },
      averageConfidence: pendingCases.length > 0 
        ? pendingCases.reduce((sum, t) => sum + parseFloat(t.aiConfidence.toString()), 0) / pendingCases.length 
        : 0,
      humanOverrideRate: 15, // Mock percentage
      interventionOutcomes: {
        successful: 78, // Mock percentage
        ongoing: 15,
        escalated: 7
      }
    };
    
    res.json({ success: true, analytics: clinicalAnalytics });
  } catch (error) {
    console.error('Get clinical analytics error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch clinical analytics" });
  }
});

// Real-time metrics for monitoring
router.get("/analytics/realtime", async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const realtimeMetrics = {
      timestamp: now,
      newRegistrations24h: 3, // Mock data - would query by date range
      pendingVerifications: (await memberService.getPendingVerificationMembers()).length,
      activeTriageCases: (await aiTriageService.getPendingTriageCases()).length,
      followUpsDue: (await communicationService.getFollowUpQueue()).length,
      systemHealth: {
        database: "healthy",
        aiTriage: "healthy",
        fulfillmentQueues: "healthy",
        communications: "healthy"
      }
    };
    
    res.json({ success: true, metrics: realtimeMetrics });
  } catch (error) {
    console.error('Get realtime analytics error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch realtime analytics" });
  }
});

export default router;