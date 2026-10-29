'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { MouseParallaxState } from '@/types/scene';

export interface UseMouseParallaxOptions {
  /**
   * Exponential damping lambda factor for smoothing.
   * Higher values react faster, lower values produce more floaty motion.
   * Default: 4.0 (as specified in F8.2 and F8.B4).
   */
  lambda?: number;

  /**
   * Maximum normalized pointer velocity (units per second) to clamp high-speed flicks.
   * Default: 5.0 (as specified in F8.B2).
   */
  maxVelocity?: number;

  /**
   * Whether pointer tracking is actively enabled.
   * Default: true.
   */
  enabled?: boolean;
}

export interface UseMouseParallaxReturn {
  /** Current smoothly damped pointer coordinates [-1, 1] */
  current: React.MutableRefObject<MouseParallaxState>;
  /** Raw instantaneous target coordinates [-1, 1] */
  target: React.MutableRefObject<MouseParallaxState>;
  /** Step update function to be invoked inside R3F useFrame or animation loops */
  update: (delta: number) => MouseParallaxState;
  /** Immediately resets coordinates to viewport center (0, 0) */
  reset: () => void;
}

/**
 * Pure coordinate mapping helper from client pixels to normalized [-1, 1] space.
 * Includes defensive zero-dimension guards to prevent NaN/Infinity.
 */
export function computeNormalizedPointer(
  clientX: number,
  clientY: number,
  width: number,
  height: number
): MouseParallaxState {
  if (!width || !height || width <= 0 || height <= 0) {
    return { normalizedX: 0.0, normalizedY: 0.0 };
  }

  const rawX = (clientX / width) * 2 - 1;
  const rawY = -(clientY / height) * 2 + 1;

  // Viewport edge clamping [-1.0, 1.0] (F8.B1)
  return {
    normalizedX: Math.max(-1.0, Math.min(1.0, rawX)),
    normalizedY: Math.max(-1.0, Math.min(1.0, rawY)),
  };
}

/**
 * Pure damping helper using standard Three.js exponential smoothing.
 */
export function dampScalar(
  current: number,
  target: number,
  lambda: number,
  delta: number
): number {
  return THREE.MathUtils.damp(current, target, lambda, delta);
}

/**
 * Pure velocity clamp helper (F8.B2).
 */
export function clampVelocity(v: number, maxV = 5.0): number {
  return Math.max(-maxV, Math.min(maxV, v));
}

/**
 * React hook providing responsive, exponentially damped pointer coordinates for 3D camera parallax.
 * Operates via mutable refs to prevent 60-240Hz React component re-renders.
 */
export function useMouseParallax({
  lambda = 4.0,
  maxVelocity = 5.0,
  enabled = true,
}: UseMouseParallaxOptions = {}): UseMouseParallaxReturn {
  const currentRef = useRef<MouseParallaxState>({ normalizedX: 0.0, normalizedY: 0.0 });
  const targetRef = useRef<MouseParallaxState>({ normalizedX: 0.0, normalizedY: 0.0 });
  const lastTimeRef = useRef<number>(0);
  const prevTargetRef = useRef<MouseParallaxState>({ normalizedX: 0.0, normalizedY: 0.0 });

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now() / 1000;
      const dt = lastTimeRef.current > 0 ? now - lastTimeRef.current : 0.016;
      lastTimeRef.current = now;

      const norm = computeNormalizedPointer(
        e.clientX,
        e.clientY,
        window.innerWidth,
        window.innerHeight
      );

      if (dt > 0.001) {
        const vx = (norm.normalizedX - prevTargetRef.current.normalizedX) / dt;
        const vy = (norm.normalizedY - prevTargetRef.current.normalizedY) / dt;
        const cvx = clampVelocity(vx, maxVelocity);
        const cvy = clampVelocity(vy, maxVelocity);

        targetRef.current.normalizedX = prevTargetRef.current.normalizedX + cvx * dt;
        targetRef.current.normalizedY = prevTargetRef.current.normalizedY + cvy * dt;
      } else {
        targetRef.current.normalizedX = norm.normalizedX;
        targetRef.current.normalizedY = norm.normalizedY;
      }

      // Re-clamp target within [-1, 1]
      targetRef.current.normalizedX = Math.max(-1.0, Math.min(1.0, targetRef.current.normalizedX));
      targetRef.current.normalizedY = Math.max(-1.0, Math.min(1.0, targetRef.current.normalizedY));
      prevTargetRef.current = { ...targetRef.current };
    };

    const handlePointerLeave = () => {
      // Return to center when pointer leaves browser window
      targetRef.current.normalizedX = 0.0;
      targetRef.current.normalizedY = 0.0;
      prevTargetRef.current = { normalizedX: 0.0, normalizedY: 0.0 };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [enabled, maxVelocity]);

  const update = useCallback(
    (delta: number): MouseParallaxState => {
      // Clamp delta time to 0.1s to prevent extreme damping spikes on tab blur/resume (F7.B1)
      const safeDt = Math.max(0.0001, Math.min(0.1, delta));

      currentRef.current.normalizedX = dampScalar(
        currentRef.current.normalizedX,
        targetRef.current.normalizedX,
        lambda,
        safeDt
      );
      currentRef.current.normalizedY = dampScalar(
        currentRef.current.normalizedY,
        targetRef.current.normalizedY,
        lambda,
        safeDt
      );

      return currentRef.current;
    },
    [lambda]
  );

  const reset = useCallback(() => {
    currentRef.current = { normalizedX: 0.0, normalizedY: 0.0 };
    targetRef.current = { normalizedX: 0.0, normalizedY: 0.0 };
    prevTargetRef.current = { normalizedX: 0.0, normalizedY: 0.0 };
    lastTimeRef.current = 0;
  }, []);

  return {
    current: currentRef,
    target: targetRef,
    update,
    reset,
  };
}

export default useMouseParallax;
