'use client';

import React from 'react';
import type { Scene1HeroProps } from '@/types/scene';
import { AnimeSkyDome } from './AnimeSkyDome';
import { SceneLighting } from './SceneLighting';
import { AnimeMoon } from './AnimeMoon';
import { DistantSkyline } from './DistantSkyline';
import { RooftopRailing } from './RooftopRailing';
import { CoupleSilhouette } from './CoupleSilhouette';
import { SakuraTrees } from './SakuraTrees';
import { SakuraPetals } from './SakuraPetals';
import { CameraController } from './CameraController';
import { FloatingLanterns } from './FloatingLanterns';

export function Scene1Hero({
  children,
  theme = 'sakura',
  showPetals = true,
  petalsProps,
  showCameraController = true,
  cameraControllerProps,
  lanternsTrigger = 0,
}: Scene1HeroProps) {
  // Theme-specific sky & lighting configurations
  const isRain = theme === 'rain';
  const isDawn = theme === 'dawn';

  const skyProps = isRain
    ? {
        zenithColor: '#02040f',
        upperSkyColor: '#071126',
        midSkyColor: '#0d1d3d',
        twilightColor: '#162b55',
        horizonColor: '#183664',
        cityGlowColor: '#25508a',
        nebulaColorA: '#1a3360',
        nebulaColorB: '#112244',
      }
    : isDawn
    ? {
        zenithColor: '#0c102a',
        upperSkyColor: '#1a1838',
        midSkyColor: '#452140',
        twilightColor: '#7a3250',
        horizonColor: '#ad4952',
        cityGlowColor: '#e07662',
        nebulaColorA: '#ff8a7a',
        nebulaColorB: '#6d284f',
      }
    : {};

  const lightingProps = isRain
    ? {
        moonlightColor: '#b0d2ff',
        cityBounceColor: '#38bdf8',
        ambientSkyColor: '#0e1e38',
      }
    : isDawn
    ? {
        moonlightColor: '#ffedd5',
        cityBounceColor: '#fb923c',
        ambientSkyColor: '#381628',
      }
    : {};

  return (
    <group name="Scene1Hero">
      {/* 1. Procedural Anime Sky Dome with Twilight Gradient, Stars & Nebula */}
      <AnimeSkyDome {...skyProps} />

      {/* 2. Three-Point Anime Night Illumination Rig */}
      <SceneLighting {...lightingProps} />

      {/* 3. Luminous Anime Moon with FBM Maria & Additive Glow Halo */}
      <AnimeMoon />

      {/* 4. Distant Tokyo Skyline with Procedural Windows & Beacons */}
      <DistantSkyline />

      {/* 5. Concrete Rooftop Floor Slab, Parapet Curb & Steel Railing */}
      <RooftopRailing />

      {/* 6. Silhouetted Leaning Couple with Moonlight Rim & City Bounce */}
      <CoupleSilhouette />

      {/* 7. Framing Cherry Blossom Trees with Cel-Shaded Blossom Clusters */}
      <SakuraTrees />

      {/* 8. Instanced 350-Petal Sakura Aerodynamic Particle System (M2 - F7) */}
      {showPetals && (
        <SakuraPetals
          windIntensity={isRain ? 1.6 : 1.0}
          fallSpeed={isRain ? 1.8 : 1.0}
          {...petalsProps}
        />
      )}

      {/* 9. Floating Sky Lanterns in 3D Scene */}
      <FloatingLanterns
        count={isDawn ? 20 : 12}
        triggerCount={lanternsTrigger}
      />

      {/* 10. Unified Camera Controller with Dampened Mouse Parallax (M2 - F8) */}
      {showCameraController && <CameraController {...cameraControllerProps} />}

      {/* 11. Child extension point */}
      {children}
    </group>
  );
}

export default Scene1Hero;
