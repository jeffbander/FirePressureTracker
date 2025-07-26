import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBpReadingSchema, insertWorkflowTaskSchema, insertCommunicationSchema, insertMemberSchema } from "@shared/schema";
import { registerAppSheetRoutes } from "./routes/appsheet-integration";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const allMembers = await storage.getAllMembers();
      const abnormalReadings = await storage.getAbnormalReadings();
      const allTasks = await storage.getAllWorkflowTasks();
      
      const pendingTasksCount = allTasks.filter(task => 
        task.statusId === 1 // assuming 1 is pending status
      ).length;
      
      res.json({
        totalPatients: allMembers.length,
        abnormalReadings: abnormalReadings.length,
        pendingTasks: pendingTasksCount,
        activeMembers: allMembers.filter(m => m.statusId === 8).length, // assuming 8 is active_members
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Get all members (patients) with pagination and latest readings
  app.get("/api/patients", async (req, res) => {
    try {
      // Pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      // Get total count for pagination
      const allMembers = await storage.getAllMembers();
      const totalCount = allMembers.length;
      
      // Get paginated members
      const paginatedMembers = allMembers.slice(offset, offset + limit);
      
      // Add latest reading and union name to each member
      const membersWithReadings = await Promise.all(
        paginatedMembers.map(async (member) => {
          const readings = await storage.getBpReadingsByMember(member.id);
          const latestReading = readings[0]; // readings are ordered by recorded_at DESC
          
          // Get union name
          const union = member.unionId ? await storage.getUnion(member.unionId) : null;
          
          return {
            ...member,
            union: union?.name || 'N/A',
            latestReading,
            readingCount: readings.length
          };
        })
      );
      
      res.json({
        data: membersWithReadings,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Get patients error:', error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Get priority patients (those with abnormal readings)
  app.get("/api/patients/priority", async (req, res) => {
    try {
      const abnormalReadings = await storage.getAbnormalReadings();
      const memberIds = Array.from(new Set(abnormalReadings.map(r => r.memberId)));
      
      const priorityPatients = await Promise.all(
        memberIds.map(async (memberId) => {
          const member = await storage.getMember(memberId);
          if (!member) return null;
          
          const readings = await storage.getBpReadingsByMember(memberId);
          const latestReading = readings[0];
          const union = await storage.getUnion(member.unionId);
          return {
            ...member,
            union: union?.name || 'N/A',
            latestReading,
          };
        })
      );

      res.json(priorityPatients.filter(p => p));
    } catch (error) {
      console.error('Priority patients error:', error);
      res.status(500).json({ message: "Failed to fetch priority patients" });
    }
  });

  // Get recent BP readings
  app.get("/api/readings/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recentReadings = await storage.getRecentReadings(limit);
      res.json(recentReadings);
    } catch (error) {
      console.error('Recent readings error:', error);
      res.status(500).json({ message: "Failed to fetch recent readings" });
    }
  });

  // Get pending members for approval
  app.get("/api/patients/pending", async (req, res) => {
    try {
      const pendingMembers = await storage.getPendingMembers();
      res.json(pendingMembers);
    } catch (error) {
      console.error('Pending patients error:', error);
      res.status(500).json({ message: "Failed to fetch pending patients" });
    }
  });

  // Get pending members by union
  app.get("/api/patients/pending-by-union/:union", async (req, res) => {
    try {
      const union = req.params.union;
      const pendingMembers = await storage.getPendingMembersByUnion(union);
      res.json(pendingMembers);
    } catch (error) {
      console.error('Pending patients by union error:', error);
      res.status(500).json({ message: "Failed to fetch pending patients for union" });
    }
  });

  // Get inactive members
  app.get("/api/patients/inactive", async (req, res) => {
    try {
      const inactiveMembers = await storage.getInactiveMembers();
      res.json(inactiveMembers);
    } catch (error) {
      console.error('Inactive patients error:', error);
      res.status(500).json({ message: "Failed to fetch inactive patients" });
    }
  });

  // Get members by status
  app.get("/api/patients/status/:status", async (req, res) => {
    try {
      const { status } = req.params;
      const members = await storage.getMembersByStatus(status);
      res.json(members);
    } catch (error) {
      console.error('Patients by status error:', error);
      res.status(500).json({ message: "Failed to fetch patients by status" });
    }
  });

  // Get member details
  app.get("/api/patients/:id", async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      if (isNaN(memberId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      const member = await storage.getMember(memberId);
      
      if (!member) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const readings = await storage.getBpReadingsByMember(memberId);
      const tasks = await storage.getWorkflowTasksByMember(memberId);
      const communications = await storage.getCommunicationsByMember(memberId);

      res.json({
        ...member,
        readings,
        tasks,
        communications,
      });
    } catch (error) {
      console.error('Patient details error:', error);
      res.status(500).json({ message: "Failed to fetch patient details" });
    }
  });

  // Create new member
  app.post("/api/patients", async (req, res) => {
    try {
      // Get the union ID from the union name
      const unionRecord = await storage.getUnionByName(req.body.union);
      if (!unionRecord) {
        return res.status(400).json({ message: "Invalid union specified" });
      }

      // Get the default status ID for pending verification
      const statusRecord = await storage.getMemberStatusByName("pending_verification");
      if (!statusRecord) {
        return res.status(500).json({ message: "Default status not found" });
      }

      // Get gender ID if provided
      let genderId = null;
      if (req.body.gender) {
        const genderRecord = await storage.getGenderByName(req.body.gender);
        if (genderRecord) {
          genderId = genderRecord.id;
        }
      }

      const memberData = {
        ...req.body,
        unionId: unionRecord.id,
        statusId: statusRecord.id,
        genderId,
        unionMemberId: req.body.employeeId || req.body.unionMemberId,
      };
      
      const validated = insertMemberSchema.parse(memberData);
      const member = await storage.createMember(validated);
      res.status(201).json(member);
    } catch (error) {
      console.error('Member creation error:', error);
      res.status(400).json({ message: "Invalid member data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Create BP reading
  app.post("/api/readings", async (req, res) => {
    try {
      // Get BP category based on systolic/diastolic values
      let categoryName = "normal";
      const { systolic, diastolic } = req.body;
      
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
      if (!categoryRecord) {
        return res.status(500).json({ message: "BP category not found" });
      }

      const readingData = {
        ...req.body,
        categoryId: categoryRecord.id,
        isAbnormal: categoryRecord.isAbnormal,
      };

      const validated = insertBpReadingSchema.parse(readingData);
      const reading = await storage.createBpReading(validated);
      res.status(201).json(reading);
    } catch (error) {
      console.error('BP reading creation error:', error);
      res.status(400).json({ message: "Invalid reading data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Create workflow task
  app.post("/api/tasks", async (req, res) => {
    try {
      // Get required IDs from names
      const typeRecord = await storage.getTaskTypeByName(req.body.taskType || "follow_up");
      const priorityRecord = await storage.getTaskPriorityByName(req.body.priority || "medium");
      const statusRecord = await storage.getTaskStatusByName(req.body.status || "pending");

      if (!typeRecord || !priorityRecord || !statusRecord) {
        return res.status(400).json({ message: "Invalid task type, priority, or status" });
      }

      const taskData = {
        ...req.body,
        typeId: typeRecord.id,
        priorityId: priorityRecord.id,
        statusId: statusRecord.id,
      };

      const validated = insertWorkflowTaskSchema.parse(taskData);
      const task = await storage.createWorkflowTask(validated);
      res.status(201).json(task);
    } catch (error) {
      console.error('Task creation error:', error);
      res.status(400).json({ message: "Invalid task data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Update task status
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;

      // Convert status name to statusId if needed
      if (updates.status) {
        const statusRecord = await storage.getTaskStatusByName(updates.status);
        if (statusRecord) {
          updates.statusId = statusRecord.id;
          delete updates.status;
        }
      }

      const updatedTask = await storage.updateWorkflowTask(taskId, updates);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(updatedTask);
    } catch (error) {
      console.error('Task update error:', error);
      res.status(400).json({ message: "Failed to update task", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Approve member
  app.patch("/api/patients/:id/approve", async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      const { approvedBy, newStatus } = req.body;

      const approvedMember = await storage.approveMember(memberId, approvedBy, newStatus || "approved");
      if (!approvedMember) {
        return res.status(404).json({ message: "Member not found" });
      }

      res.json(approvedMember);
    } catch (error) {
      console.error('Member approval error:', error);
      res.status(400).json({ message: "Failed to approve member", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Search members
  app.get("/api/patients/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const members = await storage.searchMembers(query);
      res.json(members);
    } catch (error) {
      console.error('Member search error:', error);
      res.status(500).json({ message: "Failed to search members" });
    }
  });

  // Get workflow status/info
  app.get("/api/workflow", async (req, res) => {
    try {
      // Return workflow tasks with priority and status names
      const tasks = await storage.getAllWorkflowTasks();
      
      // Map tasks to include priority and status names
      const tasksWithDetails = await Promise.all(
        tasks.map(async (task) => {
          const priority = task.priorityId === 4 ? 'urgent' : 
                          task.priorityId === 3 ? 'high' : 
                          task.priorityId === 2 ? 'medium' : 'low';
          
          const status = task.statusId === 1 ? 'pending' :
                        task.statusId === 2 ? 'in_progress' :
                        task.statusId === 3 ? 'completed' : 'pending';
          
          return {
            ...task,
            priority,
            status,
            patientId: task.memberId, // Map memberId to patientId for frontend compatibility
          };
        })
      );
      
      res.json(tasksWithDetails);
    } catch (error) {
      console.error('Get workflow error:', error);
      res.status(500).json({ message: "Failed to fetch workflow status" });
    }
  });

  // Get all workflow tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllWorkflowTasks();
      res.json(tasks);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get tasks by assignee
  app.get("/api/tasks/assignee/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const tasks = await storage.getWorkflowTasksByAssignee(userId);
      res.json(tasks);
    } catch (error) {
      console.error('Get tasks by assignee error:', error);
      res.status(500).json({ message: "Failed to fetch tasks by assignee" });
    }
  });

  // Pull members from AppSheet
  app.post("/api/appsheet/pull-members", async (req, res) => {
    try {
      const { appId, limit = 502 } = req.body;
      console.log('🔄 Starting AppSheet member pull...');
      
      const API_KEY = process.env.APPSHEET_API_KEY_1;
      if (!API_KEY) {
        return res.status(500).json({ 
          success: false, 
          error: 'AppSheet API key not configured' 
        });
      }

      // Use provided App ID or try to discover it
      let finalAppId = appId || process.env.APPSHEET_APP_ID || '29320fd7-0017-46ab-8427-0c15b574f046';
      
      if (!finalAppId) {
        return res.status(400).json({ 
          success: false, 
          error: 'AppSheet App ID required. Please provide appId in request body or set APPSHEET_APP_ID environment variable.' 
        });
      }

      console.log(`🎯 Using AppSheet App ID: ${finalAppId}`);

      // Get members from AppSheet (Users table)
      const membersResponse = await fetch(`https://api.appsheet.com/api/v2/apps/${finalAppId}/tables/Users/Action`, {
        method: 'POST',
        headers: {
          'ApplicationAccessKey': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Action: 'Find',
          Properties: {
            Locale: 'en-US'
          },
          Rows: []
        })
      });

      if (!membersResponse.ok) {
        const errorText = await membersResponse.text();
        return res.status(500).json({ 
          success: false, 
          error: `Failed to fetch members: ${errorText}` 
        });
      }

      const responseText = await membersResponse.text();
      console.log(`📊 Response size: ${responseText.length} characters`);
      
      let appsheetMembers = [];
      if (responseText.trim()) {
        try {
          appsheetMembers = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError.message);
          return res.status(500).json({ 
            success: false, 
            error: `Failed to parse AppSheet response: ${parseError.message}` 
          });
        }
      }
      
      console.log(`📊 Retrieved ${appsheetMembers.length || 0} members from AppSheet`);

      const syncedMembers = [];
      const errors = [];
      
      // Sync up to the requested limit of members
      const membersToSync = appsheetMembers.slice(0, limit);
      console.log(`🎯 Syncing ${membersToSync.length} members from AppSheet...`);

      if (membersToSync && membersToSync.length > 0) {
        for (const appsheetMember of membersToSync) {
          try {
            // Convert AppSheet format to local format
            const memberData = {
              fullName: appsheetMember.Name || 'Unknown Member',
              email: appsheetMember.email || `member${Date.now()}@example.com`,
              mobilePhone: appsheetMember.Phone || '555-0000',
              dateOfBirth: appsheetMember.DOB || '1980-01-01',
              unionId: getUnionId(appsheetMember.union || 'UFA'),
              unionMemberId: appsheetMember.User_ID || appsheetMember._RowNumber || `AS-${Date.now()}`,
              height: parseInt(appsheetMember.Height) || 70,
              weight: parseInt(appsheetMember.Weight) || 170,
              statusId: 1 // Active
            };



            // Create member (skip duplicate check for now to get data synced)
            const newMember = await storage.createMember(memberData);
            console.log(`✅ Created member: ${newMember.fullName} (${newMember.unionMemberId})`);
            syncedMembers.push({ ...newMember, status: 'created' });
          } catch (error) {
            console.error(`❌ Error syncing member:`, error);
            errors.push({
              member: appsheetMember.Name || 'Unknown',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }

      res.json({
        success: true,
        message: `Synced ${syncedMembers.filter(m => m.status === 'created').length} new members from AppSheet`,
        data: {
          appId: finalAppId,
          totalFound: appsheetMembers.length || 0,
          syncedMembers,
          errors
        }
      });

    } catch (error) {
      console.error('❌ AppSheet pull error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // AppSheet BP Readings Pull Route
  app.post('/api/appsheet/pull-readings', async (req, res) => {
    try {
      const { appId, limit = 50 } = req.body;
      
      if (!appId) {
        return res.status(400).json({ error: 'AppSheet App ID is required' });
      }
      
      const API_KEY = process.env.APPSHEET_API_KEY_1;
      if (!API_KEY) {
        return res.status(500).json({ error: 'AppSheet API key not configured' });
      }
      
      console.log('🔄 Starting AppSheet readings pull...');
      console.log(`🎯 Using AppSheet App ID: ${appId}`);
      
      // Get readings from app_data table
      const response = await fetch(`https://api.appsheet.com/api/v2/apps/${appId}/tables/app_data/Action`, {
        method: 'POST',
        headers: {
          'ApplicationAccessKey': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Action: 'Find',
          Properties: {
            Locale: 'en-US'
          },
          Rows: []
        })
      });
      
      if (!response.ok) {
        throw new Error(`AppSheet API request failed: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log(`📊 Response size: ${responseText.length} characters`);
      
      let appsheetReadings = [];
      try {
        appsheetReadings = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        return res.status(500).json({ error: 'Invalid JSON response from AppSheet' });
      }
      
      console.log(`📊 Retrieved ${appsheetReadings.length || 0} readings from AppSheet`);
      
      const syncedReadings = [];
      const errors = [];
      
      // Get current member names to prioritize matching readings
      const allMembers = await storage.getAllMembers();
      const memberNames = allMembers.map(m => m.fullName || `${m.firstName} ${m.lastName}`);
      
      // Filter readings that match our members first
      const matchingReadings = appsheetReadings.filter(reading => {
        const readingName = reading.Decode_Name || '';
        const sbp = parseInt(reading.SBP || '0');
        const dbp = parseInt(reading.DBP || '0');
        return memberNames.includes(readingName) && sbp > 0 && dbp > 0;
      }).slice(0, limit);
      
      console.log(`🎯 Syncing ${matchingReadings.length} readings that match our members...`);
      
      for (const appsheetReading of matchingReadings) {
        try {
          // Find corresponding member (we know it exists since we filtered for matches)
          let member = null;
          
          // Find member by decoded name field
          const readingName = appsheetReading.Decode_Name || '';
          member = allMembers.find(m => 
            m.fullName === readingName || 
            `${m.firstName} ${m.lastName}` === readingName
          );
          
          if (!member) {
            console.log(`⏭️  No member found for reading: ${readingName}`);
            continue;
          }
          
          // Convert AppSheet reading format to local format with required fields
          const readingData = {
            memberId: member.id,
            systolic: parseInt(appsheetReading.SBP || '0'),
            diastolic: parseInt(appsheetReading.DBP || '0'),
            heartRate: parseInt(appsheetReading.HR || '0') || null,
            categoryId: 1, // Default category, will be properly categorized later
            recordedAt: new Date(appsheetReading.Timestamp || new Date()),
            deviceId: appsheetReading['Device ID'] || null,
            syncedFromDevice: !!appsheetReading['Device ID'],
            notes: appsheetReading.Notes || null
          };
          
          // Skip invalid readings
          if (readingData.systolic === 0 || readingData.diastolic === 0) {
            continue;
          }
          
          const newReading = await storage.createBpReading(readingData);
          console.log(`✅ Created reading: ${readingData.systolic}/${readingData.diastolic} for ${member.fullName}`);
          syncedReadings.push({ ...newReading, status: 'created' });
          
        } catch (error) {
          console.error(`❌ Error syncing reading:`, error);
          errors.push({
            reading: JSON.stringify(appsheetReading),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      res.json({
        success: true,
        message: `Synced ${syncedReadings.length} new readings from AppSheet`,
        data: {
          appId,
          totalFound: appsheetReadings.length || 0,
          withData: matchingReadings.length,
          syncedReadings,
          errors
        }
      });
      
    } catch (error) {
      console.error('❌ AppSheet readings pull error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Helper function to map union names to IDs
  function getUnionId(unionName: string): number {
    const unionMap: Record<string, number> = {
      'UFA': 1,
      'MOUNT SINAI': 2, 
      'Mount Sinai': 2,
      'LBA': 3,
      'UFOA': 4
    };
    return unionMap[unionName] || 1;
  }

  // Register AppSheet integration routes
  registerAppSheetRoutes(app);

  const server = createServer(app);
  return server;
}