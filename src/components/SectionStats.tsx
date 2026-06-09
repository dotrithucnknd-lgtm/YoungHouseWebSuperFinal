import React, { FC } from "react";
import {
  BuildingOffice2Icon,
  UserGroupIcon,
  StarIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

const STATS = [
  {
    icon: BuildingOffice2Icon,
    value: "14",
    label: "Cơ sở tại Hoà Lạc",
    color: "text-primary-500",
    bg: "bg-primary-50 dark:bg-primary-900/20",
  },
  {
    icon: UserGroupIcon,
    value: "570+",
    label: "Phòng trọ đang hoạt động",
    color: "text-secondary-500",
    bg: "bg-secondary-50 dark:bg-secondary-900/20",
  },
  {
    icon: CalendarDaysIcon,
    value: "5+",
    label: "Năm hoạt động",
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    icon: StarIcon,
    value: "4.8★",
    label: "Đánh giá trung bình",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
];

export interface SectionStatsProps {
  className?: string;
}

const SectionStats: FC<SectionStatsProps> = ({ className = "" }) => {
  return (
    <section className={`${className}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center text-center rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}
              >
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-3xl font-black ${stat.color}`}>
                {stat.value}
              </span>
              <span className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SectionStats;
