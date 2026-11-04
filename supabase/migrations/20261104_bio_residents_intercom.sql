-- Damafon sakinləri: eyni ZKTeco terminalında sakinlər (brelok / barmaq / üz) qapı üçün.
-- Sakin basmaları maaş jurnalına (bio_logs) DÜŞMÜR — ayrıca bio_door_logs-a yazılır.

create table if not exists public.bio_residents(
  id bigserial primary key,
  pin text not null unique,
  full_name text not null,
  phone text,
  unit_id bigint references public.km_units(id) on delete set null,
  unit_label text,
  card text,
  templates jsonb not null default '[]',
  active boolean not null default true,
  note text,
  created_by uuid default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table if not exists public.bio_door_logs(
  id bigserial primary key,
  sn text, pin text, resident_id bigint references public.bio_residents(id) on delete set null,
  at timestamptz, verify int, raw text, result text,
  created_at timestamptz default now(),
  unique(sn,pin,at)
);
create index if not exists bio_door_logs_res on public.bio_door_logs(resident_id, id desc);
alter table public.bio_residents enable row level security;
alter table public.bio_door_logs enable row level security;
-- birbaşa oxu yoxdur — yalnız RPC (şablonlar brauzerə verilmir)

-- icazə: maaş/HR/sahibkar + komendant heyəti
create or replace function public.bio_res_ok() returns boolean language sql stable security definer set search_path=public as
$$ select office_pay_ok() or coalesce(km_staff(),false) $$;

create or replace function public._bio_ascii(t text) returns text language sql immutable as
$$ select left(translate(coalesce(t,''),'əƏüÜöÖğĞıİşŞçÇ'||chr(9)||chr(10),'eEuUoOgGiISsCc  '),24) $$;

create or replace function public._bio_res_push(p_id bigint) returns void language plpgsql security definer set search_path=public as $$
declare r bio_residents; t jsonb; begin
 select * into r from bio_residents where id=p_id; if r.id is null or not r.active then return; end if;
 perform _bio_cmd('DATA UPDATE USERINFO PIN='||r.pin||E'\tName='||_bio_ascii(r.full_name)||E'\tPri=0\tPasswd=\tCard='||coalesce(r.card,'')||E'\tGrp=1\tTZ=0000000100000000\tVerify=0');
 for t in select * from jsonb_array_elements(coalesce(r.templates,'[]')) loop perform _bio_cmd(t->>'cmd'); end loop;
end $$;

-- əlavə et / düzəlt. p: {id?, full_name, phone, unit_id, unit_label, card, note}
create or replace function public.bio_res_save(p jsonb) returns bigint language plpgsql security definer set search_path=public as $$
declare rid bigint := nullif(p->>'id','')::bigint; old bio_residents; nm text := trim(coalesce(p->>'full_name','')); cd text := nullif(regexp_replace(coalesce(p->>'card',''),'\D','','g'),''); begin
 if not bio_res_ok() then raise exception 'icazə yoxdur'; end if;
 if nm='' then raise exception 'ad yazılmayıb'; end if;
 if cd is not null and exists(select 1 from bio_residents where card=cd and id is distinct from rid) then raise exception 'bu brelok artıq başqa sakinə yazılıb'; end if;
 if cd is not null and exists(select 1 from bio_users where card=cd) then raise exception 'bu brelok işçiyə yazılıb'; end if;
 if rid is null then
  insert into bio_residents(pin,full_name,phone,unit_id,unit_label,card,note)
   values('tmp-'||gen_random_uuid(),nm,nullif(trim(p->>'phone'),''),nullif(p->>'unit_id','')::bigint,nullif(trim(p->>'unit_label'),''),cd,nullif(trim(p->>'note'),''))
   returning id into rid;
  update bio_residents set pin=(100000+rid)::text where id=rid;
 else
  select * into old from bio_residents where id=rid; if old.id is null then raise exception 'sakin tapılmadı'; end if;
  update bio_residents set full_name=nm, phone=nullif(trim(p->>'phone'),''), unit_id=nullif(p->>'unit_id','')::bigint, unit_label=nullif(trim(p->>'unit_label'),''),
   card=cd, note=nullif(trim(p->>'note'),''), updated_at=now() where id=rid;
 end if;
 perform _bio_res_push(rid);
 return rid; end $$;

-- aktiv/passiv (passiv → cihazdan silinir, qapı açılmır)
create or replace function public.bio_res_active(p_id bigint, p_on boolean) returns void language plpgsql security definer set search_path=public as $$
declare r bio_residents; begin if not bio_res_ok() then raise exception 'icazə yoxdur'; end if;
 update bio_residents set active=p_on, updated_at=now() where id=p_id returning * into r; if r.id is null then raise exception 'sakin tapılmadı'; end if;
 if p_on then perform _bio_res_push(p_id); else perform _bio_cmd('DATA DELETE USERINFO PIN='||r.pin); end if; end $$;

create or replace function public.bio_res_delete(p_id bigint) returns void language plpgsql security definer set search_path=public as $$
declare r bio_residents; begin if not bio_res_ok() then raise exception 'icazə yoxdur'; end if;
 delete from bio_residents where id=p_id returning * into r; if r.id is null then return; end if;
 perform _bio_cmd('DATA DELETE USERINFO PIN='||r.pin); end $$;

-- cihaza yenidən göndər (barmaq/üz yazmaq üçün)
create or replace function public.bio_res_push(p_id bigint) returns text language plpgsql security definer set search_path=public as $$
declare r bio_residents; begin if not bio_res_ok() then raise exception 'icazə yoxdur'; end if;
 select * into r from bio_residents where id=p_id; if r.id is null then raise exception 'sakin tapılmadı'; end if;
 if not r.active then raise exception 'sakin passivdir'; end if;
 perform _bio_res_push(p_id); return r.pin; end $$;

create or replace function public.bio_res_list() returns jsonb language sql stable security definer set search_path=public as $$
 select case when bio_res_ok() then coalesce(jsonb_agg(x order by x.full_name),'[]') end from (
  select r.id, r.pin, r.full_name, r.phone, r.unit_id, coalesce(r.unit_label, u.number) unit_label, u.bina, r.card, r.active, r.note,
   jsonb_array_length(coalesce(r.templates,'[]')) n,
   (select max(l.at) from bio_door_logs l where l.resident_id=r.id) last_at
  from bio_residents r left join km_units u on u.id=r.unit_id) x $$;

create or replace function public.bio_door_list(p_limit int default 50) returns jsonb language sql stable security definer set search_path=public as $$
 select case when bio_res_ok() then coalesce(jsonb_agg(x order by x.id desc),'[]') end from (
  select l.id, l.at, l.sn, l.pin, l.verify, l.result, coalesce(r.full_name,'PIN '||l.pin) name, coalesce(r.unit_label,u.number) unit_label
  from bio_door_logs l left join bio_residents r on r.id=l.resident_id left join km_units u on u.id=r.unit_id
  order by l.id desc limit least(p_limit,300)) x $$;

-- mənzil axtarışı (LUX km_units) — sakin formu üçün
create or replace function public.bio_unit_find(q text) returns jsonb language sql stable security definer set search_path=public as $$
 select case when bio_res_ok() then coalesce(jsonb_agg(x),'[]') end from (
  select id, bina, number, kind, nullif(coalesce(nullif(tenant_name,''),owner_name),'') who from km_units
  where not coalesce(demo,false) and (number ilike '%'||trim(q)||'%' or ('B'||bina||' '||number) ilike '%'||trim(q)||'%' or owner_name ilike '%'||trim(q)||'%' or tenant_name ilike '%'||trim(q)||'%')
  order by bina, floor, pos limit 15) x $$;

-- basma: sakin PIN-i → qapı jurnalı, maaş jurnalına yox
create or replace function public.bio_scan(p_sn text, p_pin text, p_at timestamp with time zone, p_verify integer, p_raw text)
 returns text language plpgsql security definer set search_path to 'public' as $function$
declare emp bigint; u bio_users; r office_payroll; res text; lid bigint; nm text; rs bio_residents; begin
 select * into rs from bio_residents where pin=p_pin;
 if rs.id is not null and not exists(select 1 from bio_users where pin=p_pin) then
  insert into bio_door_logs(sn,pin,resident_id,at,verify,raw,result) values(p_sn,p_pin,rs.id,p_at,p_verify,left(p_raw,500),case when rs.active then 'giriş' else 'passiv' end)
   on conflict (sn,pin,at) do nothing;
  return 'sakin';
 end if;
 insert into bio_logs(sn,pin,at,verify,raw) values(p_sn,p_pin,p_at,p_verify,left(p_raw,500)) on conflict (sn,pin,at) do nothing returning id into lid;
 if lid is null then return 'dublikat'; end if;
 select employee_id into emp from bio_users where pin=p_pin;
 if emp is null then emp := case when p_pin ~ '^\d+$' and length(p_pin)<10 then p_pin::bigint end; end if;
 if emp is null or not exists(select 1 from office_employees where id=emp) then update bio_logs set result='tanınmır' where id=lid; return 'tanınmır'; end if;
 update bio_logs set employee_id=emp where id=lid;
 select * into u from bio_users where employee_id=emp;
 if coalesce(u.blocked,false) then update bio_logs set result='bloklu' where id=lid; return 'bloklu'; end if;
 select p.* into r from office_payroll p join office_pay_period d on d.period=p.period and d.open
  where p.employee_id=emp and p.status in ('gozleyir','bloklu') order by p.period limit 1;
 if r.id is not null and r.status='bloklu' then update bio_logs set result='bloklu', payroll_id=r.id, amount=r.amount where id=lid; return 'bloklu'; end if;
 if r.id is not null then
  update office_payroll set status='verildi', paid_at=coalesce(p_at,now()), paid_via='barmaq izi', scan_id=lid, updated_at=now() where id=r.id;
  update bio_logs set result='verildi', payroll_id=r.id, amount=r.amount where id=lid;
  begin
   perform _office_push((select user_id from office_employees where id=emp), '💰 Maaşınızı aldınız', to_char(r.amount,'FM999G999G990D00')||' ₼ · '||r.period||' · '||to_char(coalesce(p_at,now()) at time zone 'Asia/Baku','DD.MM HH24:MI'), 'pay-'||r.id, 'https://ofis.pilothayat.az/', true);
  exception when others then null; end;
  return 'verildi';
 end if;
 select p.* into r from office_payroll p join office_pay_period d on d.period=p.period and d.open where p.employee_id=emp and p.status='verildi' order by p.paid_at desc limit 1;
 if r.id is not null then update bio_logs set result='artıq alıb', payroll_id=r.id, amount=r.amount where id=lid; return 'artıq alıb'; end if;
 update bio_logs set result='siyahıda yoxdur' where id=lid; return 'siyahıda yoxdur';
end $function$;

-- şablon: sakin PIN-i → bio_residents.templates
create or replace function public.bio_template(p_pin text, p_key text, p_cmd text) returns void language plpgsql security definer set search_path to 'public' as $function$
declare emp bigint; begin
 if exists(select 1 from bio_residents where pin=p_pin) and not exists(select 1 from bio_users where pin=p_pin) then
  update bio_residents set templates = coalesce((select jsonb_agg(x) from jsonb_array_elements(templates) x where x->>'k'<>p_key),'[]'::jsonb) || jsonb_build_array(jsonb_build_object('k',p_key,'cmd',p_cmd)), updated_at=now()
   where pin=p_pin;
  return;
 end if;
 emp := case when p_pin ~ '^\d+$' and length(p_pin)<10 then p_pin::bigint end; if emp is null then return; end if;
 insert into bio_users(employee_id,pin,name,on_device) select id,id::text,full_name,true from office_employees where id=emp on conflict(employee_id) do nothing;
 update bio_users set templates = coalesce((select jsonb_agg(x) from jsonb_array_elements(templates) x where x->>'k'<>p_key),'[]'::jsonb) || jsonb_build_array(jsonb_build_object('k',p_key,'cmd',p_cmd)), on_device=true, updated_at=now()
  where employee_id=emp;
end $function$;

-- cihazdan gələn istifadəçi (brelok cihazda oxudulanda nömrə bura gəlir)
create or replace function public.bio_dev_user_save(p_sn text, p_pin text, p_name text, p_card text, p_pri text, p_raw text) returns void language plpgsql security definer set search_path to 'public' as $function$
begin
 insert into bio_dev_users(sn,pin,name,card,pri,raw,updated_at) values(p_sn,p_pin,p_name,nullif(p_card,''),p_pri,left(p_raw,500),now())
 on conflict(sn,pin) do update set name=excluded.name, card=coalesce(excluded.card,bio_dev_users.card), pri=excluded.pri, raw=excluded.raw, updated_at=now();
 if coalesce(p_card,'')<>'' and p_card<>'0' then
  update bio_users set card=p_card, updated_at=now() where pin=p_pin;
  update bio_residents set card=p_card, updated_at=now() where pin=p_pin and card is distinct from p_card;
 end if;
end $function$;

grant execute on function public.bio_res_save(jsonb), public.bio_res_active(bigint,boolean), public.bio_res_delete(bigint), public.bio_res_push(bigint),
 public.bio_res_list(), public.bio_door_list(int), public.bio_unit_find(text), public.bio_res_ok() to authenticated;
revoke execute on function public._bio_res_push(bigint) from public, anon, authenticated;
revoke execute on function public.bio_scan(text,text,timestamptz,integer,text), public.bio_template(text,text,text), public.bio_dev_user_save(text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.bio_scan(text,text,timestamptz,integer,text), public.bio_template(text,text,text), public.bio_dev_user_save(text,text,text,text,text,text) to service_role;

-- mövcud test sakini (cihazda PIN 1001, brelok 11259893) → sakinlər siyahısına; köhnə basmaları qapı jurnalına da köçür
insert into bio_residents(pin,full_name,card,note) values('1001','Sakin Test','11259893','cihazda əl ilə yaradılmış test') on conflict(pin) do nothing;
insert into bio_door_logs(sn,pin,resident_id,at,verify,raw,result)
 select l.sn,l.pin,r.id,l.at,l.verify,l.raw,'giriş' from bio_logs l join bio_residents r on r.pin=l.pin where l.employee_id is null on conflict do nothing;
-- kassir ekranı: sakin PIN-ləri göstərilmir (köhnə qeydlər bazada qalır)
create or replace function public.pay_scans(p_limit int default 15) returns jsonb language sql stable security definer set search_path=public as $$
 select case when office_pay_ok() then coalesce(jsonb_agg(x order by x.id desc),'[]') end from (
  select l.id, l.created_at, l.at, l.result, l.amount, l.pin, coalesce(e.full_name,'PIN '||l.pin) name, p.period
  from bio_logs l left join office_employees e on e.id=l.employee_id left join office_payroll p on p.id=l.payroll_id
  where l.employee_id is not null or not exists(select 1 from bio_residents r where r.pin=l.pin)
  order by l.id desc limit p_limit) x $$;
