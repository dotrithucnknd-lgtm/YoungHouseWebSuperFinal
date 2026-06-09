"use client";

import React, { FC, ReactNode, useEffect, useState } from "react";
import { StayDataType } from "@/data/types";
import PropertyCardH from "@/components/PropertyCardH";
import { fetchRoomsWithFiltersPaginated } from "@/lib/supabaseServices";
import Pagination from "@/shared/Pagination";
import NextPrev from "@/shared/NextPrev";
import { useRouter, useSearchParams } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";

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

  const page = Math.max(1, Number(searchParams?.get("page") || 1));
  const q = searchParams?.get("q") || "";
  const district = searchParams?.get("district") || "";
  const minPrice = Number(searchParams?.get("minPrice") || 0);
  const maxPrice = Number(searchParams?.get("maxPrice") || 0);
  const minArea = Number(searchParams?.get("minArea") || 0);
  const maxArea = Number(searchParams?.get("maxArea") || 0);
  const sort = (searchParams?.get("sort") || "") as "price_asc" | "price_desc" | "";

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hasFilters = Boolean(q || district || minPrice || maxPrice || minArea || maxArea || sort);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { items, total } = await fetchRoomsWithFiltersPaginated({
          searchText: q || undefined,
          district: district || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          minArea: minArea || undefined,
          maxArea: maxArea || undefined,
          sort: sort || undefined,
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
  }, [page, q, district, minPrice, maxPrice, minArea, maxArea, sort]);

  const goToPage = (p: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(p));
    router.push(`${url.pathname}?${url.searchParams.toString()}`);
  };

  const clearFilters = () => {
    router.push("/phong-tro");
  };

  // Build active filter chips for display
  const filterChips: string[] = [];
  if (q) filterChips.push(`Tìm: "${q}"`);
  if (district) filterChips.push(`Khu vực: ${district}`);
  if (minPrice && maxPrice) filterChips.push(`Giá: ${(minPrice/1e6).toFixed(1)}–${(maxPrice/1e6).toFixed(1)} triệu`);
  else if (minPrice) filterChips.push(`Giá: từ ${(minPrice/1e6).toFixed(1)} triệu`);
  else if (maxPrice) filterChips.push(`Giá: dưới ${(maxPrice/1e6).toFixed(1)} triệu`);
  if (minArea && maxArea) filterChips.push(`DT: ${minArea}–${maxArea} m²`);
  else if (minArea) filterChips.push(`DT: từ ${minArea} m²`);
  else if (maxArea) filterChips.push(`DT: dưới ${maxArea} m²`);

  return (
    <div className="nc-SectionGridFeatureProperty relative">
      {/* Heading */}
      <div className="mb-8 lg:mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold">{heading}</h2>
        {subHeading && !hasFilters && (
          <p className="mt-2 text-neutral-500 dark:text-neutral-400 text-sm md:text-base">
            {subHeading}
          </p>
        )}

        {/* Active filter chips */}
        {hasFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-neutral-500">Đang lọc:</span>
            {filterChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium px-3 py-1 border border-primary-200 dark:border-primary-700"
              >
                {chip}
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-medium px-3 py-1 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className={`grid gap-6 md:gap-8 grid-cols-1 xl:grid-cols-2 ${gridClass}`}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col sm:flex-row gap-4 rounded-3xl border border-neutral-100 dark:border-neutral-700 p-3 bg-white dark:bg-neutral-900">
              <div className="bg-gray-200 dark:bg-neutral-700 rounded-2xl w-full sm:w-48 h-40 sm:h-48 shrink-0" />
              <div className="flex-1 space-y-3 py-2">
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
          <p className="text-lg font-medium mb-2">Không tìm thấy phòng nào</p>
          <p className="text-sm mb-6">Thử thay đổi bộ lọc hoặc khu vực tìm kiếm.</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="rounded-xl bg-primary-500 text-white px-6 py-2.5 text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Xem tất cả phòng
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
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

      {/* Result count */}
      {!loading && rooms.length > 0 && (
        <p className="text-center mt-6 text-sm text-neutral-400">
          Hiển thị {rooms.length} / {total} phòng
        </p>
      )}
    </div>
  );
};

export default SectionGridFeatureProperty;
