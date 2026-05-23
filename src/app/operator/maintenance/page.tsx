"use client";

import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, WrenchScrewdriverIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOwnerMaintenanceRequests, updateMaintenanceRequestStatus, type MaintenanceRequestWithDetails } from "@/lib/landlordServices";

export default function MaintenancePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [requests, setRequests] = useState<MaintenanceRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequestWithDetails | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadRequests();
    }
  }, [user, activeTab]);

  const loadRequests = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const filters: any = {};
      if (activeTab !== "all") {
        filters.status = activeTab;
      }
      
      const data = await fetchOwnerMaintenanceRequests(user.id, filters);
      setRequests(data);
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: 'pending' | 'in_progress' | 'resolved' | 'rejected') => {
    const { error } = await updateMaintenanceRequestStatus(requestId, status);
    
    if (error) {
      alert('Có lỗi xảy ra: ' + error);
    } else {
      setSelectedRequest(null);
      loadRequests();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: "all", label: "Tất cả", count: requests.length },
    { id: "pending", label: "Chờ xử lý", count: requests.filter(r => r.status === 'pending').length },
    { id: "in_progress", label: "Đang xử lý", count: requests.filter(r => r.status === 'in_progress').length },
    { id: "resolved", label: "Đã xong", count: requests.filter(r => r.status === 'resolved').length },
  ];

  const filteredRequests = requests.filter(request => {
    if (!searchTerm) return true;
    
    const roomName = request.room_units?.name || '';
    const renterName = request.renter?.name || '';
    const title = request.title || '';
    
    return roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           renterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Tìm theo phòng, khách thuê hoặc vấn đề..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary-6000 text-white"
                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-primary-6000 hover:text-primary-6000"
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs text-white ${
                tab.id === 'pending' ? 'bg-orange-500' :
                tab.id === 'in_progress' ? 'bg-blue-500' :
                tab.id === 'resolved' ? 'bg-green-500' :
                'bg-neutral-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <WrenchScrewdriverIcon className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-500">Không có yêu cầu bảo trì nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((request) => (
            <div 
              key={request.id} 
              className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-neutral-900 dark:text-white text-lg">
                      {request.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      request.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      request.priority === 'normal' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                    }`}>
                      {request.priority === 'urgent' ? 'Khẩn cấp' :
                       request.priority === 'high' ? 'Cao' :
                       request.priority === 'normal' ? 'Bình thường' : 'Thấp'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">
                    {request.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {request.room_units?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {request.renter?.name}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  request.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  request.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  request.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {request.status === 'resolved' ? 'Đã xong' :
                   request.status === 'in_progress' ? 'Đang xử lý' :
                   request.status === 'rejected' ? 'Từ chối' : 'Chờ xử lý'}
                </span>
              </div>

              {request.image_urls && request.image_urls.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {request.image_urls.slice(0, 3).map((url, idx) => (
                    <img 
                      key={idx}
                      src={url} 
                      alt={`Ảnh ${idx + 1}`}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ))}
                  {request.image_urls.length > 3 && (
                    <div className="w-20 h-20 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-neutral-500 text-sm font-medium">
                      +{request.image_urls.length - 3}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {formatDate(request.created_at)}
                </span>
                <button className="text-sm text-primary-6000 hover:text-primary-700 font-medium">
                  Xem chi tiết →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  {selectedRequest.title}
                </h3>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedRequest.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    selectedRequest.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    Mức độ: {selectedRequest.priority === 'urgent' ? 'Khẩn cấp' :
                             selectedRequest.priority === 'high' ? 'Cao' : 'Bình thường'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedRequest.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    selectedRequest.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {selectedRequest.status === 'resolved' ? 'Đã xong' :
                     selectedRequest.status === 'in_progress' ? 'Đang xử lý' : 'Chờ xử lý'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-neutral-500">Phòng</label>
                <p className="text-neutral-900 dark:text-white font-medium">
                  {selectedRequest.room_units?.name} - {selectedRequest.room_units?.rooms?.title}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500">Khách thuê</label>
                <p className="text-neutral-900 dark:text-white font-medium">
                  {selectedRequest.renter?.name} - {selectedRequest.renter?.phone}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500">Mô tả chi tiết</label>
                <p className="text-neutral-900 dark:text-white">
                  {selectedRequest.description}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500">Thời gian báo cáo</label>
                <p className="text-neutral-900 dark:text-white">
                  {formatDate(selectedRequest.created_at)}
                </p>
              </div>

              {selectedRequest.image_urls && selectedRequest.image_urls.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-neutral-500 mb-2 block">Hình ảnh</label>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedRequest.image_urls.map((url, idx) => (
                      <img 
                        key={idx}
                        src={url} 
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-32 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedRequest.status !== 'resolved' && selectedRequest.status !== 'rejected' && (
              <div className="flex gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'in_progress')}
                      className="flex-1 px-4 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <ClockIcon className="w-5 h-5" />
                      Bắt đầu xử lý
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')}
                      className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition-colors"
                    >
                      Từ chối
                    </button>
                  </>
                )}
                {selectedRequest.status === 'in_progress' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'resolved')}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Đánh dấu hoàn thành
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

