"use client";

import React, { useEffect, useState, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Input from "@/shared/Input";
import Label from "@/components/Label";
import Select from "@/shared/Select";
import { supabase } from "@/lib/supabaseClient";
import { uploadImage, uploadMultipleImages, DatabaseNearbyPlace, addRoomUniversities } from "@/lib/supabaseServices";
import UniversitySelector from "@/components/UniversitySelector";

interface AdminCreateRoomFormProps {
  show: boolean;
  onHide: () => void;
  onCreated: (room: any) => void;
}

const AdminCreateRoomForm: React.FC<AdminCreateRoomFormProps> = ({ show, onHide, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [loadingAmenities, setLoadingAmenities] = useState(true);
  const [error, setError] = useState('');
  const [amenities, setAmenities] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    area: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    status: 'available',
    banner: '',
    maps: '',
    is_hot: false,
    phone: '',
  });
  const [initialPhone, setInitialPhone] = useState<string>('');

  const [displayPrice, setDisplayPrice] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const [imageUrls, setImageUrls] = useState(['']);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Universities state
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);

  // Nearby places state
  const [nearbyPlaces, setNearbyPlaces] = useState<Array<{
    name: string;
    category: DatabaseNearbyPlace['category'];
    distance_km: string;
    description: string;
  }>>([{
    name: '',
    category: 'university',
    distance_km: '',
    description: ''
  }]);

  useEffect(() => {
    if (!show) return;

    const fetchAmenities = async () => {
      try {
        setLoadingAmenities(true);
        const { data, error: fetchError } = await supabase
          .from('amenities')
          .select('*')
          .order('name');

        if (fetchError) throw fetchError;
        setAmenities(data || []);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Không tải được danh sách tiện nghi');
      } finally {
        setLoadingAmenities(false);
      }
    };

    // Auto-prefill the phone field with the current admin's phone from profiles
    const fetchAdminPhone = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', userData.user.id)
          .single();
        const phone = (profile?.phone || '').trim();
        setInitialPhone(phone);
        setForm(prev => ({ ...prev, phone: phone }));
      } catch {
        // Silent: admin can still type phone manually
      }
    };

    fetchAmenities();
    fetchAdminPhone();
  }, [show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'maps') {
      const srcMatch = value.match(/<iframe.*?src=["'](.*?)["']/);
      if (srcMatch && srcMatch[1]) {
        setForm(prev => ({ ...prev, [name]: srcMatch[1] }));
        return;
      }
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const formatPrice = (value: string) => {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\./g, '');
    if (value === '' || /^\d+$/.test(value)) {
      setForm(prev => ({ ...prev, price: value }));
      setDisplayPrice(formatPrice(value));
    }
  };

  const handleDescriptionChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setForm(prev => ({ ...prev, description: content }));
    }
  };

  const formatText = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value || '');
    handleDescriptionChange();
  };

  const toggleAmenity = (id: string, checked: boolean) => {
    setSelectedAmenities(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleImageUrlChange = (idx: number, value: string) => {
    setImageUrls(prev => prev.map((u, i) => (i === idx ? value : u)));
  };

  const addImageField = () => setImageUrls(prev => [...prev, '']);
  const removeImageField = (idx: number) => setImageUrls(prev => prev.filter((_, i) => i !== idx));

  const addNearbyPlaceField = () => {
    setNearbyPlaces(prev => [...prev, {
      name: '',
      category: 'university',
      distance_km: '',
      description: ''
    }]);
  };

  const removeNearbyPlaceField = (idx: number) => {
    setNearbyPlaces(prev => prev.filter((_, i) => i !== idx));
  };

  const handleNearbyPlaceChange = (idx: number, field: string, value: string) => {
    setNearbyPlaces(prev => prev.map((place, i) => 
      i === idx ? { ...place, [field]: value } : place
    ));
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
    }
  };

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Chưa đăng nhập');

      // Save the admin's phone to their own profile so it can be shown
      // on the room detail page as the contact phone.
      const trimmedPhone = form.phone.trim();
      if (trimmedPhone && trimmedPhone !== initialPhone) {
        const { error: phoneError } = await supabase
          .from('profiles')
          .update({ phone: trimmedPhone })
          .eq('id', userData.user.id);
        if (phoneError) {
          console.error('Error updating admin phone:', phoneError);
        } else {
          setInitialPhone(trimmedPhone);
        }
      }

      // Upload banner if file selected
      let bannerUrl = form.banner;
      if (bannerFile) {
        setUploadingBanner(true);
        const { url, error: uploadError } = await uploadImage(bannerFile, 'room-images');
        setUploadingBanner(false);
        
        if (uploadError) throw new Error('Upload banner thất bại: ' + uploadError);
        if (url) bannerUrl = url;
      }

      // Upload image files if any
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        const { urls, error: uploadError } = await uploadMultipleImages(imageFiles, 'room-images');
        setUploadingImages(false);
        
        if (uploadError) throw new Error('Upload ảnh thất bại: ' + uploadError);
        uploadedImageUrls = urls;
      }

      // Create room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          owner_id: userData.user.id,
          title: form.title.trim(),
          description: form.description.trim() || null,
          price: Number(form.price),
          area: form.area ? Number(form.area) : null,
          address: form.address.trim(),
          city: form.city.trim() || null,
          district: form.district.trim() || null,
          ward: form.ward.trim() || null,
          status: form.status || 'available',
          banner: bannerUrl.trim() || null,
          maps: form.maps.trim() || null,
          is_hot: form.is_hot,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add amenities
      if (selectedAmenities.size > 0 && roomData) {
        const amenityInserts = Array.from(selectedAmenities).map(amenityId => ({
          room_id: roomData.id,
          amenity_id: amenityId
        }));

        const { error: amenityError } = await supabase
          .from('room_amenities')
          .insert(amenityInserts);

        if (amenityError) console.error('Error adding amenities:', amenityError);
      }

      // Add images (combine uploaded files and URLs)
      const validImageUrls = imageUrls.map(u => u.trim()).filter(Boolean);
      const allImageUrls = [...uploadedImageUrls, ...validImageUrls];
      
      if (allImageUrls.length > 0 && roomData) {
        const imageInserts = allImageUrls.map(url => ({
          room_id: roomData.id,
          image_url: url
        }));

        const { error: imageError } = await supabase
          .from('room_images')
          .insert(imageInserts);

        if (imageError) console.error('Error adding images:', imageError);
      }

      // Add nearby places
      const validNearbyPlaces = nearbyPlaces.filter(place => 
        place.name.trim() && place.distance_km
      );

      if (validNearbyPlaces.length > 0 && roomData) {
        const nearbyPlaceInserts = validNearbyPlaces.map(place => ({
          room_id: roomData.id,
          name: place.name.trim(),
          category: place.category,
          distance_km: parseFloat(place.distance_km),
          description: place.description.trim() || null
        }));

        const { error: nearbyPlaceError } = await supabase
          .from('nearby_places')
          .insert(nearbyPlaceInserts);

        if (nearbyPlaceError) console.error('Error adding nearby places:', nearbyPlaceError);
      }

      // Add university associations
      if (selectedUniversities.length > 0 && roomData) {
        const { error: universityError } = await addRoomUniversities(roomData.id, selectedUniversities);
        if (universityError) console.error('Error adding university associations:', universityError);
      }

      onCreated(roomData);
      
      // Reset form
      setForm({
        title: '',
        description: '',
        price: '',
        area: '',
        address: '',
        city: '',
        district: '',
        ward: '',
        status: 'available',
        banner: '',
        maps: '',
        is_hot: false,
        phone: initialPhone,
      });
      setDisplayPrice('');
      setSelectedAmenities(new Set());
      setImageUrls(['']);
      setBannerFile(null);
      setImageFiles([]);
      setSelectedUniversities([]);
      setNearbyPlaces([{
        name: '',
        category: 'university',
        distance_km: '',
        description: ''
      }]);
      if (editorRef.current) editorRef.current.innerHTML = '';
      
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo phòng');
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-6"
                >
                  <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Thêm phòng mới
                  </h3>
                  <button
                    onClick={onHide}
                    className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </Dialog.Title>

                {loadingAmenities ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <span className="ml-3">Đang tải...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Main Content - Left Side */}
                      <div className="lg:col-span-2 space-y-4">
                        <div>
                          <Label>Tiêu đề *</Label>
                          <Input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="mt-1.5"
                          />
                        </div>

                        <div>
                          <Label>Mô tả</Label>
                          {/* Rich Text Editor Toolbar */}
                          <div className="border border-neutral-300 dark:border-neutral-600 rounded-t-lg p-2 bg-neutral-50 dark:bg-neutral-700 flex gap-2">
                            <button
                              type="button"
                              className="px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
                              onClick={() => formatText('bold')}
                              title="Bold"
                            >
                              <strong>B</strong>
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
                              onClick={() => formatText('italic')}
                              title="Italic"
                            >
                              <em>I</em>
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
                              onClick={() => formatText('underline')}
                              title="Underline"
                            >
                              <u>U</u>
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
                              onClick={() => formatText('insertUnorderedList')}
                              title="Bullet List"
                            >
                              •
                            </button>
                          </div>
                          <div
                            ref={editorRef}
                            contentEditable
                            onInput={handleDescriptionChange}
                            className="border border-neutral-300 dark:border-neutral-600 rounded-b-lg p-3 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                            suppressContentEditableWarning={true}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Giá (VNĐ/tháng) *</Label>
                            <Input
                              type="text"
                              name="price"
                              value={displayPrice || form.price}
                              onChange={handlePriceChange}
                              required
                              className="mt-1.5"
                            />
                            {form.price && (
                              <p className="text-xs text-neutral-500 mt-1">
                                {Number(form.price).toLocaleString('vi-VN')} VNĐ
                              </p>
                            )}
                          </div>
                          <div>
                            <Label>Diện tích (m²)</Label>
                            <Input
                              type="number"
                              name="area"
                              value={form.area}
                              onChange={handleChange}
                              className="mt-1.5"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Địa chỉ *</Label>
                          <Input
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            required
                            className="mt-1.5"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Thành phố</Label>
                            <Input
                              name="city"
                              value={form.city}
                              onChange={handleChange}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Quận/Huyện</Label>
                            <Input
                              name="district"
                              value={form.district}
                              onChange={handleChange}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Phường/Xã</Label>
                            <Input
                              name="ward"
                              value={form.ward}
                              onChange={handleChange}
                              className="mt-1.5"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Link Google Maps Embedded</Label>
                          <Input
                            name="maps"
                            value={form.maps}
                            onChange={handleChange}
                            placeholder="https://www.google.com/maps/embed?pb=... hoặc dán nguyên mã <iframe>"
                            className="mt-1.5"
                          />
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Vào Google Maps → Share → Embed a map → Copy HTML rồi dán vào đây (hệ thống sẽ tự trích xuất URL)
                          </p>
                        </div>

                        <div>
                          <Label>
                            Số điện thoại liên hệ{' '}
                            <span className="text-xs font-normal text-neutral-500">
                              (hiển thị trên trang chi tiết phòng)
                            </span>
                          </Label>
                          <Input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="VD: 0372858098"
                            inputMode="tel"
                            className="mt-1.5"
                          />
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Số này sẽ được lưu vào profile của bạn và dùng làm SĐT liên hệ
                            cho mọi phòng bạn tạo.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Trạng thái</Label>
                            <Select
                              name="status"
                              value={form.status}
                              onChange={handleChange}
                              className="mt-1.5"
                            >
                              <option value="available">Còn trống</option>
                              <option value="reserved">Đặt trước</option>
                              <option value="rented">Đã thuê</option>
                              <option value="hidden">Ẩn</option>
                            </Select>
                          </div>
                          <div>
                            <Label>Banner</Label>
                            <div className="mt-1.5 space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerFileChange}
                                className="block w-full text-sm text-neutral-700 dark:text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-neutral-900 hover:file:bg-primary-700 cursor-pointer"
                              />
                              {bannerFile && (
                                <p className="text-xs text-green-600">Đã chọn: {bannerFile.name}</p>
                              )}
                              <Input
                                name="banner"
                                value={form.banner}
                                onChange={handleChange}
                                placeholder="Hoặc nhập URL: https://..."
                                className="mt-2"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.is_hot}
                              onChange={(e) =>
                                setForm((prev) => ({ ...prev, is_hot: e.target.checked }))
                              }
                              className="mt-1 rounded"
                            />
                            <div>
                              <div className="font-semibold text-red-700 dark:text-red-300">
                                🔥 Ghim phòng này vào section HOT trên trang chủ
                              </div>
                              <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                Chỉ các phòng được đánh dấu HOT mới hiển thị ưu tiên ở đầu trang chủ
                                (tối đa 8 phòng, phần còn lại sẽ tự động bù bằng phòng mới nhất).
                              </div>
                            </div>
                          </label>
                        </div>

                        <div>
                          <Label>Ảnh phòng</Label>
                          <div className="mt-1.5 space-y-3">
                            {/* Upload files */}
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageFilesChange}
                                className="block w-full text-sm text-neutral-700 dark:text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-neutral-900 hover:file:bg-primary-700 cursor-pointer"
                              />
                              {imageFiles.length > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                  Đã chọn {imageFiles.length} ảnh
                                </p>
                              )}
                            </div>

                            {/* Or enter URLs */}
                            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                Hoặc nhập URL ảnh:
                              </p>
                              {imageUrls.map((url, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                  <Input
                                    value={url}
                                    onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                                    placeholder="https://..."
                                    className="flex-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImageField(idx)}
                                    disabled={imageUrls.length === 1}
                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={addImageField}
                                className="text-sm text-primary-600 hover:text-primary-700"
                              >
                                + Thêm URL
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sidebar - Right Side */}
                      <div className="space-y-4">
                        <div>
                          <Label>Tiện nghi</Label>
                          <div className="border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 max-h-[400px] overflow-y-auto">
                            {amenities.map(item => (
                              <label key={item.id} className="flex items-center gap-2 py-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  onChange={(e) => toggleAmenity(item.id, e.target.checked)}
                                  className="rounded"
                                />
                                <span className="text-sm text-neutral-900 dark:text-neutral-100">{item.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <UniversitySelector
                            selectedUniversities={selectedUniversities}
                            onChange={setSelectedUniversities}
                          />
                        </div>

                        <div>
                          <Label>Khu vực xung quanh 🗺️</Label>
                          <div className="space-y-3">
                            {nearbyPlaces.map((place, idx) => (
                              <div key={idx} className="border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                    Địa điểm #{idx + 1}
                                  </span>
                                  {nearbyPlaces.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeNearbyPlaceField(idx)}
                                      className="text-xs text-red-600 hover:text-red-700"
                                    >
                                      Xóa
                                    </button>
                                  )}
                                </div>

                                <Input
                                  placeholder="Tên địa điểm (VD: Đại học FPT)"
                                  value={place.name}
                                  onChange={(e) => handleNearbyPlaceChange(idx, 'name', e.target.value)}
                                  className="text-sm"
                                />

                                <Select
                                  value={place.category}
                                  onChange={(e) => handleNearbyPlaceChange(idx, 'category', e.target.value)}
                                  className="text-sm"
                                >
                                  <option value="university">🎓 Đại học</option>
                                  <option value="school">🏫 Trường học</option>
                                  <option value="hospital">🏥 Bệnh viện</option>
                                  <option value="supermarket">🛒 Siêu thị</option>
                                  <option value="mall">🏪 Trung tâm thương mại</option>
                                  <option value="park">🌳 Công viên</option>
                                  <option value="bus_stop">🚌 Trạm xe buýt</option>
                                  <option value="metro">🚇 Tàu điện</option>
                                  <option value="restaurant">🍽️ Nhà hàng</option>
                                  <option value="cafe">☕ Quán cafe</option>
                                  <option value="gym">💪 Phòng gym</option>
                                  <option value="other">📍 Khác</option>
                                </Select>

                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="Khoảng cách (km)"
                                  value={place.distance_km}
                                  onChange={(e) => handleNearbyPlaceChange(idx, 'distance_km', e.target.value)}
                                  className="text-sm"
                                />

                                <Input
                                  placeholder="Mô tả (optional)"
                                  value={place.description}
                                  onChange={(e) => handleNearbyPlaceChange(idx, 'description', e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={addNearbyPlaceField}
                              className="w-full text-sm text-primary-600 hover:text-primary-700 border border-dashed border-primary-300 rounded-lg py-2 hover:border-primary-500 transition-colors"
                            >
                              + Thêm địa điểm
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <ButtonSecondary onClick={onHide} type="button">
                        Hủy
                      </ButtonSecondary>
                      <ButtonPrimary type="submit" disabled={loading || uploadingBanner || uploadingImages}>
                        {uploadingBanner ? 'Đang upload banner...' : uploadingImages ? 'Đang upload ảnh...' : loading ? 'Đang lưu...' : 'Tạo phòng'}
                      </ButtonPrimary>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AdminCreateRoomForm;

