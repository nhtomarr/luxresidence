-- Əmək müqavilələri (e-gov reyestrindən idxal). Həssas məlumat: FİN, vəsiqə, SSN, maaş.
-- Birbaşa cədvəl girişi YOXDUR (RLS, policy yoxdur) — yalnız office_hr_ok() yoxlayan RPC-lər.
create table if not exists public.office_hr_contracts(
  id bigserial primary key,
  employee_id bigint references public.office_employees(id) on delete cascade,
  grp text, employer text, kind text, doc_no text, doc_type text, submitted_at timestamptz, status text,
  fin text, id_serial text, ssn text, birth date, full_name text, salary numeric(12,2), position text,
  base_start date, signed date, start_date date, end_date date, validity text, place text, regime text, vac_days int,
  source text default 'e-gov', imported_at timestamptz default now(),
  unique(doc_no)
);
create index if not exists office_hr_contracts_emp on public.office_hr_contracts(employee_id);
alter table public.office_hr_contracts enable row level security;
revoke all on public.office_hr_contracts from anon, authenticated;

create or replace function public.office_hr_ok() returns boolean language sql stable security definer set search_path to 'public' as $$
  select public.lux_has_perm('ofis_owner') or public.lux_has_perm('sys') or public.lux_has_perm('ofis_hr')
$$;

create or replace function public.hr_can() returns boolean language sql stable security definer set search_path to 'public' as $$ select public.office_hr_ok() $$;

create or replace function public._hr_json(c public.office_hr_contracts) returns jsonb language sql stable set search_path to 'public' as $$
  select to_jsonb(c) - 'source' - 'imported_at'
$$;

create or replace function public.hr_emp(p_emp bigint) returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public.office_hr_ok() then raise exception 'İcazə yoxdur'; end if;
  return coalesce((select jsonb_agg(public._hr_json(c) order by (c.place='Əsas') desc, c.signed desc nulls last) from public.office_hr_contracts c where c.employee_id=p_emp),'[]'::jsonb);
end $$;

create or replace function public.hr_list() returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not public.office_hr_ok() then raise exception 'İcazə yoxdur'; end if;
  return coalesce((select jsonb_agg(public._hr_json(c) || jsonb_build_object('emp_name',e.full_name,'emp_active',e.active) order by e.full_name, (c.place='Əsas') desc, c.signed desc nulls last)
    from public.office_hr_contracts c join public.office_employees e on e.id=c.employee_id),'[]'::jsonb);
end $$;

revoke all on function public.office_hr_ok(), public.hr_can(), public.hr_emp(bigint), public.hr_list(), public._hr_json(public.office_hr_contracts) from public, anon;
grant execute on function public.hr_can(), public.hr_emp(bigint), public.hr_list() to authenticated;

grant execute on function public.office_hr_ok() to authenticated;
-- HR rəhbəri (rehber@pilothayat.az) müqavilələri görür
update public.lux_profiles set perms = array_append(perms,'ofis_hr') where email='rehber@pilothayat.az' and not ('ofis_hr' = any(perms));
