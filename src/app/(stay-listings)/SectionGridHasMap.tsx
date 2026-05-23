"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import AnyReactComponent from "@/components/AnyReactComponent/AnyReactComponent";
import GoogleMapReact from "google-map-react";
import { fetchRooms } from "@/lib/supabaseServices";
import { StayDataType } from "@/data/types";
import ButtonClose from "@/shared/ButtonClose";
import Checkbox from "@/shared/Checkbox";
import Pagination from "@/shared/Pagination";
import TabFilters from "./TabFilters";
import { useSearchParams } from "next/navigation";
import Heading2 from "@/shared/Heading2";
import StayCard2 from "@/components/StayCard2";

export interface SectionGridHasMapProps {}

const SectionGridHasMap: FC<SectionGridHasMapProps> = () => {
  const [currentHoverID, setCurrentHoverID] = useState<string | number>(-1);
  const [showFullMapFixed, setShowFullMapFixed] = useState(false);
  const [rooms, setRooms] = useState<StayDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const sortParam = searchParams?.get('sort') || '';
  const minPriceParam = Number(searchParams?.get('minPrice') || '');
  const maxPriceParam = Number(searchParams?.get('maxPrice') || '');
  const displayRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return [];
    const parsePrice = (p?: string) => {
      if (!p) return 0;
      const n = Number(String(p).replace(/[^0-9]/g, ''));
      return Number.isFinite(n) ? n : 0;
    };
    const hasMin = Number.isFinite(minPriceParam) && minPriceParam >= 0;
    const hasMax = Number.isFinite(maxPriceParam) && maxPriceParam > 0;
    let filtered = rooms;
    if (hasMin || hasMax) {
      filtered = rooms.filter((item) => {
        const price = parsePrice(item.price);
        if (hasMin && price < (minPriceParam as number)) return false;
        if (hasMax && price > (maxPriceParam as number)) return false;
        return true;
      });
    }
    if (!sortParam) return filtered;
    const sorted = [...filtered].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    return sortParam === 'price_desc' ? sorted.reverse() : sorted;
  }, [rooms, sortParam, minPriceParam, maxPriceParam]);

  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true);
      try {
        const fetchedRooms = await fetchRooms(12); // Load 12 rooms for map view
        setRooms(fetchedRooms);
      } catch (error) {
        console.error('Error loading rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  // Default center for Ho Chi Minh City if no rooms available
  const defaultCenter = rooms.length > 0 ? rooms[0].map : { lat: 10.8231, lng: 106.6297 };

  return (
    <div>
      <div className="relative flex min-h-screen">
        {/* CARDSSSS */}
        <div className="min-h-screen w-full xl:w-[60%] 2xl:w-[60%] max-w-[1184px] flex-shrink-0 xl:px-8 ">
          <Heading2 className="!mb-8" />
          <div className="mb-8 lg:mb-11">
            <TabFilters />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 2xl:gap-x-6 gap-y-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))
            ) : displayRooms.length > 0 ? (
              displayRooms.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={() => setCurrentHoverID((_) => item.id)}
                  onMouseLeave={() => setCurrentHoverID((_) => -1)}
                >
                  <StayCard2 data={item} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Không có phòng nào được tìm thấy.</p>
              </div>
            )}
          </div>
          <div className="flex mt-16 justify-center items-center">
            <Pagination />
          </div>
        </div>

        {!showFullMapFixed && (
          <div
            className={`flex xl:hidden items-center justify-center fixed bottom-16 md:bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-neutral-900 text-white shadow-2xl rounded-full z-30  space-x-3 text-sm cursor-pointer`}
            onClick={() => setShowFullMapFixed(true)}
          >
            <i className="text-lg las la-map"></i>
            <span>Show map</span>
          </div>
        )}

        {/* MAPPPPP */}
        <div
          className={`xl:flex-1 xl:static xl:block ${
            showFullMapFixed ? "fixed inset-0 z-50" : "hidden"
          }`}
        >
          {showFullMapFixed && (
            <ButtonClose
              onClick={() => setShowFullMapFixed(false)}
              className="bg-white absolute z-50 left-3 top-3 shadow-lg rounded-xl w-10 h-10"
            />
          )}

          <div className="fixed xl:sticky top-0 xl:top-[88px] left-0 w-full h-full xl:h-[calc(100vh-88px)] rounded-md overflow-hidden">
            <div className="absolute bottom-5 left-3 lg:bottom-auto lg:top-2.5 lg:left-1/2 transform lg:-translate-x-1/2 py-2 px-4 bg-white dark:bg-neutral-800 shadow-xl z-10 rounded-2xl min-w-max">
              <Checkbox
                className="text-xs xl:text-sm"
                name="xx"
                label="Search as I move the map"
              />
            </div>
            <GoogleMapReact
              defaultZoom={12}
              defaultCenter={defaultCenter}
              bootstrapURLKeys={{
                key: "AIzaSyAGVJfZMAKYfZ71nzL_v5i3LjTTWnCYwTY",
              }}
              yesIWantToUseGoogleMapApiInternals
            >
              {!loading && displayRooms.map((item) => (
                <AnyReactComponent
                  isSelected={currentHoverID === item.id}
                  key={item.id}
                  lat={item.map.lat}
                  lng={item.map.lng}
                  listing={item}
                />
              ))}
            </GoogleMapReact>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionGridHasMap;
