import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify user has operator/admin/manager/sales role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
    }

    const allowedRoles = ['admin', 'manager', 'sales', 'operator'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      room,
      amenities = [],
      imageUrls = [],
      nearbyPlaces = [],
      universities = [],
      videoReviews = [],
      phone,
    } = body;

    // Update phone if provided
    if (phone?.trim()) {
      await supabaseAdmin
        .from('profiles')
        .update({ phone: phone.trim() })
        .eq('id', user.id);
    }

    // Insert room
    const { data: roomData, error: roomError } = await supabaseAdmin
      .from('rooms')
      .insert({ ...room, owner_id: user.id })
      .select()
      .single();

    if (roomError) {
      return NextResponse.json({ error: roomError.message }, { status: 500 });
    }

    const roomId = roomData.id;

    // Insert amenities
    if (amenities.length > 0) {
      await supabaseAdmin
        .from('room_amenities')
        .insert(amenities.map((amenityId: string) => ({ room_id: roomId, amenity_id: amenityId })));
    }

    // Insert images
    if (imageUrls.length > 0) {
      await supabaseAdmin
        .from('room_images')
        .insert(imageUrls.map((url: string) => ({ room_id: roomId, image_url: url })));
    }

    // nearby_places table does not exist in this schema – skip silently

    // Insert university associations
    if (universities.length > 0) {
      await supabaseAdmin
        .from('room_universities')
        .insert(universities.map((uniId: string) => ({ room_id: roomId, university_id: uniId })));
    }

    // Insert video reviews
    if (videoReviews.length > 0) {
      await supabaseAdmin
        .from('room_video_reviews')
        .insert(videoReviews.map((v: any) => ({ ...v, room_id: roomId })));
    }

    return NextResponse.json({ room: roomData });
  } catch (err) {
    console.error('Create room error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
