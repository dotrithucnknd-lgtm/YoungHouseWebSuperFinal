import { supabase } from './supabaseClient';
import { buildRoomDetailHref } from '@/utils/roomDetailUrl';
// NOTE: compressImage uses browser-only library. Import dynamically where used.
import { StayDataType, AuthorType, TaxonomyType } from '@/data/types';
import { Route } from '@/routers/types';
import type { RoomStatus } from "@/data/types";

// Authentication interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: 'admin' | 'manager' | 'sales' | 'operator' | 'staff' | 'tenant' | 'user';
  avatar?: string;
}

export interface DatabaseRoom {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price: number;
  area: number;
  address: string;
  city: string;
  district: string;
  ward: string;
  status: 'available' | 'reserved' | 'rented' | 'hidden';
  created_at: string;
  banner: string;
  maps: string;
}

export interface DatabaseRoomImage {
  id: string;
  room_id: string;
  image_url: string;
  created_at: string;
}

export interface DatabaseProfile {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'manager' | 'sales' | 'operator' | 'staff' | 'tenant' | 'user';
  created_at: string;
  DoB: string;
}

export interface DatabaseReview {
  id: string;
  room_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface DatabaseAmenity {
  id: string;
  name: string;
  created_at: string;
}

export interface DatabaseNotification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target_audience: 'all' | 'renters' | 'owners' | 'admins';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFeedback {
  id: string;
  room_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackWithUser extends DatabaseFeedback {
  profiles: {
    name: string;
    role: 'admin' | 'manager' | 'sales' | 'operator' | 'staff' | 'tenant' | 'user';
  };
}

export interface DatabaseNearbyPlace {
  id: string;
  room_id: string;
  name: string;
  category: 'university' | 'school' | 'hospital' | 'supermarket' | 'mall' | 'park' | 'bus_stop' | 'metro' | 'restaurant' | 'cafe' | 'gym' | 'other';
  distance_km: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUniversity {
  id: string;
  name: string;
  short_name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseRoomUniversity {
  id: string;
  room_id: string;
  university_id: string;
  distance_km?: number;
  created_at: string;
}

export interface DatabaseRoomVideoReview {
  id: string;
  room_id: string;
  source_url: string;
  display_title: string | null;
  sort_order: number;
  created_at: string;
}

export interface RoomVideoReviewListing {
  id: string;
  source_url: string;
  display_title: string | null;
  sort_order: number;
  room: {
    id: string;
    title: string;
    city: string | null;
    district: string | null;
    ward: string | null;
    address: string | null;
    /** Địa chỉ hiển thị giống trang phòng trọ (address + ward + district + city) */
    addressDisplay: string;
    price: number | null;
    /** Giá đã format VND, giống StayCard */
    priceLabel: string;
    banner: string | null;
    status: string;
    reviewStart: number;
    reviewCount: number;
  };
}

export interface UniversityWithRoomCount extends DatabaseUniversity {
  room_count: number;
}

export interface DatabaseBooking {
  id: string;
  room_id: string;
  user_id: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  total_price: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  message?: string;
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends DatabaseBooking {
  rooms: {
    id: string;
    title: string;
    price: number;
    address: string;
    banner: string;
  };
  profiles: {
    id: string;
    name: string;
    phone: string;
  };
  approver?: {
    name: string;
  };
}

export interface RoomWithRelations extends DatabaseRoom {
  profiles: DatabaseProfile;
  room_images: DatabaseRoomImage[];
  feedbacks: DatabaseFeedback[];
  room_amenities: {
    amenities: DatabaseAmenity;
  }[];
}

async function fetchReservedRoomIdSet(roomIds: string[]): Promise<Set<string>> {
  if (!roomIds.length) return new Set();
  const { data, error } = await supabase
    .from("bookings")
    .select("room_id, status")
    .in("room_id", roomIds)
    .in("status", ["pending", "approved"]);

  if (error) {
    console.error("Error fetching reserved rooms:", error);
    return new Set();
  }

  const set = new Set<string>();
  (data || []).forEach((row: any) => {
    if (row?.room_id) set.add(String(row.room_id));
  });
  return set;
}

function getDisplayRoomStatus(room: DatabaseRoom, isReserved: boolean): RoomStatus {
  if (room.status === "reserved") return "reserved";
  if (room.status !== "available") return "sold_out";
  if (isReserved) return "reserved";
  return "available";
}

// Fetch all available rooms with related data
export async function fetchRooms(limit?: number): Promise<StayDataType[]> {
  try {
    let query = supabase
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
          amenities (
            id,
            name
          )
        )
      `)
      .in('status', ['available', 'reserved', 'rented'])
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data: rooms, error } = await query;

    if (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }

    if (!rooms) {
      return [];
    }

    // Transform database data to StayDataType
    const reservedSet = await fetchReservedRoomIdSet((rooms as any[]).map((r) => String(r.id)));
    return rooms.map((room: RoomWithRelations) =>
      transformRoomToStayData(room, { reserved: reservedSet.has(String(room.id)) })
    );
  } catch (error) {
    console.error('Error in fetchRooms:', error);
    return [];
  }
}

// Fetch rooms with pagination (1-based page index)
export async function fetchRoomsPaginated(page: number, pageSize: number): Promise<StayDataType[]> {
  try {
    const from = (Math.max(1, page) - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: rooms, error } = await supabase
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
          amenities (
            id,
            name
          )
        )
      `)
      .in('status', ['available', 'reserved', 'rented'])
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching rooms (paginated):', error);
      return [];
    }

    const reservedSet = await fetchReservedRoomIdSet((rooms || []).map((r: any) => String(r.id)));
    return (rooms || []).map((room: RoomWithRelations) =>
      transformRoomToStayData(room, { reserved: reservedSet.has(String(room.id)) })
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in fetchRoomsPaginated:', error);
    return [];
  }
}

// Get total count of available rooms
export async function getTotalRoomsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .in('status', ['available', 'reserved', 'rented']);

    if (error) {
      console.error('Error fetching total rooms count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getTotalRoomsCount:', error);
    return 0;
  }
}

// Fetch rooms with pagination and total count (1-based page index)
export async function fetchRoomsPaginatedWithTotal(page: number, pageSize: number): Promise<{ items: StayDataType[]; total: number }>{
  try {
    const from = (Math.max(1, page) - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: rooms, error, count } = await supabase
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
          amenities (
            id,
            name
          )
        )
      `, { count: 'exact' })
      .in('status', ['available', 'reserved', 'rented'])
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching rooms (paginated with total):', error);
      return { items: [], total: 0 };
    }

    const reservedSet = await fetchReservedRoomIdSet((rooms || []).map((r: any) => String(r.id)));
    const items = (rooms || []).map((room: RoomWithRelations) =>
      transformRoomToStayData(room, { reserved: reservedSet.has(String(room.id)) })
    );
    return { items, total: typeof count === 'number' ? count : items.length };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in fetchRoomsPaginatedWithTotal:', error);
    return { items: [], total: 0 };
  }
}

// Fetch a single room by ID
export async function fetchRoomById(roomId: string): Promise<StayDataType | null> {
  try {
    const { data: room, error } = await supabase
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
          amenities (
            id,
            name
          )
        )
      `)
      .eq('id', roomId)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      return null;
    }

    if (!room) {
      return null;
    }

    const reservedSet = await fetchReservedRoomIdSet([String((room as any).id)]);
    return transformRoomToStayData(room as RoomWithRelations, {
      reserved: reservedSet.has(String((room as any).id)),
    });
  } catch (error) {
    console.error('Error in fetchRoomById:', error);
    return null;
  }
}

// Fetch amenities (names) for a room
export async function fetchRoomAmenities(roomId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('room_amenities')
      .select(
        `
        amenities (
          name
        )
      `
      )
      .eq('room_id', roomId);

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching room amenities:', error);
      return [];
    }

    const names = (data || [])
      .flatMap((row: any) => {
        const a = row?.amenities;
        if (!a) return [];
        // Supabase can return either a single object or an array depending on query
        if (Array.isArray(a)) return a.map((x) => x?.name).filter(Boolean);
        return [a.name].filter(Boolean);
      }) as string[];
    return names;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error in fetchRoomAmenities:', e);
    return [];
  }
}

// Transform database room data to StayDataType
function transformRoomToStayData(room: RoomWithRelations, opts?: { reserved?: boolean }): StayDataType {
  const normalizeImageUrl = (raw: unknown): string => {
    if (typeof raw !== "string") return "";
    const s = raw.trim();
    if (!s) return "";
    // Next/Image often rejects http remote URLs; normalize to https.
    if (s.startsWith("http://")) return `https://${s.slice("http://".length)}`;
    return s;
  };

  // Create author from profile data
  const author: AuthorType = {
    id: room.profiles?.id || room.owner_id,
    firstName: room.profiles?.name?.split(' ')[0] || 'Unknown',
    lastName: room.profiles?.name?.split(' ').slice(1).join(' ') || 'User',
    displayName: room.profiles?.name || 'Unknown User',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', // Default avatar
    email: '',
    phone: room.profiles?.phone || '',
    count: 0,
    desc: 'Property Owner',
    jobName: 'Property Owner',
    href: '/author' as Route,
    starRating: 5,
  };

  // Calculate average rating from feedbacks
  const feedbacks = room.feedbacks || [];
  const averageRating = feedbacks.length > 0 
    ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length 
    : 0;

  // Get gallery images (sanitize null/empty urls)
  const galleryImgs = (room.room_images || [])
    .map((img) => normalizeImageUrl(img?.image_url))
    .filter(Boolean);
  
  // Add banner image if available
  const bannerUrl = normalizeImageUrl(room.banner);
  if (bannerUrl) galleryImgs.unshift(bannerUrl);

  // Default images if no images available
  if (galleryImgs.length === 0) {
    galleryImgs.push('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop');
  }

  // Format price in Vietnamese Dong
  const priceLabel = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(room.price);

  // Calculate bedrooms based on area (rough estimate)
  const bedrooms = Math.max(1, Math.round((room.area || 20) / 15));

  // Parse maps coordinates or URL if available
  let mapCoordinates = { lat: 10.8231, lng: 106.6297 }; // Default to Ho Chi Minh City
  let mapsEmbedUrl: string | undefined = undefined;
  
  if (room.maps) {
    // Check if it's an embed URL (starts with http)
    if (room.maps.startsWith('http')) {
      mapsEmbedUrl = room.maps;
    } else {
      // Try to parse as JSON coordinates
      try {
        const coords = JSON.parse(room.maps);
        if (coords.lat && coords.lng) {
          mapCoordinates = coords;
        }
      } catch (e) {
        // Use default coordinates if parsing fails
      }
    }
  }

  // Create listing category
  const listingCategory: TaxonomyType = {
    id: 'room',
    name: 'Nhà trọ',
    href: '/phong-tro' as Route,
    taxonomy: 'category',
    listingType: 'stay',
  };

  const stayData: StayDataType = {
    id: room.id,
    author,
    date: new Date(room.created_at).toLocaleDateString('vi-VN'),
    href: buildRoomDetailHref(room.title, String(room.id)),
    title: room.title,
    description: room.description || undefined,
    featuredImage: galleryImgs[0],
    roomStatus: getDisplayRoomStatus(room, Boolean(opts?.reserved)),
    commentCount: feedbacks.length,
    viewCount: Math.floor(Math.random() * 100) + 50, // Random view count for now
    address: `${room.address}${room.ward ? ', ' + room.ward : ''}${room.district ? ', ' + room.district : ''}${room.city ? ', ' + room.city : ''}`,
    reviewStart: Number(averageRating.toFixed(1)),
    reviewCount: feedbacks.length,
    like: false, // This would need to be fetched from user's favorites
    galleryImgs,
    price: priceLabel,
    area: room.area,
    listingCategory,
    maxGuests: bedrooms * 2, // Estimate based on bedrooms
    bedrooms,
    bathrooms: Math.max(1, Math.floor(bedrooms / 2)), // Estimate
    saleOff: null,
    isAds: false,
    map: mapCoordinates,
    maps: mapsEmbedUrl,
  };

  return stayData;
}

// Fetch rooms with filters
export async function fetchRoomsWithFilters(filters: {
  city?: string;
  district?: string;
  searchText?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  limit?: number;
}): Promise<StayDataType[]> {
  try {
    let query = supabase
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
          amenities (
            id,
            name
          )
        )
      `)
      .in('status', ['available', 'reserved', 'rented'])
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.district) {
      query = query.ilike('district', `%${filters.district}%`);
    }
    if (filters.searchText) {
      const q = filters.searchText.replace(/[,]/g, ' ');
      // Match any of these text fields
      query = query.or(
        `city.ilike.%${q}% , district.ilike.%${q}% , address.ilike.%${q}% , title.ilike.%${q}%`
      );
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.minArea) {
      query = query.gte('area', filters.minArea);
    }
    if (filters.maxArea) {
      query = query.lte('area', filters.maxArea);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data: rooms, error } = await query;

    if (error) {
      console.error('Error fetching filtered rooms:', error);
      return [];
    }

    if (!rooms) {
      return [];
    }

    const reservedSet = await fetchReservedRoomIdSet((rooms as any[]).map((r) => String(r.id)));
    return rooms.map((room: RoomWithRelations) =>
      transformRoomToStayData(room, { reserved: reservedSet.has(String(room.id)) })
    );
  } catch (error) {
    console.error('Error in fetchRoomsWithFilters:', error);
    return [];
  }
}

// Fetch rooms with filters, pagination and total count
export async function fetchRoomsWithFiltersPaginated(filters: {
  city?: string;
  district?: string;
  searchText?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  sort?: 'price_asc' | 'price_desc' | '';
  page: number;
  pageSize: number;
}): Promise<{ items: StayDataType[]; total: number }>{
  try {
    const from = (Math.max(1, filters.page) - 1) * filters.pageSize;
    const to = from + filters.pageSize - 1;

    let query = supabase
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
          amenities (
            id,
            name
          )
        )
      `, { count: 'exact' })
      .in('status', ['available', 'reserved', 'rented']);

    // Apply sorting
    if (filters.sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (filters.sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.district) {
      // Filter by district or ward (exact match or partial)
      query = query.or(`district.ilike.%${filters.district}%,ward.ilike.%${filters.district}%`);
    }
    if (filters.searchText) {
      const q = filters.searchText.replace(/[,]/g, ' ').trim();
      if (q) {
        // Search in multiple fields - PostgreSQL ilike is case-insensitive
        // Note: For accent-insensitive search, we'll fetch more and filter client-side if needed
        query = query.or(
          `city.ilike.%${q}%,district.ilike.%${q}%,ward.ilike.%${q}%,address.ilike.%${q}%,title.ilike.%${q}%`
        );
      }
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.minArea) {
      query = query.gte('area', filters.minArea);
    }
    if (filters.maxArea) {
      query = query.lte('area', filters.maxArea);
    }

    const { data: rooms, error, count } = await query;

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching filtered rooms (paginated):', error);
      return { items: [], total: 0 };
    }

    // Helper function to remove Vietnamese tones for accent-insensitive search
    const removeVietnameseTones = (str: string): string => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
    };

    // If searchText exists and no results with ilike, try accent-insensitive search
    let filteredRooms: any[] = rooms || [];
    let allFilteredRoomsForCount: any[] = [];
    
    if (filters.searchText && filteredRooms.length === 0) {
      // Fetch more rooms (without searchText filter) and filter client-side
      // Use the same select structure as the main query to get all relations
      const baseQuery = supabase
        .from('rooms')
        .select(`
          *,
          profiles:owner_id (
            id,
            name,
            phone,
            role,
            created_at,
            DoB
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
            amenities (
              id,
              name
            )
          )
        `)
        .in('status', ['available', 'reserved', 'rented']);
      
      // Apply price, area, and district filters first
      let fetchQuery: any = baseQuery;
      if (filters.minPrice) {
        fetchQuery = fetchQuery.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        fetchQuery = fetchQuery.lte('price', filters.maxPrice);
      }
      if (filters.minArea) {
        fetchQuery = fetchQuery.gte('area', filters.minArea);
      }
      if (filters.maxArea) {
        fetchQuery = fetchQuery.lte('area', filters.maxArea);
      }
      if (filters.district) {
        // Filter by district or ward
        fetchQuery = fetchQuery.or(`district.ilike.%${filters.district}%,ward.ilike.%${filters.district}%`);
      }
      
      const { data: allRooms } = await fetchQuery.limit(1000);
      
      if (allRooms) {
        const searchNormalized = removeVietnameseTones(filters.searchText.toLowerCase());
        allFilteredRoomsForCount = allRooms.filter((room: any) => {
          const cityMatch = room.city && removeVietnameseTones(room.city.toLowerCase()).includes(searchNormalized);
          const districtMatch = room.district && removeVietnameseTones(room.district.toLowerCase()).includes(searchNormalized);
          const wardMatch = room.ward && removeVietnameseTones(room.ward.toLowerCase()).includes(searchNormalized);
          const addressMatch = room.address && removeVietnameseTones(room.address.toLowerCase()).includes(searchNormalized);
          const titleMatch = room.title && removeVietnameseTones(room.title.toLowerCase()).includes(searchNormalized);
          
          return cityMatch || districtMatch || wardMatch || addressMatch || titleMatch;
        });
        
        // Apply pagination
        const from = (Math.max(1, filters.page) - 1) * filters.pageSize;
        const to = from + filters.pageSize;
        filteredRooms = allFilteredRoomsForCount.slice(from, to);
      }
    }

    // Transform rooms to StayDataType
    const reservedSet = await fetchReservedRoomIdSet(filteredRooms.map((r: any) => String(r.id)));
    const items = filteredRooms.map((room: RoomWithRelations) =>
      transformRoomToStayData(room, { reserved: reservedSet.has(String(room.id)) })
    );
    
    // For client-side filtered results, use the count we already calculated
    let totalCount = typeof count === 'number' ? count : items.length;
    if (filters.searchText && rooms && rooms.length === 0 && allFilteredRoomsForCount.length > 0) {
      totalCount = allFilteredRoomsForCount.length;
    }
    
    return { items, total: totalCount };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in fetchRoomsWithFiltersPaginated:', error);
    return { items: [], total: 0 };
  }
}

// ==================== AUTHENTICATION FUNCTIONS ====================

// Login with email and password
export async function loginUser(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Đăng nhập thất bại' };
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      name: profile?.name || '',
      phone: profile?.phone || '',
      role: profile?.role || 'user',
      avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || '',
    };

    return { user, error: null };
  } catch (error) {
    console.error('Error in loginUser:', error);
    return { user: null, error: 'Có lỗi xảy ra khi đăng nhập' };
  }
}

// Sign up new user
export async function signupUser(credentials: SignupCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Đăng ký thất bại' };
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        name: credentials.name,
        phone: credentials.phone || '',
        role: 'user',
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return { user: null, error: 'Có lỗi khi tạo hồ sơ người dùng' };
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      name: credentials.name,
      phone: credentials.phone || '',
      role: 'user',
      avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || '',
    };

    return { user, error: null };
  } catch (error) {
    console.error('Error in signupUser:', error);
    return { user: null, error: 'Có lỗi xảy ra khi đăng ký' };
  }
}

// Logout user
export async function logoutUser(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in logoutUser:', error);
    return { error: 'Có lỗi xảy ra khi đăng xuất' };
  }
}

// Get current user
export async function getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return { user: null, error: error.message };
    }

    if (!user) {
      return { user: null, error: null };
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      name: profile?.name || '',
      phone: profile?.phone || '',
      role: profile?.role || 'user',
      avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
    };

    return { user: authUser, error: null };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { user: null, error: 'Có lỗi xảy ra khi lấy thông tin người dùng' };
  }
}

// Reset password
export async function resetPassword(email: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return { error: 'Có lỗi xảy ra khi gửi email đặt lại mật khẩu' };
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: {
  name?: string;
  phone?: string;
  role?: 'owner' | 'renter' | 'admin';
}): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { user: null, error: error.message };
    }

    const user: AuthUser = {
      id: data.id,
      email: '', // Will be filled from auth user
      name: data.name,
      phone: data.phone,
      role: data.role,
    };

    return { user, error: null };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { user: null, error: 'Có lỗi xảy ra khi cập nhật hồ sơ' };
  }
}

// Update user role (admin only)
export async function updateUserRole(
  userId: string, 
  newRole: 'owner' | 'renter' | 'admin'
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Check if current user is admin
    const { data: currentUserData } = await supabase.auth.getUser();
    if (!currentUserData.user) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    // Get current user profile to check role
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUserData.user.id)
      .single();

    if (!currentProfile || currentProfile.role !== 'admin') {
      return { success: false, error: 'Chỉ quản trị viên mới có thể thay đổi role người dùng' };
    }

    // Prevent admin from changing their own role
    if (userId === currentUserData.user.id) {
      return { success: false, error: 'Bạn không thể thay đổi role của chính mình' };
    }

    // Update user role
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return { success: false, error: 'Có lỗi xảy ra khi cập nhật role người dùng' };
  }
}

// Login with Google
export async function loginWithGoogle(): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      }
    });

    if (error) {
      return { user: null, error: error.message };
    }

    // OAuth redirects, so we return null for now
    // The actual user data will be available after redirect
    return { user: null, error: null };
  } catch (error) {
    console.error('Error in loginWithGoogle:', error);
    return { user: null, error: 'Có lỗi xảy ra khi đăng nhập với Google' };
  }
}

// Login with Facebook
export async function loginWithFacebook(): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      }
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: null, error: null };
  } catch (error) {
    console.error('Error in loginWithFacebook:', error);
    return { user: null, error: 'Có lỗi xảy ra khi đăng nhập với Facebook' };
  }
}

// Login with Twitter
export async function loginWithTwitter(): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      }
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: null, error: null };
  } catch (error) {
    console.error('Error in loginWithTwitter:', error);
    return { user: null, error: 'Có lỗi xảy ra khi đăng nhập với Twitter' };
  }
}

// ==================== FILE UPLOAD FUNCTIONS ====================

// Upload single image to Supabase Storage
export async function uploadImage(file: File, bucket: string = 'room-images'): Promise<{ url: string | null; error: string | null }> {
  try {
    // Dynamic import to avoid bundling browser-only lib on server build
    const { compressImage } = await import('@/utils/imageCompression');
    const optimized = await compressImage(file, {
      maxWidthOrHeight: 1024,
      convertToWebP: true,
      quality: 0.8,
    });

    const fileExt = optimized.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, optimized, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return { url: null, error: 'Có lỗi xảy ra khi upload ảnh' };
  }
}

// Upload multiple images to Supabase Storage
export async function uploadMultipleImages(files: File[], bucket: string = 'room-images'): Promise<{ urls: string[]; error: string | null }> {
  try {
    const uploadPromises = files.map(file => uploadImage(file, bucket));
    const results = await Promise.all(uploadPromises);

    const errors = results.filter(r => r.error).map(r => r.error);
    if (errors.length > 0) {
      return { urls: [], error: errors.join(', ') };
    }

    const urls = results.map(r => r.url).filter(Boolean) as string[];
    return { urls, error: null };
  } catch (error) {
    console.error('Error in uploadMultipleImages:', error);
    return { urls: [], error: 'Có lỗi xảy ra khi upload nhiều ảnh' };
  }
}

// ==================== WISHLIST FUNCTIONS ====================

// Add room to wishlist (favorites table)
export async function addToWishlist(roomId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập để lưu phòng' };
    }

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: userData.user.id,
        room_id: roomId
      });

    if (error) {
      // Check if already exists
      if (error.code === '23505') {
        return { success: false, error: 'Phòng đã có trong danh sách yêu thích' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in addToWishlist:', error);
    return { success: false, error: 'Có lỗi xảy ra khi lưu phòng' };
  }
}

// Remove room from wishlist (favorites table)
export async function removeFromWishlist(roomId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userData.user.id)
      .eq('room_id', roomId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in removeFromWishlist:', error);
    return { success: false, error: 'Có lỗi xảy ra khi xóa phòng' };
  }
}

// Check if room is in wishlist (favorites table)
export async function isInWishlist(roomId: string): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    const { data, error } = await supabase
      .from('favorites')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .eq('room_id', roomId)
      .single();

    if (error) return false;
    return !!data;
  } catch (error) {
    return false;
  }
}

// Get all wishlist rooms for current user (from favorites table)
export async function fetchWishlistRooms(): Promise<StayDataType[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    const { data: favoritesData, error } = await supabase
      .from('favorites')
      .select(`
        room_id,
        rooms (
          id,
          owner_id,
          title,
          description,
          price,
          area,
          address,
          city,
          district,
          ward,
          status,
          created_at,
          banner,
          maps,
          profiles!rooms_owner_id_fkey (
            id,
            name,
            phone
          ),
          room_images (
            id,
            room_id,
            image_url
          ),
          feedbacks (
            id,
            rating,
            comment
          ),
          room_amenities (
            amenities (
              id,
              name
            )
          )
        )
      `)
      .eq('user_id', userData.user.id);

    if (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }

    if (!favoritesData || favoritesData.length === 0) {
      return [];
    }

    // Transform to StayDataType
    const rawRooms: any[] = favoritesData
      .map((item: any) => {
        const room = item.rooms;
        if (!room) return null;
        return room;
      })
      .filter(Boolean) as any[];

    const reservedSet = await fetchReservedRoomIdSet(rawRooms.map((r) => String(r.id)));
    const rooms: StayDataType[] = rawRooms.map((room: RoomWithRelations) =>
      transformRoomToStayData(room, { reserved: reservedSet.has(String(room.id)) })
    );

    return rooms;
  } catch (error) {
    console.error('Error in fetchWishlistRooms:', error);
    return [];
  }
}

// ==================== NOTIFICATION FUNCTIONS ====================

// Fetch all notifications (admin only)
export async function fetchAllNotifications(): Promise<{ notifications: DatabaseNotification[]; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { notifications: [], error: 'Vui lòng đăng nhập' };
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { notifications: [], error: error.message };
    }

    return { notifications: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchAllNotifications:', error);
    return { notifications: [], error: 'Có lỗi xảy ra khi tải thông báo' };
  }
}

// Fetch active notifications for user based on their role
export async function fetchActiveNotifications(userRole: 'admin' | 'manager' | 'sales' | 'operator' | 'staff' | 'tenant' | 'user'): Promise<{ notifications: DatabaseNotification[]; error: string | null }> {
  try {
    const audienceMap: Record<string, string> = {
      admin: 'admins',
      manager: 'admins',
      sales: 'owners',
      operator: 'owners',
      staff: 'owners',
      tenant: 'renters',
      user: 'renters'
    };
    const mappedAudience = audienceMap[userRole] || 'all';

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_active', true)
      .or(`target_audience.eq.all,target_audience.eq.${mappedAudience}`)
      .order('created_at', { ascending: false });

    if (error) {
      return { notifications: [], error: error.message };
    }

    return { notifications: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchActiveNotifications:', error);
    return { notifications: [], error: 'Có lỗi xảy ra khi tải thông báo' };
  }
}

// Create notification (admin only)
export async function createNotification(notification: {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target_audience: 'all' | 'renters' | 'owners' | 'admins';
  is_active?: boolean;
}): Promise<{ notification: DatabaseNotification | null; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { notification: null, error: 'Vui lòng đăng nhập' };
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title: notification.title,
        content: notification.content,
        type: notification.type,
        target_audience: notification.target_audience,
        is_active: notification.is_active !== undefined ? notification.is_active : true,
        created_by: userData.user.id,
      })
      .select()
      .single();

    if (error) {
      return { notification: null, error: error.message };
    }

    return { notification: data, error: null };
  } catch (error) {
    console.error('Error in createNotification:', error);
    return { notification: null, error: 'Có lỗi xảy ra khi tạo thông báo' };
  }
}

// Update notification (admin only)
export async function updateNotification(id: string, updates: {
  title?: string;
  content?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  target_audience?: 'all' | 'renters' | 'owners' | 'admins';
  is_active?: boolean;
}): Promise<{ notification: DatabaseNotification | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { notification: null, error: error.message };
    }

    return { notification: data, error: null };
  } catch (error) {
    console.error('Error in updateNotification:', error);
    return { notification: null, error: 'Có lỗi xảy ra khi cập nhật thông báo' };
  }
}

// Delete notification (admin only)
export async function deleteNotification(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return { success: false, error: 'Có lỗi xảy ra khi xóa thông báo' };
  }
}

// ============================================
// FEEDBACK FUNCTIONS
// ============================================

/**
 * Fetch all feedbacks for a specific room with user information
 */
export async function fetchRoomFeedbacks(roomId: string): Promise<{ feedbacks: FeedbackWithUser[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('feedbacks')
      .select(`
        *,
        profiles!feedbacks_user_id_fkey (
          name,
          role
        )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedbacks:', error);
      return { feedbacks: [], error: error.message };
    }

    return { feedbacks: data as FeedbackWithUser[], error: null };
  } catch (error) {
    console.error('Error in fetchRoomFeedbacks:', error);
    return { feedbacks: [], error: 'Có lỗi xảy ra khi tải đánh giá' };
  }
}

/**
 * Get average rating for a room
 */
export async function getRoomAverageRating(roomId: string): Promise<{ average: number; count: number; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('rating')
      .eq('room_id', roomId);

    if (error) {
      console.error('Error fetching ratings:', error);
      return { average: 0, count: 0, error: error.message };
    }

    if (!data || data.length === 0) {
      return { average: 0, count: 0, error: null };
    }

    const sum = data.reduce((acc, feedback) => acc + feedback.rating, 0);
    const average = sum / data.length;

    return { average, count: data.length, error: null };
  } catch (error) {
    console.error('Error in getRoomAverageRating:', error);
    return { average: 0, count: 0, error: 'Có lỗi xảy ra khi tính điểm trung bình' };
  }
}

/**
 * Create a new feedback
 */
export async function createFeedback(feedback: {
  room_id: string;
  rating: number;
  comment: string;
}): Promise<{ success: boolean; feedback: DatabaseFeedback | null; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, feedback: null, error: 'Vui lòng đăng nhập để đánh giá' };
    }

    // Check if user already has a feedback for this room
    const { data: existingFeedback } = await supabase
      .from('feedbacks')
      .select('id')
      .eq('room_id', feedback.room_id)
      .eq('user_id', userData.user.id)
      .single();

    if (existingFeedback) {
      return { success: false, feedback: null, error: 'Bạn đã đánh giá phòng này rồi' };
    }

    const { data, error } = await supabase
      .from('feedbacks')
      .insert([
        {
          room_id: feedback.room_id,
          user_id: userData.user.id,
          rating: feedback.rating,
          comment: feedback.comment,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      return { success: false, feedback: null, error: error.message };
    }

    return { success: true, feedback: data, error: null };
  } catch (error) {
    console.error('Error in createFeedback:', error);
    return { success: false, feedback: null, error: 'Có lỗi xảy ra khi tạo đánh giá' };
  }
}

/**
 * Update user's feedback
 */
export async function updateFeedback(
  feedbackId: string,
  updates: {
    rating?: number;
    comment?: string;
  }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập để cập nhật đánh giá' };
    }

    const { error } = await supabase
      .from('feedbacks')
      .update(updates)
      .eq('id', feedbackId)
      .eq('user_id', userData.user.id);

    if (error) {
      console.error('Error updating feedback:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in updateFeedback:', error);
    return { success: false, error: 'Có lỗi xảy ra khi cập nhật đánh giá' };
  }
}

/**
 * Delete user's feedback
 */
export async function deleteFeedback(feedbackId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập để xóa đánh giá' };
    }

    const { error } = await supabase
      .from('feedbacks')
      .delete()
      .eq('id', feedbackId)
      .eq('user_id', userData.user.id);

    if (error) {
      console.error('Error deleting feedback:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteFeedback:', error);
    return { success: false, error: 'Có lỗi xảy ra khi xóa đánh giá' };
  }
}

/**
 * Check if current user has already submitted feedback for a room
 */
export async function hasUserFeedback(roomId: string): Promise<{ hasFeedback: boolean; feedback: DatabaseFeedback | null; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { hasFeedback: false, feedback: null, error: null };
    }

    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userData.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking user feedback:', error);
      return { hasFeedback: false, feedback: null, error: error.message };
    }

    return { hasFeedback: !!data, feedback: data, error: null };
  } catch (error) {
    console.error('Error in hasUserFeedback:', error);
    return { hasFeedback: false, feedback: null, error: 'Có lỗi xảy ra khi kiểm tra đánh giá' };
  }
}

// ============================================
// NEARBY PLACES FUNCTIONS
// ============================================

/**
 * Fetch all nearby places for a specific room
 */
export async function fetchNearbyPlaces(roomId: string): Promise<{ places: DatabaseNearbyPlace[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('nearby_places')
      .select('*')
      .eq('room_id', roomId)
      .order('distance_km', { ascending: true });

    if (error) {
      console.error('Error fetching nearby places:', error);
      return { places: [], error: error.message };
    }

    return { places: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchNearbyPlaces:', error);
    return { places: [], error: 'Có lỗi xảy ra khi tải thông tin khu vực xung quanh' };
  }
}

/**
 * Create a new nearby place
 */
export async function createNearbyPlace(place: {
  room_id: string;
  name: string;
  category: DatabaseNearbyPlace['category'];
  distance_km: number;
  description?: string;
}): Promise<{ success: boolean; place: DatabaseNearbyPlace | null; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, place: null, error: 'Vui lòng đăng nhập' };
    }

    const { data, error } = await supabase
      .from('nearby_places')
      .insert([place])
      .select()
      .single();

    if (error) {
      console.error('Error creating nearby place:', error);
      return { success: false, place: null, error: error.message };
    }

    return { success: true, place: data, error: null };
  } catch (error) {
    console.error('Error in createNearbyPlace:', error);
    return { success: false, place: null, error: 'Có lỗi xảy ra khi tạo thông tin khu vực' };
  }
}

/**
 * Update a nearby place
 */
export async function updateNearbyPlace(
  placeId: string,
  updates: {
    name?: string;
    category?: DatabaseNearbyPlace['category'];
    distance_km?: number;
    description?: string;
  }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    const { error } = await supabase
      .from('nearby_places')
      .update(updates)
      .eq('id', placeId);

    if (error) {
      console.error('Error updating nearby place:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in updateNearbyPlace:', error);
    return { success: false, error: 'Có lỗi xảy ra khi cập nhật thông tin khu vực' };
  }
}

/**
 * Delete a nearby place
 */
export async function deleteNearbyPlace(placeId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    const { error } = await supabase
      .from('nearby_places')
      .delete()
      .eq('id', placeId);

    if (error) {
      console.error('Error deleting nearby place:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteNearbyPlace:', error);
    return { success: false, error: 'Có lỗi xảy ra khi xóa thông tin khu vực' };
  }
}

/**
 * Fetch all rooms owned by the current user
 */
export async function fetchUserRooms(): Promise<{ rooms: DatabaseRoom[]; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { rooms: [], error: 'Vui lòng đăng nhập' };
    }

    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('owner_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user rooms:', error);
      return { rooms: [], error: error.message };
    }

    return { rooms: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchUserRooms:', error);
    return { rooms: [], error: 'Có lỗi xảy ra khi tải danh sách phòng' };
  }
}

// ============================================
// ROOM TRANSFER FUNCTIONS
// ============================================

/**
 * Fetch all approved room transfers (public view)
 */
export interface RoomTransferWithDetails {
  id: string;
  user_id: string;
  room_id?: string | null;
  title: string;
  description?: string | null;
  reason?: string | null;
  contact_phone?: string | null;
  contact_zalo?: string | null;
  transfer_date?: string | null;
  price_negotiable?: boolean | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  created_at: string;
  updated_at?: string | null;
  room_title?: string | null;
  room_price?: number | null;
  room_address?: string | null;
  room_area?: number | null;
  room_images?: string[] | null;
  rooms?: {
    id: string;
    title: string;
    price: number | null;
    address: string | null;
    banner: string | null;
  } | null;
  profiles?: {
    id: string;
    name?: string | null;
    phone?: string | null;
  } | null;
  approver?: {
    name?: string | null;
  } | null;
}

export async function fetchApprovedTransfers(): Promise<{ transfers: RoomTransferWithDetails[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('room_transfers')
      .select(`
        *,
        rooms (
          id,
          title,
          price,
          address,
          banner
        ),
        profiles!room_transfers_user_id_fkey (
          id,
          name,
          phone
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching approved transfers:', error);
      return { transfers: [], error: error.message };
    }

    return { transfers: (data as RoomTransferWithDetails[]) || [], error: null };
  } catch (error) {
    console.error('Error in fetchApprovedTransfers:', error);
    return { transfers: [], error: 'Có lỗi xảy ra khi tải danh sách pass phòng' };
  }
}

/**
 * Fetch all pending transfers (admin view)
 */
export async function fetchPendingTransfers(): Promise<{ transfers: RoomTransferWithDetails[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('room_transfers')
      .select(`
        *,
        rooms (
          id,
          title,
          price,
          address,
          banner
        ),
        profiles!room_transfers_user_id_fkey (
          id,
          name,
          phone
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending transfers:', error);
      return { transfers: [], error: error.message };
    }

    return { transfers: (data as RoomTransferWithDetails[]) || [], error: null };
  } catch (error) {
    console.error('Error in fetchPendingTransfers:', error);
    return { transfers: [], error: 'Có lỗi xảy ra khi tải danh sách chờ duyệt' };
  }
}

/**
 * Fetch user's own transfers
 */
export async function fetchMyTransfers(): Promise<{ transfers: RoomTransferWithDetails[]; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { transfers: [], error: 'Vui lòng đăng nhập' };
    }

    const { data, error } = await supabase
      .from('room_transfers')
      .select(`
        *,
        rooms (
          id,
          title,
          price,
          address,
          banner
        ),
        profiles!room_transfers_user_id_fkey (
          id,
          name,
          phone
        ),
        approver:profiles!room_transfers_approved_by_fkey (
          name
        )
      `)
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my transfers:', error);
      return { transfers: [], error: error.message };
    }

    return { transfers: (data as RoomTransferWithDetails[]) || [], error: null };
  } catch (error) {
    console.error('Error in fetchMyTransfers:', error);
    return { transfers: [], error: 'Có lỗi xảy ra khi tải danh sách bài đăng của bạn' };
  }
}

/**
 * Create a new room transfer post
 */
export async function createRoomTransfer(transfer: {
  room_id?: string | null;
  title: string;
  description?: string;
  reason?: string;
  contact_phone?: string;
  contact_zalo?: string;
  transfer_date?: string;
  price_negotiable?: boolean;
  // Manual room info (when room_id is not provided)
  room_title?: string;
  room_price?: number;
  room_address?: string;
  room_area?: number;
  room_images?: string[];
}): Promise<{ success: boolean; transferId?: string; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    // Validate: must have either room_id OR manual room info
    if (!transfer.room_id && (!transfer.room_title || !transfer.room_price || !transfer.room_address)) {
      return { success: false, error: 'Vui lòng chọn phòng có sẵn hoặc nhập đầy đủ thông tin phòng' };
    }

    const { data, error } = await supabase
      .from('room_transfers')
      .insert([{
        ...transfer,
        user_id: userData.user.id,
        status: 'pending',
        price_negotiable: transfer.price_negotiable ?? true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating transfer:', error);
      return { success: false, error: error.message };
    }

    return { success: true, transferId: data.id, error: null };
  } catch (error) {
    console.error('Error in createRoomTransfer:', error);
    return { success: false, error: 'Có lỗi xảy ra khi đăng bài pass phòng' };
  }
}

/**
 * Update a transfer post (only for pending transfers by owner)
 */
export async function updateRoomTransfer(
  transferId: string,
  updates: Partial< any>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    const { error } = await supabase
      .from('room_transfers')
      .update(updates)
      .eq('id', transferId)
      .eq('user_id', userData.user.id)
      .eq('status', 'pending');

    if (error) {
      console.error('Error updating transfer:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in updateRoomTransfer:', error);
    return { success: false, error: 'Có lỗi xảy ra khi cập nhật bài đăng' };
  }
}

/**
 * Delete a transfer post (only for pending transfers by owner)
 */
export async function deleteRoomTransfer(transferId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    const { error } = await supabase
      .from('room_transfers')
      .delete()
      .eq('id', transferId)
      .eq('user_id', userData.user.id)
      .eq('status', 'pending');

    if (error) {
      console.error('Error deleting transfer:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteRoomTransfer:', error);
    return { success: false, error: 'Có lỗi xảy ra khi xóa bài đăng' };
  }
}

/**
 * Approve a transfer post (admin only)
 */
export async function approveRoomTransfer(transferId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    const { error } = await supabase
      .from('room_transfers')
      .update({
        status: 'approved',
        approved_by: userData.user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: null
      })
      .eq('id', transferId);

    if (error) {
      console.error('Error approving transfer:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in approveRoomTransfer:', error);
    return { success: false, error: 'Có lỗi xảy ra khi duyệt bài đăng' };
  }
}

/**
 * Reject a transfer post (admin only)
 */
export async function rejectRoomTransfer(
  transferId: string,
  rejectionReason: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    const { error } = await supabase
      .from('room_transfers')
      .update({
        status: 'rejected',
        approved_by: userData.user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      })
      .eq('id', transferId);

    if (error) {
      console.error('Error rejecting transfer:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in rejectRoomTransfer:', error);
    return { success: false, error: 'Có lỗi xảy ra khi từ chối bài đăng' };
  }
}

// ============================================
// BOOKING FUNCTIONS
// ============================================

/**
 * Create a new booking
 */
export async function createBooking(booking: {
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  total_price: number;
  message?: string;
}): Promise<{ success: boolean; bookingId?: string; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập để đặt phòng' };
    }

    // Check if room is available
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('status, owner_id')
      .eq('id', booking.room_id)
      .single();

    if (roomError || !room) {
      return { success: false, error: 'Không tìm thấy phòng' };
    }

    if (room.status !== 'available') {
      return { success: false, error: 'Phòng không còn trống' };
    }

    // Check for overlapping bookings
    const { data: overlapping, error: overlapError } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', booking.room_id)
      .in('status', ['pending', 'approved'])
      .or(`check_in_date.lte.${booking.check_out_date},check_out_date.gte.${booking.check_in_date}`);

    if (overlapError) {
      console.error('Error checking overlapping bookings:', overlapError);
    }

    if (overlapping && overlapping.length > 0) {
      return { success: false, error: 'Phòng đã có người đặt trong khoảng thời gian này' };
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        ...booking,
        user_id: userData.user.id,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return { success: false, error: error.message };
    }

    // Create notification for room owner and admin
    await createNotification({
      title: 'Lịch xem phòng mới',
      content: `Có một lịch hẹn xem phòng mới cần được xác nhận`,
      type: 'info',
      target_audience: 'admins'
    });

    return { success: true, bookingId: data.id, error: null };
  } catch (error) {
    console.error('Error in createBooking:', error);
    return { success: false, error: 'Có lỗi xảy ra khi đặt phòng' };
  }
}

/**
 * Fetch all bookings (admin only)
 */
export async function fetchAllBookings(): Promise<{ bookings: BookingWithDetails[]; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { bookings: [], error: 'Vui lòng đăng nhập' };
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (
          id,
          title,
          price,
          address,
          banner
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all bookings:', error);
      return { bookings: [], error: error.message };
    }

    // Fetch profiles separately
    const bookingsWithProfiles = await Promise.all(
      (data || []).map(async (booking: any) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, phone')
          .eq('id', booking.user_id)
          .single();
        
        const { data: approver } = booking.approved_by ? await supabase
          .from('profiles')
          .select('name')
          .eq('id', booking.approved_by)
          .single() : { data: null };
        
        return {
          ...booking,
          profiles: profile || { id: booking.user_id, name: 'Unknown', phone: '' },
          approver: approver || undefined
        };
      })
    );

    return { bookings: bookingsWithProfiles as BookingWithDetails[], error: null };
  } catch (error) {
    console.error('Error in fetchAllBookings:', error);
    return { bookings: [], error: 'Có lỗi xảy ra khi tải danh sách đặt phòng' };
  }
}

/**
 * Fetch pending bookings (admin only)
 */
export async function fetchPendingBookings(): Promise<{ bookings: BookingWithDetails[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (
          id,
          title,
          price,
          address,
          banner
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending bookings:', error);
      return { bookings: [], error: error.message };
    }

    // Fetch user profiles separately
    const bookingsWithProfiles = await Promise.all(
      (data || []).map(async (booking: any) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, phone')
          .eq('id', booking.user_id)
          .single();
        
        return {
          ...booking,
          profiles: profile || { id: booking.user_id, name: 'Unknown', phone: '' }
        };
      })
    );

    return { bookings: bookingsWithProfiles as BookingWithDetails[], error: null };
  } catch (error) {
    console.error('Error in fetchPendingBookings:', error);
    return { bookings: [], error: 'Có lỗi xảy ra khi tải danh sách chờ duyệt' };
  }
}

/**
 * Fetch user's own bookings
 */
export async function fetchMyBookings(): Promise<{ bookings: BookingWithDetails[]; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { bookings: [], error: 'Vui lòng đăng nhập' };
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (
          id,
          title,
          price,
          address,
          banner
        )
      `)
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my bookings:', error);
      return { bookings: [], error: error.message };
    }

    // Fetch profiles separately
    const bookingsWithProfiles = await Promise.all(
      (data || []).map(async (booking: any) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, phone')
          .eq('id', booking.user_id)
          .single();
        
        const { data: approver } = booking.approved_by ? await supabase
          .from('profiles')
          .select('name')
          .eq('id', booking.approved_by)
          .single() : { data: null };
        
        return {
          ...booking,
          profiles: profile || { id: booking.user_id, name: 'Unknown', phone: '' },
          approver: approver || undefined
        };
      })
    );

    return { bookings: bookingsWithProfiles as BookingWithDetails[], error: null };
  } catch (error) {
    console.error('Error in fetchMyBookings:', error);
    return { bookings: [], error: 'Có lỗi xảy ra khi tải lịch sử đặt phòng' };
  }
}

/**
 * Approve a booking (admin only)
 */
export async function approveBooking(bookingId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    // Get booking details for notification
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('user_id, room_id, rooms(title)')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return { success: false, error: 'Không tìm thấy đơn đặt phòng' };
    }

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'approved',
        approved_by: userData.user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: null
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error approving booking:', error);
      return { success: false, error: error.message };
    }

    // Create notification for user
    await createNotification({
      title: 'Lịch xem phòng được xác nhận',
      content: `Lịch hẹn xem phòng của bạn đã được xác nhận. Chủ nhà sẽ liên hệ với bạn sớm.`,
      type: 'success',
      target_audience: 'renters'
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in approveBooking:', error);
    return { success: false, error: 'Có lỗi xảy ra khi duyệt đơn đặt phòng' };
  }
}

/**
 * Reject a booking (admin only)
 */
export async function rejectBooking(
  bookingId: string,
  rejectionReason: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'rejected',
        approved_by: userData.user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error rejecting booking:', error);
      return { success: false, error: error.message };
    }

    // Create notification for user
    await createNotification({
      title: 'Lịch xem phòng bị từ chối',
      content: `Lịch hẹn xem phòng của bạn đã bị từ chối. Lý do: ${rejectionReason}`,
      type: 'warning',
      target_audience: 'renters'
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in rejectBooking:', error);
    return { success: false, error: 'Có lỗi xảy ra khi từ chối đơn đặt phòng' };
  }
}

/**
 * Cancel a booking (user only, for their own pending bookings)
 */
export async function cancelBooking(bookingId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('user_id', userData.user.id)
      .eq('status', 'pending');

    if (error) {
      console.error('Error cancelling booking:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    return { success: false, error: 'Có lỗi xảy ra khi hủy đơn đặt phòng' };
  }
}

// ============================================
// UNIVERSITY FUNCTIONS
// ============================================

/**
 * Fetch all universities
 */
export async function fetchUniversities(): Promise<{ universities: DatabaseUniversity[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('short_name', { ascending: true });

    if (error) {
      console.error('Error fetching universities:', error);
      return { universities: [], error: error.message };
    }

    return { universities: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchUniversities:', error);
    return { universities: [], error: 'Có lỗi xảy ra khi tải danh sách trường đại học' };
  }
}

/**
 * Fetch universities with room counts
 */
export async function fetchUniversitiesWithRoomCounts(): Promise<{ universities: UniversityWithRoomCount[]; error: string | null }> {
  try {
    // Get all universities first
    const { data: universities, error: universitiesError } = await supabase
      .from('universities')
      .select('*')
      .order('short_name', { ascending: true });

    if (universitiesError) {
      console.error('Error fetching universities:', universitiesError);
      return { universities: [], error: universitiesError.message };
    }

    if (!universities || universities.length === 0) {
      return { universities: [], error: null };
    }

    // Get room counts for each university
    const universityIds = universities.map(u => u.id);
    const { data: roomUniversities, error: roomUniversitiesError } = await supabase
      .from('room_universities')
      .select(`
        university_id,
        rooms (
          id,
          status
        )
      `)
      .in('university_id', universityIds);

    if (roomUniversitiesError) {
      console.error('Error fetching room_universities:', roomUniversitiesError);
    }

    // Calculate room counts
    const universitiesWithCounts = universities.map((uni: any) => {
      const universityRooms = roomUniversities?.filter(ru => ru.university_id === uni.id) || [];
      const availableRooms = universityRooms.filter((ru: any) => 
        ru.rooms && ru.rooms.status === 'available'
      );
      
      return {
        ...uni,
        room_count: availableRooms.length,
      };
    });

    return { universities: universitiesWithCounts, error: null };
  } catch (error) {
    console.error('Error in fetchUniversitiesWithRoomCounts:', error);
    return { universities: [], error: 'Có lỗi xảy ra khi tải danh sách trường đại học' };
  }
}

/**
 * Fetch rooms near a specific university
 */
export async function fetchRoomsByUniversity(universityId: string): Promise<{ rooms: StayDataType[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('room_universities')
      .select(`
        room_id,
        distance_km,
        rooms!inner (
          *,
          profiles:owner_id (
            id,
            name,
            phone,
            role,
            created_at,
            DoB
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
            amenities (
              id,
              name
            )
          )
        )
      `)
      .eq('university_id', universityId)
      .in('rooms.status', ['available', 'reserved', 'rented'])
      .order('distance_km', { ascending: true });

    if (error) {
      console.error('Error fetching rooms by university:', error);
      return { rooms: [], error: error.message };
    }

    // Transform to StayDataType
    const rawRooms = (data || [])
      .map((item: any) => item.rooms)
      .filter(Boolean) as any[];

    const reservedSet = await fetchReservedRoomIdSet(rawRooms.map((r) => String(r.id)));
    const rooms = rawRooms.map((room: RoomWithRelations) =>
      transformRoomToStayData(room, { reserved: reservedSet.has(String(room.id)) })
    ) as StayDataType[];

    return { rooms, error: null };
  } catch (error) {
    console.error('Error in fetchRoomsByUniversity:', error);
    return { rooms: [], error: 'Có lỗi xảy ra khi tải danh sách phòng trọ' };
  }
}

/**
 * Add university associations to a room
 */
export async function addRoomUniversities(
  roomId: string, 
  universityIds: string[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    // First, remove existing associations
    const { error: deleteError } = await supabase
      .from('room_universities')
      .delete()
      .eq('room_id', roomId);

    if (deleteError) {
      console.error('Error removing existing university associations:', deleteError);
    }

    // Add new associations
    if (universityIds.length > 0) {
      const associations = universityIds.map(universityId => ({
        room_id: roomId,
        university_id: universityId,
      }));

      const { error: insertError } = await supabase
        .from('room_universities')
        .insert(associations);

      if (insertError) {
        console.error('Error adding university associations:', insertError);
        return { success: false, error: insertError.message };
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in addRoomUniversities:', error);
    return { success: false, error: 'Có lỗi xảy ra khi cập nhật liên kết trường đại học' };
  }
}

/**
 * Get universities associated with a room
 */
export async function getRoomUniversities(roomId: string): Promise<{ universities: DatabaseUniversity[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('room_universities')
      .select(`
        universities (*)
      `)
      .eq('room_id', roomId);

    if (error) {
      console.error('Error fetching room universities:', error);
      return { universities: [], error: error.message };
    }

    const universities = (data || [])
      .map((item: any) => item.universities)
      .filter(Boolean) as DatabaseUniversity[];

    return { universities, error: null };
  } catch (error) {
    console.error('Error in getRoomUniversities:', error);
    return { universities: [], error: 'Có lỗi xảy ra khi tải danh sách trường đại học' };
  }
}

/** Video TikTok/review gắn phòng — dùng trang /video-review (sau khi chạy migration room_video_reviews). */
export async function fetchRoomVideoReviewsForPublicPage(): Promise<{
  items: RoomVideoReviewListing[];
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from("room_video_reviews")
      .select(
        `
        id,
        source_url,
        display_title,
        sort_order,
        rooms!inner (
          id,
          title,
          city,
          district,
          ward,
          address,
          price,
          banner,
          status,
          feedbacks ( rating )
        )
      `
      )
      .in("rooms.status", ["available", "reserved", "rented"])
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching room video reviews:", error);
      return { items: [], error: error.message };
    }

    const items: RoomVideoReviewListing[] = (data || []).map((row: any) => {
      const r = row.rooms;
      const rawFeedbacks = r?.feedbacks;
      const feedbacks: { rating: number }[] = Array.isArray(rawFeedbacks)
        ? rawFeedbacks
        : rawFeedbacks
          ? [rawFeedbacks]
          : [];
      const reviewCount = feedbacks.length;
      const reviewStart =
        reviewCount > 0
          ? Number(
              (
                feedbacks.reduce((s, f) => s + (Number(f.rating) || 0), 0) /
                reviewCount
              ).toFixed(1)
            )
          : 0;
      const priceNum =
        r?.price !== null && r?.price !== undefined ? Number(r.price) : null;
      const priceLabel =
        priceNum !== null && !Number.isNaN(priceNum)
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              maximumFractionDigits: 0,
            }).format(priceNum)
          : "—";
      const addressDisplay = [
        (r?.address || "").trim(),
        (r?.ward || "").trim(),
        (r?.district || "").trim(),
        (r?.city || "").trim(),
      ]
        .filter(Boolean)
        .join(", ");

      return {
        id: row.id,
        source_url: row.source_url,
        display_title: row.display_title ?? null,
        sort_order: row.sort_order ?? 0,
        room: {
          id: r.id,
          title: r.title,
          city: r.city,
          district: r.district,
          ward: r.ward,
          address: r.address,
          addressDisplay: addressDisplay || (r.address || "").trim() || "",
          price: priceNum,
          priceLabel,
          banner: r.banner,
          status: r.status,
          reviewStart,
          reviewCount,
        },
      };
    });

    return { items, error: null };
  } catch (e) {
    console.error("Error in fetchRoomVideoReviewsForPublicPage:", e);
    return { items: [], error: "Không tải được danh sách video review." };
  }
}

export async function fetchRoomVideoReviewsByRoomId(
  roomId: string
): Promise<{ rows: DatabaseRoomVideoReview[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("room_video_reviews")
      .select("id, room_id, source_url, display_title, sort_order, created_at")
      .eq("room_id", roomId)
      .order("sort_order", { ascending: true });

    if (error) {
      return { rows: [], error: error.message };
    }
    return { rows: (data || []) as DatabaseRoomVideoReview[], error: null };
  } catch (e) {
    console.error("fetchRoomVideoReviewsByRoomId:", e);
    return { rows: [], error: "Lỗi tải video review." };
  }
}

