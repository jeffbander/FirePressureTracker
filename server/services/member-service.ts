import { 
  members, cuffFulfillment, bpReadings, clinicalTriage, communications, messages,
  type Member, type InsertMember,
  type CuffFulfillment, type InsertCuffFulfillment,
  type BpReading, type InsertBpReading,
  type ClinicalTriage, type InsertClinicalTriage,
  type Communication, type InsertCommunication,
  type Message, type InsertMessage
} from "@shared/schema";

/**
 * Service for managing program members in the union-based hypertension program
 */
export class MemberService {
  private memberStorage: Map<number, Member>;
  private fulfillmentStorage: Map<number, CuffFulfillment>;
  private currentId: number;

  constructor() {
    this.memberStorage = new Map();
    this.fulfillmentStorage = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    // Create demo members for each union
    const demoMembers: Omit<Member, 'id' | 'createdAt' | 'lastActiveAt'>[] = [
      {
        fullName: "John Rodriguez",
        dateOfBirth: "1985-03-15",
        gender: "male",
        email: "j.rodriguez@ufa.org",
        mobilePhone: "(555) 123-4567",
        mailingAddress: {
          street: "123 Fire Station Way",
          city: "New York",
          state: "NY",
          zip: "10001"
        },
        union: "UFA",
        unionId: "UFA-001",
        height: 72,
        weight: 185,
        pastMedicalHistory: {
          hypertension: true,
          diabetes: false,
          heartDisease: false,
          otherConditions: "None"
        },
        lifestyleQuestions: {
          smoking: "never",
          alcohol: "occasionally",
          exercise: "3-4 times per week",
          diet: "balanced",
          sleep: "7-8 hours"
        },
        currentMedications: "Lisinopril 10mg daily",
        emergencyContact: {
          name: "Maria Rodriguez",
          phone: "(555) 987-6543",
          relationship: "spouse"
        },
        status: "active_members",
        verifiedAt: new Date(),
        verifiedBy: 1,
        rejectionReason: null
      },
      {
        fullName: "Sarah Johnson",
        dateOfBirth: "1990-07-22",
        gender: "female",
        email: "s.johnson@mountsinai.org",
        mobilePhone: "(555) 234-5678",
        mailingAddress: {
          street: "456 Hospital Drive",
          city: "New York",
          state: "NY",
          zip: "10029"
        },
        union: "Mount Sinai",
        unionId: "MS-002",
        height: 65,
        weight: 140,
        pastMedicalHistory: {
          hypertension: false,
          diabetes: false,
          heartDisease: false,
          otherConditions: "None"
        },
        lifestyleQuestions: {
          smoking: "never",
          alcohol: "rarely",
          exercise: "daily",
          diet: "healthy",
          sleep: "6-7 hours"
        },
        currentMedications: "None",
        emergencyContact: {
          name: "Robert Johnson",
          phone: "(555) 876-5432",
          relationship: "father"
        },
        status: "pending_first_reading",
        verifiedAt: new Date(),
        verifiedBy: 1,
        rejectionReason: null
      },
      {
        fullName: "Michael Thompson",
        dateOfBirth: "1978-11-08",
        gender: "male",
        email: "m.thompson@lba.org",
        mobilePhone: "(555) 345-6789",
        mailingAddress: {
          street: "789 Borough Hall",
          city: "Brooklyn",
          state: "NY",
          zip: "11201"
        },
        union: "LBA",
        unionId: "LBA-003",
        height: 70,
        weight: 200,
        pastMedicalHistory: {
          hypertension: true,
          diabetes: true,
          heartDisease: false,
          otherConditions: "High cholesterol"
        },
        lifestyleQuestions: {
          smoking: "former",
          alcohol: "weekly",
          exercise: "2-3 times per week",
          diet: "working on improvement",
          sleep: "5-6 hours"
        },
        currentMedications: "Metformin 500mg, Lisinopril 20mg",
        emergencyContact: {
          name: "Linda Thompson",
          phone: "(555) 765-4321",
          relationship: "spouse"
        },
        status: "inactive_members",
        verifiedAt: new Date(),
        verifiedBy: 1,
        rejectionReason: null
      }
    ];

    demoMembers.forEach(memberData => {
      const member: Member = {
        ...memberData,
        id: this.currentId++,
        createdAt: new Date(),
        lastActiveAt: new Date()
      };
      this.memberStorage.set(member.id, member);
    });
  }

  // Member CRUD operations
  async getMember(id: number): Promise<Member | undefined> {
    return this.memberStorage.get(id);
  }

  async getMemberByUnionId(unionId: string): Promise<Member | undefined> {
    for (const member of this.memberStorage.values()) {
      if (member.unionId === unionId) {
        return member;
      }
    }
    return undefined;
  }

  async getAllMembers(): Promise<Member[]> {
    return Array.from(this.memberStorage.values());
  }

  async getMembersByUnion(union: string): Promise<Member[]> {
    return Array.from(this.memberStorage.values()).filter(m => m.union === union);
  }

  async getMembersByStatus(status: string): Promise<Member[]> {
    return Array.from(this.memberStorage.values()).filter(m => m.status === status);
  }

  async getPendingVerificationMembers(): Promise<Member[]> {
    return this.getMembersByStatus("pending_verification");
  }

  async getActiveMembers(): Promise<Member[]> {
    return this.getMembersByStatus("active_members");
  }

  async getInactiveMembers(): Promise<Member[]> {
    return this.getMembersByStatus("inactive_members");
  }

  async createMember(memberData: InsertMember): Promise<Member> {
    const member: Member = {
      ...memberData,
      id: this.currentId++,
      createdAt: new Date(),
      lastActiveAt: new Date()
    };
    this.memberStorage.set(member.id, member);
    return member;
  }

  async updateMember(id: number, updates: Partial<Member>): Promise<Member | undefined> {
    const member = this.memberStorage.get(id);
    if (!member) return undefined;

    const updatedMember = { ...member, ...updates };
    this.memberStorage.set(id, updatedMember);
    return updatedMember;
  }

  async verifyMember(id: number, verifiedBy: number, approved: boolean, rejectionReason?: string): Promise<Member | undefined> {
    const member = this.memberStorage.get(id);
    if (!member) return undefined;

    const updates: Partial<Member> = {
      verifiedAt: new Date(),
      verifiedBy,
      status: approved ? "awaiting_shipment" : "rejected",
      rejectionReason: approved ? null : rejectionReason
    };

    return this.updateMember(id, updates);
  }

  // Get fulfillment path based on union
  getFulfillmentPath(union: string): { path: string; queue: string } {
    const fulfillmentRules: Record<string, { path: string; queue: string }> = {
      "UFA": { path: "shipnyc", queue: "ShipNYC_UFA_Queue" },
      "Mount Sinai": { path: "shipnyc", queue: "ShipNYC_MountSinai_Queue" },
      "LBA": { path: "union_inventory", queue: "Union_LBA_Fulfillment_Queue" },
      "UFOA": { path: "union_inventory", queue: "Union_UFOA_Fulfillment_Queue" }
    };

    return fulfillmentRules[union] || { path: "shipnyc", queue: "ShipNYC_Default_Queue" };
  }

  // Cuff fulfillment operations
  async requestCuff(memberId: number, shippingAddress: any): Promise<CuffFulfillment | undefined> {
    const member = await this.getMember(memberId);
    if (!member) return undefined;

    const fulfillmentInfo = this.getFulfillmentPath(member.union);
    
    const fulfillment: CuffFulfillment = {
      id: this.currentId++,
      memberId,
      shippingAddress,
      fulfillmentPath: fulfillmentInfo.path,
      fulfillmentQueue: fulfillmentInfo.queue,
      trackingNumber: null,
      carrier: null,
      trackingUrl: null,
      trackingEnteredBy: null,
      trackingEnteredAt: null,
      fulfillmentStatus: "awaiting_shipment",
      statusHistory: [
        {
          status: "awaiting_shipment",
          timestamp: new Date(),
          source: "system"
        }
      ],
      requestedAt: new Date(),
      shippedAt: null,
      deliveredAt: null
    };

    this.fulfillmentStorage.set(fulfillment.id, fulfillment);
    
    // Update member status
    await this.updateMember(memberId, { status: "awaiting_shipment" });
    
    return fulfillment;
  }

  async updateFulfillmentTracking(
    fulfillmentId: number, 
    trackingNumber: string, 
    carrier: string, 
    trackingUrl: string,
    updatedBy: number
  ): Promise<CuffFulfillment | undefined> {
    const fulfillment = this.fulfillmentStorage.get(fulfillmentId);
    if (!fulfillment) return undefined;

    const updatedFulfillment: CuffFulfillment = {
      ...fulfillment,
      trackingNumber,
      carrier,
      trackingUrl,
      trackingEnteredBy: updatedBy,
      trackingEnteredAt: new Date(),
      fulfillmentStatus: "shipped",
      shippedAt: new Date(),
      statusHistory: [
        ...(fulfillment.statusHistory || []),
        {
          status: "shipped",
          timestamp: new Date(),
          source: "manual_entry"
        }
      ]
    };

    this.fulfillmentStorage.set(fulfillmentId, updatedFulfillment);
    
    // Update member status
    await this.updateMember(fulfillment.memberId, { status: "shipped" });
    
    return updatedFulfillment;
  }

  async markDelivered(fulfillmentId: number): Promise<CuffFulfillment | undefined> {
    const fulfillment = this.fulfillmentStorage.get(fulfillmentId);
    if (!fulfillment) return undefined;

    const updatedFulfillment: CuffFulfillment = {
      ...fulfillment,
      fulfillmentStatus: "delivered",
      deliveredAt: new Date(),
      statusHistory: [
        ...(fulfillment.statusHistory || []),
        {
          status: "delivered",
          timestamp: new Date(),
          source: "carrier_webhook"
        }
      ]
    };

    this.fulfillmentStorage.set(fulfillmentId, updatedFulfillment);
    
    // Update member status to pending_first_reading after delivery
    await this.updateMember(fulfillment.memberId, { status: "pending_first_reading" });
    
    return updatedFulfillment;
  }

  async getFulfillmentsByQueue(queue: string): Promise<CuffFulfillment[]> {
    return Array.from(this.fulfillmentStorage.values()).filter(f => f.fulfillmentQueue === queue);
  }

  async getFulfillmentByMember(memberId: number): Promise<CuffFulfillment | undefined> {
    for (const fulfillment of this.fulfillmentStorage.values()) {
      if (fulfillment.memberId === memberId) {
        return fulfillment;
      }
    }
    return undefined;
  }

  // Member list management based on BP reading activity
  async updateMemberActivityStatus(memberId: number, hasRecentReading: boolean): Promise<void> {
    const member = await this.getMember(memberId);
    if (!member) return;

    let newStatus = member.status;
    
    if (member.status === "pending_first_reading" && hasRecentReading) {
      newStatus = "active_members";
    } else if (member.status === "active_members" && !hasRecentReading) {
      newStatus = "inactive_members";
    } else if (member.status === "inactive_members" && hasRecentReading) {
      newStatus = "active_members";
    }

    if (newStatus !== member.status) {
      await this.updateMember(memberId, { 
        status: newStatus,
        lastActiveAt: hasRecentReading ? new Date() : member.lastActiveAt
      });
    }
  }
}

export const memberService = new MemberService();