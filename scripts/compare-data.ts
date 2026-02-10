
import { fetchSchedule } from '../lib/schedule';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

async function compareData() {
    console.log('--- Starting Data Comparison ---');

    // 1. Analyze Local File
    const localPath = path.join(process.cwd(), 'anexos/Turmas 2026-1.xlsx');
    let localSheets: string[] = [];
    if (fs.existsSync(localPath)) {
        const workbook = XLSX.readFile(localPath);
        localSheets = workbook.SheetNames;
        console.log(`[LOCAL] Found ${localSheets.length} sheets in ${localPath}`);
        console.log(`[LOCAL] Sheets: ${localSheets.join(', ')}`);
    } else {
        console.error('[LOCAL] File not found!');
    }

    // 2. Analyze Online Fetch
    console.log('\n[ONLINE] Fetching properties from SharePoint link...');
    try {
        // We need to inspect the buffer directly or modify fetchSchedule to return the workbook
        // For now, let's use fetchSchedule and see what we get back.
        // Wait! fetchSchedule returns parsed data.
        // If we want to debug *why* sheets are missing, we might need to look at the workbook object inside fetchSchedule.
        // But first, let's see what fetchSchedule returns.

        const onlineData = await fetchSchedule();
        const onlineCourses = Array.from(new Set(onlineData.map(d => d.course))).sort();

        console.log(`[ONLINE] Fetched ${onlineData.length} total records.`);
        console.log(`[ONLINE] Found ${onlineCourses.length} distinct courses.`);
        console.log(`[ONLINE] Courses: ${onlineCourses.join(', ')}`);

        // 3. Compare
        const missingCourses = localSheets.filter(sheet => !onlineCourses.includes(sheet.trim())); // Trim to be safe

        if (missingCourses.length > 0) {
            console.error(`\n[MISMATCH] The following courses are missing from online data:\n${missingCourses.join('\n')}`);
        } else {
            console.log('\n[SUCCESS] Online data matches local sheets!');
        }

    } catch (e) {
        console.error('[ONLINE] Failed to fetch:', e);
    }
}

compareData();
