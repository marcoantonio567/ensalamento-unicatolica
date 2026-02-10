const fs = require('fs');
const axios = require('axios');
const XLSX = require('xlsx');

const url = 'https://ubecedu-my.sharepoint.com/:x:/g/personal/raimara_rodrigues_catolica-to_edu_br/IQALA5Yo0JsZSr3JBJO6Lkq7ARYkehG7oWHVfgsnM9aQaSM?download=1';
const tempFile = 'temp_schedule.xlsx';

async function downloadAndInspect() {
  try {
    console.log(`Downloading file from ${url}...`);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    });

    fs.writeFileSync(tempFile, response.data);
    console.log(`File downloaded to ${tempFile}`);

    const workbook = XLSX.read(response.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    console.log(`Reading sheet: ${sheetName}`);
    
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays

    console.log('--- First 20 Rows ---');
    data.slice(0, 20).forEach((row, index) => {
      console.log(`Row ${index}:`, JSON.stringify(row));
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

downloadAndInspect();
