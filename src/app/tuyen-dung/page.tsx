import React from "react";
import Image from "next/image";
import Link from "next/link";
import BgGlassmorphism from "@/components/BgGlassmorphism";

const POSITIONS = [
  {
    title: "Nhân Viên Vận Hành & Kỹ Thuật",
    color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
    requirements: [
      "Có kinh nghiệm vận hành tòa nhà, nhà trọ",
      "Xử lý sự cố điện, nước, cơ sở hạ tầng",
      "Có thể làm việc theo ca",
    ],
  },
  {
    title: "Chuyên Viên Tư Vấn Khách Hàng",
    color: "bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
    dot: "bg-pink-500",
    requirements: [
      "Kỹ năng giao tiếp tốt, nhiệt tình, chăm chỉ",
      "Tư vấn, hỗ trợ sinh viên & khách tìm phòng",
      "Ưu tiên biết sử dụng Zalo OA, Facebook",
    ],
  },
  {
    title: "Nhân Viên Marketing & Content",
    color: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500",
    requirements: [
      "Sáng tạo nội dung mạng xã hội (TikTok, FB)",
      "Chụp ảnh, quay video phòng trọ thực tế",
      "Ưu tiên có kinh nghiệm thực chiến",
    ],
  },
];

const BENEFITS = [
  { icon: "💰", label: "Thu nhập hấp dẫn + thưởng hiệu quả" },
  { icon: "📍", label: "Làm việc tại Hòa Lạc, Hà Nội" },
  { icon: "🚀", label: "Môi trường trẻ, năng động, học hỏi nhiều" },
  { icon: "🎯", label: "Được đào tạo bài bản từ đội ngũ dày dạn kinh nghiệm" },
];

export default function TuyenDungPage() {
  return (
    <div className="nc-PageTuyenDung overflow-hidden relative py-12 lg:py-20">
      <BgGlassmorphism />

      <div className="container max-w-6xl px-4 mx-auto relative z-10">

        {/* ===== HERO SECTION: Left image – Right info ===== */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 mb-16">

          {/* LEFT – Avatar */}
          <div className="w-full lg:w-5/12 flex justify-center lg:justify-end flex-shrink-0">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              <Image
                src="/images/tuyen-dung-avatar-nobg.png"
                alt="Founder YoungHouse"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* RIGHT – Recruitment Info */}
          <div className="w-full lg:w-7/12 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              Đang tuyển dụng
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-white leading-tight">
              Gia nhập đội ngũ{" "}
              <span className="text-primary-500">YoungHouse Hòa Lạc</span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Chúng tôi là hệ thống quản lý nhà trọ &amp; căn hộ dịch vụ hàng đầu
              khu vực Hòa Lạc. Nếu bạn muốn làm việc trong môi trường{" "}
              <strong className="text-neutral-800 dark:text-white">trẻ, năng động</strong>{" "}
              và có cơ hội phát triển thực sự — đây là nơi dành cho bạn!
            </p>

            {/* Benefits */}
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
              {BENEFITS.map((b, i) => (
                <li key={i} className="flex items-center gap-2 justify-center lg:justify-start">
                  <span className="text-lg">{b.icon}</span>
                  <span>{b.label}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
              <a
                href="https://zalo.me/0372858098"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-7 py-3 rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Liên hệ qua Zalo
              </a>
              <a
                href="mailto:hr@younghouse.vn"
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold px-7 py-3 rounded-xl transition-all inline-flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Gửi CV qua Email
              </a>
            </div>
          </div>
        </div>

        {/* ===== POSITIONS SECTION ===== */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
              Vị trí đang tuyển
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Chúng tôi chào đón ứng viên ở mọi cấp độ kinh nghiệm
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {POSITIONS.map((pos, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-100 dark:border-neutral-800 shadow-sm backdrop-blur-sm space-y-4"
              >
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${pos.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${pos.dot}`} />
                  Đang tuyển
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-white text-base leading-snug">
                  {pos.title}
                </h3>
                <ul className="space-y-1.5">
                  {pos.requirements.map((req, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <svg className="w-3.5 h-3.5 mt-0.5 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ===== FOOTER CTA ===== */}
        <div className="mt-12 text-center space-y-3">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Ứng tuyển ngay hôm nay — gửi CV tới{" "}
            <a href="mailto:hr@younghouse.vn" className="text-primary-500 font-semibold hover:underline">
              hr@younghouse.vn
            </a>{" "}
            hoặc nhắn Zalo{" "}
            <a href="https://zalo.me/0372858098" className="text-primary-500 font-semibold hover:underline" target="_blank" rel="noopener noreferrer">
              0372 858 098
            </a>
          </p>
          <Link href="/" className="text-xs text-neutral-400 hover:text-primary-500 transition-colors">
            ← Quay lại trang chủ
          </Link>
        </div>

      </div>
    </div>
  );
}
