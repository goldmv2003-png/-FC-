-- Supabase Dashboard > SQL Editor에서 1회 실행하세요.
-- 공개 읽기 + rise_fc_admins에 등록된 관리자만 업로드 가능
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('opponent-logos', 'opponent-logos', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Opponent logos are publicly readable" on storage.objects;
create policy "Opponent logos are publicly readable"
on storage.objects for select
using (bucket_id = 'opponent-logos');

drop policy if exists "Authenticated users upload opponent logos" on storage.objects;
drop policy if exists "Only Rise FC admins upload opponent logos" on storage.objects;
create policy "Only Rise FC admins upload opponent logos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'opponent-logos'
  and exists (
    select 1 from public.rise_fc_admins
    where user_id = auth.uid()
  )
);
