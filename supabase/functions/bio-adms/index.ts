// ZKTeco ADMS (Push / iClock) qəbuledicisi — maaş verilişi üçün barmaq izi terminalı.
// Cihaz → https://ofis.pilothayat.az/iclock/* → (Pages proxy) → bu funksiya.
// Təhlükəsizlik: cihaz SN-i Baş Ofisdə təsdiqlənməlidir (bio_devices.allowed) və təsdiqlənən IP-dən gəlməlidir (lock_ip).
import { createClient } from 'npm:@supabase/supabase-js@2';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const txt = (b: string, s = 200) => new Response(b, { status: s, headers: { 'Content-Type': 'text/plain; charset=utf-8', Date: new Date().toUTCString() } });
const kv = (line: string) => { const o: Record<string, string> = {}; for (const p of line.split('\t')) { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1); } return o; };
const bakuTime = (s: string) => { const m = String(s || '').trim().match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})/); return m ? `${m[1]}T${m[2]}+04:00` : new Date().toISOString(); };

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^.*\/iclock/, '/iclock');
  const sn = (url.searchParams.get('SN') || url.searchParams.get('sn') || '').trim();
  const ip = req.headers.get('x-device-ip') || req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  const body = req.method === 'POST' ? await req.text() : '';
  try {
    if (!sn) return txt('OK');
    // cihazı qeydə al / yenilə
    const { data: dev } = await db.from('bio_devices').select('*').eq('sn', sn).maybeSingle();
    const info = url.searchParams.get('INFO');
    const upd: Record<string, unknown> = { sn, last_seen: new Date().toISOString() };
    upd.ip = ip;
    if (info) { const p = info.split(','); upd.fw = p[0]; upd.users = +p[1] || null; upd.fps = +p[2] || null; upd.info = { ...(dev?.info || {}), raw: info }; }
    if (url.searchParams.get('pushver')) upd.model = url.searchParams.get('DeviceType') || dev?.model || 'ZKTeco';
    await db.from('bio_devices').upsert(upd);
    const allowed = !!dev?.allowed && (!dev?.info?.lock_ip || dev.info.lock_ip === ip);

    // 1) ilk əlaqə: ayarlar
    if ((path === '/iclock/cdata' || path === '/iclock/push') && req.method === 'GET') {
      return txt([`GET OPTION FROM: ${sn}`, 'ATTLOGStamp=None', 'OPERLOGStamp=9999', 'ATTPHOTOStamp=None', 'ErrorDelay=30', 'Delay=5',
        'TransTimes=00:00;14:05', 'TransInterval=1', 'TransFlag=TransData AttLog\tOpLog\tEnrollUser\tChgUser\tEnrollFP\tChgFP\tFACE\tUserPic',
        'TimeZone=4', 'Realtime=1', 'Encrypt=None', 'ServerVer=2.4.1', 'PushProtVer=2.4.1'].join('\n') + '\n');
    }
    if (path === '/iclock/registry') return txt('RegistryCode=' + sn.slice(-8));
    if (path === '/iclock/ping') return txt('OK');

    // 2) məlumat göndərir
    if (path === '/iclock/cdata' && req.method === 'POST') {
      const table = (url.searchParams.get('table') || '').toUpperCase();
      const lines = body.split(/\r?\n/).filter((l) => l.trim());
      if (!allowed) return txt('OK: ' + lines.length);
      let n = 0;
      if (table === 'ATTLOG') {
        for (const l of lines) {
          const f = l.split('\t');
          const { error } = await db.rpc('bio_scan', { p_sn: sn, p_pin: (f[0] || '').trim(), p_at: bakuTime(f[1]), p_verify: +f[3] || 0, p_raw: l });
          if (!error) n++;
        }
        return txt('OK: ' + n);
      }
      // OPERLOG / BIODATA / FINGERTMP — şablonların ehtiyat nüsxəsi
      for (const l0 of lines) {
        let l = l0.trim(), kind = table;
        const sp = l.indexOf(' ');
        if (/^(USER|FP|BIODATA|FACE|OPLOG|USERPIC|BIOPHOTO)\s/.test(l)) { kind = l.slice(0, sp); l = l.slice(sp + 1); }
        const o = kv(l);
        const pin = o.PIN || o.Pin || o.pin;
        if (kind === 'FP' || kind === 'FINGERTMP') {
          await db.rpc('bio_template', { p_pin: pin, p_key: 'fp' + (o.FID ?? '0'), p_cmd: 'DATA UPDATE FINGERTMP ' + l }); n++;
        } else if (kind === 'BIODATA') {
          await db.rpc('bio_template', { p_pin: pin, p_key: 'bio' + (o.Type ?? '') + '-' + (o.No ?? '') + '-' + (o.Index ?? ''), p_cmd: 'DATA UPDATE BIODATA ' + l }); n++;
        } else if (kind === 'FACE') {
          await db.rpc('bio_template', { p_pin: pin, p_key: 'face' + (o.FID ?? '0'), p_cmd: 'DATA UPDATE FACE ' + l }); n++;
        } else n++;
      }
      return txt('OK: ' + n);
    }

    // 3) əmr soruşur
    if (path === '/iclock/getrequest') {
      if (!allowed) return txt('OK');
      const { data: cmds } = await db.from('bio_cmds').select('id,cmd').eq('sn', sn).eq('status', 'new').order('id').limit(20);
      if (!cmds || !cmds.length) return txt('OK');
      await db.from('bio_cmds').update({ status: 'sent', sent_at: new Date().toISOString() }).in('id', cmds.map((c) => c.id));
      return txt(cmds.map((c) => `C:${c.id}:${c.cmd}`).join('\n') + '\n');
    }

    // 4) əmrin nəticəsi
    if (path === '/iclock/devicecmd') {
      for (const l of body.split(/\r?\n/).filter((x) => x.trim())) {
        const p = new URLSearchParams(l.replace(/\t/g, '&'));
        const id = +(p.get('ID') || 0), ret = p.get('Return') || '';
        if (id) await db.from('bio_cmds').update({ status: ret === '0' ? 'ok' : 'err', result: l.slice(0, 300), done_at: new Date().toISOString() }).eq('id', id).eq('sn', sn);
      }
      return txt('OK');
    }
    return txt('OK');
  } catch (e) {
    try { await db.from('sys_errors').insert({ app: 'bio-adms', msg: String((e as Error).message || e).slice(0, 300), url: req.url.slice(0, 200), ua: sn }); } catch (_) { /* */ }
    return txt('OK');
  }
});
