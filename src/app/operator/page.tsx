"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  WrenchScrewdriverIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOwnerDashboardStats, type DashboardStats } from "@/lib/landlordServices";

export default function OperatorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await fetchOwnerDashboardStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    { 
      name: "Tổng số phòng", 
      value: stats?.totalRoomUnits.toString() || "0", 
      icon: BuildingOfficeIcon, 
      color: "bg-primary-500" 
    },
    { 
      name: "Phòng đang trống", 
      value: stats?.availableRoomUnits.toString() || "0", 
      icon: BuildingOfficeIcon, 
      color: "bg-green-500" 
    },
    { 
      name: "Phòng đang thuê", 
      value: stats?.rentedRoomUnits.toString() || "0", 
      icon: UserGroupIcon, 
      color: "bg-blue-500" 
    },
    { 
      name: "Hóa đơn chưa thu", 
      value: stats?.unpaidInvoices.toString() || "0", 
      icon: DocumentTextIcon, 
      color: "bg-orange-500" 
    },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-lg text-white`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.name}</p>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doanh thu tháng này */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Doanh thu tháng này</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Từ tiền thuê phòng và dịch vụ</p>
              </div>
              <div className="p-2 bg-primary-6000/10 rounded-lg text-primary-6000">
                <BanknotesIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-4xl font-bold text-neutral-900 dark:text-white">
                {formatCurrency(stats?.monthlyRevenue || 0)}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="flex items-center text-primary-6000 font-medium">
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  Tháng này
                </span>
                <span className="text-neutral-500">từ {stats?.rentedRoomUnits || 0} phòng đang thuê</span>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Link href="/operator/invoices" className="text-sm font-medium text-primary-6000 hover:text-primary-700 flex items-center gap-1">
              Xem chi tiết hóa đơn
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Hóa đơn cần chú ý */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Thống kê nhanh</h3>
             <Link href="/operator/invoices" className="text-sm text-primary-6000 hover:underline">Xem chi tiết</Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Hợp đồng đang hiệu lực</p>
                <p className="text-xs text-neutral-500">Đang hoạt động</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats?.activeContracts || 0}</p>
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Hoạt động
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Hợp đồng sắp hết hạn</p>
                <p className="text-xs text-neutral-500">Trong 30 ngày tới</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats?.expiringContracts || 0}</p>
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  Cần chú ý
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Hóa đơn quá hạn</p>
                <p className="text-xs text-neutral-500">Cần thu ngay</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats?.overdueInvoices || 0}</p>
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Quá hạn
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yêu cầu bảo trì */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Yêu cầu bảo trì chờ xử lý</h3>
            <p className="text-sm text-neutral-500">Khách thuê báo hỏng hóc cần sửa chữa</p>
          </div>
          <Link href="/operator/maintenance" className="text-sm text-green-600 hover:underline">Xem tất cả</Link>
        </div>
        {stats && stats.pendingMaintenanceRequests > 0 ? (
          <div className="text-center py-8">
            <WrenchScrewdriverIcon className="w-16 h-16 text-orange-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              {stats.pendingMaintenanceRequests} yêu cầu
            </p>
            <p className="text-neutral-500 mb-4">đang chờ xử lý</p>
            <Link 
              href="/operator/maintenance"
              className="inline-flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Xử lý ngay
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <WrenchScrewdriverIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-500">Không có yêu cầu bảo trì nào đang chờ xử lý</p>
          </div>
        )}
      </div>
    </div>
  );
}
