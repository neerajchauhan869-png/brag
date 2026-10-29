import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import type { Story, CreateStoryPayload, ReactionType } from '@/types/story';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('placeholder')
);

// Unified Supabase client instance (null or mock-safe when unconfigured)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

/**
 * Global In-Memory and LocalStorage Fallback Store
 * Enables instantaneous local development, testing, and offline resilience
 * without requiring live Supabase credentials.
 */
declare global {
  var __koistory_store__: Map<string, Story> | undefined;
}

if (!globalThis.__koistory_store__) {
  globalThis.__koistory_store__ = new Map<string, Story>();
  // Pre-seed a default demo story for immediate exploration
  const defaultSlug = 'tokyo-night';
  globalThis.__koistory_store__.set(defaultSlug, {
    id: 'demo-1',
    slug: defaultSlug,
    sender_name: 'Ren',
    recipient_name: 'Aoi',
    promise_text:
      'Under the Tokyo moon, I promised to always find you, across every season and every distance.',
    date_moment: 'Midnight 24:00',
    theme: 'sakura',
    views_count: 42,
    lantern_count: 18,
    blossom_count: 24,
    created_at: new Date().toISOString(),
  });
}

const memoryStore = globalThis.__koistory_store__;

export const LOCAL_STORAGE_KEY = 'koistory_stories_fallback';

export function getLocalStorageStories(): Record<string, Story> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalStorageStory(story: Story) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalStorageStories();
    current[story.slug] = story;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Could not write to localStorage:', err);
  }
}

/**
 * Story Data Access Layer
 * Seamlessly routes to Supabase when credentials exist,
 * with automatic fallback to memory/localStorage.
 */
export const storyDb = {
  async createStory(payload: CreateStoryPayload): Promise<Story> {
    const slug = `tokyo-${nanoid(6).toLowerCase()}`;
    const newStory: Story = {
      id: nanoid(),
      slug,
      sender_name: payload.sender_name.trim(),
      recipient_name: payload.recipient_name.trim(),
      promise_text: payload.promise_text.trim(),
      date_moment:
        payload.date_moment?.trim() ||
        new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      theme: payload.theme || 'sakura',
      views_count: 0,
      lantern_count: 0,
      blossom_count: 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('stories')
        .insert([newStory])
        .select()
        .single();

      if (!error && data) {
        return data as Story;
      }
      console.warn('Supabase insert failed, falling back to local store:', error);
    }

    // Fallback store
    memoryStore.set(slug, newStory);
    saveLocalStorageStory(newStory);
    return newStory;
  },

  async getStoryBySlug(slug: string): Promise<Story | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        return data as Story;
      }
    }

    // Memory store fallback
    const mem = memoryStore.get(slug);
    if (mem) return mem;

    // LocalStorage fallback
    const localMap = getLocalStorageStories();
    if (localMap[slug]) {
      memoryStore.set(slug, localMap[slug]);
      return localMap[slug];
    }

    return null;
  },

  async incrementViews(slug: string): Promise<number> {
    if (isSupabaseConfigured && supabase) {
      const { data: current } = await supabase
        .from('stories')
        .select('views_count')
        .eq('slug', slug)
        .single();

      if (current) {
        const nextViews = (current.views_count || 0) + 1;
        await supabase
          .from('stories')
          .update({ views_count: nextViews })
          .eq('slug', slug);
        return nextViews;
      }
    }

    const story = memoryStore.get(slug) || getLocalStorageStories()[slug];
    if (story) {
      story.views_count = (story.views_count || 0) + 1;
      memoryStore.set(slug, story);
      saveLocalStorageStory(story);
      return story.views_count;
    }
    return 1;
  },

  async recordReaction(
    slug: string,
    reactionType: ReactionType
  ): Promise<Story | null> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('story_reactions').insert([
        {
          id: nanoid(),
          story_slug: slug,
          reaction_type: reactionType,
          created_at: new Date().toISOString(),
        },
      ]);

      const { data: current } = await supabase
        .from('stories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (current) {
        const updates: Partial<Story> = {};
        if (reactionType === 'lantern') {
          updates.lantern_count = (current.lantern_count || 0) + 1;
        } else {
          updates.blossom_count = (current.blossom_count || 0) + 1;
        }

        const { data: updated } = await supabase
          .from('stories')
          .update(updates)
          .eq('slug', slug)
          .select()
          .single();

        if (updated) return updated as Story;
      }
    }

    // Fallback store
    const story = memoryStore.get(slug) || getLocalStorageStories()[slug];
    if (story) {
      if (reactionType === 'lantern') {
        story.lantern_count = (story.lantern_count || 0) + 1;
      } else {
        story.blossom_count = (story.blossom_count || 0) + 1;
      }
      memoryStore.set(slug, story);
      saveLocalStorageStory(story);
      return { ...story };
    }

    return null;
  },
};
