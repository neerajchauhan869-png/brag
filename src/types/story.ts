export type StoryTheme = 'sakura' | 'rain' | 'dawn';

export type ReactionType = 'lantern' | 'blossom';

export interface Story {
  id: string;
  slug: string;
  sender_name: string;
  recipient_name: string;
  promise_text: string;
  date_moment?: string;
  theme: StoryTheme;
  views_count: number;
  lantern_count: number;
  blossom_count: number;
  created_at: string;
  updated_at?: string;
}

export interface StoryReaction {
  id: string;
  story_slug: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface CreateStoryPayload {
  sender_name: string;
  recipient_name: string;
  promise_text: string;
  date_moment?: string;
  theme: StoryTheme;
}

export interface CreateStoryResponse {
  success: boolean;
  slug: string;
  url: string;
  story: Story;
}

export interface StoryResponse {
  success: boolean;
  story: Story;
}

export interface ReactionPayload {
  reaction_type: ReactionType;
}

export interface ReactionResponse {
  success: boolean;
  story: Story;
}
