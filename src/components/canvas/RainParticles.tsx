'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RainParticlesProps } from '@/types/scene';

/**
 * Deterministic 32-bit PRNG (mulberry32) for reproducible initialization
 * compliant with React 19 render purity rules.
 */
function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface RainBuffers {
  pos: Float32Array;
  speed: Float32Array;
  windX: Float32Array;
  splash: Float32Array; // 0 = falling, >0 = splash progress
  length: Float32Array;
}

function initRainBuffers(count: number): RainBuffers {
  const rng = createPRNG(83921);
  const pos = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  const windX = new Float32Array(count);
  const splash = new Float32Array(count);
  const length = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Spatial volume covering camera field, rooftop deck, and deep skyline canyon
    pos[i3] = (rng() - 0.5) * 28.0;      // X: [-14.0, 14.0]
    pos[i3 + 1] = -20.0 + rng() * 34.0;  // Y: [-20.0, 14.0]
    pos[i3 + 2] = -15.0 + rng() * 25.0;  // Z: [-15.0, 10.0]

    // Terminal velocity of rapid Tokyo rain: [22.0, 28.0] m/s
    speed[i] = 22.0 + rng() * 6.0;
    // Slight wind shear blowing east
    windX[i] = -1.2 + (rng() - 0.5) * 0.4;
    splash[i] = 0.0;
    length[i] = 0.55 + rng() * 0.25;
  }

  return { pos, speed, windX, splash, length };
}

/**
 * Instanced 3D particle system for Tokyo Rain theme.
 * High-performance single draw-call (750 raindrops) with rooftop splash physics & zero-GC frame updates.
 */
export function RainParticles({
  count: targetCount = 750,
  speed: baseSpeedMultiplier = 1.0,
  yMin = -22.0,
  yMax = 14.0,
}: RainParticlesProps) {
  const count = Math.max(100, Math.min(1500, targetCount));
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Pre-allocated typed arrays in ref
  const buffersRef = useRef<RainBuffers | null>(null);
  if (buffersRef.current === null) {
    buffersRef.current = initRainBuffers(count);
  }

  // Pre-allocated scratch calculation objects (zero GC in useFrame)
  const scratchRef = useRef({
    matrix: new THREE.Matrix4(),
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    scaleVec: new THREE.Vector3(),
    euler: new THREE.Euler(0, 0, 0, 'XYZ'),
    color: new THREE.Color(),
  });

  // Vertical slender streak geometry: 0.012m width, 0.7m length
  const rainGeometry = useMemo(() => {
    return new THREE.BoxGeometry(0.012, 0.7, 0.012);
  }, []);

  // Luminous cool neon-lit rain material
  const rainMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#93c5fd', // Ethereal icy blue
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Initialize instance matrices and colors once
  useEffect(() => {
    const mesh = meshRef.current;
    const buffers = buffersRef.current;
    if (!mesh || !buffers) return;

    const { matrix, position, quaternion, scaleVec, color } = scratchRef.current;
    quaternion.identity();
    scaleVec.set(1, 1, 1);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      position.set(buffers.pos[i3], buffers.pos[i3 + 1], buffers.pos[i3 + 2]);
      matrix.compose(position, quaternion, scaleVec);
      mesh.setMatrixAt(i, matrix);

      // Subtle color gradient variation between light cyan and pale lavender neon
      if (i % 3 === 0) {
        color.set('#67e8f9'); // Neon cyan
      } else if (i % 3 === 1) {
        color.set('#93c5fd'); // Soft cool blue
      } else {
        color.set('#c4b5fd'); // Distant neon violet reflection
      }
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count]);

  // Frame update loop: rapid downward fall, wind slant, rooftop floor splash & recycling
  useFrame((_, rawDelta) => {
    const mesh = meshRef.current;
    const buffers = buffersRef.current;
    if (!mesh || !buffers) return;

    const delta = Math.min(rawDelta, 0.05);
    const { pos, speed, windX, splash, length } = buffers;
    const { matrix, position, quaternion, scaleVec, euler } = scratchRef.current;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      if (splash[i] > 0.0) {
        // Active splash animation on rooftop floor
        splash[i] += delta * 7.5; // ~0.13s splash duration

        if (splash[i] >= 1.0) {
          // Splash finished: recycle back to sky
          splash[i] = 0.0;
          pos[i3 + 1] = yMax + Math.random() * 2.0;
          pos[i3] = (Math.random() - 0.5) * 28.0;
          pos[i3 + 2] = -15.0 + Math.random() * 25.0;
        }

        const splashProgress = splash[i];
        const ringScale = (1.0 - splashProgress) * 2.2;
        position.set(pos[i3], pos[i3 + 1], pos[i3 + 2]);
        euler.set(0, 0, 0);
        quaternion.setFromEuler(euler);
        scaleVec.set(ringScale, 0.04, ringScale); // Flattens into a subtle circular splash disc
        matrix.compose(position, quaternion, scaleVec);
        mesh.setMatrixAt(i, matrix);
        continue;
      }

      // Normal falling trajectory
      const vy = speed[i] * baseSpeedMultiplier;
      const vx = windX[i];

      pos[i3 + 1] -= vy * delta;
      pos[i3] += vx * delta;

      const px = pos[i3];
      const py = pos[i3 + 1];
      const pz = pos[i3 + 2];

      // Rooftop deck collision check: deck bounds [-6.5, 6.5] x [-6.5, 3.5] at height y ~ 0.05
      const onRooftop = px >= -6.5 && px <= 6.5 && pz >= -6.5 && pz <= 3.5;

      if (onRooftop && py <= 0.12 && py >= -0.25) {
        // Hit rooftop floor: trigger splash
        splash[i] = 0.01;
        pos[i3 + 1] = 0.04; // Pin to rooftop slab floor
        position.set(px, 0.04, pz);
        euler.set(0, 0, 0);
        quaternion.setFromEuler(euler);
        scaleVec.set(0.8, 0.04, 0.8);
        matrix.compose(position, quaternion, scaleVec);
        mesh.setMatrixAt(i, matrix);
        continue;
      }

      // Drop recycles if past bottom of urban canyon
      if (py < yMin) {
        pos[i3 + 1] = yMax + Math.random() * 2.0;
        pos[i3] = (Math.random() - 0.5) * 28.0;
        pos[i3 + 2] = -15.0 + Math.random() * 25.0;
      }

      // Falling streak transformation: slanted along wind vector
      const slantAngle = Math.atan2(vx, -vy);
      euler.set(0, 0, slantAngle);
      quaternion.setFromEuler(euler);
      position.set(pos[i3], pos[i3 + 1], pos[i3 + 2]);
      scaleVec.set(1.0, length[i], 1.0);
      matrix.compose(position, quaternion, scaleVec);
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[rainGeometry, rainMaterial, count]}
      name="TokyoRainParticles"
      frustumCulled={false}
    />
  );
}

export default RainParticles;
