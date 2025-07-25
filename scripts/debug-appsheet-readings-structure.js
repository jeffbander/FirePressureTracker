// Debug AppSheet readings structure
async function debugAppSheetReadings() {
  const API_KEY = process.env.APPSHEET_API_KEY_1;
  const APP_ID = '29320fd7-0017-46ab-8427-0c15b574f046';
  
  console.log('🔍 Debugging AppSheet readings structure...');
  
  try {
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
    
    console.log(`Total readings: ${readings.length}`);
    
    // Find the first reading with actual data
    let sampleReading = null;
    for (let i = 0; i < Math.min(100, readings.length); i++) {
      const reading = readings[i];
      const hasData = Object.values(reading).some(val => val !== null && val !== undefined && val !== '');
      if (hasData) {
        sampleReading = reading;
        break;
      }
    }
    
    if (sampleReading) {
      console.log('\nSample reading with data:');
      console.log(JSON.stringify(sampleReading, null, 2));
      
      console.log('\nField names available:');
      Object.keys(sampleReading).forEach(key => {
        const value = sampleReading[key];
        console.log(`${key}: ${value} (${typeof value})`);
      });
    } else {
      console.log('\nNo readings with data found in first 100 records');
      console.log('\nFirst record structure:');
      console.log(JSON.stringify(readings[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAppSheetReadings();