import React from "react";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import { Metadata } from "next";
import { YOUNGHOUSE_COMPANY } from "@/constants/companyInfo";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng - YoungHouse Hòa Lạc",
  description: "Điều khoản sử dụng dịch vụ và quy định dành cho người tìm trọ và chủ trọ tại hệ thống YoungHouse Hòa Lạc (hoalac.com).",
};

export default function TermPage() {
  return (
    <div className="nc-TermPage overflow-hidden relative min-h-screen">
      <BgGlassmorphism />
      
      <div className="container max-w-4xl py-16 lg:py-24 relative z-10">
        {/* Header Section */}
        <header className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 dark:bg-primary-950/30 px-3 py-1.5 rounded-full">
            Thỏa thuận & Pháp lý
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            Điều Khoản Sử Dụng
          </h1>
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            Cập nhật lần cuối: Ngày 28 tháng 1 năm 2026
          </p>
          <div className="mt-8 w-24 h-1 bg-gradient-to-r from-primary-500 to-indigo-500 mx-auto rounded-full"></div>
        </header>

        {/* Content Section */}
        <div className="bg-white/75 dark:bg-neutral-900/75 backdrop-blur-md border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl shadow-neutral-100/50 dark:shadow-none space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
          
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 text-sm font-semibold">1</span>
              Chấp thuận các điều khoản
            </h2>
            <p>
              Chào mừng bạn đến với <strong>YoungHouse Hòa Lạc</strong> (trohoalac.com). Bằng cách truy cập, đăng ký tài khoản, đăng tin hoặc sử dụng bất kỳ dịch vụ nào trên website của chúng tôi, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các điều khoản, điều kiện dưới đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng ngừng sử dụng website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 text-sm font-semibold">2</span>
              Quy định đối với Khách tìm phòng
            </h2>
            <p>
              Khi tìm kiếm phòng trọ hoặc liên hệ giao dịch trên nền tảng của chúng tôi, bạn cam kết:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cung cấp thông tin liên hệ chính xác khi trao đổi với chủ trọ hoặc đặt lịch xem phòng.</li>
              <li>Tự kiểm chứng thực tế tình trạng phòng trọ, chất lượng dịch vụ, hợp đồng và các khoản đặt cọc trực tiếp với chủ trọ trước khi thực hiện bất kỳ giao dịch tài chính nào.</li>
              <li>YoungHouse Hòa Lạc chỉ là nền tảng kết nối thông tin trung gian, chúng tôi không chịu trách nhiệm pháp lý cho các tranh chấp tài chính hoặc hợp đồng phát sinh giữa bạn và chủ nhà.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 text-sm font-semibold">3</span>
              Quy định đối với Chủ trọ đăng tin
            </h2>
            <p>
              Đối với người dùng đăng ký vai trò Chủ trọ để đăng tin cho thuê phòng trọ hoặc căn hộ quanh khu vực Hoà Lạc:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cam kết thông tin đăng tải (hình ảnh, giá cả, diện tích, khoảng cách, tiện ích, tình trạng phòng trống) là <strong>hoàn toàn chính xác, trung thực</strong> và là ảnh chụp thực tế.</li>
              <li>Tuyệt đối không đăng tải thông tin ảo, thông tin giật gân, hoặc sử dụng các hình ảnh sao chép trái phép của phòng trọ khác để mạo danh.</li>
              <li>Chủ động cập nhật trạng thái "Đã cho thuê" hoặc "Hết phòng" để tránh làm mất thời gian của người tìm kiếm.</li>
              <li>Chịu hoàn toàn trách nhiệm trước pháp luật về tính hợp pháp của phòng trọ cho thuê cũng như các hợp đồng giao dịch ký kết với khách thuê.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 text-sm font-semibold">4</span>
              Quyền hạn của Ban quản trị
            </h2>
            <p>
              Để duy trì chất lượng cộng đồng và tính minh bạch của dịch vụ, chúng tôi giữ quyền:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kiểm duyệt, chỉnh sửa định dạng hoặc ẩn/xóa không cần báo trước đối với bất kỳ tin đăng nào vi phạm quy chế (tin đăng thiếu thông tin cơ bản, ảnh minh họa mờ/ảo, sai thông tin giá cả thực tế).</li>
              <li>Khóa tài khoản tạm thời hoặc vĩnh viễn đối với các tài khoản chủ trọ bị người dùng báo cáo (report) lừa đảo, thái độ thiếu lịch sự hoặc đăng tin giả nhiều lần.</li>
              <li>Thay đổi, cập nhật giao diện, tính năng hoặc bảng giá dịch vụ (nếu có) trên hệ thống để phù hợp với nhu cầu phát triển.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 text-sm font-semibold">5</span>
              Giới hạn trách nhiệm pháp lý
            </h2>
            <p>
              YoungHouse Hòa Lạc nỗ lực tối đa để xác minh thông tin đăng tải, tuy nhiên chúng tôi không thể đảm bảo độ chính xác tuyệt đối 100% của mọi thông tin do người dùng tự đăng.
            </p>
            <p>
              Chúng tôi không chịu trách nhiệm cho bất kỳ tổn thất, thiệt hại trực tiếp hoặc gián tiếp nào (bao gồm mất mát tiền đặt cọc, tranh chấp hợp đồng thuê nhà, sự cố an ninh tại khu trọ) phát sinh từ việc bạn sử dụng các thông tin hoặc liên hệ từ website này.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 text-sm font-semibold">6</span>
              Liên hệ giải quyết khiếu nại
            </h2>
            <p>
              Mọi thắc mắc, tranh chấp hoặc báo cáo vi phạm liên quan đến hoạt động của website và các tin đăng, vui lòng gửi phản hồi cho chúng tôi để được hỗ trợ kịp thời:
            </p>
            <div className="p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2">
              <p>🏢 <strong>Đơn vị vận hành:</strong> {YOUNGHOUSE_COMPANY.name}</p>
              <p>📋 <strong>Mã số thuế:</strong> {YOUNGHOUSE_COMPANY.taxId}</p>
              <p>📍 <strong>Văn phòng:</strong> {YOUNGHOUSE_COMPANY.officeAddress}</p>
              <p>🌐 <strong>Website chính thức:</strong> <a href="https://trohoalac.com" className="text-primary-600 hover:underline">trohoalac.com</a></p>
              <p>💬 <strong>Kênh hỗ trợ trực tiếp Zalo:</strong> <a href={`https://zalo.me/${YOUNGHOUSE_COMPANY.phoneTel}`} className="text-primary-600 hover:underline">{YOUNGHOUSE_COMPANY.phone}</a></p>
              <p>📍 <strong>Hỗ trợ cộng đồng:</strong> Khu vực Đại học FPT Hoà Lạc, Đại học Quốc Gia, Hà Nội</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}



