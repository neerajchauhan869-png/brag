# BRIEFING — 2026-10-28T21:23:30Z

## Mission
Investigate and design integration specifications and edge cases for Milestone 2 (SakuraPetals & CameraController into Scene1Hero, depth sorting, viewport edge cases, and performance budget).

## 🔒 My Identity
- Archetype: Specification Miner
- Roles: External domain expert / Teamwork specialist (Integration & Edge Cases Spec Miner)
- Working directory: C:\Users\neera\koistory\.agents\teamwork\spec_miner_m2_3
- Original parent: d80f9389-97b3-4a4a-bee5-43759932ed36
- Milestone: Milestone 2 (M2 Integration & Edge Cases)

## 🔒 Key Constraints
- Do NOT implement anything — read-only spec miner role.
- Prioritize authoritative sources (ORIGINAL_REQUEST.md, PROJECT.md, TEST_READY.md, existing codebase).
- Investigate integration of SakuraPetals and CameraController into Scene1Hero.
- Investigate depth sorting (alphaTest: 0.05, depthWrite: true, interaction with CoupleSilhouette, RooftopRailing).
- Investigate viewport edge cases (mobile portrait 390x844, ultra-wide 3440x1440, window resize, tab backgrounding delta time clamping).
- Investigate performance budget (60 FPS with 350 particles, zero GC allocations per frame, clean unmount cleanup).
- Write handoff report to C:\Users\neera\koistory\.agents\teamwork\spec_miner_m2_3\handoff.md.

## Current Parent
- Conversation ID: d80f9389-97b3-4a4a-bee5-43759932ed36
- Updated: not yet

## Task Summary
- **What to build**: Specification discovery and edge case design report for M2 integration.
- **Success criteria**: Comprehensive feature tables, edge case tables, depth sorting analysis, viewport edge case specs, and performance/lifecycle constraints in handoff.md.
- **Interface contracts**: C:\Users\neera\koistory\PROJECT.md
- **Code layout**: C:\Users\neera\koistory\PROJECT.md § Code Layout

## Key Decisions Made
- Confirmed full test suite runs and passes (187/187 tests).
- Extracted explicit mathematical contracts for aerodynamics, damping, bounds, and attenuation from tests and docs.
- Formulated zero-allocation pattern using scratch Object3D/Matrix4 and flat typed arrays for 350 instances.
- Solved depth sorting: paired `alphaTest: 0.05` + `depthWrite: true` prevents both rectangular clipping artifacts and instance sorting glitches.
- Mapped viewport adaptation across mobile portrait (390x844), ultrawide (3440x1440), resize, and backgrounding tab sleep.

## Artifact Index
- C:\Users\neera\koistory\.agents\teamwork\spec_miner_m2_3\DISPATCH.md — Dispatch log
- C:\Users\neera\koistory\.agents\teamwork\spec_miner_m2_3\progress.md — Liveness heartbeat
- C:\Users\neera\koistory\.agents\teamwork\spec_miner_m2_3\handoff.md — Final handoff report
