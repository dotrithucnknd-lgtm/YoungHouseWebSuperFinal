"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { uploadImage, uploadMultipleImages, DatabaseNearbyPlace, addRoomUniversities } from "@/lib/supabaseServices";
import { extractTikTokVideoId } from "@/utils/tiktokEmbed";
import UniversitySelector from "@/components/UniversitySelector";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminNewRoomPage() {
  const router = useRouter();
  const { user } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    title: "", description: "", address: "", city: "",
    district: "", ward: "", price: "", area: "",
    maps: "", phone: "", status: "available", is_hot: false,
  });

  const [displayPrice, setDisplayPrice] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<Array<{
    name: string; category: DatabaseNearbyPlace['category'];
    distance_km: string; description: string;
  }>>([{ name: '', category: 'university', distance_km: '', description: '' }]);
  const [videoReviews, setVideoReviews] = useState<Array<{
    source_url: string; display_title: string; sort_order: number;
  }>>([{ source_url: '', display_title: '', sort_order: 0 }]);

  useEffect(() => {
    const fetchAmenities = async () => {
      const { data } = await supabase.from('amenities').select('*').order('name');
      setAmenities(data || []);
    };
    fetchAmenities();
  }, []);

  const formatPrice = (value: string) => {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'maps') {
      const srcMatch = value.match(/<iframe.*?src=["'](.*?)["']/);
      if (srcMatch && srcMatch[1]) { setFormData(prev => ({ ...prev, [name]: srcMatch[1] })); return; }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\./g, '');
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({ ...prev, price: value }));
      setDisplayPrice(formatPrice(value));
    }
  };

  const handleDescriptionChange = () => {
    if (editorRef.current) setFormData(prev => ({ ...prev, description: editorRef.current!.innerHTML }));
  };

  const formatText = (command: string) => { document.execCommand(command, false); handleDescriptionChange(); };

  const toggleAmenity = (id: string, checked: boolean) => {
    setSelectedAmenities(prev => { const next = new Set(prev); if (checked) next.add(id); else next.delete(id); return next; });
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setBannerFile(file); const reader = new FileReader(); reader.onloadend = () => setBannerPreview(reader.result as string); reader.readAsDataURL(file); }
  };

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => { setImageFiles(Array.from(e.target.files || [])); };
  const handleImageUrlChange = (idx: number, value: string) => { setImageUrls(prev => prev.map((u, i) => (i === idx ? value : u))); };
  const addImageField = () => setImageUrls(prev => [...prev, '']);
  const removeImageField = (idx: number) => setImageUrls(prev => prev.filter((_, i) => i !== idx));

  const addNearbyPlaceField = () => { setNearbyPlaces(prev => [...prev, { name: '', category: 'university', distance_km: '', description: '' }]); };
  const removeNearbyPlaceField = (idx: number) => { setNearbyPlaces(prev => prev.filter((_, i) => i !== idx)); };
  const handleNearbyPlaceChange = (idx: number, field: string, value: string) => { setNearbyPlaces(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p)); };

  const addVideoReviewField = () => { setVideoReviews(prev => [...prev, { source_url: '', display_title: '', sort_order: prev.length }]); };
  const removeVideoReviewField = (idx: number) => { setVideoReviews(prev => prev.filter((_, i) => i !== idx).map((v, i) => ({ ...v, sort_order: i }))); };
  const handleVideoReviewChange = (idx: number, field: string, value: string) => { setVideoReviews(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) { alert('Vui lòng đăng nhập'); return; }
    if (!formData.title.trim()) { alert('Vui lòng nhập tên phòng trọ'); return; }
    if (!formData.address.trim()) { alert('Vui lòng nhập địa chỉ'); return; }
    if (!formData.price || parseFloat(formData.price) <= 0) { alert('Vui lòng nhập giá thuê hợp lệ'); return; }

    // Validate TikTok URLs
    const validVideos = videoReviews.filter(v => v.source_url.trim());
    for (const v of validVideos) {
      if (!extractTikTokVideoId(v.source_url)) {
        alert(`Link TikTok không hợp lệ: ${v.source_url.trim()}`);
        return;
      }
    }

    setLoading(true);
    try {
      // Upload banner
      let bannerUrl = '';
      if (bannerFile) {
        const { url, error: uploadError } = await uploadImage(bannerFile, 'room-images');
        if (uploadError) throw new Error('Upload banner thất bại: ' + uploadError);
        if (url) bannerUrl = url;
      }

      // Upload images
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const { urls, error: uploadError } = await uploadMultipleImages(imageFiles, 'room-images');
        if (uploadError) throw new Error('Upload ảnh thất bại: ' + uploadError);
        uploadedImageUrls = urls;
      }

      // Create room
      const { data: roomData, error } = await supabase.from('rooms').insert({
        owner_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        address: formData.address.trim(),
        city: formData.city.trim() || null,
        district: formData.district.trim() || null,
        ward: formData.ward.trim() || null,
        price: parseFloat(formData.price),
        area: formData.area ? parseFloat(formData.area) : null,
        status: formData.status,
        banner: bannerUrl || null,
        maps: formData.maps.trim() || null,
        is_hot: formData.is_hot,
      }).select().single();

      if (error) throw new Error('Lỗi tạo phòng: ' + error.message);

      // Update phone
      if (formData.phone.trim()) {
        await supabase.from('profiles').update({ phone: formData.phone.trim() }).eq('id', user.id);
      }

      // Add amenities
      if (selectedAmenities.size > 0 && roomData) {
        await supabase.from('room_amenities').insert(
          Array.from(selectedAmenities).map(amenityId => ({ room_id: roomData.id, amenity_id: amenityId }))
        );
      }

      // Add images
      const validImageUrls = imageUrls.map(u => u.trim()).filter(Boolean);
      const allImageUrls = [...uploadedImageUrls, ...validImageUrls];
      if (allImageUrls.length > 0 && roomData) {
        await supabase.from('room_images').insert(allImageUrls.map(url => ({ room_id: roomData.id, image_url: url })));
      }

      // Add universities
      if (selectedUniversities.length > 0 && roomData) {
        await addRoomUniversities(roomData.id, selectedUniversities);
      }

      // Add nearby places
      const validPlaces = nearbyPlaces.filter(p => p.name.trim() && p.distance_km);
      if (validPlaces.length > 0 && roomData) {
        await supabase.from('nearby_places').insert(validPlaces.map(p => ({
          room_id: roomData.id, name: p.name.trim(), category: p.category,
          distance_km: parseFloat(p.distance_km), description: p.description.trim() || null
        })));
      }

      // Add video reviews
      if (validVideos.length > 0 && roomData) {
        await supabase.from('room_video_reviews').insert(validVideos.map((v, i) => ({
          room_id: roomData.id, source_url: v.source_url.trim(),
          display_title: v.display_title.trim() || null, sort_order: i
        })));
      }

      alert('Tạo phòng trọ thành công!');
      router.push('/admin/rooms');
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/rooms" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Thêm phòng trọ mới</h1>
          <p className="text-sm text-neutral-500 mt-1">Điền thông tin chi tiết về phòng trọ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Thông tin cơ bản</h3>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Ảnh banner</label>
              {bannerPreview && <img src={bannerPreview} alt="Banner" className="w-full h-48 object-cover rounded-lg mb-2" />}
              <input type="file" accept="image/*" onChange={handleBannerChange}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tên phòng trọ <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="VD: Nhà trọ Hòa Lạc"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Mô tả</label>
              <div className="border border-neutral-300 dark:border-neutral-600 rounded-t-lg p-2 bg-neutral-50 dark:bg-neutral-700 flex gap-2">
                <button type="button" className="px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600" onClick={() => formatText('bold')}><strong>B</strong></button>
                <button type="button" className="px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600" onClick={() => formatText('italic')}><em>I</em></button>
                <button type="button" className="px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600" onClick={() => formatText('underline')}><u>U</u></button>
              </div>
              <div ref={editorRef} contentEditable onInput={handleDescriptionChange}
                className="border border-neutral-300 dark:border-neutral-600 rounded-b-lg p-3 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                suppressContentEditableWarning={true} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Giá thuê (VNĐ/tháng) <span className="text-red-500">*</span></label>
                <input type="text" value={displayPrice || formData.price} onChange={handlePriceChange} placeholder="1500000"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                {formData.price && <p className="text-xs text-neutral-500 mt-1">{Number(formData.price).toLocaleString('vi-VN')} VNĐ</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Diện tích (m²)</label>
                <input type="number" name="area" value={formData.area} onChange={handleInputChange} placeholder="20" min="0" step="0.1"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Địa chỉ</h3>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Số nhà, tên đường..."
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Phường/Xã</label>
                <input type="text" name="ward" value={formData.ward} onChange={handleInputChange} placeholder="VD: Thạch Hòa"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Quận/Huyện</label>
                <input type="text" name="district" value={formData.district} onChange={handleInputChange} placeholder="VD: Thạch Thất"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tỉnh/TP</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="VD: Hà Nội"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Link Google Maps</label>
              <input type="text" name="maps" value={formData.maps} onChange={handleInputChange} placeholder="URL hoặc dán mã iframe"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <p className="text-xs text-neutral-500 mt-1">Vào Google Maps → Share → Embed a map → Copy HTML rồi dán vào đây</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">SĐT liên hệ</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="VD: 0372858098"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Trạng thái</label>
                <select name="status" value={formData.status} onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="available">Còn trống</option>
                  <option value="reserved">Đặt trước</option>
                  <option value="rented">Đã thuê</option>
                  <option value="hidden">Ẩn</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer px-4 py-2 border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 rounded-lg w-full">
                  <input type="checkbox" checked={formData.is_hot}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_hot: e.target.checked }))}
                    className="rounded text-red-600" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">🔥 Ghim HOT</span>
                </label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Ảnh phòng</h3>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Upload ảnh từ máy tính</label>
              <input type="file" accept="image/*" multiple onChange={handleImageFilesChange}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
              {imageFiles.length > 0 && <p className="text-xs text-blue-600 mt-1">Đã chọn {imageFiles.length} ảnh</p>}
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Hoặc nhập URL ảnh:</p>
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input type="text" value={url} onChange={(e) => handleImageUrlChange(idx, e.target.value)} placeholder="https://..."
                    className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <button type="button" onClick={() => removeImageField(idx)} disabled={imageUrls.length === 1}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50">Xóa</button>
                </div>
              ))}
              <button type="button" onClick={addImageField} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Thêm URL</button>
            </div>
          </div>

          {/* Nearby Places */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Khu vực xung quanh</h3>
            {nearbyPlaces.map((place, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                <input type="text" value={place.name} onChange={(e) => handleNearbyPlaceChange(idx, 'name', e.target.value)} placeholder="Tên"
                  className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
                <select value={place.category} onChange={(e) => handleNearbyPlaceChange(idx, 'category', e.target.value)}
                  className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
                  <option value="university">Trường ĐH</option><option value="hospital">Bệnh viện</option>
                  <option value="supermarket">Siêu thị</option><option value="bus_stop">Bến xe</option>
                  <option value="restaurant">Nhà hàng</option><option value="other">Khác</option>
                </select>
                <input type="number" value={place.distance_km} onChange={(e) => handleNearbyPlaceChange(idx, 'distance_km', e.target.value)} placeholder="km" step="0.1"
                  className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
                <button type="button" onClick={() => removeNearbyPlaceField(idx)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">Xóa</button>
              </div>
            ))}
            <button type="button" onClick={addNearbyPlaceField} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Thêm địa điểm</button>
          </div>

          {/* Video Reviews */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Video Review TikTok</h3>
            <p className="text-xs text-neutral-500">Dán link TikTok (…/video/ID) hoặc mã embed</p>
            {videoReviews.map((video, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-2 items-end">
                <input type="text" value={video.source_url} onChange={(e) => handleVideoReviewChange(idx, 'source_url', e.target.value)} placeholder="URL TikTok"
                  className="col-span-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
                <div className="flex gap-2">
                  <input type="text" value={video.display_title} onChange={(e) => handleVideoReviewChange(idx, 'display_title', e.target.value)} placeholder="Tiêu đề"
                    className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
                  <button type="button" onClick={() => removeVideoReviewField(idx)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">Xóa</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addVideoReviewField} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Thêm video</button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Amenities */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Tiện nghi</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
              {amenities.map(item => (
                <label key={item.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 px-2 rounded">
                  <input type="checkbox" checked={selectedAmenities.has(item.id)}
                    onChange={(e) => toggleAmenity(item.id, e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-neutral-900 dark:text-neutral-100">{item.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Universities */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <UniversitySelector selectedUniversities={selectedUniversities} onChange={setSelectedUniversities} />
          </div>

          {/* Submit */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              {loading ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Đang tạo...</>
              ) : 'Tạo phòng trọ'}
            </button>
            <Link href="/admin/rooms"
              className="block w-full mt-3 py-3 text-center border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              Hủy
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
