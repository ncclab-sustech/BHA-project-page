import puppeteer from 'puppeteer-core';
import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = process.env.BHA_REPO; const HTML = process.argv[2]; const mode = process.argv[3] || 'all'; const outDir = process.argv[4] || path.join(HERE, 'frames_' + path.basename(HTML, '.html'));
const FPS = 30; fs.mkdirSync(outDir, { recursive: true });
const eeg = JSON.parse(fs.readFileSync(path.join(REPO, 'assets', 'eeg_sub08.json'), 'utf8'));
const attr = JSON.parse(fs.readFileSync(path.join(REPO, 'assets', 'insight', 'attribution_maps.json'), 'utf8'));
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars', '--disable-gpu', '--font-render-hinting=none'] });
const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await p.evaluateOnNewDocument((show, e, ch, a, ins) => { window.SHOW_DIR = show; window.EEG = e; window.EEGCH = ch; window.ATTR = a; window.INS_DIR = ins; }, path.join(REPO, 'assets', 'showcase'), eeg.trials[3].avg, eeg.channels, attr, path.join(REPO, 'assets', 'insight', 'img'));
await p.goto('file://' + path.join(HERE, HTML), { waitUntil: 'load' });
await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))); });
const TOTAL = await p.evaluate(() => window.TOTAL);
if (mode === 'stills') {
  const ts = process.argv[5] ? process.argv[5].split(',').map(Number) : Array.from({ length: Math.floor(TOTAL / 3) }, (_, i) => i * 3 + 1.5);
  for (const t of ts) { await p.evaluate(t => window.seek(t), t); await p.screenshot({ type: 'jpeg', quality: 88, path: path.join(outDir, `s_${String(Math.round(t * 10)).padStart(4, '0')}.jpg`) }); }
  console.log('stills', ts.length); await b.close(); process.exit(0);
}
const frames = Math.round(TOTAL * FPS); const t1 = Date.now();
for (let f = 0; f < frames; f++) { await p.evaluate(t => window.seek(t), f / FPS); await p.screenshot({ type: 'jpeg', quality: 92, path: path.join(outDir, `f${String(f).padStart(5, '0')}.jpg`) }); if (f % 600 === 0) console.log('frame', f, '/', frames); }
console.log('frames', frames, 'total', TOTAL); await b.close();
