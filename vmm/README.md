# VMM Ofis (Viking · Maro · Marox)

Baş Ofis sisteminin VMM üçün ayrıca nüsxəsi, fərqli dizaynla. Ünvan: **https://ofis.vmm.az** (Cloudflare Worker `vmm-ofis`; köhnə test linki: vmm-ofis.netlify.app)

## Necə qurulub
- **Baza:** eyni Supabase layihəsi (`avqchschbbltnnasabdm`), amma ayrıca **`vmm` sxemi**. Bütün ofis cədvəlləri,
  funksiyaları, triggerləri, RLS siyasətləri `public`-dən `vmm`-ə köçürülüb. Funksiyalarda `search_path = vmm, extensions`
  — Pilot Həyatın (`public`) məlumatına toxunmur.
- **API:** `vmm` sxemi PostgREST-də açıqdır: `alter role authenticator set pgrst.db_schemas = 'public, graphql_public, vmm'`.
  Supabase panelində "Exposed schemas" dəyişdirilərsə `vmm`-i saxlamaq lazımdır.
- **Storage:** `vmm-office`, `vmm-avatars`, `vmm-chat`, `vmm-backups` bucket-ləri.
- **Edge funksiyalar:** `vmm-office-telegram`, `vmm-office-push-one`, `vmm-office-assistant`, `vmm-assistant-remind`,
  `vmm-lux-admin`, `vmm-call-ice`, `vmm-soc-ai`, `vmm-office-wish`, `vmm-office-backup`, `vmm-outing-nudge` (hamısı `db.schema='vmm'`).
- **Cron:** `vmm-*` adlı işlər (`cron.job`).
- **Realtime:** `vmm.office_messages/calls/call_sig/presence/notifs` publikasiyada; kanal adları `vmm-` prefiksi ilə.
- **Auth:** ortaq (`auth.users`), amma giriş `vmm.lux_profiles`-ə görə. Deaktiv etmə auth-u bloklamır (Pilot hesabına toxunmasın deyə).

## Frontend
`python3 vmm/build.py <versiya>` → `vmm/dist/` (Baş Ofis kodundan avtomatik yığılır, `vmm/overlay/` əlavə olunur).
Baş Ofisdə yenilik olanda eyni skripti yenidən işlət və Cloudflare-ə yüklə: `cd vmm && npx wrangler deploy` (CLOUDFLARE_API_TOKEN lazımdır).
VMM-də səsli assistent söndürülüb (build.py: Assistent tabı silinir, NOASST_CSS giriş nöqtələrini gizlədir).

Dizayn: `vmm/overlay/vmm-theme.css` — "Liman": ağ panel + konteyner zolağı (V qəhvəyi #7b4b2a, M yaşıl #2e7d4f, M narıncı #e2742b),
Archivo şrifti (geniş başlıqlar), düz səthlər.

## Yeni hesaba köçürmə
`vmm` sxemini dump edib yeni layihədə `public` kimi bərpa et, edge funksiyaları köçür, frontend-də URL/açarı dəyiş.
