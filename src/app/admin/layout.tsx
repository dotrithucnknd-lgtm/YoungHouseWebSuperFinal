"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Dashboard",
    subtitle: "Tổng quan hệ thống và quản lý",
  },
  "/admin/rooms": {
    title: "Quản lý phòng trọ",
    subtitle: "Thêm, sửa, xóa và quản lý phòng trọ",
  },
  "/admin/bookings": {
    title: "Quản lý đặt phòng",
    subtitle: "Xem và duyệt đơn đặt phòng từ khách hàng",
  },
  "/admin/notifications": {
    title: "Quản lý thông báo",
    subtitle: "Tạo và quản lý thông báo cho người dùng",
  },
  "/admin/pass-phong": {
    title: "Xét duyệt Pass phòng",
    subtitle: "Duyệt bài đăng chuyển nhượng phòng",
  },
  "/admin/ctv": {
    title: "Quản lý CTV & Hoa hồng",
    subtitle: "Quản lý cộng tác viên sale và hệ thống hoa hồng",
  },
  "/admin/users": {
    title: "Quản lý người dùng",
    subtitle: "Xem và quản lý tất cả người dùng trong hệ thống",
  },
  "/admin/analytics": {
    title: "Phân tích & Báo cáo",
    subtitle: "Thống kê và phân tích hoạt động hệ thống",
  },
  "/admin/settings": {
    title: "Cài đặt",
    subtitle: "Quản lý cài đặt hệ thống và cấu hình",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  const pageInfo = pageTitles[pathname] || { title: "", subtitle: "" };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onMobileMenuClick={() => setIsMobileMenuOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
          <div className="max-w-7xl mx-auto p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}


