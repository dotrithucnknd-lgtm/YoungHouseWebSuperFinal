import React from "react";
import Link from "next/link";
import BgGlassmorphism from "@/components/BgGlassmorphism";

export default function TuyenDungPage() {
  return (
    <div className="nc-PageTuyenDung overflow-hidden relative min-h-[70vh] flex items-center justify-center py-16 lg:py-24">
      {/* GLASSMORPHISM BACKGROUND */}
      <BgGlassmorphism />

      <div className="container max-w-4xl px-4 mx-auto text-center relative z-10 space-y-10">
        
        {/* Decorative Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-50 dark:bg-primary-900/30 text-primary-500 shadow-sm mb-2 animate-bounce">
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Title & Badge */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-secondary-100 text-secondary-800 dark:bg-secondary-900/40 dark:text-secondary-300">
            Coming Soon 🚀
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase text-neutral-900 dark:text-white leading-tight">
            GIA NHẬP ĐỘI NGŨ <br className="hidden sm:inline" />
            <span className="text-primary-500">YOUNGHOUSE HÒA LẠC</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Hệ thống quản lý, vận hành nhà trọ và căn hộ dịch vụ hàng đầu tại Hòa Lạc đang chuẩn bị ra mắt cổng thông tin tuyển dụng chính thức. Chúng tôi luôn chào đón những mảnh ghép tài năng đồng hành cùng phát triển!
          </p>
        </div>

        {/* Position Preview Cards */}
        <div className="grid sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto pt-6">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-100 dark:border-neutral-800 shadow-sm backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white mb-2 text-base">
              Vận Hành & Cơ Sở
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Quản lý tòa nhà, giám sát kỹ thuật, đảm bảo không gian sống an toàn và tốt nhất cho cư dân.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-100 dark:border-neutral-800 shadow-sm backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/30 text-pink-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white mb-2 text-base">
              Tư Vấn Khách Hàng
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Đồng hành, lắng nghe và kết nối sinh viên & khách hàng với những căn phòng trọ mơ ước phù hợp nhất.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-100 dark:border-neutral-800 shadow-sm backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white mb-2 text-base">
              Marketing & Phát Triển
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Lên ý tưởng, lan tỏa thông điệp thương hiệu và mở rộng cơ sở hạ tầng nhà trọ thông minh tại Hòa Lạc.
            </p>
          </div>

        </div>

        {/* Action Button & Contact Info */}
        <div className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="bg-primary-500 hover:bg-primary-650 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 text-sm sm:text-base"
            >
              <span>Quay lại trang chủ</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </Link>
            <a
              href="mailto:hr@younghouse.vn"
              className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 font-semibold px-8 py-3.5 rounded-xl transition-all shadow-sm text-sm sm:text-base inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Nộp hồ sơ ứng tuyển sớm</span>
            </a>
          </div>

          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            * Mọi thắc mắc hoặc thông tin ứng tuyển sớm, vui lòng gửi CV qua email: <span className="font-semibold text-primary-500">hr@younghouse.vn</span>
          </p>
        </div>

      </div>
    </div>
  );
}
