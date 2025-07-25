// Route for pulling member data from AppSheet
import { Router } from 'express';
import { storage } from '../storage.js';

const router = Router();

// Pull members from AppSheet and sync to local system
router.post('/pull-members', async (req, res) => {
  try {
    console.log('🔄 Starting AppSheet member pull...');
    
    const API_KEY = process.env.APPSHEET_API_KEY_1;
    if (!API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'AppSheet API key not configured' 
      });
    }

    // Get list of AppSheet apps
    const appsResponse = await fetch('https://api.appsheet.com/api/v2/apps', {
      method: 'GET',
      headers: {
        'ApplicationAccessKey': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!appsResponse.ok) {
      const errorText = await appsResponse.text();
      return res.status(500).json({ 
        success: false, 
        error: `Failed to connect to AppSheet: ${errorText}` 
      });
    }

    const apps = await appsResponse.json();
    console.log(`✅ Found ${apps.length} AppSheet apps`);

    if (apps.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No AppSheet apps found',
        members: []
      });
    }

    // Use first app (or you can specify app ID)
    const appId = apps[0].id;
    console.log(`🎯 Using app: ${apps[0].name} (${appId})`);

    // Get members from AppSheet
    const membersResponse = await fetch(`https://api.appsheet.com/api/v2/apps/${appId}/tables/Members/Action`, {
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

    const appsheetMembers = await membersResponse.json();
    console.log(`📊 Retrieved ${appsheetMembers.length || 0} members from AppSheet`);

    const syncedMembers = [];
    const errors = [];

    if (appsheetMembers && appsheetMembers.length > 0) {
      for (const appsheetMember of appsheetMembers) {
        try {
          // Convert AppSheet format to local format
          const memberData = {
            fullName: appsheetMember.fullName || appsheetMember.name || 'Unknown Member',
            email: appsheetMember.email || `member${Date.now()}@example.com`,
            mobilePhone: appsheetMember.mobilePhone || appsheetMember.phone || '555-0000',
            dateOfBirth: appsheetMember.dateOfBirth || '1980-01-01',
            unionId: parseInt(appsheetMember.unionId) || 1,
            unionMemberId: appsheetMember.unionMemberId || `AS-${Date.now()}`,
            height: parseInt(appsheetMember.height) || 70,
            weight: parseInt(appsheetMember.weight) || 170,
            statusId: 1 // Active
          };

          // Check if member already exists
          const existingMember = await storage.getMemberByEmail(memberData.email);
          if (existingMember) {
            console.log(`⏭️  Member ${memberData.fullName} already exists`);
            syncedMembers.push({ ...existingMember, status: 'existing' });
          } else {
            const newMember = await storage.createMember(memberData);
            console.log(`✅ Created member: ${newMember.fullName}`);
            syncedMembers.push({ ...newMember, status: 'created' });
          }
        } catch (error) {
          console.error(`❌ Error syncing member:`, error);
          errors.push({
            member: appsheetMember.fullName || 'Unknown',
            error: error.message
          });
        }
      }
    }

    res.json({
      success: true,
      message: `Synced ${syncedMembers.filter(m => m.status === 'created').length} new members from AppSheet`,
      data: {
        appId,
        appName: apps[0].name,
        totalFound: appsheetMembers.length || 0,
        syncedMembers,
        errors
      }
    });

  } catch (error) {
    console.error('❌ AppSheet pull error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;