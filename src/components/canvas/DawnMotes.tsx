'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { DawnMotesProps } from '@/types/scene';

/**
 * Deterministic 32-bit PRNG (mulberry32) for reproducible initialization
 * strictly compliant with React 19 render purity rules.
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

interface MoteBuffers {
  pos: Float32Array;
  driftSpeed: Float32Array;
  swayPhase: Float32Array;
  swayFreq: Float32Array;
  swayAmp: Float32Array;
  pulseFreq: Float32Array;
  baseScale: Float32Array;
  paletteType: Uint8Array;
}

function initMoteBuffers(count: number): MoteBuffers {
  const rng = createPRNG(54829);
  const pos = new Float32Array(count * 3);
  const driftSpeed = new Float32Array(count);
  const swayPhase = new Float32Array(count);
  const swayFreq = new Float32Array(count);
  const swayAmp = new Float32Array(count);
  const pulseFreq = new Float32Array(count);
  const baseScale = new Float32Array(count);
  const paletteType = new Uint8Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Bounding envelope around rooftop deck and foreground framing
    pos[i3] = (rng() - 0.5) * 22.0;     // X: [-11.0, 11.0]
    pos[i3 + 1] = -1.5 + rng() * 10.5;  // Y: [-1.5, 9.0]
    pos[i3 + 2] = -9.0 + rng() * 17.0;  // Z: [-9.0, 8.0]

    // Gentle thermal ascent in early morning Tokyo air: [0.15, 0.38] m/s
    driftSpeed[i] = 0.15 + rng() * 0.23;
    swayPhase[i] = rng() * Math.PI * 2;
    swayFreq[i] = 0.6 + rng() * 1.2;
    swayAmp[i] = 0.15 + rng() * 0.25;
    pulseFreq[i] = 1.4 + rng() * 1.8;
    baseScale[i] = 0.6 + rng() * 0.7;

    // Palette: 0 = golden buttercup, 1 = warm amber, 2 = sunrise peach
    const pRand = rng();
    paletteType[i] = pRand < 0.45 ? 0 : pRand < 0.8 ? 1 : 2;
  }

  return {
    pos,
    driftSpeed,
    swayPhase,
    swayFreq,
    swayAmp,
    pulseFreq,
    baseScale,
    paletteType,
  };
}

/**
 * Instanced 3D particle system for Golden Dawn theme.
 * Renders warm floating morning sun motes that catch the rising Tokyo dawn light.
 */
export function DawnMotes({
  count: targetCount = 220,
  driftSpeed: speedMultiplier = 1.0,
  yMin = -1.8,
  yMax = 9.2,
}: DawnMotesProps) {
  const count = Math.max(50, Math.min(800, targetCount));
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const buffersRef = useRef<MoteBuffers | null>(null);
  if (buffersRef.current === null) {
    buffersRef.current = initMoteBuffers(count);
  }

  const scratchRef = useRef({
    matrix: new THREE.Matrix4(),
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    scaleVec: new THREE.Vector3(),
    color: new THREE.Color(),
  });

  // Faceted icosahedron geometry reflecting morning light: 0.045m radius
  const moteGeometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(0.045, 0);
  }, []);

  // Luminous sunrise additive material
  const moteMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#fef08a',
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    const buffers = buffersRef.current;
    if (!mesh || !buffers) return;

    const { matrix, position, quaternion, scaleVec, color } = scratchRef.current;
    quaternion.identity();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      position.set(buffers.pos[i3], buffers.pos[i3 + 1], buffers.pos[i3 + 2]);
      const s = buffers.baseScale[i];
      scaleVec.set(s, s, s);
      matrix.compose(position, quaternion, scaleVec);
      mesh.setMatrixAt(i, matrix);

      const pType = buffers.paletteType[i];
      if (pType === 0) {
        color.set('#fef08a'); // Soft golden buttercup
      } else if (pType === 1) {
        color.set('#fde047'); // Warm radiant amber
      } else {
        color.set('#fed7aa'); // Sunrise apricot/peach
      }
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count]);

  // Frame update loop: gentle upward drift, organic Brownian sway & glinting shimmer
  useFrame((state, rawDelta) => {
    const mesh = meshRef.current;
    const buffers = buffersRef.current;
    if (!mesh || !buffers) return;

    const delta = Math.min(rawDelta, 0.05);
    const time = state.clock.getElapsedTime();
    const {
      pos,
      driftSpeed,
      swayPhase,
      swayFreq,
      swayAmp,
      pulseFreq,
      baseScale,
    } = buffers;
    const { matrix, position, quaternion, scaleVec } = scratchRef.current;
    quaternion.identity();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Thermal ascent
      pos[i3 + 1] += driftSpeed[i] * speedMultiplier * delta;

      // Wrap around top/bottom bounds
      if (pos[i3 + 1] > yMax) {
        pos[i3 + 1] = yMin;
      }

      // Horizontal subtle harmonic drift
      const phase = swayPhase[i];
      const freq = swayFreq[i];
      const amp = swayAmp[i];

      const currentX = pos[i3] + Math.sin(time * freq + phase) * amp;
      const currentY = pos[i3 + 1];
      const currentZ = pos[i3 + 2] + Math.cos(time * freq * 0.8 + phase) * amp;

      position.set(currentX, currentY, currentZ);

      // Shimmering optical glint
      const shimmer = 0.82 + 0.36 * Math.sin(time * pulseFreq[i] + phase);
      const s = baseScale[i] * shimmer;
      scaleVec.set(s, s, s);

      matrix.compose(position, quaternion, scaleVec);
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[moteGeometry, moteMaterial, count]}
      name="GoldenDawnMotes"
      frustumCulled={false}
    />
  );
}

export default DawnMotes;
