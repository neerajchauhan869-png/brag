import React, { Suspense } from 'react';
import { storyDb } from '@/lib/supabase';
import { StoryPageWrapper } from '@/components/letter/StoryPageWrapper';
import type { Metadata } from 'next';

export interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await storyDb.getStoryBySlug(slug);

  if (!story) {
    return {
      title: 'A Rooftop Letter — Koistory',
      description: 'A cinematic rooftop memory under the Tokyo moon.',
    };
  }

  return {
    title: `A Rooftop Letter for ${story.recipient_name} — Koistory`,
    description: `A cinematic rooftop memory dedicated to ${story.recipient_name} by ${story.sender_name}.`,
  };
}

async function StoryContent({ params }: PageProps) {
  const { slug } = await params;
  const story = await storyDb.getStoryBySlug(slug);

  if (story) {
    await storyDb.incrementViews(slug);
    story.views_count = (story.views_count || 0) + 1;
  }

  return <StoryPageWrapper slug={slug} initialStory={story} />;
}

export default function StorySlugPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-[#040614] flex flex-col items-center justify-center text-white">
          <div className="w-12 h-12 rounded-full border-2 border-pink-400/30 border-t-pink-400 animate-spin mb-4" />
          <p className="text-xs font-mono tracking-widest text-pink-300/80 uppercase">
            Fetching Rooftop Letter...
          </p>
        </div>
      }
    >
      <StoryContent params={params} />
    </Suspense>
  );
}
