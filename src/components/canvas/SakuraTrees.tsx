'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface BlossomClump {
  pos: [number, number, number];
  r: number;
  rot: [number, number, number];
}

export function SakuraTrees() {
  const leftTreeRef = useRef<THREE.Group>(null);
  const rightTreeRef = useRef<THREE.Group>(null);

  // 1. Procedural Cel-Shading 4-Tone Gradient Map for Anime Toon Shading
  const celGradientMap = useMemo(() => {
    const palette = new Uint8Array([
      133, 45, 78, 255,   // Step 0: Plum Crevice Shadow (#852d4e)
      217, 78, 120, 255,  // Step 1: Rose Mid-Shadow (#d94e78)
      255, 133, 162, 255, // Step 2: Main Anime Sakura Pink (#ff85a2)
      255, 235, 238, 255, // Step 3: Pearlescent Moonlit Highlight (#ffebee)
    ]);
    const texture = new THREE.DataTexture(palette, 4, 1, THREE.RGBAFormat);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  }, []);

  // 2. Shared Bark Material
  const barkMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1b121e',
      roughness: 0.88,
      metalness: 0.08,
    });
  }, []);

  // 3. Shared Anime Cel-Shaded Blossom Clump Material
  const blossomMaterial = useMemo(() => {
    return new THREE.MeshToonMaterial({
      color: '#ff85a2',
      gradientMap: celGradientMap,
    });
  }, [celGradientMap]);

  // 4. Base Deformed Icosahedron Geometry for Blossom Clouds
  const blossomGeometry = useMemo(() => {
    const geom = new THREE.IcosahedronGeometry(1, 2);
    const posAttr = geom.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < posAttr.count; i++) {
      vertex.fromBufferAttribute(posAttr, i);
      // Subtle organic noise perturbation
      const noise =
        Math.sin(vertex.x * 2.5) * 0.12 +
        Math.cos(vertex.y * 3.0) * 0.12 +
        Math.sin(vertex.z * 2.0) * 0.1;
      vertex.multiplyScalar(1 + noise);
      posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  // 5. Left Framing Trunk & Branches
  const { leftTrunkGeom, leftSubBranchGeom } = useMemo(() => {
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.6, -4.0, 0),
      new THREE.Vector3(-0.3, -1.5, 0.2),
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(0.5, 2.0, -0.2),
    ]);
    const leftTrunkGeom = new THREE.TubeGeometry(trunkCurve, 20, 0.26, 8, false);

    const branchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(0.8, 1.2, 0.4),
      new THREE.Vector3(1.6, 1.8, 0.2),
    ]);
    const leftSubBranchGeom = new THREE.TubeGeometry(branchCurve, 16, 0.14, 8, false);

    return { leftTrunkGeom, leftSubBranchGeom };
  }, []);

  // 6. Right Framing Trunk & Branches
  const { rightTrunkGeom, rightSubBranchGeom } = useMemo(() => {
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.6, -4.0, 0),
      new THREE.Vector3(0.3, -1.5, 0.2),
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(-0.5, 2.0, -0.2),
    ]);
    const rightTrunkGeom = new THREE.TubeGeometry(trunkCurve, 20, 0.26, 8, false);

    const branchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(-0.8, 1.2, 0.4),
      new THREE.Vector3(-1.6, 1.8, 0.2),
    ]);
    const rightSubBranchGeom = new THREE.TubeGeometry(branchCurve, 16, 0.14, 8, false);

    return { rightTrunkGeom, rightSubBranchGeom };
  }, []);

  // 7. Left Blossom Clump Cluster
  const leftClumps: BlossomClump[] = useMemo(() => [
    { pos: [0.6, 2.3, -0.2], r: 1.15, rot: [0.1, 0.2, 0] },
    { pos: [1.4, 2.0, 0.1], r: 0.95, rot: [-0.2, 0.4, 0.1] },
    { pos: [0.2, 1.6, 0.3], r: 0.9, rot: [0.3, -0.1, 0.2] },
    { pos: [1.8, 1.8, 0.2], r: 0.8, rot: [0.1, 0.3, -0.2] },
    { pos: [-0.3, 1.2, -0.1], r: 0.75, rot: [-0.1, 0.2, 0.3] },
  ], []);

  // 8. Right Blossom Clump Cluster
  const rightClumps: BlossomClump[] = useMemo(() => [
    { pos: [-0.6, 2.3, -0.2], r: 1.15, rot: [0.1, -0.2, 0] },
    { pos: [-1.4, 2.0, 0.1], r: 0.95, rot: [-0.2, -0.4, 0.1] },
    { pos: [-0.2, 1.6, 0.3], r: 0.9, rot: [0.3, 0.1, -0.2] },
    { pos: [-1.8, 1.8, 0.2], r: 0.8, rot: [0.1, -0.3, 0.2] },
    { pos: [0.3, 1.2, -0.1], r: 0.75, rot: [-0.1, -0.2, -0.3] },
  ], []);

  return (
    <group name="sakura-framing-trees">
      {/* LEFT FRAMING TREE */}
      <group ref={leftTreeRef} position={[-5.8, 0.2, 2.2]}>
        <mesh geometry={leftTrunkGeom} material={barkMaterial} />
        <mesh geometry={leftSubBranchGeom} material={barkMaterial} />
        {leftClumps.map((c, i) => (
          <mesh
            key={`left-clump-${i}`}
            position={c.pos}
            scale={[c.r, c.r * 0.85, c.r]}
            rotation={c.rot as [number, number, number]}
            geometry={blossomGeometry}
            material={blossomMaterial}
          />
        ))}
      </group>

      {/* RIGHT FRAMING TREE */}
      <group ref={rightTreeRef} position={[5.8, 0.2, 2.2]}>
        <mesh geometry={rightTrunkGeom} material={barkMaterial} />
        <mesh geometry={rightSubBranchGeom} material={barkMaterial} />
        {rightClumps.map((c, i) => (
          <mesh
            key={`right-clump-${i}`}
            position={c.pos}
            scale={[c.r, c.r * 0.85, c.r]}
            rotation={c.rot as [number, number, number]}
            geometry={blossomGeometry}
            material={blossomMaterial}
          />
        ))}
      </group>
    </group>
  );
}

export default SakuraTrees;