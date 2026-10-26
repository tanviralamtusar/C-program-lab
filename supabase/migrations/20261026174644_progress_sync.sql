-- One row per student: their whole progress object (the same JSON the site keeps in localStorage).
create table public.progress (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated bigint not null default 0,            -- version (ms); a save must name the version it was based on
  updated_at timestamptz not null default now(),
  constraint progress_size check (octet_length(data::text) < 4194304)
);

alter table public.progress enable row level security;

create policy "Students read their own progress" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Students create their own progress" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Students update their own progress" on public.progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.progress from anon, authenticated;
grant select, insert, update on public.progress to authenticated;

-- Save with a version check so two devices never overwrite each other: if another device saved
-- since p_base, nothing is written and the newer copy is returned for the browser to merge.
create or replace function public.save_progress(p_data jsonb, p_base bigint)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  cur public.progress;
  v bigint;
begin
  if (select auth.uid()) is null then
    raise exception 'Not logged in.' using errcode = '42501';
  end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' then
    raise exception 'Bad request.' using errcode = '22023';
  end if;
  select * into cur from public.progress where user_id = (select auth.uid()) for update;
  if found and p_base is not null and p_base <> cur.updated then
    return jsonb_build_object('conflict', true, 'data', cur.data, 'updated', cur.updated);
  end if;
  v := greatest((extract(epoch from clock_timestamp()) * 1000)::bigint, coalesce(cur.updated, 0) + 1);
  insert into public.progress (user_id, data, updated, updated_at)
  values ((select auth.uid()), p_data, v, now())
  on conflict (user_id) do update set data = excluded.data, updated = excluded.updated, updated_at = excluded.updated_at;
  return jsonb_build_object('ok', true, 'updated', v);
end;
$$;

revoke execute on function public.save_progress(jsonb, bigint) from public, anon;
grant execute on function public.save_progress(jsonb, bigint) to authenticated;
