"use client";

import React, { FC, useState } from "react";
import { ChevronDownIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "branches",
    question: "Young House có những chi nhánh nào và ở đâu?",
    answer:
      "Young House có 15 cơ sở tại khu vực Hoà Lạc, phân bố tại Tân Xã, Phú Hữu, Bình Yên, Thạch Hoà và các khu lân cận. Bạn có thể xem bản đồ và lọc theo khu vực trên trang Tìm phòng trọ.",
  },
  {
    id: "price",
    question: "Giá phòng trọ Young House là bao nhiêu?",
    answer:
      "Giá phòng dao động theo loại phòng, diện tích và cơ sở, thường từ 1,5–3,5 triệu/tháng. Mỗi tin đăng hiển thị giá rõ ràng; bạn có thể lọc theo mức giá phù hợp ngân sách.",
  },
  {
    id: "amenities",
    question: "Phòng trọ Young House có những tiện ích gì?",
    answer:
      "Tùy cơ sở, phòng có thể có điều hòa, nóng lạnh, wifi, giường/tủ, khu bếp chung, giặt sấy, camera an ninh, khóa vân tay và khu vực để xe.",
  },
  {
    id: "fees",
    question: "Phí dịch vụ và tiền điện tính như thế nào?",
    answer:
      "Phí dịch vụ (wifi, rác, nước sinh hoạt cơ bản...) và tiền điện được thông báo rõ trong hợp đồng hoặc bảng giá từng cơ sở. Điện thường tính theo đồng hồ hoặc mức cố định/tháng tùy phòng.",
  },
  {
    id: "booking",
    question: "Làm thế nào để đặt lịch xem phòng?",
    answer:
      "Chọn phòng trên website, bấm đặt lịch xem phòng (hoặc liên hệ Zalo/điện thoại trên trang chi tiết). Đội ngũ sẽ xác nhận thời gian xem phòng với bạn.",
  },
  {
    id: "promo",
    question: "Young House có chính sách ưu đãi gì cho khách hàng mới?",
    answer:
      "Ưu đãi thay đổi theo thời điểm và từng cơ sở (giảm cọc, tặng tháng đầu...). Liên hệ tư vấn hoặc theo dõi fanpage/Zalo để cập nhật chương trình mới nhất.",
  },
  {
    id: "security",
    question: "Phòng trọ có an ninh không?",
    answer:
      "Các cơ sở Young House ưu tiên an ninh: camera khu vực chung, khóa phòng, quy định ra vào rõ ràng. Chi tiết từng cơ sở được mô tả trên trang chi tiết phòng.",
  },
  {
    id: "cooking",
    question: "Có thể nấu ăn trong phòng không?",
    answer:
      "Một số phòng cho phép nấu ăn nhẹ hoặc có bếp riêng; nhiều cơ sở có khu bếp chung. Vui lòng xem mô tả tiện ích hoặc hỏi chủ phòng khi đặt lịch xem.",
  },
  {
    id: "contract",
    question: "Hợp đồng thuê phòng tối thiểu bao lâu?",
    answer:
      "Thời hạn thuê tối thiểu thường từ 3–6 tháng tùy cơ sở và loại phòng. Điều khoản cụ thể được thỏa thuận khi ký hợp đồng với chủ phòng.",
  },
  {
    id: "fpt-distance",
    question: "Khoảng cách từ Young House đến trường FPT là bao xa?",
    answer:
      "Tùy cơ sở, khoảng cách đến FPT University Hoà Lạc khoảng 5–15 phút xe máy. Trang chi tiết phòng và mục địa điểm lân cận giúp bạn ước lượng quãng đường cụ thể.",
  },
];

export interface SectionHomeFAQProps {
  className?: string;
}

const SectionHomeFAQ: FC<SectionHomeFAQProps> = ({ className = "" }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      className={`nc-SectionHomeFAQ rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 px-5 py-10 md:px-10 md:py-14 ${className}`}
      data-nc-id="SectionHomeFAQ"
    >
      <div className="flex items-center justify-center gap-2 mb-10">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-6000 text-white">
          <QuestionMarkCircleIcon className="w-5 h-5" />
        </span>
        <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 text-center">
          Câu hỏi thường gặp về Young House
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-neutral-800 dark:text-neutral-200 text-sm md:text-base">
                  {item.question}
                </span>
                <ChevronDownIcon
                  className={`w-5 h-5 shrink-0 text-neutral-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 -mt-1 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SectionHomeFAQ;
