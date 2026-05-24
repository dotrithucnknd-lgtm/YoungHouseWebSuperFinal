"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon,
  UserIcon
} from "@heroicons/react/24/outline";

export default function StaffDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Fetch all maintenance tickets (we will filter in JS so staff can see unassigned tickets too)
      const { data: tickets, error } = await supabase
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
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter: only show unassigned tickets OR tickets assigned to this staff
      const items = (tickets || []).filter((t: any) => t.assigned_to === user.id || !t.assigned_to);
      
      // Calculate stats
      const total = items.length;
      const assigned = items.filter(t => t.status === "assigned" || t.status === "pending").length;
      const inProgress = items.filter(t => t.status === "in_progress").length;
      const completed = items.filter(t => t.status === "completed" || t.status === "resolved").length;

      setStats({ total, assigned, inProgress, completed });
      setRecentTasks(items.slice(0, 5)); // show top 5 recent tasks
    } catch (err) {
      console.error("Error fetching staff dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

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
            Mới nhận việc
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
        <p className="text-sm text-neutral-500 mt-4">Đang tải bảng điều khiển kỹ thuật...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-6000 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="bg-white/20 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Kỹ thuật viên hệ thống
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold">Chào ngày mới, {user?.name || "Kỹ Thuật Viên"}!</h2>
          <p className="text-white/80 text-sm max-w-xl">
            Hôm nay bạn có <span className="font-bold underline">{stats.assigned + stats.inProgress} sự cố</span> cần khắc phục. Chúc bạn có một ngày làm việc hiệu quả và an toàn!
          </p>
        </div>
        
        {/* Background Decorative Blur */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-white/10 rounded-l-full blur-3xl pointer-events-none transform translate-x-12 translate-y-12"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">{stats.total}</span>
            <span className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 text-neutral-500 dark:text-neutral-400 group-hover:scale-110 transition-transform">
              <WrenchScrewdriverIcon className="w-5 h-5" />
            </span>
          </div>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Tổng việc đã nhận</p>
        </div>

        {/* Assigned Tasks */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{stats.assigned}</span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <ExclamationTriangleIcon className="w-5 h-5 animate-bounce" />
            </span>
          </div>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Việc chờ bắt đầu</p>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{stats.inProgress}</span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <ClockIcon className="w-5 h-5 animate-pulse" />
            </span>
          </div>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Đang khắc phục</p>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-extrabold text-green-600 dark:text-green-400">{stats.completed}</span>
            <span className="p-2 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
              <CheckCircleIcon className="w-5 h-5" />
            </span>
          </div>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Sửa hoàn thành</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Assigned Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Công việc mới nhất</h3>
            <Link
              href="/staff/tasks"
              className="text-xs font-bold text-primary-6000 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1 group"
            >
              Xem tất cả nhiệm vụ
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {recentTasks.length > 0 ? (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Accent color left bar */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                    task.status === 'completed' || task.status === 'resolved' ? 'bg-green-500' :
                    task.status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}></div>

                  <div className="pl-2 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-neutral-900 dark:text-white text-base group-hover:text-primary-6000 transition-colors">
                            {task.title}
                          </h4>
                          {getPriorityBadge(task.priority)}
                        </div>
                        <p className="text-xs text-neutral-400">
                          Mã số: #{task.id.slice(0, 8).toUpperCase()} • Đăng ngày: {new Date(task.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>

                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2">
                      {task.description || "Không có mô tả chi tiết sự cố."}
                    </p>

                    {/* Meta info block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-700/50 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span className="truncate">{task.rooms?.title} ({task.rooms?.address})</span>
                      </div>
                      
                      {task.tenant && (
                        <div className="flex items-center justify-between md:justify-start gap-4">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                            <span>{task.tenant.name}</span>
                          </div>
                          <a
                            href={`tel:${task.tenant.phone}`}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/20 text-primary-6000 dark:text-primary-400 border border-primary-200/30"
                          >
                            <PhoneIcon className="w-3.5 h-3.5" />
                            Gọi ngay
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 py-16 px-4 text-center text-neutral-400 dark:text-neutral-500 italic">
              <WrenchScrewdriverIcon className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              Bạn chưa được phân công sự cố sửa chữa nào.
            </div>
          )}
        </div>

        {/* Right Column: Information & Guidelines */}
        <div className="space-y-6">
          {/* Quick Stats Panel */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
            <h3 className="font-extrabold text-neutral-900 dark:text-white mb-4">Quy trình kỹ thuật</h3>
            <ul className="space-y-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <p className="text-neutral-900 dark:text-white font-bold text-sm">Tiếp nhận sự cố</p>
                  <p className="mt-0.5 leading-relaxed text-neutral-500">Xem danh sách sự cố mới do Operator giao, chủ động liên hệ renter đặt lịch hẹn.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <p className="text-neutral-900 dark:text-white font-bold text-sm">Cập nhật "Đang sửa"</p>
                  <p className="mt-0.5 leading-relaxed text-neutral-500">Bắt đầu sửa chữa thì chuyển trạng thái "Đang xử lý" để Tenant & Operator biết.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <p className="text-neutral-900 dark:text-white font-bold text-sm">Hoàn thành & Ghi chú</p>
                  <p className="mt-0.5 leading-relaxed text-neutral-500">Sau khi hoàn tất, đánh dấu hoàn thành, viết báo cáo chi tiết nguyên nhân/linh kiện thay thế.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Hotline Emergency */}
          <div className="bg-red-500/10 dark:bg-red-950/15 rounded-2xl border border-red-500/20 p-6 space-y-3">
            <h4 className="font-extrabold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">Đường dây nóng khẩn cấp</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-semibold">
              Trong trường hợp xảy ra sự cố cháy nổ, hỏa hoạn, mất điện toàn bộ khu vực hoặc các sự cố an toàn đặc biệt nghiêm trọng, hãy lập tức báo với ban giám đốc.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="tel:0834347969"
                className="inline-flex items-center gap-1 text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl transition-all shadow-md shadow-red-600/20"
              >
                <PhoneIcon className="w-3.5 h-3.5" />
                Hotline Ban Giám Đốc
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
