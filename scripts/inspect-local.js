const XLSX = require('xlsx');

const tempFile = 'temp_schedule.xlsx';

function inspect() {
    try {
        console.log(`Reading file ${tempFile}...`);
        const workbook = XLSX.readFile(tempFile);
        const sheetName = workbook.SheetNames[0];
        console.log(`Reading sheet: ${sheetName}`);

        const sheet = workbook.Sheets[sheetName];
        // Get headers
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays

        console.log('--- First 10 Rows (Arrays) ---');
        data.slice(0, 10).forEach((row, index) => {
            console.log(`Row ${index}:`, JSON.stringify(row));
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

inspect();
