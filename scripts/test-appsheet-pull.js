// Direct test of AppSheet pull functionality
async function testAppSheetPull() {
  console.log('🔍 Testing AppSheet API connection...');
  
  const API_KEY = process.env.APPSHEET_API_KEY_1;
  console.log('API Key available:', !!API_KEY);
  console.log('API Key prefix:', API_KEY ? API_KEY.substring(0, 8) + '...' : 'None');
  
  if (!API_KEY) {
    console.log('❌ No API key found');
    return;
  }
  
  try {
    // Test direct API call
    console.log('📡 Making direct API call to AppSheet...');
    const response = await fetch('https://api.appsheet.com/api/v2/apps', {
      method: 'GET',
      headers: {
        'ApplicationAccessKey': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body (first 500 chars):', responseText.substring(0, 500));
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Found', data.length, 'AppSheet apps');
        if (data.length > 0) {
          console.log('First app:', data[0].name, 'ID:', data[0].id);
        }
      } catch (parseError) {
        console.log('❌ Failed to parse JSON:', parseError.message);
      }
    } else {
      console.log('❌ API call failed with status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testAppSheetPull();