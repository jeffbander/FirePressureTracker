import { Router } from "express";
import { communicationService } from "../services/communication-service";
import { aiTriageService } from "../services/ai-triage-service";
import { insertCommunicationSchema, insertMessageSchema } from "@shared/schema";

const router = Router();

// Communication logging
router.post("/communications", async (req, res) => {
  try {
    const validated = insertCommunicationSchema.parse(req.body);
    const communication = await communicationService.logCommunication(validated);
    
    res.status(201).json({
      success: true,
      message: "Communication logged successfully",
      communication
    });
  } catch (error) {
    console.error('Log communication error:', error);
    res.status(400).json({ 
      success: false,
      message: "Invalid communication data",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get active communications dashboard
router.get("/communications/dashboard", async (req, res) => {
  try {
    const { staffId } = req.query;
    
    let communications;
    if (staffId) {
      communications = await communicationService.getCommunicationsByStaff(parseInt(staffId as string));
    } else {
      communications = await communicationService.getActiveCommunications();
    }
    
    res.json({ success: true, communications });
  } catch (error) {
    console.error('Get communications dashboard error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch communications dashboard" });
  }
});

// Get follow-up queue
router.get("/communications/follow-up-queue", async (req, res) => {
  try {
    const followUpQueue = await communicationService.getFollowUpQueue();
    
    res.json({ 
      success: true, 
      followUpQueue,
      count: followUpQueue.length
    });
  } catch (error) {
    console.error('Get follow-up queue error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch follow-up queue" });
  }
});

// Override AI follow-up recommendation
router.patch("/communications/:id/follow-up", async (req, res) => {
  try {
    const communicationId = parseInt(req.params.id);
    const { overriddenBy, newFollowUpDate, reason } = req.body;
    
    if (!overriddenBy || !reason) {
      return res.status(400).json({ success: false, message: "Missing required override information" });
    }
    
    const updatedCommunication = await communicationService.overrideFollowUp(
      communicationId,
      overriddenBy,
      newFollowUpDate ? new Date(newFollowUpDate) : null,
      reason
    );
    
    if (!updatedCommunication) {
      return res.status(404).json({ success: false, message: "Communication not found" });
    }
    
    res.json({
      success: true,
      message: "Follow-up schedule updated",
      communication: updatedCommunication
    });
  } catch (error) {
    console.error('Override follow-up error:', error);
    res.status(500).json({ success: false, message: "Failed to override follow-up" });
  }
});

// Resolve communication
router.patch("/communications/:id/resolve", async (req, res) => {
  try {
    const communicationId = parseInt(req.params.id);
    
    const updatedCommunication = await communicationService.resolveCommunication(communicationId);
    
    if (!updatedCommunication) {
      return res.status(404).json({ success: false, message: "Communication not found" });
    }
    
    res.json({
      success: true,
      message: "Communication resolved",
      communication: updatedCommunication
    });
  } catch (error) {
    console.error('Resolve communication error:', error);
    res.status(500).json({ success: false, message: "Failed to resolve communication" });
  }
});

// Get member's communication history
router.get("/communications/member/:memberId", async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    const communications = await communicationService.getCommunicationsByMember(memberId);
    
    res.json({ success: true, communications });
  } catch (error) {
    console.error('Get member communications error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch member communications" });
  }
});

// Communication analytics
router.get("/communications/analytics", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let timeRange;
    if (startDate && endDate) {
      timeRange = {
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      };
    }
    
    const analytics = await communicationService.getCommunicationAnalytics(timeRange);
    
    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Get communication analytics error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch communication analytics" });
  }
});

// Two-way messaging system

// Send message
router.post("/messages", async (req, res) => {
  try {
    const validated = insertMessageSchema.parse(req.body);
    const message = await communicationService.sendMessage(validated);
    
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      messageData: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(400).json({ 
      success: false,
      message: "Invalid message data",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get conversation messages
router.get("/messages/conversation/:conversationId", async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const messages = await communicationService.getConversationMessages(conversationId);
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch conversation messages" });
  }
});

// Mark message as read
router.patch("/messages/:id/read", async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const updatedMessage = await communicationService.markMessageAsRead(messageId);
    
    if (!updatedMessage) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    
    res.json({
      success: true,
      message: "Message marked as read",
      messageData: updatedMessage
    });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ success: false, message: "Failed to mark message as read" });
  }
});

// Get unread messages for staff
router.get("/messages/unread/staff/:staffId", async (req, res) => {
  try {
    const staffId = parseInt(req.params.staffId);
    const unreadMessages = await communicationService.getUnreadMessagesForStaff(staffId);
    
    res.json({ 
      success: true, 
      unreadMessages,
      count: unreadMessages.length
    });
  } catch (error) {
    console.error('Get unread messages error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch unread messages" });
  }
});

// Get unread messages for member
router.get("/messages/unread/member/:memberId", async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    const unreadMessages = await communicationService.getUnreadMessagesForMember(memberId);
    
    res.json({ 
      success: true, 
      unreadMessages,
      count: unreadMessages.length
    });
  } catch (error) {
    console.error('Get unread messages error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch unread messages" });
  }
});

// Get member's conversations
router.get("/messages/conversations/member/:memberId", async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    const conversations = await communicationService.getMemberConversations(memberId);
    
    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Get member conversations error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch member conversations" });
  }
});

export default router;