import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

async function verifyOperatorRole(userId: string) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  const allowed = ['admin', 'manager', 'sales', 'operator'];
  return profile && allowed.includes(profile.role) ? profile : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: room, error } = await supabaseAdmin
      .from('rooms')
      .select(`
        *,
        profiles:owner_id (
          id,
          name,
          phone,
          role,
          created_at,
          DoB:dob
        ),
        room_images (
          id,
          image_url,
          created_at
        ),
        feedbacks (
          id,
          rating,
          comment,
          created_at
        ),
        room_amenities (
          amenity_id,
          amenities (
            id,
            name
          )
        ),
        room_universities (
          university_id,
          universities (
            id,
            name,
            short_name
          )
        ),
        room_video_reviews (
          id,
          source_url,
          display_title,
          sort_order
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Fetch nearby_places separately (table may not exist yet)
    let nearby_places: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from('nearby_places').select('id, name, category, distance_km, description')
        .eq('room_id', id);
      nearby_places = data || [];
    } catch {
      // Table doesn't exist yet
    }

    return NextResponse.json({ room: { ...room, nearby_places } });
  } catch (err) {
    console.error('Fetch room error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const user = await verifyUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await verifyOperatorRole(user.id);
    if (!profile) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

    // Verify ownership (unless admin/manager)
    if (!['admin', 'manager'].includes(profile.role)) {
      const { data: existingRoom } = await supabaseAdmin
        .from('rooms').select('owner_id').eq('id', id).single();
      if (!existingRoom || existingRoom.owner_id !== user.id) {
        return NextResponse.json({ error: 'Không có quyền sửa nhà trọ này' }, { status: 403 });
      }
    }

    const body = await request.json();
    const {
      room,
      amenities = [],
      newImageUrls = [],
      imagesToDelete = [],
      universities = [],
      nearbyPlaces = [],
      videoReviews = [],
      phone,
    } = body;

    // Update phone
    if (phone?.trim()) {
      await supabaseAdmin.from('profiles').update({ phone: phone.trim() }).eq('id', user.id);
    }

    // Update room
    const { error: roomError } = await supabaseAdmin
      .from('rooms').update(room).eq('id', id);
    if (roomError) return NextResponse.json({ error: roomError.message }, { status: 500 });

    // Delete removed images
    if (imagesToDelete.length > 0) {
      await supabaseAdmin.from('room_images').delete().in('id', imagesToDelete);
    }

    // Insert new images
    if (newImageUrls.length > 0) {
      await supabaseAdmin.from('room_images').insert(
        newImageUrls.map((url: string) => ({ room_id: id, image_url: url }))
      );
    }

    // Replace amenities
    await supabaseAdmin.from('room_amenities').delete().eq('room_id', id);
    if (amenities.length > 0) {
      await supabaseAdmin.from('room_amenities').insert(
        amenities.map((amenityId: string) => ({ room_id: id, amenity_id: amenityId }))
      );
    }

    // Replace universities
    await supabaseAdmin.from('room_universities').delete().eq('room_id', id);
    if (universities.length > 0) {
      await supabaseAdmin.from('room_universities').insert(
        universities.map((uniId: string) => ({ room_id: id, university_id: uniId }))
      );
    }

    // Replace nearby places (silently skip if table doesn't exist yet)
    try {
      await supabaseAdmin.from('nearby_places').delete().eq('room_id', id);
      if (nearbyPlaces.length > 0) {
        await supabaseAdmin.from('nearby_places').insert(
          nearbyPlaces.map((p: any) => ({ ...p, room_id: id }))
        );
      }
    } catch {
      // nearby_places table may not exist yet
    }

    // Replace video reviews
    await supabaseAdmin.from('room_video_reviews').delete().eq('room_id', id);
    if (videoReviews.length > 0) {
      await supabaseAdmin.from('room_video_reviews').insert(
        videoReviews.map((v: any) => ({ ...v, room_id: id }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update room error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
