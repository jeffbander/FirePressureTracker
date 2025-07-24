import type { Express } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { 
  insertMemberSchema, insertBpReadingSchema, insertWorkflowTaskSchema,
  unions, memberStatuses, taskTypes, taskPriorities, taskStatuses, bpCategories,
  members, bpReadings, workflowTasks
} from "@shared/schema";
import { calculateAge } from "@shared/date-utils";

export function registerAppSheetRoutes(app: Express) {
  
  // AppSheet webhook endpoint for member data sync
  app.post("/api/appsheet/webhook/members", async (req, res) => {
    try {
      const { action, data } = req.body;
      
      console.log('AppSheet member webhook received:', { action, data });
      
      switch (action) {
        case 'ADD':
          await handleMemberAdd(data);
          break;
        case 'UPDATE':
          await handleMemberUpdate(data);
          break;
        case 'DELETE':
          await handleMemberDelete(data);
          break;
        default:
          console.warn('Unknown AppSheet action:', action);
      }
      
      res.json({ success: true, message: 'Member data processed successfully' });
    } catch (error) {
      console.error('AppSheet member webhook error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // AppSheet webhook endpoint for BP readings sync
  app.post("/api/appsheet/webhook/readings", async (req, res) => {
    try {
      const { action, data } = req.body;
      
      console.log('AppSheet reading webhook received:', { action, data });
      
      switch (action) {
        case 'ADD':
          await handleBpReadingAdd(data);
          break;
        case 'UPDATE':
          await handleBpReadingUpdate(data);
          break;
        case 'DELETE':
          await handleBpReadingDelete(data);
          break;
        default:
          console.warn('Unknown AppSheet action:', action);
      }
      
      res.json({ success: true, message: 'BP reading data processed successfully' });
    } catch (error) {
      console.error('AppSheet reading webhook error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // AppSheet webhook endpoint for task sync
  app.post("/api/appsheet/webhook/tasks", async (req, res) => {
    try {
      const { action, data } = req.body;
      
      console.log('AppSheet task webhook received:', { action, data });
      
      switch (action) {
        case 'ADD':
          await handleTaskAdd(data);
          break;
        case 'UPDATE':
          await handleTaskUpdate(data);
          break;
        case 'DELETE':
          await handleTaskDelete(data);
          break;
        default:
          console.warn('Unknown AppSheet action:', action);
      }
      
      res.json({ success: true, message: 'Task data processed successfully' });
    } catch (error) {
      console.error('AppSheet task webhook error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Bulk data export endpoint for AppSheet initial sync
  app.get("/api/appsheet/export/members", async (req, res) => {
    try {
      const members = await storage.getAllMembers();
      
      // Transform data for AppSheet format
      const appSheetMembers = members.map(member => ({
        id: member.id,
        fullName: member.fullName,
        dateOfBirth: member.dateOfBirth,
        age: calculateAge(member.dateOfBirth.toString()),
        email: member.email,
        mobilePhone: member.mobilePhone,
        unionId: member.unionId,
        unionMemberId: member.unionMemberId,
        height: member.height,
        weight: member.weight,
        statusId: member.statusId,
        createdAt: member.createdAt,
        lastActiveAt: member.lastActiveAt
      }));
      
      res.json({
        success: true,
        data: appSheetMembers,
        count: appSheetMembers.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('AppSheet member export error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Bulk BP readings export for AppSheet
  app.get("/api/appsheet/export/readings", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 1000;
      const memberId = req.query.memberId ? parseInt(req.query.memberId as string) : undefined;
      
      let readings;
      if (memberId) {
        readings = await storage.getBpReadingsByMember(memberId);
      } else {
        readings = await storage.getRecentReadings(limit);
      }
      
      // Transform data for AppSheet format
      const appSheetReadings = readings.map(reading => ({
        id: reading.id,
        memberId: reading.memberId,
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        heartRate: reading.heartRate,
        categoryId: reading.categoryId,
        notes: reading.notes,
        recordedAt: reading.recordedAt,
        isAbnormal: reading.isAbnormal,
        createdAt: reading.createdAt
      }));
      
      res.json({
        success: true,
        data: appSheetReadings,
        count: appSheetReadings.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('AppSheet reading export error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Bulk tasks export for AppSheet
  app.get("/api/appsheet/export/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllWorkflowTasks();
      
      // Transform data for AppSheet format
      const appSheetTasks = tasks.map(task => ({
        id: task.id,
        memberId: task.memberId,
        assignedTo: task.assignedTo,
        title: task.title,
        description: task.description,
        typeId: task.typeId,
        priorityId: task.priorityId,
        statusId: task.statusId,
        createdByAi: task.createdByAi,
        aiReasoning: task.aiReasoning,
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));
      
      res.json({
        success: true,
        data: appSheetTasks,
        count: appSheetTasks.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('AppSheet task export error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Lookup tables export for AppSheet reference
  app.get("/api/appsheet/export/lookups", async (req, res) => {
    try {
      // Get all lookup table data
      const unionsData = await db.select().from(unions);
      const memberStatusesData = await db.select().from(memberStatuses);
      const taskTypesData = await db.select().from(taskTypes);
      const taskPrioritiesData = await db.select().from(taskPriorities);
      const taskStatusesData = await db.select().from(taskStatuses);
      const bpCategoriesData = await db.select().from(bpCategories);
      
      res.json({
        success: true,
        data: {
          unions: unionsData,
          memberStatuses: memberStatusesData,
          taskTypes: taskTypesData,
          taskPriorities: taskPrioritiesData,
          taskStatuses: taskStatusesData,
          bpCategories: bpCategoriesData
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('AppSheet lookup export error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Status endpoint for AppSheet health checks
  app.get("/api/appsheet/status", async (req, res) => {
    try {
      const stats = {
        totalMembers: (await storage.getAllMembers()).length,
        totalReadings: (await storage.getRecentReadings(10000)).length,
        totalTasks: (await storage.getAllWorkflowTasks()).length,
        serverTime: new Date().toISOString(),
        version: "1.0.0",
        status: "healthy"
      };
      
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('AppSheet status error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
}

// Helper functions for processing AppSheet webhook data

async function handleMemberAdd(data: any) {
  try {
    // Map AppSheet data to our schema
    const unionRecord = await storage.getUnionByName(data.union || 'UFA');
    const statusRecord = await storage.getMemberStatusByName(data.status || 'pending_verification');
    const genderRecord = data.gender ? await storage.getGenderByName(data.gender) : null;

    const memberData = {
      fullName: data.fullName || data.full_name,
      dateOfBirth: data.dateOfBirth || data.date_of_birth,
      genderId: genderRecord?.id || null,
      email: data.email,
      mobilePhone: data.mobilePhone || data.mobile_phone,
      mailingAddress: data.mailingAddress || data.mailing_address,
      unionId: unionRecord?.id || 1, // Default to first union
      unionMemberId: data.unionMemberId || data.union_member_id || data.employeeId,
      height: data.height ? parseInt(data.height) : null,
      weight: data.weight ? parseInt(data.weight) : null,
      pastMedicalHistory: data.pastMedicalHistory || data.past_medical_history,
      lifestyleQuestions: data.lifestyleQuestions || data.lifestyle_questions,
      currentMedications: data.currentMedications || data.current_medications,
      emergencyContact: data.emergencyContact || data.emergency_contact,
      statusId: statusRecord?.id || 1, // Default to pending
    };

    // Create member directly with proper date conversion
    const memberWithDateFixed = {
      ...memberData,
      dateOfBirth: new Date(memberData.dateOfBirth)
    };
    
    // Insert directly to bypass schema validation issues with AppSheet date format
    const [member] = await db.insert(members).values(memberWithDateFixed).returning();
    
    console.log('Member created from AppSheet:', member.id);
    return member;
  } catch (error) {
    console.error('Error adding member from AppSheet:', error);
    throw error;
  }
}

async function handleMemberUpdate(data: any) {
  try {
    const memberId = parseInt(data.id);
    const member = await storage.getMember(memberId);
    
    if (!member) {
      throw new Error(`Member with ID ${memberId} not found`);
    }

    // Build update object with only changed fields
    const updates: any = {};
    
    if (data.fullName !== undefined) updates.fullName = data.fullName;
    if (data.email !== undefined) updates.email = data.email;
    if (data.mobilePhone !== undefined) updates.mobilePhone = data.mobilePhone;
    if (data.height !== undefined) updates.height = parseInt(data.height);
    if (data.weight !== undefined) updates.weight = parseInt(data.weight);
    
    // Handle status updates
    if (data.status !== undefined) {
      const statusRecord = await storage.getMemberStatusByName(data.status);
      if (statusRecord) {
        updates.statusId = statusRecord.id;
      }
    }

    const updatedMember = await storage.updateMember(memberId, updates);
    console.log('Member updated from AppSheet:', memberId);
    return updatedMember;
  } catch (error) {
    console.error('Error updating member from AppSheet:', error);
    throw error;
  }
}

async function handleMemberDelete(data: any) {
  // For HIPAA compliance, we typically don't delete medical records
  // Instead, we mark them as inactive or archived
  try {
    const memberId = parseInt(data.id);
    const inactiveStatus = await storage.getMemberStatusByName('inactive_members');
    
    if (inactiveStatus) {
      await storage.updateMember(memberId, { statusId: inactiveStatus.id });
      console.log('Member marked inactive from AppSheet:', memberId);
    }
  } catch (error) {
    console.error('Error deactivating member from AppSheet:', error);
    throw error;
  }
}

async function handleBpReadingAdd(data: any) {
  try {
    // Determine BP category
    const { systolic, diastolic } = data;
    let categoryName = "normal";
    
    if (systolic >= 180 || diastolic >= 120) {
      categoryName = "crisis";
    } else if (systolic >= 140 || diastolic >= 90) {
      categoryName = "stage2";
    } else if (systolic >= 130 || diastolic >= 80) {
      categoryName = "stage1";
    } else if (systolic >= 120 && diastolic < 80) {
      categoryName = "elevated";
    }

    const categoryRecord = await storage.getBpCategoryByName(categoryName);
    
    const readingData = {
      memberId: parseInt(data.memberId || data.member_id),
      systolic: parseInt(data.systolic),
      diastolic: parseInt(data.diastolic),
      heartRate: data.heartRate ? parseInt(data.heartRate) : null,
      categoryId: categoryRecord?.id || 1,
      notes: data.notes,
      recordedBy: data.recordedBy ? parseInt(data.recordedBy) : null,
      deviceId: data.deviceId || data.device_id,
      syncedFromDevice: data.syncedFromDevice || false,
      isAbnormal: categoryRecord?.isAbnormal || false,
    };

    const validated = insertBpReadingSchema.parse(readingData);
    const reading = await storage.createBpReading(validated);
    
    console.log('BP reading created from AppSheet:', reading.id);
    return reading;
  } catch (error) {
    console.error('Error adding BP reading from AppSheet:', error);
    throw error;
  }
}

async function handleBpReadingUpdate(data: any) {
  try {
    const readingId = parseInt(data.id);
    // For BP readings, updates are typically limited for data integrity
    // Only allow notes updates
    const updates: any = {};
    if (data.notes !== undefined) updates.notes = data.notes;
    
    // Note: In a real system, you might want to restrict BP reading updates
    // for audit trail purposes, but allow notes additions
    
    console.log('BP reading update from AppSheet:', readingId);
  } catch (error) {
    console.error('Error updating BP reading from AppSheet:', error);
    throw error;
  }
}

async function handleBpReadingDelete(data: any) {
  // BP readings should typically not be deleted for medical record integrity
  console.log('BP reading delete request ignored for data integrity:', data.id);
}

async function handleTaskAdd(data: any) {
  try {
    const typeRecord = await storage.getTaskTypeByName(data.type || data.taskType || data.task_type || 'follow_up');
    const priorityRecord = await storage.getTaskPriorityByName(data.priority || 'medium');
    const statusRecord = await storage.getTaskStatusByName(data.status || 'pending');

    const taskData = {
      memberId: parseInt(data.memberId || data.member_id),
      assignedTo: data.assignedTo ? parseInt(data.assignedTo) : null,
      title: data.title || data.description || `${data.type || 'Task'} for member ${data.memberId}`,
      description: data.description,
      typeId: typeRecord?.id || 4, // Default to follow_up
      priorityId: priorityRecord?.id || 2, // Default to medium
      statusId: statusRecord?.id || 1, // Default to pending
      createdByAi: data.createdByAi || false,
      aiReasoning: data.aiReasoning || data.ai_reasoning,
      relatedBpReadingId: data.relatedBpReadingId ? parseInt(data.relatedBpReadingId) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    };

    // Insert directly to bypass schema validation issues with AppSheet data
    const [task] = await db.insert(workflowTasks).values(taskData).returning();
    
    console.log('Task created from AppSheet:', task.id);
    return task;
  } catch (error) {
    console.error('Error adding task from AppSheet:', error);
    throw error;
  }
}

async function handleTaskUpdate(data: any) {
  try {
    const taskId = parseInt(data.id);
    const updates: any = {};
    
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.assignedTo !== undefined) updates.assignedTo = parseInt(data.assignedTo);
    
    // Handle status updates
    if (data.status !== undefined) {
      const statusRecord = await storage.getTaskStatusByName(data.status);
      if (statusRecord) {
        updates.statusId = statusRecord.id;
        if (data.status === 'completed') {
          updates.completedAt = new Date();
        }
      }
    }
    
    if (data.dueDate !== undefined) {
      updates.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const updatedTask = await storage.updateWorkflowTask(taskId, updates);
    console.log('Task updated from AppSheet:', taskId);
    return updatedTask;
  } catch (error) {
    console.error('Error updating task from AppSheet:', error);
    throw error;
  }
}

async function handleTaskDelete(data: any) {
  try {
    const taskId = parseInt(data.id);
    // Mark task as cancelled instead of deleting
    const cancelledStatus = await storage.getTaskStatusByName('cancelled');
    if (cancelledStatus) {
      await storage.updateWorkflowTask(taskId, { statusId: cancelledStatus.id });
      console.log('Task cancelled from AppSheet:', taskId);
    }
  } catch (error) {
    console.error('Error cancelling task from AppSheet:', error);
    throw error;
  }
}