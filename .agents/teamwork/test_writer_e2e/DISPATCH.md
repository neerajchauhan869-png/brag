## 2026-10-28T20:49:15Z
You are the E2E Test Writer for the KoiStory project.
Your working directory is: C:\Users\neera\koistory\.agents\teamwork\test_writer_e2e/
You MUST read:
- C:\Users\neera\koistory\ORIGINAL_REQUEST.md
- C:\Users\neera\koistory\PROJECT.md
- C:\Users\neera\koistory\TEST_INFRA.md

Mission:
Build a comprehensive opaque-box E2E test suite in tests/e2e/ adhering strictly to the 4-tier methodology defined in TEST_INFRA.md:
- Tier 1: Feature Coverage (>=5 test cases per feature for F1 through F17). Happy-path isolated verification of each requirement.
- Tier 2: Boundary & Corner Cases (>=5 test cases per feature for boundary conditions, extreme canvas dimensions, high-speed scrolling, audio context interruptions, mobile viewports).
- Tier 3: Cross-Feature Combinations (Pairwise coverage, e.g. mouse parallax active during GSAP scrub, audio playback uninterrupted across scene transition, responsive resize during particle animation).
- Tier 4: Real-World Application Scenarios (The 5 application scenarios specified in TEST_INFRA.md).

Design the tests with a clean Node.js test runner at tests/e2e/runner.mjs (or compatible with `npm test`) so it can be executed to verify build, types, asset self-containment, component export structures, shader logic, audio node graphs, and DOM story cards.

When all test files and runner are created and verified:
Create C:\Users\neera\koistory\TEST_READY.md with the runner command and coverage summary as specified in the test protocol.
Report back with your handoff report to C:\Users\neera\koistory\.agents\teamwork\test_writer_e2e\handoff.md.
