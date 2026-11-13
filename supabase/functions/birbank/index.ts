// Birbank Business (Kapital Bank) B2B API körpüsü — komendant sistemi üçün.
// Giriş məlumatları office_secrets.birbank-dadır (env, base, host, username, password, accounts[]); token office_secrets.birbank_tok-da keşlənir.
// Çağırış yalnız x-cron-secret ilə. YALNIZ OXUMA — köçürmə/imza/rədd endpointləri qoşulmayıb.
// ?a=sync — son 3 günün çıxarışından daxil olan (C) köçürmələri km_bank_ingest ilə qəbul edir, mənzilə bağlayır.
import { createClient } from 'npm:@supabase/supabase-js@2';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const J = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });
const ymd = (d: Date) => new Date(d.getTime() + 4 * 3600e3).toISOString().slice(0, 10); // Bakı tarixi

async function cfg() { const { data } = await db.from('office_secrets').select('birbank,birbank_tok,cron_secret').eq('id', 1).single(); return data; }

async function login(b: any) {
  const t0 = Date.now();
  const r = await fetch(b.base + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ username: b.username, password: b.password }) });
  const txt = await r.text(); let j: any = null; try { j = JSON.parse(txt); } catch (_) { /* */ }
  const tok = j?.responseData?.jwttoken;
  if (tok) await db.from('office_secrets').update({ birbank_tok: { t: tok, r: j.responseData.jwtrefreshtoken, at: Date.now() } }).eq('id', 1);
  return { status: r.status, ms: Date.now() - t0, j, tok, raw: j ? null : txt.slice(0, 400) };
}

// token: keşdən (10 dəq), yoxsa / 401 olarsa yenidən login
async function api(c: any, path: string) {
  const b = c.birbank; let tok = c.birbank_tok && Date.now() - c.birbank_tok.at < 10 * 60e3 ? c.birbank_tok.t : null;
  if (!tok) { tok = (await login(b)).tok; c.birbank_tok = { t: tok, at: Date.now() }; }
  const go = (t: string) => fetch(b.host + path, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + t } });
  let r = await go(tok);
  if (r.status === 401 || r.status === 403) { tok = (await login(b)).tok; c.birbank_tok = { t: tok, at: Date.now() }; r = await go(tok); }
  const txt = await r.text(); let j: any = null; try { j = JSON.parse(txt); } catch (_) { /* */ }
  return { status: r.status, j, raw: j ? null : txt.slice(0, 400) };
}

async function sync(c: any, days: number) {
  const b = c.birbank;
  let accts: string[] = b.accounts || [];
  if (!accts.length) {
    if (b.env !== 'test') throw new Error('birbank.accounts təyin edilməyib');
    const a = await api(c, '/b2b/accounts/portal/v1');
    accts = (a.j?.accounts || []).filter((x: any) => x.currency === 'AZN' && x.status === 'ACTIVE').map((x: any) => x.accountNumber);
  }
  const to = new Date(), from = new Date(to.getTime() - Math.min(days, 10) * 86400e3);
  const out: Record<string, number> = { seen: 0, credit: 0, matched: 0, unmatched: 0, dup: 0 }; const errs: string[] = [];
  for (const acc of accts) {
    const r = await api(c, `/b2b/accounts/portal/v1/statements?accountNumber=${encodeURIComponent(acc)}&fromDate=${ymd(from)}&toDate=${ymd(to)}`);
    if (r.status !== 200) { errs.push(acc + ': ' + r.status); continue; }
    const blocks = Array.isArray(r.j?.accountStatements) ? r.j.accountStatements : [r.j];
    for (const bl of blocks) for (const t of (bl?.statementList || [])) {
      out.seen++;
      if (t.drcrInd !== 'C' || (t.amountTag && t.amountTag !== 'MAIN')) continue;
      out.credit++;
      const { data, error } = await db.rpc('km_bank_ingest', { p_ref: String(t.trnRefNo), p_acc: acc, p_dt: t.trnDt, p_amount: +t.lcyAmount, p_ccy: t.acCcy || bl?.accountInfo?.accountCurr || 'AZN', p_purpose: t.purpose || '', p_raw: t });
      if (error) errs.push(String(t.trnRefNo) + ': ' + error.message); else out[data as string] = (out[data as string] || 0) + 1;
    }
  }
  if (out.matched || out.unmatched) {
    await db.rpc('tg_notify', { text: `🏦 Birbank (${b.env}): ${out.matched} ödəniş mənzilə bağlandı` + (out.unmatched ? `, ${out.unmatched} tanınmadı — komendant paneldə «Bank ödənişləri»nə baxın` : '') });
  }
  return { accounts: accts.length, ...out, errs };
}

Deno.serve(async (req) => {
  const c = await cfg();
  if (!c || req.headers.get('x-cron-secret') !== c.cron_secret) return J({ error: 'forbidden' }, 403);
  const b = c.birbank; if (!b) return J({ error: 'birbank konfiqurasiyası yoxdur' }, 400);
  const u = new URL(req.url); const act = u.searchParams.get('a') || 'ping';
  try {
    if (act === 'ping') {
      const r = await login(b); const d = r.j?.responseData;
      return J({ env: b.env, http: r.status, ms: r.ms, code: r.j?.response?.code, message: r.j?.response?.message, hasToken: !!r.tok, user: d?.userInfo ? { name: d.userInfo.name, surname: d.userInfo.surname, company: d.userInfo.chatData?.clientData?.company, signatureLevel: d.userInfo.signatureLevel } : null, raw: r.raw });
    }
    if (act === 'accounts') { const r = await api(c, '/b2b/accounts/portal/v1'); return J({ http: r.status, data: r.j, raw: r.raw }); }
    if (act === 'sync') return J(await sync(c, +(u.searchParams.get('days') || 3)));
    if (act === 'get') { // yalnız GET, yalnız /b2b/ altında — sənəddəki endpointləri yoxlamaq üçün
      const p = u.searchParams.get('p') || ''; if (!/^\/b2b\/[\w\/\-?=&.%]+$/.test(p) || /reject|sign|confirm|delete|create|transfer\/?$/i.test(p)) return J({ error: 'icazəsiz yol' }, 400);
      const r = await api(c, p); return J({ http: r.status, data: r.j, raw: r.raw });
    }
    return J({ error: 'naməlum əməliyyat' }, 400);
  } catch (e) { return J({ error: String((e as Error).message || e) }, 500); }
});
