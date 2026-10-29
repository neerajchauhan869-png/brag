'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { SceneLightingProps } from '@/types/scene';

export function SceneLighting({
  theme = 'sakura',
  moonlightIntensity,
  moonlightColor,
  moonlightPosition,
  moonlightTarget = [0, 1.0, 0],

  cityBounceIntensity,
  cityBounceColor,
  cityBouncePosition = [0, -8, -12],
  cityBounceTarget = [0, 2.5, 2],

  ambientTwilightIntensity,
  ambientSkyColor,
  ambientGroundColor,

  sakuraRimIntensity,
  sakuraRimColor,
  sakuraRimPosition = [-3.5, 3.2, 1.2],
}: SceneLightingProps) {
  const isRain = theme === 'rain';
  const isDawn = theme === 'dawn';

  // Theme-specific lighting defaults
  const defaultMoonlightIntensity = isRain ? 1.7 : isDawn ? 2.8 : 2.2;
  const defaultMoonlightColor = isRain ? '#7dd3fc' : isDawn ? '#fef08a' : '#cce2ff';
  const defaultMoonlightPosition: [number, number, number] = isDawn
    ? [18, 14, -55]
    : [18, 25, -60];

  const defaultCityBounceIntensity = isRain ? 2.2 : isDawn ? 1.8 : 1.4;
  const defaultCityBounceColor = isRain ? '#06b6d4' : isDawn ? '#ea580c' : '#ff9d5c';

  const defaultAmbientTwilightIntensity = isRain ? 0.7 : isDawn ? 1.0 : 0.85;
  const defaultAmbientSkyColor = isRain ? '#0b1730' : isDawn ? '#5c2445' : '#1e1b4b';
  const defaultAmbientGroundColor = isRain ? '#040914' : isDawn ? '#240e1b' : '#1a0f24';

  const defaultSakuraRimIntensity = isRain ? 0.75 : isDawn ? 1.2 : 0.6;
  const defaultSakuraRimColor = isRain ? '#38bdf8' : isDawn ? '#fbbf24' : '#ff94b8';

  const effMoonlightIntensity = moonlightIntensity ?? defaultMoonlightIntensity;
  const effMoonlightColor = moonlightColor ?? defaultMoonlightColor;
  const effMoonlightPosition = moonlightPosition ?? defaultMoonlightPosition;

  const effCityBounceIntensity = cityBounceIntensity ?? defaultCityBounceIntensity;
  const effCityBounceColor = cityBounceColor ?? defaultCityBounceColor;

  const effAmbientTwilightIntensity =
    ambientTwilightIntensity ?? defaultAmbientTwilightIntensity;
  const effAmbientSkyColor = ambientSkyColor ?? defaultAmbientSkyColor;
  const effAmbientGroundColor = ambientGroundColor ?? defaultAmbientGroundColor;

  const effSakuraRimIntensity = sakuraRimIntensity ?? defaultSakuraRimIntensity;
  const effSakuraRimColor = sakuraRimColor ?? defaultSakuraRimColor;

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

      {/* 2. Directional Moonlight / Celestial Key Light */}
      <directionalLight
        position={effMoonlightPosition}
        intensity={effMoonlightIntensity}
        color={effMoonlightColor}
        target={moonTarget}
      />

      {/* 3. City Skyline Bounce Light (Wet neon canyons in rain, amber sunrise in dawn) */}
      <directionalLight
        position={cityBouncePosition}
        intensity={effCityBounceIntensity}
        color={effCityBounceColor}
        target={bounceTarget}
      />

      {/* 4. Ambient Twilight Hemisphere Light */}
      <hemisphereLight
        args={[
          effAmbientSkyColor,
          effAmbientGroundColor,
          effAmbientTwilightIntensity,
        ]}
      />

      {/* 5. Rim Accent Light (Framing trees and railing highlights) */}
      <pointLight
        position={sakuraRimPosition}
        intensity={effSakuraRimIntensity}
        color={effSakuraRimColor}
        distance={8.0}
        decay={2.0}
      />
    </group>
  );
}

export default SceneLighting;
