"use client";

import React, { useEffect, useState } from "react";
import { fetchUniversitiesWithRoomCounts, UniversityWithRoomCount } from "@/lib/supabaseServices";
import Link from "next/link";
import Image from "next/image";
import { slugify } from "@/utils/slugify";

const UniversityExploreSection = () => {
  const [universities, setUniversities] = useState<UniversityWithRoomCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      console.log('Loading universities...');
      const { universities: data, error } = await fetchUniversitiesWithRoomCounts();
      console.log('Universities data:', data);
      console.log('Error:', error);
      if (!error) {
        setUniversities(data);
      }
    } catch (error) {
      console.error("Error loading universities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImage = (universityName: string) => {
    // Return local image based on university name
    const localImages: Record<string, string> = {
      'FPTU': '/images/dh_fptu.jpg',
      'HVTC': '/images/dh_hvtc.jpg',
      'ĐHQG HN': '/images/dh_vnu.png',
      'ĐLĐL HN': 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
    };
    
    return localImages[universityName] || '/images/dh_fptu.jpg';
  };

  if (loading) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Khám phá những phòng trọ gần các trường học
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300">
              Nhà trọ gần FPTU, HVTC, ĐHQG HN
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 dark:bg-neutral-700 rounded-2xl h-48 mb-4"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            Khám phá những phòng trọ gần các trường học
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300">
            Nhà trọ gần FPTU, HVTC, ĐHQG HN
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {universities.map((university) => (
            <Link
              key={university.id}
              href={`/phong-tro-gan-truong/${slugify(university.short_name)}`}
              className="group block"
            >
              <div className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={
                      imageErrors[university.id]
                        ? getDefaultImage(university.short_name)
                        : university.image_url || getDefaultImage(university.short_name)
                    }
                    alt={university.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={() =>
                      setImageErrors((prev) => ({ ...prev, [university.id]: true }))
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Properties count badge */}
                  <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-neutral-900 dark:text-white">
                    {university.room_count.toLocaleString()} phòng
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                    {university.short_name}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
                    {university.name}
                  </p>
                  {university.address && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      📍 {university.address}
                    </p>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                      {university.room_count} properties
                    </span>
                    <div className="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {universities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400">
              Chưa có dữ liệu trường đại học nào.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityExploreSection;
