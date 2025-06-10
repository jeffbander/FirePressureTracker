import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'admin', 'nurse', 'coach'
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  department: text("department").notNull(),
  union: text("union").notNull(),
  age: integer("age").notNull(),
  email: text("email"),
  phone: text("phone"),
  emergencyContact: text("emergency_contact"),
  medications: text("medications"), // JSON string
  allergies: text("allergies"),
  lastCheckup: timestamp("last_checkup"),
  customSystolicThreshold: integer("custom_systolic_threshold"), // Custom alert threshold for systolic
  customDiastolicThreshold: integer("custom_diastolic_threshold"), // Custom alert threshold for diastolic
  createdAt: timestamp("created_at").defaultNow(),
});

export const bpReadings = pgTable("bp_readings", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  systolic: integer("systolic").notNull(),
  diastolic: integer("diastolic").notNull(),
  heartRate: integer("heart_rate"),
  notes: text("notes"),
  recordedBy: integer("recorded_by").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
  isAbnormal: boolean("is_abnormal").notNull().default(false),
  category: text("category").notNull(), // 'normal', 'elevated', 'stage1', 'stage2', 'critical', 'low'
});

export const workflowTasks = pgTable("workflow_tasks", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  assignedTo: integer("assigned_to").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull(), // 'low', 'medium', 'high', 'critical'
  status: text("status").notNull().default('pending'), // 'pending', 'in_progress', 'completed'
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communicationLog = pgTable("communication_log", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'call', 'email', 'note'
  message: text("message").notNull(),
  notes: text("notes"), // Additional call notes for hypertension workflow
  outcome: text("outcome"), // 'resolved', 'unresolved', 'escalated', 'no_answer'
  followUpDate: timestamp("follow_up_date"), // When next contact should occur
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
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

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type BpReading = typeof bpReadings.$inferSelect;
export type InsertBpReading = z.infer<typeof insertBpReadingSchema>;

export type WorkflowTask = typeof workflowTasks.$inferSelect;
export type InsertWorkflowTask = z.infer<typeof insertWorkflowTaskSchema>;

export type CommunicationLog = typeof communicationLog.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
