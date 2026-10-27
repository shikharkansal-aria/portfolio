# Design v4: Apple-style gallery (decided by Shikhar, 2026-10-27)

Shikhar chose: Apple-style light gallery · journey told with the year pinned while that year's work scrolls ·
Agent Builder figure written as "5 days by hand → 30 minutes, to set up AI voice agents for one new client" ·
his 3D Bitmoji as the hero picture.

Built with: taste-skill v2 (direction dealt: "The pinned poster", seed 351028969, palette and type kept from the
Apple reference), awesome-design-md/apple tokens, vercel-labs web-design-guidelines, Impeccable detect,
Hallmark sloplint (render tier), Playwright and playwright-cli. Every page: 0 FAIL in taste-skill inspect.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#ffffff` | page |
| `--parch` | `#f5f5f7` | alternate canvas, light tiles, panels |
| `--step` | `#e8e8ed` | quiet buttons, image wells |
| `--ink` | `#1d1d1f` | text |
| `--muted` | `#56565b` | secondary text (AA on white and parchment) |
| `--dark` | `#000000` | dark tiles, contact, footer of case pages |
| `--accent` | `#0066cc` | actions and "after" figures; `#2997ff` on dark |

Type: one family, SF on Apple devices and Inter Variable elsewhere. Five sizes (`--xl`, `--l`, `--m`, `--b`, `--s`).
Buttons: pills. Links: blue with a chevron. Motion: staggered entrances, pinned year, skill picture crossfade,
avatar drift; all off under reduced motion.
