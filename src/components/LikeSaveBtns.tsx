"use client";

import React, { useState, useEffect } from "react";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/supabaseServices";
import { useAuth } from "@/contexts/AuthContext";
import { HeartIcon, ShareIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

interface LikeSaveBtnsProps {
  roomId?: string;
  className?: string;
}

const LikeSaveBtns: React.FC<LikeSaveBtnsProps> = ({ roomId, className = "" }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if room is already in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !roomId) {
        setChecking(false);
        return;
      }

      try {
        const isInList = await isInWishlist(roomId);
        setIsSaved(isInList);
      } catch (error) {
        console.error('Error checking wishlist:', error);
      } finally {
        setChecking(false);
      }
    };

    checkWishlist();
  }, [user, roomId]);

  const handleSaveClick = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để lưu phòng yêu thích');
      return;
    }

    if (!roomId) {
      alert('Không tìm thấy thông tin phòng');
      return;
    }

    setLoading(true);

    try {
      if (isSaved) {
        // Remove from wishlist
        const { success, error } = await removeFromWishlist(roomId);
        if (success) {
          setIsSaved(false);
        } else {
          alert(error || 'Có lỗi xảy ra khi xóa khỏi danh sách yêu thích');
        }
      } else {
        // Add to wishlist
        const { success, error } = await addToWishlist(roomId);
        if (success) {
          setIsSaved(true);
        } else {
          alert(error || 'Có lỗi xảy ra khi thêm vào danh sách yêu thích');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Phòng trọ',
        text: 'Xem phòng trọ này',
        url: window.location.href,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Đã copy link!');
    }
  };

  return (
    <div className={`flow-root ${className}`}>
      <div className="flex text-neutral-700 dark:text-neutral-300 text-sm -mx-3 -my-1.5">
        {/* Share Button */}
        <button
          onClick={handleShareClick}
          className="py-1.5 px-3 flex rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
        >
          <ShareIcon className="h-5 w-5" />
          <span className="hidden sm:block ml-2.5">Chia sẻ</span>
        </button>

        {/* Save/Wishlist Button */}
        <button
          onClick={handleSaveClick}
          disabled={loading || checking}
          className={`py-1.5 px-3 flex rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors ${
            loading || checking ? 'opacity-50 cursor-not-allowed' : ''
          } ${isSaved ? 'text-red-600 dark:text-red-500' : ''}`}
        >
          {checking ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500"></div>
          ) : isSaved ? (
            <HeartIconSolid className="h-5 w-5" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
          <span className="hidden sm:block ml-2.5">
            {loading ? 'Đang xử lý...' : isSaved ? 'Đã lưu' : 'Lưu'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default LikeSaveBtns;

