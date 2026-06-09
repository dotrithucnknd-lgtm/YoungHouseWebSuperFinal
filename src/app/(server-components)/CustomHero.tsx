"use client";

import React, { useState } from "react";
import Select from "@/shared/Select";
import ButtonPrimary from "@/shared/ButtonPrimary";

const CustomHero = () => {
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
    <section className="hero-section relative overflow-hidden py-10 lg:py-16 mb-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-sky-100 via-white to-pink-100 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-secondary-300/35 blur-3xl dark:bg-secondary-700/20" />
      <div className="pointer-events-none absolute -bottom-36 -left-16 h-96 w-96 rounded-full bg-primary-300/30 blur-3xl dark:bg-primary-700/20" />
      <div className="pointer-events-none absolute -right-16 top-1/3 h-44 w-44 rotate-12 rounded-3xl border border-white/60 bg-white/30 backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-800/40" />

      <div className="container mx-auto px-6 md:px-8 xl:px-12">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="hero-content relative pt-2 pb-4 lg:col-span-7 lg:pt-8">
            <div className="mb-5 inline-flex -rotate-2 rounded-full border border-primary-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700 shadow-sm dark:border-primary-700 dark:bg-neutral-900/70 dark:text-primary-200">
              YoungHouse - Hòa Lạc
            </div>

            <h1 className="hero-title text-5xl font-black uppercase leading-[0.92] md:text-7xl xl:text-8xl">
              <span className="block text-primary-500 dark:text-primary-400">
                YoungHouse
              </span>
              <span className="mt-4 block text-secondary-500 dark:text-secondary-400">
                Hòa Lạc
              </span>
            </h1>

            <p className="hero-subtitle mt-6 max-w-xl text-base text-neutral-700 dark:text-neutral-200 md:text-xl">
              Tìm nhà trọ đẹp, giá hợp lý, vị trí thuận tiện cho học tập và làm
              việc tại Hòa Lạc.
            </p>

          </div>

          <div className="search-container relative lg:col-span-5 lg:pt-4">
            <div className="absolute -inset-2 -z-10 rotate-2 rounded-[2rem] bg-gradient-to-r from-secondary-500/30 to-primary-500/30 blur-lg" />
            <div className="rounded-[2rem] border border-white/60 bg-white/90 p-4 shadow-2xl backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-900/90 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-300">
                  Tìm phòng theo nhu cầu
                </p>
                <span className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300">
                  Live
                </span>
              </div>

              <div className="search-tabs mb-4 flex flex-wrap gap-2">
                <button
                  className={`tab rounded-full px-4 py-2 text-sm font-medium ${
                    activeTab === "all"
                      ? "bg-secondary-500 text-white"
                      : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  }`}
                  onClick={() => setActiveTab("all")}
                >
                  Tất cả
                </button>
                <button
                  className={`tab rounded-full px-4 py-2 text-sm font-medium ${
                    activeTab === "room"
                      ? "bg-secondary-500 text-white"
                      : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  }`}
                  onClick={() => setActiveTab("room")}
                >
                  Hệ thống phòng trọ
                </button>
              </div>

              <div className="search-form space-y-3">
                <Select
                  value={selectedArea}
                  onChange={(e) =>
                    setSelectedArea((e.target as HTMLSelectElement).value)
                  }
                  className="w-full"
                >
                  <option value="">Chọn khu vực tìm trọ</option>
                  <option value="Thach Hoa">Thạch Hòa</option>
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
    </section>
  );
};

export default CustomHero;
