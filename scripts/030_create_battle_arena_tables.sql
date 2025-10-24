-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS public.battle_queue CASCADE;
DROP TABLE IF EXISTS public.battle_history CASCADE;
DROP TABLE IF EXISTS public.battle_ratings CASCADE;
DROP TABLE IF EXISTS public.battle_submissions CASCADE;
DROP TABLE IF EXISTS public.battle_team_players CASCADE;
DROP TABLE IF EXISTS public.battle_teams CASCADE;
DROP TABLE IF EXISTS public.battles CASCADE;

-- Recreate all tables with correct schema
CREATE TABLE IF NOT EXISTS public.battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL CHECK (mode IN ('1v1', '3v3')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  problem_set_id UUID REFERENCES public.contests(id),
  start_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.battle_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  score INT DEFAULT 0,
  penalty_time INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.battle_team_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.battle_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('captain', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.battle_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.battle_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('AC', 'WA', 'TLE', 'MLE', 'RE', 'CE', 'pending')),
  penalty INT DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  code TEXT,
  language TEXT
);

CREATE TABLE IF NOT EXISTS public.battle_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'team')),
  mode TEXT NOT NULL CHECK (mode IN ('1v1', '3v3')),
  elo INT DEFAULT 1500,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  draws INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entity_id, entity_type, mode)
);

CREATE TABLE IF NOT EXISTS public.battle_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.battle_teams(id) ON DELETE CASCADE,
  result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
  elo_change INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.battle_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.battle_teams(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('1v1', '3v3')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'accepted', 'declined')),
  current_elo INT DEFAULT 1500,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  matched_at TIMESTAMP WITH TIME ZONE
);

-- Create partial unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_battle_queue_user_id_mode ON public.battle_queue(user_id, mode) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_battle_queue_team_id_mode ON public.battle_queue(team_id, mode) WHERE team_id IS NOT NULL;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_battles_mode_status ON public.battles(mode, status);
CREATE INDEX IF NOT EXISTS idx_battles_created_at ON public.battles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battle_teams_battle_id ON public.battle_teams(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_team_players_team_id ON public.battle_team_players(team_id);
CREATE INDEX IF NOT EXISTS idx_battle_team_players_user_id ON public.battle_team_players(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_battle_id ON public.battle_submissions(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_team_id ON public.battle_submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_user_id ON public.battle_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_ratings_entity_id ON public.battle_ratings(entity_id, mode);
CREATE INDEX IF NOT EXISTS idx_battle_history_user_id ON public.battle_history(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_queue_mode_status ON public.battle_queue(mode, status);
CREATE INDEX IF NOT EXISTS idx_battle_queue_user_id ON public.battle_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_queue_team_id ON public.battle_queue(team_id);

-- Enable RLS
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "battles_select_all" ON public.battles FOR SELECT USING (true);
CREATE POLICY "battles_insert_own" ON public.battles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "battles_update_own" ON public.battles FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "battle_teams_select_all" ON public.battle_teams FOR SELECT USING (true);
CREATE POLICY "battle_teams_insert_own" ON public.battle_teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "battle_team_players_select_all" ON public.battle_team_players FOR SELECT USING (true);
CREATE POLICY "battle_team_players_insert_own" ON public.battle_team_players FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "battle_submissions_select_all" ON public.battle_submissions FOR SELECT USING (true);
CREATE POLICY "battle_submissions_insert_own" ON public.battle_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "battle_ratings_select_all" ON public.battle_ratings FOR SELECT USING (true);
CREATE POLICY "battle_ratings_insert_own" ON public.battle_ratings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "battle_history_select_all" ON public.battle_history FOR SELECT USING (true);
CREATE POLICY "battle_history_insert_own" ON public.battle_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "battle_queue_select_own" ON public.battle_queue FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM public.battle_team_players WHERE team_id = battle_queue.team_id));
CREATE POLICY "battle_queue_insert_own" ON public.battle_queue FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "battle_queue_delete_own" ON public.battle_queue FOR DELETE USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM public.battle_team_players WHERE team_id = battle_queue.team_id));