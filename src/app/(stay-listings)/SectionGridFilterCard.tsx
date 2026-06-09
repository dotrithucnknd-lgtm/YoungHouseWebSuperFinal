"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import { StayDataType } from "@/data/types";
import { fetchRoomsPaginatedWithTotal, fetchRoomsWithFiltersPaginated } from "@/lib/supabaseServices";
import { useSearchParams, useRouter } from "next/navigation";
import Pagination from "@/shared/Pagination";
import NextPrev from "@/shared/NextPrev";
import TabFilters from "./TabFilters";
import StayCard2 from "@/components/StayCard2";

export interface SectionGridFilterCardProps {
  className?: string;
  data?: StayDataType[];
}

const SectionGridFilterCard: FC<SectionGridFilterCardProps> = ({
  className = "",
  data,
}) => {
  const [rooms, setRooms] = useState<StayDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageSize = 12;
  const q = searchParams?.get("page");
  const page = Number.isFinite(Number(q)) && Number(q) > 0 ? Number(q) : 1;

  useEffect(() => {
    const loadRooms = async () => {
      if (data) return;
      setLoading(true);
      try {
        const q = (searchParams?.get('q') || '').trim();
        const price = (searchParams?.get('price') || '').trim();
        const areaSize = (searchParams?.get('area') || '').trim(); // Diện tích (m²)
        const district = (searchParams?.get('district') || '').trim(); // Khu vực
        const minPriceParam = searchParams?.get('minPrice');
        const maxPriceParam = searchParams?.get('maxPrice');
        const sortParam = (searchParams?.get('sort') || '').trim() as 'price_asc' | 'price_desc' | '';

        const parsePriceRange = (val: string): { minPrice?: number; maxPrice?: number } => {
          if (!val) return {};
          if (val.endsWith('+')) {
            const minM = Number(val.replace('+',''));
            if (Number.isFinite(minM)) return { minPrice: minM * 1_000_000 };
            return {};
          }
          const [a,b] = val.split('-');
          const minM = Number(a);
          const maxM = Number(b);
          const out: { minPrice?: number; maxPrice?: number } = {};
          if (Number.isFinite(minM)) out.minPrice = minM * 1_000_000;
          if (Number.isFinite(maxM)) out.maxPrice = maxM * 1_000_000;
          return out;
        };

        const parseAreaRange = (val: string): { minArea?: number; maxArea?: number } => {
          if (!val) return {};
          if (val.endsWith('+')) {
            const min = Number(val.replace('+',''));
            if (Number.isFinite(min)) return { minArea: min };
            return {};
          }
          const [a,b] = val.split('-');
          const min = Number(a);
          const max = Number(b);
          const out: { minArea?: number; maxArea?: number } = {};
          if (Number.isFinite(min)) out.minArea = min;
          if (Number.isFinite(max)) out.maxArea = max;
          return out;
        };

        // Parse price from URL params (minPrice/maxPrice) or legacy price param
        let priceFilter: { minPrice?: number; maxPrice?: number } = {};
        if (minPriceParam || maxPriceParam) {
          const min = Number(minPriceParam || '');
          const max = Number(maxPriceParam || '');
          if (Number.isFinite(min) && min > 0) priceFilter.minPrice = min;
          if (Number.isFinite(max) && max > 0) priceFilter.maxPrice = max;
        } else {
          priceFilter = parsePriceRange(price);
        }

        const areaFilter = parseAreaRange(areaSize);

        const hasFilters = Boolean(q || priceFilter.minPrice || priceFilter.maxPrice || areaFilter.minArea || areaFilter.maxArea || sortParam || district);
        
        // Always fetch from Supabase (real-time data)
        const { items, total } = await fetchRoomsWithFiltersPaginated({
          searchText: q || undefined,
          district: district || undefined,
          ...priceFilter,
          ...areaFilter,
          sort: sortParam || undefined,
          page,
          pageSize,
        });
        setRooms(items);
        setTotal(total);
      } catch (error) {
        console.error('Error loading rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [data, page, searchParams]);

  // Display data - no need for client-side filtering/sorting as it's done in backend
  const displayData = useMemo(() => {
    const list = data || rooms;
    if (!Array.isArray(list)) return [];
    return list;
  }, [data, rooms]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div
      className={`nc-SectionGridFilterCard ${className}`}
      data-nc-id="SectionGridFilterCard"
    >
      <div className="mb-8 lg:mb-11">
        <TabFilters />
      </div>
      <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))
        ) : displayData.length > 0 ? (
          displayData.map((stay) => (
            <StayCard2 key={stay.id} data={stay} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Không có phòng nào được tìm thấy.</p>
          </div>
        )}
      </div>
      <div className="flex mt-16 justify-center items-center space-x-4">
        <NextPrev
          currentPage={page}
          totalPage={totalPages}
          onlyPrev
          onClickPrev={() => {
            const target = Math.max(1, page - 1);
            try {
              const url = new URL(window.location.href);
              url.searchParams.set('page', String(target));
              router.push(`${url.pathname}?${url.searchParams.toString()}`);
            } catch {
              router.push(`/phong-tro?page=${target}`);
            }
          }}
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p:number)=>{
            try {
              const url = new URL(window.location.href);
              url.searchParams.set('page', String(p));
              router.push(`${url.pathname}?${url.searchParams.toString()}`);
            } catch {
              router.push(`/phong-tro?page=${p}`);
            }
          }}
        />
        <NextPrev
          currentPage={page}
          totalPage={totalPages}
          onlyNext
          onClickNext={() => {
            const target = Math.min(totalPages, page + 1);
            try {
              const url = new URL(window.location.href);
              url.searchParams.set('page', String(target));
              router.push(`${url.pathname}?${url.searchParams.toString()}`);
            } catch {
              router.push(`/phong-tro?page=${target}`);
            }
          }}
        />
      </div>
    </div>
  );
};

export default SectionGridFilterCard;

