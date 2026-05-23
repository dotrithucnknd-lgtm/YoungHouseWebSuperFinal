"use client";

import BackgroundSection from "@/components/BackgroundSection";
import ListingImageGallery from "@/components/listing-image-gallery/ListingImageGallery";
import SectionSliderNewCategories from "@/components/SectionSliderNewCategories";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { resolveRoomIdFromDetailUrl } from "@/utils/roomDetailUrl";
import React, { ReactNode } from "react";
import MobileFooterSticky from "./(components)/MobileFooterSticky";
import { imageGallery as listingStayImageGallery } from "./phong-tro-detail/constant";
import { Route } from "next";

const DetailtLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const thisPathname = usePathname();
  const searchParams = useSearchParams();
  const modal = searchParams?.get("modal");
  const roomId = resolveRoomIdFromDetailUrl(
    thisPathname,
    searchParams?.get("id") ?? null
  );

  const handleCloseModalImageGallery = () => {
    let params = new URLSearchParams(document.location.search);
    params.delete("modal");
    params.delete("photoId"); // Also remove photoId when closing
    router.push(`${thisPathname}/?${params.toString()}` as Route);
  };

  const getImageGalleryListing = () => {
    if (thisPathname?.includes("/phong-tro-detail")) {
      try {
        const raw = sessionStorage.getItem("listing_stay_gallery");
        const urls: string[] = raw ? JSON.parse(raw) : [];
        if (urls && urls.length) {
          return urls.map((url, index) => ({ id: index, url }));
        }
      } catch (e) {
        // fallback below
      }
      return listingStayImageGallery;
    }

    return [];
  };

  return (
    <div className="ListingDetailPage">
      <ListingImageGallery
        key={`gallery-${roomId || 'default'}`} // Force re-mount when room changes
        isShowModal={modal === "PHOTO_TOUR_SCROLLABLE"}
        onClose={handleCloseModalImageGallery}
        images={getImageGalleryListing()}
      />

      <div className="container ListingDetailPage__content pb-20 lg:pb-0">{children}</div>

      {/* OTHER SECTION */}
      <div className="container py-24 lg:py-32">
        <div className="relative py-16">
          <BackgroundSection />
          <SectionSliderNewCategories
            heading="Khám phá những phòng trọ gần các trường học"
            subHeading="Nhà trọ gần FPTU,HVTC,ĐHQG HN"
            categoryCardType="card5"
            itemPerRow={5}
            sliderStyle="style2"
          />
        </div>
      </div>


      {/* STICKY FOOTER MOBILE */}
      <MobileFooterSticky />
    </div>
  );
};

export default DetailtLayout;

