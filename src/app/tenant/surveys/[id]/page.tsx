"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "../../TenantContext";
import SurveyForm from "@/components/survey/SurveyForm";
import {
  fetchSurveyById,
  hasTenantCompletedSurvey,
  submitSurveyResponse,
  type SurveyWithQuestions,
} from "@/lib/surveyServices";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function TenantSurveyFillPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { roomUnit } = useTenant();
  const router = useRouter();

  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    Promise.all([fetchSurveyById(id), hasTenantCompletedSurvey(id, user.id)]).then(
      ([surveyRes, done]) => {
        if (!surveyRes.data || !surveyRes.data.is_active) {
          router.push("/tenant/surveys");
          return;
        }
        setSurvey(surveyRes.data);
        setCompleted(done);
        setLoading(false);
      }
    );
  }, [id, user, router]);

  const handleSubmit = async (answers: Record<string, string | string[]>) => {
    if (!user || !survey) return;

    setSubmitting(true);
    const roomInfo =
      roomUnit
        ? `${roomUnit.name || ""}${roomUnit.rooms?.title ? ` - ${roomUnit.rooms.title}` : ""}`.trim()
        : null;

    const firstTextQ = survey.questions.find((q) => q.question_type === "text");
    const manualRoom =
      firstTextQ && typeof answers[firstTextQ.id] === "string"
        ? (answers[firstTextQ.id] as string)
        : roomInfo;

    const formattedAnswers = survey.questions.map((q) => {
      const val = answers[q.id];
      if (q.question_type === "multiple_choice" && Array.isArray(val)) {
        return { question_id: q.id, answer_values: val };
      }
      return { question_id: q.id, answer_text: typeof val === "string" ? val : "" };
    });

    const { error } = await submitSurveyResponse(
      survey.id,
      user.id,
      roomUnit?.id || null,
      manualRoom,
      formattedAnswers
    );
    setSubmitting(false);

    if (error) {
      alert("Lỗi gửi khảo sát: " + error);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/tenant/surveys"), 2500);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!survey) return null;

  if (completed || success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
          {success ? "Cảm ơn bạn!" : "Đã hoàn thành"}
        </h2>
        <p className="text-neutral-500 mb-6">
          {success
            ? "Phản hồi của bạn đã được ghi nhận. Young House trân trọng cảm ơn!"
            : "Bạn đã gửi khảo sát này rồi."}
        </p>
        <Link
          href="/tenant/surveys"
          className="text-primary-6000 font-medium hover:underline"
        >
          Quay lại danh sách khảo sát
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/tenant/surveys"
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{survey.title}</h2>
          <p className="text-sm text-neutral-500">
            Vui lòng trả lời tất cả câu hỏi bắt buộc (<span className="text-red-500">*</span>)
          </p>
        </div>
      </div>

      <SurveyForm survey={survey} onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
