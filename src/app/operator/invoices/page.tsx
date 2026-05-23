"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, PlusIcon, DocumentIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOwnerInvoices, updateInvoiceStatus, type InvoiceWithDetails } from "@/lib/landlordServices";
import ViewInvoiceModal from "./ViewInvoiceModal";

export default function InvoicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadInvoices();
    }
  }, [user, activeTab]);

  const loadInvoices = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const filters: any = {};
      if (activeTab !== "all") {
        filters.status = activeTab;
      }
      
      const data = await fetchOwnerInvoices(user.id, filters);
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    if (!confirm('Xác nhận đã nhận thanh toán?')) return;

    const { error } = await updateInvoiceStatus(invoiceId, 'paid', {
      payment_method: 'Tiền mặt'
    });

    if (error) {
      alert('Có lỗi xảy ra: ' + error);
    } else {
      loadInvoices();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const tabs = [
    { id: "all", label: "Tất cả", count: invoices.length },
    { id: "unpaid", label: "Chưa thanh toán", count: invoices.filter(i => i.status === 'unpaid').length },
    { id: "paid", label: "Đã thanh toán", count: invoices.filter(i => i.status === 'paid').length },
    { id: "overdue", label: "Quá hạn", count: invoices.filter(i => i.status === 'overdue').length },
  ];

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm) return true;
    
    const roomName = invoice.room_units?.name || '';
    const renterName = invoice.contracts?.renter?.name || '';
    
    return roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           renterName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-end">
        <button 
          onClick={() => router.push("/operator/invoices/new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Tạo hóa đơn mới
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên phòng hoặc tên khách thuê..." 
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
                tab.id === 'unpaid' ? 'bg-orange-500' :
                 tab.id === 'paid' ? 'bg-green-500' :
                 tab.id === 'overdue' ? 'bg-red-500' :
                 'bg-primary-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Phòng</th>
                <th className="px-6 py-4 font-semibold">Khách thuê</th>
                <th className="px-6 py-4 font-semibold">Tháng/Năm</th>
                <th className="px-6 py-4 font-semibold text-right">Tổng tiền</th>
                <th className="px-6 py-4 font-semibold">Hạn thanh toán</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {invoice.room_units?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {invoice.room_units?.rooms?.title || ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {invoice.contracts?.renter?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {invoice.contracts?.renter?.phone || ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                      {invoice.month}/{invoice.year}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-neutral-900 dark:text-white">
                        {formatCurrency(invoice.total_amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                      {invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : invoice.status === 'overdue'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {invoice.status === 'paid' ? 'Đã thanh toán' : 
                         invoice.status === 'overdue' ? 'Quá hạn' : 'Chưa thanh toán'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status !== 'paid' && (
                          <button 
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            className="p-2 bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                            title="Đánh dấu đã thanh toán"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsViewOpen(true);
                          }}
                          className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                          title="Xem chi tiết hóa đơn"
                        >
                          <DocumentIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-neutral-500 dark:text-neutral-400">
                    <div className="flex flex-col items-center justify-center">
                      <DocumentIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" />
                      <p>Chưa có hóa đơn nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm p-4">
              {/* Top row: Room + Status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-bold text-neutral-900 dark:text-white text-base truncate">
                    {invoice.room_units?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{invoice.room_units?.rooms?.title || ''}</p>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  invoice.status === 'paid' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : invoice.status === 'overdue'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {invoice.status === 'paid' ? 'Đã TT' : invoice.status === 'overdue' ? 'Quá hạn' : 'Chưa TT'}
                </span>
              </div>

              {/* Renter + Month info */}
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                  <XCircleIcon className="w-4 h-4 text-neutral-400 hidden" />
                  <span className="font-medium">{invoice.contracts?.renter?.name || 'N/A'}</span>
                </div>
                <span className="text-neutral-500 text-xs">T{invoice.month}/{invoice.year}</span>
              </div>

              {/* Amount + Due date */}
              <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-700 pt-3 mt-2">
                <div>
                  <p className="text-xs text-neutral-500">Hạn: {invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}</p>
                  <p className="text-lg font-extrabold text-neutral-900 dark:text-white">{formatCurrency(invoice.total_amount)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {invoice.status !== 'paid' && (
                    <button 
                      onClick={() => handleMarkAsPaid(invoice.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Xác nhận TT
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setIsViewOpen(true);
                    }}
                    className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                  >
                    <DocumentIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
            <DocumentIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-500">Chưa có hóa đơn nào.</p>
          </div>
        )}
      </div>

      <ViewInvoiceModal 
        isOpen={isViewOpen} 
        invoice={selectedInvoice} 
        onClose={() => setIsViewOpen(false)} 
        onSuccess={loadInvoices} 
      />
    </div>
  );
}


