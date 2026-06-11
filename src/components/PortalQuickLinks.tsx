"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  detectPortalFromPath,
  getAccessiblePortals,
} from "@/constants/portalLinks";
import { isMasterRole } from "@/utils/roles";

interface PortalQuickLinksProps {
  role?: string | null;
  onNavigate?: () => void;
}

export default function PortalQuickLinks({
  role,
  onNavigate,
}: PortalQuickLinksProps) {
  const pathname = usePathname();
  const currentPortal = detectPortalFromPath(pathname || "");

  const portals = getAccessiblePortals(role, {
    excludePortal: isMasterRole(role) ? currentPortal : null,
  });

  if (portals.length === 0) return null;

  return (
    <>
      {isMasterRole(role) && (
        <p className="px-2 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          Chuyển portal
        </p>
      )}
      {portals.map((portal) => (
        <Link
          key={portal.href}
          href={portal.href}
          className={`flex items-center p-2 -m-3 transition duration-150 ease-in-out rounded-lg focus:outline-none ${portal.dropdownClass}`}
          onClick={onNavigate}
        >
          <div className="flex items-center justify-center flex-shrink-0">
            <span className="text-xl">{portal.emoji}</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-bold">{portal.label}</p>
          </div>
        </Link>
      ))}
      <div className="w-full border-b border-neutral-200 dark:border-neutral-700" />
    </>
  );
}
