import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = process.env.BHA_REPO;
const EXPL = path.join(HERE, '..', 'explainer');
const FPS = 30;
const tl = JSON.parse(fs.readFileSync(path.join(EXPL, 'timeline.json'), 'utf8'));
const eeg = JSON.parse(fs.readFileSync(path.join(REPO, 'assets', 'eeg_sub08.json'), 'utf8'));
const man = JSON.parse(fs.readFileSync(path.join(EXPL, 'audio', 'tts_manifest.json'), 'utf8'));
const PAD_IN = 0.5, PAD_OUT = 0.9;

// scenes: start/dur from manifest; cues = sentence starts (absolute)
const scenes = []; let t0 = 0;
man.slides.forEach((m, i) => {
  const dur = PAD_IN + m.duration + PAD_OUT;
  const cues = tl.cues.filter(c => c.slide === i).map(c => c.start);
  scenes.push({ start: t0, dur, cues: cues.length ? cues : [t0 + PAD_IN] });
  t0 += dur;
});
const TOTAL = t0;
const timeline = { scenes, total: TOTAL };
fs.writeFileSync(path.join(HERE, 'film_timeline.json'), JSON.stringify(timeline, null, 1));

const mode = process.argv[2] || 'all';           // all | stills
const outDir = path.join(HERE, 'frames'); fs.mkdirSync(outDir, { recursive: true });
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars', '--disable-gpu', '--font-render-hinting=none'] });
const p = await b.newPage();
await p.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await p.evaluateOnNewDocument((show, eegData) => { window.SHOW_DIR = show; window.EEG = eegData; }, path.join(REPO, 'assets', 'showcase'), eeg.trials[3].avg);
await p.goto('file://' + path.join(HERE, 'film.html'), { waitUntil: 'load' });
await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))); });
await p.evaluate(tl => window.init(tl), timeline);

if (mode === 'stills') {
  // one representative frame per scene (mid + near end) for review
  for (let i = 0; i < scenes.length; i++) {
    for (const f of [0.35, 0.9]) {
      const t = scenes[i].start + scenes[i].dur * f;
      await p.evaluate(t => window.seek(t), t);
      await p.screenshot({ type: 'jpeg', quality: 90, path: path.join(HERE, `still_${String(i + 1).padStart(2, '0')}_${f}.jpg`) });
    }
  }
  console.log('stills done'); await b.close(); process.exit(0);
}

const frames = Math.round(TOTAL * FPS);
const t1 = Date.now();
for (let f = 0; f < frames; f++) {
  await p.evaluate(t => window.seek(t), f / FPS);
  await p.screenshot({ type: 'jpeg', quality: 92, path: path.join(outDir, `f${String(f).padStart(5, '0')}.jpg`) });
  if (f % 600 === 0) console.log('frame', f, '/', frames, ((Date.now() - t1) / 1000).toFixed(0) + 's');
}
console.log('frames', frames, 'total', TOTAL.toFixed(2));
await b.close();
