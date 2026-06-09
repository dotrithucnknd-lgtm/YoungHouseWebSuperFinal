"use client";

import React, { FC, useState } from "react";
import Select from "@/shared/Select";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";


export interface SectionHero2Props {
  className?: string;
  children?: React.ReactNode;
}

const PRICE_OPTIONS = [
  { label: "Mức giá", value: "" },
  { label: "Dưới 1,5 triệu", value: "max-1500000" },
  { label: "1,5 – 2 triệu", value: "1500000-2000000" },
  { label: "2 – 2,5 triệu", value: "2000000-2500000" },
  { label: "2,5 – 3 triệu", value: "2500000-3000000" },
  { label: "3 – 4 triệu", value: "3000000-4000000" },
  { label: "Trên 4 triệu", value: "min-4000000" },
];

const AREA_OPTIONS = [
  { label: "Diện tích", value: "" },
  { label: "Dưới 15 m²", value: "max-15" },
  { label: "15 – 20 m²", value: "15-20" },
  { label: "20 – 30 m²", value: "20-30" },
  { label: "30 – 50 m²", value: "30-50" },
  { label: "Trên 50 m²", value: "min-50" },
];

const DISTRICT_OPTIONS = [
  { label: "Chọn khu vực tìm trọ", value: "" },
  { label: "Tân Xã", value: "Tân Xã" },
  { label: "Bình Yên", value: "Bình Yên" },
  { label: "Phú Hữu", value: "Phú Hữu" },
];

const SectionHero2: FC<SectionHero2Props> = ({ className = "" }) => {
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [areaRange, setAreaRange] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selectedDistrict) params.set("district", selectedDistrict);

    if (priceRange) {
      if (priceRange.startsWith("max-")) {
        params.set("maxPrice", priceRange.replace("max-", ""));
      } else if (priceRange.startsWith("min-")) {
        params.set("minPrice", priceRange.replace("min-", ""));
      } else {
        const [min, max] = priceRange.split("-");
        if (min) params.set("minPrice", min);
        if (max) params.set("maxPrice", max);
      }
    }

    if (areaRange) {
      if (areaRange.startsWith("max-")) {
        params.set("maxArea", areaRange.replace("max-", ""));
      } else if (areaRange.startsWith("min-")) {
        params.set("minArea", areaRange.replace("min-", ""));
      } else {
        const [min, max] = areaRange.split("-");
        if (min) params.set("minArea", min);
        if (max) params.set("maxArea", max);
      }
    }

    router.push(`/phong-tro?${params.toString()}`);
  };

  return (
    <section
      className={`relative overflow-hidden pt-12 pb-40 lg:pt-20 lg:pb-64 w-screen left-1/2 -translate-x-1/2 ${className}`}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0 -z-10 bg-gradient-to-br from-sky-100 via-white to-pink-100 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-secondary-300/35 blur-3xl dark:bg-secondary-700/20" />
      <div className="pointer-events-none absolute -bottom-36 -left-16 h-96 w-96 rounded-full bg-primary-300/30 blur-3xl dark:bg-primary-700/20" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-10 lg:gap-16 xl:gap-20">

          {/* Left: Title */}
          <div className="w-full lg:max-w-xl lg:pr-4">
            <div className="mb-5 inline-flex -rotate-2 rounded-full border border-primary-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700 shadow-sm dark:border-primary-700 dark:bg-neutral-900/70 dark:text-primary-200">
              YoungHouse - Hòa Lạc
            </div>
            <p className="mb-2 text-sm font-semibold text-primary-500 dark:text-primary-400 tracking-wide">
              Nhà trọ
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black uppercase leading-[0.92]">
              <span className="block text-primary-500 dark:text-primary-400">YoungHouse</span>
              <span className="mt-3 block text-secondary-500 dark:text-secondary-400">Hòa Lạc</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-md leading-relaxed">
              Tìm nhà trọ đẹp, giá hợp lý, vị trí thuận tiện cho học tập và làm việc tại Hòa Lạc.
            </p>
          </div>

          {/* Right: Search Card */}
          <div className="w-full lg:w-[440px] flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-2 -z-10 rotate-2 rounded-[2rem] bg-gradient-to-r from-secondary-500/30 to-primary-500/30 blur-lg" />
              <div className="rounded-2xl border border-white/60 bg-white/90 p-5 sm:p-6 shadow-2xl backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-900/90">

                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-300">
                    Tìm phòng theo nhu cầu
                  </p>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    Live
                  </span>
                </div>

                {/* District */}
                <div className="mb-3">
                  <Select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict((e.target as HTMLSelectElement).value)}
                    className="w-full"
                  >
                    {DISTRICT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                </div>

                {/* Price + Area */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Select
                    value={priceRange}
                    onChange={(e) => setPriceRange((e.target as HTMLSelectElement).value)}
                  >
                    {PRICE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                  <Select
                    value={areaRange}
                    onChange={(e) => setAreaRange((e.target as HTMLSelectElement).value)}
                  >
                    {AREA_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                </div>

                <ButtonPrimary
                  className="w-full !bg-secondary-500 hover:!bg-secondary-700"
                  onClick={handleSearch}
                >
                  <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                  Tìm kiếm ngay
                </ButtonPrimary>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SectionHero2;
