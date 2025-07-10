import { 
  communications, messages,
  type Communication, type InsertCommunication,
  type Message, type InsertMessage
} from "@shared/schema";

/**
 * AI-driven communication management and follow-up service
 */
export class CommunicationService {
  private communicationStorage: Map<number, Communication>;
  private messageStorage: Map<number, Message>;
  private currentId: number;
  private messageId: number;

  constructor() {
    this.communicationStorage = new Map();
    this.messageStorage = new Map();
    this.currentId = 1;
    this.messageId = 1;
  }

  /**
   * Log a communication event (call, email, SMS, etc.)
   */
  async logCommunication(communicationData: InsertCommunication): Promise<Communication> {
    // Analyze sentiment using AI
    const sentiment = this.analyzeSentiment(communicationData.content);
    
    // Determine if follow-up is needed using AI
    const followUpAnalysis = this.analyzeFollowUpNeed(communicationData);

    const communication: Communication = {
      ...communicationData,
      id: this.currentId++,
      sentiment,
      aiFollowUpRecommended: followUpAnalysis.recommended,
      aiFollowUpDate: followUpAnalysis.date,
      aiFollowUpReason: followUpAnalysis.reason,
      manualFollowUpDate: null,
      manualFollowUpReason: null,
      followUpOverriddenBy: null,
      status: followUpAnalysis.recommended ? "scheduled_follow_up" : "active",
      isRead: communicationData.direction === "outbound", // Outbound messages are automatically read
      createdAt: new Date(),
      scheduledFor: communicationData.scheduledFor || null
    };

    this.communicationStorage.set(communication.id, communication);
    return communication;
  }

  /**
   * AI sentiment analysis of communication content
   */
  private analyzeSentiment(content: string): string {
    const lowercaseContent = content.toLowerCase();
    
    // Negative sentiment indicators
    const negativeWords = ['frustrated', 'angry', 'upset', 'difficult', 'problem', 'complaint', 'worried', 'concerned', 'scared'];
    const negativeCount = negativeWords.filter(word => lowercaseContent.includes(word)).length;
    
    // Positive sentiment indicators
    const positiveWords = ['thank', 'appreciate', 'helpful', 'good', 'great', 'satisfied', 'happy', 'pleased'];
    const positiveCount = positiveWords.filter(word => lowercaseContent.includes(word)).length;
    
    if (negativeCount > positiveCount && negativeCount >= 2) {
      return "negative";
    } else if (positiveCount > negativeCount && positiveCount >= 2) {
      return "positive";
    } else {
      return "neutral";
    }
  }

  /**
   * AI analysis to determine if follow-up is needed
   */
  private analyzeFollowUpNeed(communication: InsertCommunication): {
    recommended: boolean;
    date: Date | null;
    reason: string | null;
  } {
    const content = communication.content.toLowerCase();
    const outcome = communication.outcome;
    
    // Always follow up on unresolved issues
    if (outcome === "unresolved") {
      return {
        recommended: true,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        reason: "Unresolved issue requires follow-up"
      };
    }
    
    // Follow up on no answer calls
    if (outcome === "no_answer" && communication.type === "call") {
      return {
        recommended: true,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        reason: "No answer - attempt contact again"
      };
    }
    
    // Follow up on escalated cases
    if (outcome === "escalated") {
      return {
        recommended: true,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        reason: "Escalated case needs status check"
      };
    }
    
    // Follow up on medication changes mentioned
    if (content.includes("medication") || content.includes("prescription")) {
      return {
        recommended: true,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        reason: "Medication discussion requires follow-up"
      };
    }
    
    // Follow up on negative sentiment
    const sentiment = this.analyzeSentiment(communication.content);
    if (sentiment === "negative") {
      return {
        recommended: true,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        reason: "Negative interaction requires attention"
      };
    }
    
    // Follow up on needs_follow_up outcome
    if (outcome === "needs_follow_up") {
      return {
        recommended: true,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        reason: "Explicit follow-up request"
      };
    }
    
    return {
      recommended: false,
      date: null,
      reason: null
    };
  }

  /**
   * Override AI follow-up recommendation manually
   */
  async overrideFollowUp(
    communicationId: number,
    overriddenBy: number,
    newFollowUpDate: Date | null,
    reason: string
  ): Promise<Communication | undefined> {
    const communication = this.communicationStorage.get(communicationId);
    if (!communication) return undefined;

    const updatedCommunication: Communication = {
      ...communication,
      manualFollowUpDate: newFollowUpDate,
      manualFollowUpReason: reason,
      followUpOverriddenBy: overriddenBy,
      status: newFollowUpDate ? "scheduled_follow_up" : "resolved"
    };

    this.communicationStorage.set(communicationId, updatedCommunication);
    return updatedCommunication;
  }

  /**
   * Get communications requiring follow-up
   */
  async getFollowUpQueue(): Promise<Communication[]> {
    const now = new Date();
    return Array.from(this.communicationStorage.values()).filter(comm => {
      if (comm.status !== "scheduled_follow_up") return false;
      
      const followUpDate = comm.manualFollowUpDate || comm.aiFollowUpDate;
      return followUpDate && followUpDate <= now;
    });
  }

  /**
   * Get active communications dashboard
   */
  async getActiveCommunications(): Promise<Communication[]> {
    return Array.from(this.communicationStorage.values()).filter(comm => 
      comm.status === "active" || comm.status === "scheduled_follow_up"
    );
  }

  /**
   * Mark communication as resolved
   */
  async resolveCommunication(communicationId: number): Promise<Communication | undefined> {
    const communication = this.communicationStorage.get(communicationId);
    if (!communication) return undefined;

    const updatedCommunication: Communication = {
      ...communication,
      status: "resolved"
    };

    this.communicationStorage.set(communicationId, updatedCommunication);
    return updatedCommunication;
  }

  /**
   * Get communications by member
   */
  async getCommunicationsByMember(memberId: number): Promise<Communication[]> {
    return Array.from(this.communicationStorage.values()).filter(comm => comm.memberId === memberId);
  }

  /**
   * Get communications assigned to staff member
   */
  async getCommunicationsByStaff(staffId: number): Promise<Communication[]> {
    return Array.from(this.communicationStorage.values()).filter(comm => comm.staffId === staffId);
  }

  // Two-way messaging system
  
  /**
   * Send message (staff to member or member to staff)
   */
  async sendMessage(messageData: InsertMessage): Promise<Message> {
    const conversationId = messageData.conversationId || this.generateConversationId(messageData);
    
    const message: Message = {
      ...messageData,
      id: this.messageId++,
      conversationId,
      isRead: false,
      readAt: null,
      createdAt: new Date()
    };

    this.messageStorage.set(message.id, message);
    return message;
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: number): Promise<Message | undefined> {
    const message = this.messageStorage.get(messageId);
    if (!message) return undefined;

    const updatedMessage: Message = {
      ...message,
      isRead: true,
      readAt: new Date()
    };

    this.messageStorage.set(messageId, updatedMessage);
    return updatedMessage;
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return Array.from(this.messageStorage.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Get unread messages for staff
   */
  async getUnreadMessagesForStaff(staffId: number): Promise<Message[]> {
    return Array.from(this.messageStorage.values()).filter(msg => 
      msg.recipientId === staffId && !msg.isRead
    );
  }

  /**
   * Get unread messages for member
   */
  async getUnreadMessagesForMember(memberId: number): Promise<Message[]> {
    return Array.from(this.messageStorage.values()).filter(msg => 
      msg.recipientMemberId === memberId && !msg.isRead
    );
  }

  /**
   * Get member's conversations
   */
  async getMemberConversations(memberId: number): Promise<string[]> {
    const conversations = new Set<string>();
    Array.from(this.messageStorage.values()).forEach(msg => {
      if (msg.senderMemberId === memberId || msg.recipientMemberId === memberId) {
        conversations.add(msg.conversationId);
      }
    });
    return Array.from(conversations);
  }

  /**
   * Generate conversation ID for new conversations
   */
  private generateConversationId(messageData: InsertMessage): string {
    if (messageData.senderMemberId && messageData.recipientId) {
      return `member_${messageData.senderMemberId}_staff_${messageData.recipientId}`;
    } else if (messageData.senderId && messageData.recipientMemberId) {
      return `staff_${messageData.senderId}_member_${messageData.recipientMemberId}`;
    }
    return `conv_${Date.now()}`;
  }

  /**
   * Get communication analytics
   */
  async getCommunicationAnalytics(timeRange?: { start: Date; end: Date }): Promise<{
    totalCommunications: number;
    callsCount: number;
    messagesCount: number;
    resolutionRate: number;
    followUpRate: number;
    averageResponseTime: number;
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
  }> {
    let communications = Array.from(this.communicationStorage.values());
    
    if (timeRange) {
      communications = communications.filter(comm => 
        comm.createdAt >= timeRange.start && comm.createdAt <= timeRange.end
      );
    }

    const totalCommunications = communications.length;
    const callsCount = communications.filter(c => c.type === "call").length;
    const messagesCount = communications.filter(c => c.type === "in_app_message" || c.type === "sms").length;
    
    const resolvedCount = communications.filter(c => c.outcome === "resolved").length;
    const resolutionRate = totalCommunications > 0 ? (resolvedCount / totalCommunications) * 100 : 0;
    
    const followUpCount = communications.filter(c => c.aiFollowUpRecommended || c.manualFollowUpDate).length;
    const followUpRate = totalCommunications > 0 ? (followUpCount / totalCommunications) * 100 : 0;
    
    // Sentiment breakdown
    const positive = communications.filter(c => c.sentiment === "positive").length;
    const neutral = communications.filter(c => c.sentiment === "neutral").length;
    const negative = communications.filter(c => c.sentiment === "negative").length;

    return {
      totalCommunications,
      callsCount,
      messagesCount,
      resolutionRate,
      followUpRate,
      averageResponseTime: 4.5, // Mock average in hours
      sentimentBreakdown: { positive, neutral, negative }
    };
  }
}

export const communicationService = new CommunicationService();