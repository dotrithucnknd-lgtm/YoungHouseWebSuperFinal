"use client";

import React, { FC, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logoImg from "@/images/logo_trohoalac.png";

export interface SectionHero2Props {
  className?: string;
  children?: React.ReactNode;
}

const SectionHero2: FC<SectionHero2Props> = ({ className = "", children }) => {
  const router = useRouter();
  const [district, setDistrict] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [status, setStatus] = useState("available");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (district) {
      params.set("district", district);
    }
    if (priceRange) {
      if (priceRange.includes("-")) {
        const [min, max] = priceRange.split("-");
        params.set("minPrice", min);
        params.set("maxPrice", max);
      } else {
        params.set("minPrice", priceRange);
      }
    }
    router.push(`/phong-tro?${params.toString()}`);
  };

  return (
    <div className={`nc-SectionHero2 relative flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12 py-10 sm:py-16 lg:py-20 ${className}`}>

      {/* Premium Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-sky-200/50 dark:bg-sky-900/10 rounded-full filter blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[350px] h-[350px] bg-pink-100/40 dark:bg-pink-900/10 rounded-full filter blur-[90px] -z-10 pointer-events-none"></div>

      {/* Left Content Column (Expanded to 60% for a spacious layout) */}
      <div className="w-full lg:w-[60%] flex-shrink-0 space-y-6 sm:space-y-8">

        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/40 dark:border-blue-800/30 shadow-sm">
          <span>YoungHouse Hoà Lạc</span>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl xl:text-[54px] font-extrabold text-slate-900 dark:text-white leading-[1.2] tracking-tight">
            Hơn cả mái nhà – <br /> đó là <span className="text-[#1E6DEB] dark:text-blue-400">mái ấm.</span>
          </h2>
          <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed max-w-xl">
            Hệ thống nhà trọ tiện nghi, an ninh, vận hành chuyên nghiệp tại Hoà Lạc. Tìm phòng nhanh, xem ảnh/video rõ ràng và đặt lịch xem phòng chỉ trong vài phút.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push("/phong-tro")}
            className="bg-[#1E6DEB] hover:bg-blue-750 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center text-sm sm:text-base"
          >
            Tìm phòng ngay
          </button>
          <button
            onClick={() => router.push("/about")}
            className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm text-sm sm:text-base"
          >
            Về chúng tôi
          </button>
        </div>

        {/* Mini Badges */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 border border-blue-100 dark:border-neutral-800 rounded-full text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 bg-blue-50/40 dark:bg-neutral-800/40 hover:bg-blue-50 dark:hover:bg-neutral-800 transition-colors shadow-sm">
            <i className="las la-shield-alt text-base text-[#1E6DEB]"></i>
            <span>An ninh & vận hành</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border border-blue-100 dark:border-neutral-800 rounded-full text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 bg-blue-50/40 dark:bg-neutral-800/40 hover:bg-blue-50 dark:hover:bg-neutral-800 transition-colors shadow-sm">
            <i className="las la-building text-base text-[#1E6DEB]"></i>
            <span>Nhiều cơ sở nhất Hoà Lạc</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border border-blue-100 dark:border-neutral-800 rounded-full text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 bg-blue-50/40 dark:bg-neutral-800/40 hover:bg-blue-50 dark:hover:bg-neutral-800 transition-colors shadow-sm">
            <i className="las la-headset text-base text-[#1E6DEB]"></i>
            <span>Hỗ trợ 24/7</span>
          </div>
        </div>

        {/* Form Container (Robust flexbox layout to prevent truncation) */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl dark:shadow-2xl border border-slate-200/80 dark:border-neutral-800 p-3 sm:p-4 w-full flex flex-col md:flex-row md:items-center gap-4 md:gap-0">

          {/* Section 1: Area */}
          <div className="flex-1 min-w-[140px] flex flex-col px-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-neutral-800 pb-3 md:pb-0">
            <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
              Khu vực
            </span>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-transparent border-0 p-0 pr-8 text-sm sm:text-base font-bold text-neutral-850 dark:text-neutral-100 focus:ring-0 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231e6deb%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat"
            >
              <option value="" className="dark:bg-neutral-900">Tất cả khu vực</option>
              <option value="Tân Xã" className="dark:bg-neutral-900">Tân Xã</option>
              <option value="Thạch Hoà" className="dark:bg-neutral-900">Thạch Hoà</option>
              <option value="Bình Yên" className="dark:bg-neutral-900">Bình Yên</option>
            </select>
          </div>

          {/* Section 2: Price */}
          <div className="flex-1 min-w-[150px] flex flex-col px-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-neutral-800 pb-3 md:pb-0">
            <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
              Khoảng giá
            </span>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full bg-transparent border-0 p-0 pr-8 text-sm sm:text-base font-bold text-neutral-850 dark:text-neutral-100 focus:ring-0 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231e6deb%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat"
            >
              <option value="" className="dark:bg-neutral-900">Tất cả mức giá</option>
              <option value="0-1000000" className="dark:bg-neutral-900">Dưới 1 triệu</option>
              <option value="1000000-2000000" className="dark:bg-neutral-900">1 - 2 triệu</option>
              <option value="2000000-3000000" className="dark:bg-neutral-900">2 - 3 triệu</option>
              <option value="3000000-4000000" className="dark:bg-neutral-900">3 - 4 triệu</option>
              <option value="4000000-5000000" className="dark:bg-neutral-900">4 - 5 triệu</option>
              <option value="5000000-6000000" className="dark:bg-neutral-900">5 - 6 triệu</option>
              <option value="6000000" className="dark:bg-neutral-900">Trên 6 triệu</option>
            </select>
          </div>

          {/* Section 3: Status */}
          <div className="flex-1 min-w-[120px] flex flex-col px-4 pb-3 md:pb-0">
            <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
              Trạng thái
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-transparent border-0 p-0 pr-8 text-sm sm:text-base font-bold text-neutral-850 dark:text-neutral-100 focus:ring-0 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231e6deb%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat"
            >
              <option value="available" className="dark:bg-neutral-900">Có sẵn</option>
              <option value="" className="dark:bg-neutral-900">Tất cả</option>
            </select>
          </div>

          {/* Section 4: Search Button */}
          <div className="px-4 flex-shrink-0 md:w-auto w-full">
            <button
              onClick={handleSearch}
              className="w-full md:w-auto bg-[#1E6DEB] hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <i className="las la-search text-lg"></i>
              <span>Tìm kiếm</span>
            </button>
          </div>

        </div>
      </div>

      {/* Right Column: Illustration Card (35% width, vibrant color palette) */}
      <div className="w-full lg:w-[35%] flex-shrink-0 flex items-center justify-center p-2">
        <div className="relative w-full aspect-[4/3] sm:aspect-[1.5] lg:aspect-[4/3] xl:aspect-[1.3] bg-gradient-to-tr from-blue-100 via-sky-50 to-indigo-100 dark:from-neutral-800 dark:to-neutral-900 rounded-[2.5rem] border border-blue-100/50 dark:border-neutral-800 shadow-md flex items-center justify-center overflow-hidden">

          {/* Soft Colored Inner Decor Rings */}
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-pink-200/40 dark:bg-pink-900/10 rounded-full filter blur-2xl opacity-75 pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-cyan-200/40 dark:bg-cyan-900/10 rounded-full filter blur-2xl opacity-75 pointer-events-none"></div>

          {/* Logo Showcase */}
          <div className="relative w-3/4 h-3/4 transition-all duration-500 hover:scale-[1.03] select-none flex items-center justify-center">
            <Image
              src={logoImg}
              alt="YoungHouse Logo"
              className="object-contain filter drop-shadow-md"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>

        </div>
      </div>

    </div>
  );
};

export default SectionHero2;
