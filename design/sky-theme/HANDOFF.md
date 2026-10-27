# Sky theme: handoff (27 Oct 2026)

Status: **work in progress, not built yet.** The live-ready site is on `redesign-editorial`.
This branch only starts the sky theme. The home hero is unstyled here until the new hero is written.

## What Shikhar asked for

- The look of the hero video he shared (`ayush-portfolio-hero.mp4`, on his Mac; not committed because it is someone else's work).
- "The bend, the 3D-ness shall be there."
- "Build the whole portfolio on the home theme": every page, not just the hero.
- Inspiration: https://motionsites.ai/?prompt=future-3d-portfolio (the cloud session could not reach it; open it locally).

## The reference, described

- Sky from deep cobalt (#1d4be0) at the top to lavender and pink (#f3b8d6) at the bottom, soft pink-lit clouds, a few stars.
- "Hi, I'm" in a small italic serif above a big white serif name, one-line subline under it.
- Giant condensed words scrolling sideways behind the scene, semi-transparent white.
- Centre: a 3D projector on a white pedestal, a light cone, and a **curved glass browser window** (edges bent toward the viewer, purple corner knobs).
- Small props on the pedestal; a vertical text nav at bottom left with an "Interactive mode ON" toggle.

## Plan (agreed defaults; ask Shikhar before changing)

1. **Hero (three.js, already installed: three 0.169, fonts DM Serif Display and Oswald):**
   - Bent screen: PlaneGeometry with segments, z = x² / 2R so the edges come forward; a glass layer (MeshPhysicalMaterial) plus a content layer with a CanvasTexture.
   - The screen cycles: a greeting; Agent Builder ("5 days by hand" struck, "30 minutes", label "to set up AI voice agents for one new client"); NuPlay (`nuplay-landing`); Hisaab (`hisaab-phones`, "Now building"); "53 bots".
   - Projector (RoundedBoxGeometry, emissive strip, light cone), pedestal, his **Bitmoji** (`/img/avatar-cutout.webp` as a plane) and a Hisaab app-icon prop (`/img/hisaab-logo.svg`).
   - Do not copy Ayush's mug, ball or projector renders; build originals.
   - Pointer tilt; the toggle turns motion off; static poster image when WebGL is missing or motion is reduced.
   - Lazy-load three after first paint (Lighthouse at least 90).
   - Ticker: PRODUCT · GROWTH · AI VOICE AGENTS · HISAAB.
   - Left vertical nav: Work, Now building, Journey, About, 30-second version.
2. **Whole site:**
   - Lavender-white page background; glass cards (white at 62%, blur, soft violet shadow) in place of the grey panels.
   - Sky-gradient panels in place of the black tiles. Use only the blue-violet part behind white text; pink stays decoration (contrast).
   - Serif (DM Serif Display) for h1/h2, Inter for body.
   - Sky header with clouds on every page; contact section as full sky.
   - Subtle 3D tilt on cards.
3. Re-run the gates after: the taste-skill inspector (0 FAIL), `npx impeccable detect`, axe and link tests, phone width, reduced motion.

## Files on this branch

- `src/site/site.css`: the old hero rules are removed (to be replaced). Restore them from `redesign-editorial` if you need the old hero back.
- `package.json`: adds three, @types/three, @fontsource/dm-serif-display, @fontsource-variable/oswald.
- `design/sky-theme/clouds.mjs`: draws original clouds as an SVG and renders `clouds.png` with Playwright. First draft is `clouds-draft.webp`; it reads too flat and noisy. Next: fewer, larger puffs, stronger white tops, less noise.
