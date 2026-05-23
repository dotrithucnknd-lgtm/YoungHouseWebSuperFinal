"use client";

import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { FeedbackWithUser } from "@/lib/supabaseServices";
import Avatar from "@/shared/Avatar";

export interface FeedbackItemProps {
  feedback: FeedbackWithUser;
  onDelete?: (feedbackId: string) => void;
  onEdit?: (feedbackId: string) => void;
  isOwnFeedback?: boolean;
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({
  feedback,
  onDelete,
  onEdit,
  isOwnFeedback = false,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Hôm nay";
    } else if (diffDays === 1) {
      return "Hôm qua";
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} tuần trước`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} tháng trước`;
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex gap-4 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:shadow-lg transition-shadow">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar
          sizeClass="h-10 w-10"
          radius="rounded-full"
          userName={feedback.profiles.name}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {feedback.profiles.name}
              </h4>
              {feedback.profiles.role === "admin" && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  Admin
                </span>
              )}
              {feedback.profiles.role === "operator" && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Vận hành
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {renderStars(feedback.rating)}
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatDate(feedback.created_at)}
              </span>
            </div>
          </div>

          {/* Action buttons for own feedback */}
          {isOwnFeedback && (onEdit || onDelete) && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(feedback.id)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Sửa
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(feedback.id)}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                >
                  Xóa
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comment */}
        {feedback.comment && (
          <p className="text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed whitespace-pre-wrap break-words mt-2">
            {feedback.comment}
          </p>
        )}
      </div>
    </div>
  );
};

export default FeedbackItem;


