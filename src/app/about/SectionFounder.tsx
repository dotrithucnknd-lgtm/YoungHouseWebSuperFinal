import Heading from "@/shared/Heading";
import React from "react";

export interface People {
  id: string;
  name: string;
  job: string;
  icon: string;
  bgClass: string;
}

const FOUNDER_DEMO: People[] = [
  {
    id: "1",
    name: `YoungHouse Hòa Lạc`,
    job: "Đội vận hành & kiểm duyệt tin",
    icon: "🛠️",
    bgClass: "from-amber-200 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/30",
  },
  {
    id: "4",
    name: `Cộng đồng Hoà Lạc`,
    job: "Góp ý – báo tin – chia sẻ trải nghiệm",
    icon: "🤝",
    bgClass: "from-emerald-200 to-teal-200 dark:from-emerald-900/40 dark:to-teal-900/30",
  },
  {
    id: "3",
    name: `Chủ trọ uy tín`,
    job: "Cập nhật thông tin & phản hồi nhanh",
    icon: "🏠",
    bgClass: "from-sky-200 to-indigo-200 dark:from-sky-900/40 dark:to-indigo-900/30",
  },
  {
    id: "2",
    name: `Sinh viên & người đi làm`,
    job: "Tìm trọ – đặt lịch xem phòng – feedback",
    icon: "🎓",
    bgClass: "from-fuchsia-200 to-pink-200 dark:from-fuchsia-900/40 dark:to-pink-900/30",
  },
];

const SectionFounder = () => {
  return (
    <div className="nc-SectionFounder relative">
      <Heading
        desc="Một hệ sinh thái nhỏ nhưng đủ: chủ trọ – người thuê – cộng đồng – đội vận hành, cùng mục tiêu làm thông tin phòng trọ rõ ràng hơn."
      >
        🤝 Chúng tôi là ai?
      </Heading>
      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4 xl:gap-x-8">
        {FOUNDER_DEMO.map((item) => (
          <div key={item.id} className="max-w-sm">
            <div
              className={`h-32 rounded-2xl bg-gradient-to-br ${item.bgClass} flex items-center justify-center`}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/70 dark:bg-neutral-900/40 backdrop-blur flex items-center justify-center text-3xl shadow-sm">
                {item.icon}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-neutral-900 mt-4 md:text-xl dark:text-neutral-200">
              {item.name}
            </h3>
            <span className="block text-sm text-neutral-500 sm:text-base dark:text-neutral-400">
              {item.job}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionFounder;



