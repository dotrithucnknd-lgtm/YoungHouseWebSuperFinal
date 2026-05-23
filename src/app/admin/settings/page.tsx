"use client";

import React from "react";

const AdminSettingsPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Cài đặt</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Quản lý cài đặt hệ thống và cấu hình
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          Tính năng đang phát triển
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Trang cài đặt sẽ sớm được cập nhật với các tùy chọn cấu hình hệ thống.
        </p>
      </div>
    </div>
  );
};

export default AdminSettingsPage;


