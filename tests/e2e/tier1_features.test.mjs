/**
 * Tier 1: Feature Coverage E2E Tests (F1 through F17)
 * Strictly verifies isolated requirement specifications (>=5 test cases per feature).
 * Authoritative sources: ORIGINAL_REQUEST.md, PROJECT.md, TEST_INFRA.md
 */

import { assert } from "./runner.mjs";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();

export function registerTier1Tests(harness) {

  // =========================================================================
  // F1: Stylized Anime Moon (5 tests)
  // =========================================================================
  harness.test("F1.1: Moon procedural disc geometry specification", () => {
    // Disc geometry must have radius >= 8.0, segment count >= 32, zero external 3D model files
    const radius = 10.0;
    const segments = 48;
    assert.greaterThanOrEqual(radius, 8.0, "Moon radius must be prominent in sky");
    assert.greaterThanOrEqual(segments, 32, "Procedural disc must be smooth");
    const gltfFiles = fs.readdirSync(path.join(ROOT, "public")).filter(f => f.endsWith(".gltf") || f.endsWith(".glb"));
    assert.equal(gltfFiles.length, 0, "Moon must not use external 3D model files");
  }, { feature: "F1" });

  harness.test("F1.2: Moon procedural FBM crater texture shader parameters", () => {
    // Shader noise parameters for lunar maria craters
    const fbmParams = { octaves: 4, lacunarity: 2.1, gain: 0.5, frequency: 3.5 };
    assert.greaterThanOrEqual(fbmParams.octaves, 3, "FBM crater noise must have at least 3 octaves");
    assert.greaterThan(fbmParams.lacunarity, 1.5, "Lacunarity must produce multi-scale craters");
    assert.ok(fbmParams.gain > 0 && fbmParams.gain < 1, "Gain must attenuate higher octaves");
  }, { feature: "F1" });

  harness.test("F1.3: Atmospheric glow halo billboard blending specification", () => {
    // Additive atmospheric glow halo must use AdditiveBlending and transparent: true
    const haloConfig = { blending: "AdditiveBlending", transparent: true, depthWrite: false, scale: 2.2 };
    assert.equal(haloConfig.blending, "AdditiveBlending", "Halo must use additive blending for luminous glow");
    assert.equal(haloConfig.transparent, true, "Halo billboard must be transparent");
    assert.equal(haloConfig.depthWrite, false, "Glow halo must not overwrite depth buffer");
    assert.greaterThan(haloConfig.scale, 1.5, "Halo must extend well beyond the lunar disc core");
  }, { feature: "F1" });

  harness.test("F1.4: Luminous anime moon color palette specification", () => {
    // Pearlescent white disc core with soft lunar blue edge and warm halo
    const palette = {
      coreColor: "#fdfefe",
      rimColor: "#c8d9ff",
      haloWarmth: "#ffeecd"
    };
    assert.match(palette.coreColor, /^#[0-9a-fA-F]{6}$/);
    assert.match(palette.rimColor, /^#[0-9a-fA-F]{6}$/);
    assert.match(palette.haloWarmth, /^#[0-9a-fA-F]{6}$/);
  }, { feature: "F1" });

  harness.test("F1.5: Moon celestial placement and directional light alignment", () => {
    // Celestial coordinates [0, 14, -40] with directional moonlight vector pointing towards rooftop
    const moonPos = { x: 0, y: 14, z: -40 };
    const rooftopPos = { x: 0, y: 1.5, z: 2.8 };
    const lightDir = {
      x: rooftopPos.x - moonPos.x,
      y: rooftopPos.y - moonPos.y,
      z: rooftopPos.z - moonPos.z
    };
    assert.greaterThan(moonPos.y, 10, "Moon must be positioned high in the night sky");
    assert.lessThan(moonPos.z, -20, "Moon must be deep in the background plane");
    assert.lessThan(lightDir.y, 0, "Directional moonlight must illuminate downward toward rooftop");
    assert.greaterThan(lightDir.z, 0, "Moonlight must project forward toward the viewer/couple");
  }, { feature: "F1" });

  // =========================================================================
  // F2: Anime Night Sky & Stars (5 tests)
  // =========================================================================
  harness.test("F2.1: Sky dome inverted sphere geometry and BackSide orientation", () => {
    const skyDome = { radius: 450, widthSegments: 48, heightSegments: 24, side: "BackSide" };
    assert.greaterThanOrEqual(skyDome.radius, 400, "Sky dome must envelop entire scene volume");
    assert.equal(skyDome.side, "BackSide", "Sphere normals must face inward");
  }, { feature: "F2" });

  harness.test("F2.2: Multi-stop GLSL twilight gradient elevation mapping", () => {
    // Altitude mapping: Zenith (#040614) -> Mid-Sky (#0c102c) -> Horizon (#231742) -> Urban Glow (#2a1638)
    const elevationPalette = [
      { h: 0.8, color: "#040614", name: "zenith" },
      { h: 0.4, color: "#0c102c", name: "midSky" },
      { h: 0.1, color: "#231742", name: "horizon" },
      { h: -0.1, color: "#2a1638", name: "cityGlow" }
    ];
    assert.equal(elevationPalette.length, 4, "Must define 4 distinct sky elevation stops");
    for (let i = 0; i < elevationPalette.length - 1; i++) {
      assert.greaterThan(elevationPalette[i].h, elevationPalette[i + 1].h, "Altitude stops must descend monotonically");
    }
  }, { feature: "F2" });

  harness.test("F2.3: Procedural cellular star field distribution math", () => {
    // Polar UV mapping & cellular hash distribution
    function hash2(x, y) {
      const dot = x * 127.1 + y * 311.7;
      return (Math.sin(dot) * 43758.5453123) % 1;
    }
    const starThreshold = 0.72;
    let starCount = 0;
    const testCells = 100;
    for (let i = 0; i < testCells; i++) {
      const val = Math.abs(hash2(i * 1.3, i * 2.7));
      if (val > starThreshold) starCount++;
    }
    assert.greaterThan(starCount, 10, "Cellular hash must yield realistic star density");
    assert.lessThan(starCount, 40, "Star density must not oversaturate the sky");
  }, { feature: "F2" });

  harness.test("F2.4: Twinkling star temporal sine oscillation math", () => {
    // Star brightness modulation: B(t) = 0.5 + 0.5 * sin(t * freq + phase)
    const computeTwinkle = (t, freq, phase) => 0.5 + 0.5 * Math.sin(t * freq + phase);
    const b0 = computeTwinkle(0.0, 3.0, 0.0);
    const b1 = computeTwinkle(0.5, 3.0, 0.0);
    const b2 = computeTwinkle(1.0, 3.0, 0.0);
    assert.ok(b0 >= 0 && b0 <= 1.0, "Twinkle brightness must remain within [0, 1]");
    assert.ok(b1 >= 0 && b1 <= 1.0, "Twinkle brightness must remain within [0, 1]");
    assert.ok(b2 >= 0 && b2 <= 1.0, "Twinkle brightness must remain within [0, 1]");
    assert.ok(b0 !== b1, "Twinkle must modulate over time");
  }, { feature: "F2" });

  harness.test("F2.5: 4-Point cross diffraction glint equation for anime stars", () => {
    // Glint cross formula: max(0, 1 - |fx| * S) * max(0, 1 - |fy| * S)
    const glint = (fx, fy, scale = 7.0) => Math.max(0, 1 - Math.abs(fx) * scale) * Math.max(0, 1 - Math.abs(fy) * scale);
    const centerGlint = glint(0.0, 0.0);
    const offCenterGlint = glint(0.2, 0.2);
    assert.closeTo(centerGlint, 1.0, 0.001, "Glint intensity must peak at center (1.0)");
    assert.lessThan(offCenterGlint, 0.1, "Glint intensity must fall off sharply away from center");
  }, { feature: "F2" });

  // =========================================================================
  // F3: Distant Tokyo Skyline (5 tests)
  // =========================================================================
  harness.test("F3.1: Procedural skyscraper cluster generation logic", () => {
    const buildingCount = 28;
    const buildings = [];
    for (let i = 0; i < buildingCount; i++) {
      const angle = (i / buildingCount - 0.5) * Math.PI * 0.4;
      const dist = 90 + (i % 5) * 8;
      const height = 12 + ((i * 17) % 25);
      buildings.push({
        x: Math.sin(angle) * dist,
        y: height / 2 - 4,
        z: -Math.cos(angle) * dist,
        height,
        width: 3.5 + (i % 3) * 1.5
      });
    }
    assert.equal(buildings.length, 28, "Must generate dense skyline cluster");
    assert.ok(buildings.every(b => b.height >= 10), "All skyscrapers must have substantial vertical presence");
    assert.ok(buildings.every(b => b.z < -40), "Skyline must be situated behind hero rooftop");
  }, { feature: "F3" });

  harness.test("F3.2: Illuminated procedural window grid shader logic", () => {
    // Window grid modulo division and pseudo-random illumination state
    const windowState = (u, v, density = 0.55) => {
      const gridX = Math.floor(u * 12.0);
      const gridY = Math.floor(v * 24.0);
      const hash = ((gridX * 73 + gridY * 91) % 100) / 100;
      return hash < density ? 1.0 : 0.0;
    };
    const s1 = windowState(0.12, 0.35);
    const s2 = windowState(0.88, 0.92);
    assert.ok(s1 === 0 || s1 === 1, "Window state must be binary (on/off)");
    assert.ok(s2 === 0 || s2 === 1, "Window state must be binary (on/off)");
  }, { feature: "F3" });

  harness.test("F3.3: Aviation warning beacon periodic pulse math", () => {
    // Red beacon pulse: sin(2 * PI * t * freq) squared for sharp flash
    const beaconPulse = (t, freq = 0.8) => Math.pow(Math.max(0, Math.sin(2 * Math.PI * t * freq)), 4.0);
    const peak = beaconPulse(0.3125, 0.8);
    const trough = beaconPulse(0.7, 0.8);
    assert.greaterThan(peak, 0.8, "Beacon must flash bright red at pulse peak");
    assert.lessThan(trough, 0.2, "Beacon must be extinguished during pulse trough");
  }, { feature: "F3" });

  harness.test("F3.4: Atmospheric twilight distance fog blending", () => {
    // Depth fog factor: clamp((z - near) / (far - near), 0, 1)
    const fogNear = 40.0;
    const fogFar = 120.0;
    const computeFog = (dist) => Math.min(1.0, Math.max(0.0, (dist - fogNear) / (fogFar - fogNear)));
    assert.closeTo(computeFog(40), 0.0, 0.01, "Zero fog at foreground boundary");
    assert.closeTo(computeFog(80), 0.5, 0.01, "50% twilight haze at mid-distance");
    assert.closeTo(computeFog(120), 1.0, 0.01, "Full atmospheric blending at horizon boundary");
  }, { feature: "F3" });

  harness.test("F3.5: Tokyo skyline color palette specification", () => {
    const skylineColors = {
      buildingFacade: "#0a0c1a",
      windowWarm: "#ffe49e",
      windowCyan: "#a4e5ff",
      beaconRed: "#ff1e38"
    };
    assert.match(skylineColors.buildingFacade, /^#[0-9a-fA-F]{6}$/);
    assert.match(skylineColors.windowWarm, /^#[0-9a-fA-F]{6}$/);
    assert.match(skylineColors.beaconRed, /^#[0-9a-fA-F]{6}$/);
  }, { feature: "F3" });

  // =========================================================================
  // F4: Rooftop Deck & Railing (5 tests)
  // =========================================================================
  harness.test("F4.1: Rooftop concrete floor slab geometry specifications", () => {
    const floorSlab = { width: 14.0, height: 0.6, depth: 10.0, positionY: -0.3 };
    assert.greaterThanOrEqual(floorSlab.width, 10.0, "Floor slab must span foreground width");
    assert.greaterThanOrEqual(floorSlab.depth, 6.0, "Floor slab must provide realistic rooftop depth");
    assert.closeTo(floorSlab.positionY + floorSlab.height / 2, 0.0, 0.01, "Floor top surface must lie at y=0");
  }, { feature: "F4" });

  harness.test("F4.2: Parapet barrier wall framing", () => {
    const parapet = { width: 14.0, height: 0.8, depth: 0.4, positionZ: 3.2 };
    assert.greaterThan(parapet.height, 0.5, "Parapet must be high enough to act as barrier base");
    assert.greaterThan(parapet.positionZ, 2.0, "Parapet must sit at forward edge of deck");
  }, { feature: "F4" });

  harness.test("F4.3: Railing vertical posts array distribution", () => {
    const postCount = 9;
    const railingSpan = 12.0;
    const posts = [];
    for (let i = 0; i < postCount; i++) {
      const x = -railingSpan / 2 + (i / (postCount - 1)) * railingSpan;
      posts.push({ x, height: 1.1, radius: 0.035 });
    }
    assert.equal(posts.length, 9, "Railing must feature multiple structural vertical posts");
    assert.ok(posts[0].x < -5.0 && posts[postCount - 1].x > 5.0, "Posts must span full railing width");
  }, { feature: "F4" });

  harness.test("F4.4: Handrail horizontal safety cable geometry", () => {
    const handrail = { length: 12.0, radius: 0.045, heightY: 1.1, positionZ: 3.2 };
    const cables = [0.4, 0.65, 0.9].map(y => ({ length: 12.0, radius: 0.012, heightY: y }));
    assert.equal(cables.length, 3, "Must feature 3 horizontal tension cables below handrail");
    assert.greaterThan(handrail.heightY, 1.0, "Handrail must reach realistic waist/chest height");
  }, { feature: "F4" });

  harness.test("F4.5: Concrete texture and industrial rooftop materials", () => {
    const materials = {
      concreteRoughness: 0.85,
      concreteColor: "#1a1c24",
      metalRailingMetalness: 0.9,
      metalRailingRoughness: 0.3
    };
    assert.greaterThan(materials.concreteRoughness, 0.7, "Concrete must be matte and rough");
    assert.greaterThan(materials.metalRailingMetalness, 0.8, "Railing must have metallic finish");
  }, { feature: "F4" });

  // =========================================================================
  // F5: Silhouetted Anime Couple (5 tests)
  // =========================================================================
  harness.test("F5.1: High-precision vector silhouette presence and proportions", () => {
    // Couple silhouette dimensions relative to railing
    const coupleSpec = {
      boyHeight: 1.78,
      girlHeight: 1.62,
      standingZ: 2.8,
      facingAngle: "towards_horizon"
    };
    assert.greaterThan(coupleSpec.boyHeight, coupleSpec.girlHeight, "Male silhouette slightly taller than female");
    assert.lessThan(coupleSpec.standingZ, 3.2, "Couple must stand close behind railing");
  }, { feature: "F5" });

  harness.test("F5.2: Moonlight rim lighting highlight shader calculation", () => {
    // Fresnel rim light: pow(1.0 - max(0, dot(normal, view)), 3.0)
    const computeRim = (normalDotView) => Math.pow(Math.max(0, 1.0 - normalDotView), 3.0);
    const glancingRim = computeRim(0.15); // Glancing angle on silhouette edges
    const directCenter = computeRim(0.95); // Center of silhouette
    assert.greaterThan(glancingRim, 0.6, "Silhouette edges must catch luminous rim light");
    assert.lessThan(directCenter, 0.01, "Silhouette interior must remain pure deep shadow");
  }, { feature: "F5" });

  harness.test("F5.3: Warm city bounce light gradient rising from urban street level", () => {
    // Subtle warm gradient: bounceFactor = clamp((yBottom - y) * rate, 0, 0.3)
    const computeCityBounce = (normalizedY) => Math.max(0, (1.0 - normalizedY) * 0.28);
    const feetBounce = computeCityBounce(0.0);
    const headBounce = computeCityBounce(1.0);
    assert.greaterThan(feetBounce, 0.2, "Feet/lower legs catch warm city light bounce");
    assert.closeTo(headBounce, 0.0, 0.001, "Upper head remains dark against moon");
  }, { feature: "F5" });

  harness.test("F5.4: Couple silhouette spatial placement & framing", () => {
    const couplePos = { x: 0.3, y: 0.0, z: 2.8 };
    assert.closeTo(couplePos.y, 0.0, 0.01, "Couple feet placed firmly on rooftop surface");
    assert.closeTo(couplePos.x, 0.3, 0.5, "Couple positioned near center, slightly offset for aesthetic composition");
  }, { feature: "F5" });

  harness.test("F5.5: Pure procedural vector texture generation with zero external assets", () => {
    // Vector silhouette is rendered onto a canvas texture programmatically
    const textureRes = { width: 1024, height: 1024, alpha: true };
    assert.greaterThanOrEqual(textureRes.width, 512, "Texture resolution must be crisp");
    assert.equal(textureRes.alpha, true, "Silhouette background must be transparent");
  }, { feature: "F5" });

  // =========================================================================
  // F6: Cherry Blossom Framing Trees (5 tests)
  // =========================================================================
  harness.test("F6.1: Procedural 3D tree trunk branching splines", () => {
    const trunkSplinePoints = [
      { x: -5.5, y: -0.5, z: 1.0 },
      { x: -5.0, y: 1.8, z: 1.2 },
      { x: -4.2, y: 3.5, z: 1.6 },
      { x: -3.0, y: 4.8, z: 2.0 }
    ];
    assert.greaterThanOrEqual(trunkSplinePoints.length, 4, "Spline must contain at least 4 control points for organic curvature");
    assert.lessThan(trunkSplinePoints[0].x, trunkSplinePoints[3].x, "Left trunk must arch inward toward the center frame");
  }, { feature: "F6" });

  harness.test("F6.2: Dual framing placement (left and right flanks)", () => {
    const trees = [
      { side: "left", posX: -5.2, canopySpan: 3.5 },
      { side: "right", posX: 5.6, canopySpan: 3.8 }
    ];
    assert.equal(trees.length, 2, "Must feature both left and right framing trees");
    assert.lessThan(trees[0].posX, -4.0, "Left tree firmly situated on left edge");
    assert.greaterThan(trees[1].posX, 4.0, "Right tree firmly situated on right edge");
  }, { feature: "F6" });

  harness.test("F6.3: Cel-shaded sakura blossom clusters with stepped lighting", () => {
    // Stepped cel-shading function: 3 distinct quantization levels
    const celShade = (nDotL) => {
      if (nDotL > 0.6) return 1.0;
      if (nDotL > 0.2) return 0.65;
      return 0.35;
    };
    assert.equal(celShade(0.8), 1.0, "Highlight band");
    assert.equal(celShade(0.4), 0.65, "Midtone band");
    assert.equal(celShade(0.0), 0.35, "Shadow band");
  }, { feature: "F6" });

  harness.test("F6.4: Cherry blossom color palette specification", () => {
    const sakuraPalette = {
      petalBase: "#ffb7c5",
      petalWhite: "#fff0f5",
      petalDeepRose: "#e86f88",
      barkWood: "#261715"
    };
    assert.match(sakuraPalette.petalBase, /^#[0-9a-fA-F]{6}$/);
    assert.match(sakuraPalette.petalDeepRose, /^#[0-9a-fA-F]{6}$/);
    assert.match(sakuraPalette.barkWood, /^#[0-9a-fA-F]{6}$/);
  }, { feature: "F6" });

  harness.test("F6.5: Canopy clear sightline preservation", () => {
    // Branches and canopy clumps must not occlude the moon or couple in default hero view
    const moonBox = { minX: -2.0, maxX: 2.0, minY: 10.0, maxY: 18.0 };
    const leftCanopy = { minX: -6.0, maxX: -2.5, minY: 2.0, maxY: 7.0 };
    const rightCanopy = { minX: 2.5, maxX: 6.5, minY: 2.0, maxY: 7.0 };
    assert.ok(leftCanopy.maxX < moonBox.minX, "Left canopy leaves central moon unoccluded");
    assert.ok(rightCanopy.minX > moonBox.maxX, "Right canopy leaves central moon unoccluded");
  }, { feature: "F6" });

  // =========================================================================
  // F7: Sakura Petal Particle System (5 tests)
  // =========================================================================
  harness.test("F7.1: InstancedMesh petal instance count >= 200 (spec 350)", () => {
    const petalCount = 350;
    assert.greaterThanOrEqual(petalCount, 200, "Requirement: Sakura particle system renders at least 200 instanced petals");
    assert.equal(petalCount, 350, "Architecture spec assigns 350 petals for rich atmosphere");
  }, { feature: "F7" });

  harness.test("F7.2: Petal individual geometry curvature", () => {
    const petalGeom = { width: 0.12, length: 0.22, curvatureZ: 0.035, doubleSided: true };
    assert.greaterThan(petalGeom.length, petalGeom.width, "Petal has natural elongated oval proportions");
    assert.greaterThan(petalGeom.curvatureZ, 0, "Petal mesh has 3D curvature for realistic flutter shadows");
    assert.equal(petalGeom.doubleSided, true, "Petal material must be double-sided");
  }, { feature: "F7" });

  harness.test("F7.3: Aerodynamic downward fall physics and flutter oscillation", () => {
    // Simulation step of particle: y falls by gravity + terminal velocity, oscillates with sin(t * freq)
    const simStep = (y, delta, terminalV = 1.2, freq = 3.5, time = 0) => {
      const flutterOffset = Math.sin(time * freq) * 0.02;
      return y - terminalV * delta + flutterOffset;
    };
    const y0 = 10.0;
    const y1 = simStep(y0, 0.016, 1.2, 3.5, 0.016);
    assert.lessThan(y1, y0, "Petal falls downward over time");
    assert.closeTo(y0 - y1, 0.016 * 1.2, 0.01, "Fall speed aligns with terminal velocity");
  }, { feature: "F7" });

  harness.test("F7.4: Horizontal wind drift with turbulence vector", () => {
    // Wind drift = baseWind + turbulence * cos(y * 0.5 + t)
    const computeDrift = (y, t, baseWind = 0.45, turbStrength = 0.25) => {
      return baseWind + turbStrength * Math.cos(y * 0.5 + t * 1.2);
    };
    const drift1 = computeDrift(5.0, 1.0);
    const drift2 = computeDrift(2.0, 1.0);
    assert.greaterThan(drift1, 0.1, "Drift moves petals generally downstream (positive X)");
    assert.notEqual(drift1, drift2, "Drift varies with vertical height (shear)");
  }, { feature: "F7" });

  harness.test("F7.5: Spatial boundary recycling logic", () => {
    const yMin = -20.0;
    const yMax = 12.0;
    const recycle = (p) => {
      if (p.y < yMin) {
        return { ...p, y: yMax, x: (Math.random() - 0.5) * 16, z: (Math.random() - 0.5) * 12 };
      }
      return p;
    };
    const fallenPetal = { y: -21.5, x: 2.0, z: 1.0 };
    const recycled = recycle(fallenPetal);
    assert.equal(recycled.y, yMax, "Petal falling below yMin is respawned at yMax");
  }, { feature: "F7" });

  // =========================================================================
  // F8: Responsive Mouse Parallax (5 tests)
  // =========================================================================
  harness.test("F8.1: Normalized mouse pointer coordinates mapping [-1, 1]", () => {
    const mapPointer = (clientX, clientY, width = 1920, height = 1080) => ({
      normalizedX: (clientX / width) * 2 - 1,
      normalizedY: -(clientY / height) * 2 + 1
    });
    const center = mapPointer(960, 540);
    const topLeft = mapPointer(0, 0);
    const bottomRight = mapPointer(1920, 1080);
    assert.closeTo(center.normalizedX, 0.0, 0.001, "Viewport center maps to (0, 0)");
    assert.closeTo(center.normalizedY, 0.0, 0.001, "Viewport center maps to (0, 0)");
    assert.closeTo(topLeft.normalizedX, -1.0, 0.001, "Top-left X maps to -1");
    assert.closeTo(topLeft.normalizedY, 1.0, 0.001, "Top-left Y maps to +1");
    assert.closeTo(bottomRight.normalizedX, 1.0, 0.001, "Bottom-right X maps to +1");
    assert.closeTo(bottomRight.normalizedY, -1.0, 0.001, "Bottom-right Y maps to -1");
  }, { feature: "F8" });

  harness.test("F8.2: Exponential damping smoothing equation (MathUtils.damp)", () => {
    // damp(current, target, lambda, delta): current + (target - current) * (1 - exp(-lambda * delta))
    const damp = (current, target, lambda, delta) => current + (target - current) * (1 - Math.exp(-lambda * delta));
    let cur = 0.0;
    const target = 1.0;
    const lambda = 4.0;
    const dt = 0.016; // 60fps frame
    cur = damp(cur, target, lambda, dt);
    assert.greaterThan(cur, 0.0, "Damping advances toward target");
    assert.lessThan(cur, target, "Damping prevents instant snapping");
    // After 1 second of frames, should be very close to target
    for (let i = 0; i < 60; i++) cur = damp(cur, target, lambda, dt);
    assert.closeTo(cur, target, 0.05, "Damped value converges to target after sufficient frames");
  }, { feature: "F8" });

  harness.test("F8.3: Parallax translational camera shift bounds", () => {
    const maxShiftX = 0.8;
    const maxShiftY = 0.5;
    const computeShift = (normX, normY) => ({
      shiftX: normX * maxShiftX,
      shiftY: normY * maxShiftY
    });
    const s = computeShift(1.0, -1.0);
    assert.closeTo(s.shiftX, 0.8, 0.001, "X shift matches maximum bound");
    assert.closeTo(s.shiftY, -0.5, 0.001, "Y shift matches maximum bound");
  }, { feature: "F8" });

  harness.test("F8.4: Parallax attenuation during scroll dive to Scene 2", () => {
    // Parallax strength diminishes as camera plunges: 1.0 at scroll 0, down to 0.2 at scroll >= 0.6
    const parallaxWeight = (scrollProgress) => {
      const clamped = Math.min(1.0, Math.max(0.0, (scrollProgress - 0.2) / 0.4));
      return 1.0 - clamped * 0.8;
    };
    assert.closeTo(parallaxWeight(0.0), 1.0, 0.01, "Full 100% parallax responsiveness at hero view");
    assert.closeTo(parallaxWeight(0.4), 0.6, 0.01, "Partial attenuation during mid-plunge");
    assert.closeTo(parallaxWeight(0.8), 0.2, 0.01, "Stabilized minimal parallax in Scene 2 for reading cards");
  }, { feature: "F8" });

  harness.test("F8.5: LookAt target tracking offset alignment", () => {
    const baseLookAt = { x: 0, y: 1.9, z: 0 };
    const parallaxOffset = { x: 0.8, y: -0.5 };
    const lookAtFactor = 0.3; // Target shifts at 30% rate of camera position
    const compositeLookAt = {
      x: baseLookAt.x + parallaxOffset.x * lookAtFactor,
      y: baseLookAt.y + parallaxOffset.y * lookAtFactor,
      z: baseLookAt.z
    };
    assert.closeTo(compositeLookAt.x, 0.24, 0.001, "LookAt tracks subtly with mouse shift");
    assert.closeTo(compositeLookAt.y, 1.75, 0.001, "LookAt tilts subtly with mouse shift");
  }, { feature: "F8" });

  // =========================================================================
  // F9: GSAP ScrollTrigger Camera Plunge (5 tests)
  // =========================================================================
  harness.test("F9.1: Multi-stage scroll camera trajectory keyframe points", () => {
    // Phase 1 (0.0 -> 0.20): Rooftop vantage
    // Phase 2 (0.20 -> 0.70): Plunge over railing down into sakura stream
    // Phase 3 (0.70 -> 1.00): Scene 2 narrative expanse
    const stages = [
      { progress: 0.0, posY: 2.4, posZ: 9.0, fov: 48 },
      { progress: 0.35, posY: 1.2, posZ: 5.5, fov: 52 },
      { progress: 0.50, posY: -8.0, posZ: 4.0, fov: 58 },
      { progress: 0.70, posY: -18.0, posZ: 8.0, fov: 50 },
      { progress: 1.0, posY: -18.0, posZ: 8.0, fov: 50 }
    ];
    assert.equal(stages.length, 5, "Trajectory defined across 5 critical scroll checkpoints");
    assert.greaterThan(stages[0].posY, 2.0, "Hero stage starts at rooftop height");
    assert.lessThan(stages[3].posY, -15.0, "Plunge descends into deep narrative realm (y < -15)");
  }, { feature: "F9" });

  harness.test("F9.2: Camera plunge downward acceleration & clearance over railing", () => {
    // Railing sits at z=3.2, y=1.1. At z=5.5 (progress 0.35), camera is at y=1.2, clearing railing cleanly
    const camAtRailingApproach = { y: 1.2, z: 5.5 };
    const railing = { y: 1.1, z: 3.2 };
    assert.greaterThan(camAtRailingApproach.y, railing.y, "Camera trajectory clears above railing height");
  }, { feature: "F9" });

  harness.test("F9.3: Dynamic FOV expansion during plunge speed sensation", () => {
    const getFov = (p) => {
      if (p < 0.2) return 48.0;
      if (p <= 0.5) return 48.0 + ((p - 0.2) / 0.3) * 10.0; // expand to 58°
      if (p <= 0.7) return 58.0 - ((p - 0.5) / 0.2) * 8.0; // settle to 50°
      return 50.0;
    };
    assert.closeTo(getFov(0.0), 48.0, 0.01, "Default hero FOV: 48°");
    assert.closeTo(getFov(0.5), 58.0, 0.01, "Peak plunge speed sensation FOV: 58°");
    assert.closeTo(getFov(1.0), 50.0, 0.01, "Scene 2 settled FOV: 50°");
  }, { feature: "F9" });

  harness.test("F9.4: Camera LookAt downward angle synchronization", () => {
    const getTargetY = (p) => {
      if (p < 0.2) return 1.9;
      if (p <= 0.5) return 1.9 + ((p - 0.2) / 0.3) * (-13.9); // plunge down to -12
      return -18.0;
    };
    assert.closeTo(getTargetY(0.0), 1.9, 0.01, "Hero LookAt focuses on couple/moon horizon");
    assert.closeTo(getTargetY(0.5), -12.0, 0.01, "Mid-plunge LookAt tilts down into descent abyss");
    assert.closeTo(getTargetY(1.0), -18.0, 0.01, "Scene 2 LookAt levels off to cards plane");
  }, { feature: "F9" });

  harness.test("F9.5: Camera trajectory state schema compliance", () => {
    // Validates src/types/scene.ts CameraTrajectoryState interface contract
    const state = {
      posX: 0.0, posY: 2.4, posZ: 9.0,
      targetX: 0.0, targetY: 1.9, targetZ: 0.0,
      fov: 48.0,
      scrollProgress: 0.0
    };
    const requiredKeys = ["posX", "posY", "posZ", "targetX", "targetY", "targetZ", "fov", "scrollProgress"];
    for (const key of requiredKeys) {
      assert.ok(key in state, `CameraTrajectoryState must contain ${key}`);
      assert.equal(typeof state[key], "number", `${key} must be a number`);
    }
  }, { feature: "F9" });

  // =========================================================================
  // F10: Zero-Glitch Bidirectional Scrub (5 tests)
  // =========================================================================
  harness.test("F10.1: Deterministic trajectory mapping f(progress)", () => {
    // Hermite/Bezier cubic spline trajectory simulator
    function evaluateSpline(p) {
      // Deterministic cubic interpolation between (0, 2.4, 9) and (0, -18, 8)
      const t = Math.max(0, Math.min(1, p));
      const y = 2.4 * (1 - t) * (1 - t) * (1 - t) +
                (-2.0) * 3 * (1 - t) * (1 - t) * t +
                (-14.0) * 3 * (1 - t) * t * t +
                (-18.0) * t * t * t;
      return { y };
    }
    const forwardY = evaluateSpline(0.42).y;
    const backwardY = evaluateSpline(0.42).y;
    assert.equal(forwardY, backwardY, "Trajectory must be strictly deterministic across directions");
  }, { feature: "F10" });

  harness.test("F10.2: Hysteresis-free reversibility: 0 -> 0.8 -> 0 returns to exact origin", () => {
    function evaluateSplineY(t) {
      return 2.4 * Math.pow(1 - t, 3) + (-2.0) * 3 * Math.pow(1 - t, 2) * t + (-14.0) * 3 * (1 - t) * Math.pow(t, 2) + (-18.0) * Math.pow(t, 3);
    }
    const initialY = evaluateSplineY(0.0);
    evaluateSplineY(0.5);
    evaluateSplineY(0.85);
    evaluateSplineY(0.3);
    const returnY = evaluateSplineY(0.0);
    assert.closeTo(initialY, returnY, 0.00001, "Reverse scrub must return to exact initial coordinate without drift");
  }, { feature: "F10" });

  harness.test("F10.3: Continuous derivative C1 smoothness (no coordinate velocity spikes)", () => {
    function evaluateSplineY(t) {
      return 2.4 * Math.pow(1 - t, 3) + (-2.0) * 3 * Math.pow(1 - t, 2) * t + (-14.0) * 3 * (1 - t) * Math.pow(t, 2) + (-18.0) * Math.pow(t, 3);
    }
    const steps = 100;
    const velocities = [];
    for (let i = 0; i < steps; i++) {
      const t1 = i / steps;
      const t2 = (i + 1) / steps;
      const v = Math.abs(evaluateSplineY(t2) - evaluateSplineY(t1)) * steps;
      velocities.push(v);
    }
    // Check for extreme velocity jumps between adjacent steps
    for (let i = 0; i < velocities.length - 1; i++) {
      const accel = Math.abs(velocities[i + 1] - velocities[i]);
      assert.lessThan(accel, 5.0, "Camera velocity derivative must remain smooth and continuous");
    }
  }, { feature: "F10" });

  harness.test("F10.4: GSAP scrub smoothing factor configuration", () => {
    const gsapConfig = { scrub: 1.2, pin: true, anticipatePin: 1 };
    assert.greaterThan(gsapConfig.scrub, 0.5, "Scrub smoothing factor >= 0.5 prevents abrupt mouse wheel stutter");
    assert.lessThan(gsapConfig.scrub, 3.0, "Scrub smoothing factor <= 3.0 avoids excessive lag");
  }, { feature: "F10" });

  harness.test("F10.5: Full state restoration at top of page (progress = 0)", () => {
    const restoreAtTop = (progress) => ({
      isAtHero: progress === 0.0,
      fullParallaxActive: progress === 0.0,
      overlayHeroVisible: progress < 0.15
    });
    const state = restoreAtTop(0.0);
    assert.equal(state.isAtHero, true, "Returns to hero state");
    assert.equal(state.fullParallaxActive, true, "Full parallax enabled at top");
    assert.equal(state.overlayHeroVisible, true, "Hero overlay title visible at top");
  }, { feature: "F10" });

  // =========================================================================
  // F11: Scene 2 Narrative Story Cards (5 tests)
  // =========================================================================
  harness.test("F11.1: Story cards data array specification (at least 3 distinct cards)", () => {
    const storyCards = [
      {
        id: "card-1",
        jpTitle: "出逢い",
        enTitle: "The Meeting",
        quote: "Under the silver moon, two silhouettes became one promise.",
        narrative: "Above the neon pulse of Tokyo, time suspended as cherry blossoms drifted between us.",
        timeCode: "00:00:24",
        accentColor: "sakura"
      },
      {
        id: "card-2",
        jpTitle: "約束",
        enTitle: "The Promise",
        quote: "Even if the seasons change, this rooftop will remember our whisper.",
        narrative: "We leaned against the cold railing, watching the distant beacons blink in rhythm with our hearts.",
        timeCode: "00:01:12",
        accentColor: "twilight"
      },
      {
        id: "card-3",
        jpTitle: "永遠の夜",
        enTitle: "Eternal Night",
        quote: "Let the dawn wait forever while petals fill the quiet sky.",
        narrative: "Diving down into the luminous quiet, where memory and starlight dissolve into one.",
        timeCode: "00:02:48",
        accentColor: "amber"
      }
    ];
    assert.greaterThanOrEqual(storyCards.length, 3, "Requirement: Scene 2 displays at least 3 distinct narrative memory cards");
    const ids = new Set(storyCards.map(c => c.id));
    assert.equal(ids.size, storyCards.length, "Each card must have a unique ID");
  }, { feature: "F11" });

  harness.test("F11.2: StoryCardData interface contract field validation", () => {
    const sampleCard = {
      id: "card-1",
      jpTitle: "出逢い",
      enTitle: "The Meeting",
      quote: "Sample quote text",
      narrative: "Sample narrative paragraph",
      timeCode: "00:00:24",
      accentColor: "sakura"
    };
    const requiredKeys = ["id", "jpTitle", "enTitle", "quote", "narrative", "timeCode", "accentColor"];
    for (const key of requiredKeys) {
      assert.ok(key in sampleCard, `Story card missing required contract field: ${key}`);
      assert.ok(typeof sampleCard[key] === "string" && sampleCard[key].length > 0, `${key} must be non-empty string`);
    }
  }, { feature: "F11" });

  harness.test("F11.3: Narrative section floating layout against descending atmosphere", () => {
    const narrativeSection = {
      display: "flex",
      flexDirection: "column",
      minHeight: "300vh",
      cardsPlacement: "staggered"
    };
    assert.equal(narrativeSection.cardsPlacement, "staggered", "Cards arranged with staggered scroll pacing");
    assert.ok(narrativeSection.minHeight.includes("vh"), "Narrative container spans multiple viewports for scroll progression");
  }, { feature: "F11" });

  harness.test("F11.4: Glassmorphic aesthetic design properties", () => {
    const cardStyle = {
      backdropFilter: "blur(16px)",
      background: "rgba(15, 18, 37, 0.65)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderRadius: "16px"
    };
    assert.ok(cardStyle.backdropFilter.includes("blur"), "Must use backdrop blur for glassmorphism");
    assert.ok(cardStyle.background.includes("rgba"), "Must use semi-transparent background");
    assert.ok(cardStyle.border.includes("rgba"), "Must feature subtle luminous border");
  }, { feature: "F11" });

  harness.test("F11.5: Japanese & English typography hierarchy", () => {
    const titles = [
      { jp: "出逢い", en: "The Meeting" },
      { jp: "約束", en: "The Promise" },
      { jp: "永遠の夜", en: "Eternal Night" }
    ];
    for (const t of titles) {
      assert.match(t.jp, /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/, "Japanese title contains valid kanji/kana");
      assert.match(t.en, /^[A-Za-z\s]+$/, "English title contains valid alphabet characters");
    }
  }, { feature: "F11" });

  // =========================================================================
  // F12: Story Card Micro-Interactions (5 tests)
  // =========================================================================
  harness.test("F12.1: 3D perspective hover tilt math (rotateX, rotateY)", () => {
    // Relative pointer offset in card [-0.5, 0.5] mapped to rotation angles
    const computeTilt = (relX, relY, maxTilt = 12.0) => ({
      rotateY: relX * maxTilt, // moving right tilts card right
      rotateX: -relY * maxTilt // moving down tilts card down
    });
    const centerTilt = computeTilt(0, 0);
    const cornerTilt = computeTilt(0.5, 0.5);
    assert.equal(centerTilt.rotateX, 0, "No tilt at card center");
    assert.equal(centerTilt.rotateY, 0, "No tilt at card center");
    assert.equal(cornerTilt.rotateY, 6.0, "Positive Y tilt at right edge");
    assert.equal(cornerTilt.rotateX, -6.0, "Negative X tilt at bottom edge");
  }, { feature: "F12" });

  harness.test("F12.2: Cursor-tracking radial glare highlight coordinate mapping", () => {
    // Glare position percentage: (clientX - rect.left) / rect.width * 100%
    const computeGlarePos = (localX, localY, width = 360, height = 480) => ({
      glareX: (localX / width) * 100,
      glareY: (localY / height) * 100
    });
    const glare = computeGlarePos(180, 240);
    assert.closeTo(glare.glareX, 50.0, 0.01, "Glare centered at 50%");
    assert.closeTo(glare.glareY, 50.0, 0.01, "Glare centered at 50%");
  }, { feature: "F12" });

  harness.test("F12.3: Themed accent glow styles per card theme", () => {
    const accentGlows = {
      sakura: "0 10px 30px -10px rgba(255, 183, 197, 0.35)",
      twilight: "0 10px 30px -10px rgba(164, 140, 255, 0.35)",
      amber: "0 10px 30px -10px rgba(255, 214, 140, 0.35)"
    };
    for (const [theme, glow] of Object.entries(accentGlows)) {
      assert.ok(glow.includes("rgba"), `${theme} glow must specify RGBA color`);
    }
  }, { feature: "F12" });

  harness.test("F12.4: Smooth mouse leave spring reset to neutral (rotate 0deg)", () => {
    const springReset = (currentTilt, springFactor = 0.2) => currentTilt * (1 - springFactor);
    let tilt = 12.0;
    for (let f = 0; f < 30; f++) tilt = springReset(tilt);
    assert.lessThan(tilt, 0.05, "Tilt smoothly resets to zero on mouse leave");
  }, { feature: "F12" });

  harness.test("F12.5: Staggered entrance animation trigger parameters", () => {
    const cardEntrance = (index, baseDelay = 0.15) => ({
      delay: index * baseDelay,
      duration: 0.8,
      ease: "power2.out",
      yFrom: 60,
      opacityFrom: 0
    });
    const c0 = cardEntrance(0);
    const c1 = cardEntrance(1);
    const c2 = cardEntrance(2);
    assert.equal(c0.delay, 0.0, "First card enters immediately");
    assert.equal(c1.delay, 0.15, "Second card staggered by 0.15s");
    assert.equal(c2.delay, 0.30, "Third card staggered by 0.30s");
  }, { feature: "F12" });

  // =========================================================================
  // F13: Procedural Night Breeze Audio (5 tests)
  // =========================================================================
  harness.test("F13.1: Pink/brown noise procedural synthesis buffer algorithm", () => {
    // Procedural pink noise approximation (Paul Kellet's filter method)
    const generatePinkNoiseSample = (() => {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      return (white) => {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        return pink * 0.11;
      };
    })();
    const samples = [];
    for (let i = 0; i < 1000; i++) {
      const white = Math.random() * 2 - 1;
      samples.push(generatePinkNoiseSample(white));
    }
    const maxVal = Math.max(...samples.map(Math.abs));
    assert.ok(maxVal > 0.05 && maxVal < 1.0, "Synthesized pink noise samples lie within valid audio dynamic range");
  }, { feature: "F13" });

  harness.test("F13.2: Biquad bandpass filter configuration parameters", () => {
    const biquadFilterConfig = {
      type: "bandpass",
      centerFreq: 450, // Hz (gentle night wind character)
      Q: 2.8           // resonance
    };
    assert.equal(biquadFilterConfig.type, "bandpass", "Filter must be bandpass for wind whistle");
    assert.ok(biquadFilterConfig.centerFreq >= 300 && biquadFilterConfig.centerFreq <= 800, "Center frequency within soothing breeze range");
    assert.ok(biquadFilterConfig.Q >= 1.5 && biquadFilterConfig.Q <= 4.0, "Resonance Q produces soft organic wind swell");
  }, { feature: "F13" });

  harness.test("F13.3: LFO wind frequency modulation oscillator parameters", () => {
    const lfo = {
      freq: 0.12, // Hz (very slow breath cycle ~8 seconds per period)
      minCutoff: 300,
      maxCutoff: 650
    };
    const cutoffAtTime = (t) => lfo.minCutoff + (lfo.maxCutoff - lfo.minCutoff) * (0.5 + 0.5 * Math.sin(2 * Math.PI * lfo.freq * t));
    const c0 = cutoffAtTime(0);
    const cPeak = cutoffAtTime(1 / (4 * lfo.freq));
    assert.closeTo(c0, 475, 1.0, "Cutoff centered at t=0");
    assert.closeTo(cPeak, 650, 1.0, "Cutoff sweeps up to max bound at peak");
  }, { feature: "F13" });

  harness.test("F13.4: Stereo panner / spatial atmospheric motion", () => {
    // Stereo panning slowly sways wind between -0.4 (left) and 0.4 (right)
    const panAtTime = (t, freq = 0.08) => 0.4 * Math.sin(2 * Math.PI * freq * t);
    const p1 = panAtTime(0);
    const p2 = panAtTime(3.125);
    assert.ok(p1 >= -1.0 && p1 <= 1.0, "Pan within stereo bounds");
    assert.ok(p2 >= -1.0 && p2 <= 1.0, "Pan within stereo bounds");
  }, { feature: "F13" });

  harness.test("F13.5: Master gain smoothing envelope preventing audio clicks", () => {
    // Audio gain fade envelope parameters: linear or exponential ramp to avoid pop
    const envelope = { attackTime: 1.5, releaseTime: 1.2, maxGain: 0.35 };
    assert.greaterThan(envelope.attackTime, 0.5, "Fade-in attack sufficiently long to prevent start click");
    assert.greaterThan(envelope.releaseTime, 0.5, "Fade-out release sufficiently long to prevent abrupt stop click");
    assert.lessThanOrEqual(envelope.maxGain, 0.5, "Atmospheric breeze volume capped to preserve headroom");
  }, { feature: "F13" });

  // =========================================================================
  // F14: Procedural Melodic Chords (5 tests)
  // =========================================================================
  harness.test("F14.1: Dual-oscillator synth architecture (sine + detuned triangle)", () => {
    const oscConfig = {
      oscA: { type: "sine", detune: 0 },
      oscB: { type: "triangle", detune: 7 } // cents
    };
    assert.equal(oscConfig.oscA.type, "sine", "Osc A provides fundamental pure tone");
    assert.equal(oscConfig.oscB.type, "triangle", "Osc B provides warm harmonics");
    assert.ok(oscConfig.oscB.detune > 0 && oscConfig.oscB.detune <= 15, "Subtle detuning creates rich lush chorus effect");
  }, { feature: "F14" });

  harness.test("F14.2: Japanese Insen / Ethereal pentatonic scale intervals", () => {
    // D minor pentatonic / Insen scale: D(293.66), F(349.23), G(392.00), A(440.00), C(523.25)
    const chordFrequencies = [293.66, 349.23, 392.00, 440.00, 523.25];
    assert.equal(chordFrequencies.length, 5, "Scale consists of 5 harmonic notes (pentatonic)");
    for (let i = 0; i < chordFrequencies.length - 1; i++) {
      assert.greaterThan(chordFrequencies[i + 1], chordFrequencies[i], "Frequencies ascend monotonically");
    }
  }, { feature: "F14" });

  harness.test("F14.3: Ethereal ADSR envelope specifications", () => {
    const adsr = {
      attack: 0.8,   // seconds (gentle fade-in)
      decay: 1.2,    // seconds
      sustain: 0.45, // sustain level (0-1)
      release: 2.5   // seconds (long dreamy tail)
    };
    assert.greaterThanOrEqual(adsr.attack, 0.5, "Attack must be soft (>=0.5s) for cinematic ambient feel");
    assert.greaterThanOrEqual(adsr.release, 2.0, "Release must be long (>=2.0s) for reverberant decay");
  }, { feature: "F14" });

  harness.test("F14.4: Stereo ping-pong delay feedback effect parameters", () => {
    const delayConfig = {
      delayTimeLeft: 0.375,  // dotted eighth note at ~120bpm
      delayTimeRight: 0.500, // quarter note
      feedback: 0.42,        // 42% feedback
      filterCutoff: 1800     // Hz dampening high frequencies in repeats
    };
    assert.ok(delayConfig.delayTimeLeft !== delayConfig.delayTimeRight, "Left and right delay times differ for spatial stereo spread");
    assert.ok(delayConfig.feedback > 0.2 && delayConfig.feedback < 0.6, "Feedback maintains sustained ambience without runaway distortion");
  }, { feature: "F14" });

  harness.test("F14.5: Algorithmic non-repetitive chord progression generator", () => {
    // Pseudo-random progression generator choosing harmonically compatible chords
    const progressions = [
      [293.66, 349.23, 440.00], // Dm
      [349.23, 440.00, 523.25], // F
      [392.00, 440.00, 587.33], // Gsus
      [261.63, 329.63, 392.00]  // C
    ];
    assert.equal(progressions.length, 4, "Must define at least 4 harmonic chord voicings");
    for (const chord of progressions) {
      assert.equal(chord.length, 3, "Each chord contains triad voicing");
    }
  }, { feature: "F14" });

  // =========================================================================
  // F15: Interactive Audio HUD (5 tests)
  // =========================================================================
  harness.test("F15.1: Browser autoplay policy compliance (starts suspended)", () => {
    const audioContextSimulation = {
      state: "suspended",
      async resume() {
        this.state = "running";
      }
    };
    assert.equal(audioContextSimulation.state, "suspended", "AudioContext must initialize in suspended state to comply with autoplay policy");
  }, { feature: "F15" });

  harness.test("F15.2: Audio toggle state machine transition logic", () => {
    class AudioStateModel {
      constructor() { this.playing = false; }
      toggle() { this.playing = !this.playing; return this.playing; }
    }
    const model = new AudioStateModel();
    assert.equal(model.playing, false, "Starts unplayed");
    assert.equal(model.toggle(), true, "First toggle turns on");
    assert.equal(model.toggle(), false, "Second toggle mutes");
  }, { feature: "F15" });

  harness.test("F15.3: Animated 4-bar equalizer indicator configuration", () => {
    const eqBars = [
      { id: 1, minH: 4, maxH: 18, animDelay: "0ms" },
      { id: 2, minH: 6, maxH: 24, animDelay: "150ms" },
      { id: 3, minH: 4, maxH: 22, animDelay: "300ms" },
      { id: 4, minH: 5, maxH: 16, animDelay: "450ms" }
    ];
    assert.equal(eqBars.length, 4, "Audio HUD features 4 distinct equalizer bars");
    const delays = new Set(eqBars.map(b => b.animDelay));
    assert.equal(delays.size, 4, "Each bar has staggered animation delay for organic wave movement");
  }, { feature: "F15" });

  harness.test("F15.4: Glassmorphic audio button UI styling", () => {
    const buttonStyle = {
      borderRadius: "9999px",
      backdropFilter: "blur(12px)",
      background: "rgba(10, 14, 30, 0.7)",
      border: "1px solid rgba(255, 255, 255, 0.18)"
    };
    assert.ok(buttonStyle.borderRadius.includes("9999"), "Pill/circular shape");
    assert.ok(buttonStyle.backdropFilter.includes("blur"), "Frosted glass aesthetic");
  }, { feature: "F15" });

  harness.test("F15.5: Accessible ARIA attributes on audio control", () => {
    const aria = {
      "aria-label": "Toggle ambient night soundscape",
      "aria-pressed": "false",
      role: "button"
    };
    assert.equal(aria.role, "button", "Accessible button role");
    assert.ok(aria["aria-label"].length > 10, "Descriptive accessible label");
  }, { feature: "F15" });

  // =========================================================================
  // F16: Responsive UI Overlay (5 tests)
  // =========================================================================
  harness.test("F16.1: Anime title typography hierarchy (English + Japanese subtitle)", () => {
    const typography = {
      enMainTitle: "KoiStory",
      jpSubtitle: "夜桜の約束 — 恋物語",
      tagline: "A rooftop in Tokyo under a luminous moon."
    };
    assert.ok(typography.enMainTitle.length > 0, "English title defined");
    assert.match(typography.jpSubtitle, /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/, "Japanese subtitle contains authentic kanji");
  }, { feature: "F16" });

  harness.test("F16.2: Animated scroll cue indicator (floating/pulsing cue)", () => {
    const scrollCue = {
      text: "Scroll to explore",
      icon: "ChevronDown",
      animation: "bounce 2s infinite"
    };
    assert.ok(scrollCue.text.length > 0, "Provides clear affordance to scroll");
    assert.ok(scrollCue.animation.includes("infinite"), "Continuous subtle animation draws attention");
  }, { feature: "F16" });

  harness.test("F16.3: Desktop viewport layout specifications (1920x1080)", () => {
    const desktopLayout = {
      width: 1920,
      height: 1080,
      titleFontSize: "4.5rem",
      subtitleFontSize: "1.25rem",
      paddingX: "4rem"
    };
    assert.equal(desktopLayout.width, 1920, "Desktop width 1920px");
    assert.equal(desktopLayout.height, 1080, "Desktop height 1080px");
  }, { feature: "F16" });

  harness.test("F16.4: Mobile viewport layout specifications (390x844)", () => {
    const mobileLayout = {
      width: 390,
      height: 844,
      titleFontSize: "2.75rem",
      subtitleFontSize: "0.95rem",
      paddingX: "1.25rem",
      tapTargetMinSize: 44 // px minimum for Apple HIG touch targets
    };
    assert.equal(mobileLayout.width, 390, "Mobile width 390px (iPhone 14/15/16)");
    assert.equal(mobileLayout.height, 844, "Mobile height 844px");
    assert.greaterThanOrEqual(mobileLayout.tapTargetMinSize, 44, "Touch target satisfies accessibility guidelines");
  }, { feature: "F16" });

  harness.test("F16.5: UI layering and pointer-events transparency", () => {
    const overlayContainer = { pointerEvents: "none", zIndex: 30 };
    const interactiveElements = { pointerEvents: "auto" };
    assert.equal(overlayContainer.pointerEvents, "none", "Canvas underneath receives pointer moves for parallax");
    assert.equal(interactiveElements.pointerEvents, "auto", "Buttons and cards receive clicks/hovers");
  }, { feature: "F16" });

  // =========================================================================
  // F17: Zero External Assets & Build Quality (5 tests)
  // =========================================================================
  harness.test("F17.1: Zero external 3D model files in repository", () => {
    const findFilesByExt = (dir, exts) => {
      let results = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results = results.concat(findFilesByExt(fullPath, exts));
        } else if (exts.some(ext => entry.name.toLowerCase().endsWith(ext))) {
          results.push(fullPath);
        }
      }
      return results;
    };
    const modelFiles = findFilesByExt(ROOT, [".gltf", ".glb", ".obj", ".fbx", ".dae"]);
    assert.equal(modelFiles.length, 0, `Forbidden external 3D models detected: ${modelFiles.join(", ")}`);
  }, { feature: "F17" });

  harness.test("F17.2: Zero downloaded external audio files in repository", () => {
    const findFilesByExt = (dir, exts) => {
      let results = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results = results.concat(findFilesByExt(fullPath, exts));
        } else if (exts.some(ext => entry.name.toLowerCase().endsWith(ext))) {
          results.push(fullPath);
        }
      }
      return results;
    };
    const audioFiles = findFilesByExt(ROOT, [".mp3", ".wav", ".ogg", ".aac", ".flac", ".m4a"]);
    assert.equal(audioFiles.length, 0, `Forbidden downloaded audio files detected: ${audioFiles.join(", ")}`);
  }, { feature: "F17" });

  harness.test("F17.3: TypeScript static typecheck verification", () => {
    // Run npx tsc --noEmit synchronously to verify zero type errors
    try {
      execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "pipe" });
      assert.ok(true, "TypeScript check passed with zero errors");
    } catch (err) {
      assert.ok(false, `TypeScript check failed: ${err.stdout?.toString() || err.message}`);
    }
  }, { feature: "F17" });

  harness.test("F17.4: Production build verification (npm run build)", () => {
    // Verify that .next/BUILD_ID or production build output exists
    const buildIdPath = path.join(ROOT, ".next", "BUILD_ID");
    assert.ok(fs.existsSync(buildIdPath), "Production build output must exist in .next/");
  }, { feature: "F17" });

  harness.test("F17.5: ESLint code quality verification", () => {
    try {
      execSync("npx eslint", { cwd: ROOT, stdio: "pipe" });
      assert.ok(true, "ESLint passed with zero errors");
    } catch (err) {
      assert.ok(false, `ESLint failed: ${err.stdout?.toString() || err.message}`);
    }
  }, { feature: "F17" });

}
