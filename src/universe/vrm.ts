// VRM guide (Shikhar's VRoid avatar), animated with VRMA clips retargeted at runtime by three-vrm-animation.
// Loaded through a dynamic import from avatar.ts only when a .vrm exists, so three-vrm stays out of the main 3D chunk.
//
// Clips in public/avatar/anim/ come from Aria's VRMA library (aria-v2/animation/vrma/, Mixamo FBX converted to VRMA,
// forward root motion stripped so the path controller moves the guide). Mixamo animations are licensed for use in
// projects; they are shipped here as part of the site, not as a standalone asset pack.
import { AnimationClip, AnimationMixer, Group, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm';
import { VRMAnimationLoaderPlugin, VRMLookAtQuaternionProxy, createVRMAnimationClip, type VRMAnimation } from '@pixiv/three-vrm-animation';
import type { GuideAction } from './types';
import { mixerGuide, type Guide } from './avatar';

/** GuideAction → VRMA files to try, in order. `wave` uses `greeting` on the first arrival (see clipFor). */
const FILES: Record<string, string[]> = {
  idle: ['happy_idle', 'idle'],
  walk: ['walk'],
  wave: ['waving'],
  greet: ['greeting', 'waving'],
  point: ['pointing'],
  talk: ['nodding'],
  think: ['thinking'],
  cheer: ['cheering'],
};
const PRELOAD = ['idle', 'walk', 'greet', 'wave'];

export async function loadVrmGuide(url: string, animBase: string): Promise<Guide> {
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const gltf = await loader.loadAsync(url);
  const vrm = gltf.userData.vrm as VRM | undefined;
  if (!vrm) throw new Error(`${url} is not a VRM`);
  VRMUtils.removeUnnecessaryVertices(gltf.scene);
  VRMUtils.combineSkeletons(gltf.scene);
  VRMUtils.rotateVRM0(vrm); // VRM 0.x faces -Z; after this every model faces +Z like our guide convention
  vrm.scene.traverse((o) => {
    const m = o as Mesh;
    if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; }
  });
  if (vrm.lookAt) {
    const proxy = new VRMLookAtQuaternionProxy(vrm.lookAt);
    proxy.name = 'lookAtQuaternionProxy';
    vrm.scene.add(proxy);
  }
  const root = new Group();
  root.add(vrm.scene);

  const animLoader = new GLTFLoader();
  animLoader.register((parser) => new VRMAnimationLoaderPlugin(parser));
  const clips = new Map<string, AnimationClip | null>();
  const loading = new Map<string, Promise<void>>();
  const loadKey = (key: string): Promise<void> => {
    if (!loading.has(key)) {
      loading.set(key, (async () => {
        for (const f of FILES[key] ?? []) {
          try {
            const g = await animLoader.loadAsync(`${animBase}${f}.vrma`);
            const anim = (g.userData.vrmAnimations as VRMAnimation[] | undefined)?.[0];
            if (anim) { const c = createVRMAnimationClip(anim, vrm); c.name = f; clips.set(key, c); return; }
          } catch { /* try the next file */ }
        }
        clips.set(key, null);
      })());
    }
    return loading.get(key)!;
  };
  await Promise.all(PRELOAD.map(loadKey));
  for (const k of Object.keys(FILES)) if (!PRELOAD.includes(k)) void loadKey(k); // the rest in the background

  let greeted = false;
  const clipFor = (a: GuideAction): AnimationClip | null => {
    if (a === 'wave' && !greeted) { greeted = true; return clips.get('greet') ?? clips.get('wave') ?? null; }
    const c = clips.get(a);
    if (c === undefined) void loadKey(a);
    return c ?? null;
  };

  // blink every few seconds so the face never freezes
  let nextBlink = 2, blinkT = -1;
  const blink = (dt: number) => {
    const em = vrm.expressionManager;
    if (!em) return;
    nextBlink -= dt;
    if (nextBlink <= 0 && blinkT < 0) { blinkT = 0; nextBlink = 2.5 + Math.random() * 3; }
    if (blinkT >= 0) {
      blinkT += dt;
      const v = blinkT < 0.07 ? blinkT / 0.07 : blinkT < 0.16 ? 1 - (blinkT - 0.07) / 0.09 : 0;
      em.setValue('blink', Math.max(0, v));
      if (blinkT >= 0.16) blinkT = -1;
    }
  };

  const mixer = new AnimationMixer(vrm.scene);
  return mixerGuide(root, mixer, clipFor, 'avatar',
    () => { mixer.uncacheRoot(vrm.scene); VRMUtils.deepDispose(vrm.scene); },
    (dt) => { blink(dt); vrm.update(dt); });
}
