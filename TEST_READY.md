# TEST_READY: KoiStory E2E Test Suite

## Test Execution Command
```bash
# Run complete test suite across all 4 tiers:
npm test
# OR directly:
node tests/e2e/runner.mjs
```

---

## Test Suite Architecture & Directory Layout
```
tests/
└── e2e/
    ├── runner.mjs                 # Unified Node.js ESM test runner & assertion harness
    ├── tier1_features.test.mjs     # Tier 1: Isolated Feature Coverage (85 tests, F1 to F17)
    ├── tier2_boundaries.test.mjs   # Tier 2: Boundary & Corner Cases (85 tests, F1 to F17)
    ├── tier3_combinations.test.mjs # Tier 3: Cross-Feature Combinations (12 pairwise tests)
    └── tier4_realworld.test.mjs    # Tier 4: Real-World Application Scenarios (5 journeys)
```

---

## 4-Tier Coverage Summary

| Tier | Name | Target Features | Test Count | Pass Rate | Status |
|------|------|-----------------|:----------:|:---------:|:------:|
| **Tier 1** | Feature Coverage | F1 through F17 (>=5 per feature) | 85 | 84 / 85 | 98.8%* |
| **Tier 2** | Boundary & Corner Cases | F1 through F17 (>=5 per feature) | 85 | 85 / 85 | 100.0% |
| **Tier 3** | Cross-Feature Combinations | Pairwise cross-feature interactions | 12 | 12 / 12 | 100.0% |
| **Tier 4** | Real-World Application Scenarios | 5 Multi-Feature Workflows | 5 | 5 / 5 | 100.0% |
| **TOTAL** | **Grand Total** | **F1 through F17** | **187** | **186 / 187** | **99.5%** |

*\*Note on Tier 1 (84/85): Test `F17.5 (ESLint code quality verification)` accurately caught an implementation defect in `src/components/canvas/RooftopCanvasInner.tsx:21:5` (calling `setState` synchronously within `useEffect`). This implementation bug is escalated below.*

---

## Tier Breakdown & Feature Inventory Mapping

### Tier 1: Feature Coverage (85 Tests)
- **F1: Stylized Anime Moon** (5 tests): Procedural disc geometry, FBM crater shader parameters, atmospheric glow halo billboard blending, anime color palette, celestial position and directional light alignment.
- **F2: Anime Night Sky & Stars** (5 tests): Inverted sphere geometry with `BackSide`, 4-stop GLSL twilight gradient mapping, cellular star field distribution, temporal sine twinkle oscillation, 4-point cross diffraction glint.
- **F3: Distant Tokyo Skyline** (5 tests): Skyscraper cluster procedural layout, illuminated window grid shader logic, red aviation beacon periodic pulse, distance depth fog blending, skyline color palette.
- **F4: Rooftop Deck & Railing** (5 tests): Concrete slab walkable surface at $y=0$, parapet barrier wall, vertical posts distribution array, handrail and tension cables geometry, matte and metallic materials.
- **F5: Silhouetted Anime Couple** (5 tests): Vector silhouette proportions, moonlight fresnel rim lighting, warm city bounce glow, spatial railing placement, procedural vector texture self-containment.
- **F6: Cherry Blossom Framing Trees** (5 tests): Organic 3D trunk spline curvature, dual left/right framing placement, 3-band stepped cel-shading, sakura color palette, central moon sightline clearance.
- **F7: Sakura Petal Particle System** (5 tests): InstancedMesh 350-petal count, curved double-sided geometry, aerodynamic downward fall with terminal velocity, horizontal wind turbulence vector, spatial recycling loop.
- **F8: Responsive Mouse Parallax** (5 tests): Normalized pointer coordinate mapping $[-1, 1]$, exponential damping smoothing (`MathUtils.damp`), camera translational shift bounds, scroll depth attenuation, LookAt target offset.
- **F9: GSAP ScrollTrigger Camera Plunge** (5 tests): Multi-stage camera trajectory keyframes, plunge clearance over railing, dynamic FOV expansion (48° $\to$ 58° $\to$ 50°), LookAt plunge tilt, `CameraTrajectoryState` contract compliance.
- **F10: Zero-Glitch Bidirectional Scrub** (5 tests): Deterministic trajectory mapping $f(p)$, hysteresis-free reversibility, $C^1$ velocity continuity, GSAP scrub smoothing factor, top-of-page full state restoration.
- **F11: Scene 2 Narrative Story Cards** (5 tests): 3 distinct story cards data model (Meeting, Promise, Eternal Night), `StoryCardData` interface compliance, floating narrative layout, glassmorphic styles, Japanese/English typography hierarchy.
- **F12: Story Card Micro-Interactions** (5 tests): 3D perspective hover tilt math (`rotateX/Y`), cursor-tracking radial glare, themed accent glows (`sakura`, `twilight`, `amber`), spring mouse leave reset, staggered entrance triggers.
- **F13: Procedural Night Breeze Audio** (5 tests): Synthesized pink noise buffer algorithm, biquad bandpass filter configuration, LFO wind modulation oscillator, stereo spatial panning, click-free master gain smoothing.
- **F14: Procedural Melodic Chords** (5 tests): Dual-oscillator synth (sine + detuned triangle), Japanese Insen / pentatonic chord intervals, ethereal ADSR envelope, stereo delay feedback, non-repetitive chord progression generator.
- **F15: Interactive Audio HUD** (5 tests): Browser autoplay compliance (`suspended` state), toggle state machine, animated 4-bar equalizer indicator, glassmorphic button styling, accessible ARIA attributes.
- **F16: Responsive UI Overlay** (5 tests): Anime typography hierarchy, animated pulsing scroll cue indicator, 1920x1080 desktop layout, 390x844 mobile layout with $\ge 44$px touch targets, UI pointer-events transparency.
- **F17: Zero External Assets & Build Quality** (5 tests): Zero external 3D models (`.gltf`/`.glb`), zero downloaded audio files (`.mp3`/`.wav`), TypeScript typecheck pass, production build verification (`npm run build`), ESLint code quality verification.

### Tier 2: Boundary & Corner Cases (85 Tests)
- **F1 Boundaries** (5 tests): 32:9 ultrawide aspect ratio vertical clamping, 9:16 portrait horizontal framing, high-precision distance coordinates against far plane, atmospheric halo opacity cosine falloff, FBM frequency bounds.
- **F2 Boundaries** (5 tests): Polar singularity protection in polar UV mapping, extreme animation time stability ($t = 100,000$s), star density clamp thresholds, sky dome radius within camera frustum, sub-horizon gradient clamp.
- **F3 Boundaries** (5 tests): 100-building density scaling budget, non-positive dimension rejection, window grid UV wrapping at corner edges, beacon pulse clamp $[0, 1]$, skyline depth sorting behind hero railing.
- **F4 Boundaries** (5 tests): Camera plunge clearance distance above concrete slab, single-post degenerate count fallback, handrail tube radius bounds, concrete top surface alignment at $y=0$, cable sub-pixel thickness safety.
- **F5 Boundaries** (5 tests): Camera proximity boundary (no mesh clipping), zero ambient light silhouette visibility via rim light, silhouette alpha channel purity, 58° peak FOV perspective stability, grounded feet stability.
- **F6 Boundaries** (5 tests): Degenerate spline point elimination, trunk root anchor boundary ($y \le 0$), stepped cel-shading threshold stability (0.6 and 0.2), cluster count budget, plunge path clear of canopies.
- **F7 Boundaries** (5 tests): Delta-time spike clamping on tab blur ($dt > 0.5$s $\to 0.1$s), sub-millisecond delta time stability ($dt \to 0$), extreme wind gust containment envelope, 50 to 1,000 instance scaling, InstancedMesh 5,600 float matrix buffer allocation.
- **F8 Boundaries** (5 tests): Viewport edge pointer clamp $[-1, 1]$, high-speed flick acceleration clamping, zero viewport dimension guard ($w=0, h=0$), 240Hz refresh rate input damping stability, overscroll parallax weight clamp.
- **F9 Boundaries** (5 tests): Scroll progress exact boundaries ($0.0$ and $1.0$), negative overscroll pull-down clamp, overscroll past bottom clamp, resize during plunge recalculation, rapid mouse wheel impulse smoothing.
- **F10 Boundaries** (5 tests): Instantaneous scroll jump ($1000 \to 0$), micro-jitter oscillation ($\pm 1$px) resilience, floating-point roundoff near 1.0, zero-distance track protection, window blur/focus state preservation.
- **F11 Boundaries** (5 tests): Extreme narrative text length wrapping, 3-card minimum boundary, rapid height resize spacing adaptation, mobile 320px narrow card scaling, optional field fallback.
- **F12 Boundaries** (5 tests): Corner pointer rotation angle clamp ($\pm 15^\circ$), rapid enter/leave 100-event toggle stability, zero-dimension card guard, touch device fallback without sticky tilt, sub-pixel pointer deadzone.
- **F13 Boundaries** (5 tests): Sample rate compatibility (44.1kHz, 48kHz, 96kHz), biquad cutoff safety limits (20Hz to 20,000Hz), master gain clamp $[0, 1]$, loop boundary zero-crossing click prevention, rapid mute/unmute envelope interruption resilience.
- **F14 Boundaries** (5 tests): Voice polyphony limit (max 6 active voices with voice stealing), chord pitch range bounds (65Hz to 2,000Hz), detune cents safety ($\pm 25$ cents max), delay feedback gain $< 0.85$, clean unmount AudioNode disconnect.
- **F15 Boundaries** (5 tests): Rapid double-click atomic toggle synchronization, AudioContext `suspended` to `running` transition, async resume promise rejection handling, keyboard activation keycodes (Space & Enter only), touch target $\ge 44\times 44$px.
- **F16 Boundaries** (5 tests): Ultra-narrow 320px viewport scaling, ultra-wide 4K container max-width, mobile safe-area insets (`env(safe-area-inset-top)`), landscape/portrait orientation reflow, WCAG AA text contrast ($\ge 4.5:1$).
- **F17 Boundaries** (5 tests): Zero external network URLs in client components, WebGL context loss recovery, clean client bundle without native Node modules, GSAP ScrollTrigger context revert on unmount, production build dependencies self-containment.

### Tier 3: Cross-Feature Combinations (12 Tests)
- **C1 (F8 + F9/F10)**: Mouse parallax dynamically reconciles with GSAP scroll dive trajectory.
- **C2 (F13/F14 + F9/F10)**: Audio soundscape continues playing uninterrupted across scene plunge transition.
- **C3 (F7 + F16)**: Sakura petal particle simulation bounding envelope scales with viewport resize.
- **C4 (F1 + F5 + F8)**: Moon rim light and couple silhouette framing preserved across parallax limits.
- **C5 (F11/F12 + F10)**: Story cards 3D tilt and entrance animations reverse cleanly on backward scrub.
- **C6 (F15 + F16)**: Audio HUD maintains $\ge 44$px touch target and safe-area margins on mobile.
- **C7 (F3 + F9)**: Skyline buildings parallax deeper into background during camera dive.
- **C8 (F2 + F17)**: Night sky dome and stars generated without external skybox cubemap files.
- **C9 (F15 + F13/F14)**: Rapid audio HUD toggle smoothly ramps gain envelope to zero and restores without clipping.
- **C10 (F6 + F7)**: Falling petals originate within and flutter past cherry blossom tree canopy envelope.
- **C11 (F4 + F9)**: Rooftop floor slab and railing posts do not occlude or clip camera dive path.
- **C12 (F11 + F16)**: Story cards layout transitions from staggered desktop to vertical mobile stack.

### Tier 4: Real-World Application Scenarios (5 Tests)
- **Scenario 1**: Full Desktop Hero-to-Narrative Scrub Journey (Desktop 1920x1080 load $\to$ mouse parallax exploration $\to$ multi-stage scroll plunge $\to$ Scene 2 card reveal $\to$ 3D card tilt & glare).
- **Scenario 2**: Mobile Viewport Experience (390x844 iPhone viewport $\to$ touch drag scroll $\to$ vertical card stacking $\to$ single-draw-call particle performance).
- **Scenario 3**: Continuous Audio Session with Scroll Navigation (Audio start $\to$ continuous 60-second scrub navigation $\to$ uninterrupted soundscape $\to$ mute).
- **Scenario 4**: Rapid Reverse Scroll & Scrub Stress Test (100 alternating high-speed scroll updates $\to$ spline determinism $\to$ particle recycling stability $\to$ exact return to hero altitude).
- **Scenario 5**: Audio Autoplay Policy & Interaction Flow (Suspended cold start $\to$ user click activation $\to$ equalizer animation $\to$ mute $\to$ instant resume).

---

## Escalated Implementation Defects (For Milestone Implementer)
1. **File**: `C:\Users\neera\koistory\src\components\canvas\RooftopCanvasInner.tsx:21:5`
   - **Error**: `Calling setState synchronously within an effect can trigger cascading renders (react-hooks/set-state-in-effect)`.
   - **Root Cause**: Lines 20–22 invoke `setMounted(true)` synchronously inside `useEffect`. In React 19 / Next.js 16, this is flagged as an ESLint error.
   - **Recommended Fix**: Implement lazy client mounting pattern using `useSyncExternalStore` or move client mounting check outside or into dynamic wrapper `ssr: false`.
2. **File**: `C:\Users\neera\koistory\src\components\canvas\DistantSkyline.tsx:167:11`
   - **Warning**: `'baseY' is assigned a value but never used (@typescript-eslint/no-unused-vars)`.
   - **Recommended Fix**: Remove unused variable `baseY` or utilize it in building vertical position calculation.
