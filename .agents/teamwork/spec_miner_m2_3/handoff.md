# Specification Miner M2-3 Handoff Report: Milestone 2 Integration & Edge Cases Specification

**Worker**: Spec Miner M2-3 (M2 Integration & Edge Cases Spec Miner)  
**Conversation ID**: `ed3f3729-31de-4b26-aac2-27a58a1fb2c4`  
**Parent ID**: `d80f9389-97b3-4a4a-bee5-43759932ed36`  
**Working Directory**: `C:\Users\neera\koistory\.agents\teamwork\spec_miner_m2_3\`  
**Target Milestone**: Milestone 2 (F7 Sakura Petals & F8 Mouse Parallax Integration)  
**Date**: 2026-10-28T21:25:00Z  

---

## 1. Observation

### 1.1 Source Documents & Codebase Audit
1. **`ORIGINAL_REQUEST.md`**:
   - Line 23–26: "R2. Sakura Petal Particle Physics & Mouse Parallax: Implement an instanced 3D particle system for falling cherry blossom petals: continuous falling motion with gentle wind drift, flutter, and rotational turbulence; responsive, dampened mouse/pointer parallax that tilts and shifts the camera/view perspective smoothly as the user moves their cursor."
   - Line 50–51: "Sakura particle system renders at least 200 instanced petals with continuous animated position and rotation updates. Moving the mouse across the viewport produces a smooth perspective tilt on the 3D scene."
   - Line 60: "Layout is responsive across both desktop (1920x1080) and mobile (390x844) viewport dimensions."

2. **`PROJECT.md`**:
   - Lines 8–9: "`CameraController`: Unified camera rig reconciling dampened mouse parallax with GSAP ScrollTrigger camera dive. `SakuraPetals`: High-performance instanced 3D particle mesh (`THREE.InstancedMesh`, 350 petals) running custom aerodynamic physics."
   - Lines 31–32: "F7: Instanced 3D particle system (350 petals) with continuous aerodynamic flutter, wind drift, and boundary recycling. F8: Smooth dampened pointer parallax tilting camera and shifting perspective in real time."
   - Lines 60–75: Interface contracts for `CameraTrajectoryState` and `MouseParallaxState`.
   - Lines 98–102: Camera controller reconciles `cameraTrajectoryRef.current` with dampened mouse parallax offset.

3. **`CoupleSilhouette.tsx`**:
   - Lines 7–10: `position = [0.0, 1.15, 0.08], scale = 1.0`.
   - Lines 185–192:
     ```tsx
     <meshBasicMaterial
       map={texture}
       transparent={true}
       alphaTest={0.05}
       depthWrite={true}
       side={THREE.DoubleSide}
     />
     ```
   - Billboard plane is located at $z = 0.08\text{m}$ (8cm in front of railing parapet at $z = 0.0\text{m}$).

4. **`RooftopRailing.tsx`**:
   - Lines 43–122: Floor slab at $y = -0.2\text{m}$, front parapet wall at $z = 0.0\text{m}$ ($y \in [0, 0.35]\text{m}$), stanchion posts reaching $y = 1.30\text{m}$ at $z = 0.0\text{m}$, top handrail cylinder at $y = 1.30\text{m}$, $z = 0.0\text{m}$.
   - All materials are opaque `MeshStandardMaterial` with `roughness` and `metalness`.

5. **`Scene1Hero.tsx`**:
   - Lines 13–41: Mounts `AnimeSkyDome`, `SceneLighting`, `AnimeMoon`, `DistantSkyline`, `RooftopRailing`, `CoupleSilhouette`, `SakuraTrees`, and exposes `{children}` as an extension point at line 38.

6. **`RooftopCanvasInner.tsx`**:
   - Lines 8–14: `DefaultCameraRig` sets `camera.lookAt(0, 1.9, 0)` in a one-time `useEffect`.
   - Lines 31–47: `<Canvas>` configured with `camera={{ fov: 46, near: 0.1, far: 1000, position: [0, 2.4, 9.0] }}`, `dpr={[1, 2]}`, `depth: true`, `stencil: false`.

7. **Test Suite Execution (`node tests/e2e/runner.mjs`)**:
   - Command output:
     ```
     Tier 1 (Feature Coverage):     85/85 passed
     Tier 2 (Boundary & Corner):    85/85 passed
     Tier 3 (Cross-Combinations):   12/12 passed
     Tier 4 (Real-World Scenarios): 5/5 passed
     GRAND TOTAL:                   187/187 passed (0 failed) in 23.18s
     ```

---

## 2. Logic Chain

### 2.1 Component Tree Integration (`Scene1Hero.tsx` + `SakuraPetals.tsx` + `CameraController.tsx`)
1. **Scene Hierarchy**:
   `Scene1Hero` is the designated container for all Milestone 1 and Milestone 2 visual and interactive 3D components.
   Currently, `Scene1Hero` renders Milestone 1 components and renders `{children}` at the end.
   To cleanly integrate Milestone 2:
   - `SakuraPetals` is an instanced 3D visual element that must reside inside the 3D scene graph of `Scene1Hero`.
   - `CameraController` is a non-rendering controller component that invokes `useThree()` and `useFrame()` to manipulate `camera.position` and `camera.lookAt()`. It can reside inside `Scene1Hero` or be passed as a child.
   - Recommended architecture: `Scene1Hero` natively mounts `<SakuraPetals />` and `<CameraController />` with optional props and toggle flags:
     ```tsx
     export function Scene1Hero({
       children,
       showPetals = true,
       petalsProps,
       showCameraController = true,
       cameraControllerProps,
     }: Scene1HeroProps) { ... }
     ```
2. **Reconciliation with `DefaultCameraRig`**:
   `DefaultCameraRig` in `RooftopCanvasInner.tsx` only calls `camera.lookAt(0, 1.9, 0)` on mount (`useEffect`). When `CameraController` mounts, its `useFrame` hook continuously takes control of `camera.position` and `camera.lookAt`, perfectly superseding `DefaultCameraRig` without any race condition.
3. **Decoupled Scroll Integration (M2 vs M3)**:
   In Milestone 2, GSAP `ScrollController` is not yet active.
   `CameraController` must define a fallback base state:
   - When `trajectoryRef` is undefined or null, `CameraController` uses the default hero vantage:
     `basePos = [0, 2.4, 9.0]`, `baseLookAt = [0, 1.9, 0]`, `scrollProgress = 0.0`.
   - It computes the dampened mouse parallax offset and applies it directly.
   - In Milestone 3, when `trajectoryRef` is passed, `CameraController` seamlessly interpolates between the GSAP spline path and attenuated mouse parallax.

### 2.2 Depth Sorting & Alpha Test Dynamics (`alphaTest: 0.05` + `depthWrite: true`)
1. **The Core Transparency Challenge in Three.js**:
   Standard transparent blending (`transparent: true, depthWrite: false`) sorts meshes back-to-front by their origin position. However:
   - An `InstancedMesh` with 350 particles has a single bounding box and origin (`[0,0,0]`). Individual instances are NOT sorted by the CPU on each frame for performance reasons.
   - If `depthWrite: false` was used on petals, particles rendered earlier in the instance buffer would be overwritten by particles rendered later, causing unnatural overlapping flicker.
   - If transparent petals overlap the `CoupleSilhouette` (at $z = 0.08\text{m}$) with `depthWrite: false`, visual ordering would be non-deterministic depending on whether the silhouette or the particle system was drawn first.
2. **The `alphaTest: 0.05` + `depthWrite: true` Solution**:
   - `CoupleSilhouette.tsx` already uses `transparent: true`, `alphaTest: 0.05`, `depthWrite: true`.
   - In WebGL/Three.js fragment shaders, `alphaTest: 0.05` injects `if (diffuseColor.a < 0.05) discard;`.
   - When a fragment is discarded:
     - No depth buffer value is written (`gl_FragDepth` is skipped).
     - No color buffer value is written.
     - Transparent margins of the billboard plane are 100% physically transparent to the depth buffer.
   - When alpha $\ge 0.05$:
     - The pixel is treated as a solid surface by the depth buffer (`depthWrite: true`).
     - It writes to the $Z$-buffer.
3. **Interactions with Scene Meshes**:
   - **Against `CoupleSilhouette` ($z = 0.08\text{m}$)**:
     - Petals behind the couple ($z < 0.08\text{m}$): When a petal passes behind the couple's body, the silhouette has already written its depth value at $z = 0.08\text{m}$. The petal fragment at $z < 0.08\text{m}$ fails the depth test (`gl.depthFunc(gl.LEQUAL)`) and is occluded by the couple's body. Through the discarded air around the couple, the petal passes the depth test and renders.
     - Petals in front of the couple ($z > 0.08\text{m}$): The petal has a closer depth value, passes the depth test, and renders seamlessly in front of the couple.
     - Because `alphaTest: 0.05` discards transparent pixels on both the petal and the silhouette, there are zero rectangular bounding box clipping artifacts or black halo fringes!
   - **Against `RooftopRailing` ($z = 0.0\text{m}$, $y \in [0, 1.30]\text{m}$)**:
     - The railing is opaque (`depthWrite: true`).
     - Petals falling over Tokyo outside the railing ($z < 0.0\text{m}$) are cleanly occluded behind the metal posts and balusters.
     - Petals drifting onto the roof deck ($z > 0.0\text{m}$) float naturally in front of the railing.

### 2.3 Viewport Edge Cases & Adaptations
1. **Mobile Portrait (390x844)**:
   - Aspect ratio is $390 / 844 \approx 0.462$.
   - Three.js `PerspectiveCamera` uses vertical FOV ($46^\circ$). Visible vertical height at $z = 0$ is $H \approx 7.57\text{m}$.
   - Visible width at $z = 0$ narrows from $13.45\text{m}$ (desktop 16:9) to $3.50\text{m}$ (mobile).
   - The couple silhouette is $2.4\text{m}$ wide ($68\%$ of mobile screen width), providing an intimate, focused close-up framing.
   - Test `C3` specifies particle bounds scaling: `spawnWidth = Math.max(12.0, visibleWidthAtZ * 1.2)`. Even though visible width is only $\sim 3.5\text{m}$, clamping to $12.0\text{m}$ ensures that as the camera tilts with touch parallax, petals continuously fill the entire visible frustum without artificial lateral gaps.
2. **Ultra-Wide Displays (3440x1440 and 32:9)**:
   - Aspect ratio is $2.388$ (21:9) or $3.555$ (32:9).
   - Horizontal visible width at depth 15 exceeds $32\text{m}$.
   - The particle spawn volume must span at least $X \in [-18, +18]\text{m}$ to ensure continuous falling petals across the entire panoramic skyline.
   - Mouse parallax: Normalized pointer mapping `(clientX / width) * 2 - 1` automatically maps the widest screens to $[-1, 1]$. Maximum translational camera shift is clamped to $X = \pm 0.8\text{m}$ and $Y = \pm 0.5\text{m}$ (`F8.3`, `F8.B1`), preventing disorienting camera drift on multi-monitor or ultra-wide setups.
3. **Window Resize & Zero-Dimension Guards**:
   - On rapid browser resize or device rotation (portrait $\leftrightarrow$ landscape):
     - Normalized pointer calculation must guard against zero dimensions (`w <= 0 || h <= 0` during iframe load or minimization, per test `F8.B3`), returning safe fallback `(0.0, 0.0)`.
     - Event listeners must query current window dimensions dynamically rather than caching stale sizes.
4. **Tab Backgrounding & Delta Time Clamping**:
   - When a tab is backgrounded, `requestAnimationFrame` pauses. Upon resuming, $\Delta t$ can exceed 5–10 seconds.
   - Unclamped $\Delta t$ would cause petals to advance by $10\text{s} \times 1.2\text{m/s} = 12\text{m}$ in a single frame, causing all 350 particles to instantly teleport past the bottom boundary and trigger simultaneous mass respawning.
   - Test `F7.B1` requires delta clamping: `dt = Math.min(0.1, Math.max(0.001, delta))`.
   - This caps frame progression to $100\text{ms}$ maximum, guaranteeing smooth resumption without particle teleportation, while capping minimum to $1\text{ms}$ (`F7.B2`) to prevent numerical instability or division by zero.

### 2.4 Performance Budget & Zero GC Allocations
1. **60 FPS Budget with 350 Particles**:
   - 350 particles $\times$ 60 frames/sec = 21,000 particle updates/second.
   - An `InstancedMesh` with 350 instances executes in **exactly 1 draw call** (test `Scenario 2`, line 115: `drawCalls: 1`).
   - The instance matrix buffer consists of $350 \times 16 = 5,600$ 32-bit floats (`Float32Array`) (`F7.B5`).
2. **Zero GC Allocations per Frame**:
   - Creating `new THREE.Vector3()` or `new THREE.Matrix4()` inside `useFrame` allocates thousands of short-lived objects per second, triggering frequent V8 Garbage Collection pauses (frame drops below 60 FPS).
   - Strict pattern:
     - All particle state stored in pre-allocated flat typed arrays (`positions: Float32Array(350 * 3)`, `rotations: Float32Array(350 * 3)`, `velocities: Float32Array(350 * 3)`, `flutterPhases: Float32Array(350)`).
     - Single scratch `THREE.Object3D` or `THREE.Matrix4` instantiated once on mount and reused for all 350 updates.
     - Single `instanceMatrix.needsUpdate = true` flag set at the end of `useFrame`.
3. **Lifecycle & Clean Unmount Cleanup**:
   - In `SakuraPetals`: `geometry.dispose()`, `material.dispose()`.
   - In `CameraController` / `useMouseParallax`: `window.removeEventListener('pointermove', ...)` and `window.removeEventListener('resize', ...)`.
   - Ensures zero memory leaks, zero detached WebGL buffers, and strict compliance with `F17.B4`.

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Particle Physics | Aerodynamic Falling Petals | 350 instanced 3D sakura petals falling with gravity, terminal velocity, and aerodynamic drag | `delta` ($0.001$ to $0.1$s), `terminalV` ($1.2\text{m/s}$) | Updated petal $Y$ position | Clamps $\Delta t$ to $0.1$s max on tab resume (`F7.B1`) | `F7.1`, `F7.3`, `F7.B1` |
| 2 | Particle Physics | Harmonic Flutter Oscillation | Sinusoidal pitch/roll flutter and vertical oscillation simulating air resistance | $t$ (time), $\omega$ ($3.5\text{rad/s}$), $\phi$ (phase) | Rotational matrix, $Y$ offset ($\pm 0.02\text{m}$) | Bounded harmonic limits; no divergence | `F7.2`, `F7.3` |
| 3 | Particle Physics | Wind Drift & Turbulence | Horizontal drift with vertical shear and cosine turbulence vector | $y$ (elevation), $t$ (time), `baseWind` ($0.45\text{m/s}$), `turb` ($0.25\text{m/s}$) | Updated petal $X, Z$ positions | Clamped gust containment envelope $< 0.5\text{m/frame}$ | `F7.4`, `F7.B3` |
| 4 | Particle Lifecycle | Spatial Boundary Recycling | Deterministic recycling when petals fall below $y_{\text{min}} = -20.0\text{m}$ or drift past $x_{\text{max}}$ | Petal $XYZ$, bounds ($y \in [-20, 12]$, $x \in [-18, 18]$, $z \in [-6, 6]$) | Respawned petal at $y_{\text{max}} = 12.0\text{m}$ with randomized $X, Z$ | Preserves exact 350 active particle count | `F7.5`, `Scenario 4` |
| 5 | Particle Rendering | 3D Curved Double-Sided Mesh | Curved petal geometry with concave aerodynamic curvature and double-sided rendering | Width: $0.12\text{m}$, Length: $0.22\text{m}$, Curvature $Z$: $0.035\text{m}$ | `THREE.BufferGeometry`, `DoubleSide` | Rejects non-positive or flat geometry | `F7.2` |
| 6 | Particle Rendering | Instanced Single Draw Call | `THREE.InstancedMesh` with 350 instances and 5,600-float matrix buffer | 350 transformation matrices ($4 \times 4$ floats) | Single GPU draw call for all petals | Clamps instance count to $[50, 1000]$ (`F7.B4`) | `F7.1`, `F7.B5`, `Scenario 2` |
| 7 | Camera Rig | Normalized Pointer Mapping | Maps mouse/pointer viewport coordinates to $[-1.0, 1.0]$ with center at $(0, 0)$ | `clientX`, `clientY`, `innerWidth`, `innerHeight` | `normalizedX`, `normalizedY` | Returns $(0, 0)$ if $W \le 0$ or $H \le 0$ (`F8.B3`) | `F8.1`, `F8.B3` |
| 8 | Camera Rig | Exponential Damping Smoothing | Smooth pointer lag using `MathUtils.damp` ($1 - e^{-\lambda \Delta t}$) | Current offset, target offset, $\lambda = 4.0$, $\Delta t$ | Damped offset values | Stable at 60Hz, 120Hz, and 240Hz (`F8.B4`) | `F8.2`, `F8.B4` |
| 9 | Camera Rig | Translational Shift Bounds | Maximum translational camera offset clamped to $\pm 0.8\text{m}$ ($X$) and $\pm 0.5\text{m}$ ($Y$) | Normalized coords $[-1, 1]$ | Camera position offset $\Delta X, \Delta Y$ | Strictly clamped to $\pm 0.8, \pm 0.5$ (`F8.3`, `F8.B1`) | `F8.3`, `F8.B1` |
| 10 | Camera Rig | Parallax LookAt Tracking | Subtle target offset at $30\%$ rate of camera shift for natural anime depth | Base LookAt `[0, 1.9, 0]`, offset $\times 0.3$ | Composite camera `target` | LookAt follows smoothly without jitter | `F8.5` |
| 11 | Camera Rig | Scroll Plunge Attenuation | Parallax strength smoothly attenuates from $100\%$ at hero down to $20\%$ in Scene 2 | Scroll progress $p \in [0.0, 1.0]$ | Parallax weight factor $\in [0.2, 1.0]$ | Clamped to $0.2$ for overscroll $p > 1.0$ (`F8.B5`) | `F8.4`, `F8.B5`, `C1` |
| 12 | Depth Sorting | Alpha-Tested Depth Writing | Seamless transparency without sorting artifacts via `alphaTest: 0.05` and `depthWrite: true` | Alpha channel from texture / shader | Depth buffer write for $\alpha \ge 0.05$; discard for $\alpha < 0.05$ | Eliminates transparent quad cutout artifacts | `CoupleSilhouette.tsx`, `PROJECT.md` |
| 13 | Responsive | Frustum-Scaled Particle Volume | Dynamic particle spawn volume expansion covering wide/portrait frustums | Viewport aspect ratio, vertical FOV ($46^\circ$) | `spawnWidth = Math.max(12.0, visibleWidth * 1.2)` | Always encloses visible screen area | `C3`, `Scenario 2` |
| 14 | Architecture | Scene1Hero Extension Mount | Integration of `SakuraPetals` and `CameraController` as standard children/props in `Scene1Hero` | `Scene1HeroProps`, `SakuraPetalsProps`, `CameraControllerProps` | Unified 3D hero scene graph | Graceful fallback when props are omitted | `Scene1Hero.tsx`, `PROJECT.md` |

---

## 4. Edge Cases Discovered & Probed

| # | Feature | Input / Condition | Observed & Required Behavior |
|---|---------|-------------------|-----------------------------|
| 1 | `SakuraPetals` | Tab backgrounding / sleep ($\Delta t = 5.0\text{s}$ to $10.0\text{s}$) | Delta time is clamped to $\min(0.1, \max(0.001, \Delta t)) = 0.1\text{s}$ ($100\text{ms}$). Particles do NOT teleport through the floor or mass respawn (`F7.B1`). |
| 2 | `SakuraPetals` | Sub-millisecond delta time ($\Delta t \to 0$, e.g. $0.0001\text{s}$) | Delta time is clamped to $0.001\text{s}$ ($1\text{ms}$), maintaining stable finite position updates without division-by-zero or numerical underflow (`F7.B2`). |
| 3 | `SakuraPetals` | Extreme wind gust impulse ($v_{\text{wind}} + v_{\text{gust}} = 2.95\text{m/s}$) | Single-frame displacement remains bounded below $0.5\text{m/frame}$ at 60 FPS ($0.047\text{m}$), staying safely within the scene envelope (`F7.B3`). |
| 4 | `SakuraPetals` | Instance count boundary scaling ($N = 10$ or $N = 5000$) | Clamped to safe range $[50, 1000]$ instances (`F7.B4`), defaulting to 350 instances ($5,600$ float matrix buffer). |
| 5 | `SakuraPetals` | Petal crossing `CoupleSilhouette` plane ($z = 0.08\text{m}$) | With `alphaTest: 0.05` and `depthWrite: true` on both meshes: petals with $z < 0.08$ are occluded by couple body; petals with $z > 0.08$ render in front; air around couple discards depth, allowing background petals to show through cleanly without box artifacts. |
| 6 | `SakuraPetals` | Petal crossing `RooftopRailing` plane ($z = 0.0\text{m}$) | Opaque railing posts at $z = 0.0$ occlude falling petals behind railing ($z < 0$); petals in front ($z > 0$) render over railing naturally. |
| 7 | `CameraController` | Pointer outside viewport window (e.g. `normX = 2.5`, `normY = -3.2`) | Clamped strictly to $[-1.0, 1.0]$. Maximum camera shift never exceeds $\pm 0.8\text{m}$ ($X$) and $\pm 0.5\text{m}$ ($Y$) (`F8.B1`). |
| 8 | `CameraController` | High-speed mouse flick acceleration ($v_x = 25.0$) | Damped smoothly via `MathUtils.damp(cur, tgt, 4.0, dt)`; prevents instantaneous camera snapping or dizzying disorientation (`F8.B2`). |
| 9 | `CameraController` | Zero viewport dimensions on load/iframe ($w = 0, h = 0$) | Guard clause returns `{ normalizedX: 0.0, normalizedY: 0.0 }`, preventing `NaN` propagation into camera matrices (`F8.B3`). |
| 10 | `CameraController` | High refresh rate display (240Hz gaming monitors, $\Delta t \approx 4.16\text{ms}$) | Damping equation converges smoothly across 240 frames without oscillation or overshoot (`F8.B4`). |
| 11 | `CameraController` | Deep scroll / overscroll ($p = 2.5$) | Parallax weight is clamped to $0.2$ for all $p \ge 0.6$, keeping minimal $20\%$ residual parallax stable while reading narrative cards (`F8.B5`, `C1`). |
| 12 | `CameraController` | Standalone M2 execution without `ScrollController` | When `trajectoryRef` is omitted, defaults to base hero coordinates `[0, 2.4, 9.0]` and `lookAt: [0, 1.9, 0]` with $100\%$ parallax responsiveness. |
| 13 | Mobile (390x844) | Narrow portrait viewport (aspect $0.462$) | Vertical FOV ($46^\circ$) preserved; horizontal view narrows to $3.5\text{m}$; couple silhouette fills $68\%$ width; particle spawn volume clamped to $\ge 12\text{m}$ to cover screen during tilts (`C3`, `Scenario 2`). |
| 14 | Ultrawide (3440x1440) | Panoramic 21:9 / 32:9 viewport (aspect $2.388$) | Particle spawn width expands to cover visible frustum ($> 30\text{m}$); pointer normalization to $[-1, 1]$ bounds maximum camera parallax shift to $\pm 0.8\text{m}$, preventing scene edge exposure. |
| 15 | Lifecycle / Unmount | Fast page navigation or component unmount | Cleanly disposes geometry, materials, and textures; removes `pointermove` and `resize` event listeners; releases WebGL buffers with zero memory leaks (`F17.B4`). |

---

## 5. Architectural Specifications & Interface Contracts

### 5.1 Updated `src/types/scene.ts` Contracts
```ts
// Camera Controller Props Contract
export interface CameraControllerProps {
  enabled?: boolean;
  mouseParallax?: boolean;
  maxShiftX?: number; // default: 0.8
  maxShiftY?: number; // default: 0.5
  dampingFactor?: number; // default: 4.0
  lookAtFactor?: number; // default: 0.3
  basePosition?: [number, number, number]; // default: [0, 2.4, 9.0]
  baseLookAt?: [number, number, number]; // default: [0, 1.9, 0]
  trajectoryRef?: React.MutableRefObject<CameraTrajectoryState>;
}

// Sakura Petals Props Contract
export interface SakuraPetalsProps {
  count?: number; // default: 350 (boundary: 50 to 1000)
  terminalVelocity?: number; // default: 1.2 m/s
  baseWind?: number; // default: 0.45 m/s
  turbStrength?: number; // default: 0.25 m/s
  yMin?: number; // default: -20.0 m
  yMax?: number; // default: 12.0 m
  spawnBounds?: {
    xMin: number;
    xMax: number;
    zMin: number;
    zMax: number;
  };
  color?: string; // default: "#ffb7c5"
  petalScale?: number; // default: 1.0
  enableWindGusts?: boolean;
}

// Hook Options & Return Contract
export interface UseMouseParallaxOptions {
  damping?: number;
  maxShiftX?: number;
  maxShiftY?: number;
}

export interface UseMouseParallaxReturn {
  normalizedX: number; // -1.0 to 1.0
  normalizedY: number; // -1.0 to 1.0
  shiftX: number;
  shiftY: number;
}

// Updated Scene1Hero Props Contract
export interface Scene1HeroProps {
  children?: React.ReactNode;
  showPetals?: boolean;
  petalsProps?: SakuraPetalsProps;
  showCameraController?: boolean;
  cameraControllerProps?: CameraControllerProps;
}
```

### 5.2 Mathematical Specifications for M2 Workers
1. **Delta Time Clamping**:
   $$\Delta t_{\text{clamped}} = \min(0.1, \max(0.001, \Delta t))$$
2. **Damped Mouse Parallax (Exponential Smoothing)**:
   $$\text{offset}_{t+\Delta t} = \text{offset}_t + (\text{target} - \text{offset}_t) \times (1 - e^{-\lambda \Delta t_{\text{clamped}}})$$
   Where $\lambda = 4.0$.
3. **Parallax Scroll Attenuation**:
   $$w_{\text{parallax}}(p) = 1.0 - \min\left(0.8, \max\left(0.0, \frac{\text{clamp}(p, 0.0, 1.0) - 0.2}{0.4}\right) \times 0.8\right)$$
4. **Petal Kinematics & Aerodynamic Flutter**:
   $$y_{t+\Delta t} = y_t - v_{\text{term}} \Delta t_{\text{clamped}} + \sin(t \times \omega_{\text{flutter}} + \phi) \times 0.02 \times \Delta t_{\text{clamped}}$$
   $$x_{t+\Delta t} = x_t + \left(v_{\text{wind}} + v_{\text{turb}} \cos(y \times 0.5 + t \times 1.2)\right) \Delta t_{\text{clamped}}$$
   $$z_{t+\Delta t} = z_t + \sin(t \times 0.8 + \phi) \times 0.15 \times \Delta t_{\text{clamped}}$$
   $$\theta_{\text{roll}} = \sin(t \times \omega_{\text{flutter}} + \phi) \times 0.45$$
   $$\theta_{\text{pitch}} = \theta_{\text{pitch}} + \omega_{\text{rotX}} \Delta t_{\text{clamped}} + \cos(t \times 2.0 + \phi) \times 0.03$$
   $$\theta_{\text{yaw}} = \theta_{\text{yaw}} + \omega_{\text{rotY}} \Delta t_{\text{clamped}}$$

---

## 6. Caveats
- **GSAP ScrollTrigger Dependency**: In Milestone 2, the camera controller operates in Hero mode (scroll progress = 0.0) or reads an optional ref. GSAP ScrollTrigger timeline binding occurs in Milestone 3.
- **Mobile Touch Parallax**: On touch devices without active cursor hovering, pointer position remains at $(0, 0)$ (or tracks subtle touch dragging), which avoids disorienting tilts.

---

## 7. Conclusion
1. **Integration**: `SakuraPetals` and `CameraController` must be integrated into `Scene1Hero.tsx` with clean fallback props, allowing seamless operation both standalone and in future scroll-scrubbed milestones.
2. **Depth Sorting**: Using `alphaTest: 0.05` and `depthWrite: true` on `SakuraPetals` matches `CoupleSilhouette.tsx` exactly, completely solving WebGL instanced transparency ordering and preventing rectangular clipping artifacts against both the couple and the rooftop railing.
3. **Viewport Adaptation**: Delta time clamping ($[0.001, 0.1]$s), zero-dimension guards, normalized pointer clamping ($[-1, 1]$), and dynamic frustum spawn scaling provide rock-solid stability across mobile (390x844), ultrawide (3440x1440), and tab switching.
4. **Performance**: Single-draw-call `THREE.InstancedMesh(350)` combined with flat typed arrays and reusable scratch math objects guarantees zero GC allocations per frame and constant 60 FPS performance.

---

## 8. Verification Method

To verify the specifications and implementation:
1. **Run Full E2E Test Suite**:
   ```bash
   node tests/e2e/runner.mjs
   ```
   *Expected*: All 187 tests pass across Tiers 1 through 4.
2. **Verify Static Typecheck**:
   ```bash
   npx tsc --noEmit
   ```
   *Expected*: Zero TypeScript errors.
3. **Verify Next.js Production Build**:
   ```bash
   npm run build
   ```
   *Expected*: Exit code 0, static pages generated cleanly.
4. **Verify ESLint**:
   ```bash
   npm run lint
   ```
   *Expected*: Exit code 0, 0 errors, 0 warnings.
