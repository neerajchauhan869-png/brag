'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AnimeSkyDomeProps } from '@/types/scene';

const SKY_VERTEX_SHADER = /* glsl */ `
varying vec3 vWorldDir;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 0.0);
  vWorldDir = normalize(worldPos.xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKY_FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uZenithColor;
uniform vec3 uUpperSkyColor;
uniform vec3 uMidSkyColor;
uniform vec3 uTwilightColor;
uniform vec3 uHorizonColor;
uniform vec3 uCityGlowColor;
uniform vec3 uNebulaColorA;
uniform vec3 uNebulaColorB;
uniform float uStarDensity;
uniform float uNebulaIntensity;

varying vec3 vWorldDir;

#define PI 3.141592653589793

// Dave Hoskins non-trigonometric hash functions
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float hash3(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.1, 0.1));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// Analytical 3D Noise for Cosmic Nebula Dust Band
float noise3(vec3 x) {
  vec3 p = floor(x);
  vec3 w = fract(x);
  vec3 u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
  
  float n000 = hash3(p + vec3(0.0, 0.0, 0.0));
  float n100 = hash3(p + vec3(1.0, 0.0, 0.0));
  float n010 = hash3(p + vec3(0.0, 1.0, 0.0));
  float n110 = hash3(p + vec3(1.0, 1.0, 0.0));
  float n001 = hash3(p + vec3(0.0, 0.0, 1.0));
  float n101 = hash3(p + vec3(1.0, 0.0, 1.0));
  float n011 = hash3(p + vec3(0.0, 1.0, 1.0));
  float n111 = hash3(p + vec3(1.0, 1.0, 1.0));
  
  float x00 = mix(n000, n100, u.x);
  float x10 = mix(n010, n110, u.x);
  float x01 = mix(n001, n101, u.x);
  float x11 = mix(n011, n111, u.x);
  
  float y0 = mix(x00, x10, u.y);
  float y1 = mix(x01, x11, u.y);
  
  return mix(y0, y1, u.z);
}

float fbmNebula(vec3 p) {
  float f = 0.0;
  f += 0.5000 * noise3(p); p = p * 2.02;
  f += 0.2500 * noise3(p); p = p * 2.03;
  f += 0.1250 * noise3(p);
  return f / 0.875;
}

void main() {
  vec3 dir = normalize(vWorldDir);
  float h = dir.y;
  
  // -------------------------------------------------------------
  // 1. Makoto Shinkai 6-Stop Twilight Gradient
  // -------------------------------------------------------------
  vec3 skyColor;
  if (h > 0.65) {
    float t = smoothstep(0.65, 1.0, h);
    skyColor = mix(uUpperSkyColor, uZenithColor, t);
  } else if (h > 0.32) {
    float t = smoothstep(0.32, 0.65, h);
    skyColor = mix(uMidSkyColor, uUpperSkyColor, t);
  } else if (h > 0.12) {
    float t = smoothstep(0.12, 0.32, h);
    skyColor = mix(uTwilightColor, uMidSkyColor, t);
  } else if (h > 0.0) {
    float t = smoothstep(0.0, 0.12, h);
    skyColor = mix(uHorizonColor, uTwilightColor, t);
  } else {
    float t = smoothstep(-0.35, 0.0, h);
    skyColor = mix(uCityGlowColor, uHorizonColor, t);
  }
  
  // Horizon atmosphere mask: stars and nebula gently fade into urban dusk
  float horizonFade = smoothstep(0.03, 0.25, h);
  
  // -------------------------------------------------------------
  // 2. Cosmic Nebula Dust Band (Milky Way Ribbon)
  // -------------------------------------------------------------
  vec3 galaxyNormal = normalize(vec3(0.55, 0.70, -0.45));
  float galaxyLat = dot(dir, galaxyNormal);
  float nebulaEnv = exp(-galaxyLat * galaxyLat / (2.0 * 0.22 * 0.22));
  
  if (nebulaEnv > 0.01 && horizonFade > 0.01) {
    vec3 pNebula = dir * 3.8 + vec3(uTime * 0.003, 0.0, uTime * 0.002);
    float dust = fbmNebula(pNebula);
    // Dark absorption lane running through center
    float darkLane = 1.0 - 0.75 * exp(-pow(galaxyLat - 0.04 * (dust - 0.5), 2.0) / 0.006);
    vec3 nebulaCol = mix(uNebulaColorB, uNebulaColorA, smoothstep(0.32, 0.78, dust));
    float nebulaAlpha = smoothstep(0.24, 0.82, dust) * nebulaEnv * darkLane * 0.48 * horizonFade * uNebulaIntensity;
    skyColor += nebulaCol * nebulaAlpha;
  }
  
  // -------------------------------------------------------------
  // 3. Procedural Star Grid & Diffraction Spikes
  // -------------------------------------------------------------
  if (horizonFade > 0.01) {
    float phi = atan(dir.z, dir.x);
    float theta = asin(clamp(dir.y, -1.0, 1.0));
    
    // Layer 1: Dense background stars (72x36 cells around 360-deg azimuth)
    const float GRID1_X = 72.0;
    const float GRID1_Y = 36.0;
    vec2 uv1 = vec2((phi / (2.0 * PI) + 0.5) * GRID1_X, (theta / PI + 0.5) * GRID1_Y);
    vec2 cell1 = floor(uv1);
    cell1.x = mod(cell1.x, GRID1_X); // Seamless 360-deg azimuth wrap
    vec2 f1 = fract(uv1) - 0.5;
    
    float seed1 = hash12(cell1);
    if (seed1 > (1.0 - 0.38 * uStarDensity)) {
      vec2 offset1 = (hash22(cell1 + 13.5) - 0.5) * 0.6;
      vec2 delta1 = f1 - offset1;
      float dist1 = length(delta1);
      float size1 = mix(0.04, 0.12, pow(hash12(cell1 + 27.9), 2.5));
      float twinkle1 = 0.55 + 0.45 * sin(uTime * (1.8 + seed1 * 4.2) + seed1 * 6.28);
      float star1 = smoothstep(size1, 0.0, dist1) * twinkle1;
      vec3 starColor1 = mix(vec3(0.80, 0.88, 1.0), vec3(1.0, 0.95, 0.88), hash12(cell1 + 45.1));
      skyColor += starColor1 * star1 * horizonFade * 0.85;
    }
    
    // Layer 2: Hero Stars with 4-Point Cross Diffraction Spikes (24x12 cells)
    const float GRID_HERO_X = 24.0;
    const float GRID_HERO_Y = 12.0;
    vec2 uvHero = vec2((phi / (2.0 * PI) + 0.5) * GRID_HERO_X, (theta / PI + 0.5) * GRID_HERO_Y);
    vec2 cellHero = floor(uvHero);
    cellHero.x = mod(cellHero.x, GRID_HERO_X);
    vec2 fHero = fract(uvHero) - 0.5;
    
    float heroSeed = hash12(cellHero + 88.1);
    if (heroSeed > 0.80) { // Top 20% of hero cells contain prominent glints
      vec2 heroOffset = (hash22(cellHero + 61.2) - 0.5) * 0.2; // Confined to center
      vec2 dHero = fHero - heroOffset;
      float dCenter = length(dHero);
      
      float heroTwinkle = 0.65 + 0.35 * sin(uTime * (1.5 + heroSeed * 3.5) + heroSeed * 6.28);
      float heroCore = smoothstep(0.07, 0.0, dCenter) * 2.2;
      float heroHalo = max(0.0, 1.0 - dCenter / 0.22) * 0.5;
      
      // Needle-sharp cross diffraction spikes (horizontal & vertical)
      float spikeX = max(0.0, 1.0 - abs(dHero.x) / 0.38) * max(0.0, 1.0 - abs(dHero.y) / 0.018);
      float spikeY = max(0.0, 1.0 - abs(dHero.y) / 0.38) * max(0.0, 1.0 - abs(dHero.x) / 0.018);
      float diffraction = max(spikeX, spikeY) * 1.4;
      
      // Delicate 45-degree diagonal sub-spikes
      float diag1 = max(0.0, 1.0 - abs(dHero.x + dHero.y) * 2.8) * max(0.0, 1.0 - abs(dHero.x - dHero.y) * 38.0);
      float diag2 = max(0.0, 1.0 - abs(dHero.x - dHero.y) * 2.8) * max(0.0, 1.0 - abs(dHero.x + dHero.y) * 38.0);
      float diag = max(diag1, diag2) * 0.45;
      
      float totalHero = (heroCore + heroHalo + diffraction + diag) * heroTwinkle;
      vec3 heroColor = mix(vec3(0.85, 0.92, 1.0), vec3(1.0, 0.98, 0.88), hash12(cellHero + 12.3));
      skyColor += heroColor * totalHero * horizonFade;
    }
  }
  
  gl_FragColor = vec4(skyColor, 1.0);
}
`;

export function AnimeSkyDome({
  radius = 450,
  zenithColor = '#040614',
  upperSkyColor = '#0d1435',
  midSkyColor = '#1a153f',
  twilightColor = '#3e1b48',
  horizonColor = '#6b2e5c',
  cityGlowColor = '#1f1229',
  nebulaColorA = '#479ee0',
  nebulaColorB = '#8c47b8',
  starDensity = 1.0,
  nebulaIntensity = 1.0,
}: AnimeSkyDomeProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uZenithColor: { value: new THREE.Color(zenithColor) },
      uUpperSkyColor: { value: new THREE.Color(upperSkyColor) },
      uMidSkyColor: { value: new THREE.Color(midSkyColor) },
      uTwilightColor: { value: new THREE.Color(twilightColor) },
      uHorizonColor: { value: new THREE.Color(horizonColor) },
      uCityGlowColor: { value: new THREE.Color(cityGlowColor) },
      uNebulaColorA: { value: new THREE.Color(nebulaColorA) },
      uNebulaColorB: { value: new THREE.Color(nebulaColorB) },
      uStarDensity: { value: starDensity },
      uNebulaIntensity: { value: nebulaIntensity },
    }),
    [
      zenithColor,
      upperSkyColor,
      midSkyColor,
      twilightColor,
      horizonColor,
      cityGlowColor,
      nebulaColorA,
      nebulaColorB,
      starDensity,
      nebulaIntensity,
    ]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[radius, 64, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={SKY_VERTEX_SHADER}
        fragmentShader={SKY_FRAGMENT_SHADER}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={true}
      />
    </mesh>
  );
}

export default AnimeSkyDome;
