"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import {
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  BanknotesIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export default function StaffTasksPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "in_progress" | "completed">("all");
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // Status transition form states
  const [submitting, setSubmitting] = useState(false);
  const [repairNotes, setRepairNotes] = useState("");
  const [repairCost, setRepairCost] = useState("");

  const fetchTasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("maintenance_tickets")
        .select(`
          *,
          rooms (
            id,
            title,
            address
          ),
          tenant:tenant_id (
            id,
            name,
            phone
          )
        `)
        .eq("assigned_to", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const items = data || [];
      setTasks(items);
      
      // Update selected task reference if it's currently open
      if (selectedTask) {
        const updatedSelected = items.find((t: any) => t.id === selectedTask.id);
        if (updatedSelected) {
          setSelectedTask(updatedSelected);
        }
      }
    } catch (err) {
      console.error("Error fetching staff tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleStartTask = async (taskId: string) => {
    if (!user) return;
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from("maintenance_tickets")
        .update({
          status: "in_progress",
          updated_at: new Date().toISOString()
        })
        .eq("id", taskId)
        .eq("assigned_to", user.id);

      if (error) throw error;
      await fetchTasks();
    } catch (err: any) {
      alert("Lỗi khi bắt đầu xử lý: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from("maintenance_tickets")
        .update({
          status: "completed",
          notes: repairNotes.trim(),
          cost: Number(repairCost) || 0,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedTask.id);

      if (error) throw error;
      
      setRepairNotes("");
      setRepairCost("");
      await fetchTasks();
    } catch (err: any) {
      alert("Lỗi khi hoàn thành sự cố: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
      case "high":
        return (
          <span className="inline-flex items-center text-[10px] font-bold bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/30">
            Khẩn cấp
          </span>
        );
      case "normal":
      case "medium":
        return (
          <span className="inline-flex items-center text-[10px] font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/30">
            Trung bình
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
            Thấp
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-900/30">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            Đã hoàn thành
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900/30">
            <ClockIcon className="w-3.5 h-3.5 animate-pulse" />
            Đang xử lý
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/30">
            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
            Việc mới nhận
          </span>
        );
    }
  };

  // Filter and search tasks logic
  const filteredTasks = tasks.filter((task) => {
    // Status Filter
    if (statusFilter === "new" && task.status !== "assigned") return false;
    if (statusFilter === "in_progress" && task.status !== "in_progress") return false;
    if (statusFilter === "completed" && task.status !== "completed" && task.status !== "resolved") return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = task.title?.toLowerCase().includes(query);
    const descMatch = task.description?.toLowerCase().includes(query);
    const roomMatch = task.rooms?.title?.toLowerCase().includes(query);
    const tenantMatch = task.tenant?.name?.toLowerCase().includes(query);

    return titleMatch || descMatch || roomMatch || tenantMatch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      {/* Sidebar Task List */}
      <div className="lg:col-span-2 space-y-4">
        {/* Filters and Search Bar */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm space-y-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo sự cố, nhà trọ, khách trọ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1.5 flex items-center gap-1">
              <FunnelIcon className="w-3.5 h-3.5" />
              Lọc:
            </span>
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              Tất cả ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter("new")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "new"
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/30"
              }`}
            >
              Mới nhận ({tasks.filter(t => t.status === "assigned").length})
            </button>
            <button
              onClick={() => setStatusFilter("in_progress")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "in_progress"
                  ? "bg-blue-500 text-white"
                  : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/30"
              }`}
            >
              Đang làm ({tasks.filter(t => t.status === "in_progress").length})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "completed"
                  ? "bg-green-500 text-white"
                  : "bg-green-50 dark:bg-green-950/20 text-green-600 hover:bg-green-100 dark:hover:bg-green-950/30"
              }`}
            >
              Đã xong ({tasks.filter(t => t.status === "completed" || t.status === "resolved").length})
            </button>
          </div>
        </div>

        {/* Task Cards Scroll Container */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`bg-white dark:bg-neutral-800 rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden cursor-pointer ${
                    isSelected
                      ? "border-primary-500 ring-2 ring-primary-500/20 shadow-md translate-x-1"
                      : "border-neutral-200 dark:border-neutral-700 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
                >
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                    task.status === 'completed' || task.status === 'resolved' ? 'bg-green-500' :
                    task.status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}></div>

                  <div className="pl-2 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-neutral-900 dark:text-white text-base">
                            {task.title}
                          </h4>
                          {getPriorityBadge(task.priority)}
                        </div>
                        <p className="text-xs text-neutral-400">
                          Đăng ngày: {new Date(task.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>

                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2">
                      {task.description || "Không có mô tả."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-700/50">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span className="truncate">{task.rooms?.title}</span>
                      </div>
                      {task.tenant && (
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                          <span>{task.tenant.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 py-20 text-center text-neutral-400 italic">
            Không tìm thấy sự cố nào trùng khớp với bộ lọc.
          </div>
        )}
      </div>

      {/* Task Details Drawer/Column */}
      <div className="lg:col-span-1">
        {selectedTask ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm sticky top-6 space-y-6">
            {/* Header Detail Drawer */}
            <div className="flex items-start justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="space-y-1">
                <span className="bg-primary-50 dark:bg-primary-950/20 text-primary-6000 dark:text-primary-400 text-xxs font-extrabold uppercase px-2 py-0.5 rounded">
                  Chi tiết sự cố
                </span>
                <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white mt-1">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Information Grid */}
            <div className="space-y-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              <div>
                <span className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1">Trạng thái</span>
                {getStatusBadge(selectedTask.status)}
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1">Mức độ ưu tiên</span>
                {getPriorityBadge(selectedTask.priority)}
              </div>

              {selectedTask.description && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1">Mô tả sự cố</span>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800 rounded-xl p-3 leading-relaxed">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              <div>
                <span className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1.5">Địa điểm</span>
                <div className="flex gap-2">
                  <MapPinIcon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-extrabold text-neutral-900 dark:text-white">{selectedTask.rooms?.title}</p>
                    <p className="text-neutral-500 mt-0.5">{selectedTask.rooms?.address}</p>
                  </div>
                </div>
              </div>

              {selectedTask.tenant && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1.5">Người báo cáo (Tenant)</span>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-neutral-400" />
                      <div className="text-xs">
                        <p className="font-extrabold text-neutral-900 dark:text-white">{selectedTask.tenant.name}</p>
                        <p className="text-neutral-500 mt-0.5">{selectedTask.tenant.phone}</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${selectedTask.tenant.phone}`}
                      className="p-2 rounded-xl bg-primary-6000 hover:bg-primary-700 text-white shadow-md shadow-primary-6000/20"
                    >
                      <PhoneIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Action transition panel */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              {selectedTask.status === "assigned" ? (
                <button
                  onClick={() => handleStartTask(selectedTask.id)}
                  disabled={submitting}
                  className="w-full text-center bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ClockIcon className="w-4 h-4" />
                      Bắt đầu xử lý sự cố
                    </>
                  )}
                </button>
              ) : selectedTask.status === "in_progress" ? (
                <form onSubmit={handleCompleteTask} className="space-y-4">
                  <span className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Đánh dấu hoàn thành</span>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xxs font-bold text-neutral-400 uppercase tracking-wider mb-1">Ghi chú sửa chữa (Vật liệu, nguyên nhân) *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Ví dụ: Đã thay ổ khóa cửa chính mới, do ổ khóa cũ bị rỉ sét không mở được..."
                        value={repairNotes}
                        onChange={(e) => setRepairNotes(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xxs font-bold text-neutral-400 uppercase tracking-wider mb-1">Chi phí sửa chữa phát sinh (VND) - Nếu có</label>
                      <div className="relative">
                        <BanknotesIcon className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="number"
                          placeholder="Nhập chi phí (Ví dụ: 150000)"
                          value={repairCost}
                          onChange={(e) => setRepairCost(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !repairNotes.trim()}
                    className="w-full text-center bg-green-600 hover:bg-green-700 disabled:bg-neutral-300 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-green-600/10 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        Hoàn thành & Lưu ghi chú
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Completed State detail */
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl p-4 space-y-3 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-extrabold text-sm">
                    <CheckCircleIcon className="w-5 h-5 shrink-0" />
                    Sự cố đã được khắc phục xong
                  </div>
                  
                  {selectedTask.notes && (
                    <div className="space-y-0.5">
                      <span className="text-xxs uppercase font-bold text-neutral-400 flex items-center gap-1">
                        <DocumentTextIcon className="w-3.5 h-3.5" />
                        Báo cáo sửa chữa:
                      </span>
                      <p className="text-neutral-700 dark:text-neutral-300 italic">
                        "{selectedTask.notes}"
                      </p>
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <span className="text-xxs uppercase font-bold text-neutral-400 flex items-center gap-1">
                      <BanknotesIcon className="w-3.5 h-3.5" />
                      Chi phí vật tư phát sinh:
                    </span>
                    <p className="text-neutral-900 dark:text-white font-extrabold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(selectedTask.cost || 0)}
                    </p>
                  </div>
                  
                  {selectedTask.completed_at && (
                    <p className="text-[10px] text-neutral-400">
                      Thời gian hoàn thành: {new Date(selectedTask.completed_at).toLocaleString("vi-VN")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:block bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 text-center text-neutral-400 dark:text-neutral-500 italic py-32 sticky top-6">
            <WrenchScrewdriverIcon className="w-12 h-12 mx-auto mb-3 text-neutral-300 animate-pulse" />
            Chọn một sự cố từ danh sách để xem chi tiết & cập nhật trạng thái sửa chữa.
          </div>
        )}
      </div>
    </div>
  );
}
