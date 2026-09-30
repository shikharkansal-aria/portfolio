// The guide: a rigged avatar driven by an AnimationMixer.
// Order: /avatar/shikhar.vrm (VRoid export, animated with VRMA clips; see vrm.ts, loaded as its own lazy chunk)
//     → /avatar/shikhar.glb (rigged GLB with named clips) → /avatar/placeholder.glb → a simple capsule figure.
//
// placeholder.glb = three.js "RobotExpressive" (examples/models/gltf/RobotExpressive, three.js r160).
// Licence, from that folder's README: "Model by Tomás Laulhé (Quaternius) ... CC0 1.0.
// Modifications by Don McCurdy" (morph targets, FBX2GLTF conversion, material tweaks).
// Clips: Dance, Death, Idle, Jump, No, Punch, Running, Sitting, Standing, ThumbsUp, Walking, WalkJump, Wave, Yes.
// We recolour it a neutral light grey-blue so it sits in the light studio palette until Shikhar's GLB lands.
import {
  AnimationAction, AnimationClip, AnimationMixer, Box3, CapsuleGeometry, Color, Group, LoopOnce, LoopRepeat, Mesh,
  MeshStandardMaterial, Object3D, SphereGeometry, Vector3,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GuideAction } from './types';
import type { Theme } from './theme';

export const GUIDE_HEIGHT = 1.75;

export interface Guide {
  root: Group;              // position/rotate this; feet at y=0, faces +z
  kind: 'avatar' | 'placeholder' | 'primitive';
  play(a: GuideAction): void;
  /** Walking on/off; `pace` scales the walk clip (1 = natural). */
  setWalking(on: boolean, pace?: number): void;
  setReduced(r: boolean): void;
  update(dt: number): void;
  dispose(): void;
}

const LOOPING: GuideAction[] = ['idle', 'walk', 'talk'];
/** RobotExpressive (and similar) clip names for our actions, tried after the plain word. */
const ALIASES: Record<GuideAction, string[]> = {
  idle: ['idle'],
  walk: ['walk'],
  wave: ['wave', 'waving'],
  point: ['point', 'thumbsup'],
  talk: ['talk', 'yes'],
  think: ['think', 'standing', 'idle'],
};

export function resolveClip(clips: AnimationClip[], a: GuideAction): AnimationClip | null {
  const names = clips.map((c) => c.name.toLowerCase());
  for (const word of ALIASES[a]) {
    let i = names.findIndex((n) => n === word || n.startsWith(word));
    if (i < 0) i = names.findIndex((n) => n.includes(word));
    if (i >= 0) return clips[i];
  }
  return null;
}

async function exists(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: 'HEAD' });
    const ct = r.headers.get('content-type') ?? '';
    return r.ok && !ct.includes('text/html'); // dev servers answer unknown paths with index.html
  } catch { return false; }
}

export interface GuideOptions { avatarUrl?: string }

/** `opts.avatarUrl` (dev harness only) forces a model; a URL ending in .vrm or containing "vrm" loads through three-vrm. */
export async function loadGuide(theme: Theme, opts: GuideOptions = {}): Promise<Guide> {
  const base = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');
  try {
    const forced = opts.avatarUrl;
    const vrmUrl = forced ? (/vrm|aria/i.test(forced) ? forced : null) : (await exists(`${base}/avatar/shikhar.vrm`)) ? `${base}/avatar/shikhar.vrm` : null;
    if (vrmUrl) {
      const { loadVrmGuide } = await import('./vrm');
      return await loadVrmGuide(vrmUrl, `${base}/avatar/anim/`);
    }
    const glb = forced ?? ((await exists(`${base}/avatar/shikhar.glb`)) ? `${base}/avatar/shikhar.glb` : null);
    const url = glb ?? `${base}/avatar/placeholder.glb`;
    const gltf = await new GLTFLoader().loadAsync(url);
    return fromGltf(gltf.scene, gltf.animations, !glb, theme);
  } catch (e) {
    console.warn('Guide model failed to load, using a simple figure.', e);
    return primitiveGuide(theme);
  }
}

function fromGltf(model: Object3D, clips: AnimationClip[], placeholder: boolean, theme: Theme): Guide {
  // normalise to GUIDE_HEIGHT, feet on the floor
  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  const s = GUIDE_HEIGHT / Math.max(0.01, size.y);
  model.scale.setScalar(s);
  model.position.y = -box.min.y * s;
  const root = new Group();
  root.add(model);
  model.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    m.castShadow = true;
    m.frustumCulled = false; // skinned bounds are bind-pose only
    if (placeholder) {
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats as MeshStandardMaterial[]) {
        if (!mat.color) continue;
        if (mat.name === 'Main') mat.color.copy(theme.robot);
        else if (mat.name === 'Grey') mat.color.set('#E8ECF2');
        else if (mat.name === 'Black') mat.color.copy(theme.slate);
        mat.metalness = 0;
        mat.roughness = 0.7;
      }
    }
  });

  const mixer = new AnimationMixer(model);
  return mixerGuide(root, mixer, (a) => resolveClip(clips, a), placeholder ? 'placeholder' : 'avatar', () => mixer.uncacheRoot(model));
}

/**
 * Shared clip controller: loops (idle/walk/talk) are the base layer; one-shots (wave/point/think) crossfade in
 * and back out to the base when they finish. `clipFor` may return null (clip missing or not loaded yet) → idle.
 */
export function mixerGuide(
  root: Group, mixer: AnimationMixer, clipFor: (a: GuideAction) => AnimationClip | null,
  kind: Guide['kind'], onDispose: () => void, onUpdate?: (dt: number) => void,
): Guide {
  const get = (a: GuideAction): AnimationAction | null => {
    const clip = clipFor(a);
    if (!clip) return null;
    const act = mixer.clipAction(clip);
    const loop = LOOPING.includes(a);
    act.setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 1);
    act.clampWhenFinished = !loop;
    return act;
  };
  let idle = get('idle');
  let base: AnimationAction | null = idle;
  let current: AnimationAction | null = null;
  let oneShot = false;
  let walking = false;
  let reduced = false;
  let pace = 1;

  const fadeTo = (next: AnimationAction | null, dur = 0.25) => {
    if (!next) next = idle ?? (idle = get('idle'));
    if (!next) return;
    if (next === current) {
      if (next.loop === LoopOnce) next.reset().play();
      return;
    }
    next.enabled = true;
    next.reset().setEffectiveWeight(1).fadeIn(dur).play();
    current?.fadeOut(dur);
    current = next;
  };
  const applyScales = () => {
    if (idle) idle.timeScale = reduced ? 0.35 : 1;
    const w = walking ? get('walk') : null;
    if (w) w.timeScale = pace;
  };
  mixer.addEventListener('finished', (e) => {
    if ((e as unknown as { action: AnimationAction }).action === current) { oneShot = false; fadeTo(base, 0.3); }
  });
  fadeTo(idle, 0);
  applyScales();

  return {
    root,
    kind,
    play(a) {
      if (!idle) idle = get('idle');
      const act = get(a) ?? idle;
      if (LOOPING.includes(a)) {
        if (a !== 'walk') base = act;
        oneShot = false;
      } else oneShot = true;
      fadeTo(act);
    },
    setWalking(on, p = 1) {
      walking = on;
      pace = p;
      if (!idle) idle = get('idle');
      const walk = on ? get('walk') : null;
      base = on ? walk ?? idle : base && base !== get('walk') ? base : idle;
      applyScales();
      if (on || !oneShot) { oneShot = false; fadeTo(base); }
    },
    setReduced(r) { reduced = r; applyScales(); },
    update(dt) { mixer.update(dt); onUpdate?.(dt); },
    dispose() { mixer.stopAllAction(); onDispose(); },
  };
}

/** Last-resort guide when no GLB loads: a soft capsule figure in his outfit colours. */
function primitiveGuide(theme: Theme): Guide {
  const root = new Group();
  const mat = (c: Color | string) => new MeshStandardMaterial({ color: c, roughness: 0.7 });
  const body = new Group();
  const legs = new Mesh(new CapsuleGeometry(0.16, 0.55, 6, 16), mat('#D5DAE1'));
  legs.position.y = 0.45;
  const torso = new Mesh(new CapsuleGeometry(0.22, 0.35, 6, 16), mat(theme.peach));
  torso.position.y = 1.1;
  const head = new Mesh(new SphereGeometry(0.17, 24, 16), mat('#E8B99A'));
  head.position.y = 1.55;
  const hair = new Mesh(new SphereGeometry(0.18, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(theme.ink));
  hair.position.y = 1.58;
  for (const m of [legs, torso, head, hair]) { m.castShadow = true; body.add(m); }
  root.add(body);
  let t = 0, walking = false, reduced = false;
  return {
    root, kind: 'primitive',
    play() {},
    setWalking(on) { walking = on; },
    setReduced(r) { reduced = r; },
    update(dt) {
      t += dt;
      body.position.y = reduced ? 0 : walking ? Math.abs(Math.sin(t * 8)) * 0.05 : Math.sin(t * 2) * 0.008;
    },
    dispose() {},
  };
}
