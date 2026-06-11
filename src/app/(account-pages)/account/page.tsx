"use client";

import React, { FC, useEffect, useState } from "react";
import Label from "@/components/Label";
import Avatar from "@/shared/Avatar";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Input from "@/shared/Input";
import Select from "@/shared/Select";
import Textarea from "@/shared/Textarea";
import { useAuth } from "@/contexts/AuthContext";
import { AuthUser } from "@/lib/supabaseServices";
import PushNotificationPrompt from "@/components/PushNotificationPrompt";

export interface AccountPageProps {}

const AccountPage = () => {
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Chưa đăng nhập</h2>
        <p className="text-neutral-600 mb-6">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
        <ButtonPrimary href="/login">Đăng nhập</ButtonPrimary>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* HEADING */}
      <h2 className="text-3xl font-semibold">Thông tin tài khoản</h2>
      {user.avatar && (
        <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-md">
          <p className="text-sm">
            <span className="font-medium">Ảnh đại diện:</span> Được lấy từ hồ sơ tài khoản của bạn
          </p>
        </div>
      )}
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

      <PushNotificationPrompt />

      <div className="flex flex-col md:flex-row">
        <div className="flex-shrink-0 flex items-start">
          <div className="relative rounded-full overflow-hidden flex">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User Avatar'}
                className="w-32 h-32 object-cover rounded-full"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-4xl font-semibold text-primary-600 dark:text-primary-300">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-neutral-50 cursor-pointer opacity-0 hover:opacity-100 transition-opacity rounded-full">
              <svg
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.5 5H7.5C6.83696 5 6.20107 5.26339 5.73223 5.73223C5.26339 6.20107 5 6.83696 5 7.5V20M5 20V22.5C5 23.163 5.26339 23.7989 5.73223 24.2678C6.20107 24.7366 6.83696 25 7.5 25H22.5C23.163 25 23.7989 24.7366 24.2678 24.2678C24.7366 23.7989 25 23.163 25 22.5V17.5M5 20L10.7325 14.2675C11.2013 13.7988 11.8371 13.5355 12.5 13.5355C13.1629 13.5355 13.7987 13.7988 14.2675 14.2675L17.5 17.5M25 12.5V17.5M25 17.5L23.0175 15.5175C22.5487 15.0488 21.9129 14.7855 21.25 14.7855C20.5871 14.7855 19.9513 15.0488 19.4825 15.5175L17.5 17.5M17.5 17.5L20 20M22.5 5H27.5M25 2.5V7.5M17.5 10H17.5125"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span className="mt-1 text-xs">Change Image</span>
            </div>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
        <div className="flex-grow mt-10 md:mt-0 md:pl-16 max-w-3xl space-y-6">
          <div>
            <Label>Name</Label>
            <Input 
              className="mt-1.5" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Tên của bạn"
            />
          </div>
          {/* ---- */}
          <div>
            <Label>Role</Label>
            <Select 
              className="mt-1.5"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              disabled
            >
              <option value="user">Người dùng</option>
              <option value="tenant">Người thuê</option>
              <option value="sales">Nhân viên / CTV</option>
              <option value="operator">Kỹ thuật viên</option>
              <option value="manager">Quản lý</option>
              <option value="admin">Quản trị viên</option>
            </Select>
          </div>
          {/* ---- */}
          <div>
            <Label>Email</Label>
            <Input 
              className="mt-1.5" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email của bạn"
              disabled
            />
            <p className="text-xs text-neutral-500 mt-1">Email không thể thay đổi</p>
          </div>
          {/* ---- */}
          <div>
            <Label>Phone number</Label>
            <Input 
              className="mt-1.5" 
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Số điện thoại"
            />
          </div>
          {/* ---- */}
          <div>
            <Label>User ID</Label>
            <Input 
              className="mt-1.5" 
              value={user.id}
              disabled
              placeholder="ID người dùng"
            />
            <p className="text-xs text-neutral-500 mt-1">ID người dùng từ hệ thống</p>
          </div>
          <div className="pt-2">
            <ButtonPrimary>Update info</ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

