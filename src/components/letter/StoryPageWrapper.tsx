'use client';

import React, { useSyncExternalStore, useMemo } from 'react';
import Link from 'next/link';
import { LetterExperience } from './LetterExperience';
import { LOCAL_STORAGE_KEY } from '@/lib/supabase';
import type { Story, StoryTheme } from '@/types/story';

export interface StoryPageWrapperProps {
  slug: string;
  initialStory: Story | null;
  queryTheme?: 'sakura' | 'rain' | 'dawn';
}

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function StoryPageWrapper({
  slug,
  initialStory,
  queryTheme,
}: StoryPageWrapperProps) {
  // Use React 19 useSyncExternalStore to reactively read from localStorage without cascading renders
  const localStoriesRaw = useSyncExternalStore(
    subscribeStorage,
    () => (typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null),
    () => null
  );

  const story = useMemo(() => {
    if (initialStory) return initialStory;
    if (localStoriesRaw) {
      try {
        const parsed = JSON.parse(localStoriesRaw);
        if (parsed[slug]) return parsed[slug] as Story;
      } catch {
        // ignore
      }
    }
    return null;
  }, [initialStory, localStoriesRaw, slug]);

  if (!story) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#040614] text-white select-none">
        <div className="max-w-md w-full p-8 rounded-3xl border border-white/10 bg-[#0f1225]/80 backdrop-blur-xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full border border-pink-400/30 flex items-center justify-center text-pink-300 font-mono text-xl">
            風
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-wider text-pink-200">
              Memory Lost in the Wind
            </h1>
            <p className="text-xs font-mono text-indigo-300/60 uppercase tracking-widest">
              風に消えた記憶 • 404
            </p>
          </div>
          <p className="text-sm text-indigo-100/70 font-light leading-relaxed">
            This rooftop letter could not be found. It may have drifted into the Tokyo starlight or the link may have expired.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-mono text-xs tracking-wider hover:opacity-90 transition-opacity"
            >
              ← Return to Main Rooftop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Active theme resolution: explicit query param overrides story.theme for previewing; defaults to story.theme
  const activeTheme: StoryTheme = queryTheme || story.theme || 'sakura';
  const effectiveStory = activeTheme !== story.theme ? { ...story, theme: activeTheme } : story;

  return <LetterExperience story={effectiveStory} theme={activeTheme} />;
}

export default StoryPageWrapper;
