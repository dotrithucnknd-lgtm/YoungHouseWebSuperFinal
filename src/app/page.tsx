import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import CustomHero from "@/app/(server-components)/CustomHero";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import SectionOurFeatures from "@/components/SectionOurFeatures";
import SectionStats from "@/components/SectionStats";
import { StayDataType } from "@/data/types";
import { getListings } from "@/lib/listingsQuery";
import { buildRoomDetailPath } from "@/utils/roomDetailUrl";

/** ISR: regenerate homepage at most once per 60s (faster cold paths on Vercel). */
export const revalidate = 60;

const SectionGridFeaturePlaces = dynamic(() => import("@/components/SectionGridFeaturePlaces"), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />,
});

const UniversityExploreSection = dynamic(() => import("@/components/UniversityExploreSection"), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />,
});

async function fetchHomeListings(): Promise<StayDataType[]> {
  try {
    // `hot=fill`: show admin-curated HOT rooms first, then pad up to 8 with the latest rooms.
    const { listings: rows, error } = await getListings({ hot: "fill", limit: 8 });
    if (error) return [];
    const mapped: StayDataType[] = rows.slice(0, 8).map((r, idx) => ({
      id: r.id ?? idx,
      author: {
        id: r.owner_id ?? `owner-${idx}`,
        firstName: r.owner_name ?? "",
        lastName: "",
        displayName: r.owner_name ?? "",
        avatar: "/favicon.ico",
        count: 0,
        desc: "",
        jobName: "",
        href: "/",
      },
      // Use a stable fallback to avoid hydration mismatches
      date: r.created_at ?? "1970-01-01T00:00:00.000Z",
      href:
        r.href ??
        buildRoomDetailPath(String(r.title ?? "phong-tro"), String(r.id ?? idx)),
      title: r.title ?? "Listing",
      featuredImage:
        r.featured_image || (Array.isArray(r.gallery_imgs) && r.gallery_imgs[0]) || "/favicon.ico",
      roomStatus: r.status && r.status !== "available" ? "sold_out" : "available",
      commentCount: 0,
      viewCount: 0,
      address: r.address ?? "",
      district: r.district ?? "",
      ward: r.ward ?? "",
      reviewStart: r.review_star ?? 0,
      reviewCount: r.review_count ?? 0,
      like: false,
      galleryImgs: Array.isArray(r.gallery_imgs) && r.gallery_imgs.length
        ? r.gallery_imgs
        : [r.featured_image || "/favicon.ico"],
      price: String(r.price ?? "0"),
      listingCategory: {
        id: "category",
        name: "Rooms",
        href: "/",
        taxonomy: "category",
      },
      maxGuests: 1,
      bedrooms: 1,
      bathrooms: 1,
      saleOff: null,
      isAds: null,
      map: {
        lat: r.lat ?? 0,
        lng: r.lng ?? 0,
      },
    }));
    return mapped;
  } catch {
    return [];
  }
}

async function PageHome() {
  const homeListings = await fetchHomeListings();
  return (
    <main className="nc-PageHome relative overflow-hidden">
      {/* GLASSMOPHIN */}
      <BgGlassmorphism />

      {/* CUSTOM HERO FULL-WIDTH */}
      <CustomHero />

      <div className="container relative space-y-24 mb-24 lg:space-y-28 lg:mb-28">
        {/* SECTION 1 - Feature Places */}
        <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />}>
          <SectionGridFeaturePlaces cardType="card2" stayListings={homeListings} />
        </Suspense>

        {/* SECTION 2 - Value Features */}
        <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />}>
          <SectionOurFeatures />
        </Suspense>

        {/* SECTION 3 - Trust Statistics */}
        <SectionStats />

        {/* SECTION 4 - Explore by University */}
        <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-lg" />}>
          <UniversityExploreSection />
        </Suspense>
      </div>
    </main>
  );
}

export default PageHome;
