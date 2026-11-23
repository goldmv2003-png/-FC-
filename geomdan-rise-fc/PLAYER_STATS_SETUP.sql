-- Supabase SQL Editor에서 한 번 실행하세요.
create table if not exists public.player_match_stats (
 id uuid primary key default gen_random_uuid(),
 match_id uuid not null references public.matches(id) on delete cascade,
 player_id uuid not null references public.players(id) on delete cascade,
 stat_type text not null check (stat_type in ('GOAL','ASSIST')),
 minute integer null,
 created_at timestamptz not null default now()
);

alter table public.player_match_stats enable row level security;
drop policy if exists "public can read player match stats" on public.player_match_stats;
drop policy if exists "authenticated admins can insert player stats" on public.player_match_stats;
drop policy if exists "authenticated admins can delete player stats" on public.player_match_stats;
create policy "public can read player match stats" on public.player_match_stats for select using (true);
create policy "authenticated admins can insert player stats" on public.player_match_stats for insert to authenticated with check (exists (select 1 from public.rise_fc_admins a where a.user_id = auth.uid()));
create policy "authenticated admins can delete player stats" on public.player_match_stats for delete to authenticated using (exists (select 1 from public.rise_fc_admins a where a.user_id = auth.uid()));
