-- Nizami City komendantlığı: LUX komendant strukturunun "nc" sxemində tam surəti (məlumatsız).
-- Klient: supabase-js .schema('nc'); icazələr nc_komendant / nc_komendant_kassa / nc_komendant_akt / nc_sakin.
create schema if not exists nc;
grant usage on schema nc to anon, authenticated, service_role;

do $$
declare
  t text; r record; d text; v text;
  tabs text[] := array['km_units','km_amenities','km_tariffs','km_vendors','km_polls','km_meters','km_access','km_acts','km_acts_deleted','km_announcements',
    'km_bookings','km_charges','km_config','km_docs','km_expenses','km_guest_passes','km_handover','km_handover_log','km_incidents','km_maintenance',
    'km_otp','km_parcels','km_payments','km_readings','km_requests','km_residents','km_sms_config','km_votes'];
  fns text[] := array['_km_phone','_km_sms_send','km_act_delete','km_act_save','km_apply_penalty','km_auto_generate','km_cashier','km_demo_clear','km_generate',
    'km_guest_check','km_maint_done','km_my_units','km_otp_diag','km_otp_send','km_otp_verify','km_poll_results','km_req_guard','km_sms_config_get',
    'km_sms_config_set','km_staff','trg_km_handover_log'];
  fks text[] := '{}'; pols text[] := '{}'; trgs text[] := '{}';
begin
  perform set_config('search_path','public',true);
  -- 1) cədvəllər
  foreach t in array tabs loop
    execute format('create table if not exists nc.%I (like public.%I including all)', t, t);
    execute format('alter table nc.%I enable row level security', t);
    execute format('grant select,insert,update,delete on nc.%I to authenticated', t);
    execute format('grant all on nc.%I to service_role', t);
  end loop;
  -- 2) xarici açarlar, siyasətlər, triggerlər (public adlarla oxu, nc kontekstində yarat)
  for r in select conrelid::regclass::text tb, pg_get_constraintdef(oid) df from pg_constraint
           where contype='f' and connamespace='public'::regnamespace and conrelid::regclass::text = any(tabs) loop
    fks := fks || format('alter table nc.%I add %s', r.tb, r.df);
  end loop;
  for r in select tablename, policyname, cmd, permissive, roles, qual, with_check from pg_policies where schemaname='public' and tablename = any(tabs) loop
    pols := pols || format('create policy %I on nc.%I as %s for %s to %s %s %s', r.policyname, r.tablename, r.permissive, r.cmd,
      array_to_string(r.roles, ','), case when r.qual is not null then 'using ('||r.qual||')' else '' end,
      case when r.with_check is not null then 'with check ('||r.with_check||')' else '' end);
  end loop;
  for r in select c.relname, pg_get_triggerdef(tg.oid) df from pg_trigger tg join pg_class c on c.oid=tg.tgrelid
           where c.relnamespace='public'::regnamespace and c.relname = any(tabs) and not tg.tgisinternal loop
    d := replace(r.df, 'ON public.'||r.relname, 'ON nc.'||r.relname);
    d := replace(d, 'EXECUTE FUNCTION km_req_guard()', 'EXECUTE FUNCTION nc.km_req_guard()');
    d := replace(d, 'EXECUTE FUNCTION trg_km_handover_log()', 'EXECUTE FUNCTION nc.trg_km_handover_log()');
    d := replace(d, 'EXECUTE FUNCTION sys_', 'EXECUTE FUNCTION public.sys_');
    trgs := trgs || d;
  end loop;
  v := pg_get_viewdef('public.km_unit_balance'::regclass);
  -- 3) funksiyalar
  perform set_config('search_path','nc, public',true);
  foreach t in array fns loop
    select pg_get_functiondef(p.oid) into d from pg_proc p where p.pronamespace='public'::regnamespace and p.proname=t;
    d := replace(d, 'FUNCTION public.', 'FUNCTION nc.');
    d := replace(d, 'public.km_', 'nc.km_');
    d := replace(d, 'public._km_', 'nc._km_');
    d := replace(d, 'SET search_path TO ''public''', 'SET search_path TO ''nc'', ''public''');
    d := replace(d, '''komendant_kassa''', '''nc_komendant_kassa''');
    d := replace(d, '''komendant_akt''', '''nc_komendant_akt''');
    d := replace(d, '''komendant''', '''nc_komendant''');
    d := replace(d, '''sakin''', '''nc_sakin''');
    d := replace(d, 'LUX Residence', 'Nizami City');
    d := replace(d, '''TT-B''||u.bina', '''NC-TT''||u.bina');
    d := replace(d, '778800+u.bina', '779900+u.bina');
    d := replace(d, '''Bina ''||u.bina', 'nc.bina_label(u.bina)');
    if t in ('km_guest_check') then
      -- bina_label sonra yaradılır; plpgsql gövdəsi icra vaxtı yoxlanır
      null;
    end if;
    execute d;
  end loop;
  foreach d in array fks loop execute d; end loop;
  execute 'create or replace view nc.km_unit_balance with (security_invoker=true) as '||v;
  grant select on nc.km_unit_balance to authenticated;
  foreach d in array pols loop execute d; end loop;
  foreach d in array trgs loop execute d; end loop;
end $$;

-- bina nömrəsi → ad (Nizami City şahmatkası)
create or replace function nc.bina_label(b int) returns text language sql immutable as $$
  select coalesce((array['A · Giriş 1','A · Giriş 2','B','E · Giriş 1','E · Giriş 2','F','G · Giriş 1','G · Giriş 2'])[b], 'Bina '||b) $$;

-- km_staff / km_cashier Nizami icazələri ilə (replace artıq edildi, yoxlama üçün açıq yazılır)
create or replace function nc.km_staff() returns boolean language sql stable security definer set search_path to 'nc','public'
as $$ select public.lux_has_perm('nc_komendant') or public.lux_has_perm('nc_komendant_kassa') $$;
create or replace function nc.km_cashier() returns boolean language sql stable security definer set search_path to 'nc','public'
as $$ select public.lux_is_admin() or public.lux_has_perm('nc_komendant_kassa') $$;

-- satış lövhəsindən (nc_sales) mənzilləri komendantlığa idxal
create or replace function nc.km_import_units() returns integer language plpgsql security definer set search_path to 'nc','public' as $$
declare n int := 0; b record; r record; u jsonb; bn int; st text; kd text; fl int; ps int;
  names text[] := array['Bina A · Giriş 1','Bina A · Giriş 2','Bina B','Bina E · Giriş 1','Bina E · Giriş 2','Bina F','Bina G · Giriş 1','Bina G · Giriş 2'];
begin
  if not nc.km_staff() then raise exception 'İcazə yoxdur'; end if;
  for b in select key, value from jsonb_each((select value from public.lux_kv where key='nc_sales')) loop
    bn := array_position(names, b.key); if bn is null then continue; end if;
    for r in select key, value from jsonb_each(b.value->'rows') loop
      for u in select * from jsonb_array_elements(r.value) loop
        st := u->>'s'; if st in ('zirzemi') then continue; end if;
        kd := case when st='qeyri' then 'qeyri' else 'menzil' end;
        fl := floor(r.key::numeric)::int;
        ps := coalesce((u->>'n')::int,1) + case when r.key='1.5' then 50 else 0 end;   -- 1-ci mərtəbə II səviyyə
        insert into nc.km_units(bina,floor,pos,number,kind,area,rooms,status,note)
        values (bn, fl, ps, case when r.key='10' then 'M' when r.key='1.5' then '1s' else r.key end||'-'||coalesce(u->>'n','1'), kd,
                nullif(u->>'area','')::numeric, nullif(u->>'room','')::int,
                case st when 'sakin' then 'yasayir' when 'satilib' then 'satilib' when 'investor' then 'investor' when 'fond' then 'fond' when 'satisda' then 'satisda' when 'bron' then 'satisda' else 'bos' end,
                nullif(u->>'c',''))
        on conflict (bina,floor,pos) do update set area=coalesce(excluded.area,nc.km_units.area), rooms=coalesce(excluded.rooms,nc.km_units.rooms),
          status=case when nc.km_units.status in ('bos','satisda') then excluded.status else nc.km_units.status end, kind=excluded.kind;
        n := n + 1;
      end loop;
    end loop;
  end loop;
  return n;
end $$;

-- ilkin ayarlar
insert into nc.km_config(id,due_day,penalty_pct,bank_info,company,phone,auto_generate)
values (1,15,0,'','Nizami City Komendantlığı','',false) on conflict (id) do nothing;
insert into nc.km_sms_config select * from public.km_sms_config where id=1 on conflict (id) do nothing;
update nc.km_sms_config set enabled=false, sender='Nizami City', after_text='' where id=1;

-- funksiyalara giriş
revoke execute on all functions in schema nc from public, anon;
grant execute on all functions in schema nc to authenticated, service_role;

-- aylıq avtomatik hesablama
select cron.schedule('nc-km-auto-generate','0 21 28-31 * *',$c$select case when to_char((now() at time zone 'Asia/Baku')::date,'DD')='01' then nc.km_auto_generate() end$c$);

-- fayllar: komendant bucket-də nc/ qovluğu, chat bucket-də ncacts/ qovluğu
create policy "nc km files insert" on storage.objects for insert to authenticated with check (bucket_id='komendant' and name like 'nc/%' and (nc.km_staff() or public.lux_has_perm('nc_sakin')));
create policy "nc km files read" on storage.objects for select to authenticated using (bucket_id='komendant' and name like 'nc/%' and (nc.km_staff() or owner=auth.uid() or (name like 'nc/docs/%' and public.lux_has_perm('nc_sakin'))));
create policy "nc km files delete" on storage.objects for delete to authenticated using (bucket_id='komendant' and name like 'nc/%' and (nc.km_staff() or owner=auth.uid()));
create policy "nc chat acts upload" on storage.objects for insert to authenticated with check (bucket_id='chat' and (storage.foldername(name))[1]='ncacts' and nc.km_staff());

-- PostgREST: nc sxemini aç
alter role authenticator set pgrst.db_schemas = 'public, graphql_public, vmm, nc';
notify pgrst, 'reload config';
