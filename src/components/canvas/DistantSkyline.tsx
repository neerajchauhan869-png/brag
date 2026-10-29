'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { DistantSkylineProps } from '@/types/scene';

interface BuildingData {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  tier: number;
  seed: number;
  isSpire: boolean;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SKYLINE_VERT = /* glsl */ `
attribute float aTier;
attribute float aBuildingSeed;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vTier;
varying float vBuildingSeed;

void main() {
  vTier = aTier;
  vBuildingSeed = aBuildingSeed;

  #ifdef USE_INSTANCING
    vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix * instanceMatrix) * normal);
  #else
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
  #endif

  vWorldPos = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const SKYLINE_FRAG = /* glsl */ `
uniform float uTime;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vTier;
varying float vBuildingSeed;

void main() {
  bool isRoof = abs(vNormal.y) > 0.65;
  float horiz = abs(vNormal.x) > 0.5 ? vWorldPos.z : vWorldPos.x;
  float vert = vWorldPos.y;

  // Window grid UV coordinates
  vec2 winGrid = vec2(horiz / 1.15, vert / 1.75);
  vec2 cell = floor(winGrid);
  vec2 uvInCell = fract(winGrid);

  // Window frame & mullions mask
  float winMask = step(0.18, uvInCell.x) * step(uvInCell.x, 0.82) *
                  step(0.20, uvInCell.y) * step(uvInCell.y, 0.82);

  // Procedural occupancy & office clustering
  float occupancy = 0.28 + 0.38 * fract(sin(vBuildingSeed * 53.123) * 43758.5453);
  float floorHash = fract(sin(dot(vec2(cell.y, vBuildingSeed * 17.0), vec2(12.9898, 78.233))) * 43758.5453);
  float winHash = fract(sin(dot(cell + vec2(vBuildingSeed * 43.0, vBuildingSeed * 89.0), vec2(37.1, 91.7))) * 43758.5453);
  float litScore = winHash * 0.60 + floorHash * 0.40;
  bool isLit = litScore < occupancy;

  // Color selection: Warm Golden Amber vs Cool Modern Cyan
  vec3 warmAmber = vec3(1.0, 0.82, 0.48);
  vec3 coolCyan = vec3(0.68, 0.88, 1.0);
  float colorPick = fract(sin(dot(cell * 3.1 + vec2(vBuildingSeed, cell.y), vec2(19.3, 47.9))) * 43758.5453);
  vec3 litColor = colorPick > 0.30 ? warmAmber : coolCyan;

  // Subtle late-night window twinkle
  if (litScore > 0.92) {
    litColor *= 0.85 + 0.30 * sin(uTime * 3.5 + winHash * 6.28);
  }

  vec3 darkGlass = vec3(0.04, 0.05, 0.11) + vec3(0.06, 0.05, 0.14) * smoothstep(-10.0, 30.0, vWorldPos.y);
  vec3 windowColor = isLit ? litColor : darkGlass;
  vec3 wallColor = vec3(0.055, 0.065, 0.11);
  vec3 roofColor = vec3(0.03, 0.035, 0.06);

  vec3 surface = isRoof ? roofColor : mix(wallColor, windowColor, winMask);

  // Atmospheric twilight depth fog
  float depthDist = max(0.0, -vWorldPos.z - 25.0);
  float fogDensity = 0.0125;
  float fogFactor = clamp(1.0 - exp(-pow(depthDist * fogDensity, 1.25)), 0.0, 0.88);
  vec3 twilightHaze = vec3(0.08, 0.06, 0.16) + vec3(0.16, 0.09, 0.15) * smoothstep(12.0, -10.0, vWorldPos.y);
  vec3 finalColor = mix(surface, twilightHaze, fogFactor);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const BEACON_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  #ifdef USE_INSTANCING
    vec4 mvPos = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  #else
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  #endif
  gl_Position = projectionMatrix * mvPos;
}
`;

const BEACON_FRAG = /* glsl */ `
uniform float uTime;
varying vec2 vUv;

void main() {
  // ICAO dual-flash aviation strobe every 1.5s
  float cycle = mod(uTime, 1.5);
  float f1 = smoothstep(0.0, 0.04, cycle) * (1.0 - smoothstep(0.12, 0.20, cycle));
  float f2 = smoothstep(0.26, 0.30, cycle) * (1.0 - smoothstep(0.38, 0.46, cycle));
  float strobe = clamp((f1 + f2) * 2.5, 0.12, 2.8);

  float dist = length(vUv - 0.5) * 2.0;
  if (dist > 1.0) discard;

  float alpha = clamp(1.0 - dist, 0.0, 1.0);
  float core = pow(alpha, 3.0);
  float halo = pow(alpha, 1.5);

  vec3 beaconRed = vec3(1.0, 0.08, 0.08);
  vec3 coreWhite = vec3(1.0, 0.85, 0.85);
  vec3 col = mix(beaconRed, coreWhite, core * 0.70) * strobe;

  gl_FragColor = vec4(col, halo * clamp(strobe, 0.2, 1.0));
}
`;

export function DistantSkyline({
  buildingCount = 120,
  seed = 198906,
}: DistantSkylineProps) {
  const buildingsMeshRef = useRef<THREE.InstancedMesh>(null);
  const spiresMeshRef = useRef<THREE.InstancedMesh>(null);
  const beaconsMeshRef = useRef<THREE.InstancedMesh>(null);
  const skylineMatRef = useRef<THREE.ShaderMaterial>(null);
  const beaconMatRef = useRef<THREE.ShaderMaterial>(null);

  const skylineUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const beaconUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  // Generate deterministic buildings data
  const { buildings, spires } = useMemo(() => {
    const rng = mulberry32(seed);
    const list: BuildingData[] = [];

    for (let i = 0; i < buildingCount; i++) {
      let tier = 1;
      let z = -97.5;
      let h = 32.0;
      let w = 6.0;
      let d = 6.0;

      if (i < 45) {
        // Tier 1: Distant background
        tier = 1;
        z = -110.0 + rng() * 25.0;
        h = 18.0 + rng() * 28.0;
        w = 4.5 + rng() * 4.0;
        d = 4.5 + rng() * 4.0;
      } else if (i < 90) {
        // Tier 2: Mid-distance skyline
        tier = 2;
        z = -80.0 + rng() * 25.0;
        h = 14.0 + rng() * 28.0;
        w = 3.8 + rng() * 3.7;
        d = 3.8 + rng() * 3.7;
      } else {
        // Tier 3: Foreground commercial rooftops
        tier = 3;
        z = -52.0 + rng() * 20.0;
        h = 8.0 + rng() * 16.0;
        w = 3.0 + rng() * 3.5;
        d = 3.0 + rng() * 3.5;
      }

      const x = -72.0 + rng() * 144.0;
      const bSeed = rng();

      list.push({ x, z, w, h, d, tier, seed: bSeed, isSpire: false });
    }

    // Sort to find 12 tallest towers for antenna spires
    const sortedIndices = [...list.keys()].sort((a, b) => list[b].h - list[a].h);
    const spireBuildings: BuildingData[] = [];
    for (let s = 0; s < 12; s++) {
      const idx = sortedIndices[s];
      list[idx].isSpire = true;
      spireBuildings.push(list[idx]);
    }

    return { buildings: list, spires: spireBuildings };
  }, [buildingCount, seed]);

  // Initialize InstancedMesh matrices and custom attributes
  useEffect(() => {
    if (!buildingsMeshRef.current) return;
    const mesh = buildingsMeshRef.current;
    const dummy = new THREE.Object3D();
    const baseY = -12.0;

    const tierArray = new Float32Array(buildings.length);
    const seedArray = new Float32Array(buildings.length);

    buildings.forEach((b, i) => {
      dummy.position.set(b.x, baseY + b.h / 2, b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      tierArray[i] = b.tier;
      seedArray[i] = b.seed;
    });

    mesh.instanceMatrix.needsUpdate = true;
    mesh.geometry.setAttribute('aTier', new THREE.InstancedBufferAttribute(tierArray, 1));
    mesh.geometry.setAttribute('aBuildingSeed', new THREE.InstancedBufferAttribute(seedArray, 1));
  }, [buildings]);

  // Initialize Spires & Beacons
  useEffect(() => {
    if (!spiresMeshRef.current || !beaconsMeshRef.current) return;
    const spiresMesh = spiresMeshRef.current;
    const beaconsMesh = beaconsMeshRef.current;
    const dummy = new THREE.Object3D();
    const baseY = -12.0;

    spires.forEach((b, i) => {
      // Spire Mast: height 6.0m
      dummy.position.set(b.x, baseY + b.h + 3.0, b.z);
      dummy.scale.set(1.0, 1.0, 1.0);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      spiresMesh.setMatrixAt(i, dummy.matrix);

      // Warning Beacon Billboard: tip of mast
      dummy.position.set(b.x, baseY + b.h + 6.0, b.z);
      dummy.updateMatrix();
      beaconsMesh.setMatrixAt(i, dummy.matrix);
    });

    spiresMesh.instanceMatrix.needsUpdate = true;
    beaconsMesh.instanceMatrix.needsUpdate = true;
  }, [spires]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (skylineMatRef.current) skylineMatRef.current.uniforms.uTime.value = t;
    if (beaconMatRef.current) beaconMatRef.current.uniforms.uTime.value = t;
  });

  return (
    <group name="DistantSkyline">
      {/* 120 Skyscraper Buildings (1 Draw Call) */}
      <instancedMesh
        ref={buildingsMeshRef}
        args={[undefined, undefined, buildings.length]}
        castShadow={false}
        receiveShadow={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <shaderMaterial
          ref={skylineMatRef}
          vertexShader={SKYLINE_VERT}
          fragmentShader={SKYLINE_FRAG}
          uniforms={skylineUniforms}
        />
      </instancedMesh>

      {/* 12 Antenna Spires (1 Draw Call) */}
      <instancedMesh
        ref={spiresMeshRef}
        args={[undefined, undefined, spires.length]}
      >
        <cylinderGeometry args={[0.04, 0.08, 6.0, 6]} />
        <meshBasicMaterial color={0x181a24} />
      </instancedMesh>

      {/* 12 Aviation Beacons (1 Draw Call) */}
      <instancedMesh
        ref={beaconsMeshRef}
        args={[undefined, undefined, spires.length]}
      >
        <planeGeometry args={[1.8, 1.8]} />
        <shaderMaterial
          ref={beaconMatRef}
          vertexShader={BEACON_VERT}
          fragmentShader={BEACON_FRAG}
          uniforms={beaconUniforms}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}

export default DistantSkyline;
