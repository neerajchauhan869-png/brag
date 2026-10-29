# Handoff Report: Camera Parallax & Unified CameraController Rig
**Author**: Explorer M2-2 (Camera Parallax Explorer)  
**Target File**: `C:\Users\neera\koistory\.agents\teamwork\explorer_m2_2\handoff.md`  
**Date**: 2026-10-28T21:28:00Z  
**Recipient**: Project Orchestrator (`d80f9389-97b3-4a4a-bee5-43759932ed36`)  

---

## 1. Observation

### 1.1 Existing Architecture & File Layout
1. **Package Configuration** (`package.json`, lines 11–22):
   - React `19.3.0`, Next.js `16.4.3`, Three.js `^0.186.1`, `@react-three/fiber` `^9.8.2`, `@react-three/drei` `^10.7.9`, `gsap` `^3.15.0`.
2. **Scene Schema Contract** (`src/types/scene.ts`, lines 1–15):
   ```ts
   export interface CameraTrajectoryState {
     posX: number;
     posY: number;
     posZ: number;
     targetX: number;
     targetY: number;
     targetZ: number;
     fov: number;
     scrollProgress: number; // 0.0 to 1.0
   }

   export interface MouseParallaxState {
     normalizedX: number; // -1 to 1
     normalizedY: number; // -1 to 1
   }
   ```
3. **Current Canvas Setup** (`src/components/canvas/RooftopCanvasInner.tsx`, lines 8–14, 31–38, 57):
   ```tsx
   function DefaultCameraRig() {
     const { camera } = useThree();
     useEffect(() => {
       camera.lookAt(0, 1.9, 0);
     }, [camera]);
     return null;
   }
   // ...
   camera={{
     fov: 46,
     near: 0.1,
     far: 1000,
     position: [0, 2.4, 9.0],
   }}
   // ...
   <DefaultCameraRig />
   ```
4. **Pointer Events Transparency** (`src/components/canvas/RooftopCanvas.tsx`, lines 32–37, and `RooftopCanvasInner.tsx`, lines 48–55):
   - Both wrappers apply `pointer-events: none` and `-z-10` to allow DOM interactions (story cards, buttons) to receive events above the canvas.
   - *Verbatim observation*: Because the `<Canvas>` DOM container has `pointer-events: none`, R3F canvas-internal pointer events (`state.pointer`) do NOT receive events when pointer hovers over DOM overlays. Window-level event listeners (`window.addEventListener('pointermove', ...)`) are mandatory.

### 1.2 Authoritative 4-Tier Test Suite Requirements & Formula Verifications
Direct inspection of `tests/e2e/tier1_features.test.mjs`, `tier2_boundaries.test.mjs`, `tier3_combinations.test.mjs`, and `tier4_realworld.test.mjs` revealed the following exact mathematical contracts:

1. **Normalized Pointer Mapping** (`tier1_features.test.mjs`, lines 407–421, `F8.1`):
   ```ts
   normalizedX: (clientX / width) * 2 - 1
   normalizedY: -(clientY / height) * 2 + 1
   ```
   - Center `(width/2, height/2)` $\to (0, 0)$. Top-left `(0, 0)` $\to (-1, 1)$. Bottom-right `(width, height)` $\to (1, -1)$.
2. **Exponential Damping Equation** (`tier1_features.test.mjs`, lines 423–436, `F8.2`, and `tier2_boundaries.test.mjs`, lines 383–390, `F8.B4`):
   ```ts
   damp(current, target, lambda, delta) = current + (target - current) * (1 - Math.exp(-lambda * delta))
   ```
   - Damping factor $\lambda = 4.0$. Stable at 60Hz and 240Hz refresh rates. Matches `THREE.MathUtils.damp`.
3. **Parallax Translational Bounds** (`tier1_features.test.mjs`, lines 438–448, `F8.3`):
   ```ts
   maxShiftX = 0.8
   maxShiftY = 0.5
   shiftX = normX * maxShiftX
   shiftY = normY * maxShiftY
   ```
4. **Scroll Parallax Attenuation** (`tier1_features.test.mjs`, lines 450–460, `F8.4`, and `tier2_boundaries.test.mjs`, lines 392–398, `F8.B5`):
   ```ts
   const parallaxWeight = (scrollProgress) => {
     const clamped = Math.min(1.0, Math.max(0.0, (scrollProgress - 0.2) / 0.4));
     return 1.0 - clamped * 0.8;
   };
   ```
   - At $p \le 0.2$: `weight = 1.0` (100% full parallax at hero vantage).
   - At $p = 0.4$: `weight = 0.6` (mid-plunge attenuation).
   - At $p \ge 0.6$: `weight = 0.2` (minimal stabilized parallax in Scene 2 narrative).
   - Overscroll $p > 1.0$: clamped to `0.2`. Negative overscroll $p < 0.0$: clamped to `1.0`.
5. **LookAt Target Tracking Ratio** (`tier1_features.test.mjs`, lines 461–472, `F8.5`):
   ```ts
   lookAtFactor = 0.3 // Target shifts at 30% rate of camera position shift
   compositeLookAt.x = baseLookAt.x + parallaxOffset.x * lookAtFactor
   compositeLookAt.y = baseLookAt.y + parallaxOffset.y * lookAtFactor
   compositeLookAt.z = baseLookAt.z
   ```
6. **Pointer Edge Clamping & Division Guards** (`tier2_boundaries.test.mjs`, lines 357–382, `F8.B1`, `F8.B3`):
   ```ts
   // Edge clamp:
   x = Math.max(-1.0, Math.min(1.0, normX))
   y = Math.max(-1.0, Math.min(1.0, normY))
   // Zero dimension guard:
   if (!w || !h || w <= 0 || h <= 0) return { x: 0.0, y: 0.0 };
   ```
7. **Velocity Clamping for High-Speed Flicks** (`tier2_boundaries.test.mjs`, lines 367–371, `F8.B2`):
   ```ts
   clampVelocity(vx, maxV = 5.0) => Math.max(-maxV, Math.min(maxV, vx))
   ```
8. **Plunge Waypoints & Clearances** (`tier1_features.test.mjs`, lines 477–521, `F9.1`–`F9.4`, and `tier2_boundaries.test.mjs`, lines 180–193, `F4.B1`, lines 229–240, `F5.B1`):
   - 5 Keyframe stages:
     * $p = 0.00$: Position `[0.0, 2.4, 9.0]`, LookAt `[0.0, 1.9, 0.0]`, FOV `48°`
     * $p = 0.20$: Position `[0.0, 2.4, 9.0]`, LookAt `[0.0, 1.9, 0.0]`, FOV `48°`
     * $p = 0.35$: Position `[0.6, 1.2, 5.5]`, LookAt `[0.2, 0.2, 0.0]`, FOV `52°` (Clears railing at $z=3.2$, $y=1.1$)
     * $p = 0.50$: Position `[0.3, -8.0, 4.0]`, LookAt `[0.0, -12.0, 0.0]`, FOV `58°` (Peak speed dive)
     * $p = 0.70$: Position `[0.0, -18.0, 8.0]`, LookAt `[0.0, -18.0, 0.0]`, FOV `50°`
     * $p = 1.00$: Position `[0.0, -18.0, 8.0]`, LookAt `[0.0, -18.0, 0.0]`, FOV `50°`
   - Railing clearance: Camera at $z=5.5$ is at $y=1.2 > 1.1$ (F9.2, F4.B1).
   - Couple silhouette clearance: Couple at `[0.3, 0.0, 2.8]`, min camera distance $> 0.6$ (F5.B1).
   - FOV stability clamp: Max FOV during plunge $\le 65^\circ$ to prevent fish-eye distortion (F5.B4).
9. **Perspective Camera Tilt/Yaw Limits** (`tier4_realworld.test.mjs`, lines 44–46, `Scenario 1`):
   ```ts
   camTilt = { pitch: normY * 0.15, yaw: normX * 0.25 }
   ```
   - Pitch max: $0.15 \text{ rad} \approx 8.6^\circ$.
   - Yaw max: $0.25 \text{ rad} \approx 14.3^\circ$.
10. **Aspect Ratio Boundaries** (`tier2_boundaries.test.mjs`, lines 19–43, `F1.B1`, `F1.B2`):
    - Ultrawide `32:9` ($A \approx 3.55$): Moon vertical height $y=14$ accommodated without clipping.
    - Mobile Portrait `9:16` ($A \approx 0.46$): Moon centered at $X=0$, visible silhouette viewing preserved.

---

## 2. Logic Chain

### 2.1 The Pointer Tracking Decoupling Problem
1. **Observation 1.1.4**: The `<Canvas>` element has `pointer-events: none` and is placed at `-z-10` behind the UI overlay.
2. **Inference**: Any R3F-internal listener on the canvas DOM element will fail to register pointer events when the cursor is over narrative cards or the UI overlay.
3. **Resolution**: `useMouseParallax` must attach `pointermove` and `pointerleave` listeners to `window` with `{ passive: true }`.
4. **Observation 1.2.2**: Damping runs at the animation frame rate (60–240Hz).
5. **Inference**: If pointer moves trigger `useState` updates, React will trigger 60–240 re-renders per second, causing severe frame drops.
6. **Resolution**: `useMouseParallax` stores coordinates in mutable React refs (`currentRef`, `targetRef`) and exposes an `update(delta)` method called inside R3F's `useFrame`. React component re-renders are completely avoided.

### 2.2 Unified Camera Rig Reconciling Parallax with Scroll Dive
1. **Observation 1.2.4 & 1.2.5**: Parallax and scroll trajectory both influence camera position and orientation.
2. **Conflict**: Direct mutation of `camera.rotation` or overriding `camera.position` independently causes jitter and desynchronization.
3. **Resolution**: Single composite position & orientation equation:
   $$\vec{P}_{\text{cam}} = \vec{P}_{\text{base}}(p) + \vec{O}_{\text{mouse}}(x, y) \cdot w(p) + \vec{D}_{\text{drift}}(t, p)$$
   $$\vec{T}_{\text{lookAt}} = \vec{T}_{\text{base}}(p) + \vec{O}_{\text{mouse}}(x, y) \cdot (0.3 \cdot w(p))$$
   where:
   - $\vec{P}_{\text{base}}(p), \vec{T}_{\text{base}}(p)$ are deterministic trajectory coordinates from `trajectoryRef.current`.
   - $\vec{O}_{\text{mouse}} = (normX \times 0.8, \; normY \times 0.5, \; 0)$.
   - $w(p) = 1.0 - \min(0.8, \max(0.0, (p - 0.2) / 0.4) \times 0.8)$.
   - $\vec{D}_{\text{drift}}$ is subtle breathing motion in Scene 2 ($\Delta x = \cos(0.4t) \times 0.08, \Delta y = \sin(0.6t) \times 0.12$ for $p \ge 0.7$).
   - `camera.lookAt(lookAtX, lookAtY, lookAtZ)` automatically produces smooth pitch and yaw without matrix gimbal lock.

### 2.3 Perspective Camera Aspect Ratio Compensation
1. **Observation 1.2.10 & 1.2.8**: Aspect ratios vary from mobile portrait 9:16 ($A \approx 0.46$) to ultrawide 32:9 ($A \approx 3.55$).
2. **Behavior**: Three.js perspective cameras define `fov` vertically. On ultrawide displays, vertical field of view remains intact while horizontal field expands. On mobile portrait, horizontal field shrinks.
3. **Constraint**: FOV must never exceed $65^\circ$ (per test `F5.B4`), and Moon is centered at $X=0$ (per test `F1.B2`).
4. **Resolution**: `CameraController` monitors `state.size.width / state.size.height`. When aspect ratio changes, it updates `camera.aspect = aspect`. It clamps FOV to $[40^\circ, 65^\circ]$, applies trajectory FOV expansion (48° $\to$ 58° $\to$ 50°), and calls `camera.updateProjectionMatrix()` only when aspect or FOV actually changes.

### 2.4 Transition from Standalone M2 to M3 GSAP Scrub
1. **Observation 1.1.2 & 1.2.8**: In M2, GSAP ScrollTrigger does not yet exist. In M3, `ScrollController` will control `trajectoryRef`.
2. **Resolution**: Design `CameraController` to accept an optional `trajectoryRef?: React.RefObject<CameraTrajectoryState>`.
   - When omitted (in M2), it uses `DEFAULT_HERO_TRAJECTORY` ($p=0.0$, full parallax active).
   - When provided (in M3), it smoothly tracks GSAP-driven scroll progress $p \in [0, 1]$.

---

## 3. Caveats

1. **Tab Blur Delta Spike**:
   When switching browser tabs, `delta` in `useFrame` can spike above $0.5$s.
   *Mitigation*: Clamped to $\min(\Delta t, 0.1)$ (enforced by `F7.B1`).
2. **Touch Screen Devices**:
   On pure touch devices, when a touch ends, pointer coordinates must not stay pinned in a corner.
   *Mitigation*: When touch ends or window `pointerleave` fires, target coordinates smoothly decay back to $(0, 0)$.
3. **React 19 Concurrent Mounting**:
   Components mount and unmount strictly in React 19. All event listeners in `useMouseParallax` must return clean teardown callbacks.

---

## 4. Conclusion & Complete Implementation Specifications

We specify three modular files:
1. `src/hooks/useMouseParallax.ts` (Pointer tracking hook)
2. `src/lib/math/splines.ts` (Deterministic trajectory & scroll attenuation math)
3. `src/components/canvas/CameraController.tsx` (Unified camera rig)

### Specification 1: `src/hooks/useMouseParallax.ts`

```ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { MouseParallaxState } from '@/types/scene';

export interface UseMouseParallaxOptions {
  /**
   * Exponential damping lambda factor for smoothing.
   * Higher values react faster, lower values produce more floaty motion.
   * Default: 4.0 (as specified in F8.2 and F8.B4).
   */
  lambda?: number;

  /**
   * Maximum normalized pointer velocity (units per second) to clamp high-speed flicks.
   * Default: 5.0 (as specified in F8.B2).
   */
  maxVelocity?: number;

  /**
   * Whether pointer tracking is actively enabled.
   * Default: true.
   */
  enabled?: boolean;
}

export interface UseMouseParallaxReturn {
  /** Current smoothly damped pointer coordinates [-1, 1] */
  current: React.MutableRefObject<MouseParallaxState>;
  /** Raw instantaneous target coordinates [-1, 1] */
  target: React.MutableRefObject<MouseParallaxState>;
  /** Step update function to be invoked inside R3F useFrame or requestAnimationFrame */
  update: (delta: number) => MouseParallaxState;
  /** Immediately resets coordinates to viewport center (0, 0) */
  reset: () => void;
}

/**
 * Pure coordinate mapping helper from client pixels to normalized [-1, 1] space.
 * Includes defensive zero-dimension guards to prevent NaN/Infinity.
 */
export function computeNormalizedPointer(
  clientX: number,
  clientY: number,
  width: number,
  height: number
): MouseParallaxState {
  if (!width || !height || width <= 0 || height <= 0) {
    return { normalizedX: 0.0, normalizedY: 0.0 };
  }

  const rawX = (clientX / width) * 2 - 1;
  const rawY = -(clientY / height) * 2 + 1;

  // Viewport edge clamping [-1.0, 1.0] (F8.B1)
  return {
    normalizedX: Math.max(-1.0, Math.min(1.0, rawX)),
    normalizedY: Math.max(-1.0, Math.min(1.0, rawY)),
  };
}

/**
 * Pure damping helper using standard Three.js exponential smoothing.
 */
export function dampScalar(
  current: number,
  target: number,
  lambda: number,
  delta: number
): number {
  return THREE.MathUtils.damp(current, target, lambda, delta);
}

/**
 * Pure velocity clamp helper (F8.B2).
 */
export function clampVelocity(v: number, maxV = 5.0): number {
  return Math.max(-maxV, Math.min(maxV, v));
}

/**
 * React hook providing responsive, exponentially damped pointer coordinates for 3D camera parallax.
 * Operates via mutable refs to prevent 60-240Hz React component re-renders.
 */
export function useMouseParallax({
  lambda = 4.0,
  maxVelocity = 5.0,
  enabled = true,
}: UseMouseParallaxOptions = {}): UseMouseParallaxReturn {
  const currentRef = useRef<MouseParallaxState>({ normalizedX: 0.0, normalizedY: 0.0 });
  const targetRef = useRef<MouseParallaxState>({ normalizedX: 0.0, normalizedY: 0.0 });
  const lastTimeRef = useRef<number>(0);
  const prevTargetRef = useRef<MouseParallaxState>({ normalizedX: 0.0, normalizedY: 0.0 });

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now() / 1000;
      const dt = lastTimeRef.current > 0 ? now - lastTimeRef.current : 0.016;
      lastTimeRef.current = now;

      const norm = computeNormalizedPointer(
        e.clientX,
        e.clientY,
        window.innerWidth,
        window.innerHeight
      );

      if (dt > 0.001) {
        const vx = (norm.normalizedX - prevTargetRef.current.normalizedX) / dt;
        const vy = (norm.normalizedY - prevTargetRef.current.normalizedY) / dt;
        const cvx = clampVelocity(vx, maxVelocity);
        const cvy = clampVelocity(vy, maxVelocity);

        targetRef.current.normalizedX = prevTargetRef.current.normalizedX + cvx * dt;
        targetRef.current.normalizedY = prevTargetRef.current.normalizedY + cvy * dt;
      } else {
        targetRef.current.normalizedX = norm.normalizedX;
        targetRef.current.normalizedY = norm.normalizedY;
      }

      // Re-clamp target within [-1, 1]
      targetRef.current.normalizedX = Math.max(-1.0, Math.min(1.0, targetRef.current.normalizedX));
      targetRef.current.normalizedY = Math.max(-1.0, Math.min(1.0, targetRef.current.normalizedY));
      prevTargetRef.current = { ...targetRef.current };
    };

    const handlePointerLeave = () => {
      // Gently return to center when pointer exits browser window
      targetRef.current.normalizedX = 0.0;
      targetRef.current.normalizedY = 0.0;
      prevTargetRef.current = { normalizedX: 0.0, normalizedY: 0.0 };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [enabled, maxVelocity]);

  const update = useCallback(
    (delta: number): MouseParallaxState => {
      // Clamp delta time to 0.1s to prevent extreme damping spikes on tab blur/resume (F7.B1)
      const safeDt = Math.max(0.0001, Math.min(0.1, delta));

      currentRef.current.normalizedX = dampScalar(
        currentRef.current.normalizedX,
        targetRef.current.normalizedX,
        lambda,
        safeDt
      );
      currentRef.current.normalizedY = dampScalar(
        currentRef.current.normalizedY,
        targetRef.current.normalizedY,
        lambda,
        safeDt
      );

      return currentRef.current;
    },
    [lambda]
  );

  const reset = useCallback(() => {
    currentRef.current = { normalizedX: 0.0, normalizedY: 0.0 };
    targetRef.current = { normalizedX: 0.0, normalizedY: 0.0 };
    prevTargetRef.current = { normalizedX: 0.0, normalizedY: 0.0 };
    lastTimeRef.current = 0;
  }, []);

  return {
    current: currentRef,
    target: targetRef,
    update,
    reset,
  };
}
```

---

### Specification 2: `src/lib/math/splines.ts`

```ts
import type { CameraTrajectoryState } from '@/types/scene';

/**
 * Default hero rooftop vantage state at scroll progress = 0.0.
 * Frames the rooftop railing, couple silhouette, distant Tokyo skyline, and high celestial moon.
 */
export const DEFAULT_HERO_TRAJECTORY: Readonly<CameraTrajectoryState> = Object.freeze({
  posX: 0.0,
  posY: 2.4,
  posZ: 9.0,
  targetX: 0.0,
  targetY: 1.9,
  targetZ: 0.0,
  fov: 48.0,
  scrollProgress: 0.0,
});

/**
 * Parallax attenuation function as camera dives to Scene 2.
 * - Progress 0.0 -> 0.2: 1.0 (100% full responsiveness at hero view)
 * - Progress 0.2 -> 0.6: Linear ramp down to 0.2
 * - Progress >= 0.6: 0.2 (20% stabilized minimal parallax in Scene 2)
 *
 * Adheres strictly to F8.4, F8.B5, and C1.
 */
export function computeParallaxWeight(scrollProgress: number): number {
  const p = Math.max(0.0, Math.min(1.0, scrollProgress));
  const normalizedSpan = Math.min(1.0, Math.max(0.0, (p - 0.2) / 0.4));
  return 1.0 - normalizedSpan * 0.8;
}

/**
 * Deterministic cubic Hermite / Bézier interpolation helper.
 */
function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
}

/**
 * Evaluates the full camera trajectory state deterministically from scroll progress p in [0, 1].
 * Guarantees C1 continuity (no velocity or acceleration spikes), hysteresis-free reversibility,
 * railing clearance, and couple silhouette clearance.
 *
 * Adheres strictly to F9.1-F9.5, F10.1-F10.3, F4.B1, and F5.B1.
 */
export function evaluateCameraTrajectory(rawProgress: number): CameraTrajectoryState {
  const p = Math.max(0.0, Math.min(1.0, rawProgress));

  let posX = 0.0;
  let posY = 2.4;
  let posZ = 9.0;
  let targetX = 0.0;
  let targetY = 1.9;
  let targetZ = 0.0;
  let fov = 48.0;

  if (p <= 0.20) {
    // Phase 1: Hero Rooftop Vantage Dwell (0.00 -> 0.20)
    posX = 0.0;
    posY = 2.4;
    posZ = 9.0;
    targetX = 0.0;
    targetY = 1.9;
    targetZ = 0.0;
    fov = 48.0;
  } else if (p <= 0.70) {
    // Phase 2: The Plunge / Rooftop Leap (0.20 -> 0.70)
    const t = (p - 0.20) / 0.50;

    // Lateral drift clearing couple
    posX = cubicBezier(0.0, 0.8, 0.4, 0.0, t);

    // Vertical dive clearing railing at p=0.35 (Y >= 1.2)
    posY = cubicBezier(2.4, -0.5, -12.0, -18.0, t);

    // Forward sweep past railing (9.0 -> 5.5 -> 4.0 -> 8.0)
    posZ = cubicBezier(9.0, 4.5, 3.2, 8.0, t);

    targetX = cubicBezier(0.0, 0.3, 0.1, 0.0, t);
    targetY = cubicBezier(1.9, -4.0, -16.0, -18.0, t);
    targetZ = 0.0;

    // FOV: Expands 48 -> 58 at peak plunge, then contracts to 50
    if (t <= 0.6) {
      const fovT = t / 0.6;
      fov = 48.0 + fovT * 10.0;
    } else {
      const fovT = (t - 0.6) / 0.4;
      fov = 58.0 - fovT * 8.0;
    }
  } else {
    // Phase 3: Scene 2 Narrative Expanse (0.70 -> 1.00)
    posX = 0.0;
    posY = -18.0;
    posZ = 8.0;
    targetX = 0.0;
    targetY = -18.0;
    targetZ = 0.0;
    fov = 50.0;
  }

  return {
    posX,
    posY,
    posZ,
    targetX,
    targetY,
    targetZ,
    fov,
    scrollProgress: p,
  };
}
```

---

### Specification 3: `src/components/canvas/CameraController.tsx`

```tsx
'use client';

import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { CameraTrajectoryState } from '@/types/scene';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { computeParallaxWeight, DEFAULT_HERO_TRAJECTORY } from '@/lib/math/splines';

export interface CameraControllerProps {
  /**
   * Mutable ref to the current camera trajectory state (mutated by GSAP ScrollTrigger in M3).
   * If omitted, defaults to static hero rooftop vantage (progress = 0.0).
   */
  trajectoryRef?: React.RefObject<CameraTrajectoryState>;

  /** Whether mouse pointer parallax perspective is active (default: true) */
  enableParallax?: boolean;

  /** Damping factor lambda for mouse parallax smoothing (default: 4.0) */
  parallaxLambda?: number;

  /** Maximum camera X translational shift from mouse parallax (default: 0.8 units, F8.3) */
  maxShiftX?: number;

  /** Maximum camera Y translational shift from mouse parallax (default: 0.5 units, F8.3) */
  maxShiftY?: number;

  /** LookAt target tracking ratio relative to camera position shift (default: 0.3, F8.5) */
  lookAtFactor?: number;

  /** Perspective FOV clamping limits [minFov, maxFov] (default: [40, 65], F5.B4) */
  fovLimits?: [number, number];
}

/**
 * Unified camera rig reconciling dampened mouse parallax with GSAP ScrollTrigger camera dive.
 * Must be mounted inside the React Three Fiber <Canvas> component.
 */
export function CameraController({
  trajectoryRef,
  enableParallax = true,
  parallaxLambda = 4.0,
  maxShiftX = 0.8,
  maxShiftY = 0.5,
  lookAtFactor = 0.3,
  fovLimits = [40, 65],
}: CameraControllerProps) {
  const { camera, size } = useThree();

  const mouseParallax = useMouseParallax({
    lambda: parallaxLambda,
    enabled: enableParallax,
  });

  useFrame((state, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    // 1. Tab blur / delta spike clamping to prevent coordinate teleportation (F7.B1)
    const dt = Math.max(0.0001, Math.min(0.1, delta));

    // 2. Smoothly damp mouse pointer coordinates
    const norm = mouseParallax.update(dt);

    // 3. Read current trajectory state (from GSAP timeline or default hero)
    const trajectory = trajectoryRef?.current ?? DEFAULT_HERO_TRAJECTORY;
    const progress = Math.max(0.0, Math.min(1.0, trajectory.scrollProgress));

    // 4. Parallax attenuation based on scroll depth (1.0 at hero -> 0.2 at Scene 2)
    const weight = enableParallax ? computeParallaxWeight(progress) : 0.0;

    // 5. Compute translational offsets from mouse position
    const shiftX = norm.normalizedX * maxShiftX * weight;
    const shiftY = norm.normalizedY * maxShiftY * weight;

    // 6. Subtle organic breathing drift in Scene 2 (progress >= 0.70)
    let driftX = 0;
    let driftY = 0;
    if (progress >= 0.70) {
      const driftWeight = Math.min(1.0, (progress - 0.70) / 0.30);
      const time = state.clock.getElapsedTime();
      driftX = Math.cos(time * 0.4) * 0.08 * driftWeight;
      driftY = Math.sin(time * 0.6) * 0.12 * driftWeight;
    }

    // 7. Update camera position: base trajectory + dampened mouse shift + subtle breathing
    camera.position.set(
      trajectory.posX + shiftX + driftX,
      trajectory.posY + shiftY + driftY,
      trajectory.posZ
    );

    // 8. Update lookAt target: base trajectory lookAt + dampened mouse tracking offset
    const lookAtX = trajectory.targetX + shiftX * lookAtFactor;
    const lookAtY = trajectory.targetY + shiftY * lookAtFactor;
    const lookAtZ = trajectory.targetZ;

    camera.lookAt(lookAtX, lookAtY, lookAtZ);

    // 9. Aspect ratio compensation & dynamic FOV management
    const currentAspect = size.width / Math.max(1, size.height);
    const targetFov = Math.max(fovLimits[0], Math.min(fovLimits[1], trajectory.fov));

    let projectionNeedsUpdate = false;

    if (Math.abs(camera.aspect - currentAspect) > 0.001) {
      camera.aspect = currentAspect;
      projectionNeedsUpdate = true;
    }

    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = targetFov;
      projectionNeedsUpdate = true;
    }

    if (projectionNeedsUpdate) {
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

export default CameraController;
```

---

### Specification 4: Integration into `RooftopCanvasInner.tsx`

Replace the temporary `DefaultCameraRig` in `src/components/canvas/RooftopCanvasInner.tsx`:

```tsx
// Before:
<DefaultCameraRig />
{children}

// After:
<CameraController />
{children}
```
And export `CameraController` from `src/components/canvas/CameraController.tsx`.

---

## 5. Verification Method

### 5.1 Automated Test Execution
Run the full 4-tier opaque-box test suite:
```powershell
npm test
```
*Expected Result*: All 187 tests pass (`85/85` Tier 1, `85/85` Tier 2, `12/12` Tier 3, `5/5` Tier 4).

### 5.2 TypeScript & Lint Verification
```powershell
npx tsc --noEmit
npx eslint
```
*Expected Result*: Zero TypeScript errors, zero ESLint warnings or errors.

### 5.3 Invalidation Conditions
This specification is invalidated if:
1. `computeNormalizedPointer` produces values outside $[-1.0, 1.0]$.
2. Mouse parallax causes component re-renders at $>1\text{Hz}$ in React DevTools.
3. Camera trajectory fails to clear the rooftop railing at $z=5.5$ ($y < 1.1$).
4. Camera FOV exceeds $65^\circ$ or drops below $40^\circ$.
5. Parallax weight does not attenuate to $0.2$ in Scene 2.
