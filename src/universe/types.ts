// Shared contract between the content, 3D world and interface teams. Owned by the orchestrator:
// change it only by agreement, because all three teams build against it.
// v2 (2026-09-30): the globe became a light "studio walkthrough"; islands are now stations on a path,
// and the guide is a full-body rigged avatar (GLB) with animation clips.

export type Tier = 'flagship' | 'second' | 'mid' | 'small' | 'moon';

/** One step of an island's "press run" pipeline animation. */
export interface PipelineStep {
  label: string;   // 1–4 words, shown on the node ("Editable brief")
  detail: string;  // one plain sentence shown when the step is active
}

/** A used-or-rejected decision, the "what I used / what I didn't" card. */
export interface Decision {
  choice: string;    // what was used ("Room database")
  rejected?: string; // what was turned down ("SQLDelight")
  why: string;       // one sentence, first person
}

/** For step-through stories (the outage) instead of a pipeline. */
export interface Beat {
  when?: string;  // "22 Aug"
  title: string;  // "Lookups start failing"
  detail: string;
}

export interface Island {
  id: string;            // stable slug, also the URL hash: #agent-builder
  title: string;
  tier: Tier;
  tagline: string;       // one line a recruiter reads on hover
  context: string;       // "Nurix AI · internal platform · Jun–Sep 2026"
  scope: 'work' | 'personal' | 'competition';
  metric?: { before: string; after: string; label: string };
  what: string;          // 1–2 sentences: what it does, plain English
  pipeline?: PipelineStep[]; // 3–8 steps
  beats?: Beat[];            // use instead of pipeline for stories
  stack: string[];           // short tags: ["Swift", "AppKit", "Claude CLI"]
  decisions: Decision[];     // 2–5
  runs: string;              // how it runs: local / phone-only / launchd …
  numbers: { value: string; label: string }[]; // 2–4, all verified
  myPart?: string;           // own vs team / tools, where it matters
  learned?: string;
  caseId?: string;           // links to the long case study in content.ts, if any
}

/**
 * Guide actions. The avatar GLB (public/avatar/shikhar.glb) carries animation clips whose names
 * contain these words (case-insensitive): idle, walk, wave, point, talk, think. Missing clips fall back
 * to idle. Until the GLB exists the scene uses a placeholder guide with the same API.
 */
export type GuideAction = 'idle' | 'walk' | 'wave' | 'point' | 'talk' | 'think';

/** Events the 3D world emits and the interface listens to (window CustomEvents). */
export interface UniverseEvents {
  'station:arrive': { id: string };        // guide reached a station → interface shows its hint / panel button
  'station:hover': { id: string | null };  // pointer over a station (for labels/cursor)
  'station:click': { id: string };         // visitor clicked a station in the scene
  'universe:ready': Record<string, never>;
}

/** What the 3D world exposes to the interface. */
export interface UniverseAPI {
  /** Guide walks to the station (camera follows), then emits station:arrive. Resolves on arrival. */
  walkTo(id: string): Promise<void>;
  /** Wide shot of the whole path. */
  overview(): void;
  /** Play a one-shot or looping guide action (wave on arrival, point at a hint, talk while a panel is open). */
  playAction(a: GuideAction): void;
  /** Screen position of a station's hint anchor (for placing "Click here" bubbles). null if off-screen. */
  anchor(id: string): { x: number; y: number } | null;
  dispose(): void;
}
