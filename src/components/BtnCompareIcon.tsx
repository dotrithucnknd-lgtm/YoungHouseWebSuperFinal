"use client";

import React, { FC, useState } from "react";
import { useCompare } from "@/contexts/CompareContext";
import { StayDataType } from "@/data/types";

export interface BtnCompareIconProps {
  className?: string;
  colorClass?: string;
  room?: StayDataType;
  showTooltip?: boolean;
}

const BtnCompareIcon: FC<BtnCompareIconProps> = ({
  className = "",
  colorClass = "text-white bg-black bg-opacity-30 hover:bg-opacity-50",
  room,
  showTooltip = true,
}) => {
  const { addToCompare, removeFromCompare, isInCompare, compareCount } = useCompare();
  const [isComparing, setIsComparing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check initial state
  React.useEffect(() => {
    if (room) {
      setIsComparing(isInCompare(room.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, isInCompare]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!room) {
      console.error("Room data is required");
      return;
    }

    setLoading(true);

    if (isComparing) {
      // Remove from compare
      removeFromCompare(room.id);
      setIsComparing(false);
    } else {
      // Add to compare
      const success = addToCompare(room);
      if (success) {
        setIsComparing(true);
      } else {
        if (compareCount >= 4) {
          alert("Bạn chỉ có thể so sánh tối đa 4 phòng. Vui lòng xóa một phòng khỏi danh sách so sánh trước.");
        } else {
          alert("Phòng này đã có trong danh sách so sánh");
        }
      }
    }

    setLoading(false);
  };

  if (!room) return null;

  return (
    <div
      className={`nc-BtnCompareIcon w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all ${
        isComparing
          ? "text-blue-500 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
          : colorClass
      } ${className} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      data-nc-id="BtnCompareIcon"
      title={
        showTooltip
          ? isComparing
            ? "Bỏ so sánh"
            : "Thêm vào so sánh"
          : ""
      }
      onClick={handleClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${isComparing ? "text-blue-600" : ""}`}
        fill={isComparing ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
        />
      </svg>
      {isComparing && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
    </div>
  );
};

export default BtnCompareIcon;

