"use client";

import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, PlusIcon, ArrowPathIcon, ChevronDownIcon, ChevronUpIcon, LightBulbIcon, TrashIcon, UserIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOwnerRoomUnits, fetchAllRoomUnits, createRoomUnit, deleteRoomUnit, type RoomUnitWithDetails } from "@/lib/landlordServices";
import { fetchRooms } from "@/lib/supabaseServices";
import { sortByTitle } from "@/utils/sortProperties";

export default function RoomsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [roomUnits, setRoomUnits] = useState<RoomUnitWithDetails[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Load properties (rooms table - acting as buildings)
      const propertiesData = await fetchRooms();
      const ownerProperties = sortByTitle(propertiesData.filter(p => 
        p.author.id === user.id || 
        user.role === 'admin' || 
        user.role === 'manager' ||
        user.role === 'operator'
      ));
      setProperties(ownerProperties);
      
      // Auto-expand first property
      if (ownerProperties.length > 0) {
        setExpandedProperties(new Set([String(ownerProperties[0].id)]));
      }

      // Load room units
      const unitsData = (user.role === 'operator' || user.role === 'admin' || user.role === 'manager')
        ? await fetchAllRoomUnits()
        : await fetchOwnerRoomUnits(user.id);
      setRoomUnits(unitsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProperty = (propertyId: string) => {
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedProperties(newExpanded);
  };

  const handleAddRoom = async (propertyId: string) => {
    if (!newRoomName.trim()) {
      alert('Vui lòng nhập tên phòng');
      return;
    }

    const { data, error } = await createRoomUnit({
      room_id: propertyId,
      name: newRoomName,
      status: 'available',
    });

    if (error) {
      alert('Có lỗi xảy ra: ' + error);
    } else {
      setNewRoomName("");
      setShowAddModal(false);

      if (data) {
        const house = properties.find(p => p.id === propertyId);
        const houseTitle = house?.title || "";

        try {
          const response = await fetch('/api/rooms/create-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomUnitId: data.id,
              roomName: data.name,
              houseTitle: houseTitle,
            })
          });
          const result = await response.json();
          if (response.ok && result.success) {
            alert(`Thêm phòng thành công!\n\nTài khoản: ${result.username}\nMật khẩu: ${result.password}`);
          } else {
            console.error("Auto account creation failed:", result.error);
            alert("Thêm phòng thành công! (Lưu ý: Không thể tự động tạo tài khoản, hãy click nút Tạo TK sau)");
          }
        } catch (err: any) {
          console.error("Auto account creation failed:", err);
          alert("Thêm phòng thành công! (Lưu ý: Lỗi kết nối tạo tài khoản, hãy click nút Tạo TK sau)");
        }
      } else {
        alert('Thêm phòng thành công!');
      }

      loadData();
    }
  };

  const handleDeleteRoom = async (roomUnitId: string) => {
    if (!confirm('Bạn có chắc muốn xóa phòng này?')) return;

    const { error } = await deleteRoomUnit(roomUnitId);
    if (error) {
      alert('Có lỗi xảy ra: ' + error);
    } else {
      loadData();
    }
  };

  const handleCreateAccount = async (unit: any) => {
    if (!confirm(`Bạn có muốn tạo tài khoản phòng cho ${unit.name} không?`)) return;
    try {
      const response = await fetch('/api/rooms/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomUnitId: unit.id,
          roomName: unit.name,
          houseTitle: unit.rooms?.title || "",
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        alert(`Tạo tài khoản thành công!\nTài khoản: ${result.username}\nMật khẩu: ${result.password}`);
        loadData();
      } else {
        alert("Lỗi: " + (result.error || "Không thể tạo tài khoản"));
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message);
    }
  };

  const getFilteredRoomUnits = () => {
    let filtered = roomUnits;

    // Filter by property
    if (selectedProperty !== "all") {
      filtered = filtered.filter(unit => unit.room_id === selectedProperty);
    }

    // Filter by status tab
    if (activeTab !== "all") {
      if (activeTab === "rented") {
        filtered = filtered.filter(unit => unit.status === "rented");
      } else if (activeTab === "empty") {
        filtered = filtered.filter(unit => unit.status === "available");
      } else if (activeTab === "maintenance") {
        filtered = filtered.filter(unit => unit.status === "maintenance");
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(unit => 
        unit.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredUnits = getFilteredRoomUnits();

  // Group by property
  const groupedByProperty = properties.map(property => ({
    property,
    units: filteredUnits.filter(unit => unit.room_id === property.id)
  }));

  const tabs = [
    { id: "all", label: "Tất cả", count: roomUnits.length },
    { id: "rented", label: "Đang thuê", count: roomUnits.filter(u => u.status === "rented").length },
    { id: "empty", label: "Đang trống", count: roomUnits.filter(u => u.status === "available").length },
    { id: "maintenance", label: "Bảo trì", count: roomUnits.filter(u => u.status === "maintenance").length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <select 
          className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
        >
          <option value="all">Tất cả nhà trọ</option>
          {properties.map(prop => (
            <option key={prop.id} value={prop.id}>{prop.title}</option>
          ))}
        </select>
        
        <Link 
          href="/operator/properties"
          className="flex items-center gap-2 px-4 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm nhà trọ mới
        </Link>
      </div>

      {/* Filter Section */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm tên phòng..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={loadData}
          className="p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Section */}
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-primary-6000 text-white border border-primary-6000"
                : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500"
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              activeTab === tab.id 
                ? 'bg-primary-500 text-white' 
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Properties List */}
      {groupedByProperty.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <p className="text-neutral-500 mb-4">Chưa có nhà trọ nào. Hãy thêm nhà trọ đầu tiên của bạn!</p>
          <Link 
            href="/operator/properties"
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm nhà trọ
          </Link>
        </div>
      ) : (
        groupedByProperty.map(({ property, units }) => (
          <div key={property.id} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
            {/* Accordion Header */}
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
              onClick={() => toggleProperty(property.id)}
            >
              <div className="flex items-center gap-4">
                <img 
                  src={property.featuredImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&h=100&fit=crop"} 
                  alt={property.title} 
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white text-lg">{property.title}</h3>
                  <p className="text-sm text-neutral-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {property.address}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <p className="text-sm text-neutral-500">Tổng phòng</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{units.length}</p>
                </div>
                <div className="text-neutral-400">
                  {expandedProperties.has(property.id) ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {/* Accordion Body */}
            {expandedProperties.has(property.id) && (
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/30">
                {units.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-neutral-500 mb-4">
                      Chưa có phòng. Hãy tạo phòng cho nhà trọ này.
                    </p>
                    <Link
                      href="/operator/rooms/new"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Tạo phòng
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-end mb-4">
                      <Link
                        href="/operator/rooms/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Thêm phòng
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {units.map(unit => (
                        <div key={unit.id} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-neutral-900 dark:text-white text-lg">{unit.name}</h4>
                              {unit.current_renter && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                                  <UserIcon className="w-3 h-3" />
                                  <span>{unit.current_renter.name}</span>
                                </div>
                              )}
                              {unit.current_renter?.phone && (
                                <p className="text-xs text-neutral-500 mt-1">
                                  📞 {unit.current_renter.phone}
                                </p>
                              )}
                              <div className="mt-2">
                                {unit.current_renter_id ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200/40">
                                    🔑 Đã có TK
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleCreateAccount(unit)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-200/40 hover:bg-indigo-100 transition-colors"
                                    title="Tạo tài khoản phòng cho cư dân đăng nhập"
                                  >
                                    🔑 Tạo TK Phòng
                                  </button>
                                )}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              unit.status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              unit.status === 'rented' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                              {unit.status === 'available' ? 'Trống' : unit.status === 'rented' ? 'Đang thuê' : 'Bảo trì'}
                            </span>
                          </div>
                          
                          {/* Room Info */}
                          <div className="mb-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-neutral-500">Trạng thái:</span>
                              <span className="font-medium text-neutral-900 dark:text-white">
                                {unit.status === 'available' ? '✅ Sẵn sàng cho thuê' : 
                                 unit.status === 'rented' ? '🏠 Đã có người thuê' : 
                                 '🔧 Đang bảo trì'}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link
                              href={`/operator/rooms/${unit.id}`}
                              className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-center"
                            >
                              Chi tiết
                            </Link>
                            <Link
                              href={`/operator/rooms/${unit.id}/edit`}
                              className="px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                              title="Sửa phòng"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={() => handleDeleteRoom(unit.id)}
                              className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              title="Xóa phòng"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {/* Support Banner */}
      <div className="bg-blue-600 rounded-xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md mt-10">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            Bạn cần hỗ trợ quản lý?
          </h3>
          <p className="text-blue-100 text-sm max-w-2xl">
            Xem hướng dẫn cách quản lý phòng trọ, hợp đồng và hóa đơn hiệu quả nhất để tối ưu doanh thu của bạn.
          </p>
        </div>
        <button className="px-6 py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
          <LightBulbIcon className="w-5 h-5" />
          Xem hướng dẫn <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
}


