'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LanternData {
  baseX: number;
  baseY: number;
  baseZ: number;
  speed: number;
  swayFreq: number;
  swayAmp: number;
  phase: number;
  scale: number;
}

export interface FloatingLanternsProps {
  count?: number;
  triggerCount?: number;
}

// Deterministic pseudo-random generation outside render for React 19 purity compliance
function generateLanternList(): LanternData[] {
  const list: LanternData[] = [];
  for (let i = 0; i < 60; i++) {
    const s1 = Math.sin(i * 12.9898) * 43758.5453;
    const r1 = s1 - Math.floor(s1);
    const s2 = Math.sin((i + 1) * 78.233) * 43758.5453;
    const r2 = s2 - Math.floor(s2);
    const s3 = Math.sin((i + 2) * 45.164) * 43758.5453;
    const r3 = s3 - Math.floor(s3);
    const s4 = Math.sin((i + 3) * 91.321) * 43758.5453;
    const r4 = s4 - Math.floor(s4);

    list.push({
      baseX: (r1 - 0.5) * 22,
      baseY: -8 + r2 * 24,
      baseZ: -2 - r3 * 25,
      speed: 0.4 + r4 * 0.5,
      swayFreq: 0.6 + r1 * 0.8,
      swayAmp: 0.3 + r2 * 0.5,
      phase: r3 * Math.PI * 2,
      scale: 0.8 + r4 * 0.5,
    });
  }
  return list;
}

const STATIC_LANTERNS = generateLanternList();

export function FloatingLanterns({
  count = 16,
  triggerCount = 0,
}: FloatingLanternsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Total lanterns includes base ambient lanterns + triggered lanterns
  const totalCount = useMemo(
    () => Math.min(60, count + triggerCount * 2),
    [count, triggerCount]
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < totalCount; i++) {
      const data = STATIC_LANTERNS[i];
      // Continuous gentle ascent with cycle wrapping
      const ySpan = 38;
      const currentY = ((data.baseY + t * data.speed + 12) % ySpan) - 12;

      const swayX = Math.sin(t * data.swayFreq + data.phase) * data.swayAmp;
      const swayZ =
        Math.cos(t * data.swayFreq * 0.7 + data.phase) * (data.swayAmp * 0.6);

      dummy.position.set(data.baseX + swayX, currentY, data.baseZ + swayZ);

      // Subtle atmospheric flicker
      const flicker = 1.0 + Math.sin(t * 4 + data.phase) * 0.08;
      dummy.scale.set(
        data.scale * flicker,
        data.scale * 1.35 * flicker,
        data.scale * flicker
      );

      dummy.rotation.set(
        Math.sin(t * 0.5 + data.phase) * 0.08,
        t * 0.2 + data.phase,
        Math.cos(t * 0.5 + data.phase) * 0.08
      );

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, 60]}
      count={totalCount}
    >
      <boxGeometry args={[0.32, 0.44, 0.32]} />
      <meshStandardMaterial
        color="#ffa347"
        emissive="#ff6d19"
        emissiveIntensity={2.4}
        roughness={0.3}
        transparent
        opacity={0.92}
      />
    </instancedMesh>
  );
}

export default FloatingLanterns;
