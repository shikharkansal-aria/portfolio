import { defineConfig, type Plugin } from 'vite';
import { relative, resolve } from 'node:path';
import { home, work, casePage, journeyPage, about, recruiter, caseIds } from './src/site/pages.ts';

// Every page is rendered to static HTML at build time (fast, works without JavaScript).
// Each route has a one-line index.html shell; this plugin fills it.
const routes: Record<string, () => { head: string; body: string }> = {
  'index.html': home,
  'work/index.html': work,
  'journey/index.html': journeyPage,
  'about/index.html': about,
  'recruiter/index.html': recruiter,
  ...Object.fromEntries(caseIds.map((id) => [`work/${id}/index.html`, () => casePage(id)])),
};

const prerender = (): Plugin => ({
  name: 'prerender',
  transformIndexHtml(html, ctx) {
    const key = relative(import.meta.dirname, ctx.filename).split('\\').join('/');
    const render = routes[key];
    if (!render) throw new Error(`No page for ${key}`);
    const p = render();
    // Preload the two fonts first paint needs (hashed names are only known after the build).
    const pre = Object.keys(ctx.bundle ?? {})
      .filter((k) => /(dm-serif-display-latin-400-normal|inter-latin-wght-normal)-.*\.woff2$/.test(k))
      .map((k) => `<link rel="preload" as="font" type="font/woff2" href="/${k}" crossorigin />`)
      .join('');
    return html.replace('<!--head-->', p.head + pre).replace('<!--body-->', p.body);
  },
});

export default defineConfig({
  plugins: [prerender()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(Object.keys(routes).map((k) => [k.replace(/\/?index\.html$/, '') || 'home', resolve(import.meta.dirname, k)])),
    },
  },
});
