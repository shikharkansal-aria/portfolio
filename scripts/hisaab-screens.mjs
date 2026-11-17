// Builds the Hisaab screens the site shows from the framed app screenshots (demo data).
// Run: node scripts/hisaab-screens.mjs <folder with the framed PNGs>
// Writes into public/img/journey/:
//   hisaab-row.webp (1600 wide) and hisaab-row-800.webp: the five-phone row (Home, ask why, reasons, Activity, You)
//   hisaab-<screen>-400.webp and -800.webp: single phones, transparent corners kept
import sharp from 'sharp';
import { join } from 'node:path';

const src = process.argv[2];
if (!src) {
  console.error('Usage: node scripts/hisaab-screens.mjs <folder with the framed PNGs>');
  process.exit(1);
}
const out = 'public/img/journey';

const phones = {
  home: '1-home.png',
  askwhy: '2-askwhy.png',
  reasons: '2b-askwhy-reasons.png',
  typing: '2c-askwhy-typing.png',
  activity: '3-activity.png',
  you: '5-you.png',
};

const save = async (input, file, width, quality) => {
  const info = await sharp(input).resize({ width }).webp({ quality, alphaQuality: 90, effort: 6 }).toFile(join(out, file));
  console.log(file, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
};

for (const [name, file] of Object.entries(phones)) {
  const input = join(src, file);
  await save(input, `hisaab-${name}-400.webp`, 400, 82);
  await save(input, `hisaab-${name}-800.webp`, 800, 80);
}
const row = join(src, 'row-composite.png');
await save(row, 'hisaab-row.webp', 1600, 84);
await save(row, 'hisaab-row-800.webp', 800, 84);
