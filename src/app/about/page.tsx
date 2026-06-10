import rightImg from "@/images/travelhero2.jpg";
import React, { FC } from "react";
import SectionFounder from "./SectionFounder";
import SectionStatistic from "./SectionStatistic";
import SectionHero from "./SectionHero";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import BackgroundSection from "@/components/BackgroundSection";
import SectionClientSay from "@/components/SectionClientSay";

export interface PageAboutProps {}

const PageAbout: FC<PageAboutProps> = ({}) => {
  return (
    <div className={`nc-PageAbout overflow-hidden relative`}>
      {/* ======== BG GLASS ======== */}
      <BgGlassmorphism />

      <div className="container py-16 lg:py-28 space-y-16 lg:space-y-28">
        <SectionHero
          rightImg={rightImg}
          heading={
            <>
              Về <span className="text-primary-600">YoungHouse Hòa Lạc</span>
            </>
          }
          btnText="Đăng tin phòng trọ"
          subHeading="Nền tảng tìm phòng trọ quanh Hoà Lạc – tập trung vào thông tin rõ ràng, hình ảnh thật và trải nghiệm nhanh gọn cho sinh viên & người đi làm."
        />

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800">
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Sứ mệnh
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Giúp bạn <strong>tìm trọ phù hợp nhanh hơn</strong> quanh Hoà Lạc, giảm thời gian
              đi xem lan man bằng cách tổng hợp thông tin trọng yếu: giá, vị trí, diện tích,
              tiện nghi và khoảng cách tới trường.
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800">
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Cam kết
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Ưu tiên <strong>minh bạch</strong>: phòng còn trống, ảnh rõ, giá dễ hiểu. Tin đăng có
              thể bị ẩn nếu thiếu thông tin hoặc sai lệch – nhằm giữ chất lượng chung cho cộng đồng.
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800">
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Dành cho ai?
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Sinh viên các trường quanh Hoà Lạc (FPT, HVTC, …), người đi làm tại khu CNC Hoà Lạc
              và chủ trọ muốn đăng tin nhanh – quản lý phòng rõ ràng.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 md:p-10">
          <div className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Liên hệ & Hợp tác
          </div>
          <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Nếu bạn là chủ trọ muốn đăng tin hoặc cần hỗ trợ, hãy liên hệ với chúng tôi tại Zalo{" "}
            <a className="text-primary-600 hover:underline" href="https://zalo.me/0962888797">
              0962 888 797
            </a>
            .
          </div>
        </div>

        <SectionFounder />
        <div className="relative py-16">
          <BackgroundSection />
          <SectionClientSay />
        </div>

        <SectionStatistic />

      </div>
    </div>
  );
};

export default PageAbout;



