"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchActiveNotifications, DatabaseNotification } from "@/lib/supabaseServices";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

const NotificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user && user.role) {
      loadNotifications();
    }
  }, [user]);

  useEffect(() => {
    // Load dismissed IDs from localStorage
    const saved = localStorage.getItem('dismissedNotifications');
    if (saved) {
      try {
        setDismissedIds(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Error loading dismissed notifications:', e);
      }
    }
  }, []);

  const loadNotifications = async () => {
    if (!user?.role) return;

    const { notifications: data, error } = await fetchActiveNotifications(user.role);
    
    if (!error && data) {
      setNotifications(data);
    }
  };

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
    
    // Save to localStorage
    localStorage.setItem('dismissedNotifications', JSON.stringify(Array.from(newDismissed)));
  };

  const getIcon = (type: string) => {
    const className = "h-6 w-6";
    switch (type) {
      case 'info':
        return <InformationCircleIcon className={className} />;
      case 'warning':
        return <ExclamationTriangleIcon className={className} />;
      case 'success':
        return <CheckCircleIcon className={className} />;
      case 'error':
        return <XCircleIcon className={className} />;
      default:
        return <InformationCircleIcon className={className} />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-200';
    }
  };

  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id));

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg p-4 ${getColorClasses(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">
                {notification.title}
              </h4>
              <p className="text-sm whitespace-pre-wrap">
                {notification.content}
              </p>
            </div>
            <button
              onClick={() => handleDismiss(notification.id)}
              className="flex-shrink-0 rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Đóng thông báo"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationBanner;


