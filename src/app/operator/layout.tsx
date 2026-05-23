"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import OperatorSidebar from "@/components/operator/OperatorSidebar";
import OperatorHeader from "@/components/operator/OperatorHeader";
import OperatorBottomNav from "@/components/operator/OperatorBottomNav";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/operator": {
    title: "Tổng quan",
    subtitle: "Thống kê hoạt động vận hành khu trọ",
  },
  "/operator/properties": {
    title: "Quản lý Nhà trọ",
    subtitle: "Danh sách các tòa nhà/khu trọ của bạn",
  },
  "/operator/properties/new": {
    title: "Thêm nhà trọ mới",
    subtitle: "Điền thông tin chi tiết về nhà trọ của bạn",
  },
  "/operator/rooms": {
    title: "Quản lý Phòng",
    subtitle: "Quản lý danh sách các phòng trong khu trọ",
  },
  "/operator/tenants": {
    title: "Quản lý khách thuê",
    subtitle: "Quản lý thông tin lưu trú của khách",
  },
  "/operator/contracts": {
    title: "Quản lý hợp đồng",
    subtitle: "Lập và theo dõi hợp đồng thuê phòng",
  },
  "/operator/invoices": {
    title: "Hóa đơn",
    subtitle: "Quản lý hóa đơn và thanh toán hàng tháng",
  },
  "/operator/services": {
    title: "Dịch vụ",
    subtitle: "Cấu hình bảng giá điện, nước, internet, rác",
  },
  "/operator/maintenance": {
    title: "Bảo trì",
    subtitle: "Tiếp nhận và xử lý yêu cầu sửa chữa từ khách thuê",
  },
  "/operator/settings/account": {
    title: "Thông tin tài khoản",
    subtitle: "Quản lý thông tin đăng nhập và bảo mật",
  },
  "/operator/settings/profile": {
    title: "Thông tin cá nhân",
    subtitle: "Cập nhật thông tin cá nhân và ảnh đại diện",
  },
  "/operator/settings/contact": {
    title: "Thông tin liên hệ trọ",
    subtitle: "Thông tin liên hệ hiển thị cho khách thuê",
  },
  "/operator/settings/business": {
    title: "Thông tin doanh nghiệp",
    subtitle: "Thông tin kinh doanh và tài khoản thanh toán",
  },
  "/operator/system/activity": {
    title: "Lịch sử hoạt động",
    subtitle: "Xem lại các hoạt động gần đây trên hệ thống",
  },
  "/operator/system/notifications": {
    title: "Thông báo",
    subtitle: "Quản lý thông báo của bạn",
  },
};

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Cho phép operator và admin truy cập
    if (!loading && (!user || (user.role !== "operator" && user.role !== "admin"))) {
      router.push("/");
    }
  }, [user, loading, router]);

  const pageInfo = pageTitles[pathname] || (() => {
    // Handle dynamic routes
    if (pathname.match(/^\/operator\/properties\/[^/]+\/edit$/)) {
      return { title: "Chỉnh sửa nhà trọ", subtitle: "Cập nhật thông tin nhà trọ" };
    }
    if (pathname.match(/^\/operator\/properties\/[^/]+$/)) {
      return { title: "Chi tiết nhà trọ", subtitle: "Xem thông tin chi tiết nhà trọ" };
    }
    return { title: "", subtitle: "" };
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user || (user.role !== "operator" && user.role !== "admin")) {
    return null;
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar */}
      <OperatorSidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <OperatorHeader
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
      <OperatorBottomNav onMenuClick={() => setIsMobileMenuOpen(true)} />
    </div>
  );
}
