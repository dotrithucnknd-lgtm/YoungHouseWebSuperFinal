"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  fetchSurveyById,
  fetchSurveyResponses,
  type SurveyResponse,
  type SurveyWithQuestions,
} from "@/lib/surveyServices";
import {
  ArrowLeftIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function ManagerSurveyResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchSurveyById(id), fetchSurveyResponses(id)]).then(
      ([surveyRes, respRes]) => {
        setSurvey(surveyRes.data);
        setResponses(respRes.data || []);
        setLoading(false);
      }
    );
  }, [id]);

  const exportCsv = () => {
    if (!survey || responses.length === 0) return;

    const headers = [
      "Thời gian",
      "Khách thuê",
      "Email",
      "SĐT",
      "Phòng",
      ...survey.questions.map((q) => q.question_text),
    ];

    const rows = responses.map((r) => {
      const answerMap = new Map(
        (r.answers || []).map((a) => [
          a.question_id,
          a.answer_values?.length
            ? a.answer_values.join("; ")
            : a.answer_text || "",
        ])
      );
      return [
        new Date(r.submitted_at).toLocaleString("vi-VN"),
        r.tenant?.name || "",
        r.tenant?.email || "",
        r.tenant?.phone || "",
        r.room_info || "",
        ...survey.questions.map((q) => answerMap.get(q.id) || ""),
      ];
    });

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `khao-sat-${survey.title.slice(0, 30)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="flex items-center gap-3">
          <Link
            href="/manager/surveys"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Phản hồi khảo sát
            </h2>
            <p className="text-sm text-neutral-500">
              {survey?.title} · {responses.length} phản hồi
            </p>
          </div>
        </div>
        {responses.length > 0 && (
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Xuất CSV
          </button>
        )}
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <UserIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">Chưa có phản hồi nào từ khách thuê</p>
        </div>
      ) : (
        <div className="space-y-3">
          {responses.map((resp) => {
            const isExpanded = expandedId === resp.id;
            return (
              <div
                key={resp.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : resp.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-950/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-5 h-5 text-primary-6000" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900 dark:text-white truncate">
                        {resp.tenant?.name || "Khách thuê"}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {resp.tenant?.email}
                        {resp.room_info && ` · ${resp.room_info}`}
                        {" · "}
                        {new Date(resp.submitted_at).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 space-y-4 bg-neutral-50/50 dark:bg-neutral-900/50">
                    {(resp.answers || [])
                      .sort(
                        (a, b) =>
                          (a.question?.sort_order ?? 0) - (b.question?.sort_order ?? 0)
                      )
                      .map((ans) => (
                        <div key={ans.id}>
                          <p className="text-xs font-semibold text-neutral-500 uppercase mb-1">
                            {ans.question?.question_text || "Câu hỏi"}
                          </p>
                          <p className="text-sm text-neutral-900 dark:text-white bg-white dark:bg-neutral-900 rounded-xl p-3 border border-neutral-200 dark:border-neutral-700">
                            {ans.answer_values?.length
                              ? ans.answer_values.join(", ")
                              : ans.answer_text || "—"}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
