// One-off: copy source screenshots into public/img as small WebP files.
import sharp from 'sharp';
import os from 'node:os';

const home = os.homedir();
const jobs = [
  { src: `${home}/DragonFire/dragon.png`, out: 'public/img/dragon.webp', width: 360 },
  { src: `${home}/DragonFire/dragon.png`, out: 'public/img/dragon-icon.webp', width: 64 },
  { src: `${home}/Downloads/Work/Aria/aria-web/shots/mc-final.png`, out: 'public/img/aria-mission-control.webp', width: 1200 },
  // Crop out the toolbar and status toast; keep the avatar.
  { src: `${home}/Downloads/Work/Aria/aria-web/shots/live-qa/happy_idle.png`, out: 'public/img/aria-avatar.webp', width: 480,
    extract: { left: 130, top: 280, width: 500, height: 560 } },
];

for (const j of jobs) {
  let img = sharp(j.src);
  if (j.extract) img = img.extract(j.extract);
  const info = await img.resize({ width: j.width }).webp({ quality: 78 }).toFile(j.out);
  console.log(j.out, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
}
