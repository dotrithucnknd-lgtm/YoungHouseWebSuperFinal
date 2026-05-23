"use client";

import React, { useEffect, useState } from "react";
import { ReactNode } from "react";
import { getTotalRoomsCount } from "@/lib/supabaseServices";

export interface Heading2Props {
  heading?: ReactNode;
  subHeading?: ReactNode;
  className?: string;
}

const Heading2: React.FC<Heading2Props> = ({
  className = "",
  heading = "Nhà trọ, phòng trọ",
  subHeading,
}) => {
  const [totalRooms, setTotalRooms] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTotalRooms = async () => {
      try {
        const count = await getTotalRoomsCount();
        setTotalRooms(count);
      } catch (error) {
        console.error("Error loading total rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTotalRooms();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  return (
    <div className={`mt-[25px] mb-12 lg:mb-16 ${className}`}>
      <h2 className="text-4xl font-semibold">{heading}</h2>
      {subHeading ? (
        subHeading
      ) : (
        <span className="block text-neutral-500 dark:text-neutral-400 mt-3">
          {loading ? (
            "Đang tải..."
          ) : totalRooms !== null ? (
            `Tổng  ${formatNumber(totalRooms)} kết quả`
          ) : (
            "Tổng số phòng trọ"
          )}
        </span>
      )}
    </div>
  );
};

export default Heading2;
