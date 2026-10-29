'use client';

import React, { useState } from 'react';
import { Flame, Sparkles } from 'lucide-react';
import type { ReactionType } from '@/types/story';

export interface ReactionDockProps {
  slug: string;
  initialLanterns?: number;
  initialBlossoms?: number;
  onSendReaction?: (type: ReactionType) => void;
}

export function ReactionDock({
  slug,
  initialLanterns = 0,
  initialBlossoms = 0,
  onSendReaction,
}: ReactionDockProps) {
  const [lanternCount, setLanternCount] = useState(initialLanterns);
  const [blossomCount, setBlossomCount] = useState(initialBlossoms);
  const [activePulse, setActivePulse] = useState<ReactionType | null>(null);

  const handleReact = async (type: ReactionType) => {
    // Optimistic UI update
    if (type === 'lantern') {
      setLanternCount((prev) => prev + 1);
    } else {
      setBlossomCount((prev) => prev + 1);
    }

    setActivePulse(type);
    setTimeout(() => setActivePulse(null), 600);

    // Notify parent to trigger 3D visual effects
    onSendReaction?.(type);

    try {
      await fetch(`/api/stories/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: type }),
      });
    } catch (err) {
      console.warn('Reaction recording error:', err);
    }
  };

  return (
    <div
      aria-label="Reaction Dock"
      className="fixed bottom-6 right-6 z-40 flex items-center space-x-3 pointer-events-auto select-none"
    >
      {/* Release Lantern Button */}
      <button
        type="button"
        onClick={() => handleReact('lantern')}
        aria-label="Release a glowing lantern into the sky"
        className={`group flex items-center space-x-2 px-4 py-2.5 rounded-full border border-amber-400/30 bg-[#1e1526]/85 backdrop-blur-md text-amber-200 text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:bg-[#2e1d3d] hover:border-amber-400/60 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
          activePulse === 'lantern' ? 'scale-115 border-amber-300' : 'hover:scale-105'
        }`}
      >
        <Flame className="w-4 h-4 text-amber-400 animate-pulse group-hover:scale-110 transition-transform" />
        <span>RELEASE LANTERN</span>
        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
          {lanternCount}
        </span>
      </button>

      {/* Drift Blossom Button */}
      <button
        type="button"
        onClick={() => handleReact('blossom')}
        aria-label="Send a cherry blossom reaction"
        className={`group flex items-center space-x-2 px-4 py-2.5 rounded-full border border-pink-400/30 bg-[#261526]/85 backdrop-blur-md text-pink-200 text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(244,114,182,0.2)] hover:bg-[#3d1d3a] hover:border-pink-400/60 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400/50 ${
          activePulse === 'blossom' ? 'scale-115 border-pink-300' : 'hover:scale-105'
        }`}
      >
        <Sparkles className="w-4 h-4 text-pink-400 group-hover:rotate-12 transition-transform" />
        <span>DRIFT BLOSSOM</span>
        <span className="px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold">
          {blossomCount}
        </span>
      </button>
    </div>
  );
}

export default ReactionDock;
