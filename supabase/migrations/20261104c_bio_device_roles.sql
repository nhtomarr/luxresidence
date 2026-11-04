-- Cihaz rolları (bio_devices.info->>'role'): maas (maaş verilişi) / damafon (sakinlər + gələcəkdə işçi gəliş-gediş) / hamisi (test)
update public.bio_devices set info=coalesce(info,'{}'::jsonb)||'{"role":"hamisi"}' where sn='NYU7261304234';

-- işçilər (barmaq) → bütün cihazlara (_bio_cmd dəyişmir); sakinlər (brelok) → yalnız damafon cihazlarına
create or replace function public._bio_cmd_res(p_cmd text) returns void language sql security definer set search_path=public as $$
 insert into bio_cmds(sn,cmd,created_by) select sn,p_cmd,auth.uid() from bio_devices where allowed and coalesce(info->>'role','maas') in ('damafon','hamisi') $$;
revoke execute on function public._bio_cmd_res(text) from public, anon, authenticated;

create or replace function public._bio_res_push(p_id bigint) returns void language plpgsql security definer set search_path=public as $$
declare r bio_residents; t jsonb; begin
 select * into r from bio_residents where id=p_id; if r.id is null or not r.active then return; end if;
 perform _bio_cmd_res('DATA UPDATE USERINFO PIN='||r.pin||E'\tName='||_bio_ascii(r.full_name)||E'\tPri=0\tPasswd=\tCard='||coalesce(r.card,'')||E'\tGrp=1\tTZ=0000000100000000\tVerify=0');
 for t in select * from jsonb_array_elements(coalesce(r.templates,'[]')) loop perform _bio_cmd_res(t->>'cmd'); end loop;
end $$;
create or replace function public.bio_res_active(p_id bigint, p_on boolean) returns void language plpgsql security definer set search_path=public as $$
declare r bio_residents; begin if not bio_res_ok() then raise exception 'icazə yoxdur'; end if;
 update bio_residents set active=p_on, updated_at=now() where id=p_id returning * into r; if r.id is null then raise exception 'sakin tapılmadı'; end if;
 if p_on then perform _bio_res_push(p_id); else perform _bio_cmd_res('DATA DELETE USERINFO PIN='||r.pin); end if; end $$;
create or replace function public.bio_res_delete(p_id bigint) returns void language plpgsql security definer set search_path=public as $$
declare r bio_residents; begin if not bio_res_ok() then raise exception 'icazə yoxdur'; end if;
 delete from bio_residents where id=p_id returning * into r; if r.id is null then return; end if;
 perform _bio_cmd_res('DATA DELETE USERINFO PIN='||r.pin); end $$;

-- uzaqdan qeydiyyat: p_kind 'card' (brelok, ENROLL_MF) | 'fp' (barmaq, ENROLL_BIO TYPE=1). Yalnız son 5 dəq onlayn damafon cihazlarına.
create or replace function public.bio_res_learn(p_id bigint, p_kind text default 'card') returns jsonb language plpgsql security definer set search_path=public as $$
declare r bio_residents; res jsonb; c text; begin if not bio_res_ok() then raise exception 'icazə yoxdur'; end if;
 select * into r from bio_residents where id=p_id; if r.id is null then raise exception 'sakin tapılmadı'; end if;
 if not r.active then raise exception 'sakin passivdir'; end if;
 perform _bio_res_push(p_id);
 c := case when p_kind='fp' then 'ENROLL_BIO TYPE=1'||E'\tPIN='||r.pin||E'\tCardNo='||coalesce(r.card,'')||E'\tRETRY=3\tOVERWRITE=1'
           else 'ENROLL_MF PIN='||r.pin||E'\tRETRY=3' end;
 with ins as (insert into bio_cmds(sn,cmd,created_by)
   select sn, c, auth.uid() from bio_devices where allowed and coalesce(info->>'role','maas') in ('damafon','hamisi') and last_seen > now()-interval '5 minutes' returning id, sn)
 select coalesce(jsonb_agg(jsonb_build_object('id',ins.id,'sn',ins.sn,'name',coalesce(d.name,d.model,ins.sn))),'[]') into res from ins join bio_devices d on d.sn=ins.sn;
 if res='[]'::jsonb then raise exception 'onlayn damafon cihazı yoxdur — cihazın internetini yoxlayın'; end if;
 return res; end $$;
create or replace function public.bio_res_state(p_id bigint) returns jsonb language sql stable security definer set search_path=public as $$
 select case when bio_res_ok() then (select jsonb_build_object('card',card,'n',jsonb_array_length(coalesce(templates,'[]'))) from bio_residents where id=p_id) end $$;
grant execute on function public.bio_res_learn(bigint,text), public.bio_res_state(bigint) to authenticated;

-- mənzil seçəndə sakin məlumatı avtomatik
create or replace function public.bio_unit_find(q text) returns jsonb language sql stable security definer set search_path=public as $$
 select case when bio_res_ok() then coalesce(jsonb_agg(x),'[]') end from (
  select id, bina, number, kind, nullif(owner_name,'') owner_name, nullif(owner_phone,'') owner_phone, nullif(tenant_name,'') tenant_name, nullif(tenant_phone,'') tenant_phone,
   coalesce(household,'[]'::jsonb) household,
   (select jsonb_agg(jsonb_build_object('full_name',full_name,'phone',phone,'role',role)) from km_residents k where k.unit_id=u.id) residents
  from km_units u
  where not coalesce(demo,false) and (number ilike '%'||trim(q)||'%' or ('B'||bina||' '||number) ilike '%'||trim(q)||'%' or owner_name ilike '%'||trim(q)||'%' or tenant_name ilike '%'||trim(q)||'%' or owner_phone ilike '%'||trim(q)||'%')
  order by bina, floor, pos limit 15) x $$;
grant execute on function public.bio_unit_find(text) to authenticated;

-- cihaz rolu (Baş Ofis → Barmaq izi cihazı)
create or replace function public.bio_dev_role(p_sn text, p_role text) returns void language plpgsql security definer set search_path=public as $$
begin if not office_pay_ok() then raise exception 'icazə yoxdur'; end if;
 if p_role not in ('maas','damafon','hamisi') then raise exception 'yanlış rol'; end if;
 update bio_devices set info=coalesce(info,'{}'::jsonb)||jsonb_build_object('role',p_role) where sn=p_sn; end $$;
grant execute on function public.bio_dev_role(text,text) to authenticated;


-- Cihaz 2-də işçi barmağı → davamiyyət (ilk basma gəliş, ≥10 dəq sonrakı basma çıxış; son basma qalır)
create or replace function public._bio_att(p_emp bigint, p_at timestamptz, p_sn text) returns text language plpgsql security definer set search_path=public as $$
declare cfg office_config; emp office_employees; rec office_attendance; d date; nowb timestamp; hrs time[]; late int:=0; early int:=0; ts timestamptz:=coalesce(p_at,now()); loc bigint; tm text; begin
 select * into emp from office_employees where id=p_emp; if emp.id is null then return 'tanınmır'; end if;
 select * into cfg from office_config where id=1;
 nowb := ts at time zone 'Asia/Baku'; d := nowb::date; tm := to_char(nowb,'HH24:MI');
 hrs := office_day_hours(emp, d);
 select nullif(info->>'location_id','')::bigint into loc from bio_devices where sn=p_sn;
 select * into rec from office_attendance where employee_id=p_emp and day=d;
 if rec.check_in is null then
  late := greatest(0, floor(extract(epoch from (nowb - (d + hrs[1])))/60)::int); if late <= coalesce(cfg.grace_min,0) then late := 0; end if;
  insert into office_attendance(employee_id,day,check_in,late_min,source,location_id) values(p_emp,d,ts,late,'barmaq',coalesce(loc,emp.location_id))
   on conflict (employee_id,day) do update set check_in=excluded.check_in, late_min=excluded.late_min, source='barmaq';
  begin perform tg_notify('🟢 <b>'||emp.full_name||'</b> gəldi · '||tm||' · barmaq izi'||case when late>0 then ' · <i>'||late||' dəq gecikmə</i>' else ' · vaxtında' end); exception when others then null; end;
  return 'gəliş';
 end if;
 if ts - rec.check_in < interval '10 minutes' then return 'təkrar'; end if;
 early := greatest(0, floor(extract(epoch from ((d + hrs[2]) - nowb))/60)::int);
 update office_attendance set check_out=ts, early_min=early, worked_min=greatest(0,floor(extract(epoch from (ts-check_in))/60)::int) where id=rec.id;
 begin perform tg_notify('🔴 <b>'||emp.full_name||'</b> getdi · '||tm||' · barmaq izi'||case when early>0 then ' · '||early||' dəq tez' else '' end); exception when others then null; end;
 return 'çıxış'; end $$;
revoke execute on function public._bio_att(bigint,timestamptz,text) from public, anon, authenticated;

-- damafon cihazında işçi basması maaşa toxunmur → davamiyyət
create or replace function public.bio_scan(p_sn text, p_pin text, p_at timestamp with time zone, p_verify integer, p_raw text)
 returns text language plpgsql security definer set search_path to 'public' as $function$
declare emp bigint; u bio_users; r office_payroll; lid bigint; rs bio_residents; drole text; begin
 select coalesce(info->>'role','maas') into drole from bio_devices where sn=p_sn;
 select * into rs from bio_residents where pin=p_pin;
 if rs.id is not null and not exists(select 1 from bio_users where pin=p_pin) then
  insert into bio_door_logs(sn,pin,resident_id,at,verify,raw,result) values(p_sn,p_pin,rs.id,p_at,p_verify,left(p_raw,500),case when rs.active then 'giriş' else 'passiv' end)
   on conflict (sn,pin,at) do nothing;
  return 'sakin';
 end if;
 if drole='damafon' then
  select employee_id into emp from bio_users where pin=p_pin;
  if emp is null then emp := case when p_pin ~ '^\d+$' and length(p_pin)<10 then p_pin::bigint end; end if;
  if emp is not null and exists(select 1 from office_employees where id=emp) then
   insert into bio_door_logs(sn,pin,at,verify,raw,result) values(p_sn,p_pin,p_at,p_verify,left(p_raw,500),'işçi · '||_bio_att(emp,p_at,p_sn)) on conflict (sn,pin,at) do nothing;
   return 'davamiyyət';
  end if;
  insert into bio_door_logs(sn,pin,at,verify,raw,result) values(p_sn,p_pin,p_at,p_verify,left(p_raw,500),'tanınmır') on conflict (sn,pin,at) do nothing;
  return 'tanınmır';
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
revoke execute on function public.bio_scan(text,text,timestamptz,integer,text) from public, anon, authenticated;
grant execute on function public.bio_scan(text,text,timestamptz,integer,text) to service_role;

-- qapı jurnalında işçi adı da görünsün
create or replace function public.bio_door_list(p_limit int default 50) returns jsonb language sql stable security definer set search_path=public as $$
 select case when bio_res_ok() then coalesce(jsonb_agg(x order by x.id desc),'[]') end from (
  select l.id, l.at, l.sn, l.pin, l.verify, l.result, coalesce(r.full_name, e.full_name, 'PIN '||l.pin) name, coalesce(r.unit_label,u.number, case when e.id is not null then 'işçi' end) unit_label
  from bio_door_logs l left join bio_residents r on r.id=l.resident_id left join km_units u on u.id=r.unit_id
  left join office_employees e on l.resident_id is null and l.pin ~ '^\d{1,9}$' and e.id=l.pin::bigint
  order by l.id desc limit least(p_limit,300)) x $$;
