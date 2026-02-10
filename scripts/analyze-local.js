const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../anexos/Turmas 2026-1.xlsx');

try {
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        process.exit(1);
    }

    const workbook = XLSX.readFile(filePath);
    console.log('--- Analyzing Local File: Turmas 2026-1.xlsx ---');
    console.log(`Total Sheets: ${workbook.SheetNames.length}`);
    console.log('Sheets:', workbook.SheetNames);

    workbook.SheetNames.forEach(name => {
        const sheet = workbook.Sheets[name];
        // estimate range
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
        const rows = range.e.r + 1;
        console.log(`Sheet "${name}": ~${rows} rows`);
    });

} catch (error) {
    console.error('Error analyzing local file:', error);
}
