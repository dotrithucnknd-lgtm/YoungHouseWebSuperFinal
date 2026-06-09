"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Lazy load heavy components
const SiteHeader = dynamic(() => import("@/app/(client-components)/(Header)/SiteHeader"), {
  ssr: true,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: true,
});
const FooterNav = dynamic(() => import("@/components/FooterNav"), {
  ssr: true,
});

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isOperatorRoute = pathname?.startsWith('/operator');
  const isTenantRoute = pathname?.startsWith('/tenant');
  const isStaffRoute = pathname?.startsWith('/staff');
  const isManagerRoute = pathname?.startsWith('/manager');
  const isSalesRoute = pathname?.startsWith('/ctv');

  if (isAdminRoute || isOperatorRoute || isTenantRoute || isStaffRoute || isManagerRoute || isSalesRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <FooterNav />
      <Footer />
    </>
  );
}