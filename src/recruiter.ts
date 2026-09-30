// Recruiter view: scroll-scrubbed hero clip. Loads only on desktop, with motion allowed and no data saver.
const hero = document.querySelector<HTMLElement>('[data-hero]');
const video = hero?.querySelector<HTMLVideoElement>('video');
const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
const allowed =
  matchMedia('(min-width: 821px)').matches &&
  !matchMedia('(prefers-reduced-motion: reduce)').matches &&
  !conn?.saveData;

if (hero && video && allowed) {
  const start = () => {
    video.src = video.dataset.mp4!;
    video.load();
    video.addEventListener('loadeddata', () => video.classList.add('ready'), { once: true });
    video.addEventListener('loadedmetadata', scrub, { once: true });
  };

  // Map scroll through the hero to the clip's timeline, eased so seeks stay smooth.
  let target = 0;
  let current = 0;
  let raf = 0;
  const progress = () => {
    const r = hero.getBoundingClientRect();
    return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.8)));
  };
  function frame() {
    current += (target - current) * 0.18;
    if (Math.abs(target - current) < 0.01) current = target;
    if (Math.abs(video!.currentTime - current) > 0.02) video!.currentTime = current;
    raf = current === target ? 0 : requestAnimationFrame(frame);
  }
  function scrub() {
    if (!video!.duration) return;
    // Start slightly in so the first frame already shows motion blur-free content.
    target = 0.15 + progress() * (video!.duration - 0.3);
    if (!raf) raf = requestAnimationFrame(frame);
  }
  addEventListener('scroll', scrub, { passive: true });

  // Wait for the page to finish loading so the clip never competes with first paint.
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
}
