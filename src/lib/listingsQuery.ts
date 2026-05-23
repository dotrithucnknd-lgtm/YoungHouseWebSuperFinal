import { supabase } from "@/lib/supabaseClient";
import { buildRoomDetailPath } from "@/utils/roomDetailUrl";

export type ListingPublic = {
  id: number | string;
  owner_id: string | null;
  title: string;
  price: unknown;
  address: string | null;
  district: string | null;
  ward: string | null;
  status: string | null;
  created_at: string | null;
  is_hot: boolean;
  featured_image: string | null;
  gallery_imgs: string[];
  lat: number | null;
  lng: number | null;
  review_star: number;
  review_count: number;
  href: string;
  owner_name: string | null;
};

const baseColumns =
  "id, owner_id, title, price, address, district, ward, status, maps, created_at, is_hot, banner";

/**
 * Shared server-side listings fetch (used by /api/listings and Server Components).
 * Avoids self-HTTP on the homepage so Vercel runs one server path instead of two.
 */
export async function getListings(params: {
  hot?: string;
  limit?: number;
}): Promise<{ listings: ListingPublic[]; error?: string }> {
  const hotParam = (params.hot || "").toLowerCase();
  const limitParam = Number(params.limit) || 50;
  const limit = Math.min(Math.max(limitParam, 1), 100);

  let rooms: any[] = [];
  let roomsError: any = null;

  if (hotParam === "true") {
    const res = await supabase
      .from("rooms")
      .select(baseColumns)
      .in("status", ["available", "reserved", "rented"])
      .eq("is_hot", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    rooms = res.data || [];
    roomsError = res.error;
  } else if (hotParam === "fill") {
    const hotRes = await supabase
      .from("rooms")
      .select(baseColumns)
      .in("status", ["available", "reserved", "rented"])
      .eq("is_hot", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (hotRes.error) {
      roomsError = hotRes.error;
    } else {
      const hotRooms = hotRes.data || [];
      const remaining = limit - hotRooms.length;
      if (remaining > 0) {
        const hotIds = hotRooms.map((r) => r.id);
        let fillQuery = supabase
          .from("rooms")
          .select(baseColumns)
          .in("status", ["available", "reserved", "rented"])
          .order("created_at", { ascending: false })
          .limit(remaining);
        if (hotIds.length > 0) {
          fillQuery = fillQuery.not("id", "in", `(${hotIds.join(",")})`);
        }
        const fillRes = await fillQuery;
        if (fillRes.error) {
          roomsError = fillRes.error;
        } else {
          rooms = [...hotRooms, ...(fillRes.data || [])];
        }
      } else {
        rooms = hotRooms;
      }
    }
  } else {
    const res = await supabase
      .from("rooms")
      .select(baseColumns)
      .in("status", ["available", "reserved", "rented"])
      .order("created_at", { ascending: false })
      .limit(limit);
    rooms = res.data || [];
    roomsError = res.error;
  }

  if (roomsError) {
    return { listings: [], error: roomsError.message };
  }

  const roomIds = (rooms ?? []).map((r) => r.id);

  if (roomIds.length === 0) {
    return { listings: [] };
  }

  const { data: images, error: imagesError } = await supabase
    .from("room_images")
    .select("room_id, image_url")
    .in("room_id", roomIds);

  if (imagesError) {
    return { listings: [], error: imagesError.message };
  }

  const { data: feedbacks, error: feedbacksError } = await supabase
    .from("feedbacks")
    .select("room_id, rating")
    .in("room_id", roomIds);

  if (feedbacksError) {
    return { listings: [], error: feedbacksError.message };
  }

  const ownerIds = Array.from(new Set((rooms ?? []).map((r) => r.owner_id).filter(Boolean)));
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", ownerIds);

  if (profilesError) {
    return { listings: [], error: profilesError.message };
  }

  const imagesByRoom = new Map<string, string[]>();
  (images || []).forEach((img) => {
    const roomId = String(img.room_id);
    const list = imagesByRoom.get(roomId) || [];
    if (img.image_url) list.push(img.image_url);
    imagesByRoom.set(roomId, list);
  });

  const feedbacksByRoom = new Map<number, { sum: number; count: number }>();
  (feedbacks || []).forEach((feedback) => {
    const entry = feedbacksByRoom.get(feedback.room_id) || { sum: 0, count: 0 };
    const ratingNum =
      typeof feedback.rating === "number" ? feedback.rating : Number(feedback.rating) || 0;
    entry.sum += ratingNum;
    entry.count += 1;
    feedbacksByRoom.set(feedback.room_id, entry);
  });

  const profilesById = new Map<string, { id: string; name: string | null }>();
  (profiles || []).forEach((p) => profilesById.set(String(p.id), p));

  const listings: ListingPublic[] = (rooms || []).map((r) => {
    const roomId = String(r.id);
    const galleryFromImages = imagesByRoom.get(roomId) || [];
    const gallery = galleryFromImages.length
      ? galleryFromImages
      : r.banner
        ? [r.banner]
        : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"];
    const revAgg = feedbacksByRoom.get(r.id) || { sum: 0, count: 0 };
    const review_star = revAgg.count > 0 ? Math.round((revAgg.sum / revAgg.count) * 10) / 10 : 0;
    const review_count = revAgg.count;
    const owner = profilesById.get(String(r.owner_id));

    return {
      id: r.id,
      owner_id: r.owner_id != null ? String(r.owner_id) : null,
      title: r.title,
      price: r.price,
      address: r.address,
      district: r.district,
      ward: r.ward,
      status: r.status,
      created_at: r.created_at,
      is_hot: Boolean(r.is_hot),
      featured_image: gallery[0] || null,
      gallery_imgs: gallery,
      lat: typeof r.maps === "object" && r.maps?.lat ? r.maps.lat : null,
      lng: typeof r.maps === "object" && r.maps?.lng ? r.maps.lng : null,
      review_star,
      review_count,
      href: buildRoomDetailPath(String(r.title ?? "phong-tro"), String(r.id)),
      owner_name: owner?.name ?? null,
    };
  });

  return { listings };
}
