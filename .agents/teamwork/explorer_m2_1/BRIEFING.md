# BRIEFING — 2026-10-28T21:24:00Z

## Mission
Investigate and design complete implementation specifications for src/components/canvas/SakuraPetals.tsx (350+ InstancedMesh petals, procedural curved 3D petal geometry, aerodynamic physics, recycling box, zero-GC TypedArray layout, cel-shaded double-sided material).

## 🔒 My Identity
- Archetype: Explorer
- Roles: Investigator, Synthesizer
- Working directory: C:\Users\neera\koistory\.agents\teamwork\explorer_m2_1
- Original parent: d80f9389-97b3-4a4a-bee5-43759932ed36
- Milestone: M2 - Sakura Petal Physics & Aesthetics

## 🔒 Key Constraints
- Read-only investigation — do NOT implement directly in source tree
- Output detailed specifications and code proposals in handoff report
- Follow Next.js and Three.js / React Three Fiber / Drei conventions

## Current Parent
- Conversation ID: d80f9389-97b3-4a4a-bee5-43759932ed36
- Updated: 2026-10-28T21:19:03Z

## Investigation State
- **Explored paths**:
  - ORIGINAL_REQUEST.md (R1, R2, acceptance criteria)
  - PROJECT.md (Architecture, F7 specs, code layout)
  - TEST_READY.md (4-tier test architecture, 187 tests)
  - explorer_survey_2/handoff.md (Physics equations, rendering pipeline)
  - tests/e2e/tier1_features.test.mjs (F7.1 to F7.5 specifications)
  - tests/e2e/tier2_boundaries.test.mjs (F7.B1 to F7.B5 boundaries)
  - tests/e2e/tier3_combinations.test.mjs (C3 viewport bounds, C10 tree canopy envelopes)
  - tests/e2e/tier4_realworld.test.mjs (Scenario 2 mobile, Scenario 4 rapid scrub stress test)
  - src/components/canvas/Scene1Hero.tsx, SakuraTrees.tsx, RooftopCanvasInner.tsx, SceneLighting.tsx
- **Key findings**:
  1. InstancedMesh single draw call for 350 instances, memory-bounded (50-1000 scaling).
  2. Custom 3D petal geometry: length 0.22m, width 0.12m, V-cup curvature 0.035m, apical notch indent, and explicit vertex normals.
  3. Non-linear aerodynamic physics: terminal fall velocity (0.85-1.30 m/s), von Kármán lift flutter (2.6-4.4 Hz), wind gusts + atmospheric vertical shear, and 3-axis rotational tumbling.
  4. Spatial boundary recycling volume spanning y in [-21.0, 12.0], x in [-9.5, 9.5], z in [-14.0, 9.0] to support both Hero framing and GSAP plunge dive into Scene 2.
  5. Flat TypedArray memory layout (22KB L1 cache footprint) + pre-allocated scratch objects for zero GC in useFrame; delta time clamped [0.001, 0.1]s.
  6. Double-sided anime cel-shaded MeshToonMaterial with 4-tone palette and per-instance color variation.
  7. InstancedMesh must have `frustumCulled={false}` to prevent premature culling during camera dive.
- **Unexplored areas**: None for M2-1 scope.

## Key Decisions Made
- Designed complete parametric geometry generator `createSakuraPetalGeometry()` with V-cup transverse curl and apical notch.
- Created `proposed_SakuraPetals.tsx` in `.agents/teamwork/explorer_m2_1/`.
- Designed interface contract additions for `src/types/scene.ts` (`SakuraPetalsProps`).

## Artifact Index
- DISPATCH.md — Incoming mission instructions
- BRIEFING.md — Situational awareness
- progress.md — Liveness heartbeat
- proposed_SakuraPetals.tsx — Reference implementation code
- handoff.md — Complete 5-component handoff report
