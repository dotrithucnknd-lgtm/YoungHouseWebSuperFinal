-- =========================================================================
-- SURVEY SYSTEM: Manager tạo khảo sát, Tenant trả lời, Manager xem kết quả
-- =========================================================================

-- ---------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text'
    CHECK (question_type IN ('text', 'textarea', 'single_choice', 'multiple_choice')),
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_unit_id UUID REFERENCES public.room_units(id) ON DELETE SET NULL,
  room_info TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (survey_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS public.survey_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  answer_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (response_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON public.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_tenant_id ON public.survey_responses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_survey_answers_response_id ON public.survey_answers(response_id);

-- ---------------------------------------------------------
-- 2. UPDATED_AT TRIGGER
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_surveys_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS surveys_updated_at ON public.surveys;
CREATE TRIGGER surveys_updated_at
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.set_surveys_updated_at();

-- ---------------------------------------------------------
-- 3. RLS
-- ---------------------------------------------------------

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_answers ENABLE ROW LEVEL SECURITY;

-- Surveys: manager/admin full access; tenant reads active only
DROP POLICY IF EXISTS surveys_manager_all ON public.surveys;
CREATE POLICY surveys_manager_all ON public.surveys
  FOR ALL TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('admin', 'manager'))
  WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'manager'));

DROP POLICY IF EXISTS surveys_tenant_select_active ON public.surveys;
CREATE POLICY surveys_tenant_select_active ON public.surveys
  FOR SELECT TO authenticated
  USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND public.get_user_role(auth.uid()) IN ('tenant', 'admin')
  );

-- Questions: manager/admin full; tenant reads questions of active surveys
DROP POLICY IF EXISTS survey_questions_manager_all ON public.survey_questions;
CREATE POLICY survey_questions_manager_all ON public.survey_questions
  FOR ALL TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('admin', 'manager'))
  WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'manager'));

DROP POLICY IF EXISTS survey_questions_tenant_select ON public.survey_questions;
CREATE POLICY survey_questions_tenant_select ON public.survey_questions
  FOR SELECT TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN ('tenant', 'admin')
    AND EXISTS (
      SELECT 1 FROM public.surveys s
      WHERE s.id = survey_questions.survey_id
        AND s.is_active = true
        AND (s.expires_at IS NULL OR s.expires_at > now())
    )
  );

-- Responses: manager/admin read all; tenant insert/select own
DROP POLICY IF EXISTS survey_responses_manager_select ON public.survey_responses;
CREATE POLICY survey_responses_manager_select ON public.survey_responses
  FOR SELECT TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('admin', 'manager'));

DROP POLICY IF EXISTS survey_responses_tenant_insert ON public.survey_responses;
CREATE POLICY survey_responses_tenant_insert ON public.survey_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = auth.uid()
    AND public.get_user_role(auth.uid()) IN ('tenant', 'admin')
    AND EXISTS (
      SELECT 1 FROM public.surveys s
      WHERE s.id = survey_responses.survey_id
        AND s.is_active = true
        AND (s.expires_at IS NULL OR s.expires_at > now())
    )
  );

DROP POLICY IF EXISTS survey_responses_tenant_select ON public.survey_responses;
CREATE POLICY survey_responses_tenant_select ON public.survey_responses
  FOR SELECT TO authenticated
  USING (
    tenant_id = auth.uid()
    AND public.get_user_role(auth.uid()) IN ('tenant', 'admin')
  );

-- Answers: manager/admin read; tenant insert/select own via response
DROP POLICY IF EXISTS survey_answers_manager_select ON public.survey_answers;
CREATE POLICY survey_answers_manager_select ON public.survey_answers
  FOR SELECT TO authenticated
  USING (public.get_user_role(auth.uid()) IN ('admin', 'manager'));

DROP POLICY IF EXISTS survey_answers_tenant_insert ON public.survey_answers;
CREATE POLICY survey_answers_tenant_insert ON public.survey_answers
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('tenant', 'admin')
    AND EXISTS (
      SELECT 1 FROM public.survey_responses r
      WHERE r.id = survey_answers.response_id
        AND r.tenant_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS survey_answers_tenant_select ON public.survey_answers;
CREATE POLICY survey_answers_tenant_select ON public.survey_answers
  FOR SELECT TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN ('tenant', 'admin')
    AND EXISTS (
      SELECT 1 FROM public.survey_responses r
      WHERE r.id = survey_answers.response_id
        AND r.tenant_id = auth.uid()
    )
  );

-- Manager needs INSERT/UPDATE/DELETE on responses? No - only tenants submit.
-- Manager needs INSERT/UPDATE/DELETE on answers? No.

NOTIFY pgrst, 'reload schema';
