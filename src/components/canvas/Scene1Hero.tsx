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
import { RainParticles } from './RainParticles';
import { DawnMotes } from './DawnMotes';
import { CameraController } from './CameraController';
import { FloatingLanterns } from './FloatingLanterns';
import { useSceneTheme } from './RooftopCanvasInner';

export function Scene1Hero({
  children,
  theme: propTheme,
  showPetals = true,
  petalsProps,
  showCameraController = true,
  cameraControllerProps,
  lanternsTrigger = 0,
}: Scene1HeroProps) {
  const contextTheme = useSceneTheme();
  const theme = propTheme ?? contextTheme ?? 'sakura';

  const isRain = theme === 'rain';
  const isDawn = theme === 'dawn';
  const isSakura = theme === 'sakura';

  // Theme-specific sky configurations
  const skyProps = isRain
    ? {
        zenithColor: '#02040c',
        upperSkyColor: '#071126',
        midSkyColor: '#0c1d3c',
        twilightColor: '#142c55',
        horizonColor: '#1a3766',
        cityGlowColor: '#06b6d4', // Moody cool neon glow
        nebulaColorA: '#0e2b4d',
        nebulaColorB: '#09192f',
        starDensity: 0.15, // Overcast storm cloud layer
      }
    : isDawn
    ? {
        zenithColor: '#0a0e27',
        upperSkyColor: '#1d1838',
        midSkyColor: '#522245',
        twilightColor: '#8c3553',
        horizonColor: '#c74f56',
        cityGlowColor: '#f59e0b', // Radiant sunrise amber horizon
        nebulaColorA: '#fbbf24',
        nebulaColorB: '#781c40',
        starDensity: 0.35,
      }
    : {};

  return (
    <group name="Scene1Hero">
      {/* 1. Procedural Anime Sky Dome with Twilight Gradient, Stars & Nebula */}
      <AnimeSkyDome {...skyProps} />

      {/* 2. Theme-Specific Three-Point Anime Night Illumination Rig */}
      <SceneLighting theme={theme} />

      {/* 3. Luminous Anime Moon with FBM Maria & Additive Glow Halo */}
      <AnimeMoon />

      {/* 4. Distant Tokyo Skyline with Procedural Windows & Beacons */}
      <DistantSkyline />

      {/* 5. Concrete Rooftop Floor Slab, Parapet Curb & Steel Railing */}
      <RooftopRailing />

      {/* 6. Silhouetted Leaning Couple with Moonlight Rim & City Bounce */}
      <CoupleSilhouette />

      {/* 7. Framing Trees */}
      <SakuraTrees />

      {/* 8. Conditional Particle System switching strictly per theme */}
      {/* A. Sakura Theme: Falling cherry blossom petal particle system */}
      {isSakura && showPetals && (
        <SakuraPetals
          windIntensity={1.0}
          fallSpeed={1.0}
          {...petalsProps}
        />
      )}

      {/* B. Tokyo Rain Theme: High-speed vertical streaks with rooftop floor splash */}
      {isRain && <RainParticles />}

      {/* C. Golden Dawn Theme: Warm floating sun motes shimmering in sunrise light */}
      {isDawn && <DawnMotes />}

      {/* 9. Floating Sky Lanterns in 3D Scene */}
      <FloatingLanterns
        count={isDawn ? 22 : isRain ? 8 : 14}
        triggerCount={lanternsTrigger}
      />

      {/* 10. Unified Camera Controller with Dampened Mouse Parallax */}
      {showCameraController && <CameraController {...cameraControllerProps} />}

      {/* 11. Child extension point */}
      {children}
    </group>
  );
}

export default Scene1Hero;
