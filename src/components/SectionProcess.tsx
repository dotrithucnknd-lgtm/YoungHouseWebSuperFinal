import React, { FC } from "react";
import { MagnifyingGlassIcon, CalendarDaysIcon, DocumentCheckIcon } from "@heroicons/react/24/outline";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

const STEPS = [
  {
    step: "01",
    icon: MagnifyingGlassIcon,
    title: "Tìm phòng phù hợp",
    description:
      "Lọc theo khu vực, mức giá và diện tích. Xem ảnh thực tế và video từng phòng trước khi quyết định.",
    color: "from-primary-400 to-primary-600",
    bg: "bg-primary-50 dark:bg-primary-900/20",
    iconColor: "text-primary-500",
  },
  {
    step: "02",
    icon: CalendarDaysIcon,
    title: "Đặt lịch xem phòng",
    description:
      "Chọn thời gian phù hợp, đội ngũ YoungHouse sẽ đón tiếp và dẫn xem phòng tận nơi tại Hoà Lạc.",
    color: "from-secondary-400 to-secondary-600",
    bg: "bg-secondary-50 dark:bg-secondary-900/20",
    iconColor: "text-secondary-500",
  },
  {
    step: "03",
    icon: DocumentCheckIcon,
    title: "Ký hợp đồng & dọn vào",
    description:
      "Hợp đồng rõ ràng, minh bạch. Nhận phòng ngay và tận hưởng không gian sống tiện nghi của YoungHouse.",
    color: "from-teal-400 to-teal-600",
    bg: "bg-teal-50 dark:bg-teal-900/20",
    iconColor: "text-teal-500",
  },
];

export interface SectionProcessProps {
  className?: string;
}

const SectionProcess: FC<SectionProcessProps> = ({ className = "" }) => {
  return (
    <section className={`${className}`}>
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary-500 mb-3">
          Quy trình thuê phòng
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          Chỉ 3 bước đơn giản
        </h2>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400 text-base">
          Từ tìm kiếm đến dọn vào phòng, YoungHouse hỗ trợ bạn từng bước.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
        {/* Connector line (desktop only) */}
        <div className="hidden md:block absolute top-12 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-0.5 bg-gradient-to-r from-primary-200 via-secondary-200 to-teal-200 dark:from-primary-800 dark:via-secondary-800 dark:to-teal-800 z-0" />

        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="relative z-10 flex flex-col items-center text-center">
              {/* Number badge */}
              <div className={`relative w-24 h-24 rounded-2xl ${step.bg} flex items-center justify-center mb-5 shadow-sm`}>
                <Icon className={`w-10 h-10 ${step.iconColor}`} />
                <span
                  className={`absolute -top-3 -right-3 w-7 h-7 rounded-full bg-gradient-to-br ${step.color} text-white text-xs font-black flex items-center justify-center shadow-md`}
                >
                  {step.step}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-12 flex justify-center">
        <ButtonPrimary href="/phong-tro" className="!rounded-xl px-8">
          <span className="flex items-center gap-2">
            Bắt đầu tìm phòng
            <ArrowRightIcon className="w-4 h-4" />
          </span>
        </ButtonPrimary>
      </div>
    </section>
  );
};

export default SectionProcess;
