'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { AnimeMoonProps } from '@/types/scene';

const MOON_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const MOON_FRAG = /* glsl */ `
uniform float uTime;
varying vec2 vUv;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float perlinNoise(vec2 p) {
  vec2 pi = floor(p);
  vec2 pf = fract(p);
  vec2 w = pf * pf * (3.0 - 2.0 * pf);
  return mix(
    mix(dot(hash2(pi + vec2(0.0, 0.0)), pf - vec2(0.0, 0.0)),
        dot(hash2(pi + vec2(1.0, 0.0)), pf - vec2(1.0, 0.0)), w.x),
    mix(dot(hash2(pi + vec2(0.0, 1.0)), pf - vec2(0.0, 1.0)),
        dot(hash2(pi + vec2(1.0, 1.0)), pf - vec2(1.0, 1.0)), w.x),
    w.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * (perlinNoise(p) * 0.5 + 0.5);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = vUv - 0.5;
  float dist = length(p) * 2.0;
  if (dist > 1.0) discard;

  float edgeAA = smoothstep(1.0, 0.982, dist);

  // Domain warped lunar maria craters
  vec2 q = vec2(fbm(p * 3.0), fbm(p * 3.0 + vec2(5.2, 1.3)));
  vec2 r = vec2(fbm(p * 3.0 + 4.0 * q + vec2(1.7, 9.2)), fbm(p * 3.0 + 4.0 * q + vec2(8.3, 2.8)));
  float n = fbm((p + vec2(0.12, -0.06)) * 2.4 + 4.0 * r);

  // Makoto Shinkai anime lunar palette
  vec3 ivory = vec3(0.992, 0.984, 0.949);
  vec3 maria = vec3(0.74, 0.78, 0.88);
  vec3 deepMaria = vec3(0.62, 0.67, 0.78);

  float mariaMask = smoothstep(0.40, 0.68, n);
  vec3 surface = mix(ivory, mix(maria, deepMaria, smoothstep(0.50, 0.75, n)), mariaMask * 0.52);

  // Crater ejecta rays from simulated crater at (0.28, -0.35)
  float rayAngle = atan(p.y - (-0.35), p.x - 0.28);
  float rayDist = length(p - vec2(0.28, -0.35));
  float rayPattern = sin(rayAngle * 16.0) * 0.5 + 0.5;
  float rays = smoothstep(0.45, 0.85, rayPattern) * smoothstep(0.65, 0.05, rayDist) * 0.20;
  surface = mix(surface, ivory * 1.06, rays);

  // Celestial limb luminescence
  float rim = pow(dist, 3.8) * 0.28;
  vec3 col = surface + vec3(rim * 0.9, rim * 0.95, rim);

  gl_FragColor = vec4(col, edgeAA);
}
`;

const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const GLOW_FRAG = /* glsl */ `
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 p = vUv - 0.5;
  float dist = length(p) * 2.0;
  if (dist > 1.0) discard;

  float breath = 0.96 + 0.04 * sin(uTime * 0.85);
  float inner = exp(-pow(dist / 0.58, 2.6)) * breath;
  float outer = pow(clamp(1.0 - dist, 0.0, 1.0), 1.85) * breath;

  vec3 innerColor = vec3(0.55, 0.78, 1.0);   // Soft cyan-azure bloom
  vec3 outerColor = vec3(0.72, 0.52, 0.98);  // Ethereal lavender-violet halo
  vec3 finalColor = innerColor * (inner * 0.90) + outerColor * (outer * 0.48);
  float alpha = clamp(inner * 0.90 + outer * 0.48, 0.0, 1.0);

  gl_FragColor = vec4(finalColor, alpha);
}
`;

export function AnimeMoon({
  position = [22.0, 26.0, -135.0],
  radius = 14.0,
  haloScale = 3.85,
}: AnimeMoonProps) {
  const groupRef = useRef<THREE.Group>(null);
  const moonMatRef = useRef<THREE.ShaderMaterial>(null);
  const glowMatRef = useRef<THREE.ShaderMaterial>(null);

  const moonUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const glowUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ camera, clock }) => {
    if (groupRef.current) {
      groupRef.current.quaternion.copy(camera.quaternion);
    }
    const t = clock.getElapsedTime();
    if (moonMatRef.current) moonMatRef.current.uniforms.uTime.value = t;
    if (glowMatRef.current) glowMatRef.current.uniforms.uTime.value = t;
  });

  const haloSize = radius * haloScale;

  return (
    <group ref={groupRef} position={position} name="AnimeMoon">
      {/* Layer 2: Atmospheric Glow Billboard (Behind disc, Additive, depthWrite=false) */}
      <mesh position={[0, 0, -0.05]} renderOrder={1}>
        <planeGeometry args={[haloSize, haloSize, 1, 1]} />
        <shaderMaterial
          ref={glowMatRef}
          vertexShader={GLOW_VERT}
          fragmentShader={GLOW_FRAG}
          uniforms={glowUniforms}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent={true}
        />
      </mesh>

      {/* Layer 1: Core Moon Disc with Procedural FBM Maria */}
      <mesh position={[0, 0, 0.05]} renderOrder={2}>
        <circleGeometry args={[radius, 64]} />
        <shaderMaterial
          ref={moonMatRef}
          vertexShader={MOON_VERT}
          fragmentShader={MOON_FRAG}
          uniforms={moonUniforms}
          transparent={true}
        />
      </mesh>
    </group>
  );
}

export default AnimeMoon;
