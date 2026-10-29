'use client';

import React, { useState, useRef, useCallback } from 'react';
import type { StoryCardData } from '@/types/scene';

export interface StoryCardProps {
  card: StoryCardData;
  index?: number;
  className?: string;
}

const THEME_ACCENTS: Record<
  string,
  {
    boxGlow: string;
    borderGlow: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    textGradient: string;
    quoteColor: string;
    dotColor: string;
  }
> = {
  sakura: {
    boxGlow: '0 10px 30px -10px rgba(255, 183, 197, 0.35)',
    borderGlow: 'rgba(255, 183, 197, 0.3)',
    badgeBg: 'rgba(255, 133, 162, 0.12)',
    badgeText: 'text-pink-300',
    badgeBorder: 'border-pink-400/30',
    textGradient: 'from-pink-300 via-rose-200 to-indigo-200',
    quoteColor: 'text-pink-200/90',
    dotColor: 'bg-pink-400',
  },
  twilight: {
    boxGlow: '0 10px 30px -10px rgba(164, 140, 255, 0.35)',
    borderGlow: 'rgba(164, 140, 255, 0.3)',
    badgeBg: 'rgba(129, 140, 248, 0.12)',
    badgeText: 'text-indigo-300',
    badgeBorder: 'border-indigo-400/30',
    textGradient: 'from-indigo-300 via-purple-200 to-pink-200',
    quoteColor: 'text-indigo-200/90',
    dotColor: 'bg-indigo-400',
  },
  amber: {
    boxGlow: '0 10px 30px -10px rgba(255, 214, 140, 0.35)',
    borderGlow: 'rgba(255, 214, 140, 0.3)',
    badgeBg: 'rgba(251, 191, 36, 0.12)',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-400/30',
    textGradient: 'from-amber-200 via-rose-200 to-indigo-200',
    quoteColor: 'text-amber-100/90',
    dotColor: 'bg-amber-400',
  },
};

export function StoryCard({ card, index = 0, className = '' }: StoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number }>({
    rotateX: 0,
    rotateY: 0,
  });
  const [glare, setGlare] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Fallback to default sakura theme if theme missing (F11.B5)
  const theme = THEME_ACCENTS[card.accentColor || 'sakura'] ?? THEME_ACCENTS.sakura;

  // 3D Perspective Hover Tilt & Radial Glare (F12.1, F12.2, F12.B1, F12.B3)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const rect = cardEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    // Local coordinates inside card
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    // Relative offset [-0.5, 0.5]
    const relX = localX / rect.width - 0.5;
    const relY = localY / rect.height - 0.5;

    // Clamp rotation angle to +-15 degrees maximum (F12.B1)
    const maxTilt = 12.0;
    const rawRotateY = relX * maxTilt;
    const rawRotateX = -relY * maxTilt;
    const rotateY = Math.max(-15.0, Math.min(15.0, rawRotateY));
    const rotateX = Math.max(-15.0, Math.min(15.0, rawRotateX));

    // Glare position percentage (F12.2)
    const glareX = (localX / rect.width) * 100;
    const glareY = (localY / rect.height) * 100;

    setTilt({ rotateX, rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 0.25 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  // Smooth reset to neutral 0 deg on mouse leave (F12.4)
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-card-id={card.id}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) ${
          isHovered ? 'scale3d(1.02, 1.02, 1.02)' : 'scale3d(1, 1, 1)'
        }`,
        transition: isHovered
          ? 'transform 0.1s ease-out, box-shadow 0.3s ease'
          : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease',
        boxShadow: isHovered ? theme.boxGlow : '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(15, 18, 37, 0.65)',
        border: `1px solid ${isHovered ? theme.borderGlow : 'rgba(255, 255, 255, 0.12)'}`,
        borderRadius: '16px',
        wordBreak: 'break-word',
      }}
      className={`relative overflow-hidden p-6 md:p-8 select-none pointer-events-auto transition-colors duration-300 w-full max-w-[420px] ${className}`}
    >
      {/* Dynamic Cursor-Tracking Glare Highlight (F12.2) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(circle 240px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.2), transparent 70%)`,
        }}
      />

      {/* Ambient Top Glow Line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />

      {/* Card Header: Timestamp & Theme Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${theme.dotColor} animate-pulse`} />
          <span className="text-[11px] font-mono tracking-widest text-indigo-200/70">
            {card.timeCode}
          </span>
        </div>
        <span
          className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${theme.badgeBorder} ${theme.badgeText}`}
          style={{ background: theme.badgeBg }}
        >
          Scene 2 • Memory {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Dual Language Japanese & English Title (F11.5) */}
      <div className="mb-4">
        <p className="text-xs font-mono tracking-[0.25em] text-pink-300/70 uppercase">
          {card.enTitle}
        </p>
        <h3
          className={`text-2xl md:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${theme.textGradient}`}
        >
          {card.jpTitle}
        </h3>
      </div>

      {/* Romantic Quote */}
      <blockquote
        className={`text-sm md:text-base font-light italic leading-relaxed mb-4 border-l-2 pl-3 border-pink-400/40 ${theme.quoteColor}`}
      >
        {card.quote.startsWith('“') || card.quote.startsWith('"')
          ? card.quote
          : `“${card.quote}”`}
      </blockquote>

      {/* Poetic Narrative Description */}
      <p className="text-xs md:text-sm text-indigo-100/75 leading-relaxed font-light">
        {card.narrative}
      </p>

      {/* Subtle Bottom Accent Indicator */}
      <div className="mt-6 flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-mono text-indigo-300/40">
        <span>TOKYO MEMOIR</span>
        <span>24:00 AMBIENT</span>
      </div>
    </div>
  );
}

export default StoryCard;
