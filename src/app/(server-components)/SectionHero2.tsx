"use client";

import React, { FC, useState } from "react";
import Select from "@/shared/Select";
import ButtonPrimary from "@/shared/ButtonPrimary";

export interface SectionHero2Props {
  className?: string;
  children?: React.ReactNode;
}

const SectionHero2: FC<SectionHero2Props> = ({ className = "", children }) => {
  const [activeTab, setActiveTab] = useState<"all" | "room">("room");
  const [selectedArea, setSelectedArea] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [area, setArea] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedArea) {
      params.set("district", selectedArea);
      params.set("q", selectedArea);
    }
    if (priceRange) params.set("price", priceRange);
    if (area) params.set("area", area);
    if (activeTab) params.set("type", activeTab);
    window.location.href = `/phong-tro?${params.toString()}`;
  };

  return (
    <section className={`relative overflow-hidden pt-12 pb-40 lg:pt-20 lg:pb-64 w-screen left-1/2 -translate-x-1/2 ${className}`}>
      {/* Background gradient extended way downwards */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[-200px] lg:bottom-[-300px] -z-10 bg-gradient-to-br from-sky-100 via-white to-pink-100 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-secondary-300/35 blur-3xl dark:bg-secondary-700/20" />
      <div className="pointer-events-none absolute -bottom-36 -left-16 h-96 w-96 rounded-full bg-primary-300/30 blur-3xl dark:bg-primary-700/20" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-10 lg:gap-16 xl:gap-20">

          {/* Left: Title */}
          <div className="w-full lg:max-w-xl lg:pr-4">
            <div className="mb-5 inline-flex -rotate-2 rounded-full border border-primary-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700 shadow-sm dark:border-primary-700 dark:bg-neutral-900/70 dark:text-primary-200">
              YoungHouse - Hòa Lạc
            </div>

            <p className="mb-2 text-sm font-semibold text-primary-500 dark:text-primary-400 tracking-wide">Nhà trọ</p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black uppercase leading-[0.92]">
              <span className="block text-primary-500 dark:text-primary-400">
                YoungHouse
              </span>
              <span className="mt-3 block text-secondary-500 dark:text-secondary-400">
                Hòa Lạc
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-md leading-relaxed">
              Tìm nhà trọ đẹp, giá hợp lý, vị trí thuận tiện cho học tập và làm
              việc tại Hòa Lạc.
            </p>
          </div>

          {/* Right: Search Card */}
          <div className="w-full lg:w-[420px] flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-2 -z-10 rotate-2 rounded-[2rem] bg-gradient-to-r from-secondary-500/30 to-primary-500/30 blur-lg" />
              <div className="rounded-2xl border border-white/60 bg-white/90 p-5 sm:p-6 shadow-2xl backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-900/90">

                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-300">
                    Tìm phòng theo nhu cầu
                  </p>
                  <span className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300">
                    Live
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeTab === "all"
                      ? "bg-secondary-500 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"
                      }`}
                    onClick={() => setActiveTab("all")}
                  >
                    Tất cả
                  </button>
                  <button
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeTab === "room"
                      ? "bg-secondary-500 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"
                      }`}
                    onClick={() => setActiveTab("room")}
                  >
                    Nhà trọ, phòng trọ
                  </button>
                </div>

                {/* Form */}
                <div className="space-y-3">
                  <Select
                    value={selectedArea}
                    onChange={(e) =>
                      setSelectedArea((e.target as HTMLSelectElement).value)
                    }
                    className="w-full"
                  >
                    <option value="">Chọn khu vực tìm trọ</option>
                    <option value="Thach Hoa">Thạch Hoà</option>
                    <option value="Tan Xa">Tân Xã</option>
                    <option value="Binh Yen">Bình Yên</option>
                    <option value="Bac Phu Cat">Bắc Phú Cát</option>
                  </Select>

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      value={priceRange}
                      onChange={(e) =>
                        setPriceRange((e.target as HTMLSelectElement).value)
                      }
                    >
                      <option value="">Mức giá</option>
                      <option value="0-2">Dưới 2 triệu</option>
                      <option value="2-3">2-3 triệu</option>
                      <option value="3-4">3-4 triệu</option>
                      <option value="4-6">4-6 triệu</option>
                    </Select>
                    <Select
                      value={area}
                      onChange={(e) => setArea((e.target as HTMLSelectElement).value)}
                    >
                      <option value="">Diện tích</option>
                      <option value="0-20">Dưới 20m2</option>
                      <option value="20-30">20-30m2</option>
                      <option value="30-50">30-50m2</option>
                      <option value="50+">Trên 50m2</option>
                    </Select>
                  </div>

                  <ButtonPrimary
                    className="w-full !bg-secondary-500 hover:!bg-secondary-700"
                    onClick={handleSearch}
                  >
                    Tìm kiếm ngay
                  </ButtonPrimary>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SectionHero2;
