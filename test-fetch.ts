import { fetchSchedule } from './lib/schedule';

async function test() {
    try {
        const data = await fetchSchedule();
        console.log('Fetched', data.length, 'records');
        if (data.length > 0) {
            // Log unique courses
            const courses = Array.from(new Set(data.map(d => d.course))).sort();
            console.log('Courses found:', courses);
            console.log('Total Records:', data.length);
            console.log('Sample record:', data[0]);
        } else {
            console.log('No records found. Check console for column mapping logs.');
        }
    } catch (e) {
        console.error(e);
    }
}

test();
