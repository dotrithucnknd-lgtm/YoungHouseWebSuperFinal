"use client";

import React, { useState } from "react";

const PARTNERS = [
  { name: "YoungHouse Hoà Lạc", desc: "Hệ thống chung cư mini", logo: "/images/partners/younghouse.png" },
  { name: "SkyHome Hoà Lạc", desc: "Căn hộ dịch vụ cao cấp", logo: "/images/partners/skyhome.png" },
  { name: "Hoà Lạc Apartment", desc: "Phòng trọ sinh viên tiện nghi", logo: "/images/partners/apartment.png" },
  { name: "V Village", desc: "Homestay & Phòng trọ cao cấp", logo: "/images/partners/vvillage.png" },
];

const PartnerCard = ({ partner }: { partner: typeof PARTNERS[0] }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/60 shadow-sm hover:shadow-md hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all duration-300 transform hover:-translate-y-0.5 group min-w-[260px] cursor-pointer">
      {/* Brand Logo / Fallback Letter */}
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-neutral-900 dark:to-neutral-900 flex items-center justify-center font-black text-primary-600 dark:text-primary-400 border border-primary-100/50 dark:border-neutral-800 group-hover:from-primary-500 group-hover:to-indigo-500 group-hover:text-white transition-all duration-300 relative flex-shrink-0">
        {partner.logo && !imageError ? (
          <img
            src={partner.logo}
            alt={partner.name}
            className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="group-hover:text-white transition-colors">{partner.name.charAt(0)}</span>
        )}
      </div>
      <div className="text-left">
        <p className="font-bold text-neutral-800 dark:text-neutral-200 text-sm sm:text-base group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {partner.name}
        </p>
        <p className="text-xxs sm:text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 font-medium">
          {partner.desc}
        </p>
      </div>
    </div>
  );
};

export default function SectionPartners() {
  // Duplicate list to create seamless infinite scrolling effect
  const marqueeItems = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <div className="nc-SectionPartners py-16 border-t border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/10 overflow-hidden relative w-full">
      <div className="container text-center mb-10 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 dark:bg-primary-950/30 px-3 py-1.5 rounded-full">
          Hệ sinh thái uy tín
        </span>
        <h2 className="mt-4 text-3xl font-black text-neutral-900 dark:text-white tracking-tight sm:text-4xl">
          Đơn vị đồng hành cùng Trọ Hoà Lạc
        </h2>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
          Liên kết chặt chẽ cùng các đơn vị quản lý, vận hành và phát triển nhà ở chất lượng cao quanh khu công nghệ cao Hoà Lạc.
        </p>
      </div>

      {/* Marquee Wrapper */}
      <div className="relative flex overflow-x-hidden w-full select-none mask-gradient">
        {/* Left & Right subtle blurs for seamless aesthetics */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-neutral-950 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent z-10 pointer-events-none"></div>

        {/* Marquee Track */}
        <div className="animate-scroll-marquee flex items-center gap-6 py-4">
          {marqueeItems.map((partner, index) => (
            <PartnerCard key={index} partner={partner} />
          ))}
        </div>
      </div>
    </div>
  );
}
