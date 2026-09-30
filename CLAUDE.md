# Shikhar Kansal — personal brand portfolio site

## Decisions already made (by Shikhar, 2026-09-29)
- **Audience:** recruiters and hiring managers for product roles — APM, Product Analyst, Product Associate, Growth.
  The site must prove product judgment: problems picked, decisions and trade-offs, what shipped, measured outcomes.
- **Style:** playful and interactive (e.g. an OS-desktop or terminal metaphor; his animated DragonFire dragon
  and Aria virtual human are natural motifs) — memorable, but never at the cost of clarity.
- **Must also have a one-click "Recruiter view":** a plain, fast, one-page version (who he is, 3–4 flagship
  case studies, experience, resume PDF, contact) reachable from the first screen. Many recruiters skim for 30 seconds.
- **Hosting:** Vercel. Build locally first; deploy only after Shikhar approves (he'll log in with `npx vercel login`).

## Content sources (never invent — every claim must trace to these)
1. `~/Downloads/Personal/Documents/career-kb/INDEX.md` → the 8 cited evidence files. **Obey the "Cautions" list** there
   (Aria authorship wording, no Nurix MCP server, Agent Builder figure = his "5 days → 30 minutes", EY CAFTA = "Finalist", no Amazon sponsorship claim, etc.).
2. `~/Downloads/Personal/Documents/TRACK-RECORD.md` (headline numbers, contradictions, not-on-disk list).
3. Latest resume: `~/Downloads/Personal/Documents/resumes-2026-09/fmt_general.pdf` (+ `.docx`) — wording he approved; link the PDF from the site.
4. Projects on disk for demos/screenshots: `~/Downloads/Work/Aria`, `~/DragonFire`, `~/Downloads/Personal/Projects/*` (ats-tracker, hisaab, apex-game, ken-case…), `~/Downloads/Work/Tools/*`.

## Public-site rules
- Public web ≠ resume: **no confidential client details** (internal numbers, prompts, contracts, recordings, customer data). Client names only where they already appear on his approved resume; otherwise anonymise ("a US farm-retail chain"). Ask him if unsure.
- No secrets/keys, no private personal info. Contact: email, phone (+91 62030 42129, approved by Shikhar 2026-10-01), LinkedIn, GitHub.
- Write copy with the `stop-slop` skill: specific, plain, first-person, numbers where verified. No buzzword soup.
- Case-study shape: Problem → what he did (decisions/trade-offs) → result (verified number) → what he learned.

## How to build
- Use the design skills: `design-plan` (tokens/style first), `ui-ux-pro-max`, `ui-styling`; then the `design-review` agent
  to check responsiveness and WCAG AA before showing him. Must work on phone width and with reduced motion.
- Stack: keep it light and fast (static — e.g. Vite + vanilla/React, or Astro). Lighthouse performance ≥ 90.
- Show him a local preview (`npm run dev`, open the browser, screenshots) at each milestone; ask before big direction changes.
- Use Claude subagents (Explore) to mine the career-kb for case-study material. Never send his data to free models (`freellm`/cheap-worker).

## Team mode
Work as team lead (see ~/.claude/CLAUDE.md): parallel subagents for content mining (one per career-kb area),
copywriting (stop-slop), and building sections/components; then `design-review` for UI/accessibility and the
`verifier` agent for facts, links, privacy and build/Lighthouse checks before each preview you show Shikhar.
