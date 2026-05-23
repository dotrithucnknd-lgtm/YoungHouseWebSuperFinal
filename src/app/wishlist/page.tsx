"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWishlistRooms } from "@/lib/supabaseServices";
import { StayDataType } from "@/data/types";
import StayCard from "@/components/StayCard";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useRouter } from "next/navigation";

const WishlistPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<StayDataType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        loadWishlist();
      }
    }
  }, [user, authLoading, router]);

  const loadWishlist = async () => {
    setLoading(true);
    const wishlistRooms = await fetchWishlistRooms();
    setRooms(wishlistRooms);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 lg:space-y-28">
      <main>
        {/* HEADER */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold">
            Danh sách yêu thích
          </h2>
          <span className="block mt-3 text-neutral-500 dark:text-neutral-400">
            {rooms.length} phòng đã lưu
          </span>
        </div>

        {/* CONTENT */}
        <div className="mt-10">
          {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg
                className="w-24 h-24 text-neutral-300 dark:text-neutral-700 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Chưa có phòng yêu thích
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                Bắt đầu lưu các phòng trọ bạn thích để xem sau
              </p>
              <ButtonPrimary onClick={() => router.push('/phong-tro')}>
                Khám phá phòng trọ
              </ButtonPrimary>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rooms.map((room) => (
                <StayCard key={room.id} data={room} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WishlistPage;

