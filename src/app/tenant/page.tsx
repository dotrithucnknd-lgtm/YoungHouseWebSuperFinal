"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "./TenantContext";
import { supabase } from "@/lib/supabaseClient";
import {
  HomeIcon,
  CreditCardIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function TenantOverviewPage() {
  const { user } = useAuth();
  const { roomUnit, contract, invoices, loading, refreshData } = useTenant();

  // Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400 font-medium animate-pulse">
          Đang tải thông tin...
        </p>
      </div>
    );
  }

  // Get active unpaid invoice
  const unpaidInvoice = invoices.find((i) => i.status === "unpaid");

  const handlePayInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentSuccess(false);
    setShowPayModal(true);
  };

  const submitPayment = async () => {
    if (!selectedInvoice) return;
    try {
      setSubmittingPayment(true);
      const { error } = await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_method: "Chuyển khoản QR",
        })
        .eq("id", selectedInvoice.id);

      if (error) throw error;

      setPaymentSuccess(true);
      await refreshData();
      setTimeout(() => {
        setShowPayModal(false);
      }, 2000);
    } catch (err: any) {
      alert("Lỗi thanh toán: " + err.message);
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-6000 to-amber-600 p-6 sm:p-8 text-white shadow-md">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Chào {user?.name || "bạn"},
            </h2>
            <p className="text-white/80 text-sm max-w-xl">
              Hôm nay của bạn tại Trọ Xinh thế nào? Hãy theo dõi các thông tin dịch vụ, thanh toán hóa đơn và quản lý tiện ích phòng của bạn tại đây.
            </p>
          </div>
          {roomUnit ? (
            <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-white/20 backdrop-blur-md border border-white/25">
              🏡 Phòng: {roomUnit.name} — {roomUnit.rooms?.title}
            </div>
          ) : (
            <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-red-500/25 border border-red-500/30">
              ⚠️ Chưa liên kết phòng
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (Room and Utilities) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-900 dark:text-white mb-4">
              <span className="bg-primary-50 p-2 rounded-xl text-primary-6000 dark:bg-primary-950/30 dark:text-primary-400">
                <HomeIcon className="w-5 h-5" />
              </span>
              Thông tin phòng trọ của bạn
            </h3>

            {roomUnit ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Tên phòng</p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">{roomUnit.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Tòa nhà / Cơ sở</p>
                    <p className="text-base font-semibold mt-0.5 text-neutral-800 dark:text-neutral-200">{roomUnit.rooms?.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Địa chỉ</p>
                    <p className="text-sm mt-0.5 text-neutral-600 dark:text-neutral-400">{roomUnit.rooms?.address}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Giá thuê phòng</p>
                    <p className="text-lg font-extrabold text-primary-6000 dark:text-primary-400 mt-0.5">
                      {roomUnit.rent_price ? `${roomUnit.rent_price.toLocaleString("vi-VN")} đ / tháng` : "Liên hệ"}
                    </p>
                  </div>
                  <div className="flex gap-10">
                    <div>
                      <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Diện tích</p>
                      <p className="text-sm mt-0.5 font-semibold text-neutral-800 dark:text-neutral-200">{roomUnit.area} m²</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Trạng thái</p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/30 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        Đang thuê
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-neutral-400 italic">Chưa có thông tin phòng nào được liên kết với tài khoản này.</p>
            )}
          </div>

          {/* Electricity Consumption Widget */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                <span className="bg-amber-50 p-2 rounded-xl text-amber-500 dark:bg-amber-950/30 dark:text-amber-400">
                  <BoltIcon className="w-5 h-5" />
                </span>
                Mức tiêu dùng điện gần đây
              </h3>
              <Link href="/tenant/utilities" className="text-sm text-primary-6000 hover:underline font-semibold dark:text-primary-400">
                Xem chi tiết
              </Link>
            </div>

            {invoices.length > 0 ? (
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
                  Số lượng điện năng (kWh) tiêu thụ trong các kỳ hoá đơn gần đây nhất của bạn.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {invoices.slice(0, 4).reverse().map((inv) => {
                    const elecItem = inv.invoice_items?.find((item: any) =>
                      item.services?.name?.toLowerCase().includes("điện") ||
                      item.services?.unit?.toLowerCase().includes("kwh") ||
                      item.services?.unit?.toLowerCase().includes("số")
                    );
                    return (
                      <div key={inv.id} className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between">
                        <p className="text-xs text-neutral-400 font-bold uppercase">Tháng {inv.month}/{inv.year}</p>
                        <p className="text-2xl font-extrabold text-amber-500 mt-2">
                          {elecItem?.usage || 0} <span className="text-sm font-semibold text-neutral-500">kWh</span>
                        </p>
                        <span className="text-[10px] text-neutral-500 mt-1 block">
                          Số: {elecItem?.old_index || 0} ➡️ {elecItem?.new_index || 0}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-neutral-400 italic">Chưa có chỉ số điện nước nào được cập nhật.</p>
            )}
          </div>
        </div>

        {/* Right Column (Invoice Summary & Quick Price List) */}
        <div className="space-y-6">
          {/* Current Unpaid Bill */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center justify-between">
              <span>Hóa đơn tháng này</span>
              {unpaidInvoice ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30 animate-pulse">
                  Chưa đóng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30">
                  Đã hoàn tất
                </span>
              )}
            </h3>

            {unpaidInvoice ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-400 font-semibold">Tổng tiền cần thanh toán</p>
                  <p className="text-3xl font-black text-red-500 tracking-tight mt-1">
                    {unpaidInvoice.total_amount.toLocaleString("vi-VN")} đ
                  </p>
                </div>

                <div className="bg-red-50/50 dark:bg-red-950/10 p-3.5 rounded-xl border border-red-100 dark:border-red-900/20 text-xs text-red-600 dark:text-red-400 font-medium">
                  Hạn thanh toán: {unpaidInvoice.due_date ? new Date(unpaidInvoice.due_date).toLocaleDateString("vi-VN") : "N/A"}
                </div>

                <button
                  onClick={() => handlePayInvoice(unpaidInvoice)}
                  className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-500/10"
                >
                  Thanh toán ngay qua QR
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircleIcon className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="mt-3 text-sm font-semibold text-neutral-800 dark:text-white">Tuyệt vời! Bạn không còn hoá đơn nào chưa thanh toán.</p>
                <p className="text-xs text-neutral-400 mt-1">Hẹn gặp lại bạn vào chu kỳ đóng phí tiếp theo.</p>
              </div>
            )}
          </div>

          {/* Quick Price List */}
          {contract && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4">Đơn giá trong hợp đồng</h3>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500 font-medium">Giá điện sinh hoạt</span>
                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    {contract.electric_price ? `${contract.electric_price.toLocaleString("vi-VN")} đ / số` : "Theo đồng hồ"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  <span className="text-xs text-neutral-500 font-medium">Giá nước sinh hoạt</span>
                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    {contract.water_price ? `${contract.water_price.toLocaleString("vi-VN")} đ / khối` : "Theo đồng hồ"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick actions shortcut */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Yêu cầu nhanh</h3>
            <Link
              href="/tenant/maintenance"
              className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 hover:border-primary-500 dark:border-neutral-800 dark:hover:border-primary-500 transition-all text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800/30 text-neutral-700 dark:text-neutral-300"
            >
              <WrenchScrewdriverIcon className="w-5 h-5 text-neutral-400" />
              Báo sự cố phòng / Hỏng hóc
            </Link>
          </div>
        </div>
      </div>

      {/* QR BILL PAYMENT MODAL */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            {paymentSuccess ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-4">Thanh toán thành công!</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Giao dịch đã được cập nhật thành công vào hệ thống.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">Quét Mã Thanh Toán QR</h3>
                <p className="text-xs text-neutral-500 mt-1">Sử dụng ứng dụng Ngân hàng (Mobile Banking) quét mã QR bên dưới.</p>

                {/* QR Display */}
                <div className="bg-neutral-50 dark:bg-neutral-950/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 mt-4 text-center">
                  <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Kỳ hóa đơn Tháng {selectedInvoice.month}/{selectedInvoice.year}</p>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">
                    {selectedInvoice.total_amount.toLocaleString("vi-VN")} đ
                  </p>

                  <div className="bg-white p-3 rounded-xl inline-block mt-4 shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `STK: 123456789 - Ngan hang: MBBank - So tien: ${selectedInvoice.total_amount} - Noi dung: Thanh toan tien phong ky thang ${selectedInvoice.month}/${selectedInvoice.year}`
                      )}`}
                      alt="QR Code thanh toan"
                      className="w-40 h-40 mx-auto"
                    />
                  </div>

                  <p className="text-[11px] text-neutral-500 mt-3 font-medium">Nội dung chuyển khoản: <span className="text-neutral-800 dark:text-white font-bold">YoungHouse {roomUnit?.name} T{selectedInvoice.month}</span></p>
                </div>

                {/* Invoice details */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Chi tiết dịch vụ</p>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 divide-y divide-neutral-100 dark:divide-neutral-800">
                    {selectedInvoice.invoice_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-xs pt-1.5">
                        <span className="text-neutral-500 font-medium">
                          {item.services?.name} {item.usage ? `(${item.usage} ${item.services?.unit})` : ""}
                        </span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">
                          {item.amount.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowPayModal(false)}
                    disabled={submittingPayment}
                    className="flex-1 py-3 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={submitPayment}
                    disabled={submittingPayment}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
                  >
                    {submittingPayment ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Xác nhận đã chuyển"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
