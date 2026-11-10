-- ============================================================================
-- Reverse Song Battle - Supabase Database Migration
-- Run this in your Supabase Project's SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================================

-- 1. Create table: user_info
CREATE TABLE IF NOT EXISTS public.user_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    username_lower TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    security_question TEXT NOT NULL,
    security_answer_lower TEXT NOT NULL,
    all_time_score INT DEFAULT 0,
    matches_played INT DEFAULT 0,
    matches_won INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant case-insensitive lookups on username and answer
CREATE INDEX IF NOT EXISTS idx_user_info_username_lower ON public.user_info(username_lower);
CREATE INDEX IF NOT EXISTS idx_user_info_security_answer ON public.user_info(security_answer_lower);

-- 2. Create table: match_history
CREATE TABLE IF NOT EXISTS public.match_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_name TEXT NOT NULL,
    player2_name TEXT NOT NULL,
    player1_score INT NOT NULL DEFAULT 0,
    player2_score INT NOT NULL DEFAULT 0,
    winner TEXT NOT NULL,
    game_mode TEXT NOT NULL DEFAULT 'single_device', -- 'single_device' or 'two_device'
    target_score INT DEFAULT 5,
    played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user match history queries
CREATE INDEX IF NOT EXISTS idx_match_history_players 
ON public.match_history(player1_name, player2_name);

-- 3. Row Level Security (RLS) Policies
-- Enable RLS
ALTER TABLE public.user_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;

-- Allow anon public client to SELECT, INSERT, and UPDATE user_info
CREATE POLICY "Allow public select user_info" 
ON public.user_info FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow public insert user_info" 
ON public.user_info FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow public update user_info" 
ON public.user_info FOR UPDATE 
TO anon 
USING (true);

-- Allow anon public client to read and record match history
CREATE POLICY "Allow public select match_history" 
ON public.match_history FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow public insert match_history" 
ON public.match_history FOR INSERT 
TO anon 
WITH CHECK (true);
