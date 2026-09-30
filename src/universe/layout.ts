// Where each station sits on the studio floor (x, z in metres) and how big its plinth is.
// No three.js here, so the interface can import it (e.g. ORDER for a stop list) without the 3D chunk.
import type { Tier } from './types';

/** Walk order along the path. Agent Builder first (and biggest). */
export const ORDER = ['agent-builder', 'outage', 'hisaab', 'aria', 'dragonfire', 'job-hunt', 'ai-router', 'claude-tools', 'mailbox'];

/** Station centres on the floor. The path snakes away from the camera (towards -z). */
export const STATION_POS: Record<string, [x: number, z: number]> = {
  'agent-builder': [0, 0],
  outage: [4.6, -3.8],
  hisaab: [1.1, -7.9],
  aria: [-3.7, -10.4],
  dragonfire: [-0.6, -14.0],
  'job-hunt': [3.6, -16.1],
  'ai-router': [1.0, -19.5],
  'claude-tools': [-3.2, -21.7],
  mailbox: [0.0, -25.1],
};

/** Where the guide starts, just in front of and left of Agent Builder. */
export const START: [x: number, z: number] = [-2.9, 3.6];

/** Plinth size by tier (radius, height), metres. The guide is 1.75 m tall. */
export const PLINTH: Record<Tier, { r: number; h: number }> = {
  flagship: { r: 1.6, h: 0.55 },
  second: { r: 1.25, h: 0.46 },
  mid: { r: 1.05, h: 0.4 },
  small: { r: 0.8, h: 0.34 },
  moon: { r: 0.9, h: 0.36 },
};

/** Position for an id without a fixed spot: continue the snake past the last station. */
export function extraPos(i: number): [number, number] {
  return [i % 2 ? -3 : 3, -28.5 - i * 3.6];
}
