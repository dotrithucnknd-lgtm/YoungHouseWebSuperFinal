"use client";

import React, { useState } from "react";
import Input from "@/shared/Input";
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
      // Set district parameter for the selected area
      params.set("district", selectedArea);
      params.set("q", selectedArea);
    }
    if (priceRange) params.set("price", priceRange);
    if (area) params.set("area", area);
    if (activeTab) params.set("type", activeTab);
    window.location.href = `/phong-tro?${params.toString()}`;
  };

  return (
    <section className="hero-section relative overflow-hidden py-12 lg:py-20 mb-5">
      {/* Background gradient + soft blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-sky-50 via-white to-amber-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-300/30 blur-3xl dark:bg-primary-600/20" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-orange-300/25 blur-3xl dark:bg-orange-600/20" />
      <div className="container mx-auto px-6 md:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="hero-content pt-2 lg:pt-4 pb-6 lg:pb-8">
            <h1 className="hero-title text-4xl md:text-6xl font-extrabold text-neutral-900 dark:text-white leading-tight">
              
              <span className="highlight text-primary-500">HOÀ LẠC CÓ TRỌ XINH 🎀</span>
            </h1>
            <p className="hero-subtitle mt-6 text-neutral-600 dark:text-neutral-200 text-lg">
            Khám phá ngay các tin trọ HOT nhất, chất lượng, giá tốt ở Hòa Lạc.            </p>
          </div>
          <div className="search-container lg:pl-8">
            <div className="rounded-3xl bg-white dark:bg-neutral-900 p-4 md:p-6 shadow-xl ring-1 ring-neutral-200 dark:ring-neutral-700">
              <div className="search-tabs flex space-x-2 mb-4">
                <button
                  className={`tab px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === "all" ? "bg-primary-6000 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                  }`}
                  onClick={() => setActiveTab("all")}
                >
                  Tất cả
                </button>
                <button
                  className={`tab px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === "room" ? "bg-primary-6000 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                  }`}
                  onClick={() => setActiveTab("room")}
                >
                  Nhà trọ, phòng trọ
                </button>
                
              </div>

              <div className="search-form space-y-3">
                <Select 
                  value={selectedArea} 
                  onChange={(e) => setSelectedArea((e.target as HTMLSelectElement).value)}
                  className="w-full"
                >
                  <option value="">Chọn khu vực tìm trọ</option>
                  <option value="Thạch Hoà">Thạch Hoà</option>
                  <option value="Tân Xã">Tân Xã</option>
                  <option value="Bình Yên">Bình Yên</option>
                  <option value="Bắc Phú Cát">Bắc Phú Cát</option>
                </Select>

                <div className="grid grid-cols-2 gap-3">
                  <Select value={priceRange} onChange={(e) => setPriceRange((e.target as HTMLSelectElement).value)}>
                    <option value="">Mức giá</option>
                    <option value="0-2">Dưới 2 triệu</option>
                    <option value="2-3">2-3 triệu</option>
                    <option value="3-4">3-4 triệu</option>
                    <option value="4-6">4-6 triệu</option>
                    
                  </Select>
                  <Select value={area} onChange={(e) => setArea((e.target as HTMLSelectElement).value)}>
                    <option value="">Diện tích</option>
                    <option value="0-20">Dưới 20m²</option>
                    <option value="20-30">20-30m²</option>
                    <option value="30-50">30-50m²</option>
                    <option value="50+">Trên 50m²</option>
                  </Select>
                </div>

                <ButtonPrimary className="w-full" onClick={handleSearch}>Tìm kiếm</ButtonPrimary>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomHero;



