"use client";

import React, { FC, ReactNode, useEffect, useState } from "react";
import { StayDataType } from "@/data/types";
import PropertyCardH from "@/components/PropertyCardH";
import HeaderFilter from "@/components/HeaderFilter";
import { fetchRoomsWithFiltersPaginated } from "@/lib/supabaseServices";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useRouter } from "next/navigation";

export interface SectionGridFeaturePropertyProps {
  gridClass?: string;
  heading?: ReactNode;
  subHeading?: ReactNode;
  headingIsCenter?: boolean;
  tabs?: string[];
}

const TABS = ["Tân Xã", "Bình Yên", "Phú Hữu"];

const SectionGridFeatureProperty: FC<SectionGridFeaturePropertyProps> = ({
  gridClass = "",
  heading = "Hệ thống nhà trọ YoungHouse",
  subHeading = "Khám phá những phòng trọ được yêu thích nhất tại các khu vực",
  tabs = TABS,
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [rooms, setRooms] = useState<StayDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true);
      try {
        const { items } = await fetchRoomsWithFiltersPaginated({
          district: activeTab,
          page: 1,
          pageSize: 8,
        });
        setRooms(items);
      } catch (err) {
        console.error("SectionGridFeatureProperty fetch error:", err);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, [activeTab]);

  return (
    <div className="nc-SectionGridFeatureProperty relative">
      <HeaderFilter
        tabActive={activeTab}
        subHeading={subHeading}
        tabs={tabs}
        heading={heading}
        onClickTab={setActiveTab}
      />

      {loading ? (
        <div
          className={`grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 ${gridClass}`}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4 h-32">
              <div className="bg-gray-200 rounded-xl w-40 shrink-0" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <div
          className={`grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 ${gridClass}`}
        >
          {rooms.map((stay, index) => (
            <PropertyCardH key={stay.id ?? index} className="h-full" data={stay} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Chưa có phòng nào tại khu vực <strong>{activeTab}</strong>.
        </div>
      )}

      <div className="flex mt-16 justify-center items-center">
        <ButtonPrimary onClick={() => router.push(`/phong-tro?district=${encodeURIComponent(activeTab)}`)}>
          Xem thêm tại {activeTab}
        </ButtonPrimary>
      </div>
    </div>
  );
};

export default SectionGridFeatureProperty;

