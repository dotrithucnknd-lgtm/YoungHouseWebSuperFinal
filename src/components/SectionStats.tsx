import React from "react";
import { CheckBadgeIcon, UserGroupIcon, HomeModernIcon } from "@heroicons/react/24/outline";

const STATS = [
  {
    id: "verified-rooms",
    count: "40+",
    label: "Phòng trọ xác thực",
    desc: "Tin đăng có hình ảnh thật, thông tin rõ ràng về giá, vị trí, khoảng cách và tiện nghi.",
    icon: HomeModernIcon,
    gradient: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-50/50 dark:bg-emerald-950/10",
    borderHover: "hover:border-emerald-500/30",
  },
  {
    id: "students-supported",
    count: "100+",
    label: "Sinh viên đã tìm trọ",
    desc: "Đồng hành cùng tân sinh viên và sinh viên các trường FPT, HVTC, Đại học Quốc Gia Hà Nội.",
    icon: UserGroupIcon,
    gradient: "from-blue-500 to-indigo-500",
    bgLight: "bg-blue-50/50 dark:bg-blue-950/10",
    borderHover: "hover:border-blue-500/30",
  },
  {
    id: "landlords-connected",
    count: "40+",
    label: "Chủ trọ tin dùng",
    desc: "Nền tảng hỗ trợ đăng tin nhanh, tinh gọn quy trình vận hành và tiếp cận khách hàng nhanh chóng.",
    icon: CheckBadgeIcon,
    gradient: "from-orange-500 to-amber-500",
    bgLight: "bg-orange-50/50 dark:bg-orange-950/10",
    borderHover: "hover:border-orange-500/30",
  },
];

export default function SectionStats() {
  return (
    <div className="nc-SectionStats py-16 relative">
      {/* Background Accent Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-200/20 dark:bg-primary-950/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="container max-w-5xl">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-full">
            Bảo chứng niềm tin
          </span>
          <h2 className="mt-4 text-3xl font-black text-neutral-900 dark:text-white tracking-tight sm:text-4xl">
            YoungHouse Hòa Lạc Bằng Những Con Số
          </h2>
          <p className="mt-3 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
            Hành trình số hóa trải nghiệm thuê phòng và mang lại sự an tâm tuyệt đối cho cộng đồng sinh viên tại Hoà Lạc.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className={`relative flex flex-col p-8 rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/60 shadow-xl shadow-neutral-100/30 dark:shadow-none transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl cursor-default group ${stat.borderHover}`}
              >
                {/* Icon Wrapper */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-neutral-700 dark:text-neutral-300 group-hover:scale-110 transition-transform duration-300 ${stat.bgLight}`}>
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>

                {/* Big Gradient Number */}
                <h3 className={`text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${stat.gradient}`}>
                  {stat.count}
                </h3>

                {/* Label */}
                <p className="mt-2 text-base sm:text-lg font-bold text-neutral-850 dark:text-neutral-100">
                  {stat.label}
                </p>

                {/* Description */}
                <p className="mt-3 text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}



