"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, PrinterIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import { updateInvoiceStatus, type InvoiceWithDetails } from "@/lib/landlordServices";

interface ViewInvoiceModalProps {
  isOpen: boolean;
  invoice: InvoiceWithDetails | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ViewInvoiceModal({ isOpen, invoice, onClose, onSuccess }: ViewInvoiceModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleMarkAsPaid = async () => {
    if (!confirm('Xác nhận đã nhận thanh toán cho hóa đơn này?')) return;

    setLoading(true);
    try {
      const { error } = await updateInvoiceStatus(invoice.id, 'paid', {
        payment_method: 'Tiền mặt'
      });

      if (error) {
        alert('Có lỗi xảy ra: ' + error);
      } else {
        alert('Cập nhật thanh toán thành công!');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate Subtotals
  const rentAmount = invoice.contracts?.rent_amount ?? 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200 print:my-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Header - Hidden in Print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 print:hidden">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Chi tiết hóa đơn</h3>
            <p className="text-xs text-neutral-500 mt-1">Mã hóa đơn: #{invoice.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors text-neutral-500 dark:text-neutral-400">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Invoice Body Content */}
        <div className="p-8 space-y-6 print:p-0">
          
          {/* Top Invoice Header */}
          <div className="flex justify-between items-start border-b border-neutral-200 dark:border-neutral-700 pb-6">
            <div>
              <h2 className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight uppercase">HÓA ĐƠN TIỀN NHÀ</h2>
              <p className="text-sm text-neutral-500 mt-1">Tháng {invoice.month} năm {invoice.year}</p>
              {invoice.due_date && (
                <p className="text-xs text-red-500 mt-1 font-medium">Hạn thanh toán: {formatDate(invoice.due_date)}</p>
              )}
            </div>
            
            <div className="text-right">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                invoice.status === 'paid' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : invoice.status === 'overdue'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
              }`}>
                {invoice.status === 'paid' ? 'Đã thanh toán' : 
                 invoice.status === 'overdue' ? 'Quá hạn' : 'Chưa thanh toán'}
              </span>
              {invoice.paid_at && (
                <p className="text-xxs text-neutral-400 mt-2">Thanh toán ngày: {formatDate(invoice.paid_at)}</p>
              )}
            </div>
          </div>

          {/* Billing Info Details */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Từ (Chủ nhà):</p>
              <p className="font-bold text-neutral-800 dark:text-neutral-200">YoungHouse Hòa Lạc Xinh</p>
              <p className="text-neutral-500">Khu công nghệ cao Hòa Lạc, Hà Nội</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Đến (Khách thuê):</p>
              <p className="font-bold text-neutral-800 dark:text-neutral-200">{invoice.contracts?.renter?.name || "N/A"}</p>
              <p className="text-neutral-500">SĐT: {invoice.contracts?.renter?.phone || ""}</p>
              <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                Phòng: {invoice.room_units?.name} - {invoice.room_units?.rooms?.title}
              </p>
            </div>
          </div>

          {/* Billing Items Table */}
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="px-5 py-3 font-semibold">Mục thanh toán</th>
                  <th className="px-5 py-3 font-semibold text-right">Đơn giá / Chỉ số</th>
                  <th className="px-5 py-3 font-semibold text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {/* 1. Base rent item */}
                <tr>
                  <td className="px-5 py-4 font-semibold text-neutral-900 dark:text-white">Tiền thuê phòng</td>
                  <td className="px-5 py-4 text-right text-neutral-500">Cố định</td>
                  <td className="px-5 py-4 text-right font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(rentAmount)}
                  </td>
                </tr>

                {/* 2. Service items */}
                {invoice.invoice_items && invoice.invoice_items.length > 0 ? (
                  invoice.invoice_items.map((item: any) => {
                    const isVariable = item.services?.type === "variable";
                    return (
                      <tr key={item.id}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-neutral-800 dark:text-neutral-200">{item.services?.name}</p>
                          {isVariable && (
                            <p className="text-xxs text-neutral-400 mt-0.5">
                              (Chỉ số mới: {item.new_index} - Chỉ số cũ: {item.old_index} = Sử dụng: {item.usage} {item.services?.unit})
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right text-neutral-500">
                          {isVariable ? (
                            `${formatCurrency(item.unit_price)} / ${item.services?.unit}`
                          ) : (
                            "Cố định"
                          )}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-neutral-800 dark:text-neutral-200">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    );
                  })
                ) : null}

                {/* 3. Custom / Surplus Items if any */}
                {/* Custom items are simply included in total_amount, if total exceeds the items sum, we label it as additional surcharge */}
                {(() => {
                  const itemsSum = rentAmount + (invoice.invoice_items?.reduce((sum: number, i: any) => sum + Number(i.amount), 0) || 0);
                  const difference = Number(invoice.total_amount) - itemsSum;
                  if (difference > 10) {
                    return (
                      <tr>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-neutral-800 dark:text-neutral-200">Phụ thu / Chi phí khác</p>
                          <p className="text-xxs text-neutral-400 mt-0.5">(Đền bù hỏng hóc hoặc phát sinh)</p>
                        </td>
                        <td className="px-5 py-4 text-right text-neutral-500">Phát sinh</td>
                        <td className="px-5 py-4 text-right font-bold text-neutral-800 dark:text-neutral-200">
                          {formatCurrency(difference)}
                        </td>
                      </tr>
                    );
                  }
                  return null;
                })()}
              </tbody>
            </table>
          </div>

          {/* Grand Total section */}
          <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <span className="font-bold text-neutral-800 dark:text-neutral-200">TỔNG CỘNG HÓA ĐƠN:</span>
            <span className="text-xl font-extrabold text-green-600 dark:text-green-400">
              {formatCurrency(invoice.total_amount)}
            </span>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-neutral-50 dark:bg-neutral-900/30 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 text-xs">
              <span className="font-bold text-neutral-800 dark:text-neutral-200 block mb-1">Ghi chú từ chủ nhà:</span>
              <p className="text-neutral-600 dark:text-neutral-400">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions - Hidden in Print */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/20 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <PrinterIcon className="w-4 h-4" />
            In hóa đơn
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              Đóng
            </button>
            {invoice.status !== 'paid' && (
              <button
                onClick={handleMarkAsPaid}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Xác nhận thanh toán
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



