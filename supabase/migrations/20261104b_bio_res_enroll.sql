-- Sakin yaradılan kimi cihazın ekranında barmaq qeydiyyatı (ENROLL_BIO TYPE=1) — yalnız son 5 dəq onlayn olan cihazlara
create or replace function public.bio_res_enroll(p_id bigint, p_type int default 1) returns jsonb language plpgsql security definer set search_path=public as $$
declare r bio_residents; res jsonb; begin if not bio_res_ok() then raise exception 'icazə yoxdur'; end if;
 select * into r from bio_residents where id=p_id; if r.id is null then raise exception 'sakin tapılmadı'; end if;
 if not r.active then raise exception 'sakin passivdir'; end if;
 perform _bio_res_push(p_id);
 with ins as (insert into bio_cmds(sn,cmd,created_by)
   select sn, 'ENROLL_BIO TYPE='||p_type||E'\tPIN='||r.pin||E'\tCardNo='||coalesce(r.card,'')||E'\tRETRY=3\tOVERWRITE=1', auth.uid()
   from bio_devices where allowed and last_seen > now()-interval '5 minutes' returning id, sn)
 select coalesce(jsonb_agg(jsonb_build_object('id',ins.id,'sn',ins.sn,'name',coalesce(d.name,d.model,ins.sn))),'[]') into res from ins join bio_devices d on d.sn=ins.sn;
 if res='[]'::jsonb then raise exception 'onlayn cihaz yoxdur — cihazın internetini yoxlayın'; end if;
 return res; end $$;
create or replace function public.bio_res_cmds(p_ids bigint[]) returns jsonb language sql stable security definer set search_path=public as $$
 select case when bio_res_ok() then coalesce(jsonb_agg(jsonb_build_object('id',c.id,'status',c.status,'result',c.result)),'[]') end from bio_cmds c where c.id = any(p_ids) $$;
create or replace function public.bio_res_n(p_id bigint) returns int language sql stable security definer set search_path=public as $$
 select case when bio_res_ok() then (select jsonb_array_length(coalesce(templates,'[]')) from bio_residents where id=p_id) end $$;
grant execute on function public.bio_res_enroll(bigint,int), public.bio_res_cmds(bigint[]), public.bio_res_n(bigint) to authenticated;
