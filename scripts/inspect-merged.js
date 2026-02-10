
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(__dirname, '../schedule_cache.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    // Find a sheet likely to have merged cells or specific structure
    const targetSheet = "ENGENHARIA DE SOFTWARE";

    if (workbook.SheetNames.includes(targetSheet)) {
        const sheet = workbook.Sheets[targetSheet];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`\n--- Inspecting "${targetSheet}" ---`);
        for (let i = 0; i < Math.min(15, rows.length); i++) {
            console.log(`Row ${i}:`, JSON.stringify(rows[i]));
        }
    } else {
        console.log(`Sheet "${targetSheet}" not found.`);
        console.log("Available:", workbook.SheetNames);
    }

} catch (e) {
    console.error('Error reading file:', e);
}
