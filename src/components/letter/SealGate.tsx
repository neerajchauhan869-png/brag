'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { StoryTheme } from '@/types/story';

export interface SealGateProps {
  senderName: string;
  recipientName: string;
  theme: StoryTheme;
  onBreakSeal: () => void;
}

export function SealGate({
  senderName,
  recipientName,
  theme,
  onBreakSeal,
}: SealGateProps) {
  const [isBreaking, setIsBreaking] = useState(false);

  const handleBreak = () => {
    setIsBreaking(true);
    setTimeout(() => {
      onBreakSeal();
    }, 850);
  };

  const themeAccent =
    theme === 'rain'
      ? {
          gradient: 'from-cyan-400 via-blue-300 to-indigo-300',
          sealColor: 'border-cyan-400/50 bg-cyan-950/80 text-cyan-200',
          glow: 'rgba(56, 189, 248, 0.4)',
        }
      : theme === 'dawn'
      ? {
          gradient: 'from-amber-300 via-rose-300 to-orange-300',
          sealColor: 'border-amber-400/50 bg-amber-950/80 text-amber-200',
          glow: 'rgba(251, 146, 60, 0.4)',
        }
      : {
          gradient: 'from-pink-300 via-rose-200 to-indigo-200',
          sealColor: 'border-pink-400/50 bg-[#2d1222]/90 text-pink-200',
          glow: 'rgba(255, 133, 162, 0.4)',
        };

  return (
    <div
      aria-label="Rooftop Letter Wax Seal Gate"
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#040614]/90 backdrop-blur-2xl transition-all duration-1000 ${
        isBreaking ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Anime Envelope Presentation Box */}
      <div className="relative w-full max-w-lg p-8 sm:p-12 rounded-3xl border border-white/15 bg-[#0f1225]/85 shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-xl text-center select-none overflow-hidden">
        {/* Luminous Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-400/60 to-transparent" />

        {/* Japanese Header Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono tracking-widest text-indigo-200/80 uppercase mb-6">
          <Sparkles className="w-3 h-3 text-pink-300 animate-pulse" />
          <span>TOKYO ROOFTOP MEMOIR • 屋上の手紙</span>
        </div>

        {/* Addressed to Recipient */}
        <p className="text-xs font-mono tracking-[0.3em] uppercase text-pink-300/80 mb-2">
          Special Delivery For
        </p>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeAccent.gradient}`}>
            {recipientName}
          </span>
        </h2>

        {/* From Sender */}
        <p className="text-xs sm:text-sm text-indigo-200/70 font-light mb-8">
          Sent by <span className="text-white font-medium">{senderName}</span> under the Tokyo midnight moon.
        </p>

        {/* Interactive Wax Seal Button */}
        <div className="flex flex-col items-center justify-center space-y-4 my-2">
          <button
            type="button"
            onClick={handleBreak}
            disabled={isBreaking}
            aria-label="Break the seal to read letter"
            className={`group relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 transition-all duration-500 cursor-pointer focus:outline-none focus:ring-4 focus:ring-pink-400/40 ${
              themeAccent.sealColor
            } ${isBreaking ? 'scale-125 rotate-45' : 'hover:scale-110'}`}
            style={{
              boxShadow: `0 0 35px ${themeAccent.glow}`,
            }}
          >
            {/* Wax Seal Rim Rings */}
            <div className="absolute inset-2 rounded-full border border-white/20 pointer-events-none" />
            <div className="absolute inset-4 rounded-full border border-white/10 pointer-events-none" />

            {/* Kanji in Center */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl font-serif font-black tracking-widest">
                絆
              </span>
              <span className="text-[9px] font-mono tracking-tighter opacity-70">
                SEAL
              </span>
            </div>

            {/* Pulsing Aura */}
            <div
              className="absolute -inset-2 rounded-full border border-pink-400/30 animate-ping pointer-events-none opacity-40"
              style={{ animationDuration: '3s' }}
            />
          </button>

          <span className="text-xs font-mono tracking-widest text-indigo-300/80 uppercase animate-pulse">
            {isBreaking ? 'Unfolding Memory...' : 'Tap Seal to Open Letter'}
          </span>
        </div>

        {/* Ambient Footer Quote */}
        <p className="mt-8 text-xs italic text-indigo-200/50 max-w-sm mx-auto font-light">
          &ldquo;Some words can only be shared beneath the quiet starlight.&rdquo;
        </p>
      </div>
    </div>
  );
}

export default SealGate;
