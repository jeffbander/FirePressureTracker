// Pull member data from your running AppSheet app
import fetch from 'node-fetch';
import { storage } from '../server/storage.js';

async function pullMembersFromAppSheet() {
  console.log('🔄 Pulling members from your AppSheet app...');
  
  const API_KEY = process.env.APPSHEET_API_KEY_1;
  if (!API_KEY) {
    console.error('❌ AppSheet API key not found');
    return;
  }

  try {
    // First, let's try to get your app info
    console.log('🔍 Finding your AppSheet app...');
    
    const appsResponse = await fetch('https://api.appsheet.com/api/v2/apps', {
      method: 'GET',
      headers: {
        'ApplicationAccessKey': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!appsResponse.ok) {
      console.error('❌ Failed to connect to AppSheet API');
      console.error('Response:', await appsResponse.text());
      return;
    }

    const apps = await appsResponse.json();
    console.log(`✅ Found ${apps.length} AppSheet apps:`);
    
    if (apps.length === 0) {
      console.log('⚠️  No AppSheet apps found. Make sure your app is published.');
      return;
    }

    // Show available apps
    apps.forEach((app, index) => {
      console.log(`${index + 1}. ${app.name} (ID: ${app.id})`);
    });

    // Use the first app for now (you can specify which one later)
    const appId = apps[0].id;
    console.log(`\n🎯 Using app: ${apps[0].name} (${appId})`);

    // Now try to get members from this app
    console.log('📊 Fetching members from AppSheet...');
    
    const membersResponse = await fetch(`https://api.appsheet.com/api/v2/apps/${appId}/tables/Members/Action`, {
      method: 'POST',
      headers: {
        'ApplicationAccessKey': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Action: 'Find',
        Properties: {
          Locale: 'en-US',
          Timezone: 'Pacific Standard Time'
        },
        Rows: []
      })
    });

    if (!membersResponse.ok) {
      console.error('❌ Failed to fetch members from AppSheet');
      console.error('Response:', await membersResponse.text());
      return;
    }

    const membersData = await membersResponse.json();
    console.log(`✅ Retrieved ${membersData.length || 0} members from AppSheet`);

    if (membersData && membersData.length > 0) {
      console.log('\n📋 Members from AppSheet:');
      membersData.forEach((member, index) => {
        console.log(`${index + 1}. ${member.fullName || member.name || 'Unknown'} - ${member.email || 'No email'}`);
      });

      // Sync these members to your local system
      console.log('\n🔄 Syncing to local system...');
      for (const appsheetMember of membersData) {
        try {
          // Convert AppSheet member format to your system format
          const memberData = {
            fullName: appsheetMember.fullName || appsheetMember.name,
            email: appsheetMember.email,
            mobilePhone: appsheetMember.mobilePhone || appsheetMember.phone,
            dateOfBirth: appsheetMember.dateOfBirth,
            unionId: appsheetMember.unionId || 1, // Default to UFA
            unionMemberId: appsheetMember.unionMemberId || `AS-${Date.now()}`,
            height: appsheetMember.height || 70,
            weight: appsheetMember.weight || 170,
            statusId: 1 // Active status
          };

          // Check if member already exists
          const existingMember = await storage.getMemberByEmail(memberData.email);
          if (existingMember) {
            console.log(`⏭️  Member ${memberData.fullName} already exists, skipping...`);
          } else {
            const newMember = await storage.createMember(memberData);
            console.log(`✅ Created member: ${newMember.fullName} (ID: ${newMember.id})`);
          }
        } catch (error) {
          console.error(`❌ Error syncing member ${appsheetMember.fullName}:`, error.message);
        }
      }
    } else {
      console.log('📭 No members found in AppSheet app');
    }

    console.log('\n🎉 AppSheet member sync complete!');

  } catch (error) {
    console.error('❌ Error pulling from AppSheet:', error.message);
  }
}

pullMembersFromAppSheet();