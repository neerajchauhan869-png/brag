# Survey Report: Scroll Transitions, Narrative Experience & Procedural Audio
**Author**: Explorer Survey 3 (Scroll Transition & Audio Surveyor)  
**Target File**: `C:\Users\neera\koistory\.agents\teamwork\explorer_survey_3\handoff.md`  
**Date**: 2026-10-28T20:55:00Z  

---

## 1. Observation

### 1.1 Environment, Dependencies & Configuration
- **Package Manifest** (`package.json`, lines 11–20):
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
- **GSAP Availability** (`node_modules/gsap`):
  Confirmed that `gsap` contains `ScrollTrigger.js` and `dist/ScrollTrigger.js`. Note that `@gsap/react` is not present, meaning standard GSAP patterns (`gsap.context()` inside `useEffect` or `useLayoutEffect`) must be utilized.
- **Styling Configuration** (`src/app/globals.css`, lines 1–26):
  Uses Tailwind CSS v4 (`@import "tailwindcss";`, `@theme inline { ... }`).
- **Next.js & React Versioning**:
  Next.js 16.4.3 running React 19.3.0. React 19 features strict effect lifecycles where components in development mount, unmount, and remount. Any plugin registration or ScrollTrigger instantiation without explicit teardown (`ctx.revert()`) will produce duplicate triggers and memory leaks.
- **Project Structure**:
  Currently a clean default template in `src/app/page.tsx` and `src/app/layout.tsx`. No audio files or external 3D models exist, matching the requirement that all visuals and soundscapes must be generated procedurally and self-contained.

---

## 2. Logic Chain

### 2.1 R3: GSAP ScrollTrigger Cinematic Scene Transition Architecture

#### The Conflict Between Mouse Parallax (R2) and Scroll Camera Dive (R3)
- *Premise*: R2 requires continuous mouse parallax perspective tilting, while R3 requires a multi-stage scroll plunge from rooftop height into Scene 2.
- *Problem*: If both systems mutate `camera.position` and `camera.rotation` directly within their own event loops, race conditions, stuttering, and coordinate overrides occur.
- *Resolution — Decoupled Camera Rig Architecture*:
  Define a single unified camera controller hook/component in R3F (`CameraController.tsx`).
  1. **Scroll-Driven Base Trajectory**: GSAP ScrollTrigger updates a shared mutable ref/state `camBaseTrack` containing:
     - `posX, posY, posZ`
     - `targetX, targetY, targetZ`
     - `fov`
     - `scrollProgress` (normalized 0.0 to 1.0)
  2. **Dampened Mouse Parallax Layer**: In `useFrame((state, delta) => { ... })`:
     - Mouse offset is smoothly smoothed via `THREE.MathUtils.damp(current, target, lambda, delta)`.
     - Parallax strength is dynamically attenuated as scroll depth increases:
       $$\text{parallaxWeight} = 1.0 - \text{clamp}\left(\frac{\text{progress} - 0.2}{0.4}, 0.0, 0.8\right)$$
       This preserves parallax responsiveness in the hero rooftop view while stabilizing the camera during the high-speed plunge and reading in Scene 2.
  3. **Composite Camera Positioning**:
     $$\vec{P}_{\text{cam}} = \vec{P}_{\text{base}} + \vec{O}_{\text{mouse}} \times \text{parallaxWeight}$$
     $$\vec{T}_{\text{lookAt}} = \vec{T}_{\text{base}} + \vec{O}_{\text{mouse}} \times (0.3 \times \text{parallaxWeight})$$
     `camera.position.copy(camPos);`
     `camera.lookAt(camLookAt);`

#### Multi-Stage Cinematic Trajectory Path
The plunge must feel like an exhilarating leap from the rooftop railing down into an ethereal anime dreamscape:
1. **Phase 1: Rooftop Vantage (`progress: 0.00 -> 0.20`)**:
   - Camera Position: `[0, 2.4, 9.0]`
   - Target LookAt: `[0, 1.9, 0.0]`
   - FOV: `48°`
   - Framing: Rooftop railing at $z \approx 3.0$, couple silhouette at $z \approx 2.8$, luminous moon high at $[0, 14, -40]$, sakura branches framing foreground left/right. Full mouse parallax enabled.
2. **Phase 2: The Plunge / Rooftop Leap (`progress: 0.20 -> 0.70`)**:
   - Camera sweeps forward over the railing and accelerates downward along a smooth 3D curved trajectory:
     * At `0.20`: `[0.0, 2.4, 9.0]`, lookAt `[0.0, 1.9, 0.0]`
     * At `0.35`: `[0.6, 1.2, 5.5]`, lookAt `[0.2, 0.2, 0.0]` (gliding past couple silhouette and over the rail)
     * At `0.50`: `[0.3, -8.0, 4.0]`, lookAt `[0.0, -12.0, 0.0]` (steep downward dive through falling sakura stream; skyline lights rush past)
     * At `0.70`: `[0.0, -18.0, 8.0]`, lookAt `[0.0, -18.0, 0.0]` (leveling off, entering deep midnight indigo space)
   - FOV dynamically expands from `48°` to `58°` during plunge (cinematic speed sensation), then settles back to `50°`.
3. **Phase 3: Scene 2 Narrative Expanse (`progress: 0.70 -> 1.00`)**:
   - Camera Position: `[0, -18.0, 8.0]` with subtle organic breathing drift:
     $$\Delta y = \sin(\text{time} \times 0.6) \times 0.12$$
     $$\Delta x = \cos(\text{time} \times 0.4) \times 0.08$$
   - Target LookAt: `[0, -18.0, 0]`
   - Scene 1 rooftop assets are positioned high above ($y > 15$), naturally occluded from view, while Scene 2 floating memory light particles drift around the viewport.

#### Zero-Glitch Bidirectional Scrub Synchronization
- **Scrub Smoothing**: Use `scrub: 1.0`. Adding 1 second of dampening catches up smoothly with wheel/trackpad ticks, avoiding abrupt frame jumps.
- **Deterministic Pure Function**: The camera position and lookAt vectors are strictly evaluated as deterministic cubic Bézier or piecewise Hermite splines parameterized solely by `progress \in [0, 1]`.
- **Scrub Reversibility**: Because there are no irreversible flags or discrete triggers, scrolling backwards at 5000px/s or 10px/s seamlessly traces the exact inverse path without desynchronization or lag.
- **GSAP Context Lifecycle**:
  ```ts
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(cameraTrack, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: scrollContainerRef.current,
          start: "top top",
          end: "+=300%",
          scrub: 1,
          pin: true,
          onUpdate: (self) => {
            updateCameraTrajectory(self.progress);
          },
        },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);
  ```

---

### 2.2 R4: Scene 2 Narrative Story Cards & Floating Memories

#### DOM-Based Hybrid Architecture vs 3D Mesh Text
- *Evaluation*: Rendering text as 3D meshes or canvas textures inside WebGL causes severe rasterization penalties, accessibility issues, blurry scaling on mobile HiDPI displays, and complex responsive font sizing.
- *Recommended Architecture*: **Decoupled DOM Overlay with 3D CSS Perspectives**.
  - The WebGL `<Canvas>` is rendered in a fixed full-screen background layer (`fixed inset-0 pointer-events-none -z-10`).
  - Narrative story cards are rendered as semantic HTML elements in the scroll container with `pointer-events-auto`, styled with high-performance GPU-accelerated CSS glassmorphism and 3D transforms.

#### Narrative Story Card Specifications (3 Thematic Chapters)
1. **Card 01 — 桜雨 (Blossom Rain / The Encounter)**:
   - *Timestamp / Scene*: `02:14 AM • ROOFTOP VERANDA`
   - *Japanese Lyric*: 「夜桜が風に舞う屋上で、言葉を探す僕らの影が重なった。」
   - *English Poetic Translation*: "Beneath the silver moon, where sakura petals danced on the night breeze, our silhouettes drew close in a silence louder than the sleeping city."
   - *Visual Aura*: Rose-pink glass glow (`border-pink-400/25`, `bg-pink-950/20`, `shadow-[0_8px_32px_0_rgba(244,114,182,0.18)]`).
2. **Card 02 — 街灯り (Constellations Below / The Confession)**:
   - *Timestamp / Scene*: `02:38 AM • SHIBUYA SKYLINE`
   - *Japanese Lyric*: 「見下ろす街の灯りは、地上にこぼれ落ちた星屑の海。」
   - *English Poetic Translation*: "A sea of distant neon constellations stretched to the horizon, yet the only light that mattered was reflected in your eyes."
   - *Visual Aura*: Twilight Indigo/Violet glow (`border-indigo-400/25`, `bg-indigo-950/20`, `shadow-[0_8px_32px_0_rgba(129,140,248,0.18)]`).
3. **Card 03 — 約束 (Before Dawn / Eternal Reverie)**:
   - *Timestamp / Scene*: `03:05 AM • HORIZON DAWN APEX`
   - *Japanese Lyric*: 「夜明けが街を青く染める前に、解けない魔法をかけた。」
   - *English Poetic Translation*: "Before the first blue light of dawn touches the towers, we made a promise that even the passing seasons could never unravel."
   - *Visual Aura*: Moonlight Gold / Luminous Amber glow (`border-amber-300/25`, `bg-amber-950/20`, `shadow-[0_8px_32px_0_rgba(251,191,36,0.18)]`).

#### Micro-Interactions on Story Cards
- **Interactive 3D Hover Depth Tilt**:
  On `pointermove` over the card element:
  $$\text{normX} = \frac{\text{clientX} - \text{rect.left}}{\text{rect.width}} - 0.5$$
  $$\text{normY} = \frac{\text{clientY} - \text{rect.top}}{\text{rect.height}} - 0.5$$
  $$\text{rotateX} = -\text{normY} \times 12^{\circ}, \quad \text{rotateY} = \text{normX} \times 12^{\circ}$$
  Applied via inline style: `transform: perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.025, 1.025, 1.025)`.
- **Dynamic Radial Glare Highlight**:
  A child overlay layer with `radial-gradient(circle 240px at ${cursorX}px ${cursorY}px, rgba(255,255,255,0.18), transparent 70%)` that dynamically illuminates the card surface under the pointer.
- **Staggered Scroll Entrance Animations**:
  Cards enter view with staggered GSAP ScrollTrigger timeline:
  - Initial: `opacity: 0, y: 60, scale: 0.92, filter: "blur(6px)"`
  - Animated to: `opacity: 1, y: 0, scale: 1.0, filter: "blur(0px)"` with `power3.out` easing.
- **Ambient Floating Rhythm**:
  A continuous CSS keyframe bobbing animation (`translateY(-6px)` to `translateY(6px)` over 4.0s infinite alternate ease-in-out) with staggered delays (`0s`, `1.3s`, `2.6s`) so the cards appear buoyantly suspended in the midnight atmosphere.

---

### 2.3 R5: Procedural Web Audio Soundscape & Interactive Controls

#### 100% Procedural Generation (Zero External Audio Files)
To fulfill the requirement that all soundscapes are self-contained without external assets or 404 risks, we design a dual-engine Web Audio graph:

```
[AudioContext]
   │
   ├── Engine 1: Night Breeze Generator
   │      │
   │      ├── WhiteNoiseBufferSource (looped 4s buffer)
   │      │      │
   │      │      ▼
   │      ├── BiquadFilter (Lowpass/Bandpass, Q=2.2) ◄── LFO (0.12 Hz Sine, depth ±260 Hz)
   │      │      │
   │      │      ▼
   │      └── WindGain (gain: 0.07)
   │             │
   │             ▼
   ├── Engine 2: Ethereal Melodic Synth (Anime Pad / Chimes)
   │      │
   │      ├── Voice Scheduler (Algorithmic timer every 3.0s - 4.5s)
   │      │      │
   │      │      ▼
   │      ├── Dual Oscillators (Sine root + Triangle octave overtone)
   │      │      │
   │      │      ▼
   │      ├── ADSR Envelope Gain (Attack: 0.06s, Decay: 1.4s, Release: 2.8s)
   │      │      │
   │      │      ▼
   │      ├── Stereo Delay / Reverb Simulation (L: 320ms, R: 480ms, feedback: 0.35)
   │      │      │
   │      │      ▼
   │      └── ChimeGain (gain: 0.12)
   │             │
   │             ▼
   └── MasterGain (Smooth exponential ramp on mute/unmute: 0.8s) ──► AudioDestination
```

#### Musical Theory & Generative Tuning
- To match the romantic anime tone (inspired by RADWIMPS and Joe Hisaishi night themes), the melodic generator operates in an **E-flat Lydian / Pentatonic** harmonic space:
  - Frequencies:
    * Eb4: 311.13 Hz
    * F4: 349.23 Hz
    * G4: 392.00 Hz
    * Bb4: 466.16 Hz
    * C5: 523.25 Hz
    * D5: 587.33 Hz
    * Eb5: 622.25 Hz
- Every 3.5 seconds, the generative scheduler triggers a gentle arpeggiated pair of notes with soft randomized velocity, creating an organic, non-monotonous, deeply emotional lullaby.

#### Browser Autoplay Policy Compliance
- `AudioContext` is only instantiated or resumed upon an explicit user gesture (clicking the Audio Toggle button in the HUD).
- If unmuted, `audioCtx.resume()` is called.
- State is preserved reactively (`isAudioActive`, `isMuted`).
- Muting triggers `masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.15)` which smoothly fades the audio to zero without clicking or popping.

#### UI Overlay & Responsive Design
- **Top HUD**:
  - Left: Minimal Japanese logo typography:
    - Main: `恋の夜` (`KOI NO YORU`) in refined serif/sans hybrid with subtle letter spacing.
    - Subtitle: `A TOKYO ROOFTOP REVERIE • 35.6586° N, 139.7454° E`.
  - Right: Interactive Audio Control Pill:
    - 4-bar equalizer sound wave animation (`animate-sound-bar-1` through `animate-sound-bar-4`) with variable height transitions.
    - Toggle text: `SOUND: ON / OFF` with indicator LED dot (pink glow when active).
- **Scene 1 Bottom Hero Indicator**:
  - Japanese caption: `スクロールして記憶へ潜る` ("Scroll to plunge into memories").
  - Animated pulsing downward pill with gliding mouse dot.
  - Automatically fades out when scroll progress exceeds 0.05.
- **Responsiveness**:
  - Desktop (1920x1080): Generous padding (`px-12 py-8`), wide narrative cards (`max-w-xl`), staggered asymmetrical layout, deep 3D perspective hover tilt.
  - Mobile (390x844): Compact HUD (`px-4 py-3`), full-width narrative cards (`max-w-sm w-full mx-auto`), touch tap states (`active:scale-95`), responsive typography (`text-xs` badges, `text-sm` Japanese text, `text-base` English prose). Minimum tap target size $\ge 44 \times 44\text{px}$.

---

## 3. Caveats

1. **WebGL Context Loss & Battery Optimization**:
   Running a full-screen WebGL canvas with continuous particle animation and post-processing can consume battery on mobile devices. Recommendation: pause `useFrame` or clamp delta when the document is hidden (`document.hidden` event).
2. **Web Audio Tab Suspension**:
   Browsers throttle `setInterval` and suspend `AudioContext` when a tab becomes inactive. The audio engine must listen to `visibilitychange` to pause or resume gracefully without accumulation of queued notes.
3. **ScrollTrigger Pinning on Mobile Safari**:
   Mobile Safari's dynamic address bar resizing can trigger unexpected `resize` events. GSAP's `ScrollTrigger.normalizeScroll(true)` or using fixed viewport height calculations (`100svh`) prevents layout jumpiness.
4. **Font Loading Race Conditions**:
   If custom Google Fonts load after ScrollTrigger calculates scroll heights, trigger points might become slightly offset. Calling `ScrollTrigger.refresh()` upon font readiness (`document.fonts.ready.then(...)`) guarantees exact coordinate alignment.

---

## 4. Conclusion

- **R3 (GSAP Scroll Transition)**: Achievable with zero jitter by decoupling camera track coordinates from mouse parallax. The camera plunge follows a dramatic 3-phase path ($y: 2.4 \to -18.0$, FOV surge from $48^\circ \to 58^\circ \to 50^\circ$) driven by a master GSAP timeline scrubbed bidirectionally with `scrub: 1.0`.
- **R4 (Scene 2 Narrative Cards)**: Best implemented as a hybrid DOM overlay over the fixed 3D canvas. Features 3 distinct emotional story cards with 3D mouse tilt, cursor-following specular glare, staggered GSAP entrance animations, and full mobile touch responsiveness.
- **R5 (Procedural Audio & UI Overlay)**: Can be implemented 100% procedurally with zero external asset dependencies using a dual-graph Web Audio API architecture (filtered pink/brown noise wind generator + algorithmic pentatonic music box synthesizer). Strict autoplay compliance is maintained with an animated 4-bar sound wave toggle button and minimal anime HUD typography.

---

## 5. Verification Method

### 5.1 Independent Code & Build Verification
1. **Build Integrity Command**:
   ```powershell
   npm run build
   ```
   *Expected outcome*: Exit code 0, zero TypeScript errors, clean production bundle generated in `.next`.
2. **Lint & Type Check**:
   ```powershell
   npm run lint
   ```
   *Expected outcome*: Zero ESLint warnings or errors.

### 5.2 Runtime Behavior Verification
1. **Scroll Plunge Test**:
   - Scroll down through the page: Observe the camera smoothly dive over the rooftop railing and plunge through falling petals down to Scene 2.
   - Rapidly scroll back up: Observe the camera smoothly and deterministically return to the exact rooftop framing with zero glitching or desynchronization.
2. **Narrative Cards Micro-Interactions**:
   - Hover over each of the 3 story cards on desktop: Observe responsive 3D perspective rotation and dynamic radial glow reflection tracking the cursor.
   - Test on mobile viewport (390x844): Verify cards stack cleanly, text is legible, and touch tap interactions function properly.
3. **Web Audio Soundscape & Autoplay**:
   - Verify that page loads silently without console warnings regarding autoplay violation.
   - Click the "AUDIO: OFF" button: Verify that audio starts smoothly, sound wave animation bars begin oscillating, realistic gentle wind breeze is audible, and delicate harmonic chords play every 3–4 seconds.
   - Click again to mute: Verify sound fades out smoothly without audible clicks or pops.
