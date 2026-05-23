import React from "react";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách bảo mật - Trọ Hoà Lạc",
  description: "Chính sách bảo mật thông tin cá nhân và quyền riêng tư của người dùng tại hệ thống Trọ Hoà Lạc (hoalac.com).",
};

export default function PrivacyPage() {
  return (
    <div className="nc-PrivacyPage overflow-hidden relative min-h-screen">
      <BgGlassmorphism />
      
      <div className="container max-w-4xl py-16 lg:py-24 relative z-10">
        {/* Header Section */}
        <header className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 dark:bg-primary-950/30 px-3 py-1.5 rounded-full">
            SEO & Bảo mật
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            Chính Sách Bảo Mật
          </h1>
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            Cập nhật lần cuối: Ngày 1 tháng 2 năm 2026
          </p>
          <div className="mt-8 w-24 h-1 bg-gradient-to-r from-primary-500 to-indigo-500 mx-auto rounded-full"></div>
        </header>

        {/* Content Section */}
        <div className="bg-white/75 dark:bg-neutral-900/75 backdrop-blur-md border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl shadow-neutral-100/50 dark:shadow-none space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
          
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 text-sm font-semibold">1</span>
              Thu thập thông tin cá nhân
            </h2>
            <p>
              Chúng tôi thu thập thông tin để cung cấp dịch vụ tốt hơn cho tất cả người dùng. Các thông tin được thu thập bao gồm:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Thông tin bạn cung cấp:</strong> Khi bạn đăng ký tài khoản (chủ trọ hoặc khách thuê), đăng tin phòng trọ, điền form liên hệ hoặc bình luận. Thông tin này có thể gồm họ tên, số điện thoại, email, mật khẩu mã hóa và hình ảnh/giấy tờ xác minh chủ sở hữu (đối với chủ trọ).</li>
              <li><strong>Thông tin từ việc sử dụng dịch vụ:</strong> Chúng tôi thu thập thông tin về cách bạn tương tác với các tin đăng, vị trí địa lý (nếu bạn cho phép), thông tin trình duyệt, hệ điều hành và địa chỉ IP.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 text-sm font-semibold">2</span>
              Cách thức sử dụng thông tin
            </h2>
            <p>
              Mọi thông tin cá nhân thu thập được sẽ chỉ được sử dụng cho các mục đích hợp pháp sau:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cung cấp, duy trì, cải tiến và cá nhân hóa trải nghiệm tìm kiếm trọ quanh khu vực Hoà Lạc.</li>
              <li>Kết nối liên lạc giữa khách thuê trọ và chủ trọ thông qua số điện thoại hoặc Zalo hiển thị trên tin đăng.</li>
              <li>Gửi thông báo hệ thống, cập nhật trạng thái tin đăng hoặc hỗ trợ kỹ thuật khi được yêu cầu.</li>
              <li>Ngăn chặn và phát hiện các hành vi lừa đảo, giả mạo thông tin phòng trọ nhằm bảo vệ sự an toàn của cộng đồng.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 text-sm font-semibold">3</span>
              Bảo mật và Lưu trữ dữ liệu
            </h2>
            <p>
              Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân của bạn:
            </p>
            <p>
              Hệ thống sử dụng các biện pháp mã hóa tiên tiến (như SSL/TLS) và lưu trữ dữ liệu an toàn thông qua nền tảng Supabase. Mật khẩu của bạn được băm (hash) bằng thuật toán bảo mật cao trước khi lưu vào cơ sở dữ liệu.
            </p>
            <p>
              Dữ liệu cá nhân sẽ được lưu trữ cho đến khi bạn có yêu cầu xóa tài khoản hoặc tự tay gỡ bỏ các tin đăng của mình khỏi hệ thống.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 text-sm font-semibold">4</span>
              Chia sẻ thông tin với bên thứ ba
            </h2>
            <p>
              Chúng tôi <strong>không bán, trao đổi hoặc cho thuê</strong> thông tin cá nhân của người dùng cho bất kỳ bên thứ ba nào vì mục đích thương mại. Thông tin chỉ được chia sẻ trong các trường hợp:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bạn chủ động công khai thông tin liên lạc (Họ tên, SĐT, Zalo) trên các tin đăng phòng trọ của mình để người thuê liên hệ.</li>
              <li>Khi có yêu cầu bằng văn bản chính thức của cơ quan pháp luật có thẩm quyền phục vụ công tác điều tra.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 text-sm font-semibold">5</span>
              Quyền hạn của người dùng
            </h2>
            <p>
              Bạn có toàn quyền kiểm soát thông tin cá nhân của mình, bao gồm:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Truy cập, cập nhật hoặc sửa đổi thông tin tài khoản và tin đăng bất cứ lúc nào trong trang quản trị cá nhân.</li>
              <li>Yêu cầu tạm ẩn hoặc xóa vĩnh viễn tin đăng phòng trọ.</li>
              <li>Yêu cầu xóa toàn bộ thông tin tài khoản liên kết bằng cách liên hệ trực tiếp với Ban quản trị.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 text-sm font-semibold">6</span>
              Liên hệ với chúng tôi
            </h2>
            <p>
              Nếu bạn có bất kỳ câu hỏi, khiếu nại hoặc đóng góp ý kiến nào liên quan đến Chính sách bảo mật này, xin vui lòng liên hệ với chúng tôi:
            </p>
            <div className="p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2">
              <p>🌐 <strong>Website:</strong> <a href="https://trohoalac.com" className="text-primary-600 hover:underline">trohoalac.com</a></p>
              <p>💬 <strong>Hỗ trợ qua Zalo:</strong> <a href="https://zalo.me/0372858098" className="text-primary-600 hover:underline">0372858098</a></p>
              <p>🏠 <strong>Khu vực hoạt động:</strong> Khu công nghệ cao Hoà Lạc, Thạch Thất, Hà Nội</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
