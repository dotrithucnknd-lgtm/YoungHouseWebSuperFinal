"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessPortal } from "@/utils/roles";
import SalesSidebar from "@/components/sales/SalesSidebar";
import SalesBottomNav from "@/components/sales/SalesBottomNav";
import SalesHeader from "@/components/sales/SalesHeader";
import { useSalesProfile } from "@/hooks/useSalesProfile";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/ctv": {
    title: "Tổng quan Sales",
    subtitle: "Theo dõi giới thiệu, hoa hồng và link referral",
  },
  "/ctv/rooms": {
    title: "Phòng trống",
    subtitle: "Danh sách phòng để tư vấn và giới thiệu khách",
  },
  "/ctv/referrals": {
    title: "Lịch sử giới thiệu",
    subtitle: "Theo dõi các lượt giới thiệu khách thuê",
  },
  "/ctv/commissions": {
    title: "Hoa hồng",
    subtitle: "Lịch sử và trạng thái thanh toán hoa hồng",
  },
  "/ctv/settings": {
    title: "Cài đặt",
    subtitle: "Thông tin tài khoản và ngân hàng nhận hoa hồng",
  },
};

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { profile } = useSalesProfile();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !canAccessPortal(user.role, "sales"))) {
      router.push("/");
    }
  }, [user, loading, router]);

  const pageInfo =
    pageTitles[pathname] ||
    (pathname.startsWith("/ctv") ? pageTitles["/ctv"] : { title: "Sales", subtitle: "" });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!user || !canAccessPortal(user.role, "sales")) {
    return null;
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      <SalesSidebar
        userName={user.name}
        referralCode={profile?.referral_code}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <SalesHeader
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          referralCode={profile?.referral_code}
          onMobileMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20 lg:pb-6">{children}</div>
        </main>
      </div>

      <SalesBottomNav
        referralCode={profile?.referral_code}
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />
    </div>
  );
}
