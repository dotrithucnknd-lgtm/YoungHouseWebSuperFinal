"use client";

import React from "react";
import Link from "next/link";
import { useCompare } from "@/contexts/CompareContext";

export default function CompareFloatingButton() {
  const { compareCount } = useCompare();

  if (compareCount === 0) {
    return null;
  }

  return (
    <Link
      href="/compare"
      className="fixed bottom-6 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
        />
      </svg>
      <span className="font-semibold">So sánh ({compareCount})</span>
      <span className="bg-blue-600 group-hover:bg-blue-700 rounded-full px-2 py-0.5 text-sm">
        {compareCount}/4
      </span>
    </Link>
  );
}

