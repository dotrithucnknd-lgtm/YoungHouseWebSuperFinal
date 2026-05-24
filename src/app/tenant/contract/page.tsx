"use client";

import React from "react";
import { useTenant } from "../TenantContext";
import { DocumentTextIcon, CalendarIcon, KeyIcon } from "@heroicons/react/24/outline";

export default function TenantContractPage() {
  const { contract, loading } = useTenant();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-neutral-500 font-medium animate-pulse">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-primary-50 p-2.5 rounded-xl text-primary-6000 dark:bg-primary-950/30 dark:text-primary-400">
            <DocumentTextIcon className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Chi tiết hợp đồng thuê phòng</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Thông tin pháp lý và các cam kết giữa hai bên</p>
          </div>
        </div>

        {contract ? (
          <div className="space-y-8 border-t border-neutral-100 dark:border-neutral-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Mã hợp đồng</p>
                  <p className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
                    {contract.contract_code || `HD-${contract.id.slice(0, 8).toUpperCase()}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Thời hạn hợp đồng</p>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-1 flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                    Từ {new Date(contract.start_date).toLocaleDateString("vi-VN")} đến {new Date(contract.end_date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Tiền đặt cọc phòng</p>
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 flex items-center gap-1.5">
                    <KeyIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                    {contract.deposit_amount ? `${contract.deposit_amount.toLocaleString("vi-VN")} đ` : "0 đ"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Tiền thuê phòng cố định</p>
                  <p className="text-lg font-black text-primary-6000 dark:text-primary-400 mt-0.5">
                    {contract.rent_amount.toLocaleString("vi-VN")} đ / tháng
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Trạng thái pháp lý</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-1 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30">
                    Hợp đồng đang có hiệu lực
                  </span>
                </div>
              </div>
            </div>

            {/* Utility Unit Prices in Contract */}
            <div className="bg-neutral-50 dark:bg-neutral-950/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Bảng giá dịch vụ cố định trong hợp đồng</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500 font-medium">Đơn giá điện:</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {contract.electric_price ? `${contract.electric_price.toLocaleString("vi-VN")} đ / số (kWh)` : "Theo biểu giá nhà nước"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-t sm:border-t-0 sm:border-l border-neutral-200 dark:border-neutral-800 sm:pl-4 pt-2 sm:pt-0">
                  <span className="text-neutral-500 font-medium">Đơn giá nước:</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {contract.water_price ? `${contract.water_price.toLocaleString("vi-VN")} đ / khối (m³)` : "Theo biểu giá nhà nước"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contract File URL */}
            {contract.contract_url && (
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
                <a
                  href={contract.contract_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-primary-6000 hover:bg-primary-700 text-white text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-sm shadow-primary-6000/10"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Xem và tải bản PDF hợp đồng
                </a>
              </div>
            )}
          </div>
        ) : (
          <p className="text-neutral-400 italic py-4">Chưa có hợp đồng nào đang có hiệu lực cho phòng này.</p>
        )}
      </div>
    </div>
  );
}
