import { NextResponse } from 'next/server';
import { storyDb } from '@/lib/supabase';
import type { ReactionType } from '@/types/story';

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    const story = await storyDb.getStoryBySlug(slug);
    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Increment view count asynchronously
    const nextViews = await storyDb.incrementViews(slug);
    story.views_count = nextViews;

    return NextResponse.json({
      success: true,
      story,
    });
  } catch (err) {
    console.error('Error fetching story by slug:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error fetching story' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const reactionType = body.reaction_type as ReactionType;

    if (reactionType !== 'lantern' && reactionType !== 'blossom') {
      return NextResponse.json(
        { success: false, error: 'Invalid reaction type. Must be "lantern" or "blossom"' },
        { status: 400 }
      );
    }

    const updatedStory = await storyDb.recordReaction(slug, reactionType);
    if (!updatedStory) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      story: updatedStory,
    });
  } catch (err) {
    console.error('Error recording reaction:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error recording reaction' },
      { status: 500 }
    );
  }
}
