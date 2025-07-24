// Test AppSheet API connection

async function testAppSheetConnection() {
  const API_KEY_1 = process.env.APPSHEET_API_KEY_1;
  const API_KEY_2 = process.env.APPSHEET_API_KEY_2;
  
  console.log('Testing AppSheet API Connection...');
  console.log('API Key 1 available:', !!API_KEY_1);
  console.log('API Key 2 available:', !!API_KEY_2);
  
  if (!API_KEY_1) {
    console.log('❌ No API keys found');
    return;
  }
  
  // Test basic AppSheet API endpoint
  try {
    const response = await fetch('https://api.appsheet.com/api/v2/apps', {
      method: 'GET',
      headers: {
        'ApplicationAccessKey': API_KEY_1,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ AppSheet API connection successful!');
      const data = JSON.parse(responseText);
      if (data.length > 0) {
        console.log(`Found ${data.length} AppSheet apps:`);
        data.forEach(app => {
          console.log(`- ${app.name} (ID: ${app.id})`);
        });
      } else {
        console.log('No AppSheet apps found. You need to create an app first.');
      }
    } else {
      console.log('❌ AppSheet API connection failed');
    }
  } catch (error) {
    console.error('❌ Error testing AppSheet connection:', error.message);
  }
}

testAppSheetConnection();