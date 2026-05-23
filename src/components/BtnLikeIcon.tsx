"use client";

import React, { FC, useState, useEffect } from "react";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/supabaseServices";
import { useAuth } from "@/contexts/AuthContext";

export interface BtnLikeIconProps {
  className?: string;
  colorClass?: string;
  isLiked?: boolean;
  roomId?: string;
}

const BtnLikeIcon: FC<BtnLikeIconProps> = ({
  className = "",
  colorClass = "text-white bg-black bg-opacity-30 hover:bg-opacity-50",
  isLiked = false,
  roomId,
}) => {
  const [likedState, setLikedState] = useState(isLiked);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Check if room is in wishlist when component mounts
  useEffect(() => {
    if (roomId && user) {
      checkWishlistStatus();
    }
  }, [roomId, user]);

  const checkWishlistStatus = async () => {
    if (!roomId) return;
    const inWishlist = await isInWishlist(roomId);
    setLikedState(inWishlist);
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Vui lòng đăng nhập để lưu phòng yêu thích');
      return;
    }

    if (!roomId) {
      console.error('Room ID is required');
      return;
    }

    setLoading(true);

    if (likedState) {
      // Remove from wishlist
      const { success, error } = await removeFromWishlist(roomId);
      if (success) {
        setLikedState(false);
      } else {
        console.error('Error removing from wishlist:', error);
        alert(error || 'Có lỗi xảy ra');
      }
    } else {
      // Add to wishlist
      const { success, error } = await addToWishlist(roomId);
      if (success) {
        setLikedState(true);
      } else {
        console.error('Error adding to wishlist:', error);
        alert(error || 'Có lỗi xảy ra');
      }
    }

    setLoading(false);
  };

  return (
    <div
      className={`nc-BtnLikeIcon w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${
        likedState 
          ? "text-pink-500 bg-pink-100 hover:bg-pink-200" 
          : "text-white bg-black bg-opacity-30 hover:bg-opacity-50"
      } ${className} ${loading ? 'opacity-50' : ''}`}
      data-nc-id="BtnLikeIcon"
      title={likedState ? "Bỏ lưu" : "Lưu"}
      onClick={handleClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${likedState ? "text-pink-600" : ""}`}
        fill={likedState ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke={likedState ? "currentColor" : "currentColor"}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </div>
  );
};

export default BtnLikeIcon;

