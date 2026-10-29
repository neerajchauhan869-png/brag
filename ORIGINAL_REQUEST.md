# Original User Request

## Initial Request — 2026-10-28T20:38:46Z

You are the Project Orchestrator for the following mission:

Working directory: C:\Users\neera\koistory
Integrity mode: development

## User Request:
Build a premium cinematic anime love-story landing page prototype: a night Japanese city rooftop scene with a luminous moon, silhouette couple at a railing, cherry blossom trees with continuous falling 3D sakura petals, responsive mouse parallax, and a GSAP ScrollTrigger transition diving into Scene 2 (a poetic narrative section with floating memory cards).

## Requirements:
### R1. Scene 1 Hero 3D Rooftop Experience
Implement an immersive 3D hero scene set on a Japanese city rooftop at night. The visual composition must feature:
- A large luminous stylized anime moon and starry night sky backdrop.
- A glowing distant city skyline with subtle twinkling lights.
- A silhouetted anime couple leaning or standing at a rooftop railing.
- Cherry blossom (sakura) trees framing the foreground/midground.
All 3D visual assets, meshes, silhouettes, and textures must be generated procedurally (e.g. custom Three.js geometries, canvas textures, and shaders) without relying on external downloaded 3D model files.

### R2. Sakura Petal Particle Physics & Mouse Parallax
Implement an instanced 3D particle system for falling cherry blossom petals:
- Continuous falling motion with gentle wind drift, flutter, and rotational turbulence.
- Responsive, dampened mouse/pointer parallax that tilts and shifts the camera/view perspective smoothly as the user moves their cursor.

### R3. GSAP ScrollTrigger Cinematic Scene Transition
Integrate a multi-stage scroll-driven camera motion:
- As the user scrolls down, a GSAP ScrollTrigger timeline animates the Three.js camera to smoothly plunge/dive from the rooftop vantage down into Scene 2.
- Clean scroll scrub synchronization ensuring backward and forward scrolling transitions seamlessly without visual glitches.

### R4. Scene 2 Narrative Story Cards & Floating Memories
Reveal Scene 2 upon scrolling:
- A poetic narrative section presenting floating romantic story cards/snippets against the backdrop of the descending night atmosphere.
- Micro-interactions on the story cards (smooth hover depth effects, soft glow highlights, staggered entrance animations).

### R5. Procedural Web Audio Soundscape & Interactive Controls
Implement an in-browser ambient soundscape using the Web Audio API (or synthesized audio nodes):
- Generative gentle night breeze noise filter and delicate ambient melodic chords.
- Audio toggle button with sound wave animation indicator (respecting browser autoplay policies by activating on user interaction).
- UI overlay containing minimal anime-inspired typography, audio mute/unmute control, and a subtle scroll indicator.

## Acceptance Criteria:
### Automated Build & Code Quality
- [ ] `npm run build` completes successfully with exit code 0 and zero TypeScript or build errors.
- [ ] No unhandled runtime exceptions or WebGL context crashes in the browser console during page load, mouse interaction, audio toggle, and scroll.

### 3D Scene & Particle Execution
- [ ] Three.js `<Canvas>` mounts and renders the 3D rooftop environment with the moon, skyline, couple silhouette, and sakura trees.
- [ ] Sakura particle system renders at least 200 instanced petals with continuous animated position and rotation updates.
- [ ] Moving the mouse across the viewport produces a smooth perspective tilt on the 3D scene.

### Scroll Transition & Narrative Flow
- [ ] Scrolling initiates a GSAP ScrollTrigger camera transition that navigates smoothly from Scene 1 to Scene 2.
- [ ] Scene 2 displays at least 3 distinct narrative memory cards with entrance and hover animations.
- [ ] Scrolling back up restores the hero camera angle and scene framing without desynchronization.

### Audio & UI Controls
- [ ] An audio toggle button is accessible in the UI overlay; clicking it starts/mutes the procedural ambient soundscape.
- [ ] Layout is responsive across both desktop (1920x1080) and mobile (390x844) viewport dimensions.
- [ ] All visuals and soundscapes are self-contained in the project repository with no broken 404 external asset requests.
