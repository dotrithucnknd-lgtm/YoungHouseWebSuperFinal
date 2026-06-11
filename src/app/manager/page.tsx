"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { formatVND } from "@/lib/ctvServices";
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

interface ManagerDashboardStats {
  totalRooms: number;
  availableRooms: number;
  rentedRooms: number;
  maintenanceRooms: number;
  activeContracts: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  monthlyRevenue: number;
  pendingMaintenance: number;
  totalCTVs: number;
  pendingCTVs: number;
  pendingCommissionsCount: number;
  pendingCommissionsAmount: number;
  totalPaidCommissions: number;
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<ManagerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadManagerStats();
  }, []);

  const loadManagerStats = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

      const [
        roomUnitsResult,
        activeContractsResult,
        unpaidInvoicesResult,
        overdueInvoicesResult,
        monthlyRevenueResult,
        maintenanceTicketsResult,
        ctvProfilesResult,
        commissionsResult,
      ] = await Promise.all([
        supabase.from("room_units").select("status"),
        supabase
          .from("contracts")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("invoices")
          .select("id", { count: "exact", head: true })
          .eq("status", "unpaid"),
        supabase
          .from("invoices")
          .select("id", { count: "exact", head: true })
          .eq("status", "overdue"),
        supabase
          .from("invoices")
          .select("total_amount")
          .eq("status", "paid")
          .gte("paid_at", monthStart)
          .lt("paid_at", monthEnd),
        supabase
          .from("maintenance_tickets")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase.from("ctv_profiles").select("status, total_paid"),
        supabase.from("ctv_commissions").select("status, amount").eq("status", "pending"),
      ]);

      const roomUnits = roomUnitsResult.data;
      const totalRooms = roomUnits?.length || 0;
      const availableRooms = roomUnits?.filter((r) => r.status === "available").length || 0;
      const rentedRooms = roomUnits?.filter((r) => r.status === "rented").length || 0;
      const maintenanceRooms = roomUnits?.filter((r) => r.status === "maintenance").length || 0;

      const activeContracts = activeContractsResult.count;
      const unpaidInvoices = unpaidInvoicesResult.count || 0;
      const overdueInvoices = overdueInvoicesResult.count || 0;
      const monthlyRevenue =
        monthlyRevenueResult.data?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;

      let pendingMaintenance = maintenanceTicketsResult.count || 0;
      if (maintenanceTicketsResult.error) {
        const { count } = await supabase
          .from("maintenance_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending");
        pendingMaintenance = count || 0;
      }

      const ctvProfiles = ctvProfilesResult.data;
      const totalCTVs = ctvProfiles?.length || 0;
      const pendingCTVs = ctvProfiles?.filter((c) => c.status === "pending").length || 0;
      const totalPaidCommissions = ctvProfiles?.reduce((sum, c) => sum + (c.total_paid || 0), 0) || 0;

      const pendingComms = commissionsResult.data || [];
      const pendingCommissionsCount = pendingComms.length;
      const pendingCommissionsAmount = pendingComms.reduce((sum, c) => sum + (c.amount || 0), 0);

      setStats({
        totalRooms,
        availableRooms,
        rentedRooms,
        maintenanceRooms,
        activeContracts: activeContracts || 0,
        unpaidInvoices,
        overdueInvoices,
        monthlyRevenue,
        pendingMaintenance,
        totalCTVs,
        pendingCTVs,
        pendingCommissionsCount,
        pendingCommissionsAmount,
        totalPaidCommissions
      });
    } catch (error) {
      console.error("Error loading manager dashboard statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const roomOccupancyRate = stats?.totalRooms ? Math.round((stats.rentedRooms / stats.totalRooms) * 100) : 0;

  const dashboardCards = [
    {
      name: "Quy mô phòng trọ",
      value: stats?.totalRooms.toString() || "0",
      description: `${stats?.rentedRooms} đang thuê • ${stats?.availableRooms} trống`,
      icon: BuildingOfficeIcon,
      color: "bg-primary-500",
      textColor: "text-primary-500"
    },
    {
      name: "Tỷ lệ lấp đầy",
      value: `${roomOccupancyRate}%`,
      description: "Tỷ lệ phòng đang có khách ở",
      icon: CheckBadgeIcon,
      color: "bg-green-500",
      textColor: "text-green-500"
    },
    {
      name: "Cộng tác viên (CTV)",
      value: stats?.totalCTVs.toString() || "0",
      description: stats?.pendingCTVs ? `${stats.pendingCTVs} hồ sơ đang chờ duyệt` : "Hoạt động ổn định",
      icon: UsersIcon,
      color: "bg-purple-500",
      textColor: "text-purple-500"
    },
    {
      name: "Sự cố kỹ thuật chờ xử lý",
      value: stats?.pendingMaintenance.toString() || "0",
      description: "Yêu cầu bảo trì từ khách thuê",
      icon: WrenchScrewdriverIcon,
      color: "bg-orange-500",
      textColor: "text-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-6000 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <h2 className="text-xl md:text-3xl font-bold">Chào mừng quay trở lại, Chị Nhường!</h2>
        <p className="mt-2 text-white/90 text-sm md:text-base max-w-2xl">
          YoungHouse đang hoạt động với hiệu suất tốt. Dưới đây là dữ liệu thống kê tổng thể toàn hệ thống phòng trọ và mạng lưới Cộng tác viên.
        </p>
      </div>

      {/* Grid thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`${stat.color} p-3 rounded-lg text-white shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate">{stat.name}</p>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stat.value}</h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 truncate">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid 2 cột: Báo cáo tài chính & Phê duyệt nhanh ctv */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doanh thu tháng này */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Doanh thu phòng trọ tháng này</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Tổng hợp hóa đơn đã thu thành công</p>
              </div>
              <div className="p-2.5 bg-primary-50 dark:bg-neutral-900 rounded-lg text-primary-6000">
                <BanknotesIcon className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Doanh thu đã thu</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white mt-1">
                {formatVND(stats?.monthlyRevenue || 0)}
              </h2>
              <div className="flex items-center gap-1.5 mt-2 text-xs">
                <span className="flex items-center text-primary-6000 font-medium">
                  <ArrowTrendingUpIcon className="w-4.5 h-4.5 mr-0.5" />
                  Đã thanh toán
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  từ các hợp đồng thuê nhà hoạt động
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-3 bg-orange-50/50 dark:bg-orange-950/10 rounded-lg border border-orange-100/50 dark:border-orange-900/20">
                <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">Hóa đơn chưa thu</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">{stats?.unpaidInvoices || 0}</p>
              </div>
              <div className="p-3 bg-red-50/50 dark:bg-red-950/10 rounded-lg border border-red-100/50 dark:border-red-900/20">
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold">Hóa đơn quá hạn</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">{stats?.overdueInvoices || 0}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-700">
            <Link
              href="/manager/revenue"
              className="text-sm font-semibold text-primary-6000 hover:text-primary-700 flex items-center gap-1.5 transition-colors"
            >
              Xem báo cáo doanh thu chi tiết
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Thống kê Cộng tác viên & Hoa hồng chờ duyệt */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Qũy hoa hồng & Cộng tác viên</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Quản lý hiệu quả chi trả hoa hồng CTV</p>
              </div>
              <div className="p-2.5 bg-purple-50 dark:bg-neutral-900 rounded-lg text-purple-500">
                <UserGroupIcon className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50/30 dark:bg-purple-950/10 rounded-xl border border-purple-100/30 dark:border-purple-900/20">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Hoa hồng chờ duyệt chi</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white mt-1">
                {formatVND(stats?.pendingCommissionsAmount || 0)}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                Có <span className="font-bold text-purple-600 dark:text-purple-400">{stats?.pendingCommissionsCount || 0} yêu cầu</span> mới đang chờ xét duyệt
              </p>
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-100 dark:border-neutral-800 text-sm">
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">Đã chi trả cho CTV</span>
                <span className="font-bold text-neutral-900 dark:text-white">{formatVND(stats?.totalPaidCommissions || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-100 dark:border-neutral-800 text-sm">
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">Tổng số Cộng tác viên hoạt động</span>
                <span className="font-bold text-neutral-900 dark:text-white">{stats?.totalCTVs || 0} thành viên</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-700">
            <Link
              href="/manager/commissions"
              className="text-sm font-semibold text-primary-6000 hover:text-primary-700 flex items-center gap-1.5 transition-colors"
            >
              Xét duyệt hoa hồng CTV ngay
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Lịch sử sự cố tòa nhà (Technical Operations) */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Giám sát kỹ thuật phòng trọ</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Kiểm soát tiến độ khắc phục sự cố tòa nhà</p>
          </div>
        </div>

        {stats && stats.pendingMaintenance > 0 ? (
          <div className="text-center py-10 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
            <WrenchScrewdriverIcon className="w-14 h-14 text-orange-500 mx-auto mb-3 animate-pulse" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              Có {stats.pendingMaintenance} báo cáo sự cố chưa xử lý
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 max-w-md mx-auto">
              Cần đốc thúc Kỹ thuật viên (Staff) nhận việc sửa chữa thiết bị để bảo đảm dịch vụ cho khách thuê.
            </p>
          </div>
        ) : (
          <div className="text-center py-10 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
            <WrenchScrewdriverIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Hệ thống ghi nhận không có sự cố nào chưa được tiếp nhận xử lý.</p>
          </div>
        )}
      </div>
    </div>
  );
}
