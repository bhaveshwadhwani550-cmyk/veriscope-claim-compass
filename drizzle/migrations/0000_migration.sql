CREATE TABLE public.investigations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  topic text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  analysis jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investigations TO authenticated;
GRANT ALL ON public.investigations TO service_role;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own investigations select" ON public.investigations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own investigations insert" ON public.investigations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own investigations update" ON public.investigations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own investigations delete" ON public.investigations FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id uuid NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  code text NOT NULL,
  title text NOT NULL,
  author text,
  published_at date,
  source_type text NOT NULL DEFAULT 'article',
  url text,
  content text NOT NULL,
  is_demo boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sources TO authenticated;
GRANT ALL ON public.sources TO service_role;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sources select" ON public.sources FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own sources insert" ON public.sources FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sources update" ON public.sources FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own sources delete" ON public.sources FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX ON public.sources(investigation_id);
CREATE INDEX ON public.investigations(user_id, created_at desc);