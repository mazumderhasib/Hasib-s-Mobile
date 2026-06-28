import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FFMPEG = ffmpegInstaller.path;

const W = 1080, H = 1920, FPS = 30;
const args = process.argv.slice(2);
const mode = args[0] || 'video';            // 'preview' | 'video'
const framesDir = join(__dirname, 'frames');
const outFile = join(__dirname, 'canada_day_shabahat_realtor.mp4');

const CHROME = process.env.CHROME_BIN || '/opt/pw-browsers/chromium';
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto('file://' + join(__dirname, 'index.html'));
await page.waitForFunction('window.__seek !== undefined');
const DUR = await page.evaluate('window.__DURATION');
// allow grain/svg to settle
await page.waitForTimeout(300);

if (mode === 'preview') {
  const times = args.slice(1).map(Number);
  mkdirSync(join(__dirname, 'preview'), { recursive: true });
  for (const t of times) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.waitForTimeout(40);
    const name = join(__dirname, 'preview', `t_${t.toFixed(2)}.png`);
    await page.screenshot({ path: name, clip: { x: 0, y: 0, width: W, height: H } });
    console.log('wrote', name);
  }
  await browser.close();
  process.exit(0);
}

// ---- full frame render ----
if (existsSync(framesDir)) rmSync(framesDir, { recursive: true });
mkdirSync(framesDir, { recursive: true });

const total = Math.round(DUR * FPS);
console.log(`Rendering ${total} frames @ ${FPS}fps (${DUR}s)...`);
for (let i = 0; i < total; i++) {
  const t = i / FPS;
  await page.evaluate((tt) => window.__seek(tt), t);
  const name = join(framesDir, `f_${String(i).padStart(4, '0')}.png`);
  await page.screenshot({ path: name, clip: { x: 0, y: 0, width: W, height: H } });
  if (i % 30 === 0) console.log(`  frame ${i}/${total}`);
}
await browser.close();

console.log('Encoding MP4 (H.264 + faststart)...');
const ff = spawnSync(FFMPEG, [
  '-y',
  '-framerate', String(FPS),
  '-i', join(framesDir, 'f_%04d.png'),
  '-c:v', 'libx264',
  '-profile:v', 'high',
  '-pix_fmt', 'yuv420p',
  '-crf', '18',
  '-preset', 'slow',
  '-movflags', '+faststart',
  '-r', String(FPS),
  outFile
], { stdio: 'inherit' });
if (ff.status !== 0) { console.error('ffmpeg failed'); process.exit(1); }
console.log('Done ->', outFile);
