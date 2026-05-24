"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import StaffSidebar from "@/components/staff/StaffSidebar";
import StaffHeader from "@/components/staff/StaffHeader";
import StaffBottomNav from "@/components/staff/StaffBottomNav";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/staff": {
    title: "Tổng quan kỹ thuật",
    subtitle: "Thống kê và quản lý các công việc sửa chữa thiết bị, sự cố tòa nhà",
  },
  "/staff/tasks": {
    title: "Nhiệm vụ sửa chữa",
    subtitle: "Danh sách các sự cố hỏng hóc phòng trọ/tòa nhà được giao xử lý",
  },
  "/staff/settings/account": {
    title: "Thông tin tài khoản",
    subtitle: "Quản lý thông tin đăng nhập và cài đặt bảo mật",
  },
  "/staff/settings/profile": {
    title: "Thông tin cá nhân",
    subtitle: "Cập nhật thông tin cá nhân và hồ sơ kỹ thuật viên",
  },
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Only allow 'staff' and 'admin' roles to access the staff portal
    if (!loading && (!user || (user.role !== "staff" && user.role !== "admin"))) {
      router.push("/");
    }
  }, [user, loading, router]);

  const pageInfo = pageTitles[pathname] || { title: "", subtitle: "" };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user || (user.role !== "staff" && user.role !== "admin")) {
    return null;
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar */}
      <StaffSidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <StaffHeader
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onMobileMenuClick={() => setIsMobileMenuOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20 lg:pb-6">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <StaffBottomNav onMenuClick={() => setIsMobileMenuOpen(true)} />
    </div>
  );
}
