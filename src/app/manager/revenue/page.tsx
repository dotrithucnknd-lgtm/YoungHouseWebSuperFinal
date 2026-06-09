"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatVND } from "@/lib/ctvServices";
import {
  BanknotesIcon,
  FunnelIcon,
  PrinterIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface InvoiceData {
  id: string;
  month: number;
  year: number;
  total_amount: number;
  status: "paid" | "unpaid" | "overdue";
  due_date?: string;
  paid_at?: string;
  payment_method?: string;
  room_units?: {
    id: string;
    name: string;
    rooms?: {
      id: string;
      title: string;
    };
  };
  contracts?: {
    id: string;
    renter?: {
      id: string;
      name: string;
      phone: string;
    };
  };
}

interface RoomItem {
  id: string;
  title: string;
}

export default function RevenueReport() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    loadRooms();
    loadInvoices();
  }, []);

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase.from("rooms").select("id, title");
      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      console.error("Error loading rooms list:", err);
    }
  };

  const loadInvoices = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("invoices")
        .select(`
          id,
          month,
          year,
          total_amount,
          status,
          due_date,
          paid_at,
          payment_method,
          room_units!inner (
            id,
            name,
            room_id,
            rooms:room_id (
              id,
              title
            )
          ),
          contracts (
            id,
            renter:renter_id (
              id,
              name,
              phone
            )
          )
        `)
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      setInvoices((data as any[]) || []);
    } catch (err) {
      console.error("Error loading invoices for revenue report:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInvoices();
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter logic in memory for smooth user experience
  const filteredInvoices = invoices.filter(invoice => {
    const matchRoom = selectedRoom === "all" || invoice.room_units?.rooms?.id === selectedRoom;
    const matchMonth = selectedMonth === "all" || invoice.month.toString() === selectedMonth;
    const matchYear = selectedYear === "all" || invoice.year.toString() === selectedYear;
    const matchStatus = selectedStatus === "all" || invoice.status === selectedStatus;

    return matchRoom && matchMonth && matchYear && matchStatus;
  });

  // Calculate financial statistics
  const totalInvoiced = filteredInvoices.reduce((sum, item) => sum + (item.total_amount || 0), 0);
  const totalPaid = filteredInvoices
    .filter(i => i.status === "paid")
    .reduce((sum, item) => sum + (item.total_amount || 0), 0);
  const totalOutstanding = filteredInvoices
    .filter(i => i.status === "unpaid" || i.status === "overdue")
    .reduce((sum, item) => sum + (item.total_amount || 0), 0);
  const recoveryRate = totalInvoiced ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  // Group by month for mini-chart
  const monthlyRevenueMap: Record<number, number> = {};
  filteredInvoices
    .filter(i => i.status === "paid")
    .forEach(i => {
      monthlyRevenueMap[i.month] = (monthlyRevenueMap[i.month] || 0) + i.total_amount;
    });

  const monthsList = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Printable Heading Section (Only visible on print) */}
      <div className="hidden print:block text-center border-b pb-6">
        <h1 className="text-3xl font-extrabold">BÁO CÁO DOANH THU HỆ THỐNG YOUNGHOUSE</h1>
        <p className="text-sm text-neutral-500 mt-2">
          Ngày xuất bản: {new Date().toLocaleDateString("vi-VN")} • Người lập báo cáo: Giám Sát Vận Hành (Nhường)
        </p>
      </div>

      {/* Action panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Báo cáo tài chính phòng trọ</h2>
          <p className="text-sm text-neutral-500">Giám sát tổng doanh thu, công nợ và lịch sử nộp tiền</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Đang tải..." : "Tải lại dữ liệu"}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <PrinterIcon className="w-4.5 h-4.5" />
            In báo cáo
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200 font-semibold text-sm">
          <FunnelIcon className="w-4 h-4 text-primary-500" />
          <span>Bộ lọc nâng cao</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tòa nhà */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Toà nhà / Cơ sở</label>
            <select
              value={selectedRoom}
              onChange={e => setSelectedRoom(e.target.value)}
              className="w-full text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-neutral-800 dark:text-neutral-100"
            >
              <option value="all">Tất cả toà nhà</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.title}
                </option>
              ))}
            </select>
          </div>

          {/* Tháng */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Tháng</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-neutral-800 dark:text-neutral-100"
            >
              <option value="all">Tất cả tháng</option>
              {monthsList.map(m => (
                <option key={m} value={m.toString()}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>

          {/* Năm */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Năm</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-neutral-800 dark:text-neutral-100"
            >
              <option value="2024">Năm 2024</option>
              <option value="2025">Năm 2025</option>
              <option value="2026">Năm 2026</option>
            </select>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Trạng thái thanh toán</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-neutral-800 dark:text-neutral-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial stats card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
          <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Tổng trị giá hóa đơn</p>
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white mt-1">
            {formatVND(totalInvoiced)}
          </h3>
          <p className="text-xs text-neutral-400 mt-2">Tổng số phát sinh trong kỳ</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm border-l-4 border-l-green-500">
          <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Thực thu (Doanh thu)</p>
          <h3 className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">
            {formatVND(totalPaid)}
          </h3>
          <p className="text-xs text-neutral-400 mt-2">Dòng tiền thực tế đã chảy vào tài khoản</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm border-l-4 border-l-orange-500">
          <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Công nợ tồn đọng</p>
          <h3 className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
            {formatVND(totalOutstanding)}
          </h3>
          <p className="text-xs text-neutral-400 mt-2">Tiền phòng & dịch vụ chưa thu hồi</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
          <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Tỷ lệ thu hồi nợ</p>
          <h3 className="text-2xl font-black text-primary-6000 mt-1">
            {recoveryRate}%
          </h3>
          <div className="w-full bg-neutral-100 dark:bg-neutral-700 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-primary-6000 h-full rounded-full transition-all"
              style={{ width: `${recoveryRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Monthly chart visualization */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm print:hidden">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4">Biểu đồ doanh thu thực thu theo tháng</h3>
        <div className="grid grid-cols-12 gap-3 h-48 items-end pt-4 border-b border-neutral-200 dark:border-neutral-700">
          {monthsList.map(month => {
            const val = monthlyRevenueMap[month] || 0;
            const maxVal = Math.max(...Object.values(monthlyRevenueMap), 10000000);
            const heightPercent = Math.min(100, Math.round((val / maxVal) * 100));

            return (
              <div key={month} className="flex flex-col items-center h-full justify-end group relative">
                {val > 0 && (
                  <div className="absolute bottom-full mb-1 bg-neutral-900 text-white text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow-md pointer-events-none">
                    {formatVND(val)}
                  </div>
                )}
                <div
                  className={`w-full rounded-t transition-all ${
                    val > 0 ? "bg-primary-500 group-hover:bg-primary-600" : "bg-neutral-100 dark:bg-neutral-800"
                  }`}
                  style={{ height: `${val > 0 ? heightPercent : 4}%` }}
                />
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 font-bold">T{month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction List Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center print:hidden">
          <h3 className="font-bold text-neutral-900 dark:text-white">Lịch sử hóa đơn chi tiết</h3>
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            Tìm thấy {filteredInvoices.length} bản ghi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Phòng</th>
                <th className="px-6 py-4 font-semibold">Khách thuê</th>
                <th className="px-6 py-4 font-semibold">Tháng/Năm</th>
                <th className="px-6 py-4 font-semibold text-right">Tổng cộng</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold">Hạn/Ngày đóng</th>
                <th className="px-6 py-4 font-semibold">Hình thức</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white">
                          {invoice.room_units?.name || "N/A"}
                        </p>
                        <p className="text-xs text-neutral-500 truncate max-w-[200px]">
                          {invoice.room_units?.rooms?.title || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {invoice.contracts?.renter?.name || "N/A"}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {invoice.contracts?.renter?.phone || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 font-medium">
                      Tháng {invoice.month}/{invoice.year}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {formatVND(invoice.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          invoice.status === "paid"
                            ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                            : invoice.status === "overdue"
                            ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                            : "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400"
                        }`}
                      >
                        {invoice.status === "paid" ? (
                          <>
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            Đã thanh toán
                          </>
                        ) : invoice.status === "overdue" ? (
                          <>
                            <ExclamationCircleIcon className="w-3.5 h-3.5" />
                            Quá hạn
                          </>
                        ) : (
                          <>
                            <ClockIcon className="w-3.5 h-3.5" />
                            Chưa thanh toán
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 text-xs">
                      {invoice.status === "paid" && invoice.paid_at ? (
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          Nộp: {new Date(invoice.paid_at).toLocaleDateString("vi-VN")}
                        </div>
                      ) : (
                        <div>
                          Hạn: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("vi-VN") : "N/A"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 text-xs font-medium">
                      {invoice.status === "paid" ? invoice.payment_method || "Chuyển khoản" : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                    Không tìm thấy hóa đơn nào khớp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
