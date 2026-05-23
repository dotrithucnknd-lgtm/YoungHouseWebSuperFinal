"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  MapPinIcon,
  PhoneIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface PropertyDetail {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string | null;
  district: string | null;
  ward: string | null;
  price: number;
  area: number;
  status: string;
  banner: string | null;
  maps: string | null;
  created_at: string;
  owner_id: string;
}

interface RoomImage {
  id: string;
  image_url: string;
}

interface Amenity {
  id: string;
  name: string;
}

interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  distance_km: number;
  description: string | null;
}

interface University {
  id: string;
  university_id: string;
  distance_km: number | null;
  universities: {
    name: string;
    short_name: string;
  };
}

interface VideoReview {
  id: string;
  source_url: string;
  display_title: string | null;
  sort_order: number;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [images, setImages] = useState<RoomImage[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [videoReviews, setVideoReviews] = useState<VideoReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const propertyId = params.id as string;

  useEffect(() => {
    if (propertyId && user?.id) {
      loadPropertyDetail();
    }
  }, [propertyId, user]);

  const loadPropertyDetail = async () => {
    setLoading(true);
    try {
      // Fetch property
      const { data: room, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", propertyId)
        .single();

      if (error) throw error;
      if (!room || (room.owner_id !== user?.id && user?.role !== 'admin' && user?.role !== 'manager')) {
        alert("Không tìm thấy nhà trọ hoặc bạn không có quyền xem.");
        router.push("/operator/properties");
        return;
      }
      setProperty(room);

      // Fetch images
      const { data: imgs } = await supabase
        .from("room_images")
        .select("id, image_url")
        .eq("room_id", propertyId);
      setImages(imgs || []);

      // Fetch amenities
      const { data: roomAmenities } = await supabase
        .from("room_amenities")
        .select("amenity_id, amenities(id, name)")
        .eq("room_id", propertyId);
      if (roomAmenities) {
        setAmenities(roomAmenities.map((ra: any) => ra.amenities).filter(Boolean));
      }

      // Fetch nearby places
      const { data: places } = await supabase
        .from("nearby_places")
        .select("*")
        .eq("room_id", propertyId);
      setNearbyPlaces(places || []);

      // Fetch universities
      const { data: unis } = await supabase
        .from("room_universities")
        .select("id, university_id, distance_km, universities(name, short_name)")
        .eq("room_id", propertyId);
      setUniversities((unis as any) || []);

      // Fetch video reviews
      const { data: videos } = await supabase
        .from("room_video_reviews")
        .select("*")
        .eq("room_id", propertyId)
        .order("sort_order");
      setVideoReviews(videos || []);
    } catch (error) {
      console.error("Error loading property:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available": return { text: "Còn trống", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
      case "reserved": return { text: "Đặt trước", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
      case "rented": return { text: "Đã thuê", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
      case "hidden": return { text: "Ẩn", color: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300" };
      default: return { text: status, color: "bg-neutral-100 text-neutral-700" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Không tìm thấy nhà trọ</p>
        <Link href="/operator/properties" className="text-green-600 hover:underline mt-2 inline-block">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const status = getStatusLabel(property.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/operator/properties"
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{property.title}</h1>
            <p className="text-sm text-neutral-500 mt-1">Chi tiết nhà trọ</p>
          </div>
        </div>
        <Link
          href={`/operator/properties/${propertyId}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <PencilSquareIcon className="w-5 h-5" />
          Chỉnh sửa
        </Link>
      </div>

      {/* Banner */}
      {property.banner && (
        <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
          <img
            src={property.banner}
            alt={property.title}
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">Giá thuê</p>
                <p className="text-xl font-bold text-green-600">
                  {Number(property.price).toLocaleString("vi-VN")} VNĐ/tháng
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Diện tích</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{property.area} m²</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Trạng thái</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${status.color}`}>
                  {status.text}
                </span>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Ngày tạo</p>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {new Date(property.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-green-600" />
              Địa chỉ
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300">
              {property.address}
              {property.ward && `, ${property.ward}`}
              {property.district && `, ${property.district}`}
              {property.city && `, ${property.city}`}
            </p>
            {property.maps && (
              <div className="mt-4 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                <iframe
                  src={property.maps}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Mô tả</h3>
              <div
                className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300"
                dangerouslySetInnerHTML={{ __html: property.description }}
              />
            </div>
          )}

          {/* Images */}
          {images.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Ảnh phòng ({images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-neutral-200 dark:border-neutral-700"
                    onClick={() => setSelectedImage(img.image_url)}
                  >
                    <img
                      src={img.image_url}
                      alt="Ảnh phòng"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Reviews */}
          {videoReviews.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Video Review</h3>
              <div className="space-y-4">
                {videoReviews.map((video) => (
                  <div key={video.id} className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                    {video.display_title && (
                      <p className="px-4 py-2 bg-neutral-50 dark:bg-neutral-700 text-sm font-medium">
                        {video.display_title}
                      </p>
                    )}
                    <div className="aspect-video">
                      <iframe
                        src={video.source_url}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Tiện nghi</h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <span
                    key={amenity.id}
                    className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium border border-green-200 dark:border-green-800"
                  >
                    {amenity.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Universities */}
          {universities.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Trường đại học gần đây</h3>
              <div className="space-y-3">
                {universities.map((uni) => (
                  <div key={uni.id} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {(uni as any).universities?.name || "N/A"}
                    </span>
                    {uni.distance_km && (
                      <span className="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded">
                        {uni.distance_km} km
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Places */}
          {nearbyPlaces.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Khu vực xung quanh</h3>
              <div className="space-y-3">
                {nearbyPlaces.map((place) => (
                  <div key={place.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{place.name}</p>
                      {place.description && (
                        <p className="text-xs text-neutral-500">{place.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded whitespace-nowrap">
                      {place.distance_km} km
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Ảnh phóng to"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
