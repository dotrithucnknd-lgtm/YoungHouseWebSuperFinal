"use client";

import React from "react";

const AdminAnalyticsPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Phân tích & Báo cáo
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Thống kê và phân tích hoạt động hệ thống
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl p-12 shadow-sm text-center">
        <svg
          className="mx-auto h-24 w-24 text-neutral-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          Tính năng đang phát triển
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Trang phân tích sẽ sớm được cập nhật với các biểu đồ và thống kê chi tiết.
        </p>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

