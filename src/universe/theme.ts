// Studio palette, read from the page's CSS custom properties (design/tokens.md v2) with safe fallbacks.
import { Color } from 'three';

export interface Theme {
  bg: Color; surface: Color; ink: Color; muted: Color; accent: Color; sky: Color; peach: Color; line: Color;
  floorEdge: Color; slate: Color; skyDeep: Color; peachDeep: Color; idle: Color; lilac: Color; mint: Color; robot: Color;
}

export function readTheme(): Theme {
  const cs = getComputedStyle(document.documentElement);
  const css = (name: string, fb: string) => {
    const v = cs.getPropertyValue(name).trim();
    try { return v ? new Color(v) : new Color(fb); } catch { return new Color(fb); }
  };
  const accent = css('--accent', '#1F5FD6');
  const sky = css('--sky', '#DDE9FF');
  const peach = css('--peach', '#F7C6B0');
  const ink = css('--ink', '#16181D');
  return {
    bg: css('--bg', '#F6F7F9'),
    surface: css('--surface', '#FFFFFF'),
    ink,
    muted: css('--muted', '#5B6270'),
    accent,
    sky,
    peach,
    line: css('--line', '#E3E6EC'),
    floorEdge: new Color('#EEF0F3'),
    slate: new Color('#3B4252'),
    skyDeep: sky.clone().lerp(accent, 0.28),
    peachDeep: peach.clone().lerp(new Color('#D9785A'), 0.35),
    idle: new Color('#CBD3E1'),
    lilac: new Color('#E4DDFB'),
    mint: new Color('#D6F2E6'),
    robot: new Color('#C9D4E4'),
  };
}
