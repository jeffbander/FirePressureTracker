// Find which AppSheet readings match our current members
async function matchReadingsToMembers() {
  const API_KEY = process.env.APPSHEET_API_KEY_1;
  const APP_ID = '29320fd7-0017-46ab-8427-0c15b574f046';
  
  console.log('🔍 Finding matching readings...');
  
  try {
    // Get our current members
    const membersResponse = await fetch('http://localhost:5000/api/patients');
    const members = await membersResponse.json();
    
    console.log(`Current members in system: ${members.length}`);
    members.forEach(member => {
      console.log(`- ${member.fullName || `${member.firstName} ${member.lastName}`}`);
    });
    
    // Get AppSheet readings
    const response = await fetch(`https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/app_data/Action`, {
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
    
    const responseText = await response.text();
    const readings = JSON.parse(responseText);
    
    // Find readings that match our members
    const memberNames = members.map(m => m.fullName || `${m.firstName} ${m.lastName}`);
    
    const matchingReadings = readings.filter(reading => {
      const readingName = reading.Decode_Name || '';
      const sbp = parseInt(reading.SBP || '0');
      const dbp = parseInt(reading.DBP || '0');
      
      return memberNames.includes(readingName) && sbp > 0 && dbp > 0;
    });
    
    console.log(`\nFound ${matchingReadings.length} matching readings:`);
    matchingReadings.slice(0, 10).forEach((reading, index) => {
      console.log(`${index + 1}. ${reading.Decode_Name}: ${reading.SBP}/${reading.DBP} on ${reading.Timestamp}`);
    });
    
    // Also show unique names in readings for reference
    const readingNames = [...new Set(readings
      .filter(r => r.Decode_Name && parseInt(r.SBP || '0') > 0)
      .map(r => r.Decode_Name)
    )].slice(0, 20);
    
    console.log(`\nUnique names in AppSheet readings (first 20):`);
    readingNames.forEach(name => console.log(`- ${name}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

matchReadingsToMembers();