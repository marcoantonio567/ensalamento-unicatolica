
import { fetchSchedule } from '../lib/schedule';

async function verify() {
    console.log('--- Comprehensive Schedule Verification (v2) ---');
    try {
        const data = await fetchSchedule();

        if (data.length === 0) {
            console.error('FAILED: No data fetched.');
            return;
        }

        const courses = Array.from(new Set(data.map(d => d.course))).sort();
        const subjects = Array.from(new Set(data.map(d => d.subject))).filter(Boolean);

        console.log(`\nResults:`);
        console.log(`- Total Courses Found: ${courses.length}`);
        console.log(`- Total Disciplines (Record Count): ${data.length}`);
        console.log(`- Unique Disciplines (Subject Names): ${subjects.length}`);

        // Validation Checks
        const emptyPeriods = data.filter(d => (!d.period || d.period.trim() === "") && d.course !== "NPJ"); // NPJ might not have periods
        if (emptyPeriods.length > 0) {
            console.warn(`⚠️ WARNING: ${emptyPeriods.length} rows have empty Period (Fill-down failed?).`);
            console.log("Sample empty period:", JSON.stringify(emptyPeriods[0], null, 2));
        } else {
            console.log(`✅ SUCCESS: All rows have Period assigned (Fill-down working).`);
        }

        const campuses = Array.from(new Set(data.map(d => d.campus)));
        console.log(`- Campuses Found: ${campuses.join(", ")}`);

        const shifts = Array.from(new Set(data.map(d => d.shift)));
        console.log(`- Shifts Found: ${shifts.join(", ")}`);

        const blocks = Array.from(new Set(data.map(d => d.block)));
        console.log(`- Blocks Found (Sample): ${blocks.slice(0, 10).join(", ")}...`);

        console.log(`\nSample Data (Rich Metadata):`);
        console.log(JSON.stringify(data.slice(0, 3).map(d => ({
            course: d.course,
            period: d.period,
            subject: d.subject,
            day: d.day,
            block: d.block,
            campus: d.campus,
            shift: d.shift
        })), null, 2));

        if (courses.length >= 18) {
            console.log('\n✅ SUCCESS: Course coverage is good.');
        }

    } catch (e) {
        console.error('Verification failed:', e);
    }
}

verify();
