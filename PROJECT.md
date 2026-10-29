# Project: KoiStory — Premium Cinematic Anime Love-Story Landing Page

## Architecture
The application is structured into decoupled, modular client-side layers orchestrated over a continuous scroll journey:
1. **Presentation & R3F Canvas Layer (`src/components/canvas/`)**:
   - `RooftopCanvas`: Dynamic client-only Canvas wrapper ensuring zero SSR execution in Next.js 16/React 19.
   - `Scene1Hero`: 3D Rooftop environment hosting procedural sky dome, moon, city skyline, rooftop deck, couple silhouette, and framing sakura trees.
   - `CameraController`: Unified camera rig reconciling dampened mouse parallax with GSAP ScrollTrigger camera dive.
   - `SakuraPetals`: High-performance instanced 3D particle mesh (`THREE.InstancedMesh`, 350 petals) running custom aerodynamic physics.
2. **Scroll Narrative Layer (`src/components/narrative/`)**:
   - `Scene2Narrative`: High-performance CSS 3D transformed DOM cards floating over the descending 3D background.
   - `StoryCard`: Individual memory cards with 3D hover tilt, cursor-tracking radial glare, and soft glow highlights.
3. **Procedural Audio & UI Overlay Layer (`src/components/ui/` & `src/lib/audio/`)**:
   - `SoundEngine`: 100% synthesized Web Audio graph (breeze noise filter + generative ethereal pentatonic chords).
   - `AudioToggle`: Glassmorphic audio button with animated sound wave bars and browser autoplay compliance.
   - `HeroOverlay`: Anime-inspired typography, Japanese subtitle accents, and subtle scroll indicator.
4. **Scroll Synchronization Controller (`src/components/scroll/`)**:
   - `ScrollController`: Master GSAP ScrollTrigger timeline controlling camera track coordinates and story card reveals.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Stylized Anime Moon | Procedural pearlescent moon disc with FBM craters and additive atmospheric glow halo billboard | M1 | R1 |
| F2 | Anime Night Sky & Stars | Inverted sky dome with GLSL twilight gradient, dynamic twinkling star grid, and cosmic nebula band | M1 | R1 |
| F3 | Distant Tokyo Skyline | Procedural skyscrapers with procedural illuminated window shader and red aviation warning beacons | M1 | R1 |
| F4 | Rooftop Deck & Railing | Procedural 3D concrete rooftop slab, edge parapet, railing posts, and handrails | M1 | R1 |
| F5 | Silhouetted Anime Couple | High-precision vector couple silhouette with moonlight rim lighting and warm city bounce glow | M1 | R1 |
| F6 | Cherry Blossom Framing Trees | Procedural 3D tree trunks with branching splines and cel-shaded sakura blossom clusters | M1 | R1 |
| F7 | Sakura Petal Particle System | Instanced 3D particle system (350 petals) with continuous aerodynamic flutter, wind drift, and boundary recycling | M2 | R2 |
| F8 | Responsive Mouse Parallax | Smooth dampened pointer parallax tilting camera and shifting perspective in real time | M2 | R2 |
| F9 | GSAP ScrollTrigger Camera Plunge | Multi-stage camera dive plunging over the rooftop railing into the sakura stream down to Scene 2 | M3 | R3 |
| F10 | Zero-Glitch Bidirectional Scrub | Deterministic spline trajectory synchronized with scroll progress in both forward and reverse | M3 | R3 |
| F11 | Scene 2 Narrative Story Cards | Poetic romantic cards (3 distinct scenes: Meeting, Promise, Eternal Night) against descending atmosphere | M3 | R4 |
| F12 | Story Card Micro-Interactions | 3D mouse hover tilt (`rotateX/Y`), cursor-tracking radial glare, themed glow, and staggered entrance | M3 | R4 |
| F13 | Procedural Night Breeze Audio | Generative continuous pink/brown noise through a modulated resonant biquad bandpass filter | M4 | R5 |
| F14 | Procedural Melodic Chords | Algorithmic ethereal dual-oscillator synthesizer playing chords/arpeggios with stereo delay | M4 | R5 |
| F15 | Interactive Audio HUD | Glassmorphic sound toggle button with animated 4-bar equalizer and autoplay-safe initialization | M4 | R5 |
| F16 | Responsive UI Overlay | Minimal anime typography, Japanese subtitles, scroll indicator, responsive on desktop and mobile | M4 | R5 |
| F17 | Zero External Assets & Build Quality | 100% procedural assets, zero 404 external asset requests, strict TypeScript and clean Next.js build | M1–M5 | Quality |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Procedural 3D Rooftop Environment | Dynamic Canvas wrapper, anime sky dome shader, moon, city skyline, rooftop deck & railing, couple silhouette, sakura trees (F1–F6) | none | DONE (10 components, 187/187 tests passing, CLEAN audit) |
| M2 | Sakura Particle Physics & Camera Parallax | Instanced 350-petal aerodynamic particle system and dampened mouse parallax camera rig (F7–F8) | M1 | IN_PROGRESS |
| M3 | GSAP ScrollTrigger Plunge & Narrative Cards | Multi-stage scroll camera plunge, bidirectional scrub synchronization, Scene 2 narrative floating cards with 3D tilt & glare (F9–F12) | M2 | PLANNED |
| M4 | Procedural Web Audio Soundscape & UI Overlay | Generative night breeze, algorithmic melodic synth, interactive audio HUD, anime typography & scroll cues (F13–F16) | M3 | PLANNED |
| M5 | Final E2E Test Suite Pass & Adversarial Hardening | Pass 100% of E2E test suite (Tiers 1–4), then adversarial coverage hardening (Tier 5) with Challenger verification (F17) | M1, M2, M3, M4, E2E | PLANNED |

---

## Interface Contracts

### 1. `src/types/scene.ts`
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

export interface StoryCardData {
  id: string;
  jpTitle: string;
  enTitle: string;
  quote: string;
  narrative: string;
  timeCode: string;
  accentColor: string; // e.g. "sakura", "twilight", "amber"
}
```

### 2. `src/lib/audio/SoundEngine.ts`
```ts
export interface ISoundEngine {
  init(): Promise<void>;
  toggle(): boolean;
  isPlaying(): boolean;
  setVolume(vol: number): void;
  destroy(): void;
}
```

### 3. `src/components/canvas/CameraController.tsx` ↔ `ScrollController.tsx`
- `ScrollController` maintains a shared mutable ref `cameraTrajectoryRef: React.MutableRefObject<CameraTrajectoryState>`.
- In GSAP `onUpdate`: updates `cameraTrajectoryRef.current` with interpolated spline values.
- `CameraController` reads `cameraTrajectoryRef.current` during `useFrame`, applies dampened mouse parallax offset, and updates `camera.position` and `camera.lookAt`.

---

## Code Layout
```
src/
├── app/
│   ├── globals.css                # Tailwind CSS v4 styling & keyframe animations
│   ├── layout.tsx                 # Root layout with fonts & metadata
│   └── page.tsx                   # Main landing page mounting Canvas, Narrative, and UI overlays
├── components/
│   ├── canvas/
│   │   ├── RooftopCanvas.tsx      # Dynamic SSR-safe Canvas wrapper
│   │   ├── Scene1Hero.tsx         # Root 3D scene combining all visual elements
│   │   ├── CameraController.tsx   # Camera rig with mouse parallax & scroll trajectory
│   │   ├── AnimeSkyDome.tsx       # Procedural sky dome with GLSL twilight & stars
│   │   ├── AnimeMoon.tsx          # Moon disc with procedural craters & halo glow
│   │   ├── DistantSkyline.tsx     # Procedural Tokyo city skyline with window shader
│   │   ├── RooftopRailing.tsx     # 3D concrete floor slab & metal railing
│   │   ├── CoupleSilhouette.tsx   # Procedural couple silhouette with moonlight rim
│   │   ├── SakuraTrees.tsx        # Procedural 3D cherry blossom trees
│   │   └── SakuraPetals.tsx       # Instanced 350-petal aerodynamic particle system
│   ├── narrative/
│   │   ├── Scene2Narrative.tsx    # Scene 2 section container & floating cards layout
│   │   └── StoryCard.tsx          # Card component with 3D tilt, glare & glow
│   ├── scroll/
│   │   └── ScrollController.tsx   # GSAP ScrollTrigger timeline & scrub synchronization
│   └── ui/
│       ├── HeroOverlay.tsx        # Hero anime typography & Japanese title
│       ├── AudioToggle.tsx        # Glassmorphic audio button with sound wave bars
│       └── ScrollCue.tsx          # Animated scroll down indicator
├── hooks/
│   ├── useMouseParallax.ts        # Smooth normalized pointer tracking hook
│   └── useProceduralAudio.ts      # AudioContext lifecycle and control hook
├── lib/
│   ├── audio/
│   │   └── SoundEngine.ts         # Pure procedural Web Audio synthesis engine
│   └── math/
│       └── splines.ts             # Deterministic cubic Hermite / Bézier camera trajectory
└── types/
    └── scene.ts                   # Core interfaces and types
tests/
└── e2e/                           # End-to-end requirement tests across Tiers 1-4
```
