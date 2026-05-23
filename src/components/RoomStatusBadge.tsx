import React, { FC } from "react";
import type { RoomStatus } from "@/data/types";

export interface RoomStatusBadgeProps {
  status?: RoomStatus | null;
  className?: string;
}

const RoomStatusBadge: FC<RoomStatusBadgeProps> = ({ status, className = "" }) => {
  if (!status) return null;

  const config: Record<RoomStatus, { label: string; className: string }> = {
    reserved: {
      label: "Đặt trước",
      className: "text-amber-900 bg-amber-100/95 border-amber-200",
    },
    available: {
      label: "Còn phòng",
      className: "text-emerald-900 bg-emerald-100/95 border-emerald-200",
    },
    sold_out: {
      label: "Hết phòng",
      className: "text-rose-900 bg-rose-100/95 border-rose-200",
    },
  };

  const c = config[status];

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        "border shadow-sm backdrop-blur",
        c.className,
        className,
      ].join(" ")}
    >
      {c.label}
    </span>
  );
};

export default RoomStatusBadge;

