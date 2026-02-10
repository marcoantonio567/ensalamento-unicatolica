
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    // Try the view URL to see the UI
    const TARGET_URL = 'https://ubecedu-my.sharepoint.com/:x:/g/personal/raimara_rodrigues_catolica-to_edu_br/IQALA5Yo0JsZSr3JBJO6Lkq7ARYkehG7oWHVfgsnM9aQaSM';

    console.log('Launching Puppeteer debug (SharePoint selectors)...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log(`Navigating to ${TARGET_URL}...`);
        await page.goto(TARGET_URL, { waitUntil: 'networkidle0', timeout: 60000 });

        console.log('Page loaded. Waiting 10s for dynamic content...');
        await new Promise(r => setTimeout(r, 10000));

        // 1. Get Page Title
        const title = await page.title();
        console.log('Page Title:', title);

        // 2. Dump all buttons and links, including IFRAMES, focusing on SharePoint selectors
        const elements = await page.evaluate(() => {
            const result = [];

            function scan(doc, prefix = '') {
                const selectors = [
                    'button', 'a', '[role="button"]', '[data-automationid]', '[aria-label]', '[title]', 'i', 'li', 'span'
                ];

                doc.querySelectorAll(selectors.join(',')).forEach(el => {
                    const text = (el.innerText || el.textContent || '').trim();
                    const ariaLabel = el.getAttribute('aria-label') || '';
                    const title = el.getAttribute('title') || '';
                    const dataAutomationId = el.getAttribute('data-automationid') || '';
                    const id = el.id || '';

                    if (text || ariaLabel || title || dataAutomationId || id) {
                        result.push({
                            source: prefix || 'main',
                            tag: el.tagName,
                            text: text.replace(/\s+/g, ' '),
                            ariaLabel,
                            title,
                            dataAutomationId,
                            id,
                            class: el.className
                        });
                    }
                });
            }

            scan(document);

            const iframes = document.querySelectorAll('iframe');
            for (let i = 0; i < iframes.length; i++) {
                try {
                    const frameDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
                    if (frameDoc) {
                        scan(frameDoc, `iframe-${i}`);
                    }
                } catch (e) {
                    result.push({ source: `iframe-${i}`, error: 'Cross-origin or inaccessible' });
                }
            }
            return result;
        });

        console.log(`Found ${elements.length} elements.`);

        const keywords = ['download', 'baixar', 'arquivo', 'file', 'export', 'salvar', 'copy', 'download a copy'];
        const interesting = elements.filter(e =>
            !e.error && keywords.some(k =>
                (e.text && e.text.toLowerCase().includes(k)) ||
                (e.ariaLabel && e.ariaLabel.toLowerCase().includes(k)) ||
                (e.title && e.title.toLowerCase().includes(k)) ||
                (e.dataAutomationId && e.dataAutomationId.toLowerCase().includes(k))
            )
        );

        console.log('\n--- Interesting Elements ---');
        console.log(JSON.stringify(interesting, null, 2));

        // Also screenshot
        await page.screenshot({ path: path.resolve(__dirname, 'debug-sharepoint-selectors.png') });

    } catch (error) {
        console.error('Puppeteer error:', error);
    } finally {
        await browser.close();
    }
})();
