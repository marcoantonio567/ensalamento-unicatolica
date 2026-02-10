
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    // URL for direct download.
    const SPREADSHEET_URL = 'https://ubecedu-my.sharepoint.com/:x:/g/personal/raimara_rodrigues_catolica-to_edu_br/IQALA5Yo0JsZSr3JBJO6Lkq7ARYkehG7oWHVfgsnM9aQaSM?download=1';
    // const VIEW_URL = 'https://ubecedu-my.sharepoint.com/:x:/g/personal/raimara_rodrigues_catolica-to_edu_br/IQALA5Yo0JsZSr3JBJO6Lkq7ARYkehG7oWHVfgsnM9aQaSM';

    // Try the view URL to see the UI
    const TARGET_URL = 'https://ubecedu-my.sharepoint.com/:x:/g/personal/raimara_rodrigues_catolica-to_edu_br/IQALA5Yo0JsZSr3JBJO6Lkq7ARYkehG7oWHVfgsnM9aQaSM';

    console.log('Launching Puppeteer debug...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport big enough to see buttons
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log(`Navigating to ${TARGET_URL}...`);
        await page.goto(TARGET_URL, { waitUntil: 'networkidle0', timeout: 60000 });

        console.log('Page loaded. waiting 5s...');
        await new Promise(r => setTimeout(r, 5000));

        const screenshotPath = path.resolve(__dirname, 'debug-sharepoint.png');
        await page.screenshot({ path: screenshotPath });
        console.log(`Screenshot saved to ${screenshotPath}`);

    } catch (error) {
        console.error('Puppeteer error:', error);
    } finally {
        await browser.close();
    }
})();
