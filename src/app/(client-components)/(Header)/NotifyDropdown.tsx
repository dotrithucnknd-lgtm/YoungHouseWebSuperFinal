"use client";

import { Popover, Transition } from "@headlessui/react";
import { FC, Fragment, useEffect, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "@/contexts/AuthContext";
import { fetchActiveNotifications, DatabaseNotification } from "@/lib/supabaseServices";

interface Props {
  className?: string;
}

const NotifyDropdown: FC<Props> = ({ className = "" }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load read notifications from localStorage
    const saved = localStorage.getItem('readNotifications');
    if (saved) {
      try {
        setReadNotifications(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Error loading read notifications:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (user && user.role) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user?.role) return;

    setLoading(true);
    const { notifications: data, error } = await fetchActiveNotifications(user.role);
    
    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = (id: string) => {
    const newRead = new Set(readNotifications);
    newRead.add(id);
    setReadNotifications(newRead);
    localStorage.setItem('readNotifications', JSON.stringify(Array.from(newRead)));
  };

  const getIcon = (type: string) => {
    const className = "h-5 w-5";
    switch (type) {
      case 'info':
        return <InformationCircleIcon className={`${className} text-blue-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${className} text-yellow-500`} />;
      case 'success':
        return <CheckCircleIcon className={`${className} text-green-500`} />;
      case 'error':
        return <XCircleIcon className={`${className} text-red-500`} />;
      default:
        return <InformationCircleIcon className={`${className} text-blue-500`} />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return 'vừa xong';
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
      }

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
      }

      const diffInWeeks = Math.floor(diffInDays / 7);
      if (diffInWeeks < 4) {
        return `${diffInWeeks} tuần trước`;
      }

      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12) {
        return `${diffInMonths} tháng trước`;
      }

      const diffInYears = Math.floor(diffInDays / 365);
      return `${diffInYears} năm trước`;
    } catch (e) {
      return 'vừa xong';
    }
  };

  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;

  return (
    <>
      <Popover className={`relative flex ${className}`}>
        {({ open }) => (
          <>
            <Popover.Button
              className={` ${
                open ? "" : "text-opacity-90"
              } group self-center w-10 h-10 sm:w-12 sm:h-12 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full inline-flex items-center justify-center text-base font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 relative`}
            >
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              )}
              <BellIcon className="h-6 w-6" />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-10 w-screen max-w-[320px] sm:max-w-sm px-2 sm:px-4 top-full -right-6 sm:-right-28 sm:right-0">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative bg-white dark:bg-neutral-800 max-h-96 overflow-y-auto">
                    <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 sm:px-6 py-3 sm:py-4 z-10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-semibold">Thông báo</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2 sm:p-3">
                      {loading ? (
                        <div className="flex items-center justify-center py-6 sm:py-8">
                          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-500"></div>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 px-2 sm:px-4">
                          <BellIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-2 sm:mb-3" />
                          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                            Chưa có thông báo nào
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1 sm:space-y-2">
                          {notifications.map((notification) => {
                            const isUnread = !readNotifications.has(notification.id);
                            return (
                              <div
                                key={notification.id}
                                onClick={() => markAsRead(notification.id)}
                                className={`p-2 sm:p-3 rounded-lg transition-all duration-150 ease-in-out cursor-pointer relative ${
                                  isUnread 
                                    ? 'bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30' 
                                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                }`}
                              >
                                <div className="flex items-start gap-2 sm:gap-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {getIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1 sm:gap-2">
                                      <p className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                                        {notification.title}
                                      </p>
                                      {isUnread && (
                                        <span className="flex-shrink-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary-500 mt-1.5"></span>
                                      )}
                                    </div>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                                      {notification.content}
                                    </p>
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                      {getTimeAgo(notification.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="sticky bottom-0 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 px-4 sm:px-6 py-2 sm:py-3">
                        <button
                          onClick={() => {
                            // Mark all as read
                            const allIds = new Set(notifications.map(n => n.id));
                            setReadNotifications(allIds);
                            localStorage.setItem('readNotifications', JSON.stringify(Array.from(allIds)));
                          }}
                          className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          Đánh dấu tất cả đã đọc
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </>
  );
};

export default NotifyDropdown;

