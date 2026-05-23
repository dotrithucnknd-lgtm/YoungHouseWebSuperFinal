"use client";

import React, { useState } from "react";
import { updateUserRole } from "@/lib/supabaseServices";

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    id: string;
    name?: string;
    email?: string;
    role: 'owner' | 'renter' | 'admin';
  } | null;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
}) => {
  const [selectedRole, setSelectedRole] = useState<'owner' | 'renter' | 'admin'>('renter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update selectedRole when user changes and reset error
  React.useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
      setError(null); // Reset error when user changes
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (selectedRole === user.role) {
      setError('Vui lòng chọn role khác với role hiện tại');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { success, error: updateError } = await updateUserRole(user.id, selectedRole);
      
      if (success) {
        onSuccess();
        onClose();
      } else {
        setError(updateError || 'Có lỗi xảy ra khi cập nhật role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Có lỗi xảy ra khi cập nhật role');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'owner':
        return 'Chủ trọ';
      case 'renter':
        return 'Người thuê';
      default:
        return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Có quyền quản lý toàn bộ hệ thống, duyệt bài đăng, quản lý người dùng';
      case 'owner':
        return 'Có thể đăng phòng cho thuê, quản lý phòng của mình';
      case 'renter':
        return 'Có thể đặt phòng, xem thông tin phòng';
      default:
        return '';
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Thay đổi Role người dùng
          </h3>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="font-medium text-neutral-900 dark:text-white">
                {user.name || "Chưa có tên"}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {user.email || user.id}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              Role hiện tại: 
            </span>
            <span className="font-medium text-blue-600 dark:text-blue-400 ml-1">
              {getRoleLabel(user.role)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Chọn Role mới
            </label>
            
            <div className="space-y-3">
              {(['renter', 'owner', 'admin'] as const).map((role) => (
                <label
                  key={role}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRole === role
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value as 'owner' | 'renter' | 'admin')}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 dark:text-white">
                      {getRoleLabel(role)}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {getRoleDescription(role)}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || selectedRole === user?.role}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoleModal;