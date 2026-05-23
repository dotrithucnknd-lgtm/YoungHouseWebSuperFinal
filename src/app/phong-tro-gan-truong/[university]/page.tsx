"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  fetchUniversities, 
  fetchRoomsByUniversity, 
  DatabaseUniversity 
} from "@/lib/supabaseServices";
import { StayDataType } from "@/data/types";
import StayCard from "@/components/StayCard";
import SectionGridFilterCard from "@/app/(stay-listings)/SectionGridFilterCard";
import { slugify } from "@/utils/slugify";

const UniversityRoomsPage = () => {
  const params = useParams();
  const universitySlug = params.university as string;
  
  const [university, setUniversity] = useState<DatabaseUniversity | null>(null);
  const [rooms, setRooms] = useState<StayDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (universitySlug) {
      loadUniversityAndRooms();
    }
  }, [universitySlug]);

  const loadUniversityAndRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all universities to find the matching one
      const { universities, error: universitiesError } = await fetchUniversities();
      
      if (universitiesError) {
        setError(universitiesError);
        return;
      }

      // Decode slug (URL may be encoded) and find matching university
      const decodedSlug = decodeURIComponent(universitySlug).toLowerCase();
      const foundUniversity = universities.find(uni => 
        slugify(uni.short_name) === decodedSlug
      );

      if (!foundUniversity) {
        setError('Không tìm thấy trường đại học');
        return;
      }

      setUniversity(foundUniversity);

      // Load rooms for this university
      const { rooms: roomsData, error: roomsError } = await fetchRoomsByUniversity(foundUniversity.id);
      
      if (roomsError) {
        setError(roomsError);
        return;
      }

      setRooms(roomsData);

    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-neutral-200 dark:bg-neutral-700 rounded-2xl h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !university) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          {error || 'Không tìm thấy trường đại học'}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6">
          Vui lòng thử lại sau hoặc quay lại trang chủ.
        </p>
        <a 
          href="/"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Về trang chủ
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          <a href="/" className="hover:text-primary-600">Trang chủ</a>
          <span className="mx-2">›</span>
          <a href="/#universities" className="hover:text-primary-600">Trường đại học</a>
          <span className="mx-2">›</span>
          <span>{university.short_name}</span>
        </nav>

        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Phòng trọ gần {university.short_name}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
          {university.name}
        </p>
        
        {university.address && (
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            <span>📍</span>
            <span>{university.address}</span>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          <span className="bg-primary-100 dark:bg-primary-900/30 text-black px-3 py-1 rounded-full">
            {rooms.length} phòng trọ có sẵn
          </span>
          {university.website_url && (
            <a 
              href={university.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Website trường →
            </a>
          )}
        </div>
      </div>

      {/* Rooms Grid */}
      {rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <StayCard key={room.id} data={room} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
            <span className="text-3xl">🏠</span>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Chưa có phòng trọ nào
          </h3>
          <p className="text-neutral-600 dark:text-neutral-300 mb-6">
            Hiện tại chưa có phòng trọ nào gần {university.short_name}. 
            <br />Hãy quay lại sau để xem các phòng mới nhất.
          </p>
          <a 
            href="/phong-tro"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Xem tất cả phòng trọ
          </a>
        </div>
      )}
    </div>
  );
};

export default UniversityRoomsPage;