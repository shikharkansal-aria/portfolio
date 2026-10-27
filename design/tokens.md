# Design tokens v3: editorial ledger (decided 2026-10-27)

Replaces v2 (light 3D studio walkthrough). Shikhar asked for a multi-page site a recruiter can navigate easily,
that does not look AI-generated. Built with the design-taste-frontend rules: no gradients, glass, eyebrows,
monospace, hairlines, pill badges or icon cards.

Idea: his work is booked like a ledger. Every project shows its before and after, measured.

| Token | Value | Use |
|---|---|---|
| `--ground` | `#EEF0EB` | page |
| `--paper` | `#F7F8F5` | lighter step for alternate sections and rows |
| `--step` | `#E1E5DD` | tone step for selected rows, quiet buttons, image wells |
| `--ink` | `#121512` | text, dark fields (flagship, footer) |
| `--muted` | `#434A43` | secondary text |
| `--soft` | `#5C645C` | struck-out "before" numbers (AA at all sizes) |
| `--accent` | `#0B6B4B` | ledger green: primary action, "after" numbers, photo field |
| `--accent-on-dark` | `#7FDCB3` | accent on dark fields |

Type: Bricolage Grotesque Variable for headings and numbers; system UI for text. Five sizes (`--xl`, `--l`, `--m`, `--b`, `--s`).
Buttons: square corners, one fill. Motion: staggered entrances (transform and opacity), off under reduced motion.
Pages: `/`, `/work/`, `/work/<case>/`, `/journey/`, `/about/`, `/recruiter/` (30-second version). Content: `src/site/data.ts`.
