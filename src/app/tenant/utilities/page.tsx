"use client";

import React from "react";
import { useTenant } from "../TenantContext";
import { BoltIcon } from "@heroicons/react/24/outline";

export default function TenantUtilitiesPage() {
  const { invoices, loading } = useTenant();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-neutral-500 font-medium animate-pulse">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-primary-50 p-2.5 rounded-xl text-primary-6000 dark:bg-primary-950/30 dark:text-primary-400">
            <BoltIcon className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Chỉ số điện nước tiêu thụ</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Theo dõi chi tiết số công tơ điện nước được chốt hàng tháng</p>
          </div>
        </div>

        {invoices.length > 0 ? (
          <div className="space-y-6">
            {invoices.map((inv) => {
              const elec = inv.invoice_items?.find((it: any) =>
                it.services?.name?.toLowerCase().includes("điện") || it.services?.unit?.toLowerCase().includes("kwh")
              );
              const water = inv.invoice_items?.find((it: any) =>
                it.services?.name?.toLowerCase().includes("nước") || it.services?.unit?.toLowerCase().includes("m3")
              );
              
              return (
                <div key={inv.id} className="border border-neutral-150 dark:border-neutral-800/80 rounded-xl p-5 bg-neutral-50 dark:bg-neutral-950/20">
                  <div className="flex justify-between items-center border-b border-neutral-250 dark:border-neutral-800 pb-3 mb-4">
                    <p className="font-bold text-neutral-900 dark:text-white">Kỳ tháng {inv.month} / {inv.year}</p>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Ngày ghi: {new Date(inv.created_at).toLocaleDateString("vi-VN")}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Electricity */}
                    <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
                      <div className="bg-amber-500/10 p-3 rounded-full text-amber-500">
                        <BoltIcon className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 font-bold uppercase">Chỉ số Điện</p>
                        <p className="text-lg font-black text-neutral-900 dark:text-white mt-1">
                          {elec?.usage || 0} kWh
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Chỉ số: {elec?.old_index || 0} (Cũ) ➡️ {elec?.new_index || 0} (Mới)
                        </p>
                      </div>
                    </div>

                    {/* Water */}
                    <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
                      <div className="bg-blue-500/10 p-3 rounded-full text-blue-500">
                        <span className="text-xl font-bold">💧</span>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 font-bold uppercase">Chỉ số Nước</p>
                        <p className="text-lg font-black text-neutral-900 dark:text-white mt-1">
                          {water?.usage || 0} khối (m³)
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Chỉ số: {water?.old_index || 0} (Cũ) ➡️ {water?.new_index || 0} (Mới)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-neutral-400 italic">Chưa có chỉ số tiện ích nào được ghi nhận.</p>
        )}
      </div>
    </div>
  );
}
