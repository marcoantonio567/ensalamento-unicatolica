
const fs = require('fs');
const path = require('path');

const URL = 'https://ubecedu-my.sharepoint.com/:x:/g/personal/raimara_rodrigues_catolica-to_edu_br/IQALA5Yo0JsZSr3JBJO6Lkq7ARYkehG7oWHVfgsnM9aQaSM?download=1';
const OUT = path.resolve(__dirname, '../test_fetch.xlsx');

async function test() {
    console.log('Fetching...');
    try {
        const response = await fetch(URL, { redirect: 'follow' });
        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const buffer = await response.arrayBuffer();
        fs.writeFileSync(OUT, Buffer.from(buffer));
        console.log(`Saved ${buffer.byteLength} bytes.`);

        // Simple check for ZIP header (PK..)
        const header = Buffer.from(buffer).slice(0, 2).toString();
        if (header === 'PK') {
            console.log('SUCCESS: File looks like a valid ZIP/XLSX.');
        } else {
            console.log('FAILURE: invalid header', header);
        }

    } catch (e) {
        console.error(e);
    }
}

test();
