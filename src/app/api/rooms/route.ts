import { NextRequest, NextResponse } from 'next/server';
import { fetchRooms, fetchRoomsWithFilters } from '@/lib/supabaseServices';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const city = searchParams.get('city');
    const district = searchParams.get('district');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minArea = searchParams.get('minArea');
    const maxArea = searchParams.get('maxArea');

    // Check if any filters are applied
    const hasFilters = city || district || minPrice || maxPrice || minArea || maxArea;

    let rooms;
    
    if (hasFilters) {
      rooms = await fetchRoomsWithFilters({
        city: city || undefined,
        district: district || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minArea: minArea ? Number(minArea) : undefined,
        maxArea: maxArea ? Number(maxArea) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
    } else {
      rooms = await fetchRooms(limit ? Number(limit) : undefined);
    }

    return NextResponse.json({
      success: true,
      data: rooms,
      count: rooms.length,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch rooms',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
