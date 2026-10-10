-- Baş Ofis: çoxlu iş yeri (LUX Satış ofisi, LUX Köçürmə ofisi) — hər birinin öz QR-ı və konumu
-- Baş Ofis office_config ilə olduğu kimi qalır (location_id = NULL).

create table if not exists public.office_locations(
  id bigserial primary key,
  name text not null,
  lat double precision, lng double precision,
  radius_m int not null default 150,
  static_qr boolean not null default true,
  qr_secret text not null default encode(extensions.gen_random_bytes(24),'hex'),
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz default now());
alter table public.office_locations enable row level security;
revoke all on public.office_locations from anon, authenticated;
grant select (id,name,lat,lng,radius_m,static_qr,active,sort,created_at) on public.office_locations to authenticated;
grant insert (name,lat,lng,radius_m,static_qr,active,sort), update (name,lat,lng,radius_m,static_qr,active,sort), delete on public.office_locations to authenticated;
grant usage on sequence public.office_locations_id_seq to authenticated;
drop policy if exists loc_read on public.office_locations;
create policy loc_read on public.office_locations for select using (public.office_user_any() or public.office_is_mgr());
drop policy if exists loc_write on public.office_locations;
create policy loc_write on public.office_locations for all using (public.office_is_mgr()) with check (public.office_is_mgr());

alter table public.office_employees add column if not exists location_id bigint references public.office_locations(id) on delete set null;
alter table public.office_attendance add column if not exists location_id bigint references public.office_locations(id) on delete set null;

insert into public.office_locations(name,sort)
select v.n, v.s from (values ('LUX Satış ofisi',1),('LUX Köçürmə ofisi',2)) v(n,s)
where not exists (select 1 from public.office_locations);

create or replace function public.office_site_of(p_emp bigint)
returns table(loc_id bigint, name text, lat double precision, lng double precision, radius_m int)
language sql stable security definer set search_path to 'public' as $$
  select l.id, l.name, l.lat, l.lng, l.radius_m from office_employees e join office_locations l on l.id=e.location_id where e.id=p_emp
  union all
  select null::bigint, 'Baş Ofis', c.lat, c.lng, coalesce(c.radius_m,150) from office_config c
   where c.id=1 and not exists (select 1 from office_employees e join office_locations l on l.id=e.location_id where e.id=p_emp)
$$;

create or replace function public.office_geo_dist(p_lat double precision, p_lng double precision)
returns integer language sql stable security definer set search_path to 'public' as $$
  select case when s.lat is null or p_lat is null then null else round(6371000*2*asin(sqrt(power(sin(radians(p_lat-s.lat)/2),2)+cos(radians(s.lat))*cos(radians(p_lat))*power(sin(radians(p_lng-s.lng)/2),2))))::int end
  from public.office_site_of(public.office_me()) s limit 1 $$;

drop function if exists public.office_qr_token();
drop function if exists public.office_qr_static();
drop function if exists public.office_qr_rotate();
create or replace function public.office_qr_token(p_loc bigint default null) returns text
language plpgsql stable security definer set search_path to 'public','extensions' as $$
declare s text; begin
  if not public.office_is_mgr() then raise exception 'İcazə yoxdur'; end if;
  if p_loc is null then select qr_secret into s from public.office_config where id=1;
    return substr(encode(extensions.digest(s || ':' || floor(extract(epoch from now())/60)::text,'sha256'),'hex'),1,16); end if;
  select qr_secret into s from public.office_locations where id=p_loc; if s is null then raise exception 'İş yeri tapılmadı'; end if;
  return p_loc||'.'||substr(encode(extensions.digest(s || ':' || floor(extract(epoch from now())/60)::text,'sha256'),'hex'),1,16);
end $$;
create or replace function public.office_qr_static(p_loc bigint default null) returns text
language plpgsql stable security definer set search_path to 'public','extensions' as $$
declare s text; begin
  if not public.office_is_mgr() then raise exception 'İcazə yoxdur'; end if;
  if p_loc is null then select qr_secret into s from public.office_config where id=1; return public.office_static_token(s); end if;
  select qr_secret into s from public.office_locations where id=p_loc; if s is null then raise exception 'İş yeri tapılmadı'; end if;
  return p_loc||'.'||public.office_static_token(s);
end $$;
create or replace function public.office_qr_rotate(p_loc bigint default null) returns void
language plpgsql security definer set search_path to 'public','extensions' as $$
begin
  if not public.office_is_mgr() then raise exception 'İcazə yoxdur'; end if;
  if p_loc is null then update public.office_config set qr_secret=encode(extensions.gen_random_bytes(24),'hex'), updated_at=now() where id=1;
  else update public.office_locations set qr_secret=encode(extensions.gen_random_bytes(24),'hex') where id=p_loc; end if;
end $$;
grant execute on function public.office_qr_token(bigint), public.office_qr_static(bigint), public.office_qr_rotate(bigint), public.office_site_of(bigint) to authenticated;

create or replace function public.office_check(p_kind text, p_token text, p_lat double precision, p_lng double precision, p_at timestamp with time zone default null)
returns jsonb language plpgsql security definer set search_path to 'public','extensions','net' as $function$
declare
  me bigint := public.office_me(); cfg public.office_config; emp public.office_employees; loc public.office_locations;
  ok boolean := false; w bigint; dist int := null; tok text := p_token; loc_id bigint := null;
  secret text; is_static boolean; s_lat double precision; s_lng double precision; s_rad int; s_name text := 'Baş Ofis';
  ts timestamptz := now(); nowb timestamp; d date; rec public.office_attendance;
  late int := 0; early int := 0; hrs time[]; mins_in int; nm text; tm text; emp_site text;
begin
  if p_at is not null and abs(extract(epoch from (now()-p_at))) <= 300 then ts := p_at; end if;
  nowb := (ts at time zone 'Asia/Baku'); d := (ts at time zone 'Asia/Baku')::date;
  if me is null then raise exception 'Hesabınız işçi kartına bağlanmayıb. Rəhbərə müraciət edin.'; end if;
  select * into cfg from public.office_config where id=1;
  select * into emp from public.office_employees where id=me;
  hrs := public.office_day_hours(emp, d);

  if tok ~ '^[0-9]+\.[0-9a-f]{16}$' then
    loc_id := split_part(tok,'.',1)::bigint; tok := split_part(tok,'.',2);
    select * into loc from public.office_locations where id=loc_id and active;
    if loc.id is null then raise exception 'Bu QR-ın aid olduğu iş yeri aktiv deyil.'; end if;
    secret := loc.qr_secret; is_static := loc.static_qr; s_lat := loc.lat; s_lng := loc.lng; s_rad := loc.radius_m; s_name := loc.name;
    if s_lat is null then raise exception '% üçün konum hələ təyin edilməyib. Rəhbərə müraciət edin.', s_name; end if;
  else
    secret := cfg.qr_secret; is_static := cfg.static_qr; s_lat := cfg.lat; s_lng := cfg.lng; s_rad := coalesce(cfg.radius_m,150);
  end if;

  -- işçi yalnız öz iş yerində qeyd olunur (rəhbərlər istənilən yerdə)
  if coalesce(emp.location_id,0) <> coalesce(loc_id,0) and not public.office_is_mgr() then
    select coalesce((select name from public.office_locations where id=emp.location_id),'Baş Ofis') into emp_site;
    raise exception 'Bu QR % üçündür. Siz % iş yerinə bağlısınız — öz iş yerinizin QR-ını skan edin.', s_name, emp_site;
  end if;

  if is_static and tok = public.office_static_token(secret) then ok := true; end if;
  w := floor(extract(epoch from ts)/60);
  for i in 0..2 loop
    if tok = substr(encode(extensions.digest(secret || ':' || (w-i)::text,'sha256'),'hex'),1,16) then ok := true; end if;
  end loop;
  if not ok then
    w := floor(extract(epoch from now())/60);
    for i in 0..2 loop
      if tok = substr(encode(extensions.digest(secret || ':' || (w-i)::text,'sha256'),'hex'),1,16) then ok := true; end if;
    end loop;
  end if;
  if not ok then raise exception 'QR kod keçərsizdir. İş yerindəki QR-ı yenidən skan edin.'; end if;

  if s_lat is not null and p_lat is not null then
    dist := round(6371000*2*asin(sqrt(power(sin(radians(p_lat-s_lat)/2),2)+cos(radians(s_lat))*cos(radians(p_lat))*power(sin(radians(p_lng-s_lng)/2),2))));
  end if;
  if (cfg.require_geo or is_static or loc_id is not null) and s_lat is not null then
    if dist is null then raise exception 'Yer məlumatı alınmadı. Telefonda yer icazəsini aktiv edin.'; end if;
    if dist > s_rad then raise exception '% ərazisindən uzaqdasınız (% m). Qeyd yalnız iş yerində mümkündür.', s_name, dist; end if;
  end if;

  nm := emp.full_name; tm := to_char(nowb,'HH24:MI');
  select * into rec from public.office_attendance where employee_id=me and day=d;
  if p_kind='in' then
    if rec.check_in is not null then return jsonb_build_object('ok',true,'msg','Gəliş artıq qeyd olunub','time',rec.check_in); end if;
    late := greatest(0, floor(extract(epoch from (nowb - (d + hrs[1])))/60)::int);
    if late <= cfg.grace_min then late := 0; end if;
    insert into public.office_attendance(employee_id,day,check_in,in_dist,late_min,source,location_id)
      values (me,d,ts,dist,late,case when is_static then 'qr-static' else 'qr' end,loc_id)
      on conflict (employee_id,day) do update set check_in=excluded.check_in, in_dist=excluded.in_dist, late_min=excluded.late_min, location_id=excluded.location_id;
    begin perform public.tg_notify('🟢 <b>'||nm||'</b> gəldi · '||tm||' · '||s_name||case when late>0 then ' · <i>'||late||' dəq gecikmə</i>' else ' · vaxtında' end); exception when others then null; end;
    return jsonb_build_object('ok',true,'msg',case when late>0 then 'Gəliş qeyd olundu · '||late||' dəq gecikmə' else 'Gəliş qeyd olundu' end,'late',late,'site',s_name);
  else
    if rec.check_in is null then raise exception 'Əvvəlcə gəlişi qeyd edin.'; end if;
    if rec.check_out is not null then return jsonb_build_object('ok',true,'msg','Çıxış artıq qeyd olunub','time',rec.check_out); end if;
    mins_in := floor(extract(epoch from (ts - rec.check_in))/60)::int;
    if mins_in < 10 then raise exception 'Gəlişdən çox az vaxt keçib (% dəq). Çıxış üçün ən azı 10 dəqiqə sonra skan edin.', mins_in; end if;
    early := greatest(0, floor(extract(epoch from ((d + hrs[2]) - nowb))/60)::int);
    update public.office_attendance set check_out=ts, out_dist=dist, early_min=early,
      worked_min=greatest(0,floor(extract(epoch from (ts-check_in))/60)::int) where id=rec.id;
    begin perform public.tg_notify('🔴 <b>'||nm||'</b> getdi · '||tm||' · '||s_name||' · <i>'||(mins_in/60)||' saat '||(mins_in%60)||' dəq işlədi</i>'||case when early>0 then ' · '||early||' dəq tez' else '' end); exception when others then null; end;
    return jsonb_build_object('ok',true,'msg',case when early>0 then 'Çıxış qeyd olundu · '||early||' dəq tez' else 'Çıxış qeyd olundu' end,'early',early,'site',s_name);
  end if;
end $function$;

create or replace function public.office_outing_end(p_lat double precision, p_lng double precision, p_end_day boolean default false)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare me bigint := public.office_me(); d date := (now() at time zone 'Asia/Baku')::date; o office_outings; cfg office_config; dist int; mins int; pers int; st record;
begin
  select * into o from office_outings where employee_id=me and day=d and back_at is null order by id desc limit 1;
  if o.id is null then raise exception 'Açıq çıxış yoxdur.'; end if;
  select * into cfg from office_config where id=1; dist := public.office_geo_dist(p_lat,p_lng);
  select * into st from public.office_site_of(me) limit 1;
  if p_end_day then
    if o.kind <> 'is' then raise exception 'Şəxsi çıxışda günü bitirmək olmaz — iş yerinə qayıdıb çıxışı qeyd edin.'; end if;
    update office_outings set back_at=now(), back_dist=dist, back_lat=p_lat, back_lng=p_lng, ended_day=true where id=o.id;
    select coalesce(sum(extract(epoch from (coalesce(back_at,now())-out_at))/60),0)::int into pers from office_outings where employee_id=me and day=d and kind='sexsi';
    update office_attendance set check_out=now(), out_dist=dist, source='outing',
      worked_min=greatest(0,floor(extract(epoch from (now()-check_in))/60)::int - pers) where employee_id=me and day=d;
    return jsonb_build_object('ok',true,'msg','İş günü işlə bağlı çıxışda bitirildi');
  end if;
  if (cfg.require_geo or cfg.static_qr or st.loc_id is not null) and st.lat is not null then
    if dist is null then raise exception 'Yer məlumatı alınmadı. Telefonda yer icazəsini aktiv edin.'; end if;
    if dist > st.radius_m then raise exception 'Hələ iş yerində (%) deyilsiniz (% m). Qayıdış yalnız iş yerində qeyd olunur.', st.name, dist; end if;
  end if;
  update office_outings set back_at=now(), back_dist=dist, back_lat=p_lat, back_lng=p_lng where id=o.id;
  mins := greatest(0,floor(extract(epoch from (now()-o.out_at))/60)::int);
  return jsonb_build_object('ok',true,'msg','Qayıdış qeyd olundu · '||mins||' dəq çöldə');
end $function$;
