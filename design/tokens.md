# Design tokens v2: light studio (decided 2026-09-30)

Shikhar rejected v1 (dark, heavy orange). Reference: his Snapchat 3D Bitmoji editor clip: bright white/light-grey
studio, soft shadows, full-body avatar, clean black and light-blue UI. v1 is archived in the scratchpad backup.

Tone: **bright, airy, friendly studio.** Light first. The world is the hero; UI floats over it as big, clear pills.

## Color (WCAG AA checked)
| Token | Value | Use | Contrast |
|---|---|---|---|
| `--bg` | `#F6F7F9` | page / studio backdrop top | — |
| `--surface` | `#FFFFFF` | panels, cards, pills | — |
| `--ink` | `#16181D` | text, primary buttons (white text on ink) | 17.8 on surface |
| `--muted` | `#5B6270` | secondary text | 6.1 on surface, 5.7 on bg |
| `--accent` | `#1F5FD6` | links, focus ring, active/selected state, "click here" hints | 5.7 on white (both ways) |
| `--sky` | `#DDE9FF` | selected-state fill, hint glow (decor; ink text on it 14.5) | — |
| `--peach` | `#F7C6B0` | warm decor from his polo: station tops, path markers (ink text on it 11.6) | — |
| `--line` | `#E3E6EC` | hairlines, card borders | — |
| Floor | `#EEF0F3` → `#FFFFFF` radial | studio floor, soft contact shadows | — |
No orange. No dark space backgrounds. Dark mode is optional and not a priority.

## Type
Display: Bricolage Grotesque (600–800). Body: system-ui. Data: IBM Plex Mono 500 (metrics only).

## Shape & depth
Radius 16px cards, 999px pills. Borders 1px `--line` (no heavy 2px ink outlines). Soft shadows:
`0 8px 24px rgba(22,24,29,.10)`, hover `0 12px 32px rgba(22,24,29,.14)`.
Buttons: min 48px tall (56px for primary overlay actions), 16–18px text, generous padding, placed on a
frosted surface (`rgba(255,255,255,.82)` + 12px blur) so they sit cleanly over the 3D scene.

## Motion
Avatar is always alive: idle breathing/sway, walks along the path, waves on arrival, points at hints.
UI transitions 180ms ease-out. `prefers-reduced-motion`: avatar holds idle, camera cuts instead of flying.

## Signature element
**The walkthrough guide.** The full-body avatar walks the visitor from station to station and physically points at
what to click next ("Click here to run it"). The before→after metric strip stays as the data signature, restyled light.
