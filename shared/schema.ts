import { pgTable, text, serial, integer, boolean, timestamp, decimal, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Staff/Admin Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'admin', 'clinical_team', 'fulfillment_team', 'communication_staff', 'union_rep'
  email: text("email"),
  phone: text("phone"),
  unionAffiliation: text("union_affiliation"), // For union-specific users
  createdAt: timestamp("created_at").defaultNow(),
});

// Program Members (formerly patients)
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  // Basic Info
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender"), // 'male', 'female', 'other', 'prefer_not_to_say'
  email: text("email"),
  mobilePhone: text("mobile_phone"),
  mailingAddress: jsonb("mailing_address"), // {street, city, state, zip}
  
  // Union Info
  union: text("union").notNull(), // 'UFA', 'Mount Sinai', 'LBA', 'UFOA'
  unionId: text("union_id"), // Union-specific member ID
  
  // Physical Info
  height: integer("height_inches"), // Height in inches
  weight: integer("weight_lbs"), // Weight in pounds
  
  // Medical History
  pastMedicalHistory: jsonb("past_medical_history"), // Checkboxes + free text
  lifestyleQuestions: jsonb("lifestyle_questions"), // smoking, alcohol, exercise, diet, sleep
  currentMedications: text("current_medications"),
  emergencyContact: jsonb("emergency_contact"), // {name, phone, relationship}
  
  // Status and Verification
  status: text("status").notNull().default("pending_verification"), 
  // Statuses: pending_verification, approved, rejected, awaiting_shipment, shipped, delivered, pending_first_reading, active_members, inactive_members
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at"),
});

// BP Cuff Fulfillment Tracking
export const cuffFulfillment = pgTable("cuff_fulfillment", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  
  // Shipping Info
  shippingAddress: jsonb("shipping_address").notNull(), // {street, city, state, zip}
  fulfillmentPath: text("fulfillment_path").notNull(), // 'shipnyc', 'union_inventory'
  fulfillmentQueue: text("fulfillment_queue").notNull(), // 'ShipNYC_UFA_Queue', 'Union_LBA_Fulfillment_Queue', etc.
  
  // Tracking
  trackingNumber: text("tracking_number"),
  carrier: text("carrier"), // 'ups', 'fedex', 'usps', etc.
  trackingUrl: text("tracking_url"),
  trackingEnteredBy: integer("tracking_entered_by").references(() => users.id),
  trackingEnteredAt: timestamp("tracking_entered_at"),
  
  // Status
  fulfillmentStatus: text("fulfillment_status").notNull().default("awaiting_shipment"),
  // Statuses: awaiting_shipment, shipped, in_transit, out_for_delivery, delivered, fulfilled
  statusHistory: jsonb("status_history"), // Array of {status, timestamp, source}
  
  // Timestamps
  requestedAt: timestamp("requested_at").defaultNow(),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
});

// Keep existing patients table for backward compatibility
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  department: text("department").notNull(),
  union: text("union").notNull(),
  age: integer("age").notNull(),
  email: text("email"),
  phone: text("phone"),
  medications: text("medications"),
  allergies: text("allergies"),
  lastCheckup: timestamp("last_checkup"),
  customSystolicThreshold: integer("custom_systolic_threshold"),
  customDiastolicThreshold: integer("custom_diastolic_threshold"),
  status: text("status").notNull().default("awaiting_confirmation"),
  approvedAt: timestamp("approved_at"),
  approvedBy: integer("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// BP Readings (updated to support both members and patients)
export const bpReadings = pgTable("bp_readings", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id), // New member reference
  patientId: integer("patient_id").references(() => patients.id), // Legacy patient reference
  systolic: integer("systolic").notNull(),
  diastolic: integer("diastolic").notNull(),
  heartRate: integer("heart_rate"),
  notes: text("notes"),
  recordedBy: integer("recorded_by"), // Nullable for app submissions
  recordedAt: timestamp("recorded_at").defaultNow(),
  syncedFromDevice: boolean("synced_from_device").default(false), // Bluetooth sync indicator
  isAbnormal: boolean("is_abnormal").notNull().default(false),
  category: text("category").notNull(), // 'normal', 'abnormal'
});

// AI Triage and Clinical Review
export const clinicalTriage = pgTable("clinical_triage", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  bpReadingId: integer("bp_reading_id").notNull().references(() => bpReadings.id),
  
  // AI Triage Results
  aiRecommendation: text("ai_recommendation").notNull(), // 'none', 'coach', 'nurse_practitioner'
  aiConfidence: decimal("ai_confidence", { precision: 3, scale: 2 }), // 0.00 - 1.00
  aiReasoning: text("ai_reasoning"), // AI explanation
  flaggedTrends: jsonb("flagged_trends"), // Array of trend flags
  
  // Clinical Inputs for AI
  bpTrends: jsonb("bp_trends"), // Historical BP data analysis
  communicationHistory: jsonb("communication_history"), // Previous call outcomes
  
  // Human Review
  clinicalReview: text("clinical_review"), // 'pending', 'confirmed', 'overridden'
  clinicalDecision: text("clinical_decision"), // Final intervention type
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Assignment
  assignedStaffId: integer("assigned_staff_id").references(() => users.id),
  interventionDueDate: timestamp("intervention_due_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Communication System
export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id),
  patientId: integer("patient_id").references(() => patients.id), // Legacy support
  staffId: integer("staff_id").notNull().references(() => users.id),
  
  // Communication Details
  type: text("type").notNull(), // 'call', 'sms', 'email', 'in_app_message', 'note'
  direction: text("direction").notNull(), // 'inbound', 'outbound'
  subject: text("subject"), // For messages
  content: text("content").notNull(),
  
  // Call-specific fields
  callDuration: integer("call_duration_seconds"),
  callOutcome: text("call_outcome"), // 'answered', 'no_answer', 'voicemail', 'busy'
  
  // Status and Follow-up
  outcome: text("outcome"), // 'resolved', 'unresolved', 'escalated', 'needs_follow_up'
  sentiment: text("sentiment"), // 'positive', 'neutral', 'negative' (AI analysis)
  
  // AI Follow-up Management
  aiFollowUpRecommended: boolean("ai_follow_up_recommended").default(false),
  aiFollowUpDate: timestamp("ai_follow_up_date"),
  aiFollowUpReason: text("ai_follow_up_reason"),
  
  // Manual Follow-up Override
  manualFollowUpDate: timestamp("manual_follow_up_date"),
  manualFollowUpReason: text("manual_follow_up_reason"),
  followUpOverriddenBy: integer("follow_up_overridden_by").references(() => users.id),
  
  // Status tracking
  status: text("status").notNull().default("active"), // 'active', 'scheduled_follow_up', 'resolved'
  isRead: boolean("is_read").default(false), // For messages
  
  createdAt: timestamp("created_at").defaultNow(),
  scheduledFor: timestamp("scheduled_for"), // For scheduled communications
});

// Two-way messaging system
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: text("conversation_id").notNull(), // Groups related messages
  
  // Participants
  senderId: integer("sender_id"), // User ID if sent by staff
  senderMemberId: integer("sender_member_id").references(() => members.id), // Member ID if sent by member
  recipientId: integer("recipient_id"), // User ID if sent to staff
  recipientMemberId: integer("recipient_member_id").references(() => members.id), // Member ID if sent to member
  
  // Message content
  subject: text("subject"),
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text"), // 'text', 'image', 'file'
  attachments: jsonb("attachments"), // Array of attachment metadata
  
  // Status
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  
  // Threading
  replyToMessageId: integer("reply_to_message_id").references(() => messages.id),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Workflow Tasks (updated for new system)
export const workflowTasks = pgTable("workflow_tasks", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id), // New member reference
  patientId: integer("patient_id").references(() => patients.id), // Legacy patient reference
  
  assignedTo: integer("assigned_to").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  taskType: text("task_type").notNull(), // 'verification', 'cuff_fulfillment', 'clinical_intervention', 'follow_up'
  priority: text("priority").notNull(), // 'low', 'medium', 'high', 'critical'
  status: text("status").notNull().default('pending'), // 'pending', 'in_progress', 'completed', 'cancelled'
  
  // AI-related fields
  createdByAi: boolean("created_by_ai").default(false),
  aiReasoning: text("ai_reasoning"),
  
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Legacy communication log (keep for backward compatibility)
export const communicationLog = pgTable("communication_log", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'call', 'email', 'note'
  message: text("message").notNull(),
  notes: text("notes"),
  outcome: text("outcome"), // 'resolved', 'unresolved', 'escalated', 'no_answer'
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export const insertCuffFulfillmentSchema = createInsertSchema(cuffFulfillment).omit({
  id: true,
  requestedAt: true,
  shippedAt: true,
  deliveredAt: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertBpReadingSchema = createInsertSchema(bpReadings).omit({
  id: true,
  recordedAt: true,
  isAbnormal: true,
  category: true,
});

export const insertClinicalTriageSchema = createInsertSchema(clinicalTriage).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export const insertWorkflowTaskSchema = createInsertSchema(workflowTasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertCommunicationLogSchema = createInsertSchema(communicationLog).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;

export type CuffFulfillment = typeof cuffFulfillment.$inferSelect;
export type InsertCuffFulfillment = z.infer<typeof insertCuffFulfillmentSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type BpReading = typeof bpReadings.$inferSelect;
export type InsertBpReading = z.infer<typeof insertBpReadingSchema>;

export type ClinicalTriage = typeof clinicalTriage.$inferSelect;
export type InsertClinicalTriage = z.infer<typeof insertClinicalTriageSchema>;

export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type WorkflowTask = typeof workflowTasks.$inferSelect;
export type InsertWorkflowTask = z.infer<typeof insertWorkflowTaskSchema>;

export type CommunicationLog = typeof communicationLog.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
