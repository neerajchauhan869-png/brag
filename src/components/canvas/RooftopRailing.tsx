'use client';

import React, { useMemo } from 'react';
import type { RooftopRailingProps } from '@/types/scene';

export function RooftopRailing({
  deckWidth = 16.0,
  deckDepth = 10.0,
  deckHeight = 0.4,
  railingHeight = 1.30,
  stanchionCount = 11,
}: RooftopRailingProps) {
  // Stanchion X positions distributed across parapet length
  const stanchionPositions = useMemo(() => {
    const positions: number[] = [];
    const minX = -6.0;
    const maxX = 6.0;
    const step = (maxX - minX) / (stanchionCount - 1);
    for (let i = 0; i < stanchionCount; i++) {
      positions.push(minX + i * step);
    }
    return positions;
  }, [stanchionCount]);

  // Thin vertical baluster positions (spaced every ~0.20m, leaving center gap for couple)
  const balusterPositions = useMemo(() => {
    const positions: number[] = [];
    const minX = -5.8;
    const maxX = 5.8;
    const step = 0.20;
    for (let x = minX; x <= maxX; x += step) {
      // Omit small gap around center where couple leans to preserve clean visual silhouette
      if (Math.abs(x) > 0.75) {
        positions.push(Number(x.toFixed(2)));
      }
    }
    return positions;
  }, []);

  return (
    <group name="rooftop-railing-system">
      {/* 1. Concrete Roof Deck Flooring Slab */}
      <mesh position={[0, -deckHeight / 2, deckDepth / 2]} receiveShadow>
        <boxGeometry args={[deckWidth, deckHeight, deckDepth]} />
        <meshStandardMaterial
          color="#161822"
          roughness={0.88}
          metalness={0.12}
        />
      </mesh>

      {/* 2. Concrete Safety Parapet Curb Wall (Front Edge) */}
      <mesh position={[0, 0.175, 0.0]}>
        <boxGeometry args={[14.0, 0.35, 0.30]} />
        <meshStandardMaterial
          color="#1e202e"
          roughness={0.82}
          metalness={0.15}
        />
      </mesh>

      {/* 3. Parapet Top Coping / Bevel Cap */}
      <mesh position={[0, 0.365, 0.0]}>
        <boxGeometry args={[14.2, 0.05, 0.36]} />
        <meshStandardMaterial
          color="#252838"
          roughness={0.75}
          metalness={0.20}
        />
      </mesh>

      {/* 4. Left & Right Parapet Return Walls (Enclosing Perimeter) */}
      <mesh position={[-7.0, 0.175, 4.0]}>
        <boxGeometry args={[0.30, 0.35, 8.0]} />
        <meshStandardMaterial color="#1e202e" roughness={0.82} metalness={0.15} />
      </mesh>
      <mesh position={[7.0, 0.175, 4.0]}>
        <boxGeometry args={[0.30, 0.35, 8.0]} />
        <meshStandardMaterial color="#1e202e" roughness={0.82} metalness={0.15} />
      </mesh>

      {/* 5. Steel Stanchion Posts with Baseplates */}
      {stanchionPositions.map((posX, idx) => (
        <group key={`stanchion-${idx}`} position={[posX, 0.39, 0.0]}>
          {/* Welded Anchor Baseplate */}
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[0.10, 0.02, 0.10]} />
            <meshStandardMaterial color="#222430" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Vertical Post */}
          <mesh position={[0, (railingHeight - 0.39) / 2, 0]}>
            <cylinderGeometry args={[0.032, 0.032, railingHeight - 0.39, 12]} />
            <meshStandardMaterial color="#282b3a" roughness={0.35} metalness={0.75} />
          </mesh>
        </group>
      ))}

      {/* 6. Ergonomic Top Handrail (Horizontal Cylinder at Japanese code height 1.30m) */}
      <mesh position={[0, railingHeight, 0.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 14.0, 24]} />
        <meshStandardMaterial color="#303446" roughness={0.30} metalness={0.80} />
      </mesh>

      {/* 7. Intermediate Safety Mid-Rail (Height 0.85m) */}
      <mesh position={[0, 0.85, 0.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 14.0, 16]} />
        <meshStandardMaterial color="#282b3a" roughness={0.35} metalness={0.75} />
      </mesh>

      {/* 8. Lower Intermediate Safety Rail (Height 0.52m) */}
      <mesh position={[0, 0.52, 0.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 14.0, 16]} />
        <meshStandardMaterial color="#282b3a" roughness={0.35} metalness={0.75} />
      </mesh>

      {/* 9. Vertical Safety Balusters */}
      {balusterPositions.map((posX, idx) => (
        <mesh key={`baluster-${idx}`} position={[posX, 0.84, 0.0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.88, 8]} />
          <meshStandardMaterial color="#252836" roughness={0.40} metalness={0.70} />
        </mesh>
      ))}
    </group>
  );
}

export default RooftopRailing;
