"use client";

import React, { FC, ReactNode, useEffect, useState } from "react";
import { StayDataType } from "@/data/types";
import PropertyCardH from "@/components/PropertyCardH";
import { fetchRoomsWithFiltersPaginated } from "@/lib/supabaseServices";
import Pagination from "@/shared/Pagination";
import NextPrev from "@/shared/NextPrev";
import { useRouter, useSearchParams } from "next/navigation";

export interface SectionGridFeaturePropertyProps {
  gridClass?: string;
  heading?: ReactNode;
  subHeading?: ReactNode;
}

const PAGE_SIZE = 8;

const SectionGridFeatureProperty: FC<SectionGridFeaturePropertyProps> = ({
  gridClass = "",
  heading = "Hệ thống nhà trọ YoungHouse",
  subHeading = "Khám phá những phòng trọ tốt nhất tại khu công nghệ cao Hoà Lạc",
}) => {
  const [rooms, setRooms] = useState<StayDataType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams?.get("page");
  const page = Number.isFinite(Number(q)) && Number(q) > 0 ? Number(q) : 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { items, total } = await fetchRoomsWithFiltersPaginated({
          page,
          pageSize: PAGE_SIZE,
        });
        setRooms(items);
        setTotal(total);
      } catch (err) {
        console.error("SectionGridFeatureProperty fetch error:", err);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const goToPage = (p: number) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("page", String(p));
      router.push(`${url.pathname}?${url.searchParams.toString()}`);
    } catch {
      router.push(`/phong-tro?page=${p}`);
    }
  };

  return (
    <div className="nc-SectionGridFeatureProperty relative">
      {/* Heading */}
      <div className="mb-8 lg:mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold">{heading}</h2>
        {subHeading && (
          <p className="mt-2 text-neutral-500 dark:text-neutral-400 text-sm md:text-base">
            {subHeading}
          </p>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className={`grid gap-6 md:gap-8 grid-cols-1 xl:grid-cols-2 ${gridClass}`}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4 h-36">
              <div className="bg-gray-200 dark:bg-neutral-700 rounded-2xl w-44 shrink-0" />
              <div className="flex-1 space-y-3 py-3">
                <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-1/2" />
                <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <div className={`grid gap-6 md:gap-8 grid-cols-1 xl:grid-cols-2 ${gridClass}`}>
          {rooms.map((stay, index) => (
            <PropertyCardH key={stay.id ?? index} className="h-full" data={stay} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-neutral-500">
          Chưa có phòng nào.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex mt-16 justify-center items-center space-x-4">
          <NextPrev
            currentPage={page}
            totalPage={totalPages}
            onlyPrev
            onClickPrev={() => goToPage(Math.max(1, page - 1))}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
          <NextPrev
            currentPage={page}
            totalPage={totalPages}
            onlyNext
            onClickNext={() => goToPage(Math.min(totalPages, page + 1))}
          />
        </div>
      )}
    </div>
  );
};

export default SectionGridFeatureProperty;
