'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import type { RooftopCanvasProps } from '@/types/scene';

// Dynamic client-only import with ssr: false inside a client component boundary
const RooftopCanvasInner = dynamic(
  () =>
    import('./RooftopCanvasInner').then((mod) => mod.RooftopCanvasInner),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-0 bg-[#040614] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-1000"
      >
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border border-indigo-500/20 border-t-pink-400/80 animate-spin" />
          <div className="absolute w-2 h-2 rounded-full bg-pink-300 shadow-[0_0_12px_#ff85a2] animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-mono tracking-widest text-indigo-300/60 uppercase">
          Loading Atmosphere
        </p>
      </div>
    ),
  }
);

export function RooftopCanvas({
  className,
  theme = 'sakura',
  children,
}: RooftopCanvasProps) {
  return (
    <div
      className={
        className ??
        'fixed inset-0 w-full h-full -z-0 pointer-events-none overflow-hidden select-none'
      }
    >
      <RooftopCanvasInner theme={theme}>{children}</RooftopCanvasInner>
    </div>
  );
}

export default RooftopCanvas;
