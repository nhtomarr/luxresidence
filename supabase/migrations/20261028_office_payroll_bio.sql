-- Maaş verilişi barmaq izi ilə (ZKTeco ADMS) — 28.10.2026
-- İcazə: ofis_maas (mühasib/kassir) + sahibkar, sys, dev, HR, admin
create or replace function public.office_pay_ok() returns boolean language sql stable security definer set search_path=public as
$$ select lux_has_perm('ofis_maas') or lux_has_perm('ofis_owner') or lux_has_perm('sys') or lux_has_perm('dev') or lux_has_perm('ofis_hr') $$;

-- sabit maaş
create table if not exists public.office_pay_base(employee_id bigint primary key, amount numeric not null default 0, note text, updated_by uuid, updated_at timestamptz default now());
-- ay (dövr): açıq olanda barmaq izi maaşı "verildi" edir
create table if not exists public.office_pay_period(period text primary key, open boolean default false, opened_at timestamptz, opened_by uuid, closed_at timestamptz, note text);
-- ayın siyahısı
create table if not exists public.office_payroll(
 id bigserial primary key, period text not null, employee_id bigint not null, amount numeric not null default 0,
 status text not null default 'gozleyir' check (status in ('gozleyir','verildi','bloklu')),
 paid_at timestamptz, paid_via text, paid_by uuid, scan_id bigint,
 block_reason text, blocked_by uuid, blocked_at timestamptz, note text,
 created_at timestamptz default now(), updated_at timestamptz default now(), unique(period, employee_id));
-- cihazlar
create table if not exists public.bio_devices(sn text primary key, name text, allowed boolean default false, model text, fw text, ip text,
 users int, fps int, faces int, last_seen timestamptz, created_at timestamptz default now(), info jsonb);
-- cihazdakı istifadəçilər (PIN = office_employees.id) və şablonların ehtiyat nüsxəsi (blokdan çıxanda geri yüklənir)
create table if not exists public.bio_users(employee_id bigint primary key, pin text unique not null, name text, card text,
 templates jsonb default '[]'::jsonb, blocked boolean default false, block_reason text, blocked_by uuid, blocked_at timestamptz,
 on_device boolean default false, updated_at timestamptz default now());
-- cihaza göndəriləcək əmrlər
create table if not exists public.bio_cmds(id bigserial primary key, sn text, cmd text not null, status text default 'new' check (status in ('new','sent','ok','err')),
 result text, created_by uuid, created_at timestamptz default now(), sent_at timestamptz, done_at timestamptz);
-- barmaq basmaları
create table if not exists public.bio_logs(id bigserial primary key, sn text, pin text, employee_id bigint, at timestamptz, verify int, raw text,
 result text, payroll_id bigint, amount numeric, created_at timestamptz default now());
create index if not exists bio_logs_created on public.bio_logs(created_at desc);
create index if not exists bio_cmds_sn on public.bio_cmds(sn, status);

alter table public.office_pay_base enable row level security;
alter table public.office_pay_period enable row level security;
alter table public.office_payroll enable row level security;
alter table public.bio_devices enable row level security;
alter table public.bio_users enable row level security;
alter table public.bio_cmds enable row level security;
alter table public.bio_logs enable row level security;
revoke all on public.office_pay_base, public.office_pay_period, public.office_payroll, public.bio_devices, public.bio_users, public.bio_cmds, public.bio_logs from anon;
grant select,insert,update,delete on public.office_pay_base, public.office_pay_period, public.office_payroll, public.bio_devices to authenticated;
grant select on public.bio_users, public.bio_cmds, public.bio_logs to authenticated;
grant usage on all sequences in schema public to authenticated;
create policy "pay base" on public.office_pay_base for all using (office_pay_ok()) with check (office_pay_ok());
create policy "pay period" on public.office_pay_period for all using (office_pay_ok()) with check (office_pay_ok());
create policy "payroll" on public.office_payroll for all using (office_pay_ok()) with check (office_pay_ok());
create policy "bio dev" on public.bio_devices for all using (office_pay_ok()) with check (office_pay_ok());
create policy "bio users read" on public.bio_users for select using (office_pay_ok());
create policy "bio cmds read" on public.bio_cmds for select using (office_pay_ok());
create policy "bio logs read" on public.bio_logs for select using (office_pay_ok());
-- işçi öz maaş qeydini görsün (yalnız oxu)
create policy "payroll mine" on public.office_payroll for select using (employee_id = office_me());

-- ayın siyahısını sabit maaşlardan yarat (mövcudlara toxunmur)
create or replace function public.pay_make(p_period text) returns int language plpgsql security definer set search_path=public as $$
declare n int; begin
 if not office_pay_ok() then raise exception 'icazə yoxdur'; end if;
 if p_period !~ '^\d{4}-\d{2}$' then raise exception 'dövr formatı YYYY-MM'; end if;
 insert into office_pay_period(period) values(p_period) on conflict do nothing;
 insert into office_payroll(period,employee_id,amount)
  select p_period, e.id, coalesce(b.amount,0) from office_employees e left join office_pay_base b on b.employee_id=e.id
  where e.active and not coalesce(e.demo,false) on conflict (period,employee_id) do nothing;
 get diagnostics n = row_count; return n; end $$;

-- cihaza əmr növbəsi (bütün icazəli cihazlara)
create or replace function public._bio_cmd(p_cmd text) returns void language sql security definer set search_path=public as $$
 insert into bio_cmds(sn,cmd,created_by) select sn,p_cmd,auth.uid() from bio_devices where allowed $$;

-- işçini cihaza yaz / yenilə (ad + varsa şablonlar)
create or replace function public.bio_push_user(p_emp bigint) returns void language plpgsql security definer set search_path=public as $$
declare e record; u bio_users; t jsonb; nm text; begin
 if not office_pay_ok() then raise exception 'icazə yoxdur'; end if;
 select id, full_name into e from office_employees where id=p_emp; if e.id is null then raise exception 'işçi tapılmadı'; end if;
 nm := translate(e.full_name,'əƏüÜöÖğĞıİşŞçÇ','eEuUoOgGiISsCc');
 insert into bio_users(employee_id,pin,name) values(e.id,e.id::text,nm) on conflict(employee_id) do update set name=excluded.name, updated_at=now() returning * into u;
 if u.blocked then return; end if;
 perform _bio_cmd('DATA UPDATE USERINFO PIN='||u.pin||E'\tName='||nm||E'\tPri=0\tPasswd=\tCard='||coalesce(u.card,'')||E'\tGrp=1\tTZ=0000000100000000\tVerify=0');
 for t in select * from jsonb_array_elements(coalesce(u.templates,'[]')) loop perform _bio_cmd(t->>'cmd'); end loop;
 update bio_users set on_device=true where employee_id=p_emp;
end $$;

-- bütün aktiv işçiləri cihaza ötür
create or replace function public.bio_sync_all() returns int language plpgsql security definer set search_path=public as $$
declare e record; n int:=0; begin if not office_pay_ok() then raise exception 'icazə yoxdur'; end if;
 for e in select id from office_employees where active and not coalesce(demo,false) loop perform bio_push_user(e.id); n:=n+1; end loop; return n; end $$;

-- barmaq izi qeydiyyatını cihazda başlat
create or replace function public.bio_enroll(p_emp bigint, p_finger int default 0) returns void language plpgsql security definer set search_path=public as $$
begin if not office_pay_ok() then raise exception 'icazə yoxdur'; end if;
 perform bio_push_user(p_emp);
 perform _bio_cmd('ENROLL_FP PIN='||p_emp||E'\tFID='||p_finger||E'\tRETRY=3\tOVERWRITE=1'); end $$;

-- blokla / bloku aç
create or replace function public.bio_block(p_emp bigint, p_block boolean, p_reason text default null) returns void language plpgsql security definer set search_path=public as $$
begin if not office_pay_ok() then raise exception 'icazə yoxdur'; end if;
 if p_block then
  insert into bio_users(employee_id,pin,name) select id,id::text,full_name from office_employees where id=p_emp on conflict(employee_id) do nothing;
  update bio_users set blocked=true, block_reason=nullif(trim(coalesce(p_reason,'')),''), blocked_by=auth.uid(), blocked_at=now(), on_device=false, updated_at=now() where employee_id=p_emp;
  perform _bio_cmd('DATA DELETE USERINFO PIN='||p_emp);
  update office_payroll set status='bloklu', block_reason=nullif(trim(coalesce(p_reason,'')),''), blocked_by=auth.uid(), blocked_at=now(), updated_at=now() where employee_id=p_emp and status='gozleyir';
 else
  update bio_users set blocked=false, block_reason=null, blocked_by=null, blocked_at=null, updated_at=now() where employee_id=p_emp;
  update office_payroll set status='gozleyir', block_reason=null, blocked_by=null, blocked_at=null, updated_at=now() where employee_id=p_emp and status='bloklu';
  perform bio_push_user(p_emp);
 end if; end $$;

-- yalnız bir ayın maaşını blokla (barmaq izinə toxunmadan)
create or replace function public.pay_block(p_id bigint, p_block boolean, p_reason text default null) returns void language plpgsql security definer set search_path=public as $$
begin if not office_pay_ok() then raise exception 'icazə yoxdur'; end if;
 update office_payroll set status=case when p_block then 'bloklu' else 'gozleyir' end, block_reason=case when p_block then nullif(trim(coalesce(p_reason,'')),'') end,
  blocked_by=case when p_block then auth.uid() end, blocked_at=case when p_block then now() end, updated_at=now() where id=p_id and status<>'verildi'; end $$;

-- kassir əllə verdi (barmaq izi işləməyəndə)
create or replace function public.pay_manual(p_id bigint, p_note text) returns void language plpgsql security definer set search_path=public as $$
begin if not office_pay_ok() then raise exception 'icazə yoxdur'; end if;
 if coalesce(trim(p_note),'')='' then raise exception 'səbəb yazın'; end if;
 update office_payroll set status='verildi', paid_at=now(), paid_via='əllə', paid_by=auth.uid(), note=p_note, updated_at=now() where id=p_id and status='gozleyir';
 if not found then raise exception 'bu qeyd verilə bilməz (artıq verilib və ya bloklanıb)'; end if; end $$;

-- son basmalar (kassir ekranı)
create or replace function public.pay_scans(p_limit int default 15) returns jsonb language sql stable security definer set search_path=public as $$
 select case when office_pay_ok() then coalesce(jsonb_agg(x order by x.id desc),'[]') end from (
  select l.id, l.created_at, l.at, l.result, l.amount, l.pin, coalesce(e.full_name,'PIN '||l.pin) name, p.period
  from bio_logs l left join office_employees e on e.id=l.employee_id left join office_payroll p on p.id=l.payroll_id
  order by l.id desc limit p_limit) x $$;

grant execute on function public.pay_make(text), public.bio_push_user(bigint), public.bio_sync_all(), public.bio_enroll(bigint,int), public.bio_block(bigint,boolean,text),
 public.pay_block(bigint,boolean,text), public.pay_manual(bigint,text), public.pay_scans(int), public.office_pay_ok() to authenticated;
revoke execute on function public._bio_cmd(text) from public, anon, authenticated;
