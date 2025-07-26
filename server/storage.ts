import { db } from "./db";
import { eq, and, desc, or, sql } from "drizzle-orm";
import { 
  users, members, bpReadings, workflowTasks, communications, messages, 
  clinicalTriage, fulfillmentRequests, roles, unions, genders, 
  memberStatuses, taskStatuses, taskPriorities, taskTypes, bpCategories,
  communicationTypes, communicationStatuses, fulfillmentStatuses
} from "@shared/schema";
import type { 
  User, InsertUser, Member, InsertMember, BpReading, InsertBpReading,
  WorkflowTask, InsertWorkflowTask, Communication, InsertCommunication,
  Message, InsertMessage, ClinicalTriage, InsertClinicalTriage,
  FulfillmentRequest, InsertFulfillmentRequest
} from "@shared/schema";
import { calculateAge } from "@shared/date-utils";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  findUserByRole(roleName: string): Promise<User | undefined>;
  
  // Member operations (previously patients)
  getMember(id: number): Promise<Member | undefined>;
  getMemberByEmployeeId(employeeId: string): Promise<Member | undefined>;
  getAllMembers(): Promise<Member[]>;
  getPendingMembers(): Promise<Member[]>;
  getPendingMembersByUnion(unionName: string): Promise<Member[]>;
  getMembersByStatus(statusName: string): Promise<Member[]>;
  getInactiveMembers(): Promise<Member[]>;
  searchMembers(query: string): Promise<Member[]>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, updates: Partial<Member>): Promise<Member | undefined>;
  approveMember(id: number, approvedBy: number, newStatusName: string): Promise<Member | undefined>;
  
  // BP Reading operations
  getBpReading(id: number): Promise<BpReading | undefined>;
  getBpReadingsByMember(memberId: number): Promise<BpReading[]>;
  getAbnormalReadings(): Promise<BpReading[]>;
  getRecentReadings(limit?: number): Promise<BpReading[]>;
  createBpReading(reading: InsertBpReading): Promise<BpReading>;
  
  // Workflow operations
  getWorkflowTask(id: number): Promise<WorkflowTask | undefined>;
  getWorkflowTasksByAssignee(userId: number): Promise<WorkflowTask[]>;
  getWorkflowTasksByMember(memberId: number): Promise<WorkflowTask[]>;
  getAllWorkflowTasks(): Promise<WorkflowTask[]>;
  createWorkflowTask(task: InsertWorkflowTask): Promise<WorkflowTask>;
  updateWorkflowTask(id: number, updates: Partial<WorkflowTask>): Promise<WorkflowTask | undefined>;
  
  // Communication operations
  getCommunicationsByMember(memberId: number): Promise<Communication[]>;
  createCommunication(communication: InsertCommunication): Promise<Communication>;
  
  // Lookup table operations
  getRoleByName(name: string): Promise<{ id: number; name: string } | undefined>;
  getUnion(id: number): Promise<{ id: number; name: string } | undefined>;
  getUnionByName(name: string): Promise<{ id: number; name: string } | undefined>;
  getGenderByName(name: string): Promise<{ id: number; name: string } | undefined>;
  getMemberStatusByName(name: string): Promise<{ id: number; name: string } | undefined>;
  getTaskStatusByName(name: string): Promise<{ id: number; name: string } | undefined>;
  getTaskPriorityByName(name: string): Promise<{ id: number; name: string; level: number } | undefined>;
  getTaskTypeByName(name: string): Promise<{ id: number; name: string } | undefined>;
  getBpCategoryByName(name: string): Promise<{ id: number; name: string; code: string } | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Lookup table methods
  async getRoleByName(name: string) {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role;
  }

  async getUnion(id: number) {
    const [union] = await db.select().from(unions).where(eq(unions.id, id));
    return union;
  }

  async getUnionByName(name: string) {
    const [union] = await db.select().from(unions).where(eq(unions.name, name));
    return union;
  }

  async getGenderByName(name: string) {
    const [gender] = await db.select().from(genders).where(eq(genders.name, name));
    return gender;
  }

  async getMemberStatusByName(name: string) {
    const [status] = await db.select().from(memberStatuses).where(eq(memberStatuses.name, name));
    return status;
  }

  async getTaskStatusByName(name: string) {
    const [status] = await db.select().from(taskStatuses).where(eq(taskStatuses.name, name));
    return status;
  }

  async getTaskPriorityByName(name: string) {
    const [priority] = await db.select().from(taskPriorities).where(eq(taskPriorities.name, name));
    return priority;
  }

  async getTaskTypeByName(name: string) {
    const [taskType] = await db.select().from(taskTypes).where(eq(taskTypes.name, name));
    return taskType;
  }

  async getBpCategoryByName(name: string) {
    const [category] = await db.select().from(bpCategories).where(eq(bpCategories.name, name));
    return category;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async findUserByRole(roleName: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(roles.name, roleName));
    return user?.users;
  }

  // Member operations (previously patients)
  async getMember(id: number): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  }

  async getMemberByEmployeeId(employeeId: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.unionMemberId, employeeId));
    return member;
  }

  async getAllMembers(): Promise<Member[]> {
    return await db.select().from(members);
  }

  async getPendingMembers(): Promise<Member[]> {
    const pendingStatus = await this.getMemberStatusByName("pending_verification");
    if (!pendingStatus) return [];
    return await db.select().from(members).where(eq(members.statusId, pendingStatus.id));
  }

  async getPendingMembersByUnion(unionName: string): Promise<Member[]> {
    const union = await this.getUnionByName(unionName);
    const pendingStatus = await this.getMemberStatusByName("pending_verification");
    if (!union || !pendingStatus) return [];
    
    return await db.select().from(members)
      .where(and(
        eq(members.unionId, union.id),
        eq(members.statusId, pendingStatus.id)
      ));
  }

  async getMembersByStatus(statusName: string): Promise<Member[]> {
    const status = await this.getMemberStatusByName(statusName);
    if (!status) return [];
    return await db.select().from(members).where(eq(members.statusId, status.id));
  }

  async getInactiveMembers(): Promise<Member[]> {
    const inactiveStatus = await this.getMemberStatusByName("inactive_members");
    if (!inactiveStatus) return [];
    return await db.select().from(members).where(eq(members.statusId, inactiveStatus.id));
  }

  async searchMembers(query: string): Promise<Member[]> {
    return await db.select().from(members)
      .where(or(
        sql`${members.fullName} ILIKE ${`%${query}%`}`,
        sql`${members.email} ILIKE ${`%${query}%`}`,
        sql`${members.unionMemberId} ILIKE ${`%${query}%`}`
      ));
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const [member] = await db.insert(members).values(insertMember).returning();
    return member;
  }

  async updateMember(id: number, updates: Partial<Member>): Promise<Member | undefined> {
    const [member] = await db.update(members)
      .set(updates)
      .where(eq(members.id, id))
      .returning();
    return member;
  }

  async approveMember(id: number, approvedBy: number, newStatusName: string): Promise<Member | undefined> {
    const status = await this.getMemberStatusByName(newStatusName);
    if (!status) return undefined;

    const [member] = await db.update(members)
      .set({
        statusId: status.id,
        verifiedAt: new Date(),
        verifiedBy: approvedBy
      })
      .where(eq(members.id, id))
      .returning();
    return member;
  }

  // BP Reading operations
  async getBpReading(id: number): Promise<BpReading | undefined> {
    const [reading] = await db.select().from(bpReadings).where(eq(bpReadings.id, id));
    return reading;
  }

  async getBpReadingsByMember(memberId: number): Promise<BpReading[]> {
    return await db.select().from(bpReadings)
      .where(eq(bpReadings.memberId, memberId))
      .orderBy(desc(bpReadings.recordedAt));
  }

  async getAbnormalReadings(): Promise<BpReading[]> {
    return await db.select().from(bpReadings)
      .where(eq(bpReadings.isAbnormal, true))
      .orderBy(desc(bpReadings.recordedAt));
  }

  async getRecentReadings(limit: number = 10): Promise<BpReading[]> {
    return await db.select().from(bpReadings)
      .orderBy(desc(bpReadings.recordedAt))
      .limit(limit);
  }

  async createBpReading(insertReading: InsertBpReading): Promise<BpReading> {
    const [reading] = await db.insert(bpReadings).values(insertReading).returning();
    return reading;
  }

  // Workflow operations
  async getWorkflowTask(id: number): Promise<WorkflowTask | undefined> {
    const [task] = await db.select().from(workflowTasks).where(eq(workflowTasks.id, id));
    return task;
  }

  async getWorkflowTasksByAssignee(userId: number): Promise<WorkflowTask[]> {
    return await db.select().from(workflowTasks)
      .where(eq(workflowTasks.assignedTo, userId))
      .orderBy(desc(workflowTasks.createdAt));
  }

  async getWorkflowTasksByMember(memberId: number): Promise<WorkflowTask[]> {
    return await db.select().from(workflowTasks)
      .where(eq(workflowTasks.memberId, memberId))
      .orderBy(desc(workflowTasks.createdAt));
  }

  async getAllWorkflowTasks(): Promise<WorkflowTask[]> {
    return await db.select().from(workflowTasks)
      .orderBy(desc(workflowTasks.createdAt));
  }

  async createWorkflowTask(insertTask: InsertWorkflowTask): Promise<WorkflowTask> {
    const [task] = await db.insert(workflowTasks).values(insertTask).returning();
    return task;
  }

  async updateWorkflowTask(id: number, updates: Partial<WorkflowTask>): Promise<WorkflowTask | undefined> {
    const [task] = await db.update(workflowTasks)
      .set(updates)
      .where(eq(workflowTasks.id, id))
      .returning();
    return task;
  }

  // Communication operations
  async getCommunicationsByMember(memberId: number): Promise<Communication[]> {
    return await db.select().from(communications)
      .where(eq(communications.memberId, memberId))
      .orderBy(desc(communications.createdAt));
  }

  async createCommunication(insertCommunication: InsertCommunication): Promise<Communication> {
    const [communication] = await db.insert(communications).values(insertCommunication).returning();
    return communication;
  }
}

export const storage = new DatabaseStorage();