"use client";

import { CustomLink } from "@/data/types";
import React, { FC } from "react";
import twFocusClass from "@/utils/twFocusClass";
import Link from "next/link";
import { Route } from "@/routers/types";

export interface PaginationProps {
  className?: string;
  currentPage?: number; // 1-based
  totalPages?: number; // total pages from data
  makeHref?: (page: number) => string;
  onPageChange?: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({ className = "", currentPage = 1, totalPages = 1, makeHref, onPageChange }) => {
  const safeTotal = Math.max(1, totalPages || 1);
  const pages = Array.from({ length: safeTotal }, (_, i) => i + 1);
  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= safeTotal;

  const handleChange = (p: number) => {
    if (onPageChange) onPageChange(p);
  };

  const renderPage = (p: number) => {
    const isActive = p === currentPage;
    if (isActive) {
      return (
        <span key={p} className={`inline-flex w-11 h-11 items-center justify-center rounded-full bg-primary-6000 text-white ${twFocusClass()}`}>
          {p}
        </span>
      );
    }
    if (onPageChange) {
      return (
        <button
          key={p}
          type="button"
          onClick={() => handleChange(p)}
          className={`inline-flex w-11 h-11 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`}
        >
          {p}
        </button>
      );
    }
    const href = makeHref ? (makeHref(p) as Route) : ("#" as Route);
    return (
      <Link
        key={p}
        className={`inline-flex w-11 h-11 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`}
        href={href}
      >
        {p}
      </Link>
    );
  };

  return (
    <nav className={`nc-Pagination inline-flex space-x-1 text-base font-medium ${className}`}>
      {pages.map((p) => renderPage(p))}
    </nav>
  );
};

export default Pagination;
