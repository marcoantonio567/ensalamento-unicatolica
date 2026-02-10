
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Optional: local executable path for dev
// You might need to adjust this path based on your local OS/Chrome install if not using 'puppeteer' full package
// But since we have 'puppeteer' installed as devDependency or similar, we can try to find it.
// Actually, better to keep 'puppeteer' linked for local dev and 'puppeteer-core' for prod.

export async function getBrowser() {
    let browser;

    if (process.env.NODE_ENV === 'production') {
        // Vercel / Production
        // @sparticuz/chromium needs to be configured
        chromium.setGraphicsMode = false;

        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
    } else {
        // Local Development
        // We need a local executable. 
        // Since we removed 'puppeteer' (the one that downloads chrome) in favor of core+sparticuz...
        // Wait, did we remove it? The user has 'puppeteer' installed from before.
        // We should try to use the installed puppeteer's chrome or the system chrome.

        try {
            // Try importing full puppeteer to get the executable path if available
            const { executablePath } = require('puppeteer');
            browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true,
                executablePath: executablePath(),
            });
        } catch (e) {
            console.warn("Could not load local puppeteer executable. Trying default lookup...");
            // Fallback for local dev if 'puppeteer' is not capable
            browser = await puppeteer.launch({
                channel: 'chrome',
                headless: true
            });
        }
    }

    return browser;
}
