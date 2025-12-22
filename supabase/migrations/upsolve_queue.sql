CREATE TABLE public.upsolve_queue (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid REFERENCES public.problems(id) ON DELETE CASCADE,

  box smallint NOT NULL CHECK (box BETWEEN 1 AND 5),
  next_due_at timestamptz NOT NULL,

  last_result text CHECK (last_result IN ('fail','success')),
  source text CHECK (source IN ('contest','daily','manual')),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  PRIMARY KEY (user_id, problem_id)
);