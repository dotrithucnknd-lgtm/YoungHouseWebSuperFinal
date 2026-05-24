"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, UserIcon, DocumentTextIcon, WrenchScrewdriverIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { updateRoomUnit, type RoomUnitWithDetails } from "@/lib/landlordServices";

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const roomUnitId = params.id as string;

  const [roomUnit, setRoomUnit] = useState<RoomUnitWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<'available' | 'rented' | 'maintenance'>('available');

  // Room details sub-states
  const [contracts, setContracts] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState(0);

  useEffect(() => {
    if (roomUnitId) {
      loadRoomUnit();
    }
  }, [roomUnitId]);

  const loadRoomUnit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('room_units')
        .select(`
          *,
          rooms:room_id (
            id,
            title,
            address,
            banner,
            price,
            area
          ),
          current_renter:current_renter_id (
            id,
            name,
            phone
          )
        `)
        .eq('id', roomUnitId)
        .single();

      if (error) {
        console.error('Error loading room unit:', error);
        return;
      }

      setRoomUnit(data);
      setNewStatus(data.status);

      // Fetch Contracts
      const { data: contractsData } = await supabase
        .from('contracts')
        .select(`
          *,
          renter:renter_id (
            id,
            name,
            phone
          )
        `)
        .eq('room_unit_id', roomUnitId)
        .order('created_at', { ascending: false });

      if (contractsData) setContracts(contractsData);

      // Fetch Maintenance Tickets
      const { data: maintenanceData } = await supabase
        .from('maintenance_tickets')
        .select('*')
        .eq('room_id', data.room_id)
        .order('created_at', { ascending: false });

      if (maintenanceData) setMaintenanceRequests(maintenanceData);

      // Fetch Unpaid Invoices count
      const { count: unpaidCount } = await supabase
        .from('invoices')
        .select('id', { count: 'exact', head: true })
        .eq('room_unit_id', roomUnitId)
        .eq('status', 'unpaid');

      setUnpaidInvoicesCount(unpaidCount || 0);

    } catch (error) {
      console.error('Error in loadRoomUnit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!roomUnit) return;

    const { error } = await updateRoomUnit(roomUnit.id, { status: newStatus });
    
    if (error) {
      alert('Có lỗi xảy ra: ' + error);
    } else {
      setShowStatusModal(false);
      loadRoomUnit();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!roomUnit) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Không tìm thấy phòng</p>
        <Link href="/operator/rooms" className="text-green-600 hover:underline mt-4 inline-block">
          Quay lại danh sách phòng
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/operator/rooms"
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{roomUnit.name}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {roomUnit.rooms?.title} - {roomUnit.rooms?.address}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/operator/rooms/${roomUnit.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg text-sm font-semibold transition-colors border border-neutral-200 dark:border-neutral-700"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Chỉnh sửa
          </Link>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            roomUnit.status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            roomUnit.status === 'rented' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
          }`}>
            {roomUnit.status === 'available' ? 'Trống' : roomUnit.status === 'rented' ? 'Đang thuê' : 'Bảo trì'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Room Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Info */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Thông tin nhà trọ</h2>
            
            {roomUnit.rooms?.banner && (
              <img 
                src={roomUnit.rooms.banner} 
                alt={roomUnit.rooms.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">Giá thuê</p>
                <p className="text-lg font-bold text-green-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    maximumFractionDigits: 0,
                  }).format(roomUnit.rooms?.price || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Diện tích</p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {roomUnit.rooms?.area}m²
                </p>
              </div>
            </div>
          </div>

          {/* Current Renter */}
          {roomUnit.current_renter && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Người thuê hiện tại
                </h2>
                <Link
                  href={`/operator/tenants/${roomUnit.current_renter.id}`}
                  className="text-sm text-green-600 hover:underline"
                >
                  Xem hồ sơ
                </Link>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-500">Họ tên</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{roomUnit.current_renter.name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Số điện thoại</p>
                  <p className="font-medium text-neutral-900 dark:text-white">{roomUnit.current_renter.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contracts */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Hợp đồng
              </h2>
              <Link
                href={`/operator/contracts/new?room_unit_id=${roomUnit.id}`}
                className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Tạo hợp đồng
              </Link>
            </div>
            
            {contracts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-neutral-500 dark:text-neutral-400">
                  <thead className="text-xs text-neutral-700 uppercase bg-neutral-50 dark:bg-neutral-900/50 dark:text-neutral-300">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Người thuê</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Thời hạn</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Tiền thuê</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                    {contracts.map((c) => (
                      <tr key={c.id} className="bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">
                          {c.renter?.name || "Khách thuê"}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {new Date(c.start_date).toLocaleDateString('vi-VN')} - {new Date(c.end_date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(c.rent_amount ?? c.rent_price ?? 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${
                            c.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                            c.status === 'expired' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                            'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
                          }`}>
                            {c.status === 'active' ? 'Hiệu lực' : c.status === 'expired' ? 'Hết hạn' : 'Chờ duyệt'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-neutral-500 italic py-2">Chưa có hợp đồng nào</p>
            )}
          </div>

          {/* Maintenance Requests */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
              <WrenchScrewdriverIcon className="w-5 h-5" />
              Yêu cầu bảo trì
            </h2>
            
            {maintenanceRequests.length > 0 ? (
              <div className="space-y-3">
                {maintenanceRequests.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-700/50 bg-neutral-50/50 dark:bg-neutral-900/10 flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm">{r.title}</p>
                      <p className="text-xs text-neutral-500">{r.description}</p>
                      <p className="text-xxs text-neutral-400">Ngày yêu cầu: {new Date(r.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${
                      r.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                      r.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                      r.status === 'assigned' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400' :
                      r.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
                    }`}>
                      {r.status === 'completed' ? 'Đã xong' :
                       r.status === 'in_progress' ? 'Đang xử lý' :
                       r.status === 'assigned' ? 'Đã giao việc' :
                       r.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 italic">Chưa có yêu cầu bảo trì nào</p>
            )}
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-bold text-neutral-900 dark:text-white mb-4">Thao tác nhanh</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowStatusModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors text-left"
              >
                <PencilSquareIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white text-sm">Đổi trạng thái</p>
                  <p className="text-xs text-neutral-500">Cập nhật trạng thái phòng</p>
                </div>
              </button>

              <Link
                href={`/operator/invoices/new?room_unit_id=${roomUnit.id}`}
                className="w-full flex items-center gap-3 px-4 py-3 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white text-sm">Tạo hóa đơn</p>
                  <p className="text-xs text-neutral-500">Lập hóa đơn tháng mới</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Room Stats */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-bold text-neutral-900 dark:text-white mb-4">Thống kê</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Hợp đồng</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{contracts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Hóa đơn chưa thu</span>
                <span className="font-semibold text-red-500">{unpaidInvoicesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Yêu cầu bảo trì</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{maintenanceRequests.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Đổi trạng thái phòng</h3>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                style={{ borderColor: newStatus === 'available' ? '#10b981' : 'transparent' }}
              >
                <input
                  type="radio"
                  name="status"
                  value="available"
                  checked={newStatus === 'available'}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-4 h-4 text-green-600"
                />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">Trống</p>
                  <p className="text-xs text-neutral-500">Phòng sẵn sàng cho thuê</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                style={{ borderColor: newStatus === 'rented' ? '#3b82f6' : 'transparent' }}
              >
                <input
                  type="radio"
                  name="status"
                  value="rented"
                  checked={newStatus === 'rented'}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">Đang thuê</p>
                  <p className="text-xs text-neutral-500">Phòng đã có người thuê</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                style={{ borderColor: newStatus === 'maintenance' ? '#f97316' : 'transparent' }}
              >
                <input
                  type="radio"
                  name="status"
                  value="maintenance"
                  checked={newStatus === 'maintenance'}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-4 h-4 text-orange-600"
                />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">Bảo trì</p>
                  <p className="text-xs text-neutral-500">Phòng đang sửa chữa</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

