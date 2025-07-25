// Debug AppSheet tables and structure
async function debugAppSheetApp() {
  const API_KEY = process.env.APPSHEET_API_KEY_1;
  const APP_ID = '29320fd7-0017-46ab-8427-0c15b574f046';
  
  console.log('🔍 Debugging AppSheet app structure...');
  console.log('App ID:', APP_ID);
  
  // Try different table names that might exist
  const possibleTableNames = [
    'Members', 'members', 'Member', 'member',
    'Users', 'users', 'User', 'user',
    'Patients', 'patients', 'Patient', 'patient',
    'Data', 'data', 'app_data', 'AppData',
    'People', 'people', 'Person', 'person'
  ];
  
  for (const tableName of possibleTableNames) {
    try {
      console.log(`\n📊 Testing table: ${tableName}`);
      
      const response = await fetch(`https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/${tableName}/Action`, {
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
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log(`Response length: ${responseText.length} chars`);
        
        if (responseText.trim()) {
          try {
            const data = JSON.parse(responseText);
            console.log(`✅ Found table "${tableName}" with ${data.length || 0} records`);
            
            if (data.length > 0) {
              console.log('Sample record keys:', Object.keys(data[0]));
              console.log('First record:', JSON.stringify(data[0]).substring(0, 200) + '...');
            }
          } catch (parseError) {
            console.log(`❌ JSON parse error for "${tableName}":`, parseError.message);
          }
        } else {
          console.log(`⚠️  Table "${tableName}" exists but is empty`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ Table "${tableName}" not found or error:`, response.status);
      }
      
    } catch (error) {
      console.log(`💥 Network error for "${tableName}":`, error.message);
    }
  }
}

debugAppSheetApp();