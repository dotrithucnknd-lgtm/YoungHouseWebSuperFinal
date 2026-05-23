"use client";

import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOwnerTenants, deleteTenant, type TenantWithDetails } from "@/lib/landlordServices";

export default function TenantsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [tenants, setTenants] = useState<TenantWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stayStatusFilter, setStayStatusFilter] = useState<string>("all");
  const [tempResidenceFilter, setTempResidenceFilter] = useState<string>("all");

  useEffect(() => {
    if (user?.id) {
      loadTenants();
    }
  }, [user]);

  const loadTenants = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await fetchOwnerTenants(user.id);
      setTenants(data);
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tenantId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách thuê này?')) return;

    const { success, error } = await deleteTenant(tenantId);
    if (success) {
      alert('Xóa khách thuê thành công!');
      loadTenants();
    } else {
      alert(`Lỗi: ${error}`);
    }
  };

  // Filter tenants
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm) ||
      tenant.tenant_profile?.id_card_number?.includes(searchTerm);

    const matchesStayStatus = 
      stayStatusFilter === "all" ||
      (stayStatusFilter === "renting" && tenant.stay_status === "renting") ||
      (stayStatusFilter === "not_rented" && tenant.stay_status === "not_rented") ||
      (stayStatusFilter === "moved_out" && tenant.stay_status === "moved_out");

    const matchesTempResidence =
      tempResidenceFilter === "all" ||
      (tempResidenceFilter === "registered" && tenant.has_temporary_residence) ||
      (tempResidenceFilter === "not_registered" && !tenant.has_temporary_residence);

    return matchesSearch && matchesStayStatus && matchesTempResidence;
  });

  const getStayStatusLabel = (status: string) => {
    switch (status) {
      case 'renting': return 'Đang thuê';
      case 'not_rented': return 'Chưa thuê';
      case 'moved_out': return 'Đã rời đi';
      default: return 'N/A';
    }
  };

  const getStayStatusColor = (status: string) => {
    switch (status) {
      case 'renting': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'not_rented': return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
      case 'moved_out': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
          <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Nhập dữ liệu
        </button>
        <Link 
          href="/operator/tenants/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm khách thuê mới
        </Link>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-6">
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wider">Tìm kiếm</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Tên, số điện thoại, CMND..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-6000/30 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wider">Lưu trú</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              value={stayStatusFilter}
              onChange={(e) => setStayStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="renting">Đang thuê</option>
              <option value="not_rented">Chưa thuê</option>
              <option value="moved_out">Đã rời đi</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wider">Tạm trú</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              value={tempResidenceFilter}
              onChange={(e) => setTempResidenceFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="registered">Đã đăng ký</option>
              <option value="not_registered">Chưa đăng ký</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button 
              onClick={loadTenants}
              className="w-full py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Tổng khách thuê</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{tenants.length}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Đang thuê</p>
          <p className="text-2xl font-bold text-primary-6000 mt-1">
            {tenants.filter(t => t.stay_status === 'renting').length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Đã đăng ký tạm trú</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {tenants.filter(t => t.has_temporary_residence).length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Chưa đăng ký</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {tenants.filter(t => !t.has_temporary_residence).length}
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-6000"></div>
            <span className="ml-3 text-neutral-600 dark:text-neutral-400">Đang tải...</span>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400">Không có khách thuê nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Khách thuê</th>
                  <th className="px-6 py-4 font-semibold text-center">Liên hệ</th>
                  <th className="px-6 py-4 font-semibold text-center">CMND/CCCD</th>
                  <th className="px-6 py-4 font-semibold text-center">Phòng hiện tại</th>
                  <th className="px-6 py-4 font-semibold text-center">Đăng ký tạm trú</th>
                  <th className="px-6 py-4 font-semibold text-center">Lưu trú</th>
                  <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-6000/10 flex items-center justify-center text-primary-6000 font-bold">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{tenant.name}</p>
                          {tenant.DoB && (
                            <p className="text-xs text-neutral-500">Sinh: {new Date(tenant.DoB).toLocaleDateString('vi-VN')}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-medium text-neutral-900 dark:text-white">{tenant.phone}</p>
                      {tenant.email && (
                        <p className="text-xs text-neutral-500">{tenant.email}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-neutral-600 dark:text-neutral-300">
                      {tenant.tenant_profile?.id_card_number || 'Chưa có'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {tenant.current_contract?.room_unit ? (
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {tenant.current_contract.room_unit.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {tenant.current_contract.room_unit.room?.title}
                          </p>
                        </div>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        tenant.has_temporary_residence
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {tenant.has_temporary_residence ? 'Đã đăng ký' : 'Chưa đăng ký'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStayStatusColor(tenant.stay_status)}`}>
                        {getStayStatusLabel(tenant.stay_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 rounded-lg transition-colors">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(tenant.id)}
                          className="p-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

