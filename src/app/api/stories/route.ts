import { NextResponse } from 'next/server';
import { storyDb } from '@/lib/supabase';
import type { StoryTheme, CreateStoryPayload } from '@/types/story';

const VALID_THEMES: StoryTheme[] = ['sakura', 'rain', 'dawn'];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const sender_name = typeof body.sender_name === 'string' ? body.sender_name.trim() : '';
    const recipient_name = typeof body.recipient_name === 'string' ? body.recipient_name.trim() : '';
    const promise_text = typeof body.promise_text === 'string' ? body.promise_text.trim() : '';
    const rawTheme = body.theme as StoryTheme;
    const theme: StoryTheme = VALID_THEMES.includes(rawTheme) ? rawTheme : 'sakura';

    const date_moment =
      typeof body.date_moment === 'string' && body.date_moment.trim()
        ? body.date_moment.trim()
        : new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

    // Validation
    if (!sender_name) {
      return NextResponse.json(
        { success: false, error: 'Sender name is required' },
        { status: 400 }
      );
    }

    if (sender_name.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Sender name must be 50 characters or fewer' },
        { status: 400 }
      );
    }

    if (!recipient_name) {
      return NextResponse.json(
        { success: false, error: 'Recipient name is required' },
        { status: 400 }
      );
    }

    if (recipient_name.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Recipient name must be 50 characters or fewer' },
        { status: 400 }
      );
    }

    if (!promise_text || promise_text.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Promise text must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (promise_text.length > 1500) {
      return NextResponse.json(
        { success: false, error: 'Promise text must be 1500 characters or fewer' },
        { status: 400 }
      );
    }

    const payload: CreateStoryPayload = {
      sender_name,
      recipient_name,
      promise_text,
      date_moment,
      theme,
    };

    const story = await storyDb.createStory(payload);

    // Compute shareable URL using request headers
    const origin =
      request.headers.get('origin') ||
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host') ||
      'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || (origin.includes('localhost') ? 'http' : 'https');
    const baseUrl = origin.startsWith('http') ? origin : `${protocol}://${origin}`;
    const shareableUrl = `${baseUrl}/m/${story.slug}`;

    return NextResponse.json(
      {
        success: true,
        slug: story.slug,
        url: shareableUrl,
        story,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating story:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error creating story' },
      { status: 500 }
    );
  }
}
