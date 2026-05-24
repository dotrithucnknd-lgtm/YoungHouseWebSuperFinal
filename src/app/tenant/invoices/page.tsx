"use client";

import React, { useState } from "react";
import { useTenant } from "../TenantContext";
import { supabase } from "@/lib/supabaseClient";
import {
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function TenantInvoicesPage() {
  const { invoices, roomUnit, refreshData, loading } = useTenant();

  // Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-neutral-500 font-medium animate-pulse">Đang tải hóa đơn...</p>
      </div>
    );
  }

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
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-primary-50 p-2.5 rounded-xl text-primary-6000 dark:bg-primary-950/30 dark:text-primary-400">
            <CreditCardIcon className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Lịch sử hóa đơn thanh toán</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Danh sách các hóa đơn điện, nước và tiền phòng hàng tháng</p>
          </div>
        </div>

        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-left text-sm">
              <thead>
                <tr className="text-xs text-neutral-400 uppercase tracking-wider font-bold">
                  <th className="py-4 px-4">Kỳ hóa đơn</th>
                  <th className="py-4 px-4">Hạn thanh toán</th>
                  <th className="py-4 px-4">Tổng tiền</th>
                  <th className="py-4 px-4">Phương thức</th>
                  <th className="py-4 px-4">Trạng thái</th>
                  <th className="py-4 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-neutral-900 dark:text-white">
                      Tháng {inv.month} / {inv.year}
                    </td>
                    <td className="py-4 px-4 text-neutral-500">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString("vi-VN") : "N/A"}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-neutral-900 dark:text-white">
                      {inv.total_amount.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400 font-medium">
                      {inv.payment_method || "—"}
                    </td>
                    <td className="py-4 px-4">
                      {inv.status === "paid" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-900/30">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Đã thanh toán
                        </span>
                      )}
                      {inv.status === "unpaid" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200 dark:bg-red-950/20 dark:text-red-450 dark:border-red-900/30 animate-pulse">
                          <ClockIcon className="w-3.5 h-3.5" />
                          Chưa đóng
                        </span>
                      )}
                      {inv.status === "overdue" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-250">
                          <XCircleIcon className="w-3.5 h-3.5" />
                          Quá hạn
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {inv.status === "unpaid" || inv.status === "overdue" ? (
                        <button
                          onClick={() => handlePayInvoice(inv)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                        >
                          Thanh toán ngay
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-400 dark:text-neutral-500 italic font-medium">Đã hoàn tất</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-neutral-400 italic">Chưa có lịch sử hoá đơn thanh toán nào.</p>
        )}
      </div>

      {/* QR BILL PAYMENT MODAL */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            {paymentSuccess ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-4">Thanh toán thành công!</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Giao dịch đã được ghi nhận.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">Quét Mã Thanh Toán QR</h3>
                <p className="text-xs text-neutral-500 mt-1">Sử dụng ứng dụng Ngân hàng quét mã QR bên dưới.</p>

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

                {/* Invoice Items details */}
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
