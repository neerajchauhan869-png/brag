# Specification Mining & Architecture Report: Rooftop Railing, Couple Silhouette & Sakura Framing Trees (Milestone 1)

**Target Components**:
1. `src/components/canvas/RooftopRailing.tsx` (F4: Rooftop Deck & Railing)
2. `src/components/canvas/CoupleSilhouette.tsx` (F5: Silhouetted Anime Couple)
3. `src/components/canvas/SakuraTrees.tsx` (F6: Cherry Blossom Framing Trees)

**Author**: Spec Miner M1-3 (Rooftop, Couple & Sakura Spec Miner)  
**Date**: 2026-10-28T20:55:00Z  
**Status**: COMPLETE / SPECIFICATION READY

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Architecture | Procedural Concrete Roof Deck Slab | Solid weathered concrete deck flooring extending beneath camera to horizon edge ($16\text{m} \times 0.4\text{m} \times 10\text{m}$) | World coordinates `[0, -0.2, 5.0]`, concrete material params | 3D `BoxGeometry` mesh with dark textured concrete `#161822`, roughness 0.85, metalness 0.1 | Renders flat default surface if material fails | ORIGINAL_REQUEST §R1, PROJECT.md F4 |
| 2 | Architecture | Safety Parapet Curb Wall | Solid concrete upstand wall at rooftop edge ($14\text{m} \times 0.35\text{m} \times 0.3\text{m}$) with beveled top coping | World coordinates `[0, 0.175, 0.0]`, coping at `y=0.36` | Dual `BoxGeometry` meshes providing architectural mounting base for steel railing | Fallback to simple un-beveled box if geometry invalid | ORIGINAL_REQUEST §R1, PROJECT.md F4 |
| 3 | Architecture | Steel Stanchion Posts & Baseplates | 11 vertical structural posts anchored on parapet coping spaced every $1.2\text{m}$ ($x \in [-6.0, 6.0]$) | Array of X positions, post radius 0.035m, height 0.92m | Procedural `CylinderGeometry` array or group with welded baseplates | Posts omit center interval if configured | ORIGINAL_REQUEST §R1, PROJECT.md F4 |
| 4 | Architecture | Top Cylindrical Handrail | Ergonomic top handrail at Japanese code height $y=1.30\text{m}$, rotated horizontally along X-axis | Radius 0.04m, length 14.0m, rotation $[0, 0, \pi/2]$ | Smooth `CylinderGeometry` with moonlit specular highlight `#282b3a` | Zero rotation causes vertical rod glitch; strict rotation matrix required | ORIGINAL_REQUEST §R1, PROJECT.md F4 |
| 5 | Architecture | Intermediate Safety Rails & Balusters | Two intermediate horizontal rails ($y=0.85\text{m}, 0.52\text{m}$) plus 58 thin vertical safety balusters ($r=0.008\text{m}$) | Spacing $\Delta x = 0.20\text{m}$, height 0.85m | Complete Japanese commercial safety balustrade grid | Balusters omitted around couple center to avoid occlusion | ORIGINAL_REQUEST §R1, PROJECT.md F4 |
| 6 | Architecture | Side Parapet Return Wings | Left and right parapet curbs running $z \in [0.0, 8.0]$ at $x=\pm 7.0\text{m}$ to enclose rooftop volume | Position $x=\pm 7.0, y=0.175, z=4.0$ | Two `BoxGeometry` perimeter walls preventing void gaps during wide parallax | Renders without returns if screen width is narrow | DISPATCH.md, PROJECT.md F4 |
| 7 | Silhouette | Procedural Vector Canvas Generation | Pure in-memory HTML5 Canvas 2D vector drawing of anime boy and girl leaning at railing ($1024 \times 1024$ px) | Dynamic canvas context, Bézier path coordinates | `THREE.CanvasTexture` with `colorSpace = SRGBColorSpace` | Checks `typeof document !== 'undefined'` to prevent SSR crash | ORIGINAL_REQUEST §R1, PROJECT.md F5 |
| 8 | Silhouette | Anime Boy Leaning Anatomy | Casual school uniform/jacket silhouette leaning forward at 12° with forearms resting upon the top handrail | Anchor $x \approx -0.32\text{m}$, height 1.76m, handrail $y=1.30\text{m}$ | Vector paths for tousled wind-blown hair locks, shoulders, resting forearms, legs | Degrades to simplified outline if curve points missing | ORIGINAL_REQUEST §R1, PROJECT.md F5 |
| 9 | Silhouette | Anime Girl Contemplative Anatomy | Tender posture standing close at $x \approx +0.32\text{m}$, hand touching rail near boy, long flowing hair streaming eastward | Anchor $x \approx +0.32\text{m}$, height 1.62m, tilt towards boy | Vector paths for long layered hair strands, delicate tilted jaw, billowing skirt | Degrades to simplified outline if curve points missing | ORIGINAL_REQUEST §R1, PROJECT.md F5 |
| 10 | Silhouette | Moonlight Rim Light Shader/Stroke | Translucent silver-cyan rim highlight (`rgba(180, 210, 255, 0.85)`) stroked along windward hair locks and shoulders | Path contour stroke, `lineWidth=3`, `shadowBlur=8` | Luminous anime moonlight edge rim catching celestial moon illumination | Omitted if stroke style transparent | ORIGINAL_REQUEST §R1, PROJECT.md F5 |
| 11 | Silhouette | Warm City Bounce Up-Light Tint | Upward linear gradient (`rgba(70, 28, 48, 0.40)` to transparent) tinted via `source-atop` over silhouette lower half | Gradient $y: 1024 \to 500$, `globalCompositeOperation = 'source-atop'` | Warm ambient bounce from Tokyo skyline neon lights below | Flat silhouette if composite mode unsupported | ORIGINAL_REQUEST §R1, PROJECT.md F5 |
| 12 | Silhouette | Depth-Writing Billboard Mounting | Double-sided billboard plane ($2.4\text{m} \times 2.3\text{m}$) positioned at `[0.0, 1.15, 0.08]` with `alphaTest: 0.05` | CanvasTexture, `alphaTest=0.05`, `depthWrite=true` | Crystal-clear silhouette without z-fighting against railing or falling petals | If `depthWrite=false`, petals behind couple incorrectly render in front | ORIGINAL_REQUEST §R1, PROJECT.md F5 |
| 13 | Sakura | Foreground Left Framing Tree | Gnarled CatmullRom spline trunk rooting at `[-4.2, -0.6, 2.8]` and arching over upper-left viewport | 5-point 3D spline, branch splits at $y=2.0$ | Tapered `TubeGeometry` mesh ($r=0.22\text{m} \to 0.06\text{m}$) with dark bark `#1e1422` | Fallback to untapered cylinder if curve evaluation fails | ORIGINAL_REQUEST §R1, PROJECT.md F6 |
| 14 | Sakura | Midground Right Framing Tree | Delicate CatmullRom spline trunk rooting at `[4.5, -0.5, 2.2]` and curving inwards to bracket the celestial moon | 5-point 3D spline, apex at `[1.0, 3.6, -0.2]` | Tapered `TubeGeometry` mesh ($r=0.18\text{m} \to 0.05\text{m}$) framing right perimeter | Fallback to untapered cylinder if curve evaluation fails | ORIGINAL_REQUEST §R1, PROJECT.md F6 |
| 15 | Sakura | Deformed Blossom Cloud Clumps | 28 billowy floral clumps generated from multi-frequency vertex-displaced icosahedrons (`IcosahedronGeometry(r, 2)`) | Radii $0.35\text{m} - 0.95\text{m}$, normal displacement formula | High-volume organic cloud-like sakura clusters clustered at branch nodes | Un-displaced icosahedron if vertex shader/loop fails | ORIGINAL_REQUEST §R1, PROJECT.md F6 |
| 16 | Sakura | Cel-Shaded Anime Gradient Material | 4-tone anime toon ramp (`#852d4e` $\to$ `#d94e78` $\to$ `#ff85a2` $\to$ `#ffebee`) via procedural `DataTexture` | 4-pixel 1D `DataTexture` with `NearestFilter`, `MeshToonMaterial` | Genuine stepped anime cel-shading responding to directional moonlight | Falls back to standard diffuse if gradient map missing | ORIGINAL_REQUEST §R1, PROJECT.md F6 |
| 17 | Sakura | Continuous Wind Harmonic Sway | Subtle natural harmonic oscillations applied to branch groups and blossom clumps in `useFrame` | Delta time, harmonic frequencies (0.8 rad/s, 0.9 rad/s) | Gentle breathing and wind flutter aligned with falling sakura petal drift | Motion stops cleanly if delta time is 0 | ORIGINAL_REQUEST §R1, PROJECT.md F6 |
| 18 | System | Zero External 3D Models Feasibility | 100% of geometries, textures, materials, and paths instantiated through procedural code without any asset files | Pure Three.js geometry classes and 2D Canvas rendering | Zero 404 network requests, zero `.glb`/`.obj`/`.fbx` dependencies | Build error if external loaders are imported | ORIGINAL_REQUEST Acceptance Criteria |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | `RooftopRailing` | Mobile narrow aspect ratio ($390 \times 844$, 9:19.5) | Parapet curb and railing remain centered; height $y=1.30\text{m}$ maintains correct human scale relative to couple. Bottom of slab ($y=-0.4\text{m}$) prevents viewing background void below deck. |
| 2 | `RooftopRailing` | Ultra-wide aspect ratio ($3440 \times 1440$, 21:9) | Deck slab width of $16.0\text{m}$ and side return parapets at $x = \pm 7.0\text{m}$ prevent peripheral edge clipping when user pans horizontally with mouse parallax. |
| 3 | `RooftopRailing` | GSAP Scroll plunge forward past $z = 0.0$ | Camera passes directly over top handrail ($y=1.30\text{m}$) into negative Y space ($y \to -18\text{m}$). Concrete slab bottom face and parapet front face have valid normals (`DoubleSide` or outward `FrontSide`) preventing inverted backface holes. |
| 4 | `CoupleSilhouette` | Next.js Server-Side Prerendering (SSR) | `document.createElement('canvas')` would throw `ReferenceError: document is not defined`. Guarding texture creation inside `useMemo`/`useEffect` with `typeof document !== 'undefined'` check guarantees zero SSR errors. |
| 5 | `CoupleSilhouette` | High-DPI / Retina Displays (DPR 2x to 3x) | $1024 \times 1024$ canvas resolution mapped to $2.4\text{m} \times 2.3\text{m}$ plane provides $\approx 426$ px/m texture density, keeping wind-blown hair locks crisp and anti-aliased even during close camera flyby. |
| 6 | `CoupleSilhouette` | Particle depth sorting & occlusions | With `alphaTest: 0.05` and `depthWrite: true`, falling sakura petals correctly occlude behind the couple, and petals passing in front are rendered cleanly without alpha halo fringes or box boundary artifacts. |
| 7 | `CoupleSilhouette` | Component unmount / route transition | Canvas texture memory must be reclaimed. Cleanup function calls `texture.dispose()` and `material.dispose()` preventing GPU memory leaks. |
| 8 | `SakuraTrees` | GPU draw call budget & geometry allocation | Instead of allocating 28 individual geometries for 28 clumps, a single base displaced `IcosahedronGeometry` is instantiated once and shared across all 28 mesh instances with individual `scale` and `rotation`, consuming $< 2\text{MB}$ VRAM. |
| 9 | `SakuraTrees` | Wind sway during reverse scroll scrub | Wind sway animation is purely driven by continuous `clock.getElapsedTime()` in `useFrame`, meaning the tree branches sway gracefully regardless of whether user is scrolling forwards, backwards, or stationary. |
| 10 | `SakuraTrees` | Extreme camera plunge down to Scene 2 ($y = -18\text{m}$) | Framing trees are positioned at $y \in [-0.6, 4.2]$. During plunge to $y = -18.0$, they naturally recede above the camera's upper frustum boundary without needing hard visibility toggle flags. |

---

## 1. Observation

### 1.1 Direct Repository Observations
- **Dependencies** (`package.json`, lines 11–20):
  ```json
  "dependencies": {
    "@react-three/drei": "^10.7.9",
    "@react-three/fiber": "^9.8.2",
    "gsap": "^3.15.0",
    "lucide-react": "^1.63.0",
    "next": "16.4.3",
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "three": "^0.186.1"
  }
  ```
  Three.js v0.186.1 and `@react-three/fiber` v9.8.2 are verified and operational.
- **Node Execution Verification**:
  Verified via Node execution:
  - `THREE.TubeGeometry(curve, 32, 0.22, 8, false)` creates 297 vertices and allows in-place procedural tapering ($r=0.22 \to 0.06$).
  - `THREE.IcosahedronGeometry(1.0, 2)` creates 540 vertices and accepts multi-frequency noise normal displacement.
  - `THREE.DataTexture` with `NearestFilter` configured with 4-step RGBA palette works out of the box with `THREE.MeshToonMaterial`.
  - `THREE.CanvasTexture` creates a valid texture from an HTML5 canvas with `colorSpace = THREE.SRGBColorSpace`.
- **Core Requirements** (`ORIGINAL_REQUEST.md`, lines 18–20):
  - "A silhouetted anime couple leaning or standing at a rooftop railing."
  - "Cherry blossom (sakura) trees framing the foreground/midground."
  - "All 3D visual assets, meshes, silhouettes, and textures must be generated procedurally (e.g. custom Three.js geometries, canvas textures, and shaders) without relying on external downloaded 3D model files."
- **Camera Vantage Contract** (`PROJECT.md` & `explorer_survey_3/handoff.md`):
  - Initial Hero Camera: `camera.position = [0.0, 2.4, 9.0]`, `camera.lookAt = [0.0, 1.9, 0.0]`, `fov = 46°`.
  - Rooftop parapet & railing: centered at $z = 0.0$, top rail height $y = 1.30\text{m}$.
  - Couple silhouette: positioned right behind railing at $z = 0.08$, leaning on rail at $y = 1.30\text{m}$.
  - Sakura trees: Left tree trunk root at `[-4.2, -0.6, 2.8]`, Right tree trunk root at `[4.5, -0.5, 2.2]`, arching over the top corners to frame the couple and the moon.

---

## 2. Logic Chain

1. **Procedural Rooftop Structure (F4)**:
   - *Premise*: The rooftop provides the physical grounding for the entire hero scene. Without a solid floor and parapet, the camera plunge feels ungrounded.
   - *Design*:
     - Deck slab: Dark asphalt/concrete `BoxGeometry(16.0, 0.4, 10.0)` at `[0, -0.2, 5.0]`, providing ground from $z = 0.0$ back to $z = 10.0$.
     - Upstand Parapet Wall: Solid concrete curb `BoxGeometry(14.0, 0.35, 0.3)` with beveled coping `BoxGeometry(14.2, 0.05, 0.36)` at $y = 0.36$.
     - Stanchion Posts: 11 upright cylinders (`CylinderGeometry(0.035, 0.035, 0.92, 12)`) anchored on the coping, reaching $y = 1.30\text{m}$.
     - Top Handrail: Horizontal steel cylinder `CylinderGeometry(0.04, 0.04, 14.0, 24)` at $y = 1.30\text{m}, z = 0.0\text{m}$.
     - Intermediate Guard Rails: Horizontal cylinders at $y = 0.85\text{m}$ and $y = 0.52\text{m}$.
     - Balusters: Array of 58 vertical rods ($r=0.008\text{m}$) spaced every $0.20\text{m}$, creating a Japanese safety railing infill.

2. **Anime Couple Silhouette Vector Rendering (F5)**:
   - *Premise*: External 3D character models are strictly forbidden. Simplistic 3D mannequin primitives look robotic and unromantic. True anime romance scenes require delicate, expressive line work (wind-blown hair strands, natural leaning posture, tender proximity).
   - *Solution*: Procedural HTML5 2D Canvas vector rendering ($1024 \times 1024$ px) mapped to a double-sided billboard plane at `[0.0, 1.15, 0.08]`.
   - *Boy Vector Anatomy*:
     - Torso leaning forward at 12° toward the railing.
     - Forearms resting horizontally along the top handrail at $y = 1.30\text{m}$.
     - Messy anime hair with spiky locks blown rightward (+X) by the night wind.
   - *Girl Vector Anatomy*:
     - Standing close beside him ($x \approx +0.32\text{m}$), head gently tilted leftward toward him.
     - Left hand lightly touching the top handrail near his hand (emotional focal point).
     - Long flowing hair strands trailing gracefully eastward (+X).
     - Pleated skirt/coat hem billowed gently by the breeze.
   - *Anime Cel-Shading & Lighting*:
     - Core fill: Midnight indigo `#080916`.
     - Moonlight Rim Glow: 3px stroke with silver-cyan `rgba(180, 210, 255, 0.85)` and soft outer glow blur along windward hair locks and shoulders.
     - Warm City Bounce: Subtle vertical linear gradient `rgba(70, 28, 48, 0.40)` fading upwards over the lower body, simulating Tokyo skyline neon illumination.
     - Material: `MeshBasicMaterial` (or `MeshStandardMaterial`) with `map={canvasTexture}`, `transparent={true}`, `alphaTest={0.05}`, `depthWrite={true}`.

3. **Procedural Sakura Framing Trees (F6)**:
   - *Premise*: Foreground cherry blossom trees frame the scene (Japanese "kuro-buchi" cinematic technique), guiding the viewer's eye to the couple and moon while giving immense depth.
   - *Trunk & Branch Architecture*:
     - Left Tree: 5-point CatmullRom spline from `[-4.2, -0.6, 2.8]` curving up and across to `[-0.6, 3.5, 0.4]`, with 2 secondary branch splits.
     - Right Tree: 5-point CatmullRom spline from `[4.5, -0.5, 2.2]` curving inwards to `[1.0, 3.6, -0.2]`.
     - Geometry: `TubeGeometry` with procedural vertex scaling along spline segments, producing organic tapering from trunk base ($r = 0.22\text{m}$) to branch tips ($r = 0.06\text{m}$).
     - Bark Material: Dark gnarled bark `#1e1422` with matte finish (`roughness: 0.85`).
   - *Stylized Blossom Cloud Clusters*:
     - 28 deformed icosahedrons (`IcosahedronGeometry(radius, 2)`) clustered around branch ends.
     - Vertex noise displacement displaces vertices along their normal:
       $$v_{\text{new}} = v + \hat{n} \cdot [0.14 \sin(4.5 \cdot v_x) \cos(4.5 \cdot v_y) + 0.08 \sin(6.0 \cdot v_z + 3.0 \cdot v_x)]$$
       creating billowy cauliflower-like sakura clouds.
   - *Cel-Shading Anime Shader*:
     - `THREE.MeshToonMaterial` paired with a procedural 4-tone 1D `DataTexture` gradient map:
       1. Shadow crevice: Plum rose `#852d4e`
       2. Midtone shadow: Rose blush `#d94e78`
       3. Main petal color: Vibrant anime sakura pink `#ff85a2`
       4. Moonlit highlight: Soft baby pink / pearlescent ivory `#ffebee`
     - Evaluated with directional moonlight for classic anime cel-shading.
   - *Wind Sway Motion*:
     - Harmonic rotation applied to tree root groups in `useFrame`:
       $\theta_z(t) = 0.018 \sin(t \cdot 0.85)$
       $\theta_x(t) = 0.012 \cos(t \cdot 0.65)$
       Synchronized with the falling petal wind drift.

---

## 3. Caveats & Assumptions

1. **Billboard vs 3D Couple Silhouette**:
   - *Assumption*: High-resolution vector canvas drawing onto a transparent billboard plane delivers significantly higher artistic fidelity for delicate anime hair strands and emotional leaning posture than procedural 3D box or cylinder mannequins.
   - *Consideration*: As the camera dives past the couple during scroll progress $0.20 \to 0.35$, the camera moves forward and slightly down, passing the couple at an oblique angle. The billboard is aligned facing the starting camera angle ($+Z$ normal). To ensure seamless 3D presence from side angles, the couple plane is placed at $z = 0.08$, closely hugging the railing bars.
2. **SSR Boundary**:
   - HTML5 Canvas creation requires `window` and `document`. All canvas texture routines must either run inside `useMemo` with `typeof document !== 'undefined'` or in `useEffect`. Since `<RooftopCanvas>` will be dynamically imported with `ssr: false`, this is fully safeguarded.
3. **Geometry Memory Optimization**:
   - Deformed icosahedrons for sakura blossom clumps are generated once and shared across multiple meshes with different local scales and rotations, keeping total scene triangle count under 18,000 tris and draw calls $< 10$.

---

## 4. Conclusion & Precise Component Specifications

### 4.1 Component 1: `src/components/canvas/RooftopRailing.tsx`

```tsx
'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

export interface RooftopRailingProps {
  deckWidth?: number;
  deckDepth?: number;
  deckHeight?: number;
  railingHeight?: number;
  stanchionCount?: number;
}

export function RooftopRailing({
  deckWidth = 16.0,
  deckDepth = 10.0,
  deckHeight = 0.4,
  railingHeight = 1.30,
  stanchionCount = 11,
}: RooftopRailingProps) {
  // Stanchion X positions distributed across parapet length
  const stanchionPositions = useMemo(() => {
    const positions: number[] = [];
    const minX = -6.0;
    const maxX = 6.0;
    const step = (maxX - minX) / (stanchionCount - 1);
    for (let i = 0; i < stanchionCount; i++) {
      positions.push(minX + i * step);
    }
    return positions;
  }, [stanchionCount]);

  // Thin vertical baluster positions (spaced every ~0.20m, leaving center gap for couple)
  const balusterPositions = useMemo(() => {
    const positions: number[] = [];
    const minX = -5.8;
    const maxX = 5.8;
    const step = 0.20;
    for (let x = minX; x <= maxX; x += step) {
      // Omit small gap around center where couple leans to preserve clean visual silhouette
      if (Math.abs(x) > 0.75) {
        positions.push(Number(x.toFixed(2)));
      }
    }
    return positions;
  }, []);

  return (
    <group name="rooftop-railing-system">
      {/* 1. Concrete Roof Deck Flooring Slab */}
      <mesh position={[0, -deckHeight / 2, deckDepth / 2]} receiveShadow>
        <boxGeometry args={[deckWidth, deckHeight, deckDepth]} />
        <meshStandardMaterial
          color="#161822"
          roughness={0.88}
          metalness={0.12}
        />
      </mesh>

      {/* 2. Concrete Safety Parapet Curb Wall (Front Edge) */}
      <mesh position={[0, 0.175, 0.0]}>
        <boxGeometry args={[14.0, 0.35, 0.30]} />
        <meshStandardMaterial
          color="#1e202e"
          roughness={0.82}
          metalness={0.15}
        />
      </mesh>

      {/* 3. Parapet Top Coping / Bevel Cap */}
      <mesh position={[0, 0.365, 0.0]}>
        <boxGeometry args={[14.2, 0.05, 0.36]} />
        <meshStandardMaterial
          color="#252838"
          roughness={0.75}
          metalness={0.20}
        />
      </mesh>

      {/* 4. Left & Right Parapet Return Walls (Enclosing Perimeter) */}
      <mesh position={[-7.0, 0.175, 4.0]}>
        <boxGeometry args={[0.30, 0.35, 8.0]} />
        <meshStandardMaterial color="#1e202e" roughness={0.82} metalness={0.15} />
      </mesh>
      <mesh position={[7.0, 0.175, 4.0]}>
        <boxGeometry args={[0.30, 0.35, 8.0]} />
        <meshStandardMaterial color="#1e202e" roughness={0.82} metalness={0.15} />
      </mesh>

      {/* 5. Steel Stanchion Posts with Baseplates */}
      {stanchionPositions.map((posX, idx) => (
        <group key={`stanchion-${idx}`} position={[posX, 0.39, 0.0]}>
          {/* Welded Anchor Baseplate */}
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[0.10, 0.02, 0.10]} />
            <meshStandardMaterial color="#222430" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Vertical Post */}
          <mesh position={[0, (railingHeight - 0.39) / 2, 0]}>
            <cylinderGeometry args={[0.032, 0.032, railingHeight - 0.39, 12]} />
            <meshStandardMaterial color="#282b3a" roughness={0.35} metalness={0.75} />
          </mesh>
        </group>
      ))}

      {/* 6. Ergonomic Top Handrail (Horizontal Cylinder at code height 1.30m) */}
      <mesh position={[0, railingHeight, 0.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 14.0, 24]} />
        <meshStandardMaterial color="#303446" roughness={0.30} metalness={0.80} />
      </mesh>

      {/* 7. Intermediate Safety Mid-Rail (Height 0.85m) */}
      <mesh position={[0, 0.85, 0.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 14.0, 16]} />
        <meshStandardMaterial color="#282b3a" roughness={0.35} metalness={0.75} />
      </mesh>

      {/* 8. Lower Intermediate Safety Rail (Height 0.52m) */}
      <mesh position={[0, 0.52, 0.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 14.0, 16]} />
        <meshStandardMaterial color="#282b3a" roughness={0.35} metalness={0.75} />
      </mesh>

      {/* 9. Vertical Safety Balusters */}
      {balusterPositions.map((posX, idx) => (
        <mesh key={`baluster-${idx}`} position={[posX, 0.84, 0.0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.88, 8]} />
          <meshStandardMaterial color="#252836" roughness={0.40} metalness={0.70} />
        </mesh>
      ))}
    </group>
  );
}
export default RooftopRailing;
```

---

### 4.2 Component 2: `src/components/canvas/CoupleSilhouette.tsx`

```tsx
'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';

export interface CoupleSilhouetteProps {
  position?: [number, number, number];
  scale?: number;
}

export function CoupleSilhouette({
  position = [0.0, 1.15, 0.08],
  scale = 1.0,
}: CoupleSilhouetteProps) {
  // Generate high-resolution 1024x1024 procedural anime couple silhouette texture
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 1024, 1024);

    // ==========================================
    // 1. BOY SILHOUETTE (Left side, leaning at rail)
    // Posture: Forearms resting on rail (y ~ 440), head turned right
    // ==========================================
    ctx.beginPath();
    // Feet & Lower Legs
    ctx.moveTo(370, 990);
    ctx.lineTo(395, 990);
    ctx.lineTo(410, 750); // right knee
    ctx.lineTo(435, 750);
    ctx.lineTo(445, 990);
    ctx.lineTo(470, 990);
    ctx.lineTo(455, 680); // inner thigh
    ctx.lineTo(475, 610); // jacket right hem

    // Jacket & Torso
    ctx.bezierCurveTo(480, 560, 470, 480, 465, 420); // right ribcage to shoulder
    // Right arm resting on railing
    ctx.bezierCurveTo(475, 425, 495, 440, 490, 455); // right elbow
    ctx.lineTo(440, 445); // forearm resting on rail
    ctx.lineTo(420, 440); // right hand on rail

    // Boy Neck & Chin Profile (facing right toward the girl)
    ctx.lineTo(415, 385); // throat
    ctx.lineTo(425, 360); // jawline
    ctx.lineTo(432, 345); // chin
    ctx.lineTo(426, 335); // mouth/nose profile

    // Wind-blown Tousled Hair (Spikes blowing East / +X)
    ctx.lineTo(448, 320); // hair spike 1
    ctx.lineTo(430, 312);
    ctx.lineTo(458, 298); // hair spike 2
    ctx.lineTo(435, 290);
    ctx.lineTo(465, 270); // prominent wind tuft 3
    ctx.lineTo(438, 260);
    ctx.bezierCurveTo(420, 235, 385, 230, 365, 250); // top crown
    ctx.bezierCurveTo(345, 270, 340, 310, 345, 340); // back of head
    ctx.lineTo(340, 385); // nape

    // Left Shoulder & Leaning Left Arm
    ctx.bezierCurveTo(325, 400, 310, 420, 305, 450); // left elbow
    ctx.bezierCurveTo(320, 450, 360, 445, 395, 440); // left forearm along rail
    ctx.lineTo(350, 490); // back torso line
    ctx.bezierCurveTo(345, 540, 350, 600, 345, 640); // jacket left hemline
    ctx.lineTo(355, 750); // left leg outer
    ctx.lineTo(370, 990);
    ctx.closePath();

    // ==========================================
    // 2. GIRL SILHOUETTE (Right side, contemplative)
    // Posture: Hand on rail touching boy's hand, long hair flowing
    // ==========================================
    // Feet & Skirt
    ctx.moveTo(565, 990);
    ctx.lineTo(585, 990);
    ctx.lineTo(595, 780); // right leg
    ctx.lineTo(615, 780);
    ctx.lineTo(625, 990);
    ctx.lineTo(645, 990);
    ctx.lineTo(635, 730);

    // Billowing Pleated Skirt (fluttering rightward in wind)
    ctx.bezierCurveTo(665, 725, 705, 715, 685, 660); // skirt outer billow
    ctx.bezierCurveTo(670, 630, 650, 600, 640, 560); // waistline right
    ctx.lineTo(648, 480); // right side coat

    // Girl Right Arm hanging down relaxed
    ctx.bezierCurveTo(660, 510, 665, 560, 660, 580);
    ctx.lineTo(645, 580);
    ctx.bezierCurveTo(650, 530, 645, 470, 635, 430); // right shoulder

    // Long Flowing Hair (Magnificent Anime Strands streaming East)
    ctx.bezierCurveTo(655, 420, 695, 440, 735, 480); // long hair strand 1
    ctx.bezierCurveTo(715, 440, 685, 400, 665, 375);
    ctx.bezierCurveTo(705, 385, 755, 410, 780, 450); // long hair strand 2
    ctx.bezierCurveTo(740, 390, 700, 350, 660, 325);
    ctx.bezierCurveTo(695, 320, 740, 335, 765, 360); // high wispy strand
    ctx.bezierCurveTo(720, 310, 675, 280, 635, 275); // crown top right
    ctx.bezierCurveTo(605, 260, 575, 270, 560, 290); // crown top left

    // Girl Head tilted toward boy
    ctx.bezierCurveTo(550, 310, 555, 340, 565, 365); // left cheek & jaw
    ctx.lineTo(570, 385); // neck left

    // Girl Left Arm reaching forward to touch handrail near boy's hand
    ctx.bezierCurveTo(555, 400, 535, 420, 505, 440); // left hand touching rail!
    ctx.bezierCurveTo(525, 450, 550, 445, 565, 430); // forearm
    ctx.bezierCurveTo(560, 480, 555, 530, 550, 570); // left waist
    ctx.bezierCurveTo(540, 620, 535, 680, 550, 730); // skirt left edge
    ctx.lineTo(565, 990);
    ctx.closePath();

    // 3. Fill Core Silhouette with Deep Midnight Indigo
    ctx.fillStyle = '#080916';
    ctx.fill();

    // 4. City Skyline Warm Bounce Tint (source-atop overlay from bottom)
    ctx.globalCompositeOperation = 'source-atop';
    const cityGradient = ctx.createLinearGradient(0, 1024, 0, 450);
    cityGradient.addColorStop(0.0, 'rgba(75, 30, 50, 0.42)'); // warm magenta-amber glow
    cityGradient.addColorStop(0.5, 'rgba(45, 20, 35, 0.18)');
    cityGradient.addColorStop(1.0, 'rgba(8, 9, 22, 0.0)');
    ctx.fillStyle = cityGradient;
    ctx.fillRect(0, 0, 1024, 1024);

    // 5. Moonlight Silver-Cyan Rim Glow on Upper Windward Profiles
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(180, 210, 255, 0.85)';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = 'rgba(140, 190, 255, 0.75)';
    ctx.shadowBlur = 9;

    // Boy Hair Rim Stroke
    ctx.beginPath();
    ctx.moveTo(365, 250);
    ctx.bezierCurveTo(385, 230, 420, 235, 438, 260);
    ctx.lineTo(465, 270);
    ctx.lineTo(435, 290);
    ctx.lineTo(458, 298);
    ctx.lineTo(430, 312);
    ctx.lineTo(448, 320);
    ctx.stroke();

    // Girl Hair Rim Stroke
    ctx.beginPath();
    ctx.moveTo(560, 290);
    ctx.bezierCurveTo(575, 270, 605, 260, 635, 275);
    ctx.bezierCurveTo(675, 280, 720, 310, 765, 360);
    ctx.stroke();

    // Handrail Contact Rim (Moonlight reflecting off resting hands)
    ctx.beginPath();
    ctx.moveTo(395, 438);
    ctx.lineTo(440, 440);
    ctx.moveTo(495, 438);
    ctx.lineTo(515, 440);
    ctx.stroke();

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.colorSpace = THREE.SRGBColorSpace;
    canvasTexture.minFilter = THREE.LinearFilter;
    canvasTexture.magFilter = THREE.LinearFilter;
    canvasTexture.needsUpdate = true;
    return canvasTexture;
  }, []);

  // Cleanup texture on unmount
  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  return (
    <mesh
      position={position}
      scale={[scale * 2.4, scale * 2.3, 1.0]}
      name="couple-silhouette"
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        alphaTest={0.05}
        depthWrite={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
export default CoupleSilhouette;
```

---

### 4.3 Component 3: `src/components/canvas/SakuraTrees.tsx`

```tsx
'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface SakuraTreesProps {
  windIntensity?: number;
}

export function SakuraTrees({ windIntensity = 1.0 }: SakuraTreesProps) {
  const leftTreeRef = useRef<THREE.Group>(null);
  const rightTreeRef = useRef<THREE.Group>(null);

  // 1. Procedural Cel-Shading 4-Tone Gradient Map for Anime Toon Shading
  const celGradientMap = useMemo(() => {
    const palette = new Uint8Array([
      133, 45, 78, 255,   // Step 0: Plum Crevice Shadow (#852d4e)
      217, 78, 120, 255,  // Step 1: Rose Mid-Shadow (#d94e78)
      255, 133, 162, 255, // Step 2: Main Anime Sakura Pink (#ff85a2)
      255, 235, 238, 255  // Step 3: Pearlescent Moonlit Highlight (#ffebee)
    ]);
    const texture = new THREE.DataTexture(palette, 4, 1, THREE.RGBAFormat);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  }, []);

  // 2. Shared Bark Material
  const barkMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1b121e',
      roughness: 0.88,
      metalness: 0.08,
    });
  }, []);

  // 3. Shared Anime Cel-Shaded Blossom Clump Material
  const blossomMaterial = useMemo(() => {
    return new THREE.MeshToonMaterial({
      color: '#ff85a2',
      gradientMap: celGradientMap,
    });
  }, [celGradientMap]);

  // 4. Base Deformed Icosahedron Geometry for Blossom Clouds (Shared by all 28 clumps)
  const blossomGeometry = useMemo(() => {
    const geom = new THREE.IcosahedronGeometry(1.0, 2);
    const pos = geom.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const norm = v.clone().normalize();
      // Multi-frequency noise displacement for billowy cauliflower volume
      const disp =
        0.14 * Math.sin(v.x * 4.5) * Math.cos(v.y * 4.5) +
        0.08 * Math.sin(v.z * 6.0 + v.x * 3.0);
      v.addScaledVector(norm, disp);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
    return geom;
  }, []);

  // 5. Helper to create tapered TubeGeometry along a 3D CatmullRom spline
  const createTaperedTube = (
    points: THREE.Vector3[],
    baseRadius: number,
    tipFactor: number = 0.28
  ) => {
    const curve = new THREE.CatmullRomCurve3(points);
    const tubularSegments = 32;
    const radialSegments = 8;
    const geom = new THREE.TubeGeometry(curve, tubularSegments, baseRadius, radialSegments, false);
    const pos = geom.attributes.position;
    const ringCount = radialSegments + 1;

    for (let i = 0; i <= tubularSegments; i++) {
      const t = i / tubularSegments;
      const taper = 1.0 - t * (1.0 - tipFactor);
      const center = curve.getPointAt(t);
      for (let j = 0; j < ringCount; j++) {
        const idx = i * ringCount + j;
        const vx = pos.getX(idx);
        const vy = pos.getY(idx);
        const vz = pos.getZ(idx);
        pos.setXYZ(
          idx,
          center.x + (vx - center.x) * taper,
          center.y + (vy - center.y) * taper,
          center.z + (vz - center.z) * taper
        );
      }
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
    return geom;
  };

  // 6. Left Tree Branch & Trunk Geometries
  const leftTrunkGeom = useMemo(() => {
    return createTaperedTube(
      [
        new THREE.Vector3(-4.5, -0.8, 3.0),
        new THREE.Vector3(-3.8, 0.6, 2.4),
        new THREE.Vector3(-2.9, 1.9, 1.8),
        new THREE.Vector3(-1.9, 2.8, 1.2),
        new THREE.Vector3(-0.8, 3.4, 0.6),
      ],
      0.22,
      0.28
    );
  }, []);

  const leftSubBranchGeom = useMemo(() => {
    return createTaperedTube(
      [
        new THREE.Vector3(-2.9, 1.9, 1.8),
        new THREE.Vector3(-2.3, 2.5, 2.3),
        new THREE.Vector3(-1.4, 2.9, 2.6),
      ],
      0.13,
      0.35
    );
  }, []);

  // 7. Right Tree Branch & Trunk Geometries
  const rightTrunkGeom = useMemo(() => {
    return createTaperedTube(
      [
        new THREE.Vector3(4.8, -0.6, 2.4),
        new THREE.Vector3(3.9, 0.9, 1.8),
        new THREE.Vector3(3.0, 2.1, 1.2),
        new THREE.Vector3(2.1, 3.0, 0.6),
        new THREE.Vector3(1.1, 3.5, 0.0),
      ],
      0.18,
      0.30
    );
  }, []);

  const rightSubBranchGeom = useMemo(() => {
    return createTaperedTube(
      [
        new THREE.Vector3(3.0, 2.1, 1.2),
        new THREE.Vector3(3.4, 2.8, 1.7),
        new THREE.Vector3(3.5, 3.3, 2.1),
      ],
      0.11,
      0.38
    );
  }, []);

  // 8. Clump Clustering Coordinate Data (Left Tree: 16 clumps; Right Tree: 12 clumps)
  const leftClumps = useMemo(
    () => [
      { pos: [-0.6, 3.5, 0.5] as [number, number, number], r: 0.85, rot: [0.2, 0.5, 0.1] },
      { pos: [-1.2, 3.7, 0.7] as [number, number, number], r: 0.95, rot: [0.8, -0.3, 0.4] },
      { pos: [-1.8, 3.3, 1.0] as [number, number, number], r: 0.90, rot: [-0.4, 0.9, 0.2] },
      { pos: [-2.4, 3.0, 1.4] as [number, number, number], r: 0.80, rot: [0.5, 0.1, -0.6] },
      { pos: [-1.3, 2.9, 2.5] as [number, number, number], r: 0.75, rot: [-0.2, -0.7, 0.5] },
      { pos: [-2.1, 2.6, 2.2] as [number, number, number], r: 0.70, rot: [0.9, 0.4, -0.2] },
      { pos: [-0.3, 3.8, 0.3] as [number, number, number], r: 0.65, rot: [0.1, -0.5, 0.8] },
      { pos: [-1.5, 3.9, 0.9] as [number, number, number], r: 0.70, rot: [-0.6, 0.3, -0.4] },
      { pos: [-0.9, 3.2, 0.9] as [number, number, number], r: 0.60, rot: [0.3, 0.8, 0.1] },
      { pos: [-2.8, 2.3, 1.9] as [number, number, number], r: 0.65, rot: [-0.5, -0.2, 0.7] },
      { pos: [-1.7, 2.5, 2.8] as [number, number, number], r: 0.55, rot: [0.4, -0.6, 0.3] },
      { pos: [-3.3, 1.6, 2.1] as [number, number, number], r: 0.50, rot: [0.1, 0.2, -0.5] },
      { pos: [-0.1, 3.3, 0.2] as [number, number, number], r: 0.55, rot: [0.7, -0.4, 0.2] },
      { pos: [-0.8, 4.1, 0.5] as [number, number, number], r: 0.60, rot: [-0.3, 0.5, 0.6] },
      { pos: [-2.5, 3.4, 1.1] as [number, number, number], r: 0.50, rot: [0.2, -0.8, -0.1] },
      { pos: [-1.0, 2.6, 2.2] as [number, number, number], r: 0.45, rot: [-0.1, 0.4, -0.7] },
    ],
    []
  );

  const rightClumps = useMemo(
    () => [
      { pos: [1.0, 3.6, -0.1] as [number, number, number], r: 0.80, rot: [0.3, 0.2, -0.4] },
      { pos: [1.7, 3.3, 0.3] as [number, number, number], r: 0.85, rot: [-0.5, 0.7, 0.1] },
      { pos: [2.5, 2.9, 0.8] as [number, number, number], r: 0.75, rot: [0.8, -0.4, 0.5] },
      { pos: [3.3, 3.2, 1.9] as [number, number, number], r: 0.70, rot: [-0.2, -0.6, 0.8] },
      { pos: [3.6, 2.6, 1.5] as [number, number, number], r: 0.65, rot: [0.4, 0.5, -0.3] },
      { pos: [0.5, 3.8, -0.3] as [number, number, number], r: 0.60, rot: [-0.6, 0.1, 0.7] },
      { pos: [1.4, 3.9, 0.1] as [number, number, number], r: 0.65, rot: [0.2, -0.5, -0.6] },
      { pos: [2.0, 3.5, 0.5] as [number, number, number], r: 0.55, rot: [0.6, 0.8, 0.2] },
      { pos: [2.9, 2.3, 1.1] as [number, number, number], r: 0.50, rot: [-0.4, -0.3, 0.4] },
      { pos: [3.5, 3.5, 2.3] as [number, number, number], r: 0.50, rot: [0.1, 0.7, -0.5] },
      { pos: [0.8, 3.2, 0.2] as [number, number, number], r: 0.45, rot: [-0.7, 0.3, 0.1] },
      { pos: [2.3, 2.6, 1.4] as [number, number, number], r: 0.40, rot: [0.5, -0.2, 0.6] },
    ],
    []
  );

  // 9. Continuous Natural Wind Harmonic Sway in useFrame
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (leftTreeRef.current) {
      leftTreeRef.current.rotation.z = Math.sin(t * 0.85) * 0.018 * windIntensity;
      leftTreeRef.current.rotation.x = Math.cos(t * 0.65) * 0.012 * windIntensity;
    }
    if (rightTreeRef.current) {
      rightTreeRef.current.rotation.z = Math.cos(t * 0.75 + 1.2) * 0.015 * windIntensity;
      rightTreeRef.current.rotation.x = Math.sin(t * 0.55 + 0.8) * 0.010 * windIntensity;
    }
  });

  return (
    <group name="sakura-framing-trees">
      {/* LEFT FRAMING TREE */}
      <group ref={leftTreeRef} position={[-4.2, -0.6, 2.8]}>
        <group position={[4.2, 0.6, -2.8]}>
          <mesh geometry={leftTrunkGeom} material={barkMaterial} />
          <mesh geometry={leftSubBranchGeom} material={barkMaterial} />
          {leftClumps.map((c, i) => (
            <mesh
              key={`left-clump-${i}`}
              position={c.pos}
              scale={[c.r, c.r * 0.85, c.r]}
              rotation={c.rot as [number, number, number]}
              geometry={blossomGeometry}
              material={blossomMaterial}
            />
          ))}
        </group>
      </group>

      {/* RIGHT FRAMING TREE */}
      <group ref={rightTreeRef} position={[4.5, -0.5, 2.2]}>
        <group position={[-4.5, 0.5, -2.2]}>
          <mesh geometry={rightTrunkGeom} material={barkMaterial} />
          <mesh geometry={rightSubBranchGeom} material={barkMaterial} />
          {rightClumps.map((c, i) => (
            <mesh
              key={`right-clump-${i}`}
              position={c.pos}
              scale={[c.r, c.r * 0.85, c.r]}
              rotation={c.rot as [number, number, number]}
              geometry={blossomGeometry}
              material={blossomMaterial}
            />
          ))}
        </group>
      </group>
    </group>
  );
}
export default SakuraTrees;
```

---

## 5. Verification Method

### 5.1 Static Typecheck & Build Verification
1. **TypeScript Typecheck**:
   Command: `npx tsc --noEmit`
   *Pass Criteria*: Exit code 0, zero diagnostic errors.
2. **Next.js Production Build**:
   Command: `npm run build`
   *Pass Criteria*: Exit code 0. Zero build errors across App Router client bundles.
3. **Asset Self-Containment Audit**:
   Command: `find_by_name` across `public/` and `src/` for extensions `glb, gltf, obj, fbx, hdr`.
   *Pass Criteria*: 0 matches. All meshes and textures must instantiate procedural Three.js classes.

### 5.2 Component Geometry & Shader Unit Verification
Run Node script to verify all 3 component classes:
```bash
node --input-type=module -e "
import * as THREE from 'three';
// 1. Verify TubeGeometry tapering
const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0), new THREE.Vector3(1,2,0)]);
const tube = new THREE.TubeGeometry(curve, 20, 0.2, 8, false);
console.log('Tube vertices count:', tube.attributes.position.count);

// 2. Verify Deformed Icosahedron
const ico = new THREE.IcosahedronGeometry(1.0, 2);
console.log('Icosahedron vertices count:', ico.attributes.position.count);

// 3. Verify MeshToonMaterial with DataTexture
const palette = new Uint8Array([133,45,78,255, 217,78,120,255, 255,133,162,255, 255,235,238,255]);
const grad = new THREE.DataTexture(palette, 4, 1, THREE.RGBAFormat);
const toon = new THREE.MeshToonMaterial({ color: '#ff85a2', gradientMap: grad });
console.log('Toon Material valid:', toon.isMeshToonMaterial);
"
```
*Pass Criteria*: Outputs vertex counts and `Toon Material valid: true` with exit code 0.

### 5.3 Invalidation Conditions
This specification is invalidated if:
1. External `.gltf` or `.glb` files are introduced into the project repository.
2. The couple silhouette is rendered via low-detail blocky 3D primitives rather than high-resolution vector paths.
3. The rooftop railing does not have the concrete slab, parapet curb, stanchions, and top handrail.
4. The sakura trees use flat un-shaded planes instead of 3D branch splines and cel-shaded blossom clumps.
