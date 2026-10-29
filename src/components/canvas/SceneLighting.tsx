'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { SceneLightingProps } from '@/types/scene';

export function SceneLighting({
  moonlightIntensity = 2.2,
  moonlightColor = '#cce2ff',
  moonlightPosition = [18, 25, -60],
  moonlightTarget = [0, 1.0, 0],

  cityBounceIntensity = 1.4,
  cityBounceColor = '#ff9d5c',
  cityBouncePosition = [0, -8, -12],
  cityBounceTarget = [0, 2.5, 2],

  ambientTwilightIntensity = 0.85,
  ambientSkyColor = '#1e1b4b',
  ambientGroundColor = '#1a0f24',

  sakuraRimIntensity = 0.6,
  sakuraRimColor = '#ff94b8',
  sakuraRimPosition = [-3.5, 3.2, 1.2],
}: SceneLightingProps) {
  // Stable Three.js Object3D targets for directional lights
  const moonTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(...moonlightTarget);
    return obj;
  }, [moonlightTarget]);

  const bounceTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(...cityBounceTarget);
    return obj;
  }, [cityBounceTarget]);

  return (
    <group name="SceneLighting">
      {/* 1. Target primitives */}
      <primitive object={moonTarget} />
      <primitive object={bounceTarget} />

      {/* 2. Directional Moonlight (Key light from celestial moon) */}
      <directionalLight
        position={moonlightPosition}
        intensity={moonlightIntensity}
        color={moonlightColor}
        target={moonTarget}
      />

      {/* 3. Warm City Skyline Bounce Light (Urban uplight from street canyons) */}
      <directionalLight
        position={cityBouncePosition}
        intensity={cityBounceIntensity}
        color={cityBounceColor}
        target={bounceTarget}
      />

      {/* 4. Ambient Twilight Hemisphere Light (Celestial sky to urban ground gradient) */}
      <hemisphereLight
        args={[ambientSkyColor, ambientGroundColor, ambientTwilightIntensity]}
      />

      {/* 5. Sakura Rim Accent Light (Localized translucent fill for framing foliage) */}
      <pointLight
        position={sakuraRimPosition}
        intensity={sakuraRimIntensity}
        color={sakuraRimColor}
        distance={8.0}
        decay={2.0}
      />
    </group>
  );
}

export default SceneLighting;
