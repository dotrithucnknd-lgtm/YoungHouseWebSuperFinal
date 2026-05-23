"use client";

import React, { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Textarea from "@/shared/Textarea";
import { DatabaseFeedback } from "@/lib/supabaseServices";

export interface FeedbackFormProps {
  roomId: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
  initialData?: DatabaseFeedback;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  roomId,
  onSubmit,
  onCancel,
  isEditing = false,
  initialData,
}) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (comment.trim().length < 10) {
      setError("Nhận xét phải có ít nhất 10 ký tự");
      return;
    }

    if (comment.trim().length > 500) {
      setError("Nhận xét không được quá 500 ký tự");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(rating, comment.trim());
      // Reset form if not editing
      if (!isEditing) {
        setRating(0);
        setComment("");
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRating(initialData?.rating || 0);
    setComment(initialData?.comment || "");
    setError(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          Đánh giá của bạn <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            >
              {star <= (hoveredRating || rating) ? (
                <StarIcon className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              ) : (
                <StarIconOutline className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              )}
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {rating === 1 && "Rất tệ"}
              {rating === 2 && "Tệ"}
              {rating === 3 && "Trung bình"}
              {rating === 4 && "Tốt"}
              {rating === 5 && "Rất tốt"}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          Nhận xét của bạn <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Chia sẻ trải nghiệm của bạn về phòng trọ này..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full"
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Tối thiểu 10 ký tự
          </span>
          <span
            className={`text-xs ${
              comment.length > 500
                ? "text-red-600 dark:text-red-400"
                : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            {comment.length}/500
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <ButtonPrimary
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting
            ? "Đang gửi..."
            : isEditing
            ? "Cập nhật đánh giá"
            : "Gửi đánh giá"}
        </ButtonPrimary>
        {(isEditing || onCancel) && (
          <ButtonSecondary
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Hủy
          </ButtonSecondary>
        )}
      </div>
    </form>
  );
};

export default FeedbackForm;

