// Member service for union-based hypertension program
export class MemberService {
  async getMembers(union?: string, status?: string) {
    // Mock implementation for member service
    return {
      success: true,
      members: [
        {
          id: 1,
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
          rejectionReason: null,
          createdAt: new Date(),
          lastActiveAt: new Date()
        },
        {
          id: 2,
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
          rejectionReason: null,
          createdAt: new Date(),
          lastActiveAt: new Date()
        },
        {
          id: 3,
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
          rejectionReason: null,
          createdAt: new Date(),
          lastActiveAt: new Date()
        }
      ]
    };
  }

  async createMember(memberData: any) {
    // Mock implementation for creating member
    return {
      id: Date.now(),
      ...memberData,
      createdAt: new Date()
    };
  }

  async getMembersByUnion(union: string) {
    const allMembers = await this.getMembers();
    return allMembers.members.filter((member: any) => member.union === union);
  }

  async getMembersByStatus(status: string) {
    const allMembers = await this.getMembers();
    return allMembers.members.filter((member: any) => member.status === status);
  }
}

export const memberService = new MemberService();