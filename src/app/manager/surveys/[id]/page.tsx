"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import SurveyBuilder, { type SurveyFormData } from "@/components/survey/SurveyBuilder";
import { fetchSurveyById, updateSurvey } from "@/lib/surveyServices";
import { ArrowLeftIcon, EyeIcon } from "@heroicons/react/24/outline";

export default function ManagerEditSurveyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<SurveyFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchSurveyById(id).then(({ data, error }) => {
      if (error || !data) {
        alert("Không tìm thấy khảo sát");
        router.push("/manager/surveys");
        return;
      }
      setForm({
        title: data.title,
        description: data.description || "",
        is_active: data.is_active,
        expires_at: data.expires_at
          ? new Date(data.expires_at).toISOString().slice(0, 16)
          : "",
        questions: data.questions.map((q) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          is_required: q.is_required,
          sort_order: q.sort_order,
        })),
      });
      setLoading(false);
    });
  }, [id, router]);

  const handleSubmit = async () => {
    if (!form || !id || !form.title.trim()) return;
    if (form.questions.length === 0) {
      alert("Vui lòng thêm ít nhất một câu hỏi");
      return;
    }

    setSubmitting(true);
    const { error } = await updateSurvey(
      id,
      {
        title: form.title,
        description: form.description,
        is_active: form.is_active,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      },
      form.questions
    );
    setSubmitting(false);

    if (error) {
      alert("Lỗi cập nhật: " + error);
      return;
    }

    alert("Đã lưu khảo sát!");
    router.push("/manager/surveys");
  };

  if (loading || !form) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/manager/surveys"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Chỉnh sửa khảo sát</h2>
            <p className="text-sm text-neutral-500">{form.title}</p>
          </div>
        </div>
        <Link
          href={`/manager/surveys/${id}/responses`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400"
        >
          <EyeIcon className="w-4 h-4" />
          Xem phản hồi
        </Link>
      </div>

      <SurveyBuilder
        data={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Lưu thay đổi"
      />
    </div>
  );
}
