"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchAllBookings,
  fetchPendingBookings,
  fetchAllNotifications,
} from "@/lib/supabaseServices";
import Link from "next/link";

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    totalUsers: 0,
    totalNotifications: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      // Load rooms stats
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id, status");

      // Load bookings stats
      const { bookings: allBookings } = await fetchAllBookings();
      const { bookings: pendingBookings } = await fetchPendingBookings();

      // Load users count
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      // Load notifications count
      const { notifications } = await fetchAllNotifications();

      setStats({
        totalRooms: rooms?.length || 0,
        availableRooms:
          rooms?.filter((r) => r.status === "available").length || 0,
        occupiedRooms:
          rooms?.filter((r) => r.status === "occupied").length || 0,
        totalBookings: allBookings?.length || 0,
        pendingBookings: pendingBookings?.length || 0,
        approvedBookings:
          allBookings?.filter((b) => b.status === "approved").length || 0,
        totalUsers: users?.length || 0,
        totalNotifications: notifications?.length || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const statCards = [
    {
      title: "Tổng số phòng",
      value: stats.totalRooms,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      color: "from-blue-500 to-blue-600",
      link: "/admin/rooms",
    },
    {
      title: "Phòng còn trống",
      value: stats.availableRooms,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "from-green-500 to-green-600",
      link: "/admin/rooms",
    },
    {
      title: "Đơn đặt phòng",
      value: stats.totalBookings,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      color: "from-purple-500 to-purple-600",
      link: "/admin/bookings",
    },
    {
      title: "Chờ duyệt",
      value: stats.pendingBookings,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "from-orange-500 to-orange-600",
      link: "/admin/bookings",
    },
    {
      title: "Tổng người dùng",
      value: stats.totalUsers,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      color: "from-pink-500 to-pink-600",
      link: "/admin/users",
    },
    {
      title: "Thông báo",
      value: stats.totalNotifications,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      color: "from-indigo-500 to-indigo-600",
      link: "/admin/notifications",
    },
  ];

  const quickActions = [
    {
      title: "Quản lý phòng",
      description: "Thêm, sửa, xóa phòng trọ",
      href: "/admin/rooms",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Duyệt đơn đặt phòng",
      description: "Xem và duyệt đơn đặt phòng",
      href: "/admin/bookings",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Quản lý thông báo",
      description: "Tạo và quản lý thông báo",
      href: "/admin/notifications",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Xét duyệt Pass phòng",
      description: "Duyệt bài đăng chuyển nhượng",
      href: "/admin/pass-phong",
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Tổng quan hệ thống và quản lý
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link
            key={index}
            href={card.link}
            className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-neutral-200 dark:border-neutral-700 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`bg-gradient-to-br ${card.color} rounded-lg p-3 text-white`}
              >
                {card.icon}
              </div>
              <svg
                className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              {card.title}
            </h3>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={`${action.color} text-white rounded-lg p-6 hover:scale-105 transition-transform shadow-md`}
            >
              <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
