"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessPortal } from "@/utils/roles";
import { TenantProvider, useTenant } from "./TenantContext";
import TenantSidebar from "@/components/tenant/TenantSidebar";
import TenantHeader from "@/components/tenant/TenantHeader";
import TenantBottomNav from "@/components/tenant/TenantBottomNav";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/tenant": {
    title: "Tổng quan",
    subtitle: "Thống kê dịch vụ & thông tin phòng trọ của bạn",
  },
  "/tenant/contract": {
    title: "Hợp đồng thuê phòng",
    subtitle: "Chi tiết các điều khoản hợp đồng và tiền cọc",
  },
  "/tenant/invoices": {
    title: "Hóa đơn thanh toán",
    subtitle: "Lịch sử hóa đơn và thực hiện thanh toán online",
  },
  "/tenant/utilities": {
    title: "Chỉ số điện nước",
    subtitle: "Theo dõi lượng điện nước tiêu thụ hàng tháng",
  },
  "/tenant/maintenance": {
    title: "Báo sự cố phòng",
    subtitle: "Gửi yêu cầu sửa chữa và xem tiến độ xử lý sự cố",
  },
  "/tenant/settings": {
    title: "Cài đặt tài khoản",
    subtitle: "Quản lý thông tin cá nhân và mật khẩu của bạn",
  },
  "/tenant/surveys": {
    title: "Khảo sát dịch vụ",
    subtitle: "Góp ý để Young House cải thiện chất lượng phục vụ",
  },
};

function TenantDashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const { invoices, loading: tenantLoading } = useTenant();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !canAccessPortal(user.role, "tenant"))) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const pageInfo =
    pageTitles[pathname] ||
    (pathname.startsWith("/tenant/surveys")
      ? pageTitles["/tenant/surveys"]
      : { title: "", subtitle: "" });
  const unpaidCount = invoices.filter((i) => i.status === "unpaid").length;

  if (authLoading || (tenantLoading && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user || !canAccessPortal(user.role, "tenant")) {
    return null;
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden text-neutral-800 dark:text-neutral-200">
      {/* Sidebar */}
      <TenantSidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        unpaidCount={unpaidCount}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <TenantHeader
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
      <TenantBottomNav onMenuClick={() => setIsMobileMenuOpen(true)} />
    </div>
  );
}

export default function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      <TenantDashboardLayoutContent>{children}</TenantDashboardLayoutContent>
    </TenantProvider>
  );
}
