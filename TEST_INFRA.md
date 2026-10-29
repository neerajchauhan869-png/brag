# E2E Test Infra: KoiStory

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial + Real-World Workload Testing across 4 Tiers.
- Progressive testability: verification checks build integrity, WebGL canvas presence, particle system instances, GSAP timeline scrubbing, card count and hover micro-interactions, procedural audio synthesis nodes, and responsive viewports.

## Feature Inventory Mapping
| # | Feature | Requirement Source | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| F1 | Stylized Anime Moon | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| F2 | Anime Night Sky & Stars | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| F3 | Distant Tokyo Skyline | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| F4 | Rooftop Deck & Railing | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| F5 | Silhouetted Anime Couple | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| F6 | Cherry Blossom Framing Trees | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| F7 | Sakura Petal Particle System | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| F8 | Responsive Mouse Parallax | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| F9 | GSAP ScrollTrigger Plunge | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| F10 | Zero-Glitch Bidirectional Scrub | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| F11 | Scene 2 Narrative Story Cards | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| F12 | Story Card Micro-Interactions | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| F13 | Procedural Night Breeze Audio | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ |
| F14 | Procedural Melodic Chords | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ |
| F15 | Interactive Audio HUD | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ |
| F16 | Responsive UI Overlay | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ |
| F17 | Build Quality & Zero External Assets | Acceptance Criteria | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Node.js / Playwright / TypeScript verification harness executing automated build checks, static analysis, component mounts, and behavioral assertions.
- Test script location: `tests/e2e/`
- Command: `npm test` or `node tests/e2e/runner.mjs`
- Directory layout:
  ```
  tests/
  ├── e2e/
  │   ├── runner.mjs
  │   ├── tier1_features.test.mjs
  │   ├── tier2_boundaries.test.mjs
  │   ├── tier3_combinations.test.mjs
  │   └── tier4_realworld.test.mjs
  ```

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full Desktop Hero-to-Narrative Scrub Journey | F1–F12, F16 | High |
| 2 | Mobile Viewport Experience (390x844) | F1, F4, F7, F11, F15, F16 | Medium |
| 3 | Continuous Audio Session with Scroll Navigation | F9, F10, F13, F14, F15 | High |
| 4 | Rapid Reverse Scroll & Scrub Stress Test | F7, F8, F9, F10, F11 | High |
| 5 | Audio Autoplay Policy & Interaction Flow | F13, F14, F15 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature
- Tier 2: ≥5 per feature (boundary and extreme values)
- Tier 3: pairwise coverage of major feature interactions
- Tier 4: ≥5 realistic application scenarios
