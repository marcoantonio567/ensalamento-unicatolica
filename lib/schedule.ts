
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Determine Environment
const isProduction = process.env.NODE_ENV === 'production';

// Use /tmp for Vercel, or local path for dev
// Vercel only allows writing to /tmp
const LOCAL_FILE = isProduction
    ? path.join('/tmp', 'schedule_cache.xlsx')
    : path.resolve(process.cwd(), 'schedule_cache.xlsx');

export interface ClassSession {
    id: string;
    course: string;
    period: string;
    subject: string;
    professor: string;
    day: string;
    room: string;
    time: string;
    classGroup: string;
    block: string;
    campus: string;
    shift: string;
    frequency: string;
}

const SPREADSHEET_URL = 'https://ubecedu-my.sharepoint.com/:x:/g/personal/raimara_rodrigues_catolica-to_edu_br/IQALA5Yo0JsZSr3JBJO6Lkq7ARYkehG7oWHVfgsnM9aQaSM?download=1';

async function getBrowser() {
    let browser;
    if (isProduction) {
        // Vercel / Production
        console.log('Launching Chromium for Vercel...');
        /* 
           NOTE: You must add the following to your package.json dependencies:
           "puppeteer-core": "^24.0.0",
           "@sparticuz/chromium": "^133.0.0" (check latest versions compatible)
        */
        chromium.setGraphicsMode = false;
        browser = await puppeteer.launch({
            args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
    } else {
        // Local Dev: Try to use local Chrome or installed puppeteer
        console.log('Launching Local Chrome...');
        try {
            // Need 'puppeteer' (full) for local dev usually, or point to executable
            // Since we might not want 'puppeteer' full dep in production to save space, 
            // we can try to find local chrome.
            const { executablePath } = require('puppeteer'); // This requires 'puppeteer' in devDeps
            browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true,
                executablePath: executablePath(),
            });
        } catch (e) {
            // Fallback: try standard launch if puppeteer is in node_modules
            browser = await puppeteer.launch({
                channel: 'chrome',
                headless: true
            });
        }
    }
    return browser;
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
    console.log(`Launching Browser to download spreadsheet to ${outputPath}...`);
    let browser = null;
    try {
        browser = await getBrowser();
        const page = await browser.newPage();

        const client = await page.createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: path.dirname(outputPath)
        });

        console.log(`Navigating to ${url}...`);
        const dir = path.dirname(outputPath);

        // Initial file check
        // In /tmp we might not find previous files easily or they might persist briefly.
        // We'll trust the "new file appeared" logic or check file mtime.
        const initialFiles = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('Waiting for download to complete...');
        let downloadedFile: string | null = null;

        // Wait loop
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 1000));
            const currentFiles = fs.readdirSync(dir);
            // Look for a new .xlsx file or simply *any* .xlsx if we assume clean /tmp
            // But Sharepoint might name it unpredictable.
            // Best bet: finding a file that wasn't there, or the one with latest mtime.
            const newFile = currentFiles.find(f => !initialFiles.includes(f) && f.endsWith('.xlsx'));
            if (newFile) {
                downloadedFile = path.join(dir, newFile);
                break;
            }
        }

        if (downloadedFile) {
            console.log(`Downloaded file detected: ${downloadedFile}`);
            // Resize / Rename
            // We need to move it to outputPath (schedule_cache.xlsx)
            // Note: outputPath might be same as downloadedFile if we are lucky with name, but unlikely.
            await new Promise(r => setTimeout(r, 1000)); // wait for write finish

            try {
                // If target exists, delete it first
                if (fs.existsSync(outputPath) && downloadedFile !== outputPath) {
                    fs.unlinkSync(outputPath);
                }

                if (downloadedFile !== outputPath) {
                    fs.copyFileSync(downloadedFile, outputPath);
                    fs.unlinkSync(downloadedFile);
                }
            } catch (err) {
                console.error('Error moving file:', err);
            }
            console.log(`Saved to ${outputPath}`);
        } else {
            console.warn('Timeout: No new .xlsx file detected.');
        }

    } catch (error) {
        console.error('Puppeteer navigation error:', error);
    } finally {
        if (browser) await browser.close();
    }
}

export async function fetchSchedule(): Promise<ClassSession[]> {
    try {
        await downloadFile(SPREADSHEET_URL, LOCAL_FILE);

        if (!fs.existsSync(LOCAL_FILE)) {
            console.error(`Schedule file not found at ${LOCAL_FILE}`);
            return [];
        }

        const buffer = fs.readFileSync(LOCAL_FILE);
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const schedule: ClassSession[] = [];
        let idCounter = 0;

        console.log(`Workbook loaded with ${workbook.SheetNames.length} sheets.`);

        workbook.SheetNames.forEach(sheetName => {
            try {
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

                if (!rows || rows.length < 2) return;

                const upperName = sheetName.toUpperCase();
                const isCampusII = ["MEDICINA VETERINÁRIA", "ZOOTECNIA", "AGRONOMIA"].some(c => upperName.includes(c));
                const campus = isCampusII ? "Campus II" : "Campus I";

                let courseShift = "Noite";
                if (upperName.includes("DIREITO MATUTINO") || upperName.includes("MATUTINO")) {
                    courseShift = "Manhã";
                } else if (upperName.includes("VESPERTINO")) {
                    courseShift = "Tarde";
                } else if (upperName.includes("INTEGRAL")) {
                    courseShift = "Integral";
                }

                let headerRowIndex = -1;
                let colMap: any = null;

                for (let r = 0; r < Math.min(10, rows.length); r++) {
                    const rowObj = rows[r];
                    if (!Array.isArray(rowObj)) continue;

                    const hRow = rowObj.map(h => (h || '').toString().trim().toLowerCase());

                    const foundMap = {
                        period: hRow.findIndex(h => h.includes('período') || h.includes('periodo')),
                        subject: hRow.findIndex(h => h.includes('disciplina') || h.includes('matéria') || h.includes('assunto') || h.includes('estágio') || h.includes('estagio')),
                        professor: hRow.findIndex(h => h.includes('docente') || h.includes('professor') || h.includes('instrutor')),
                        day: hRow.findIndex(h => h.includes('dia') || h.includes('semana')),
                        room: hRow.findIndex(h => h.includes('sala') || h.includes('local')),
                        block: hRow.findIndex(h => h.includes('bloco')),
                        time: hRow.findIndex(h => h.includes('horário') || h.includes('hora')),
                        classGroup: hRow.findIndex(h => h.includes('turma') || h.includes('grupo')),
                    };

                    if (foundMap.day >= 0 && (foundMap.subject >= 0 || foundMap.professor >= 0)) {
                        headerRowIndex = r;
                        colMap = foundMap;
                        break;
                    }
                }

                if (headerRowIndex === -1 || !colMap) return;

                let lastPeriod = "";

                for (let i = headerRowIndex + 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row || row.length === 0) continue;

                    const getValue = (idx: number) => (idx >= 0 && row[idx] !== undefined && row[idx] !== null ? row[idx].toString().trim() : '');
                    const course = sheetName.trim();

                    let period = getValue(colMap.period);
                    let subject = getValue(colMap.subject);

                    if (subject.toLowerCase() === 'disciplina' || subject.toLowerCase() === 'período') continue;

                    if (period) {
                        lastPeriod = period;
                    } else if (lastPeriod) {
                        period = lastPeriod;
                    }

                    if (!subject && colMap.subject === -1 && sheetName.includes("NPJ")) {
                        subject = sheetName.trim();
                    }

                    if (!subject || subject === "0" || subject.toLowerCase() === "null") continue;

                    const professor = getValue(colMap.professor) || "(Sem informação)";

                    let dayRaw = getValue(colMap.day);
                    let day = dayRaw;
                    let shift = courseShift;
                    let frequency = "";

                    if (dayRaw.toLowerCase().includes("quinzenal")) {
                        frequency = "Quinzenal";
                        if (dayRaw.includes("01")) frequency += " (1ª Sem.)";
                        if (dayRaw.includes("02")) frequency += " (2ª Sem.)";
                    }

                    const lowerDay = dayRaw.toLowerCase();
                    if (courseShift === "Integral" || lowerDay.includes("manhã") || lowerDay.includes("tarde") || lowerDay.includes("noite")) {
                        if (lowerDay.includes("manhã") || lowerDay.includes("matutino")) {
                            shift = "Manhã";
                        } else if (lowerDay.includes("tarde") || lowerDay.includes("vespertino")) {
                            shift = "Tarde";
                        } else if (lowerDay.includes("noite") || lowerDay.includes("noturno")) {
                            shift = "Noite";
                        }
                    }

                    if (lowerDay.includes("sábado") || lowerDay.includes("sabado")) {
                        if (!lowerDay.includes("manhã") && !lowerDay.includes("tarde") && !lowerDay.includes("noite")) {
                            shift = "Manhã";
                        }
                    }

                    const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
                    const foundDay = days.find(d => dayRaw.toLowerCase().includes(d.toLowerCase()));
                    if (foundDay) day = foundDay;

                    let block = getValue(colMap.block);
                    let room = getValue(colMap.room);

                    if (!block) block = "-";
                    if (!room) room = "(Sem sala)";

                    const time = getValue(colMap.time);
                    const classGroup = getValue(colMap.classGroup);

                    if (!day) continue;

                    idCounter++;
                    schedule.push({
                        id: `${idCounter}-${course}-${subject}-${day}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase(),
                        course,
                        period,
                        subject,
                        professor,
                        day,
                        room,
                        time,
                        classGroup,
                        block,
                        campus,
                        shift,
                        frequency
                    });
                }
            } catch (err) {
                console.error(`Error parsing sheet "${sheetName}":`, err);
            }
        });

        return schedule;

    } catch (error) {
        console.error('Error fetching schedule:', error);
        return [];
    }
}
