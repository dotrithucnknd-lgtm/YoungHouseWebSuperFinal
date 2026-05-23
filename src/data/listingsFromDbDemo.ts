import db from "./jsons/dbdemo.json";
import { StayDataType } from "./types";
import { Route } from "@/routers/types";

// Map rooms in dbdemo.json to the project's StayDataType used by cards/pages
export function loadDbDemoListings(limit?: number): StayDataType[] {
  const roomImagesByRoom: Record<string, string[]> = {};
  (db.room_images || []).forEach((img) => {
    if (!roomImagesByRoom[img.room_id]) roomImagesByRoom[img.room_id] = [];
    roomImagesByRoom[img.room_id].push(img.image_url);
  });

  const listings: StayDataType[] = (db.rooms || []).map((room, idx) => {
    const galleryImgs = roomImagesByRoom[room.id] || [];
    const priceVnd = room.price;
    const priceLabel = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(priceVnd);

    const bedrooms = Math.max(1, Math.round((room.area || 12) / 12));

    const listing: StayDataType = {
      id: `db_${room.id}`,
      title: room.title,
      address: room.address,
      galleryImgs,
      bedrooms,
      price: priceLabel,
      href: "/phong-tro-detail" as Route,
      like: false,
      saleOff: undefined,
      isAds: false,
      reviewStart: 4.5,
      reviewCount: 12,
      listingCategory: { id: "room", href: "/phong-tro" as Route, name: "Nhà trọ" },
      maxGuests: 2,
      bathrooms: 1,
      kitchen: 0,
      wifi: 1,
      bedRoom: bedrooms,
      beds: bedrooms,
      authorId: "db_owner",
      date: new Date().toISOString(),
    } as unknown as StayDataType;

    return listing;
  });

  return typeof limit === "number" ? listings.slice(0, limit) : listings;
}



