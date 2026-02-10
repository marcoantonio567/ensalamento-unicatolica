
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(__dirname, '../schedule_cache.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    console.log(`Workbook has ${workbook.SheetNames.length} sheets.`);

    const missing = ["NPJ"];
    workbook.SheetNames.forEach(name => {
        if (!missing.includes(name)) return;
        const sheet = workbook.Sheets[name];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`\n--- Sheet: "${name}" (${rows.length} rows) ---`);
        if (rows.length > 0) {
            for (let i = 0; i < Math.min(10, rows.length); i++) {
                console.log(`Row ${i}:`, JSON.stringify(rows[i]));
            }
        }
    });

} catch (e) {
    console.error('Error reading file:', e);
}
