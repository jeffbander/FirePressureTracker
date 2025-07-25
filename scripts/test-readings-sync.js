// Test AppSheet readings sync
async function testReadingsSync() {
  const API_KEY = process.env.APPSHEET_API_KEY_1;
  const APP_ID = '29320fd7-0017-46ab-8427-0c15b574f046';
  
  console.log('🔄 Testing readings sync...');
  
  try {
    // First, get sample readings from AppSheet
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
    
    // Find readings with valid BP data and matching members
    const validReadings = readings.filter(reading => {
      const sbp = parseInt(reading.SBP || '0');
      const dbp = parseInt(reading.DBP || '0');
      const name = reading.Decode_Name || '';
      
      return sbp > 0 && dbp > 0 && name && name !== '';
    }).slice(0, 5);
    
    console.log(`Found ${validReadings.length} valid readings:`);
    
    validReadings.forEach((reading, index) => {
      console.log(`${index + 1}. ${reading.Decode_Name}`);
      console.log(`   BP: ${reading.SBP}/${reading.DBP}`);
      console.log(`   Date: ${reading.Timestamp}`);
      console.log(`   Union: ${reading.Decode_Union}`);
      console.log(`   Device: ${reading['Device ID']}`);
      console.log('');
    });
    
    // Now sync through our API
    console.log('🔄 Syncing through API...');
    const syncResponse = await fetch('http://localhost:5000/api/appsheet/pull-readings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appId: APP_ID,
        limit: 10
      })
    });
    
    const syncResult = await syncResponse.text();
    console.log('Sync result:', syncResult.substring(0, 500));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testReadingsSync();