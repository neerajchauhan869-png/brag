'use client';

import React, { useState } from 'react';
import { Sparkles, Feather } from 'lucide-react';
import { RooftopCanvas } from '@/components/canvas/RooftopCanvas';
import { Scene1Hero } from '@/components/canvas/Scene1Hero';
import { Scene2Narrative } from '@/components/narrative/Scene2Narrative';
import { AudioToggle } from '@/components/ui/AudioToggle';
import { CreateStoryModal } from '@/components/ui/CreateStoryModal';
import { useWebAudio } from '@/hooks/useWebAudio';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isPlaying, toggle } = useWebAudio();

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main className="relative min-h-[350vh] w-full overflow-x-hidden bg-[#040614] text-white">
      {/* 3D Procedural Canvas Layer - Stays Fixed in Viewport and Synced with GSAP Scroll */}
      <RooftopCanvas>
        <Scene1Hero />
      </RooftopCanvas>

      {/* Persistent Fixed Top Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-6 md:px-16 pointer-events-none select-none">
        {/* Brand Identity */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          <span className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-indigo-200 drop-shadow-[0_0_12px_rgba(255,133,162,0.35)]">
            KOISTORY
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-pink-400/30 text-pink-300/80 font-mono tracking-wider bg-pink-500/10">
            恋の物語
          </span>
        </div>

        {/* Action Controls: Craft Story, Sound Toggle Button & Time Code */}
        <div className="flex items-center space-x-3 sm:space-x-4 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-2 rounded-full border border-pink-400/30 bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 text-xs font-mono tracking-wider transition-colors cursor-pointer"
          >
            <Feather className="w-3.5 h-3.5 text-pink-300" />
            <span>Write Letter</span>
          </button>

          <div className="hidden md:block text-xs font-mono tracking-widest text-indigo-200/50 uppercase">
            Tokyo Rooftop • 24:00
          </div>
          <AudioToggle isPlaying={isPlaying} onToggle={toggle} />
        </div>
      </div>

      {/* Hero Section (Viewport 1) */}
      <section className="relative z-10 flex min-h-screen flex-col justify-between px-6 pt-28 pb-12 md:px-16 pointer-events-none select-none">
        {/* Spacer for top nav */}
        <div className="h-6" />

        {/* Hero Central Typography */}
        <div className="max-w-2xl my-auto">
          <p className="text-xs md:text-sm font-mono tracking-[0.3em] uppercase text-pink-300/80 mb-3">
            Cinematic Interactive Anime Experience
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white/95 leading-none mb-4 drop-shadow-[0_0_24px_rgba(255,133,162,0.35)]">
            Under the
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-indigo-200">
              Luminous Moon
            </span>
          </h1>
          <p className="text-sm md:text-base text-indigo-100/75 max-w-lg leading-relaxed font-light mb-6">
            Two souls leaning against the midnight railing, watching Tokyo&apos;s glowing skyline as cherry blossoms drift through the cool evening breeze.
          </p>

          {/* Interactive Creator Action Button */}
          <div className="pt-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="group relative inline-flex items-center space-x-2.5 px-7 py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 text-white font-mono text-xs tracking-wider uppercase font-bold shadow-[0_0_30px_rgba(255,133,162,0.4)] hover:shadow-[0_0_40px_rgba(255,133,162,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-pink-200 group-hover:rotate-12 transition-transform" />
              <span>Craft a Rooftop Story</span>
              <span className="text-[10px] opacity-75 font-normal tracking-tight">屋上の手紙</span>
            </button>
          </div>
        </div>

        {/* Bottom Status / Animated Scroll Cue (F16.2) */}
        <div className="flex items-end justify-between">
          <div className="text-xs font-mono tracking-widest text-indigo-300/50">
            Procedural 3D Environment • 60 FPS
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[10px] font-mono tracking-[0.25em] text-pink-200/60 uppercase animate-pulse">
              Scroll to Plunge
            </span>
            <div className="w-4 h-7 rounded-full border border-indigo-400/30 flex items-start justify-center p-1">
              <div className="w-1 h-2 bg-pink-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Milestone 3: Multiple Scrollable Story Sections Below Hero */}
      <Scene2Narrative />

      {/* Footer Navigation Bar */}
      <footer className="relative z-10 w-full px-6 py-12 md:px-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-indigo-300/50 select-none">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <span>KOISTORY • Tokyo 24:00 Atmospheric Soundscape</span>
        </div>
        <button
          type="button"
          onClick={scrollToTop}
          className="text-pink-300/80 hover:text-pink-200 transition-colors uppercase tracking-widest pointer-events-auto cursor-pointer"
        >
          Return to Rooftop ↑
        </button>
      </footer>

      {/* Story Creator Modal */}
      <CreateStoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
