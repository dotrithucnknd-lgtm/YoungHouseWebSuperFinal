import React, { FC } from "react";
import {
  ShieldCheckIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";

const FEATURES = [
  {
    icon: ShieldCheckIcon,
    title: "An ninh & vận hành",
    description:
      "Khóa vân tay, camera, quy trình vận hành rõ ràng để bạn yên tâm.",
  },
  {
    icon: SparklesIcon,
    title: "Chất lượng dịch vụ",
    description:
      "Vận hành theo quy trình hệ thống, đảm bảo chất lượng dịch vụ cho khách hàng.",
  },
  {
    icon: BuildingOffice2Icon,
    title: "Nhiều cơ sở nhất Hoà Lạc",
    description:
      "Gồm 15 cơ sở phân bố tại Tân Xã, Phú Hữu, Bình Yên... thuận tiện di chuyển.",
  },
  {
    icon: ClockIcon,
    title: "Hỗ trợ nhanh",
    description:
      "Tư vấn và đặt lịch xem phòng nhanh chóng, hỗ trợ 24/7.",
  },
];

export interface SectionWhyChooseYoungHouseProps {
  className?: string;
}

const SectionWhyChooseYoungHouse: FC<SectionWhyChooseYoungHouseProps> = ({
  className = "",
}) => {
  return (
    <section
      className={`nc-SectionWhyChooseYoungHouse ${className}`}
      data-nc-id="SectionWhyChooseYoungHouse"
    >
      <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-14">
        <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
          Vì sao chọn YoungHouse?
        </h2>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400 text-base md:text-lg">
          Chúng tôi tập trung vào trải nghiệm ở ổn định, minh bạch và an tâm
          mỗi ngày.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {FEATURES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-6000">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 lg:mt-12 rounded-2xl bg-gradient-to-r from-primary-50 via-teal-50/80 to-emerald-50/60 dark:from-primary-900/20 dark:via-neutral-800 dark:to-neutral-800 border border-primary-100/80 dark:border-neutral-700 px-6 py-8 md:px-10 md:py-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-xl">
          <h3 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Sẵn sàng chọn phòng phù hợp?
          </h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm md:text-base">
            Lọc theo khu vực, mức giá và tình trạng phòng. Xem ảnh/video rõ
            ràng trước khi đặt lịch.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <ButtonPrimary href="/phong-tro" className="!rounded-xl">
            <span className="flex items-center justify-center gap-2">
              Tìm phòng ngay
              <ArrowRightIcon className="w-4 h-4" />
            </span>
          </ButtonPrimary>
          <ButtonSecondary
            href="/contact"
            className="!rounded-xl border-neutral-200 dark:border-neutral-600"
          >
            Liên hệ tư vấn
          </ButtonSecondary>
        </div>
      </div>
    </section>
  );
};

export default SectionWhyChooseYoungHouse;
