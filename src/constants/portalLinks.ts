import { PortalRole } from "@/utils/roles";

export interface PortalLink {
  id: PortalRole;
  href: string;
  label: string;
  shortLabel: string;
  emoji: string;
  dropdownClass: string;
  navClass: string;
}

export const SYSTEM_PORTALS: PortalLink[] = [
  {
    id: "admin",
    href: "/admin",
    label: "Quản Trị Hệ Thống (Admin)",
    shortLabel: "Admin",
    emoji: "⚙️",
    dropdownClass:
      "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200/30 hover:bg-red-100 dark:hover:bg-red-950/50",
    navClass:
      "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50",
  },
  {
    id: "manager",
    href: "/manager",
    label: "Giám Sát Vận Hành (Manager)",
    shortLabel: "Quản lý",
    emoji: "📊",
    dropdownClass:
      "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200/30 hover:bg-purple-100 dark:hover:bg-purple-950/50",
    navClass:
      "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50",
  },
  {
    id: "operator",
    href: "/operator",
    label: "Vận Hành Kỹ Thuật (Operator)",
    shortLabel: "Vận hành",
    emoji: "🔧",
    dropdownClass:
      "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200/30 hover:bg-green-100 dark:hover:bg-green-950/50",
    navClass:
      "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50",
  },
  {
    id: "staff",
    href: "/staff",
    label: "Bảng Nhân Viên (Staff)",
    shortLabel: "Nhân viên",
    emoji: "💼",
    dropdownClass:
      "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200/30 hover:bg-blue-100 dark:hover:bg-blue-950/50",
    navClass:
      "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50",
  },
  {
    id: "sales",
    href: "/ctv",
    label: "Dashboard Sales (/ctv)",
    shortLabel: "Sales",
    emoji: "📈",
    dropdownClass:
      "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border border-teal-200/30 hover:bg-teal-100 dark:hover:bg-teal-950/50",
    navClass:
      "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50",
  },
  {
    id: "tenant",
    href: "/tenant",
    label: "Trang Cư Dân (Tenant)",
    shortLabel: "Cư dân",
    emoji: "🏠",
    dropdownClass:
      "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50",
    navClass:
      "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
  },
];

export function detectPortalFromPath(pathname: string): PortalRole | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/manager")) return "manager";
  if (pathname.startsWith("/operator")) return "operator";
  if (pathname.startsWith("/staff")) return "staff";
  if (pathname.startsWith("/ctv")) return "sales";
  if (pathname.startsWith("/tenant")) return "tenant";
  return null;
}

export function getAccessiblePortals(
  role?: string | null,
  options?: { excludePortal?: PortalRole | null }
): PortalLink[] {
  if (!role) return [];

  let portals: PortalLink[];
  if (role === "admin") {
    portals = SYSTEM_PORTALS;
  } else if (role === "manager") {
    portals = SYSTEM_PORTALS.filter(
      (p) => p.id !== "admin" && p.id !== "tenant" && p.id !== "sales"
    );
  } else {
    portals = SYSTEM_PORTALS.filter((p) => p.id === role);
  }

  if (options?.excludePortal) {
    portals = portals.filter((p) => p.id !== options.excludePortal);
  }

  return portals;
}
