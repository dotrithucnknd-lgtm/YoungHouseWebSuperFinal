"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchActiveSurveysForTenant,
  hasTenantCompletedSurvey,
  type SurveyWithQuestions,
} from "@/lib/surveyServices";
import {
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function TenantSurveysPage() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<(SurveyWithQuestions & { completed: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await fetchActiveSurveysForTenant(user.id);
      const withStatus = await Promise.all(
        (data || []).map(async (s) => ({
          ...s,
          completed: await hasTenantCompletedSurvey(s.id, user.id),
        }))
      );
      setSurveys(withStatus);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  const pending = surveys.filter((s) => !s.completed);
  const completed = surveys.filter((s) => s.completed);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <ClipboardDocumentCheckIcon className="w-6 h-6 text-primary-6000" />
          Khảo sát dịch vụ
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Góp ý để Young House cải thiện chất lượng phục vụ
        </p>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <ClipboardDocumentCheckIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">Hiện chưa có khảo sát nào đang mở</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                Cần làm ({pending.length})
              </h3>
              {pending.map((survey) => (
                <Link
                  key={survey.id}
                  href={`/tenant/surveys/${survey.id}`}
                  className="block bg-white dark:bg-neutral-900 rounded-2xl border-2 border-primary-200 dark:border-primary-800 p-5 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white group-hover:text-primary-6000 transition-colors">
                        {survey.title}
                      </h4>
                      <p className="text-sm text-neutral-500 mt-1">
                        {survey.questions.length} câu hỏi
                        {survey.expires_at && (
                          <> · Hạn: {new Date(survey.expires_at).toLocaleDateString("vi-VN")}</>
                        )}
                      </p>
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-primary-6000 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {completed.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                Đã hoàn thành ({completed.length})
              </h3>
              {completed.map((survey) => (
                <div
                  key={survey.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 opacity-75"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {survey.title}
                      </h4>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Đã gửi phản hồi
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
