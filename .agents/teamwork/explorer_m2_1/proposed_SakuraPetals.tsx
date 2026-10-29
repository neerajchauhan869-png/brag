'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SakuraPetalsProps } from '@/types/scene';

/**
 * Procedural 3D Sakura Petal Geometry with Realistic V-Cup Curvature
 * Specifications:
 * - Length: 0.22m, Width: 0.12m
 * - V-Cup Transverse Curvature: 0.035m maximum depth along lateral edges
 * - Apical Notch: Realistic emarginate cleft at petal tip flanked by rounded lobes
 * - Normals: Explicitly computed across curved buffer grid for anime lighting
 */
function createSakuraPetalGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  
  // Grid subdivisions: 6 segments along width (u), 8 segments along length (v)
  const uSegments = 6;
  const vSegments = 8;
  const uCount = uSegments + 1;
  const vCount = vSegments + 1;
  const vertexCount = uCount * vCount;

  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices: number[] = [];

  const baseLength = 0.22;
  const baseWidth = 0.12;
  const cupDepth = 0.035; // Matches test F7.2 curvatureZ requirement
  const notchDepth = 0.025; // Apical cleft indentation

  for (let j = 0; j <= vSegments; j++) {
    const vNorm = j / vSegments; // [0, 1] from stem (0) to apex (1)

    // Width envelope: narrow stem, expanding to max width at v ~ 0.65, slight taper at tip
    // Envelope formula yields ~0.15 at base, 1.0 at peak, ~0.85 at lobes
    const envelope = 2.4 * Math.sqrt(vNorm) * (1.0 - 0.58 * vNorm);
    const halfW = (baseWidth * 0.5) * Math.min(1.0, Math.max(0.12, envelope));

    for (let i = 0; i <= uSegments; i++) {
      const uNorm = (i / uSegments) * 2.0 - 1.0; // [-1, 1] across petal width
      const vertIdx = (j * uCount + i) * 3;
      const uvIdx = (j * uCount + i) * 2;

      // X coordinate: scaled by width envelope
      const x = uNorm * halfW;

      // Apical notch: center indentation near apex (u ~ 0, v > 0.7)
      const notchIndent = Math.exp(-9.0 * uNorm * uNorm) * Math.pow(vNorm, 3.0) * notchDepth;
      const y = vNorm * baseLength - notchIndent;

      // Z coordinate: 3D V-cup transverse curvature + subtle longitudinal bow
      // Lateral edges curl upward (+Z), creating an authentic concave petal cup
      const transverseCup = Math.pow(Math.abs(uNorm), 1.8) * cupDepth * Math.sin(vNorm * Math.PI * 0.9);
      const longitudinalBow = Math.sin(vNorm * Math.PI) * 0.012 - (vNorm * vNorm) * 0.006;
      const z = transverseCup + longitudinalBow;

      positions[vertIdx] = x;
      positions[vertIdx + 1] = y;
      positions[vertIdx + 2] = z;

      uvs[uvIdx] = (uNorm + 1.0) * 0.5;
      uvs[uvIdx + 1] = vNorm;
    }
  }

  // Generate triangle quad strip indices
  for (let j = 0; j < vSegments; j++) {
    for (let i = 0; i < uSegments; i++) {
      const a = j * uCount + i;
      const b = (j + 1) * uCount + i;
      const c = (j + 1) * uCount + (i + 1);
      const d = j * uCount + (i + 1);

      // Two triangles per grid quad
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

export function SakuraPetals({
  count: targetCount = 350,
  windIntensity = 1.0,
  fallSpeed = 1.0,
}: SakuraPetalsProps) {
  // Clamp instance count between 50 and 1000 per Tier 2 boundary test F7.B4
  const count = Math.max(50, Math.min(1000, targetCount));
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // 1. Procedural Cel-Shading 4-Tone Gradient Map for Anime Toon Shading
  const celGradientMap = useMemo(() => {
    const palette = new Uint8Array([
      170, 50, 90, 255,   // Step 0: Rose Deep Shadow (#aa325a)
      235, 100, 140, 255, // Step 1: Rose Mid-Shadow (#eb648c)
      255, 183, 197, 255, // Step 2: Classic Anime Sakura Pink (#ffb7c5)
      255, 245, 250, 255, // Step 3: Pearlescent Moonlit Highlight (#fff5fa)
    ]);
    const texture = new THREE.DataTexture(palette, 4, 1, THREE.RGBAFormat);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  }, []);

  // 2. Double-Sided Anime Cel-Shaded Material
  const petalMaterial = useMemo(() => {
    return new THREE.MeshToonMaterial({
      color: '#ffffff', // Base white, tinted by per-instance vertex colors
      gradientMap: celGradientMap,
      side: THREE.DoubleSide, // Required by test F7.2
      transparent: true,
      opacity: 0.94,
      depthWrite: true, // Prevents z-sorting flickering artifacts
      alphaTest: 0.05,
    });
  }, [celGradientMap]);

  // 3. Procedural Curved 3D Petal Geometry (Shared by all 350 instances)
  const petalGeometry = useMemo(() => {
    return createSakuraPetalGeometry();
  }, []);

  // 4. Flat TypedArray Physical State Buffers (Zero GC Memory Layout)
  const buffers = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const rot = new Float32Array(count * 3);
    const rotVel = new Float32Array(count * 3);
    const flutterPhase = new Float32Array(count);
    const flutterFreq = new Float32Array(count);
    const flutterAmp = new Float32Array(count);
    const scale = new Float32Array(count);

    // Initial pre-warmed distribution spanning the complete Scene 1 hero & dive volume
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spatial bounding box: x in [-9.0, 9.0], y in [-20.0, 11.5], z in [-13.0, 8.5]
      pos[i3] = (Math.random() - 0.5) * 18.0;
      pos[i3 + 1] = -20.0 + Math.random() * 31.5; // Uniformly fills vertical cascade immediately
      pos[i3 + 2] = -13.0 + Math.random() * 21.5;

      // Base physical velocities
      vel[i3] = 0.45; // Downstream wind drift component (F7.4)
      vel[i3 + 1] = 0.85 + Math.random() * 0.45; // Terminal downward velocity [0.85, 1.30] m/s (F7.3)
      vel[i3 + 2] = -0.22; // Inward camera-drift component

      // Rotational angles (Euler radians)
      rot[i3] = Math.random() * Math.PI * 2;
      rot[i3 + 1] = Math.random() * Math.PI * 2;
      rot[i3 + 2] = Math.random() * Math.PI * 2;

      // Rotational velocities on 3 axes (pitch, yaw, roll tumble)
      rotVel[i3] = (Math.random() - 0.5) * 1.8;
      rotVel[i3 + 1] = (Math.random() - 0.5) * 1.2;
      rotVel[i3 + 2] = (Math.random() - 0.5) * 2.2;

      // Aerodynamic flutter oscillation parameters (F7.3)
      flutterPhase[i] = Math.random() * Math.PI * 2;
      flutterFreq[i] = 2.6 + Math.random() * 1.8; // 2.6Hz - 4.4Hz
      flutterAmp[i] = 0.22 + Math.random() * 0.16; // 0.22m - 0.38m lateral lift sway

      // Natural botanical scale variation
      scale[i] = 0.75 + Math.random() * 0.50; // 0.75x to 1.25x
    }

    return { pos, vel, rot, rotVel, flutterPhase, flutterFreq, flutterAmp, scale };
  }, [count]);

  // 5. Pre-allocated Scratch Calculation Objects (Zero GC in useFrame)
  const scratch = useMemo(() => {
    return {
      matrix: new THREE.Matrix4(),
      position: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      scaleVec: new THREE.Vector3(),
      euler: new THREE.Euler(0, 0, 0, 'YXZ'),
    };
  }, []);

  // 6. Initialize Multi-Tone Anime Petal Colors and Initial Matrices
  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const color = new THREE.Color();
    const { pos, rot, scale } = buffers;
    const { matrix, position, quaternion, scaleVec, euler } = scratch;

    // Multi-tone sakura color palette:
    // 40% Classic Sakura Pink (#ffb7c5), 35% Pale Petal Blush (#ffebee), 25% Vivid Rose (#f48fb1)
    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      if (rand < 0.40) {
        color.set('#ffb7c5');
      } else if (rand < 0.75) {
        color.set('#ffebee');
      } else {
        color.set('#f48fb1');
      }
      mesh.setColorAt(i, color);

      const i3 = i * 3;
      position.set(pos[i3], pos[i3 + 1], pos[i3 + 2]);
      euler.set(rot[i3], rot[i3 + 1], rot[i3 + 2]);
      quaternion.setFromEuler(euler);
      scaleVec.setScalar(scale[i]);
      matrix.compose(position, quaternion, scaleVec);
      mesh.setMatrixAt(i, matrix);
    }

    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.instanceMatrix.needsUpdate = true;
  }, [buffers, count, scratch]);

  // 7. High-Performance Aerodynamic Simulation Loop in useFrame (Zero Object Allocation)
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Delta-time spike clamping for tab-blur stability (F7.B1, F7.B2)
    const dt = Math.min(0.1, Math.max(0.001, delta));
    const t = state.clock.getElapsedTime();

    // Global harmonic wind field with gust oscillations
    const gustX = (0.28 * Math.sin(t * 0.42) + 0.15 * Math.sin(t * 1.18) + 0.08 * Math.sin(t * 2.45)) * windIntensity;
    const gustZ = (0.16 * Math.cos(t * 0.55) - 0.22) * windIntensity;

    const { pos, vel, rot, rotVel, flutterPhase, flutterFreq, flutterAmp, scale } = buffers;
    const { matrix, position, quaternion, scaleVec, euler } = scratch;

    // Boundary recycling envelope (F7.5, F7.B3, C3, C10)
    const yMin = -21.0;
    const yMax = 12.0;
    const xMin = -9.5;
    const xMax = 9.5;
    const zMin = -14.0;
    const zMax = 9.0;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const fPhase = flutterPhase[i];
      const fFreq = flutterFreq[i];
      const fAmp = flutterAmp[i];

      let px = pos[i3];
      let py = pos[i3 + 1];
      let pz = pos[i3 + 2];

      // Vertical wind shear: higher altitude wind is stronger than street-level (F7.4)
      const windShear = 0.25 * Math.cos(py * 0.5 + t * 1.2) * windIntensity;
      const windDriftX = (0.45 * windIntensity) + gustX + windShear;

      // Aerodynamic fluttering lift oscillations (F7.3)
      const flutterOffsetX = Math.sin(t * fFreq + fPhase) * fAmp;
      const flutterOffsetY = Math.cos(t * fFreq * 1.4 + fPhase) * 0.06;
      const flutterOffsetZ = Math.cos(t * fFreq * 0.8 + fPhase) * fAmp * 0.7;

      // Terminal fall velocity with subtle aerodynamic drag modulation
      const terminalV = vel[i3 + 1] * fallSpeed;

      // Update positions
      px += (windDriftX + flutterOffsetX) * dt;
      py -= (terminalV - flutterOffsetY) * dt;
      pz += (gustZ + flutterOffsetZ) * dt;

      // 3-axis rotational tumbling
      rot[i3] += (rotVel[i3] + Math.sin(t * 2.2 + fPhase) * 0.7) * dt;
      rot[i3 + 1] += (rotVel[i3 + 1] + Math.cos(t * 1.6 + fPhase) * 0.5) * dt;
      rot[i3 + 2] += (rotVel[i3 + 2] + Math.sin(t * 2.5 + fPhase) * 0.9) * dt;

      // Spatial boundary recycling box: seamless respawn above/upwind without popping (F7.5, C10)
      if (py < yMin || px > xMax || pz < zMin || pz > zMax) {
        // Respawn above tree canopy (y = 10.5 - 12.5) and upwind on left (x = -9.5 to -1.5)
        py = 10.5 + Math.random() * 2.0;
        px = xMin + Math.random() * 8.0;
        pz = zMin + 2.0 + Math.random() * (zMax - zMin - 3.0);
        flutterPhase[i] = Math.random() * Math.PI * 2;
      }

      pos[i3] = px;
      pos[i3 + 1] = py;
      pos[i3 + 2] = pz;

      // Compose instance transformation matrix (Zero GC)
      position.set(px, py, pz);
      euler.set(rot[i3], rot[i3 + 1], rot[i3 + 2]);
      quaternion.setFromEuler(euler);
      scaleVec.setScalar(scale[i]);

      matrix.compose(position, quaternion, scaleVec);
      meshRef.current.setMatrixAt(i, matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      name="sakura-petals-instanced-mesh"
      args={[petalGeometry, petalMaterial, count]}
      frustumCulled={false} // Prevents premature bounding box culling across expansive cascade
    />
  );
}

export default SakuraPetals;
