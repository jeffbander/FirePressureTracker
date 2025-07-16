import { db } from "../server/db";
import { 
  roles, unions, genders, memberStatuses, taskStatuses, taskPriorities, 
  taskTypes, bpCategories, communicationTypes, communicationStatuses, 
  fulfillmentStatuses 
} from "../shared/schema";

async function initializeLookupTables() {
  console.log("Initializing lookup tables...");

  // Initialize roles
  await db.insert(roles).values([
    { name: "admin", description: "System administrator" },
    { name: "clinical_team", description: "Clinical staff (nurses, doctors)" },
    { name: "fulfillment_team", description: "Fulfillment and shipping staff" },
    { name: "communication_staff", description: "Communication and support staff" },
    { name: "union_rep", description: "Union representative" },
    { name: "coach", description: "Health coach" },
    { name: "nurse", description: "Registered nurse" },
  ]).onConflictDoNothing();

  // Initialize unions
  await db.insert(unions).values([
    { name: "UFA", code: "UFA", fulfillmentMethod: "shipnyc" },
    { name: "Mount Sinai", code: "MSSNY", fulfillmentMethod: "shipnyc" },
    { name: "LBA", code: "LBA", fulfillmentMethod: "union_inventory" },
    { name: "UFOA", code: "UFOA", fulfillmentMethod: "union_inventory" },
  ]).onConflictDoNothing();

  // Initialize genders
  await db.insert(genders).values([
    { name: "male" },
    { name: "female" },
    { name: "other" },
    { name: "prefer_not_to_say" },
  ]).onConflictDoNothing();

  // Initialize member statuses
  await db.insert(memberStatuses).values([
    { name: "pending_verification", description: "Awaiting union verification", isActive: false },
    { name: "approved", description: "Approved by union", isActive: true },
    { name: "rejected", description: "Rejected by union", isActive: false },
    { name: "awaiting_shipment", description: "Awaiting cuff shipment", isActive: true },
    { name: "shipped", description: "Cuff shipped", isActive: true },
    { name: "delivered", description: "Cuff delivered", isActive: true },
    { name: "pending_first_reading", description: "Awaiting first BP reading", isActive: true },
    { name: "active_members", description: "Active program members", isActive: true },
    { name: "inactive_members", description: "Inactive program members", isActive: false },
  ]).onConflictDoNothing();

  // Initialize task statuses
  await db.insert(taskStatuses).values([
    { name: "pending", description: "Task not yet started" },
    { name: "in_progress", description: "Task is being worked on" },
    { name: "completed", description: "Task completed successfully" },
    { name: "cancelled", description: "Task cancelled" },
  ]).onConflictDoNothing();

  // Initialize task priorities
  await db.insert(taskPriorities).values([
    { name: "low", level: 1 },
    { name: "medium", level: 2 },
    { name: "high", level: 3 },
    { name: "urgent", level: 4 },
  ]).onConflictDoNothing();

  // Initialize task types
  await db.insert(taskTypes).values([
    { name: "coach_outreach", description: "Coach outreach for BP management" },
    { name: "nurse_outreach", description: "Nurse practitioner consultation" },
    { name: "urgent_call", description: "Urgent medical consultation" },
    { name: "follow_up", description: "Follow-up communication" },
    { name: "no_action", description: "No action required" },
  ]).onConflictDoNothing();

  // Initialize BP categories
  await db.insert(bpCategories).values([
    { name: "normal", code: "NORM", color: "#22c55e", isAbnormal: false, priority: 1 },
    { name: "elevated", code: "ELEV", color: "#eab308", isAbnormal: true, priority: 2 },
    { name: "stage1", code: "S1HT", color: "#f97316", isAbnormal: true, priority: 3 },
    { name: "stage2", code: "S2HT", color: "#ef4444", isAbnormal: true, priority: 4 },
    { name: "crisis", code: "CRIS", color: "#dc2626", isAbnormal: true, priority: 5 },
  ]).onConflictDoNothing();

  // Initialize communication types
  await db.insert(communicationTypes).values([
    { name: "phone", description: "Phone call" },
    { name: "email", description: "Email communication" },
    { name: "text", description: "Text message" },
    { name: "in_app", description: "In-app messaging" },
    { name: "mail", description: "Postal mail" },
  ]).onConflictDoNothing();

  // Initialize communication statuses
  await db.insert(communicationStatuses).values([
    { name: "pending", description: "Communication not yet sent" },
    { name: "sent", description: "Communication sent" },
    { name: "delivered", description: "Communication delivered" },
    { name: "read", description: "Communication read" },
    { name: "responded", description: "Communication responded to" },
    { name: "failed", description: "Communication failed" },
  ]).onConflictDoNothing();

  // Initialize fulfillment statuses
  await db.insert(fulfillmentStatuses).values([
    { name: "requested", description: "Fulfillment requested" },
    { name: "queued", description: "In fulfillment queue" },
    { name: "processing", description: "Being processed" },
    { name: "shipped", description: "Shipped to member" },
    { name: "delivered", description: "Delivered successfully" },
    { name: "failed", description: "Fulfillment failed" },
  ]).onConflictDoNothing();

  console.log("✓ Lookup tables initialized successfully");
}

async function createSampleData() {
  console.log("Creating sample data...");
  
  // Create sample admin user
  const adminUser = await db.insert(roles).values([
    { name: "admin", description: "System administrator" }
  ]).onConflictDoNothing().returning();

  console.log("✓ Sample data created successfully");
}

async function main() {
  try {
    await initializeLookupTables();
    await createSampleData();
    console.log("\n🎉 Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { initializeLookupTables, createSampleData };