import { supabase } from "./supabaseClient";

export type SurveyQuestionType = "text" | "textarea" | "single_choice" | "multiple_choice";

export interface SurveyQuestionInput {
  question_text: string;
  question_type: SurveyQuestionType;
  options: string[];
  is_required: boolean;
  sort_order: number;
}

export interface Survey {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion extends SurveyQuestionInput {
  id: string;
  survey_id: string;
  created_at: string;
}

export interface SurveyWithQuestions extends Survey {
  questions: SurveyQuestion[];
  response_count?: number;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  tenant_id: string;
  room_unit_id: string | null;
  room_info: string | null;
  submitted_at: string;
  tenant?: { id: string; name: string | null; email: string | null; phone: string | null };
  answers?: SurveyAnswer[];
}

export interface SurveyAnswer {
  id: string;
  response_id: string;
  question_id: string;
  answer_text: string | null;
  answer_values: string[] | null;
  question?: SurveyQuestion;
}

export const YOUNG_HOUSE_SURVEY_TEMPLATE = {
  title: "KHẢO SÁT KHÁCH HÀNG YOUNG HOUSE",
  description: `YH gửi lời chào đến bạn!

Cảm ơn bạn đã lựa chọn dịch vụ nhà ở hệ thống Young House. Đây là phiếu khảo sát đánh giá dịch vụ chăm sóc khách hàng, bạn vui lòng cho BQL Young House biết thông tin để hoàn thiện dịch vụ, mang lại cho bạn nhiều trải nghiệm tốt nhất nhé.

Khi tham gia Khảo sát, bạn cũng sẽ được cấp 1 mã số để quay trúng thưởng: Kỳ nghỉ 2 NGÀY 1 ĐÊM tại Yara Homestay Hải Tiến - Thanh Hóa. Mỗi người trúng giải sẽ được sử dụng 01 phòng đôi cho bản thân, hoặc tặng cho gia đình, bạn bè. Tổng số giải thưởng: 03 giải thưởng!

Trân trọng!`,
  questions: [
    { question_text: "Bạn đang ở Phòng nào? Tòa nhà nào?", question_type: "text" as const, options: [], is_required: true, sort_order: 0 },
    { question_text: "Ở YH, có vấn đề kỹ thuật nào (nước, điện, thiết bị trong nhà…) khiến em chưa hài lòng?", question_type: "textarea" as const, options: [], is_required: true, sort_order: 1 },
    { question_text: "Khi em cần hỗ trợ, em thông báo với Quản lý tòa nhà, em nhận được feedback có nhanh như em mong muốn không?", question_type: "single_choice" as const, options: ["Phản hồi ngay", "Cần phản hồi nhanh hơn"], is_required: true, sort_order: 2 },
    { question_text: "Quản lý tòa nhà có hỗ trợ em sửa chữa, khắc phục các vấn đề trong phòng/trong nhà kịp thời không? Có nhiệt tình và tôn trọng khách hàng không?", question_type: "single_choice" as const, options: ["Hỗ trợ nhanh chóng, kịp thời", "Cần hỗ trợ nhanh hơn nữa"], is_required: true, sort_order: 3 },
    { question_text: "Em đánh giá như thế nào về Dịch vụ VỆ SINH của YH?", question_type: "single_choice" as const, options: ["Trung bình", "Khá", "Tốt", "Rất tốt"], is_required: true, sort_order: 4 },
    { question_text: "Về hoạt động Thu tiền thuê nhà định kì hàng tháng, em có ý kiến gì không?", question_type: "textarea" as const, options: [], is_required: true, sort_order: 5 },
    { question_text: "Em đã từng sử dụng các dịch vụ CÓ TRẢ PHÍ của Young House như: DV Vệ sinh, DV sửa chữa Kỹ thuật chưa?", question_type: "single_choice" as const, options: ["Sử dụng thường xuyên", "Thỉnh thoảng sử dụng", "Chưa bao giờ"], is_required: true, sort_order: 6 },
    { question_text: "Nếu YH triển khai dịch vụ Vệ sinh định kì, em có mong muốn sử dụng không?", question_type: "single_choice" as const, options: ["Sẽ sử dụng", "Chưa có nhu cầu"], is_required: true, sort_order: 7 },
    { question_text: "Hiện tại Young House đang triển khai chương trình: KHÁCH HÀNG GIỚI THIỆU KHÁCH HÀNG. Quà tặng là 1 triệu/01 phòng khi giới thiệu thành công. Em có muốn tham gia chương trình không?", question_type: "single_choice" as const, options: ["Có tham gia", "Chưa muốn tham gia"], is_required: true, sort_order: 8 },
    { question_text: "Sắp hết hạn hợp đồng thuê nhà, em có kế hoạch Tái ký hay Trả phòng?", question_type: "single_choice" as const, options: ["Sẽ tái ký tiếp", "Không tái ký", "Khác"], is_required: true, sort_order: 9 },
    { question_text: "Nếu KHÔNG TÁI KÝ thì bạn hãy cho YH biết lý do:", question_type: "single_choice" as const, options: ["Tốt nghiệp ra trường", "Đi thực tập", "Kế hoạch cá nhân khác"], is_required: true, sort_order: 10 },
    { question_text: "Cảm ơn em đã thực hiện khảo sát này. Em có đề xuất gì khác muốn gửi tới YH nữa không?", question_type: "textarea" as const, options: [], is_required: true, sort_order: 11 },
  ],
};

export async function fetchAllSurveys(): Promise<{ data: SurveyWithQuestions[] | null; error: string | null }> {
  const { data: surveys, error } = await supabase
    .from("surveys")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };

  const result: SurveyWithQuestions[] = [];
  for (const survey of surveys || []) {
    const { data: questions } = await supabase
      .from("survey_questions")
      .select("*")
      .eq("survey_id", survey.id)
      .order("sort_order", { ascending: true });

    const { count } = await supabase
      .from("survey_responses")
      .select("*", { count: "exact", head: true })
      .eq("survey_id", survey.id);

    result.push({
      ...survey,
      questions: (questions || []).map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : [],
      })),
      response_count: count || 0,
    });
  }

  return { data: result, error: null };
}

export async function fetchSurveyById(id: string): Promise<{ data: SurveyWithQuestions | null; error: string | null }> {
  const { data: survey, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { data: null, error: error.message };

  const { data: questions, error: qError } = await supabase
    .from("survey_questions")
    .select("*")
    .eq("survey_id", id)
    .order("sort_order", { ascending: true });

  if (qError) return { data: null, error: qError.message };

  return {
    data: {
      ...survey,
      questions: (questions || []).map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : [],
      })),
    },
    error: null,
  };
}

export async function createSurvey(
  survey: { title: string; description?: string; is_active?: boolean; expires_at?: string | null },
  questions: SurveyQuestionInput[],
  createdBy: string
): Promise<{ data: Survey | null; error: string | null }> {
  const { data: newSurvey, error } = await supabase
    .from("surveys")
    .insert({
      title: survey.title.trim(),
      description: survey.description?.trim() || null,
      is_active: survey.is_active ?? false,
      expires_at: survey.expires_at || null,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  if (questions.length > 0) {
    const { error: qError } = await supabase.from("survey_questions").insert(
      questions.map((q) => ({
        survey_id: newSurvey.id,
        question_text: q.question_text.trim(),
        question_type: q.question_type,
        options: q.options.filter((o) => o.trim()),
        is_required: q.is_required,
        sort_order: q.sort_order,
      }))
    );
    if (qError) return { data: null, error: qError.message };
  }

  return { data: newSurvey, error: null };
}

export async function updateSurvey(
  id: string,
  survey: { title: string; description?: string; is_active?: boolean; expires_at?: string | null },
  questions: SurveyQuestionInput[]
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("surveys")
    .update({
      title: survey.title.trim(),
      description: survey.description?.trim() || null,
      is_active: survey.is_active ?? false,
      expires_at: survey.expires_at || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const { error: delError } = await supabase.from("survey_questions").delete().eq("survey_id", id);
  if (delError) return { error: delError.message };

  if (questions.length > 0) {
    const { error: qError } = await supabase.from("survey_questions").insert(
      questions.map((q) => ({
        survey_id: id,
        question_text: q.question_text.trim(),
        question_type: q.question_type,
        options: q.options.filter((o) => o.trim()),
        is_required: q.is_required,
        sort_order: q.sort_order,
      }))
    );
    if (qError) return { error: qError.message };
  }

  return { error: null };
}

export async function deleteSurvey(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("surveys").delete().eq("id", id);
  return { error: error?.message || null };
}

export async function toggleSurveyActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.from("surveys").update({ is_active: isActive }).eq("id", id);
  return { error: error?.message || null };
}

export async function fetchActiveSurveysForTenant(tenantId: string): Promise<{ data: SurveyWithQuestions[] | null; error: string | null }> {
  const { data: surveys, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };

  const { data: completed } = await supabase
    .from("survey_responses")
    .select("survey_id")
    .eq("tenant_id", tenantId);

  const completedIds = new Set((completed || []).map((r) => r.survey_id));

  const result: SurveyWithQuestions[] = [];
  for (const survey of surveys || []) {
    if (survey.expires_at && new Date(survey.expires_at) < new Date()) continue;

    const { data: questions } = await supabase
      .from("survey_questions")
      .select("*")
      .eq("survey_id", survey.id)
      .order("sort_order", { ascending: true });

    result.push({
      ...survey,
      questions: (questions || []).map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : [],
      })),
      response_count: completedIds.has(survey.id) ? 1 : 0,
    });
  }

  return { data: result, error: null };
}

export async function hasTenantCompletedSurvey(surveyId: string, tenantId: string): Promise<boolean> {
  const { data } = await supabase
    .from("survey_responses")
    .select("id")
    .eq("survey_id", surveyId)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  return !!data;
}

export async function submitSurveyResponse(
  surveyId: string,
  tenantId: string,
  roomUnitId: string | null,
  roomInfo: string | null,
  answers: { question_id: string; answer_text?: string; answer_values?: string[] }[]
): Promise<{ error: string | null }> {
  const { data: response, error: rError } = await supabase
    .from("survey_responses")
    .insert({
      survey_id: surveyId,
      tenant_id: tenantId,
      room_unit_id: roomUnitId,
      room_info: roomInfo,
    })
    .select()
    .single();

  if (rError) return { error: rError.message };

  const { error: aError } = await supabase.from("survey_answers").insert(
    answers.map((a) => ({
      response_id: response.id,
      question_id: a.question_id,
      answer_text: a.answer_text || null,
      answer_values: a.answer_values || null,
    }))
  );

  if (aError) return { error: aError.message };
  return { error: null };
}

export async function fetchSurveyResponses(surveyId: string): Promise<{ data: SurveyResponse[] | null; error: string | null }> {
  const { data: responses, error } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("survey_id", surveyId)
    .order("submitted_at", { ascending: false });

  if (error) return { data: null, error: error.message };

  const tenantIds = [...new Set((responses || []).map((r) => r.tenant_id))];
  const { data: tenants } = tenantIds.length
    ? await supabase.from("profiles").select("id, name, email, phone").in("id", tenantIds)
    : { data: [] };
  const tenantMap = new Map((tenants || []).map((t) => [t.id, t]));

  const result: SurveyResponse[] = [];
  for (const resp of responses || []) {
    const { data: answers } = await supabase
      .from("survey_answers")
      .select("*, question:survey_questions(*)")
      .eq("response_id", resp.id);

    result.push({
      ...resp,
      tenant: tenantMap.get(resp.tenant_id),
      answers: (answers || []).map((a) => ({
        ...a,
        question: a.question
          ? { ...a.question, options: Array.isArray(a.question.options) ? a.question.options : [] }
          : undefined,
      })),
    });
  }

  return { data: result, error: null };
}
