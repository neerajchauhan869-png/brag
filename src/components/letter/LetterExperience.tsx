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
import type { Story, ReactionType } from '@/types/story';
import type { StoryCardData } from '@/types/scene';

export interface LetterExperienceProps {
  story: Story;
}

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function LetterExperience({ story: initialStory }: LetterExperienceProps) {
  const [isSealBroken, setIsSealBroken] = useState(false);
  const [lanternsTrigger, setLanternsTrigger] = useState(0);

  const { isPlaying, toggle, play } = useWebAudio();

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
    story.theme === 'rain'
      ? 'twilight'
      : story.theme === 'dawn'
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
          theme={story.theme}
          onBreakSeal={handleBreakSeal}
        />
      )}

      {/* 3D Canvas Layer with Theme & Lanterns */}
      <RooftopCanvas>
        <Scene1Hero
          theme={story.theme}
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
          <span className="text-xs px-2 py-0.5 rounded-full border border-pink-400/30 text-pink-300/80 font-mono tracking-wider bg-pink-500/10">
            手紙
          </span>
        </Link>

        <div className="flex items-center space-x-4 pointer-events-auto">
          <div className="hidden sm:block text-xs font-mono tracking-widest text-indigo-200/60 uppercase">
            Letter for {story.recipient_name} • From {story.sender_name}
          </div>
          <AudioToggle isPlaying={isPlaying} onToggle={toggle} />
        </div>
      </div>

      {/* Hero Presentation */}
      <section className="relative z-10 flex min-h-screen flex-col justify-between px-6 pt-28 pb-12 md:px-16 pointer-events-none select-none">
        <div className="h-6" />

        <div className="max-w-2xl my-auto">
          <p className="text-xs md:text-sm font-mono tracking-[0.3em] uppercase text-pink-300/80 mb-3">
            A Midnight Letter • 東京からの約束 • {formattedDate}
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white/95 leading-none mb-4 drop-shadow-[0_0_24px_rgba(255,133,162,0.35)]">
            For
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-indigo-200">
              {story.recipient_name}
            </span>
          </h1>
          <p className="text-sm md:text-base text-indigo-100/75 max-w-lg leading-relaxed font-light">
            {story.sender_name} left a promise under the Tokyo moonlight for you: &ldquo;{story.promise_text}&rdquo;
          </p>
        </div>

        {/* Scroll Cue */}
        <div className="flex items-end justify-between">
          <div className="text-xs font-mono tracking-widest text-indigo-300/50">
            Theme: {story.theme.toUpperCase()} • {story.views_count} Reads
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[10px] font-mono tracking-[0.25em] text-pink-200/60 uppercase animate-pulse">
              Scroll to Read
            </span>
            <div className="w-4 h-7 rounded-full border border-indigo-400/30 flex items-start justify-center p-1">
              <div className="w-1 h-2 bg-pink-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Narrative Cards Section */}
      <section
        aria-label="Story Cards Narrative"
        className="relative z-10 w-full flex flex-col justify-between py-24 px-6 md:px-16 pointer-events-none"
      >
        <div className="w-full flex flex-col items-center justify-center mb-24 text-center select-none">
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-pink-300/80 mb-2">
            Act II • The Secret Letter
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-indigo-200 to-white drop-shadow-[0_0_20px_rgba(164,140,255,0.3)]">
            Words Carried by the Wind
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent mt-4" />
        </div>

        {/* Staggered Story Cards */}
        <div className="space-y-36 md:space-y-48 max-w-6xl mx-auto w-full">
          <div className="flex justify-start md:pl-8">
            <StoryCard card={storyCards[0]} index={0} />
          </div>

          <div className="flex justify-end md:pr-8">
            <StoryCard card={storyCards[1]} index={1} />
          </div>

          <div className="flex justify-center">
            <StoryCard card={storyCards[2]} index={2} />
          </div>
        </div>

        {/* Finale Action Box */}
        <div className="mt-40 text-center max-w-xl mx-auto select-none">
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0f1225]/75 backdrop-blur-md pointer-events-auto shadow-[0_0_40px_rgba(255,133,162,0.15)] flex flex-col items-center space-y-4">
            <span className="text-xs font-mono tracking-widest text-pink-300/80 uppercase block">
              Inspired by this Rooftop?
            </span>
            <p className="text-sm text-indigo-100/90 font-light leading-relaxed">
              Craft your own cinematic rooftop love letter to send across the night sky.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-mono text-xs tracking-wider shadow-lg hover:opacity-90 transition-opacity"
            >
              Craft Your Own Rooftop Story →
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Reaction Dock */}
      <ReactionDock
        slug={story.slug}
        initialLanterns={story.lantern_count}
        initialBlossoms={story.blossom_count}
        onSendReaction={handleSendReaction}
      />

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-12 md:px-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-indigo-300/50 select-none">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <span>KOISTORY • Tokyo 24:00 Rooftop Letter Platform</span>
        </div>
        <button
          type="button"
          onClick={scrollToTop}
          className="text-pink-300/80 hover:text-pink-200 transition-colors uppercase tracking-widest pointer-events-auto cursor-pointer"
        >
          Return to Rooftop ↑
        </button>
      </footer>
    </main>
  );
}

export default LetterExperience;
