"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "../TenantContext";
import { supabase } from "@/lib/supabaseClient";
import { WrenchScrewdriverIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function TenantMaintenancePage() {
  const { user } = useAuth();
  const { roomUnit } = useTenant();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [success, setSuccess] = useState(false);

  const fetchTickets = async () => {
    if (!user) return;
    try {
      setLoadingTickets(true);
      const { data, error } = await supabase
        .from("maintenance_tickets")
        .select("*")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomUnit || !form.title.trim()) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.from("maintenance_tickets").insert({
        room_id: roomUnit.room_id || roomUnit.rooms?.id,
        tenant_id: user?.id,
        title: form.title.trim(),
        description: form.description.trim(),
        status: "pending",
      });

      if (error) throw error;

      // Thông báo cho Operator phân công (không gửi thẳng cho toàn bộ kỹ thuật viên)
      const tenantName = user?.name || "Khách thuê";
      const roomName = roomUnit.name || "Phòng trọ";
      const houseTitle = roomUnit.rooms?.title || "";
      const locationInfo = houseTitle ? `${roomName} - ${houseTitle}` : roomName;

      await supabase.from("notifications").insert({
        title: `🔧 Sự cố mới: ${form.title.trim()}`,
        content: `Khách thuê ${tenantName} (${locationInfo}) vừa báo cáo sự cố: "${form.title.trim()}". Operator vui lòng vào mục Bảo trì để phân công kỹ thuật viên và đặt mức ưu tiên.`,
        type: "warning",
        target_audience: "owners",
        is_active: true,
        created_by: user?.id,
      });

      setSuccess(true);
      setForm({ title: "", description: "" });
      await fetchTickets();
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      alert("Lỗi gửi yêu cầu: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-900/30">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            Đã hoàn thành
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30">
            <ClockIcon className="w-3.5 h-3.5 animate-pulse" />
            Đang xử lý
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30">
            <ExclamationCircleIcon className="w-3.5 h-3.5" />
            Chờ tiếp nhận
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Column */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm sticky top-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary-50 p-2 rounded-xl text-primary-6000 dark:bg-primary-950/30 dark:text-primary-400">
              <WrenchScrewdriverIcon className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Báo sự cố phòng</h3>
          </div>
          <p className="text-xs text-neutral-500 mb-6">
            Bóng đèn hỏng, vòi nước rò rỉ, thiết bị hư hao... Hãy chụp/mô tả sự cố để kỹ thuật YoungHouse hỗ trợ bạn nhanh nhất.
          </p>

          {success ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded-xl text-center space-y-2">
              <CheckCircleIcon className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Gửi sự cố thành công!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Đội kỹ thuật sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Vấn đề gặp phải *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Rò rỉ nước nhà vệ sinh, Hỏng điều hoà..."
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Mô tả chi tiết</label>
                <textarea
                  rows={4}
                  placeholder="Mô tả cụ thể vị trí hoặc tình trạng lỗi để nhân viên kỹ thuật chuẩn bị trước dụng cụ sửa chữa..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !roomUnit}
                className="w-full text-center bg-primary-6000 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-primary-6000/10 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Gửi yêu cầu sửa chữa"
                )}
              </button>

              {!roomUnit && (
                <p className="text-[10px] text-red-500 font-semibold text-center mt-2">
                  * Vui lòng liên kết phòng để sử dụng tính năng này
                </p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* History Column */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Lịch sử sự cố đã gửi</h3>

          {loadingTickets ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 bg-neutral-50 dark:bg-neutral-950/20 hover:shadow-xs transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-neutral-900 dark:text-white text-base">{ticket.title}</h4>
                    {getStatusBadge(ticket.status)}
                  </div>

                  {ticket.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{ticket.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                    <span>Mã sự cố: #{ticket.id.slice(0, 8).toUpperCase()}</span>
                    <span>Ngày báo: {new Date(ticket.created_at).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-neutral-400 italic">
              Bạn chưa gửi báo cáo sự cố nào trước đây.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
