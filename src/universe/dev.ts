// Dev-only harness for the 3D studio (not part of the site build). Open /src/universe/dev.html on the dev server.
// ?panel=600 sets --universe-panel-px on the container (simulates the docked panel).
// ?avatar=<url> forces a model, e.g. Aria's VRM served from outside public/ to test the VRM path.
import { islands } from '../islands';
import type { GuideAction, UniverseAPI } from './types';
import { ORDER } from './layout';

const q = new URLSearchParams(location.search);
const el = document.getElementById('u')!;
if (q.get('panel')) el.style.setProperty('--universe-panel-px', `${q.get('panel')}px`);
const log = document.getElementById('log')!;
const events: { name: string; detail: unknown; t: number }[] = [];
for (const name of ['station:arrive', 'station:hover', 'station:click', 'universe:ready']) {
  window.addEventListener(name, (e) => {
    const detail = (e as CustomEvent).detail;
    events.push({ name, detail, t: Math.round(performance.now()) });
    log.textContent = `${name} ${JSON.stringify(detail)}`;
  });
}
Object.assign(window, { __events: events });

const t0 = performance.now();
const { mountUniverse } = await import('./scene');
try {
  const api: UniverseAPI = await mountUniverse(el, islands, { avatarUrl: q.get('avatar') ?? undefined });
  Object.assign(window, { __u: api, __mountMs: Math.round(performance.now() - t0) });
  const bar = document.getElementById('bar')!;
  const btn = (label: string, fn: () => void) => { const b = document.createElement('button'); b.textContent = label; b.onclick = fn; bar.append(b); };
  btn('overview', () => api.overview());
  for (const id of ORDER) btn(id, () => void api.walkTo(id));
  for (const a of ['wave', 'point', 'talk', 'think', 'idle'] as GuideAction[]) btn(`▶${a}`, () => api.playAction(a));
  btn('dispose', () => api.dispose());
  // hint dot following anchor('agent-builder') to check projection
  const dot = document.createElement('div');
  dot.style.cssText = 'position:fixed;width:12px;height:12px;margin:-6px;border-radius:50%;background:#1F5FD6;pointer-events:none';
  document.body.append(dot);
  const tick = () => {
    const cur = [...events].reverse().find((e) => e.name === 'station:arrive')?.detail as { id: string } | undefined;
    const a = api.anchor(cur?.id ?? 'agent-builder');
    dot.style.display = a ? 'block' : 'none';
    if (a) { dot.style.left = `${a.x}px`; dot.style.top = `${a.y}px`; }
    requestAnimationFrame(tick);
  };
  tick();
} catch (err) {
  log.textContent = `fallback: ${(err as Error).message}`;
  Object.assign(window, { __err: (err as Error).message });
}
