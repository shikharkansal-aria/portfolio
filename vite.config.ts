import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'node:path';
import { renderDesktop, renderRecruiter } from './src/render';

// Pre-render every page at build time so content is in the HTML (fast LCP, works without JS).
const prerender = (): Plugin => ({
  name: 'prerender',
  transformIndexHtml(html, ctx) {
    const body = /recruiter[\\/]index\.html$/.test(ctx.filename) || ctx.path.startsWith('/recruiter')
      ? renderRecruiter()
      : renderDesktop();
    return html.replace('<!--app-->', body);
  },
});

export default defineConfig({
  plugins: [prerender()],
  build: {
    // The 3D walkthrough chunk (~170 KB gzip) loads only after "Start the walkthrough".
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      input: { main: resolve(__dirname, 'index.html'), recruiter: resolve(__dirname, 'recruiter/index.html') },
    },
  },
});
