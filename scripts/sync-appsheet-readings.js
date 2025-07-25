// Sync BP readings from AppSheet
async function syncAppSheetReadings() {
  const API_KEY = process.env.APPSHEET_API_KEY_1;
  const APP_ID = '29320fd7-0017-46ab-8427-0c15b574f046';
  
  console.log('🔄 Pulling BP readings from AppSheet...');
  
  try {
    // Get readings from app_data table
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
    
    if (!response.ok) {
      throw new Error(`AppSheet API error: ${response.status}`);
    }
    
    const responseText = await response.text();
    const readings = JSON.parse(responseText);
    
    console.log(`📊 Found ${readings.length} total BP readings`);
    
    // Show first 10 readings
    console.log('\nFirst 10 BP Readings:');
    readings.slice(0, 10).forEach((reading, index) => {
      console.log(`${index + 1}. ${reading.Name || 'No Name'}`);
      console.log(`   Systolic: ${reading.Systolic || 'N/A'}`);
      console.log(`   Diastolic: ${reading.Diastolic || 'N/A'}`);
      console.log(`   Date: ${reading.Date || 'No Date'}`);
      console.log(`   Time: ${reading.Time || 'No Time'}`);
      console.log(`   Union: ${reading.Union || 'No Union'}`);
      console.log('');
    });
    
    // Show unique names with reading counts
    const nameCounts = readings.reduce((acc, reading) => {
      const name = reading.Name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nReading counts by name:');
    Object.entries(nameCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([name, count]) => {
        console.log(`${name}: ${count} readings`);
      });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

syncAppSheetReadings();