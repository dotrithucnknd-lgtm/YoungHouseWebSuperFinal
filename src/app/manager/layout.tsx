"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ManagerSidebar from "@/components/manager/ManagerSidebar";
import ManagerHeader from "@/components/manager/ManagerHeader";
import ManagerBottomNav from "@/components/manager/ManagerBottomNav";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/manager": {
    title: "Giám sát vận hành tổng thể",
    subtitle: "Thống kê tình trạng phòng trọ, khách thuê và hoạt động toàn hệ thống",
  },
  "/manager/revenue": {
    title: "Báo cáo doanh thu",
    subtitle: "Quản lý dòng tiền, thống kê hóa đơn và theo dõi tăng trưởng doanh thu",
  },
  "/manager/commissions": {
    title: "Duyệt hoa hồng CTV",
    subtitle: "Xem danh sách giao dịch giới thiệu và phê duyệt chi trả hoa hồng cho CTV",
  },
};

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Only allow 'manager' and 'admin' roles to access the manager dashboard
    if (!loading && (!user || (user.role !== "manager" && user.role !== "admin"))) {
      router.push("/");
    }
  }, [user, loading, router]);

  const pageInfo = pageTitles[pathname] || { title: "Giám sát vận hành", subtitle: "" };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user || (user.role !== "manager" && user.role !== "admin")) {
    return null;
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar */}
      <ManagerSidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <ManagerHeader
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
      <ManagerBottomNav onMenuClick={() => setIsMobileMenuOpen(true)} />
    </div>
  );
}
