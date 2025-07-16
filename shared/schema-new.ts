import { pgTable, text, serial, integer, boolean, timestamp, decimal, date, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===== LOOKUP TABLES FOR STRING VALUES =====
// These normalize all string values to integer IDs for efficient queries

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // admin, clinical_team, fulfillment_team, communication_staff, union_rep
  description: text("description"),
});

export const unions = pgTable("unions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // UFA, Mount Sinai, LBA, UFOA
  code: text("code").notNull().unique(), // Short code for union
  fulfillmentMethod: text("fulfillment_method"), // shipnyc, union_inventory
});

export const genders = pgTable("genders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // male, female, other, prefer_not_to_say
});

export const memberStatuses = pgTable("member_statuses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // pending_verification, approved, rejected, awaiting_shipment, shipped, delivered, pending_first_reading, active_members, inactive_members
  description: text("description"),
  isActive: boolean("is_active").default(true),
});

export const taskStatuses = pgTable("task_statuses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // pending, in_progress, completed, cancelled
  description: text("description"),
});

export const taskPriorities = pgTable("task_priorities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // low, medium, high, urgent
  level: integer("level").notNull(), // 1-4 for ordering
});

export const taskTypes = pgTable("task_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // coach_outreach, nurse_outreach, urgent_call, follow_up
  description: text("description"),
});

export const bpCategories = pgTable("bp_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // normal, elevated, stage1, stage2, crisis
  code: text("code").notNull().unique(), // NORM, ELEV, S1HT, S2HT, CRIS
  color: text("color"), // For UI display
  isAbnormal: boolean("is_abnormal").default(false),
  priority: integer("priority").notNull(), // 1-5 for ordering
});

export const communicationTypes = pgTable("communication_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // phone, email, text, in_app, mail
  description: text("description"),
});

export const communicationStatuses = pgTable("communication_statuses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // pending, sent, delivered, read, responded, failed
  description: text("description"),
});

export const fulfillmentStatuses = pgTable("fulfillment_statuses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // requested, queued, processing, shipped, delivered, failed
  description: text("description"),
});

// ===== MAIN ENTITY TABLES =====

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  roleId: integer("role_id").notNull().references(() => roles.id),
  email: text("email"),
  phone: text("phone"),
  unionId: integer("union_id").references(() => unions.id), // For union-specific users
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  // Basic Info
  fullName: text("full_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  genderId: integer("gender_id").references(() => genders.id),
  email: text("email"),
  mobilePhone: text("mobile_phone"),
  mailingAddress: jsonb("mailing_address"), // {street, city, state, zip}
  
  // Union Info
  unionId: integer("union_id").notNull().references(() => unions.id),
  unionMemberId: text("union_member_id"), // Union-specific member ID
  
  // Physical Info
  height: integer("height_inches"), // Height in inches
  weight: integer("weight_lbs"), // Weight in pounds
  
  // Medical History
  pastMedicalHistory: jsonb("past_medical_history"), // Checkboxes + free text
  lifestyleQuestions: jsonb("lifestyle_questions"), // smoking, alcohol, exercise, diet, sleep
  currentMedications: text("current_medications"),
  emergencyContact: jsonb("emergency_contact"), // {name, phone, relationship}
  
  // Status and Verification
  statusId: integer("status_id").notNull().references(() => memberStatuses.id),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at"),
});

export const bpReadings = pgTable("bp_readings", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  systolic: integer("systolic").notNull(),
  diastolic: integer("diastolic").notNull(),
  heartRate: integer("heart_rate"),
  categoryId: integer("category_id").notNull().references(() => bpCategories.id),
  notes: text("notes"),
  recordedBy: integer("recorded_by").references(() => users.id),
  recordedAt: timestamp("recorded_at").defaultNow(),
  deviceId: text("device_id"), // For device sync
  syncedFromDevice: boolean("synced_from_device").default(false),
  isAbnormal: boolean("is_abnormal").default(false),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflowTasks = pgTable("workflow_tasks", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  
  // Task Details
  title: text("title").notNull(),
  description: text("description"),
  typeId: integer("type_id").notNull().references(() => taskTypes.id),
  priorityId: integer("priority_id").notNull().references(() => taskPriorities.id),
  statusId: integer("status_id").notNull().references(() => taskStatuses.id),
  
  // AI Generated Task Info
  createdByAi: boolean("created_by_ai").default(false),
  aiReasoning: text("ai_reasoning"),
  relatedBpReadingId: integer("related_bp_reading_id").references(() => bpReadings.id),
  
  // Scheduling
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fulfillmentRequests = pgTable("fulfillment_requests", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  unionId: integer("union_id").notNull().references(() => unions.id),
  
  // Request Details
  requestType: text("request_type").notNull(), // initial_cuff, replacement_cuff, accessories
  statusId: integer("status_id").notNull().references(() => fulfillmentStatuses.id),
  
  // Shipping Info
  shippingAddress: jsonb("shipping_address"), // {street, city, state, zip}
  carrierName: text("carrier_name"),
  trackingNumber: text("tracking_number"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  
  // Queue Management
  queuePosition: integer("queue_position"),
  assignedTo: integer("assigned_to").references(() => users.id),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  
  // Communication Details
  typeId: integer("type_id").notNull().references(() => communicationTypes.id),
  statusId: integer("status_id").notNull().references(() => communicationStatuses.id),
  subject: text("subject"),
  content: text("content"),
  
  // AI Analysis
  aiSentiment: text("ai_sentiment"), // positive, neutral, negative, urgent
  aiPriorityScore: decimal("ai_priority_score", { precision: 3, scale: 2 }),
  aiSummary: text("ai_summary"),
  
  // Metadata
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  respondedAt: timestamp("responded_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  communicationId: integer("communication_id").notNull().references(() => communications.id),
  senderId: integer("sender_id").references(() => users.id), // null if from member
  recipientId: integer("recipient_id").references(() => users.id), // null if to member
  
  // Message Content
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // text, image, file, system
  
  // Status
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export const clinicalTriage = pgTable("clinical_triage", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  bpReadingId: integer("bp_reading_id").notNull().references(() => bpReadings.id),
  
  // AI Triage Results
  riskScore: decimal("risk_score", { precision: 3, scale: 2 }),
  recommendedActionId: integer("recommended_action_id").references(() => taskTypes.id),
  priorityId: integer("priority_id").references(() => taskPriorities.id),
  aiReasoning: text("ai_reasoning"),
  
  // Clinical Review
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  clinicalNotes: text("clinical_notes"),
  overrideReason: text("override_reason"),
  
  // Generated Tasks
  taskGenerated: boolean("task_generated").default(false),
  generatedTaskId: integer("generated_task_id").references(() => workflowTasks.id),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== RELATIONS =====

export const roleRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const unionRelations = relations(unions, ({ many }) => ({
  members: many(members),
  users: many(users),
  fulfillmentRequests: many(fulfillmentRequests),
}));

export const genderRelations = relations(genders, ({ many }) => ({
  members: many(members),
}));

export const memberStatusRelations = relations(memberStatuses, ({ many }) => ({
  members: many(members),
}));

export const taskStatusRelations = relations(taskStatuses, ({ many }) => ({
  tasks: many(workflowTasks),
}));

export const taskPriorityRelations = relations(taskPriorities, ({ many }) => ({
  tasks: many(workflowTasks),
  triages: many(clinicalTriage),
}));

export const taskTypeRelations = relations(taskTypes, ({ many }) => ({
  tasks: many(workflowTasks),
  triages: many(clinicalTriage),
}));

export const bpCategoryRelations = relations(bpCategories, ({ many }) => ({
  readings: many(bpReadings),
}));

export const communicationTypeRelations = relations(communicationTypes, ({ many }) => ({
  communications: many(communications),
}));

export const communicationStatusRelations = relations(communicationStatuses, ({ many }) => ({
  communications: many(communications),
}));

export const fulfillmentStatusRelations = relations(fulfillmentStatuses, ({ many }) => ({
  requests: many(fulfillmentRequests),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  union: one(unions, {
    fields: [users.unionId],
    references: [unions.id],
  }),
  verifiedMembers: many(members),
  assignedTasks: many(workflowTasks),
  assignedCommunications: many(communications),
  assignedFulfillments: many(fulfillmentRequests),
  clinicalReviews: many(clinicalTriage),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "recipient" }),
  recordedReadings: many(bpReadings),
}));

export const memberRelations = relations(members, ({ one, many }) => ({
  gender: one(genders, {
    fields: [members.genderId],
    references: [genders.id],
  }),
  union: one(unions, {
    fields: [members.unionId],
    references: [unions.id],
  }),
  status: one(memberStatuses, {
    fields: [members.statusId],
    references: [memberStatuses.id],
  }),
  verifiedBy: one(users, {
    fields: [members.verifiedBy],
    references: [users.id],
  }),
  bpReadings: many(bpReadings),
  tasks: many(workflowTasks),
  communications: many(communications),
  fulfillmentRequests: many(fulfillmentRequests),
  triages: many(clinicalTriage),
}));

export const bpReadingRelations = relations(bpReadings, ({ one, many }) => ({
  member: one(members, {
    fields: [bpReadings.memberId],
    references: [members.id],
  }),
  category: one(bpCategories, {
    fields: [bpReadings.categoryId],
    references: [bpCategories.id],
  }),
  recordedBy: one(users, {
    fields: [bpReadings.recordedBy],
    references: [users.id],
  }),
  triages: many(clinicalTriage),
  relatedTasks: many(workflowTasks),
}));

export const workflowTaskRelations = relations(workflowTasks, ({ one }) => ({
  member: one(members, {
    fields: [workflowTasks.memberId],
    references: [members.id],
  }),
  assignedTo: one(users, {
    fields: [workflowTasks.assignedTo],
    references: [users.id],
  }),
  type: one(taskTypes, {
    fields: [workflowTasks.typeId],
    references: [taskTypes.id],
  }),
  priority: one(taskPriorities, {
    fields: [workflowTasks.priorityId],
    references: [taskPriorities.id],
  }),
  status: one(taskStatuses, {
    fields: [workflowTasks.statusId],
    references: [taskStatuses.id],
  }),
  relatedBpReading: one(bpReadings, {
    fields: [workflowTasks.relatedBpReadingId],
    references: [bpReadings.id],
  }),
}));

export const fulfillmentRequestRelations = relations(fulfillmentRequests, ({ one }) => ({
  member: one(members, {
    fields: [fulfillmentRequests.memberId],
    references: [members.id],
  }),
  union: one(unions, {
    fields: [fulfillmentRequests.unionId],
    references: [unions.id],
  }),
  status: one(fulfillmentStatuses, {
    fields: [fulfillmentRequests.statusId],
    references: [fulfillmentStatuses.id],
  }),
  assignedTo: one(users, {
    fields: [fulfillmentRequests.assignedTo],
    references: [users.id],
  }),
}));

export const communicationRelations = relations(communications, ({ one, many }) => ({
  member: one(members, {
    fields: [communications.memberId],
    references: [members.id],
  }),
  assignedTo: one(users, {
    fields: [communications.assignedTo],
    references: [users.id],
  }),
  type: one(communicationTypes, {
    fields: [communications.typeId],
    references: [communicationTypes.id],
  }),
  status: one(communicationStatuses, {
    fields: [communications.statusId],
    references: [communicationStatuses.id],
  }),
  messages: many(messages),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  communication: one(communications, {
    fields: [messages.communicationId],
    references: [communications.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
  }),
}));

export const clinicalTriageRelations = relations(clinicalTriage, ({ one }) => ({
  member: one(members, {
    fields: [clinicalTriage.memberId],
    references: [members.id],
  }),
  bpReading: one(bpReadings, {
    fields: [clinicalTriage.bpReadingId],
    references: [bpReadings.id],
  }),
  recommendedAction: one(taskTypes, {
    fields: [clinicalTriage.recommendedActionId],
    references: [taskTypes.id],
  }),
  priority: one(taskPriorities, {
    fields: [clinicalTriage.priorityId],
    references: [taskPriorities.id],
  }),
  reviewedBy: one(users, {
    fields: [clinicalTriage.reviewedBy],
    references: [users.id],
  }),
  generatedTask: one(workflowTasks, {
    fields: [clinicalTriage.generatedTaskId],
    references: [workflowTasks.id],
  }),
}));

// ===== INSERT SCHEMAS =====

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export const insertBpReadingSchema = createInsertSchema(bpReadings).omit({
  id: true,
  createdAt: true,
  recordedAt: true,
});

export const insertWorkflowTaskSchema = createInsertSchema(workflowTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFulfillmentRequestSchema = createInsertSchema(fulfillmentRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertClinicalTriageSchema = createInsertSchema(clinicalTriage).omit({
  id: true,
  createdAt: true,
});

// ===== TYPE EXPORTS =====

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;

export type BpReading = typeof bpReadings.$inferSelect;
export type InsertBpReading = z.infer<typeof insertBpReadingSchema>;

export type WorkflowTask = typeof workflowTasks.$inferSelect;
export type InsertWorkflowTask = z.infer<typeof insertWorkflowTaskSchema>;

export type FulfillmentRequest = typeof fulfillmentRequests.$inferSelect;
export type InsertFulfillmentRequest = z.infer<typeof insertFulfillmentRequestSchema>;

export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type ClinicalTriage = typeof clinicalTriage.$inferSelect;
export type InsertClinicalTriage = z.infer<typeof insertClinicalTriageSchema>;

// Lookup table types
export type Role = typeof roles.$inferSelect;
export type Union = typeof unions.$inferSelect;
export type Gender = typeof genders.$inferSelect;
export type MemberStatus = typeof memberStatuses.$inferSelect;
export type TaskStatus = typeof taskStatuses.$inferSelect;
export type TaskPriority = typeof taskPriorities.$inferSelect;
export type TaskType = typeof taskTypes.$inferSelect;
export type BpCategory = typeof bpCategories.$inferSelect;
export type CommunicationType = typeof communicationTypes.$inferSelect;
export type CommunicationStatus = typeof communicationStatuses.$inferSelect;
export type FulfillmentStatus = typeof fulfillmentStatuses.$inferSelect;