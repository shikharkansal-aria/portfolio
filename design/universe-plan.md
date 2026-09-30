# Universe build: v2 "studio walkthrough" (2026-09-30), supersedes the globe below

Shikhar's feedback on v1: too orange, not dynamic, buttons too small and badly overlaid, "just a globe".
He wants: **light colours**, a **full-body** avatar of him (his Snapchat 3D Bitmoji look: peach polo, grey
joggers, white sneakers, glasses, beard, messy black hair), **livable**: hand movements, and a **walkthrough**
that shows "you can click here" and lets visitors walk through.

- Tokens: `design/tokens.md` (v2 light studio). Contract: `src/universe/types.ts` (v2: walkTo / playAction / anchor,
  station:* events, GuideAction clips).
- World: a bright studio floor (white → light grey, soft contact shadows, maybe a gentle curved horizon like a
  photo cyclorama), a winding path with one **station** per island (flagship biggest, near the start), each station a
  clean pastel plinth with its prop. The guide walks the path; camera follows over the shoulder / 3/4 view.
- Walkthrough: on enter, guide waves, then walks to Agent Builder and points at a "Click here to see how it works"
  bubble anchored to the station. Big overlay pills: ◀ Previous stop · **Next stop ▶** · Open project · Overview ·
  Recruiter view · Exit. Visitors can also click any station (guide walks there) or use a stop list.
- Avatar: `public/avatar/shikhar.glb` (rigged, clips idle/walk/wave/point/talk/think) once Shikhar provides it via
  a 3D service + Mixamo. Until then a CC0 placeholder rig (three.js RobotExpressive, CC0) with the same controller.
- Fallback (phones ≤820px, reduced motion, no WebGL, `?v=flat`): light 2D walkthrough (stepper) with the same
  panels and a still of the avatar; no three.js download.
- Everything else in v1 rules below still applies (facts, privacy, perf, a11y, ownership, no port 5178, no commits).

---

# Universe build — team plan (2026-09-30)

Shikhar replaced the ShikharOS desktop with an explorable 3D universe. Read `CLAUDE.md` (project) and
`design/tokens.md` first. Contract: `src/universe/types.ts` (orchestrator-owned; don't change without asking).

## Experience
1. **Landing (first screen, no click needed):** Agent Builder headline "5 days → 30 minutes" as the biggest text
   (framed honestly as build time, with the on-disk benchmark: 4-agent crew >240 s failing → 123 s, 0 errors),
   one positioning line, a final-year line (placeholder until Shikhar answers), buttons: **Enter the universe** (primary)
   and **Recruiter view** (always visible). Bitmoji guide beside the headline.
2. **Universe (loads only after "Enter"):** a low-poly globe in space; one island per project sized by tier; the Bitmoji
   guide (2D billboard sprite) stands on the focused island; drag to rotate, click an island → camera flies there →
   island panel opens. Keyboard: Tab through islands (a hidden-but-focusable list), Enter to fly, Esc to overview.
3. **Island panel:** what it does; "▶ Run" pipeline player (steps light up in order) or a step-through for beats;
   "Used / Rejected" decision cards; stack tags; how it runs; verified numbers; my part; link to the long case study.
4. **Flat map fallback:** phones (≤820px), `prefers-reduced-motion`, no WebGL, or `?v=flat` → a 2D clickable island
   map (SVG/HTML) using the same panels. No three.js download on this path.
5. **Recruiter view** (`/recruiter/`, also `?v=recruiter` on `/` redirects there): council hierarchy — one full flagship
   (Agent Builder), a strong second (the "Live" outage), then compact rows (Hisaab, Aria) and a "Tools" list.
6. **Removed:** the ShikharOS desktop (windows, dock, folders, Ask Aria). Backup: scratchpad `shikharos-backup-2026-09-30.tgz`.

## Islands (ids are fixed)
flagship `agent-builder` · second `outage` · mid `hisaab`, `aria` · moon `dragonfire` ·
small `job-hunt` (resume agent + ats-tracker), `ai-router` (freellm routing; FreeLLMAPI/OmniRoute/edge0 are third-party, credit them),
`claude-tools` (ocs-mcp, youtube-mcp, claude-chat-transfer), `mailbox`. Excluded: globe-vpn, aptitude quiz.

## File ownership (never edit another team's files)
| Team | Owns |
|---|---|
| Content | `src/islands.ts`, `src/content.ts` |
| 3D universe | `src/universe/*` except `types.ts`, `public/img/bitmoji/*` usage |
| Interface | `index.html`, `recruiter/index.html`, `src/main.ts`, `src/render.ts`, `src/panels/*`, `src/styles/*`, `src/recruiter.ts`, `src/covers.ts` |
| Orchestrator | `src/universe/types.ts`, `design/*`, `vite.config.ts`, `package.json` |

## Rules for every agent
- Facts only from `~/Downloads/Personal/Documents/career-kb/`, `TRACK-RECORD.md`, the resume, or research notes in the
  scratchpad `research/*.md` (private — never copy their DO-NOT-PUBLISH items: internal hostnames, IDs, client names,
  work emails, secrets, personal data). **Never use Shikhar's bank-statement figures** (1,345 / ₹9,35,785 / 1,149 / ₹3.87L / 755).
- Aria wording: "designed / directed / ran as product owner", not "coded".
- Copy: first person, plain, specific; `stop-slop` rules (no em dashes, no adverbs, no "not X but Y").
- Performance: first screen ships no three.js; universe chunk loaded via dynamic `import()`; Lighthouse ≥ 90 on `/` and `/recruiter/`.
- Accessibility: WCAG AA, keyboard path for everything, visible focus, reduced motion respected, 44px targets.
- Don't start another dev server on 5178 (Shikhar's preview). Use `npm run build` and, for screenshots, the headless
  Chrome script folder `scratchpad/pw` (playwright-core, `channel: 'chrome'`) against `npx vite preview --port 51xx`.
- No commits, no deploys, no network publishing.
- Team mode: split your area; spawn sub-agents if your tools allow it (sonnet for routine drafting/code, haiku for
  search). If you can't spawn, do the work yourself and put a "wave 2 split plan" in your report.
- Report: what you built (files), what you verified (commands/screenshots), what you didn't, open questions.
