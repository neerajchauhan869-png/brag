'use client';

import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { CameraTrajectoryState } from '@/types/scene';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { computeParallaxWeight, DEFAULT_HERO_TRAJECTORY } from '@/lib/math/splines';

export interface CameraControllerProps {
  /**
   * Mutable ref to the current camera trajectory state (mutated by GSAP ScrollTrigger in M3).
   * If omitted, defaults to static hero rooftop vantage (progress = 0.0).
   */
  trajectoryRef?: React.RefObject<CameraTrajectoryState>;

  /** Whether mouse pointer parallax perspective is active (default: true) */
  enableParallax?: boolean;

  /** Damping factor lambda for mouse parallax smoothing (default: 4.0) */
  parallaxLambda?: number;

  /** Maximum camera X translational shift from mouse parallax (default: 0.8 units, F8.3) */
  maxShiftX?: number;

  /** Maximum camera Y translational shift from mouse parallax (default: 0.5 units, F8.3) */
  maxShiftY?: number;

  /** LookAt target tracking ratio relative to camera position shift (default: 0.3, F8.5) */
  lookAtFactor?: number;

  /** Maximum perspective pitch limit in radians (default: 0.15 rad ~ 8.6°, Scenario 1) */
  pitchMax?: number;

  /** Maximum perspective yaw limit in radians (default: 0.25 rad ~ 14.3°, Scenario 1) */
  yawMax?: number;

  /** Perspective FOV clamping limits [minFov, maxFov] (default: [40, 65], F5.B4) */
  fovLimits?: [number, number];
}

/**
 * Unified camera rig reconciling dampened mouse parallax with GSAP ScrollTrigger camera dive.
 * Must be mounted inside the React Three Fiber <Canvas> component.
 */
export function CameraController({
  trajectoryRef,
  enableParallax = true,
  parallaxLambda = 4.0,
  maxShiftX = 0.8,
  maxShiftY = 0.5,
  lookAtFactor = 0.3,
  fovLimits = [40, 65],
}: CameraControllerProps) {
  const { camera, size } = useThree();

  const mouseParallax = useMouseParallax({
    lambda: parallaxLambda,
    enabled: enableParallax,
  });

  useFrame((state, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    // 1. Tab blur / delta spike clamping to prevent coordinate teleportation (F7.B1)
    const dt = Math.max(0.0001, Math.min(0.1, delta));

    // 2. Smoothly damp mouse pointer coordinates
    const norm = mouseParallax.update(dt);

    // 3. Read current trajectory state (from GSAP timeline or default hero)
    const trajectory = trajectoryRef?.current ?? DEFAULT_HERO_TRAJECTORY;
    const progress = Math.max(0.0, Math.min(1.0, trajectory.scrollProgress));

    // 4. Parallax attenuation based on scroll depth (1.0 at hero -> 0.2 at Scene 2)
    const weight = enableParallax ? computeParallaxWeight(progress) : 0.0;

    // 5. Compute translational offsets from mouse position
    const shiftX = norm.normalizedX * maxShiftX * weight;
    const shiftY = norm.normalizedY * maxShiftY * weight;

    // 6. Subtle organic breathing drift in Scene 2 (progress >= 0.70)
    let driftX = 0;
    let driftY = 0;
    if (progress >= 0.70) {
      const driftWeight = Math.min(1.0, (progress - 0.70) / 0.30);
      const time = state.clock.getElapsedTime();
      driftX = Math.cos(time * 0.4) * 0.08 * driftWeight;
      driftY = Math.sin(time * 0.6) * 0.12 * driftWeight;
    }

    // 7. Update camera position: base trajectory + dampened mouse shift + subtle breathing
    camera.position.set(
      trajectory.posX + shiftX + driftX,
      trajectory.posY + shiftY + driftY,
      trajectory.posZ
    );

    // 8. Update lookAt target: base trajectory lookAt + dampened mouse tracking offset
    const lookAtX = trajectory.targetX + shiftX * lookAtFactor;
    const lookAtY = trajectory.targetY + shiftY * lookAtFactor;
    const lookAtZ = trajectory.targetZ;

    camera.lookAt(lookAtX, lookAtY, lookAtZ);

    // 9. Aspect ratio compensation & dynamic FOV management
    const currentAspect = size.width / Math.max(1, size.height);
    const targetFov = Math.max(fovLimits[0], Math.min(fovLimits[1], trajectory.fov));

    let projectionNeedsUpdate = false;

    if (Math.abs(camera.aspect - currentAspect) > 0.001) {
      camera.aspect = currentAspect;
      projectionNeedsUpdate = true;
    }

    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = targetFov;
      projectionNeedsUpdate = true;
    }

    if (projectionNeedsUpdate) {
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

export default CameraController;
