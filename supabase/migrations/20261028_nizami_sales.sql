-- Nizami City: satış lövhəsi, kalkulyator, müqavilələr (28.10.2026)
-- lux_kv açarları: nc_sales (şahmatka, City Life MMC 07.10.2026), nc_cfg (kalkulyator, açıq), nc_commercial
-- lux_key_perm: nc_sales/nc_commercial/nc_garage -> nc_sales_edit ; nc_cfg -> nc_calc_admin ; lux_key_public += nc_cfg
-- "kv read" policy: nc_sales açarları nc_sales / nc_contracts / nc_calc icazəsi ilə oxunur
-- İcazələr: nc_sales, nc_sales_edit, nc_calc, nc_calc_admin, nc_contracts, nc_komendant, nc_komendant_kassa, nc_komendant_akt, nc_sakin

create table if not exists public.nc_contracts(
 id bigserial primary key, no text unique,
 bina text, floor text, unit_idx int, unit_no text, rooms int, area numeric, cond text,
 buyer_name text not null, buyer_id text, buyer_doc text, buyer_phone text, buyer_address text,
 price numeric, price_m2 numeric, payment_type text default 'nagd', down_payment numeric, months int, monthly numeric,
 signed_date date, status text default 'aktiv', note text,
 created_by uuid default auth.uid(), created_at timestamptz default now(), updated_at timestamptz default now());
-- RLS: nc_ok('nc_contracts'); nömrə trigger: NC-YYYY-0001 (nc_contract_no)
-- nc_unit_status(bina,floor,idx,status): satış lövhəsində bir mənzilin statusunu dəyişir (nc_contracts / nc_sales_edit)
