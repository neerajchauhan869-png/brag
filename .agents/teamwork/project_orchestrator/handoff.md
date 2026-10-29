# Orchestrator Soft Handoff (Generation 1 to Generation 2)

## Milestone State
| Milestone | Name | Status | Key Outputs / Evidence |
|-----------|------|--------|------------------------|
| M1 | Procedural 3D Rooftop Environment | **DONE** | 10 components in `src/components/canvas/`, 187/187 E2E tests passing, CLEAN forensic audit |
| M2 | Sakura Particle Physics & Camera Parallax | **READY FOR WORKER** | Specifications complete from Explorer M2-1, M2-2, and Spec Miner M2-3 |
| M3 | GSAP ScrollTrigger Plunge & Narrative Cards | **PLANNED** | Survey blueprints complete in Explorer Survey 3 handoff |
| M4 | Procedural Web Audio Soundscape & UI Overlay | **PLANNED** | Survey blueprints complete in Explorer Survey 3 handoff |
| M5 | Final E2E Test Suite Pass & Adversarial Hardening | **PLANNED** | 187 automated E2E tests active in `tests/e2e/runner.mjs` |

---

## 1. Observation
- **User Request & Requirements**: Recorded verbatim in `C:\Users\neera\koistory\ORIGINAL_REQUEST.md`.
- **Project Scope Document**: `C:\Users\neera\koistory\PROJECT.md` documents architecture, 17-feature inventory, 5 milestones, interface contracts, and code layout.
- **Dual-Track E2E Test Suite**: `C:\Users\neera\koistory\TEST_READY.md` published. 187 tests across 4 tiers in `tests/e2e/runner.mjs`. All 187 currently pass (100% pass rate).
- **Milestone 1 Completed**:
  - `src/types/scene.ts`: Core data structures and interface contracts.
  - `src/components/canvas/RooftopCanvas.tsx` & `RooftopCanvasInner.tsx`: SSR-safe client-only Three.js dynamic canvas wrapper using `useSyncExternalStore`.
  - `src/components/canvas/SceneLighting.tsx`: Three-point cinematic lighting.
  - `src/components/canvas/AnimeSkyDome.tsx`: Procedural GLSL twilight gradient, star grid with 4-point cross diffraction spikes, and cosmic nebula.
  - `src/components/canvas/AnimeMoon.tsx`: Domain-warped FBM crater disc with Tycho ejecta rays and additive cyan/lavender halo billboard.
  - `src/components/canvas/DistantSkyline.tsx`: 120 procedural skyscrapers in 1 InstancedMesh draw call with window grid shader, antenna spires, and pulsing ICAO red warning beacons.
  - `src/components/canvas/RooftopRailing.tsx`: Concrete floor slab, parapet curb wall, side returns, steel stanchions, Japanese-code 1.30m handrail, and balusters.
  - `src/components/canvas/CoupleSilhouette.tsx`: 1024x1024 HTML5 Canvas 2D vector anime couple with moonlight rim glow and warm city bounce up-light gradient.
  - `src/components/canvas/SakuraTrees.tsx`: 3D CatmullRom spline trunks, 28 vertex-displaced blossom clumps, and 4-tone anime cel-shaded MeshToonMaterial via procedural DataTexture.
  - `src/components/canvas/Scene1Hero.tsx`: Assembled hero scene.
  - `src/app/page.tsx`: Mounted canvas with anime hero overlay.
- **Milestone 1 Gate Verification Passed**:
  - Reviewer 1: APPROVE
  - Reviewer 2: APPROVE
  - Challenger 1: APPROVE
  - Challenger 2: APPROVE
  - Forensic Auditor: CLEAN (zero external models, zero cheating, authentic procedural math)
  - `GATE_STATUS.md` marked **PASS**.
- **Milestone 2 Exploration Completed**:
  - Explorer M2-1 (`explorer_m2_1/handoff.md` and `proposed_SakuraPetals.tsx`): 350-petal InstancedMesh, V-cup curved petal geometry, aerodynamic physics (flutter, lift, wind drift, tumble), boundary box recycling, flat typed arrays, zero GC in `useFrame`.
  - Explorer M2-2 (`explorer_m2_2/handoff.md`): `useMouseParallax.ts` (normalized pointer tracking, `MathUtils.damp`, mutable ref architecture), `CameraController.tsx` (unified rig, `CameraTrajectoryState` contract, lookAt factor 0.3, tilt/yaw limits, aspect ratio compensation).
  - Spec Miner M2-3 (`spec_miner_m2_3/handoff.md`): Integration hierarchy, depth sorting (`alphaTest: 0.05`, `depthWrite: true`), mobile portrait/ultrawide edge cases, zero-GC memory budget.

---

## 2. Logic Chain & Architecture
1. **Decoupled Camera Rig**: Mouse parallax is layered on top of scroll base trajectory via `P_cam = P_base + O_mouse * parallaxWeight`, avoiding race conditions between cursor movement and GSAP scroll plunging.
2. **Deterministic Splines**: Camera movement and scene transitions rely on deterministic pure functions tied to normalized progress `p in [0, 1]` ensuring zero-glitch bidirectional scrubbing.
3. **Pure Procedural Asset Rule**: ZERO external 3D models (`.glb`, `.gltf`, `.obj`) or external textures. All visuals generated via Three.js primitives, custom GLSL shaders, procedural Canvas 2D textures, and procedural DataTextures.
4. **Strict Audit Gating**: Forensic Auditor holds binary veto. Every milestone must pass Reviewers, Challengers, and Forensic Auditor before advancing.

---

## 3. Caveats & Hard Constraints
- **Next.js 16 & React 19**: `dynamic(..., { ssr: false })` MUST be inside a client component boundary. Never call `setState` synchronously in `useEffect` (use `useSyncExternalStore` for client hydration guards).
- **Subagent Reuse Prohibited**: Never reuse a subagent conversation ID after it delivered its handoff. Always spawn fresh agents.
- **File Boundaries**: Workers must only touch their assigned exclusive files.

---

## 4. Concrete Next Steps for Successor (Remaining Work)
1. **Milestone 2 Implementation (Worker M2)**:
   - Spawn Worker M2 (`teamwork_preview_worker`) with exclusive write ownership of:
     * `src/hooks/useMouseParallax.ts`
     * `src/components/canvas/CameraController.tsx`
     * `src/components/canvas/SakuraPetals.tsx`
     * `src/components/canvas/Scene1Hero.tsx` (wire in `CameraController` and `SakuraPetals`)
   - Arm Worker M2 with handoffs from `explorer_m2_1`, `explorer_m2_2`, and `spec_miner_m2_3`.
   - Require `npx tsc --noEmit` and `npm run build` verification.
2. **Milestone 2 Gate Verification**:
   - Spawn 2 Reviewers, 2 Challengers, and 1 Forensic Auditor (`teamwork_preview_auditor`).
   - If all APPROVE and Auditor is CLEAN, update `GATE_STATUS.md` to PASS and mark M2 DONE in `PROJECT.md`.
3. **Milestone 3 Execution (GSAP ScrollTrigger Plunge & Narrative Cards — F9–F12)**:
   - Run Explorer -> Worker -> Reviewer/Challenger/Auditor cycle.
   - Implement `src/lib/math/splines.ts`, `src/components/scroll/ScrollController.tsx`, `src/components/narrative/Scene2Narrative.tsx`, `src/components/narrative/StoryCard.tsx`.
4. **Milestone 4 Execution (Procedural Web Audio Soundscape & UI Overlay — F13–F16)**:
   - Run Explorer -> Worker -> Reviewer/Challenger/Auditor cycle.
   - Implement `src/lib/audio/SoundEngine.ts`, `src/hooks/useProceduralAudio.ts`, `src/components/ui/AudioToggle.tsx`, `src/components/ui/HeroOverlay.tsx`, `src/components/ui/ScrollCue.tsx`.
5. **Milestone 5 Execution (Dual-Track Final Verification — F17)**:
   - Phase 1: Verify 100% of E2E test suite (`node tests/e2e/runner.mjs`).
   - Phase 2: Adversarial coverage hardening with Challengers.
   - Report final completion to parent agent `b6bdf7ed-e0aa-4d4b-894f-f69fdaa09a7f`.

---

## 5. Key Artifact Paths
- `C:\Users\neera\koistory\ORIGINAL_REQUEST.md` — Verbatim user request
- `C:\Users\neera\koistory\PROJECT.md` — Master architecture, feature inventory, milestones, contracts
- `C:\Users\neera\koistory\TEST_INFRA.md` — E2E test architecture
- `C:\Users\neera\koistory\TEST_READY.md` — Published E2E test suite (187 tests)
- `C:\Users\neera\koistory\.agents\teamwork\project_orchestrator\GATE_STATUS.md` — Gate status tracker
- `C:\Users\neera\koistory\.agents\teamwork\project_orchestrator\BRIEFING.md` — Persistent briefing memory
- `C:\Users\neera\koistory\.agents\teamwork\project_orchestrator\progress.md` — Progress tracker
- Subagent handoffs:
  * `C:\Users\neera\koistory\.agents\teamwork\explorer_survey_1\handoff.md`
  * `C:\Users\neera\koistory\.agents\teamwork\explorer_survey_2\handoff.md`
  * `C:\Users\neera\koistory\.agents\teamwork\explorer_survey_3\handoff.md`
  * `C:\Users\neera\koistory\.agents\teamwork\test_writer_e2e\handoff.md`
  * `C:\Users\neera\koistory\.agents\teamwork\worker_m1\handoff.md`
  * `C:\Users\neera\koistory\.agents\teamwork\auditor_m1_1\handoff.md`
  * `C:\Users\neera\koistory\.agents\teamwork\explorer_m2_1\handoff.md`
  * `C:\Users\neera\koistory\.agents\teamwork\explorer_m2_2\handoff.md`
  * `C:\Users\neera\koistory\.agents\teamwork\spec_miner_m2_3\handoff.md`
