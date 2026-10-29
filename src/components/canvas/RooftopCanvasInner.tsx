'use client';

import React, { useEffect, useSyncExternalStore, createContext, useContext } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { RooftopCanvasInnerProps } from '@/types/scene';
import { Scene1Hero } from './Scene1Hero';

export const SceneThemeContext = createContext<'sakura' | 'rain' | 'dawn'>('sakura');
export const useSceneTheme = () => useContext(SceneThemeContext);

function DefaultCameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 1.9, 0);
  }, [camera]);
  return null;
}

const emptySubscribe = () => () => {};

export function RooftopCanvasInner({
  theme = 'sakura',
  children,
}: RooftopCanvasInnerProps) {
  // Defensive client-mount guard for Next.js SSR / hydration safety
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) {
    return null;
  }

  return (
    <Canvas
      dpr={[1, 2]} // Clamped to 2 for 60 FPS on Retina screens
      camera={{
        fov: 46,
        near: 0.1,
        far: 1000,
        position: [0, 2.4, 9.0], // Rooftop vantage framing railing and skyline
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        stencil: false,
        depth: true,
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <SceneThemeContext.Provider value={theme}>
        <DefaultCameraRig />
        {children || <Scene1Hero theme={theme} />}
      </SceneThemeContext.Provider>
    </Canvas>
  );
}

export default RooftopCanvasInner;
