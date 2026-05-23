"use client";

import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { fetchRooms } from "@/lib/supabaseServices";
import type { StayDataType } from "@/data/types";
import { supabase } from "@/lib/supabaseClient";

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<StayDataType[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<StayDataType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadProperties();
    }
  }, [user]);

  useEffect(() => {
    // Filter properties based on search term
    if (searchTerm.trim()) {
      const filtered = properties.filter(prop =>
        prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(properties);
    }
  }, [searchTerm, properties]);

  const loadProperties = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const allRooms = await fetchRooms();
      // Filter properties owned by current user OR if admin/manager/operator role see all
      const ownerProperties = allRooms.filter(room => 
        room.author.id === user.id || 
        user.role === 'admin' || 
        user.role === 'manager' ||
        user.role === 'operator'
      );
      setProperties(ownerProperties);
      setFilteredProperties(ownerProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Bạn có chắc muốn xóa nhà trọ này? Tất cả phòng và dữ liệu liên quan sẽ bị xóa.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      alert('Xóa nhà trọ thành công!');
      loadProperties();
    } catch (error: any) {
      console.error('Error deleting property:', error);
      alert('Không thể xóa nhà trọ: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quản lý Nhà trọ</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Quản lý thông tin các nhà trọ của bạn
          </p>
        </div>
        <Link
          href="/operator/properties/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm nhà trọ mới
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhà trọ..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={loadProperties}
          className="p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-6000/10 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-primary-6000" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Tổng nhà trọ</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{properties.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Đang hoạt động</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {properties.filter(p => p.roomStatus === 'available').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Đã cho thuê</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {properties.filter(p => p.roomStatus === 'sold_out').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Properties List */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <BuildingOfficeIcon className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
            {searchTerm ? 'Không tìm thấy nhà trọ' : 'Chưa có nhà trọ nào'}
          </h3>
          <p className="text-neutral-500 mb-6">
            {searchTerm
              ? 'Thử tìm kiếm với từ khóa khác'
              : 'Hãy thêm nhà trọ đầu tiên của bạn để bắt đầu quản lý'}
          </p>
          {!searchTerm && (
            <Link
              href="/operator/properties/new"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Thêm nhà trọ
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const imageUrl = typeof property.featuredImage === "string"
              ? property.featuredImage
              : property.featuredImage?.src;

            return (
              <div
                key={property.id}
                className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Property Image */}
                <div className="relative h-48 bg-neutral-200 dark:bg-neutral-700">
                  <img
                    src={imageUrl || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop"}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${property.roomStatus === 'available'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                      {property.roomStatus === 'available' ? 'Hoạt động' : 'Đã thuê'}
                    </span>
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-3 line-clamp-2 flex items-start gap-1">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {property.address}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-neutral-500">Giá thuê</p>
                      <p className="text-lg font-bold text-primary-6000">{property.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500">Diện tích</p>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{property.area}m²</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/operator/properties/${property.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Xem
                    </Link>
                    <Link
                      href={`/operator/properties/${property.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-500/10 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium hover:bg-primary-500/20 transition-colors"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDeleteProperty(property.id.toString())}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


