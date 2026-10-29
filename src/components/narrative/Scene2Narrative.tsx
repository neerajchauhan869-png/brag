'use client';

import React from 'react';
import type { StoryCardData } from '@/types/scene';
import { StoryCard } from './StoryCard';

export const STORY_CARDS: StoryCardData[] = [
  {
    id: 'card-1',
    jpTitle: '出逢い',
    enTitle: 'The Meeting',
    quote: 'Under the silver moon, two silhouettes became one promise.',
    narrative:
      'Above the neon pulse of Tokyo, time suspended as cherry blossoms drifted between us.',
    timeCode: '00:00:24',
    accentColor: 'sakura',
  },
  {
    id: 'card-2',
    jpTitle: '約束',
    enTitle: 'The Promise',
    quote: 'Even if the seasons change, this rooftop will remember our whisper.',
    narrative:
      'We leaned against the cold railing, watching the distant beacons blink in rhythm with our hearts.',
    timeCode: '00:01:12',
    accentColor: 'twilight',
  },
  {
    id: 'card-3',
    jpTitle: '永遠の夜',
    enTitle: 'Eternal Night',
    quote: 'Let the dawn wait forever while petals fill the quiet sky.',
    narrative:
      'Diving down into the luminous quiet, where memory and starlight dissolve into one.',
    timeCode: '00:02:48',
    accentColor: 'amber',
  },
];

export interface Scene2NarrativeProps {
  cards?: StoryCardData[];
  className?: string;
}

export function Scene2Narrative({
  cards = STORY_CARDS,
  className = '',
}: Scene2NarrativeProps) {
  return (
    <section
      aria-label="Scene 2 Narrative Journey"
      className={`relative z-10 w-full flex flex-col justify-between py-24 px-6 md:px-16 pointer-events-none ${className}`}
    >
      {/* Chapter Marker */}
      <div className="w-full flex flex-col items-center justify-center mb-24 text-center select-none">
        <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-pink-300/80 mb-2">
          Act II • Tokyo Nightfall Descent
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-indigo-200 to-white drop-shadow-[0_0_20px_rgba(164,140,255,0.3)]">
          Whispers in the Starlight
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent mt-4" />
      </div>

      {/* Staggered Floating Story Cards (F11.1, F11.3) */}
      <div className="space-y-36 md:space-y-48 max-w-6xl mx-auto w-full">
        {/* Card 1: Placed towards left */}
        <div className="flex justify-start md:pl-8">
          <StoryCard card={cards[0]} index={0} />
        </div>

        {/* Card 2: Placed towards right */}
        <div className="flex justify-end md:pr-8">
          <StoryCard card={cards[1]} index={1} />
        </div>

        {/* Card 3: Placed centered */}
        <div className="flex justify-center">
          <StoryCard card={cards[2]} index={2} />
        </div>
      </div>

      {/* Narrative Finale Card */}
      <div className="mt-40 text-center max-w-xl mx-auto select-none">
        <div className="p-8 rounded-2xl border border-white/10 bg-[#0f1225]/60 backdrop-blur-md pointer-events-auto shadow-[0_0_40px_rgba(255,133,162,0.15)]">
          <span className="text-xs font-mono tracking-widest text-pink-300/80 uppercase block mb-2">
            The Journey Continues
          </span>
          <p className="text-base text-indigo-100/90 font-light leading-relaxed mb-4">
            Some nights never fade into dawn. Tokyo sleeps beneath the quiet sky, but their promise remains written in starlight.
          </p>
          <div className="text-[11px] font-mono tracking-widest text-indigo-300/50 uppercase">
            東京の夜 • 永遠の物語
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scene2Narrative;
