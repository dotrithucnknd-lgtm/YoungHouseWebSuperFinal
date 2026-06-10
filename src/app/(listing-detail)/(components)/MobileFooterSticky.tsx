"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import ZaloIcon from "@/images/logo_zalo.png";

const MobileFooterSticky = () => {
  const [price, setPrice] = useState<string>("-");
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);

  useEffect(() => {
    try {
      // Determine active room id then resolve its price key
      const activeId = sessionStorage.getItem("listing_stay_active_room_id");
      const key = activeId ? `listing_stay_price__${activeId}` : undefined;
      const savedPrice = key ? sessionStorage.getItem(key) : null;
      if (savedPrice) setPrice(savedPrice);
    } catch {}
  }, []);

  // Listen for price updates dispatched from detail page
  useEffect(() => {
    const handlePriceUpdated = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as { roomId?: string; price?: string } | undefined;
        if (detail?.roomId && detail?.price) {
          const activeId = sessionStorage.getItem("listing_stay_active_room_id");
          if (!activeId || activeId === String(detail.roomId)) {
            setPrice(detail.price);
          }
        } else {
          // Fallback: re-read from sessionStorage
          const activeId = sessionStorage.getItem("listing_stay_active_room_id");
          const key = activeId ? `listing_stay_price__${activeId}` : undefined;
          const savedPrice = key ? sessionStorage.getItem(key) : null;
          if (savedPrice) setPrice(savedPrice);
        }
      } catch {}
    };

    window.addEventListener("listing_stay_price_updated", handlePriceUpdated as EventListener);
    return () => window.removeEventListener("listing_stay_price_updated", handlePriceUpdated as EventListener);
  }, []);

  // Check photo gallery state
  useEffect(() => {
    const checkPhotoGalleryState = () => {
      try {
        const isOpen = sessionStorage.getItem('photo_gallery_open') === 'true';
        setIsPhotoGalleryOpen(isOpen);
      } catch {}
    };

    // Check initially
    checkPhotoGalleryState();

    // Listen for changes (polling approach)
    const interval = setInterval(checkPhotoGalleryState, 100);

    return () => clearInterval(interval);
  }, []);

  // Lightweight polling fallback to catch late sessionStorage writes
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30; // ~3s at 100ms
    const interval = setInterval(() => {
      try {
        if (cancelled) return;
        const activeId = sessionStorage.getItem("listing_stay_active_room_id");
        const key = activeId ? `listing_stay_price__${activeId}` : undefined;
        const savedPrice = key ? sessionStorage.getItem(key) : null;
        if (savedPrice) {
          setPrice(savedPrice);
          clearInterval(interval);
        }
        if (++attempts >= maxAttempts) {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 100);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Hide footer when photo gallery is open
  if (isPhotoGalleryOpen) {
    return null;
  }

  return (
    <div className="MobileFooterSticky block lg:hidden fixed inset-x-0 bottom-16 py-2 sm:py-3 bg-white dark:bg-neutral-800 border-t border-neutral-300 dark:border-neutral-700 z-[100]">
      <div className="container flex items-center justify-between gap-3">
        <div className="flex-shrink-0">
          <span className="block text-lg sm:text-xl font-semibold">
            {price}
            <span className="ml-1 text-xs sm:text-sm font-normal text-neutral-500 dark:text-neutral-400">
              /tháng
            </span>
          </span>
        </div>
        
        <div className="flex gap-2">
          <a
            href="https://zalo.me/0962888797"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-green-600 hover:bg-white-700 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Image src={ZaloIcon} alt="Zalo" width={16} height={16} className="object-contain" />
            <span className="hidden sm:inline">Zalo</span>
          </a>
          
          <a
            href="tel:0962888797"
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="hidden sm:inline">Gọi</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileFooterSticky;

