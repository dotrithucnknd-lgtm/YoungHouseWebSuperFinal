"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchAllSurveys,
  toggleSurveyActive,
  deleteSurvey,
  type SurveyWithQuestions,
} from "@/lib/surveyServices";
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function ManagerSurveysPage() {
  const [surveys, setSurveys] = useState<SurveyWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const { data, error } = await fetchAllSurveys();
    if (error) console.error(error);
    setSurveys(data || []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (id: string, current: boolean) => {
    const { error } = await toggleSurveyActive(id, !current);
    if (error) {
      alert("Lỗi: " + error);
      return;
    }
    await load();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa khảo sát "${title}"? Tất cả câu trả lời sẽ bị xóa.`)) return;
    const { error } = await deleteSurvey(id);
    if (error) {
      alert("Lỗi: " + error);
      return;
    }
    await load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-6 h-6 text-primary-6000" />
            Quản lý khảo sát
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Tạo khảo sát cho khách thuê và xem kết quả phản hồi
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setRefreshing(true); load(); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Làm mới
          </button>
          <Link
            href="/manager/surveys/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-6000 text-white rounded-xl hover:bg-primary-700"
          >
            <PlusIcon className="w-4 h-4" />
            Tạo khảo sát
          </Link>
        </div>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <ClipboardDocumentListIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 mb-4">Chưa có khảo sát nào</p>
          <Link
            href="/manager/surveys/new"
            className="inline-flex items-center gap-1.5 text-primary-6000 font-medium hover:underline"
          >
            <PlusIcon className="w-4 h-4" />
            Tạo khảo sát đầu tiên
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-neutral-900 dark:text-white truncate">
                      {survey.title}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        survey.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                      }`}
                    >
                      {survey.is_active ? "Đang mở" : "Nháp"}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {survey.questions.length} câu hỏi · {survey.response_count || 0} phản hồi
                    {survey.expires_at && (
                      <> · Hạn: {new Date(survey.expires_at).toLocaleDateString("vi-VN")}</>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleToggle(survey.id, survey.is_active)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    {survey.is_active ? "Tắt khảo sát" : "Kích hoạt"}
                  </button>
                  <Link
                    href={`/manager/surveys/${survey.id}/responses`}
                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400"
                  >
                    <EyeIcon className="w-3.5 h-3.5" />
                    Xem phản hồi ({survey.response_count || 0})
                  </Link>
                  <Link
                    href={`/manager/surveys/${survey.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50"
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(survey.id, survey.title)}
                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
