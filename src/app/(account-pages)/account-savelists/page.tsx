"use client";

import { Tab } from "@headlessui/react";
import StayCard from "@/components/StayCard";
import React, { Fragment, useState, useEffect } from "react";
import ButtonSecondary from "@/shared/ButtonSecondary";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWishlistRooms } from "@/lib/supabaseServices";
import { StayDataType } from "@/data/types";
import { useRouter } from "next/navigation";

const AccountSavelists = () => {
  let [categories] = useState(["Phòng đã lưu"]);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<StayDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(8);

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

  const renderSection1 = () => {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-3xl font-semibold">Danh sách yêu thích</h2>
          <span className="block mt-2 text-white">
            {rooms.length} phòng đã lưu
          </span>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        <div>
          <Tab.Group>
            <Tab.List className="flex space-x-1 overflow-x-auto">
              {categories.map((item) => (
                <Tab key={item} as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={`flex-shrink-0 block !leading-none font-medium px-5 py-2.5 text-sm sm:text-base sm:px-6 sm:py-3 capitalize rounded-full focus:outline-none ${
                        selected
                          ? "bg-secondary-900 text-white "
                          : "text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      } `}
                    >
                      {item}
                    </button>
                  )}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel className="mt-8">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                  </div>
                ) : rooms.length === 0 ? (
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
                    <ButtonSecondary onClick={() => router.push('/phong-tro')}>
                      Khám phá phòng trọ
                    </ButtonSecondary>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {rooms.slice(0, displayCount).map((room) => (
                        <StayCard key={room.id} data={room} />
                      ))}
                    </div>
                    {displayCount < rooms.length && (
                      <div className="flex mt-11 justify-center items-center">
                        <ButtonSecondary onClick={() => setDisplayCount(displayCount + 8)}>
                          Xem thêm
                        </ButtonSecondary>
                      </div>
                    )}
                  </>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return renderSection1();
};

export default AccountSavelists;

