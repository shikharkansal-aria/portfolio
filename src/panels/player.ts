// "▶ Run" pipeline player and the Prev/Next beat step-through inside an island panel.
import { svg, icons } from './html';

const STEP_MS = 700;

export function initPlayer(root: HTMLElement, reduceMotion: boolean): () => void {
  const cleanups: (() => void)[] = [];
  const pipe = root.querySelector<HTMLElement>('[data-pipeline]');
  if (pipe) cleanups.push(pipeline(pipe, reduceMotion));
  const beats = root.querySelector<HTMLElement>('[data-beats]');
  if (beats) beatsPlayer(beats);
  return () => cleanups.forEach((f) => f());
}

function pipeline(el: HTMLElement, reduceMotion: boolean) {
  const steps = [...el.querySelectorAll<HTMLElement>('.step')];
  const run = el.querySelector<HTMLButtonElement>('[data-run]')!;
  const runLabel = run.querySelector('span')!;
  const replay = el.querySelector<HTMLButtonElement>('[data-replay]')!;
  const announce = el.querySelector<HTMLElement>('[data-announce]')!;
  const playIcon = svg(icons.play);
  const pauseIcon = svg(icons.pause);
  let at = -1; // index of the active step; steps.length means finished
  let timer = 0;
  let running = false;

  const paint = () => {
    steps.forEach((s, k) => {
      s.classList.toggle('is-done', k < at || at >= steps.length);
      s.classList.toggle('is-active', k === at);
      if (k === at) s.setAttribute('aria-current', 'step');
      else s.removeAttribute('aria-current');
    });
    const done = at >= steps.length;
    const label = running ? 'Pause' : done ? 'Run again' : at >= 0 ? 'Resume' : 'Run';
    runLabel.textContent = label;
    run.querySelector('svg')!.outerHTML = running ? pauseIcon : playIcon;
    replay.hidden = !(at >= 0 && !done);
    el.classList.toggle('is-running', running);
  };
  const say = () => {
    if (at >= 0 && at < steps.length) announce.textContent = `Step ${at + 1} of ${steps.length}: ${steps[at].querySelector('b')!.textContent}`;
    else if (at >= steps.length) announce.textContent = 'Pipeline finished.';
  };
  const stop = () => { running = false; clearTimeout(timer); };
  const tick = () => {
    at += 1;
    if (at >= steps.length) { stop(); at = steps.length; }
    paint(); say();
    if (running) timer = window.setTimeout(tick, STEP_MS);
  };
  const start = (fromZero: boolean) => {
    if (fromZero) at = -1;
    if (reduceMotion) { at = steps.length; stop(); paint(); say(); return; }
    running = true;
    tick();
  };

  run.addEventListener('click', () => {
    if (running) { stop(); paint(); return; }
    start(at >= steps.length || at < 0);
  });
  replay.addEventListener('click', () => { stop(); start(true); });
  return stop;
}

function beatsPlayer(el: HTMLElement) {
  const beats = [...el.querySelectorAll<HTMLElement>('.beat')];
  const prev = el.querySelector<HTMLButtonElement>('[data-prev]')!;
  const next = el.querySelector<HTMLButtonElement>('[data-next]')!;
  const count = el.querySelector<HTMLElement>('[data-count]')!;
  let at = 0;
  const show = (k: number) => {
    at = Math.max(0, Math.min(beats.length - 1, k));
    beats.forEach((b, n) => { b.hidden = n !== at; });
    count.textContent = String(at + 1);
    prev.disabled = at === 0;
    next.disabled = at === beats.length - 1;
    // Keep focus on a usable control when the one pressed becomes disabled.
    if (document.activeElement instanceof HTMLButtonElement && document.activeElement.disabled) (at === 0 ? next : prev).focus();
  };
  prev.addEventListener('click', () => show(at - 1));
  next.addEventListener('click', () => show(at + 1));
}
