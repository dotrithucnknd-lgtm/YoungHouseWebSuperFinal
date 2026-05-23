"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { 
  ClockIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface ActivityLog {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  metadata?: any;
}

export default function ActivityHistoryPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (user?.id) {
      loadActivities();
    }
  }, [user]);

  const loadActivities = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Get activities from various sources
      const allActivities: ActivityLog[] = [];

      // Get rooms created
      const { data: rooms } = await supabase
        .from("rooms")
        .select("id, title, created_at, updated_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      rooms?.forEach((room) => {
        allActivities.push({
          id: `room-${room.id}`,
          type: "room",
          title: "Tạo nhà trọ",
          description: `Đã tạo nhà trọ "${room.title}"`,
          created_at: room.created_at,
        });
      });

      // Get tenants created (through tenant_profiles linked to owner's rooms)
      const { data: tenantProfiles } = await supabase
        .from("tenant_profiles")
        .select(`
          id,
          created_at,
          profiles (id, name)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      tenantProfiles?.forEach((tp: any) => {
        allActivities.push({
          id: `tenant-${tp.id}`,
          type: "tenant",
          title: "Thêm khách thuê",
          description: `Đã thêm khách thuê "${tp.profiles?.name || "N/A"}"`,
          created_at: tp.created_at,
        });
      });

      // Sort by date desc
      allActivities.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setActivities(allActivities);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "room":
        return <HomeIcon className="w-5 h-5" />;
      case "tenant":
        return <UserIcon className="w-5 h-5" />;
      case "contract":
        return <DocumentTextIcon className="w-5 h-5" />;
      case "create":
        return <PlusIcon className="w-5 h-5" />;
      case "update":
        return <PencilIcon className="w-5 h-5" />;
      case "delete":
        return <TrashIcon className="w-5 h-5" />;
      case "complete":
        return <CheckCircleIcon className="w-5 h-5" />;
      case "logout":
        return <ArrowRightOnRectangleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "room":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "tenant":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      case "contract":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "delete":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return past.toLocaleDateString("vi-VN");
  };

  const filteredActivities = filter === "all" 
    ? activities 
    : activities.filter(a => a.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Lịch sử hoạt động
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Xem lại các hoạt động gần đây trên hệ thống
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "Tất cả" },
          { value: "room", label: "Nhà trọ" },
          { value: "tenant", label: "Khách thuê" },
          { value: "contract", label: "Hợp đồng" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-green-600 text-white"
                : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-500">Chưa có hoạt động nào</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                <div className={`flex-shrink-0 p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {activity.description}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {formatTimeAgo(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

