'use client';

import React from 'react';
import { VolumeX } from 'lucide-react';

export interface AudioToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
  className?: string;
}

export function AudioToggle({ isPlaying, onToggle, className = '' }: AudioToggleProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <button
      type="button"
      role="button"
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      aria-label="Toggle ambient soundscape"
      aria-pressed={isPlaying ? 'true' : 'false'}
      className={`group relative flex items-center space-x-2.5 min-h-[44px] min-w-[44px] px-4 py-2 rounded-full border transition-all duration-300 pointer-events-auto select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400/50 ${
        isPlaying
          ? 'bg-[#1a1735]/80 border-pink-400/40 text-pink-200 shadow-[0_0_20px_rgba(255,133,162,0.25)]'
          : 'bg-[#0f1225]/70 border-white/10 text-indigo-200/70 hover:text-white hover:border-white/25 hover:bg-[#151936]/80'
      } backdrop-blur-md ${className}`}
    >
      {/* Visual Indicator: Animated 4-bar equalizer (F15.3) or muted icon */}
      {isPlaying ? (
        <div
          aria-hidden="true"
          className="flex items-end space-x-1 h-4 w-5"
        >
          <span
            className="w-1 bg-pink-400 rounded-full animate-eq-1"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-1 bg-pink-300 rounded-full animate-eq-2"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-1 bg-purple-300 rounded-full animate-eq-3"
            style={{ animationDelay: '300ms' }}
          />
          <span
            className="w-1 bg-indigo-300 rounded-full animate-eq-4"
            style={{ animationDelay: '450ms' }}
          />
        </div>
      ) : (
        <VolumeX className="w-4 h-4 text-indigo-300/60 group-hover:text-indigo-200 transition-colors" />
      )}

      {/* Button Text */}
      <span className="text-xs font-mono tracking-wider font-medium">
        {isPlaying ? 'SOUND ON' : 'SOUND OFF'}
      </span>

      {/* Japanese Subtitle Accent */}
      <span className="text-[10px] font-mono opacity-60 ml-0.5">
        {isPlaying ? '音ON' : '音OFF'}
      </span>
    </button>
  );
}

export default AudioToggle;
