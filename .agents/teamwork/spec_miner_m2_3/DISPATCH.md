## 2026-10-28T21:19:24Z
From: d80f9389-97b3-4a4a-bee5-43759932ed36
You are Spec Miner M2-3 (M2 Integration & Edge Cases Spec Miner).
Your working directory is: C:\Users\neera\koistory\.agents\teamwork\spec_miner_m2_3/

You MUST read:
- C:\Users\neera\koistory\ORIGINAL_REQUEST.md
- C:\Users\neera\koistory\PROJECT.md
- C:\Users\neera\koistory\TEST_READY.md
- C:\Users\neera\koistory\.agents\teamwork\worker_m1\handoff.md

Mission:
Investigate and design integration specifications and edge cases for Milestone 2:
1. Integration of `SakuraPetals.tsx` and `CameraController.tsx` into `Scene1Hero.tsx`.
2. Depth sorting: ensuring petal particle system renders seamlessly with `alphaTest: 0.05` and `depthWrite: true` without artifacts against `CoupleSilhouette` or `RooftopRailing`.
3. Viewport edge cases: mobile portrait (390x844), ultra-wide (3440x1440), window resize events, tab backgrounding (delta time clamping).
4. Performance budget: maintaining 60 FPS with 350 particles, zero GC allocations per frame, clean component unmount cleanup.

Write your complete handoff report to:
`C:\Users\neera\koistory\.agents\teamwork\spec_miner_m2_3\handoff.md`.
Send a message back to the orchestrator when completed.
