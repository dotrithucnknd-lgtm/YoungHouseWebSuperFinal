"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import {
  fetchAllNotifications,
  deleteNotification,
  DatabaseNotification,
} from "@/lib/supabaseServices";
import AdminNotificationForm from "./AdminNotificationForm";

const AdminNotificationsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState<DatabaseNotification | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    setError('');
    const { notifications: data, error: fetchError } = await fetchAllNotifications();
    
    if (fetchError) {
      setError(fetchError);
    } else {
      setNotifications(data);
    }
    setLoadingNotifications(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      return;
    }

    setDeletingId(id);
    const { success, error: deleteError } = await deleteNotification(id);
    
    if (deleteError) {
      alert('Lỗi: ' + deleteError);
    } else {
      setNotifications(notifications.filter(n => n.id !== id));
    }
    setDeletingId(null);
  };

  const handleEdit = (notification: DatabaseNotification) => {
    setEditingNotification(notification);
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingNotification(null);
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditingNotification(null);
    loadNotifications();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'info':
        return 'Thông tin';
      case 'warning':
        return 'Cảnh báo';
      case 'success':
        return 'Thành công';
      case 'error':
        return 'Lỗi';
      default:
        return type;
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all':
        return 'Tất cả';
      case 'renters':
        return 'Người thuê';
      case 'owners':
        return 'Chủ nhà';
      case 'admins':
        return 'Quản trị viên';
      default:
        return audience;
    }
  };

  if (loading || (user && user.role === 'admin' && loadingNotifications)) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Quản lý thông báo
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                Tạo và quản lý thông báo cho người dùng
              </p>
            </div>
            <ButtonPrimary onClick={() => setShowCreateForm(true)}>
              + Tạo thông báo mới
            </ButtonPrimary>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Tổng thông báo
            </h3>
            <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
              {notifications.length}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Đang hoạt động
            </h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {notifications.filter(n => n.is_active).length}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Đã tắt
            </h3>
            <p className="text-3xl font-bold text-gray-600 mt-2">
              {notifications.filter(n => !n.is_active).length}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Tất cả người dùng
            </h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {notifications.filter(n => n.target_audience === 'all').length}
            </p>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                Chưa có thông báo nào. Nhấn "Tạo thông báo mới" để bắt đầu.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Đối tượng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {notifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {notification.title}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                          {notification.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                          {getTypeLabel(notification.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {getAudienceLabel(notification.target_audience)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          notification.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {notification.is_active ? 'Hoạt động' : 'Tắt'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {new Date(notification.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(notification)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(notification.id)}
                            disabled={deletingId === notification.id}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          >
                            {deletingId === notification.id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Notification Modal */}
      <AdminNotificationForm
        show={showCreateForm}
        onHide={handleFormClose}
        onSuccess={handleFormSuccess}
        editingNotification={editingNotification}
      />
    </div>
  );
};

export default AdminNotificationsPage;


