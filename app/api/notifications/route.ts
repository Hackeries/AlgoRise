import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/notifications - Fetch notifications with pagination and filtering
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    // Authentication check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 per page
    const type = searchParams.get('type'); // notification type filter
    const unreadOnly = searchParams.get('unread') === 'true';
    const since = searchParams.get('since'); // ISO date string

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('notifications')
      .select(
        `
        id,
        type,
        title,
        message,
        data,
        read_at,
        created_at,
        priority,
        group_id,
        contest_id,
        related_user_id
      `
      )
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (unreadOnly) {
      query = query.is('read_at', null);
    }

    if (since) {
      query = query.gte('created_at', since);
    }

    // Filter out expired notifications
    query = query.or(
      'expires_at.is.null,expires_at.gt.' + new Date().toISOString()
    );

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    // Get unread count
    const { data: unreadCountResult } = await supabase.rpc(
      'get_unread_notification_count',
      { target_user_id: user.id }
    );

    return NextResponse.json({
      notifications: notifications || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasMore: (totalCount || 0) > offset + limit,
      },
      unreadCount: unreadCountResult || 0,
    });
  } catch (error) {
    console.error('Error in notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification (admin/system use)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Authentication check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      targetUserId,
      type,
      title,
      message,
      data = {},
      priority = 1,
      expiresAt,
      groupId,
      contestId,
      relatedUserId,
    } = body;

    // Validate required fields
    if (!targetUserId || !type || !title || !message) {
      return NextResponse.json(
        {
          error: 'Missing required fields: targetUserId, type, title, message',
        },
        { status: 400 }
      );
    }

    // Create notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type,
        title,
        message,
        data,
        priority,
        expires_at: expiresAt,
        group_id: groupId,
        contest_id: contestId,
        related_user_id: relatedUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error in notifications POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
