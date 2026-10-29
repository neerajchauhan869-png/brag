# BRIEFING — 2026-10-28T21:26:00Z

## Mission
Investigate and design complete implementation specifications for pointer tracking parallax hook, unified CameraController rig, camera tilt/yaw limits, aspect ratio compensation, and smooth lookAt target blending / scroll attenuation hooks.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: C:\Users\neera\koistory\.agents\teamwork\explorer_m2_2\
- Original parent: d80f9389-97b3-4a4a-bee5-43759932ed36
- Milestone: M2-2 (Camera Parallax Explorer)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement in src/
- Specifications must be complete, precise, verified with existing codebase contracts
- File workspace discipline: write only to .agents/teamwork/explorer_m2_2/

## Current Parent
- Conversation ID: d80f9389-97b3-4a4a-bee5-43759932ed36
- Updated: 2026-10-28T21:26:00Z

## Investigation State
- **Explored paths**:
  - `ORIGINAL_REQUEST.md`, `PROJECT.md`, `TEST_READY.md`
  - `.agents/teamwork/explorer_survey_3/handoff.md`
  - `src/types/scene.ts`, `src/components/canvas/RooftopCanvas.tsx`, `src/components/canvas/RooftopCanvasInner.tsx`, `src/components/canvas/Scene1Hero.tsx`
  - `tests/e2e/runner.mjs`, `tests/e2e/tier1_features.test.mjs`, `tests/e2e/tier2_boundaries.test.mjs`, `tests/e2e/tier3_combinations.test.mjs`, `tests/e2e/tier4_realworld.test.mjs`
- **Key findings**:
  - Full test suite passes (187/187 tests).
  - Exact formulas and bounds reverse-engineered:
    - Pointer mapping: `[-1, 1]` with zero-dimension guard and edge clamp.
    - Damping: `THREE.MathUtils.damp(current, target, lambda, dt)` with `lambda = 4.0`, delta clamped to `0.1s`.
    - Camera shift: `maxShiftX = 0.8`, `maxShiftY = 0.5`.
    - Parallax scroll attenuation: `weight = 1.0 - min(0.8, max(0.0, (progress - 0.2) / 0.4) * 0.8)` (1.0 at hero -> 0.2 in Scene 2).
    - LookAt tracking ratio: `0.3` of position offset.
    - Camera tilt/yaw bounds: pitch max `0.15 rad` (~8.6°), yaw max `0.25 rad` (~14.3°).
    - Aspect ratio compensation: dynamic FOV within `[40°, 65°]` (F5.B4 constraint), FOV expands during plunge (48° -> 58° -> 50°).
    - Canvas `pointer-events: none` necessitates window-level `pointermove`/`pointerleave` listeners in `useMouseParallax`.
    - Scene 2 subtle breathing drift: `dx = cos(0.4*t)*0.08`, `dy = sin(0.6*t)*0.12` when $p \ge 0.7$.
- **Unexplored areas**:
  - None within M2 scope.

## Key Decisions Made
- Implemented `useMouseParallax` using mutable refs to decouple 60/120/240Hz pointer movement from React component re-rendering.
- Designed `CameraController` as a self-contained R3F component supporting both standalone M2 execution (default hero trajectory) and M3 GSAP scrub integration (`trajectoryRef`).
- Formulated deterministic trajectory spline math in `src/lib/math/splines.ts` guaranteeing C1 continuity and bidirectional scrub reversibility.

## Artifact Index
- `DISPATCH.md` — Incoming dispatch instructions
- `BRIEFING.md` — Persistent working memory and state tracking
- `progress.md` — Liveness heartbeat and milestone checklist
- `handoff.md` — Comprehensive 5-component handoff report
