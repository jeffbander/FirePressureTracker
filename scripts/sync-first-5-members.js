// Sync first 5 members from AppSheet for testing
async function syncFirst5Members() {
  const API_KEY = process.env.APPSHEET_API_KEY_1;
  const APP_ID = '29320fd7-0017-46ab-8427-0c15b574f046';
  
  console.log('🔄 Syncing first 5 members from AppSheet...');
  
  try {
    const response = await fetch(`https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/Users/Action`, {
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
      throw new Error(`AppSheet API error: ${response.status}`);
    }
    
    const responseText = await response.text();
    const appsheetMembers = JSON.parse(responseText);
    
    console.log(`Found ${appsheetMembers.length} total members`);
    console.log('\nFirst 5 members:');
    
    appsheetMembers.slice(0, 5).forEach((member, index) => {
      console.log(`${index + 1}. ${member.Name || 'No Name'}`);
      console.log(`   Email: ${member.email || 'No Email'}`);
      console.log(`   Union: ${member.union || 'No Union'}`);
      console.log(`   Phone: ${member.Phone || 'No Phone'}`);
      console.log(`   DOB: ${member.DOB || 'No DOB'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

syncFirst5Members();