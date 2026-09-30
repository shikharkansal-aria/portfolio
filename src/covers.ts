// Hand-drawn SVG covers for the case studies. Colours come from CSS tokens (see .cover in base.css),
// so they follow the v2 light palette. Decorative only: the text beside each cover carries the meaning.

const W = 640;
const H = 220;

// Flat, soft style (tokens v2): no offset shadow copy, the cover card carries the shadow.
const sh = (shape: string) => shape;

const frame = (_id: string, body: string) => `
<svg viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
  ${body}
</svg>`;

// 1. Agent Builder: a website passes 4 quality gates and comes out as a crew of agents.
function agentBuilder() {
  const gates = [262, 306, 350, 394]
    .map(
      (x, i) => `${sh(`<rect x="${x}" y="70" width="28" height="80" rx="5" class="cv-paper"/>`)}
      <path d="M${x + 7} 111 l5 6 l10 -13" class="cv-tick" style="animation-delay:${i * 0.25}s"/>`,
    )
    .join('');
  const sats: [number, number][] = [[472, 58], [592, 58], [472, 164], [592, 164]];
  return frame('ab', `
    <path d="M192 110 H540" class="cv-flow"/>
    ${sats.map(([x, y]) => `<path d="M532 111 L${x} ${y}" class="cv-line"/>`).join('')}
    ${sh(`<rect x="40" y="48" width="152" height="124" rx="7" class="cv-paper"/>`)}
    <path d="M40 72 H192" class="cv-line"/>
    <circle cx="54" cy="60" r="3.5" class="cv-solid"/><circle cx="66" cy="60" r="3.5" class="cv-solid"/><circle cx="78" cy="60" r="3.5" class="cv-solid"/>
    <rect x="56" y="86" width="92" height="9" rx="4.5" class="cv-solid"/>
    <rect x="56" y="104" width="118" height="6" rx="3" class="cv-muted"/>
    <rect x="56" y="116" width="100" height="6" rx="3" class="cv-muted"/>
    <rect x="56" y="128" width="110" height="6" rx="3" class="cv-muted"/>
    <rect x="56" y="142" width="52" height="18" rx="4" class="cv-flame"/>
    ${gates}
    ${sats.map(([x, y]) => sh(`<circle cx="${x}" cy="${y}" r="13" class="cv-paper"/>`)).join('')}
    ${sh(`<circle cx="532" cy="111" r="22" class="cv-flame"/>`)}
    <circle cx="532" cy="111" r="7" class="cv-solid"/>`);
}

// 2. The demo that said "Live": a console with a glowing Live light, a cable unplugged behind it,
//    19 failed days, then a heartbeat monitor with 3 checks.
function outage() {
  const days = Array.from({ length: 19 }, (_, i) => {
    const x = 392 + (i % 7) * 30;
    const y = 30 + Math.floor(i / 7) * 30;
    return i < 18
      ? `<rect x="${x}" y="${y}" width="22" height="22" rx="4" class="cv-paper"/><path d="M${x + 5} ${y + 17} L${x + 17} ${y + 5}" class="cv-slash"/>`
      : sh(`<rect x="${x}" y="${y}" width="22" height="22" rx="4" class="cv-flame"/>`) +
          `<path d="M${x + 5} ${y + 12} l4 5 l8 -10" class="cv-line"/>`;
  }).join('');
  return frame('ou', `
    <path d="M238 112 C274 112 282 150 318 150" class="cv-cable"/>
    <rect x="316" y="143" width="16" height="14" rx="2" class="cv-solid"/>
    <path d="M338 138 l8 -6 M340 150 h10 M338 162 l8 6" class="cv-spark"/>
    ${sh(`<rect x="358" y="138" width="16" height="24" rx="3" class="cv-paper"/>`)}
    ${sh(`<rect x="38" y="36" width="200" height="148" rx="9" class="cv-paper"/>`)}
    <rect x="54" y="52" width="168" height="74" rx="5" class="cv-screen"/>
    ${sh(`<rect x="70" y="76" width="92" height="28" rx="14" class="cv-paper"/>`)}
    <circle cx="88" cy="90" r="7" class="cv-flame cv-pulse"/>
    <rect x="102" y="86" width="46" height="8" rx="4" class="cv-solid"/>
    <circle cx="70" cy="154" r="9" class="cv-paper"/><circle cx="98" cy="154" r="9" class="cv-paper"/>
    <rect x="122" y="150" width="96" height="8" rx="4" class="cv-muted"/>
    ${days}
    <path d="M392 184 H430 l8 -18 l10 32 l8 -14 H486 l8 -18 l10 32 l8 -14 H542 l8 -18 l10 32 l8 -14 H602" class="cv-line"/>
    <circle cx="446" cy="166" r="5" class="cv-flame"/><circle cx="502" cy="166" r="5" class="cv-flame"/><circle cx="558" cy="166" r="5" class="cv-flame"/>`);
}

// 3. Hisaab: small UPI payments leave the phone as blank tags; one gets named with a single tap.
function hisaab() {
  const tags: [number, number][] = [[352, 34], [446, 24], [540, 44], [470, 104], [552, 146], [440, 170]];
  const tag = (x: number, y: number, cls: string) =>
    `<path d="M${x} ${y + 14} l14 -14 h58 a6 6 0 0 1 6 6 v16 a6 6 0 0 1 -6 6 h-58 z" class="${cls}"/><circle cx="${x + 16}" cy="${y + 14}" r="3" class="cv-solid"/>`;
  return frame('hi', `
    <path d="M166 124 C210 70 250 150 300 104 S350 110 368 120" class="cv-flow"/>
    ${tags.map(([x, y]) => tag(x, y, 'cv-tag')).join('')}
    ${sh(tag(356, 118, 'cv-flame'))}
    <rect x="378" y="128" width="30" height="7" rx="3.5" class="cv-solid"/>
    <circle cx="424" cy="132" r="18" class="cv-ring cv-pulse"/><circle cx="424" cy="132" r="6" class="cv-solid"/>
    ${[[196, 96], [228, 118], [262, 100], [296, 108]].map(([x, y]) => sh(`<circle cx="${x}" cy="${y}" r="10" class="cv-flame"/>`)).join('')}
    ${sh(`<rect x="60" y="22" width="102" height="178" rx="16" class="cv-paper"/>`)}
    <rect x="96" y="31" width="30" height="6" rx="3" class="cv-solid"/>
    ${sh(`<rect x="74" y="52" width="74" height="42" rx="7" class="cv-flame"/>`)}
    <rect x="82" y="62" width="40" height="7" rx="3.5" class="cv-solid"/><rect x="82" y="76" width="56" height="6" rx="3" class="cv-solid"/>
    <rect x="78" y="146" width="12" height="36" rx="3" class="cv-muted"/><rect x="96" y="126" width="12" height="56" rx="3" class="cv-solid"/>
    <rect x="114" y="156" width="12" height="26" rx="3" class="cv-muted"/><rect x="132" y="138" width="12" height="44" rx="3" class="cv-muted"/>
    <rect x="76" y="108" width="70" height="6" rx="3" class="cv-muted"/>`);
}

// 4. Aria: a voice waveform turns into a speech bubble, fed by 5 parallel build lanes.
function aria() {
  const bars = Array.from({ length: 17 }, (_, i) => {
    const h = Math.round(18 + 62 * Math.abs(Math.sin(i * 0.72)) * (0.55 + i / 34));
    return `<rect x="${44 + i * 13}" y="${110 - h / 2}" width="7" height="${h}" rx="3.5" class="${i % 5 === 2 ? 'cv-ember' : 'cv-solid'}"/>`;
  }).join('');
  const lanes = [58, 84, 110, 136, 162]
    .map((y, i) => `<path d="M604 ${y} H${520 + (i % 2) * 14} Q498 ${y} 480 110" class="cv-line"/>
      ${sh(`<circle cx="${560 - i * 9}" cy="${y}" r="7" class="cv-paper"/>`)}`)
    .join('');
  return frame('ar', `
    ${lanes}
    ${sh(`<path d="M300 52 h170 a12 12 0 0 1 12 12 v76 a12 12 0 0 1 -12 12 h-120 l-26 22 v-22 h-24 a12 12 0 0 1 -12 -12 v-76 a12 12 0 0 1 12 -12 z" class="cv-paper"/>`)}
    ${[352, 385, 418].map((x, i) => `<circle cx="${x}" cy="102" r="10" class="cv-flame cv-bounce" style="animation-delay:${i * 0.18}s"/>`).join('')}
    ${bars}`);
}

export const covers: Record<string, string> = {
  'agent-builder': agentBuilder(),
  outage: outage(),
  hisaab: hisaab(),
  aria: aria(),
};
