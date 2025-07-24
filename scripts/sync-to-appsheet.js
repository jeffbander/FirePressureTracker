// Sync current patient data to your running AppSheet app
import { storage } from '../server/storage.js';

async function syncAllDataToAppSheet() {
  console.log('🔄 Syncing all patient data to AppSheet...');
  
  try {
    // Get all members
    const members = await storage.getAllMembers();
    console.log(`📊 Found ${members.length} members to sync:`);
    
    members.forEach(member => {
      console.log(`- ${member.fullName} (${member.unionMemberId}) - Union ID: ${member.unionId}`);
    });
    
    // Get all BP readings
    const readings = await storage.getRecentReadings(100);
    console.log(`🩺 Found ${readings.length} BP readings to sync`);
    
    // Get all tasks
    const tasks = await storage.getAllWorkflowTasks();
    console.log(`📋 Found ${tasks.length} workflow tasks to sync`);
    
    console.log('\n✅ Data ready for AppSheet sync!');
    console.log('Your AppSheet app can pull this data from:');
    console.log('- Members: /api/appsheet/export/members');
    console.log('- Readings: /api/appsheet/export/readings');
    console.log('- Tasks: /api/appsheet/export/tasks');
    
    return {
      members: members.length,
      readings: readings.length,
      tasks: tasks.length
    };
    
  } catch (error) {
    console.error('❌ Error syncing data:', error);
    throw error;
  }
}

syncAllDataToAppSheet()
  .then(result => {
    console.log('\n🎉 Sync summary:', result);
  })
  .catch(console.error);