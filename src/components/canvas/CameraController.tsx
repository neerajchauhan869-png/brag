'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { CameraTrajectoryState, CameraControllerProps } from '@/types/scene';
import { useMouseParallax } from '@/hooks/useMouseParallax';

/**
 * Default hero rooftop vantage state at scroll progress = 0.0.
 * Frames the rooftop railing, couple silhouette, distant Tokyo skyline, and high celestial moon.
 */
export const DEFAULT_HERO_TRAJECTORY: Readonly<CameraTrajectoryState> = Object.freeze({
  posX: 0.0,
  posY: 2.4,
  posZ: 9.0,
  targetX: 0.0,
  targetY: 1.9,
  targetZ: 0.0,
  fov: 48.0,
  scrollProgress: 0.0,
});

/**
 * Parallax attenuation function as camera dives to Scene 2.
 * - Progress 0.0 -> 0.2: 1.0 (100% full responsiveness at hero view)
 * - Progress 0.2 -> 0.6: Linear ramp down to 0.2
 * - Progress >= 0.6: 0.2 (20% stabilized minimal parallax in Scene 2)
 *
 * Adheres strictly to F8.4, F8.B5, and C1.
 */
export function computeParallaxWeight(scrollProgress: number): number {
  const p = Math.max(0.0, Math.min(1.0, scrollProgress));
  const normalizedSpan = Math.min(1.0, Math.max(0.0, (p - 0.2) / 0.4));
  return 1.0 - normalizedSpan * 0.8;
}

/**
 * Computes deterministic, hysteresis-free camera position, LookAt target,
 * and dynamic FOV across scroll depth from 0.0 to 1.0 (F9, F10).
 *
 * - Phase 1 (0.0 -> 0.20): Rooftop vantage with subtle push forward toward railing.
 * - Phase 2 (0.20 -> 0.50): Plunge forward through railing down toward Tokyo streetscape.
 *   Clears railing at z=5.5 (y=1.2 > railing y=1.1) and reaches speed peak at p=0.50 (fov=58°).
 * - Phase 3 (0.50 -> 0.70): Deceleration and settling into Scene 2 narrative plane (y=-18.0).
 * - Phase 4 (0.70 -> 1.00): Scene 2 narrative expanse with gentle breathing drift.
 */
export function computeCameraTrajectory(scrollProgress: number): CameraTrajectoryState {
  const p = Math.max(0.0, Math.min(1.0, scrollProgress));

  const posX = 0.0;
  let posY = 2.4;
  let posZ = 9.0;
  const targetX = 0.0;
  let targetY = 1.9;
  const targetZ = 0.0;
  let fov = 48.0;

  if (p < 0.20) {
    // Phase 1: Subtle push toward railing
    const t = p / 0.20;
    posY = 2.4;
    posZ = 9.0 - t * 1.0; // 9.0 -> 8.0
    targetY = 1.9;
    fov = 48.0;
  } else if (p <= 0.50) {
    // Phase 2: Forward plunge through railing down toward city streetscape
    const t = (p - 0.20) / 0.30; // 0.0 to 1.0

    // Quadratic interpolation passing through (0, 2.4), (0.5, 1.2), (1.0, -8.0)
    // Ensures clearance over railing (y=1.1 at z=3.2) when camera crosses z=5.5 at y=1.2
    posY = -16.0 * t * t + 5.6 * t + 2.4;

    // Passing through (0, 8.0), (0.5, 5.5), (1.0, 4.0)
    posZ = 2.0 * t * t - 6.0 * t + 8.0;

    // LookAt angle tilts downward into the urban descent
    targetY = 1.9 + t * (-13.9); // 1.9 down to -12.0

    // Dynamic FOV expansion creating speed sensation
    fov = 48.0 + t * 10.0; // 48.0° up to 58.0°
  } else if (p <= 0.70) {
    // Phase 3: Decelerating into Scene 2 narrative plane
    const u = (p - 0.50) / 0.20; // 0.0 to 1.0
    const smoothEase = u * u * (3.0 - 2.0 * u); // Smoothstep C1 continuity

    posY = -8.0 + smoothEase * (-10.0); // -8.0 down to -18.0
    posZ = 4.0 + smoothEase * 4.0; // 4.0 out to 8.0
    targetY = -12.0 + smoothEase * (-6.0); // -12.0 down to -18.0
    fov = 58.0 - u * 8.0; // Settle from 58.0° to 50.0°
  } else {
    // Phase 4: Settled narrative expanse
    posY = -18.0;
    posZ = 8.0;
    targetY = -18.0;
    fov = 50.0;
  }

  return {
    posX,
    posY,
    posZ,
    targetX,
    targetY,
    targetZ,
    fov,
    scrollProgress: p,
  };
}

/**
 * Unified Three.js perspective camera controller responding in useFrame.
 * Combines GSAP ScrollTrigger trajectory with dampened mouse parallax offset,
 * perspective tilt/yaw clamping, dynamic aspect ratio FOV adjustment, and organic breathing oscillation.
 */
export function CameraController({
  trajectoryRef,
  enableParallax = true,
  parallaxLambda = 4.0,
  maxShiftX = 0.8,
  maxShiftY = 0.5,
  lookAtFactor = 0.3,
  fovLimits = [40, 65],
  basePosition,
  baseLookAt,
}: CameraControllerProps) {
  const internalTrajectoryRef = useRef<CameraTrajectoryState>({ ...DEFAULT_HERO_TRAJECTORY });
  const activeTrajectoryRef = trajectoryRef || internalTrajectoryRef;

  const mouseParallax = useMouseParallax({
    lambda: parallaxLambda,
    enabled: enableParallax,
  });

  // Wire GSAP ScrollTrigger to continuously sync camera trajectory with page scroll
  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => {
        const p = Math.max(0.0, Math.min(1.0, self.progress));
        const updatedState = computeCameraTrajectory(p);
        activeTrajectoryRef.current = updatedState;
      },
    });

    // Initialize with current scroll offset if page is already scrolled
    const initialProgress = trigger.progress || 0;
    activeTrajectoryRef.current = computeCameraTrajectory(initialProgress);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      trigger.kill();
    };
  }, [activeTrajectoryRef]);

  useFrame((state, delta) => {
    const cam = state.camera;
    if (!(cam instanceof THREE.PerspectiveCamera)) return;

    // 1. Tab blur / delta spike clamping to prevent coordinate teleportation (F7.B1, F8.B4)
    const dt = Math.max(0.0001, Math.min(0.1, delta));

    // 2. Smoothly damp mouse pointer coordinates
    const norm = mouseParallax.update(dt);

    // 3. Read current trajectory state (from GSAP ScrollTrigger or default hero)
    const trajectory = activeTrajectoryRef.current ?? DEFAULT_HERO_TRAJECTORY;
    const progress = Math.max(0.0, Math.min(1.0, trajectory.scrollProgress));

    // 4. Parallax attenuation based on scroll depth (1.0 at hero -> 0.2 at Scene 2)
    const weight = enableParallax ? computeParallaxWeight(progress) : 0.0;

    // 5. Compute translational offsets from mouse position
    const shiftX = norm.normalizedX * maxShiftX * weight;
    const shiftY = norm.normalizedY * maxShiftY * weight;

    // 6. Subtle organic breathing idle oscillation
    const time = state.clock.getElapsedTime();
    let breathX = 0;
    let breathY = 0;
    if (progress < 0.25) {
      breathX = Math.sin(time * 0.4) * 0.02;
      breathY = Math.cos(time * 0.6) * 0.025;
    }

    let driftX = 0;
    let driftY = 0;
    if (progress >= 0.70) {
      const driftWeight = Math.min(1.0, (progress - 0.70) / 0.30);
      driftX = Math.cos(time * 0.4) * 0.08 * driftWeight;
      driftY = Math.sin(time * 0.6) * 0.12 * driftWeight;
    }

    // 7. Update camera position: base trajectory + dampened mouse shift + breathing/drift
    const bPos = basePosition;
    const posX = (bPos ? bPos[0] : trajectory.posX) + shiftX + breathX + driftX;
    const posY = (bPos ? bPos[1] : trajectory.posY) + shiftY + breathY + driftY;
    const posZ = bPos ? bPos[2] : trajectory.posZ;

    cam.position.set(posX, posY, posZ);

    // 8. Update lookAt target: base trajectory lookAt + dampened mouse tracking offset
    const bLook = baseLookAt;
    const baseTargetX = bLook ? bLook[0] : trajectory.targetX;
    const baseTargetY = bLook ? bLook[1] : trajectory.targetY;
    const baseTargetZ = bLook ? bLook[2] : trajectory.targetZ;

    const lookAtX = baseTargetX + shiftX * lookAtFactor;
    const lookAtY = baseTargetY + shiftY * lookAtFactor;
    const lookAtZ = baseTargetZ;

    cam.lookAt(lookAtX, lookAtY, lookAtZ);

    // 9. Aspect ratio compensation & dynamic FOV management
    const currentAspect = state.size.width / Math.max(1, state.size.height);
    const targetFov = Math.max(fovLimits[0], Math.min(fovLimits[1], trajectory.fov));

    let projectionNeedsUpdate = false;

    if (Math.abs(cam.aspect - currentAspect) > 0.001) {
      cam.aspect = currentAspect;
      projectionNeedsUpdate = true;
    }

    if (Math.abs(cam.fov - targetFov) > 0.01) {
      cam.fov = targetFov;
      projectionNeedsUpdate = true;
    }

    if (projectionNeedsUpdate) {
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

export default CameraController;
