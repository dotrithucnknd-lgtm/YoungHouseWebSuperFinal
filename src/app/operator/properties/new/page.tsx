"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PhotoIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { uploadImage, uploadMultipleImages, DatabaseNearbyPlace } from "@/lib/supabaseServices";
import UniversitySelector from "@/components/UniversitySelector";
import { canUserCreateRooms, printRLSDebugInfo } from "@/utils/debugRLS";
import { formatPriceInput, parsePriceInput } from "@/utils/formatPriceRange";

export default function NewPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingAmenities, setLoadingAmenities] = useState(true);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const editorRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    min_price: "",
    max_price: "",
    area: "",
    maps: "",
    phone: "",
    status: "available",
  });

  const [displayMinPrice, setDisplayMinPrice] = useState("");
  const [displayMaxPrice, setDisplayMaxPrice] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

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

  // Video reviews state
  const [videoReviews, setVideoReviews] = useState<Array<{
    source_url: string;
    display_title: string;
    sort_order: number;
  }>>([{
    source_url: '',
    display_title: '',
    sort_order: 0
  }]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoadingAmenities(true);
        const { data, error } = await supabase
          .from('amenities')
          .select('*')
          .order('name');

        if (error) throw error;
        setAmenities(data || []);
      } catch (err: any) {
        console.error('Error loading amenities:', err);
      } finally {
        setLoadingAmenities(false);
      }
    };

    // Auto-prefill phone from profile
    const fetchOwnerPhone = async () => {
      if (!user?.id) return;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', user.id)
          .single();
        
        if (profile?.phone) {
          setFormData(prev => ({ ...prev, phone: profile.phone }));
        }
      } catch (err) {
        console.error('Error fetching phone:', err);
      }
    };

    // Check permissions and print debug info
    const checkPermissions = async () => {
      const { can, reason } = await canUserCreateRooms();
      if (!can) {
        console.error('❌ Cannot create rooms:', reason);
        await printRLSDebugInfo();
      }
    };

    fetchAmenities();
    fetchOwnerPhone();
    checkPermissions();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Extract iframe src from maps embed code
    if (name === 'maps') {
      const srcMatch = value.match(/<iframe.*?src=["'](.*?)["']/);
      if (srcMatch && srcMatch[1]) {
        setFormData(prev => ({ ...prev, [name]: srcMatch[1] }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatPrice = formatPriceInput;

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parsePriceInput(e.target.value);
    if (value === "" || /^\d+$/.test(value)) {
      setFormData((prev) => ({ ...prev, min_price: value }));
      setDisplayMinPrice(formatPrice(value));
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parsePriceInput(e.target.value);
    if (value === "" || /^\d+$/.test(value)) {
      setFormData((prev) => ({ ...prev, max_price: value }));
      setDisplayMaxPrice(formatPrice(value));
    }
  };

  const handleDescriptionChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setFormData(prev => ({ ...prev, description: content }));
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

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
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

  const addVideoReviewField = () => {
    setVideoReviews(prev => [...prev, {
      source_url: '',
      display_title: '',
      sort_order: prev.length
    }]);
  };

  const removeVideoReviewField = (idx: number) => {
    setVideoReviews(prev => prev.filter((_, i) => i !== idx).map((v, i) => ({
      ...v,
      sort_order: i
    })));
  };

  const handleVideoReviewChange = (idx: number, field: string, value: string) => {
    setVideoReviews(prev => prev.map((video, i) => 
      i === idx ? { ...video, [field]: value } : video
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('Vui lòng đăng nhập để tiếp tục');
      return;
    }

    // Check permissions first
    const { can, reason } = await canUserCreateRooms();
    if (!can) {
      console.error('Permission check failed:', reason);
      await printRLSDebugInfo();
      alert(`Không thể tạo nhà trọ: ${reason}\n\nVui lòng kiểm tra console để biết thêm chi tiết và xem file FIX_RLS_ERROR_GUIDE.md`);
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tên nhà trọ');
      return;
    }
    if (!formData.address.trim()) {
      alert('Vui lòng nhập địa chỉ');
      return;
    }
    const minPrice = parseFloat(formData.min_price);
    const maxPrice = parseFloat(formData.max_price) || minPrice;

    if (!minPrice || minPrice <= 0) {
      alert('Vui lòng nhập giá thuê tối thiểu hợp lệ');
      return;
    }
    if (maxPrice < minPrice) {
      alert('Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu');
      return;
    }
    if (!formData.area || parseFloat(formData.area) <= 0) {
      alert('Vui lòng nhập diện tích hợp lệ');
      return;
    }

    setLoading(true);
    try {
      // Update owner's phone if changed
      const trimmedPhone = formData.phone.trim();
      if (trimmedPhone) {
        await supabase
          .from('profiles')
          .update({ phone: trimmedPhone })
          .eq('id', user.id);
      }

      // Upload banner if exists
      let bannerUrl = '';
      if (bannerFile) {
        const { url, error: uploadError } = await uploadImage(bannerFile, 'room-images');
        if (uploadError) {
          console.error('Banner upload error:', uploadError);
          throw new Error('Upload banner thất bại: ' + uploadError + '\n\nKiểm tra Storage bucket policies trong Supabase Dashboard.');
        }
        if (url) bannerUrl = url;
      }

      // Upload image files if any
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const { urls, error: uploadError } = await uploadMultipleImages(imageFiles, 'room-images');
        if (uploadError) throw new Error('Upload ảnh thất bại: ' + uploadError);
        uploadedImageUrls = urls;
      }

      // Get session token for server API
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');

      // Combine image URLs
      const validImageUrls = imageUrls.map((u: string) => u.trim()).filter(Boolean);
      const allImageUrls = [...uploadedImageUrls, ...validImageUrls];

      // Nearby places
      const validNearbyPlaces = nearbyPlaces
        .filter((place: any) => place.name.trim() && place.distance_km)
        .map((place: any) => ({
          name: place.name.trim(),
          category: place.category,
          distance_km: parseFloat(place.distance_km),
          description: place.description.trim() || null,
        }));

      // Video reviews
      const validVideoReviews = videoReviews
        .filter((video: any) => video.source_url.trim())
        .map((video: any) => ({
          source_url: video.source_url.trim(),
          display_title: video.display_title.trim() || null,
          sort_order: video.sort_order,
        }));

      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          phone: formData.phone,
          room: {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            address: formData.address.trim(),
            city: formData.city.trim() || null,
            district: formData.district.trim() || null,
            ward: formData.ward.trim() || null,
            price: minPrice,
            min_price: minPrice,
            max_price: maxPrice,
            area: parseFloat(formData.area),
            status: formData.status,
            banner: bannerUrl || null,
            maps: formData.maps.trim() || null,
          },
          amenities: Array.from(selectedAmenities),
          imageUrls: allImageUrls,
          nearbyPlaces: validNearbyPlaces,
          universities: selectedUniversities,
          videoReviews: validVideoReviews,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Có lỗi xảy ra khi tạo nhà trọ');
      }

      alert('Tạo nhà trọ thành công!');
      router.push('/operator/properties');
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      alert(error.message || 'Có lỗi xảy ra khi tạo nhà trọ');
    } finally {
      setLoading(false);
    }
  };

  if (loadingAmenities) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-neutral-600 dark:text-neutral-400">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/operator/properties"
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Thêm nhà trọ mới</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Điền thông tin chi tiết về nhà trọ của bạn
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Section */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Thông tin cơ bản</h3>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Ảnh banner
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="block w-full text-sm text-neutral-700 dark:text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer"
                />
                {bannerFile && (
                  <p className="text-xs text-green-600">Đã chọn: {bannerFile.name}</p>
                )}
                {bannerPreview && (
                  <img src={bannerPreview} alt="Banner preview" className="w-full h-48 object-cover rounded-lg" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Tên nhà trọ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="VD: Nhà trọ Hòa Lạc"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Mô tả
              </label>
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
                className="border border-neutral-300 dark:border-neutral-600 rounded-b-lg p-3 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                suppressContentEditableWarning={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Giá từ (VNĐ/tháng) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="min_price"
                  value={displayMinPrice || formData.min_price}
                  onChange={handleMinPriceChange}
                  placeholder="1.500.000"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                {formData.min_price && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {Number(formData.min_price).toLocaleString('vi-VN')} VNĐ
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Giá đến (VNĐ/tháng)
                </label>
                <input
                  type="text"
                  name="max_price"
                  value={displayMaxPrice || formData.max_price}
                  onChange={handleMaxPriceChange}
                  placeholder="3.000.000"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {formData.max_price && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {Number(formData.max_price).toLocaleString('vi-VN')} VNĐ
                  </p>
                )}
                <p className="text-xs text-neutral-400 mt-1">Để trống nếu chỉ có một mức giá</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Diện tích (m²) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="20"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Địa chỉ</h3>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Địa chỉ chi tiết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Số nhà, tên đường..."
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Phường/Xã
                </label>
                <input
                  type="text"
                  name="ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  placeholder="VD: Thạch Hòa"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="VD: Thạch Thất"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Tỉnh/Thành phố
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="VD: Hà Nội"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Link Google Maps (Embed URL)
              </label>
              <input
                type="text"
                name="maps"
                value={formData.maps}
                onChange={handleInputChange}
                placeholder="https://www.google.com/maps/embed?pb=... hoặc dán nguyên mã <iframe>"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Vào Google Maps → Share → Embed a map → Copy HTML rồi dán vào đây (hệ thống sẽ tự trích xuất URL)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="VD: 0372858098"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Số này sẽ được lưu vào profile của bạn và dùng làm SĐT liên hệ cho mọi phòng bạn tạo
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="available">Còn trống</option>
                <option value="reserved">Đặt trước</option>
                <option value="rented">Đã thuê</option>
                <option value="hidden">Ẩn</option>
              </select>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Ảnh phòng</h3>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Upload ảnh từ máy tính
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageFilesChange}
                className="block w-full text-sm text-neutral-700 dark:text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer"
              />
              {imageFiles.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Đã chọn {imageFiles.length} ảnh
                </p>
              )}
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                Hoặc nhập URL ảnh:
              </p>
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageField(idx)}
                    disabled={imageUrls.length === 1}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImageField}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                + Thêm URL
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          {/* Amenities */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Tiện nghi</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
              {amenities.map(item => (
                <label key={item.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 px-2 rounded">
                  <input type="checkbox" checked={selectedAmenities.has(item.id)}
                    onChange={(e) => toggleAmenity(item.id, e.target.checked)}
                    className="rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-neutral-900 dark:text-neutral-100">{item.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Universities */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <UniversitySelector
              selectedUniversities={selectedUniversities}
              onChange={setSelectedUniversities}
            />
          </div>

          {/* Nearby Places */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Khu vực xung quanh 🗺️</h3>
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
                  
                  <input
                    type="text"
                    value={place.name}
                    onChange={(e) => handleNearbyPlaceChange(idx, 'name', e.target.value)}
                    placeholder="Tên địa điểm"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  
                  <select
                    value={place.category}
                    onChange={(e) => handleNearbyPlaceChange(idx, 'category', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="university">Trường học</option>
                    <option value="hospital">Bệnh viện</option>
                    <option value="market">Chợ</option>
                    <option value="supermarket">Siêu thị</option>
                    <option value="bus_station">Bến xe</option>
                    <option value="park">Công viên</option>
                    <option value="restaurant">Nhà hàng</option>
                    <option value="cafe">Quán cà phê</option>
                    <option value="gym">Phòng gym</option>
                    <option value="other">Khác</option>
                  </select>

                  <input
                    type="number"
                    value={place.distance_km}
                    onChange={(e) => handleNearbyPlaceChange(idx, 'distance_km', e.target.value)}
                    placeholder="Khoảng cách (km)"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />

                  <textarea
                    value={place.description}
                    onChange={(e) => handleNearbyPlaceChange(idx, 'description', e.target.value)}
                    placeholder="Mô tả (tùy chọn)"
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addNearbyPlaceField}
                className="w-full py-2 text-sm text-green-600 hover:text-green-700 font-medium border border-dashed border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                + Thêm địa điểm
              </button>
            </div>
          </div>

          {/* Video Reviews */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Video đánh giá 🎥</h3>
            <div className="space-y-3">
              {videoReviews.map((video, idx) => (
                <div key={idx} className="border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Video #{idx + 1}
                    </span>
                    {videoReviews.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVideoReviewField(idx)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={video.source_url}
                    onChange={(e) => handleVideoReviewChange(idx, 'source_url', e.target.value)}
                    placeholder="URL video (YouTube, TikTok, Facebook)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  
                  <input
                    type="text"
                    value={video.display_title}
                    onChange={(e) => handleVideoReviewChange(idx, 'display_title', e.target.value)}
                    placeholder="Tiêu đề hiển thị (tùy chọn)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addVideoReviewField}
                className="w-full py-2 text-sm text-green-600 hover:text-green-700 font-medium border border-dashed border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                + Thêm video
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tạo...' : 'Tạo nhà trọ'}
              </button>
              <Link
                href="/operator/properties"
                className="w-full px-4 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors text-center"
              >
                Hủy
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}


