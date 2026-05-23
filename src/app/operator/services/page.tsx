"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon, BoltIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOwnerServices, createService, updateService, deleteService, type Service } from "@/lib/landlordServices";

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit_price: 0,
    unit: '',
    type: 'variable' as 'fixed' | 'variable'
  });

  useEffect(() => {
    if (user?.id) {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await fetchOwnerServices(user.id);
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;

    if (editingService) {
      // Update existing service
      const { error } = await updateService(editingService.id, formData);
      if (error) {
        alert('Có lỗi xảy ra: ' + error);
        return;
      }
    } else {
      // Create new service
      const { error } = await createService({
        ...formData,
        owner_id: user.id
      });
      if (error) {
        alert('Có lỗi xảy ra: ' + error);
        return;
      }
    }

    setShowModal(false);
    setEditingService(null);
    setFormData({ name: '', unit_price: 0, unit: '', type: 'variable' });
    loadServices();
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      unit_price: service.unit_price,
      unit: service.unit,
      type: service.type
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;

    const { error } = await deleteService(serviceId);
    if (error) {
      alert('Có lỗi xảy ra: ' + error);
    } else {
      loadServices();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-neutral-500">
            Quản lý bảng giá điện, nước, internet và các dịch vụ khác
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            setFormData({ name: '', unit_price: 0, unit: '', type: 'variable' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm dịch vụ mới
        </button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <BoltIcon className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-500 mb-4">Chưa có dịch vụ nào. Hãy thêm dịch vụ đầu tiên!</p>
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm dịch vụ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    service.type === 'fixed' 
                      ? 'bg-primary-6000/10 text-primary-6000'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }`}>
                    {service.type === 'fixed' ? (
                      <CurrencyDollarIcon className="w-6 h-6" />
                    ) : (
                      <BoltIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-lg">
                      {service.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      service.type === 'fixed'
                        ? 'bg-primary-6000/10 text-primary-700 dark:text-primary-300'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                    }`}>
                      {service.type === 'fixed' ? 'Cố định' : 'Theo chỉ số'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Đơn giá:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(service.unit_price)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Đơn vị:</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {service.unit}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button 
                  onClick={() => handleEdit(service)}
                  className="flex-1 px-3 py-2 bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Sửa
                </button>
                <button 
                  onClick={() => handleDelete(service.id)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                {editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
              </h3>
              <button type="button" onClick={() => { setShowModal(false); setEditingService(null); setFormData({ name: '', unit_price: 0, unit: '', type: 'variable' }); }}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Tên dịch vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên dịch vụ"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Loại dịch vụ <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'fixed' | 'variable' })}
                >
                  <option value="fixed">Cố định</option>
                  <option value="variable">Theo công tơ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Giá dịch vụ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Nhập giá"
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.unit_price || ''}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Đơn vị <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="">Chọn đơn vị</option>
                    <option value="kWh">kWh</option>
                    <option value="m³">m³</option>
                    <option value="tháng">Tháng</option>
                    <option value="người">Người</option>
                    <option value="lần">Lần</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingService(null);
                    setFormData({ name: '', unit_price: 0, unit: '', type: 'variable' });
                  }}
                  className="px-5 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingService ? 'Cập nhật' : 'Lưu dịch vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
