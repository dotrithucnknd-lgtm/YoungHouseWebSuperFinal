"use client";

import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Input from "@/shared/Input";
import Label from "@/components/Label";
import Select from "@/shared/Select";
import Textarea from "@/shared/Textarea";
import {
  createNotification,
  updateNotification,
  DatabaseNotification,
} from "@/lib/supabaseServices";
import { broadcastPushNotification } from "@/lib/broadcastPushNotification";

interface AdminNotificationFormProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  editingNotification?: DatabaseNotification | null;
}

const AdminNotificationForm: React.FC<AdminNotificationFormProps> = ({
  show,
  onHide,
  onSuccess,
  editingNotification,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    target_audience: 'all' as 'all' | 'renters' | 'owners' | 'admins',
    is_active: true,
  });

  useEffect(() => {
    if (editingNotification) {
      setForm({
        title: editingNotification.title,
        content: editingNotification.content,
        type: editingNotification.type,
        target_audience: editingNotification.target_audience,
        is_active: editingNotification.is_active,
      });
    } else {
      setForm({
        title: '',
        content: '',
        type: 'info',
        target_audience: 'all',
        is_active: true,
      });
    }
    setError('');
  }, [editingNotification, show]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editingNotification) {
        // Update existing notification
        const { notification, error: updateError } = await updateNotification(
          editingNotification.id,
          form
        );

        if (updateError) {
          setError(updateError);
        } else {
          onSuccess();
        }
      } else {
        // Create new notification
        const { notification, error: createError } = await createNotification(form);

        if (createError) {
          setError(createError);
        } else {
          if (form.is_active) {
            await broadcastPushNotification({
              title: form.title,
              content: form.content,
              target_audience: form.target_audience,
              url: "/",
            });
          }
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onHide}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-6"
                >
                  <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {editingNotification ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
                  </h3>
                  <button
                    onClick={onHide}
                    className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label>Tiêu đề *</Label>
                      <Input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        placeholder="Nhập tiêu đề thông báo"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Nội dung *</Label>
                      <Textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        required
                        placeholder="Nhập nội dung thông báo"
                        className="mt-1.5"
                        rows={5}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Loại thông báo *</Label>
                        <Select
                          name="type"
                          value={form.type}
                          onChange={handleChange}
                          className="mt-1.5"
                        >
                          <option value="info">Thông tin</option>
                          <option value="warning">Cảnh báo</option>
                          <option value="success">Thành công</option>
                          <option value="error">Lỗi</option>
                        </Select>
                      </div>

                      <div>
                        <Label>Đối tượng *</Label>
                        <Select
                          name="target_audience"
                          value={form.target_audience}
                          onChange={handleChange}
                          className="mt-1.5"
                        >
                          <option value="all">Tất cả người dùng</option>
                          <option value="renters">Người thuê</option>
                          <option value="owners">Chủ nhà</option>
                          <option value="admins">Quản trị viên</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={form.is_active}
                          onChange={handleChange}
                          className="rounded"
                        />
                        <span className="text-sm text-neutral-900 dark:text-neutral-100">
                          Kích hoạt thông báo ngay
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <ButtonSecondary onClick={onHide} type="button">
                      Hủy
                    </ButtonSecondary>
                    <ButtonPrimary type="submit" disabled={loading}>
                      {loading ? 'Đang lưu...' : editingNotification ? 'Cập nhật' : 'Tạo thông báo'}
                    </ButtonPrimary>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AdminNotificationForm;


