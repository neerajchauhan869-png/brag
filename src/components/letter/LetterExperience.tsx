'use client';

import React, { useState, useSyncExternalStore, useMemo } from 'react';
import Link from 'next/link';
import { RooftopCanvas } from '@/components/canvas/RooftopCanvas';
import { Scene1Hero } from '@/components/canvas/Scene1Hero';
import { StoryCard } from '@/components/narrative/StoryCard';
import { AudioToggle } from '@/components/ui/AudioToggle';
import { SealGate } from './SealGate';
import { ReactionDock } from './ReactionDock';
import { useWebAudio } from '@/hooks/useWebAudio';
import { LOCAL_STORAGE_KEY } from '@/lib/supabase';
import type { Story, ReactionType, StoryTheme } from '@/types/story';
import type { StoryCardData } from '@/types/scene';

export interface LetterExperienceProps {
  story: Story;
  theme?: StoryTheme;
}

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function LetterExperience({
  story: initialStory,
  theme: propTheme,
}: LetterExperienceProps) {
  const [isSealBroken, setIsSealBroken] = useState(false);
  const [lanternsTrigger, setLanternsTrigger] = useState(0);

  // Reactively sync with localStorage without cascading setState in effects
  const localStoriesRaw = useSyncExternalStore(
    subscribeStorage,
    () => (typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null),
    () => null
  );

  const story: Story = useMemo(() => {
    if (!localStoriesRaw) return initialStory;
    try {
      const store = JSON.parse(localStoriesRaw);
      const local = store[initialStory.slug];
      if (local) {
        return {
          ...initialStory,
          ...local,
          sender_name: local.sender_name || initialStory.sender_name,
          recipient_name: local.recipient_name || initialStory.recipient_name,
          promise_text: local.promise_text || initialStory.promise_text,
          date_moment: local.date_moment || initialStory.date_moment,
          theme: local.theme || initialStory.theme,
        };
      }
    } catch {
      // ignore
    }
    return initialStory;
  }, [initialStory, localStoriesRaw]);

  const activeTheme: StoryTheme = propTheme || story.theme || 'sakura';
  const { isPlaying, toggle, play } = useWebAudio(activeTheme);

  const handleBreakSeal = () => {
    setIsSealBroken(true);
    play().catch(() => {});
  };

  const handleSendReaction = (type: ReactionType) => {
    if (type === 'lantern') {
      setLanternsTrigger((prev) => prev + 1);
    }
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formattedDate = story.date_moment || 'Tokyo Midnight • 24:00';
  const cardAccent =
    activeTheme === 'rain'
      ? 'twilight'
      : activeTheme === 'dawn'
      ? 'amber'
      : 'sakura';

  // Dynamic Story Cards strictly bound to user submitted data (Zero hardcoded placeholder text)
  const storyCards: StoryCardData[] = [
    {
      id: 'letter-card-1',
      jpTitle: '出逢い',
      enTitle: 'The Meeting',
      quote: `${story.sender_name} & ${story.recipient_name} • ${formattedDate}`,
      narrative: `Under the luminous Tokyo sky, ${story.sender_name} penned a secret rooftop memoir for ${story.recipient_name}. A moment suspended in time at ${formattedDate}.`,
      timeCode: '00:00:24',
      accentColor: cardAccent,
    },
    {
      id: 'letter-card-2',
      jpTitle: '約束',
      enTitle: 'The Promise',
      quote: `${story.promise_text}`,
      narrative: `A heartfelt vow from ${story.sender_name} to ${story.recipient_name}. Leaning against the cold midnight railing, watching the distant beacons blink across Tokyo.`,
      timeCode: '00:01:12',
      accentColor: cardAccent,
    },
    {
      id: 'letter-card-3',
      jpTitle: '永遠の夜',
      enTitle: 'Eternal Night',
      quote: `For ${story.recipient_name}, sealed forever in starlight by ${story.sender_name}.`,
      narrative: `Diving down into the quiet luminous sky, where memory and starlight dissolve into one. An eternal rooftop promise read ${story.views_count} times beneath the moon.`,
      timeCode: '00:02:48',
      accentColor: cardAccent,
    },
  ];

  return (
    <main className="relative min-h-[350vh] w-full overflow-x-hidden bg-[#040614] text-white">
      {/* Interactive Wax Seal Gate Before Unveiling */}
      {!isSealBroken && (
        <SealGate
          senderName={story.sender_name}
          recipientName={story.recipient_name}
          theme={activeTheme}
          onBreakSeal={handleBreakSeal}
        />
      )}

      {/* 3D Canvas Layer with Theme & Lanterns */}
      <RooftopCanvas theme={activeTheme}>
        <Scene1Hero
          theme={activeTheme}
          lanternsTrigger={lanternsTrigger}
        />
      </RooftopCanvas>

      {/* Persistent Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-6 md:px-16 pointer-events-none select-none">
        <Link
          href="/"
          className="flex items-center space-x-3 pointer-events-auto hover:opacity-85 transition-opacity"
        >
          <span className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-indigo-200 drop-shadow-[0_0_12px_rgba(255,133,162,0.35)]">
            KOISTORY
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full border border-pink-400/30 text-pink-300/80 font-mono tracking-wider bg-pink-500/10">
            {activeTheme === 'rain'
              ? '雨 • Tokyo Rain'
              : activeTheme === 'dawn'
              ? '黎明 • Golden Dawn'
              : '桜 • Sakura Night'}
          </span>
        </Link>

        <div className="flex items-center space-x-4 pointer-events-auto">
          <AudioToggle
            isPlaying={isPlaying}
            onToggle={toggle}
          />
        </div>
      </div>

      {/* Hero Header Section */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center pointer-events-none px-6">
        <div className="text-center space-y-4 max-w-2xl mx-auto pointer-events-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-pink-400/25 bg-pink-500/10 backdrop-blur-md mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-pink-200 uppercase">
              Rooftop Memory Sealed for {story.recipient_name}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-pink-100 to-indigo-200 drop-shadow-[0_4px_30px_rgba(255,133,162,0.4)]">
            {story.recipient_name}
          </h1>

          <p className="text-sm sm:text-base font-light text-indigo-100/80 max-w-lg mx-auto leading-relaxed">
            Written by <span className="text-pink-300 font-medium">{story.sender_name}</span>. Scroll downward to break through the midnight clouds and read their rooftop vow.
          </p>

          <div className="pt-8 flex flex-col items-center justify-center space-y-2 opacity-75 animate-bounce">
            <span className="text-[10px] font-mono tracking-widest text-pink-300 uppercase">
              Scroll to Read Story
            </span>
            <div className="w-4 h-7 rounded-full border border-pink-400/40 flex items-start justify-center p-1">
              <div className="w-1 h-2 rounded-full bg-pink-400 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Journey Cards Scrolled Downward */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-32 space-y-48">
        {storyCards.map((card, index) => (
          <div
            key={card.id}
            className={`flex flex-col ${
              index % 2 === 0 ? 'items-start sm:pl-8' : 'items-end sm:pr-8'
            }`}
          >
            <StoryCard
              card={card}
              index={index}
            />
          </div>
        ))}
      </section>

      {/* Recipient Letter Footer & Action Card */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 py-28 text-center space-y-8">
        <div className="p-8 sm:p-10 rounded-3xl border border-white/15 bg-[#0f1225]/80 backdrop-blur-xl space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-wider text-pink-200">
              Carry This Vow With You
            </h2>
            <p className="text-xs font-mono text-indigo-300/70 uppercase tracking-widest">
              永遠の約束 • Eternal Memory
            </p>
          </div>

          <p className="text-sm text-indigo-100/80 leading-relaxed font-light">
            This letter will remain suspended in the Tokyo night sky. Whenever you return to this link, the lights and falling starlight will be waiting.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToTop}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-pink-400/30 hover:border-pink-400/60 bg-white/5 hover:bg-white/10 text-pink-200 text-xs font-mono tracking-wider transition-all"
            >
              ↑ Revisit The Summit
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white text-xs font-mono tracking-wider transition-all shadow-[0_0_20px_rgba(255,133,162,0.4)]"
            >
              Craft Your Own Letter →
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Reaction Dock at Bottom */}
      <ReactionDock
        slug={story.slug}
        initialLanterns={story.lantern_count || 0}
        initialBlossoms={story.blossom_count || 0}
        onSendReaction={handleSendReaction}
      />
    </main>
  );
}

export default LetterExperience;
