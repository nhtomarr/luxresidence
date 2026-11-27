# LUX Residence / Pilot Həyat — Tam Layihə Durumu

> Bu sənəd yeni çatda işi davam etdirmək üçündür. İstifadəçi: **Nihat Ömərov** (IT/Marketinq üzrə mütəxəssis, Pilot Həyat / LUX Residence qrupu). Cavablar **Azərbaycan dilində, operativ** olmalıdır.

---

## 1. İNFRASTRUKTUR

### Repo və hosting
- **GitHub repo:** `nhtomarr/luxresidence` (branch: main)
- **Hosting:** Cloudflare Pages (hər push avtomatik deploy olur, 1-2 dəqiqə)
- **Local repo:** `/home/claude/luxresidence`
- İş axını: dəyişiklik → `git add -A && git commit -m "..." && git push origin main`

### Supabase layihələri
- **Əsas (Baş Ofis + LUX + Komendant + Satış):** `avqchschbbltnnasabdm`
- **Təchizat (ayrı):** `syyybdouqdahsomfkemi`
- Əsas layihənin anon açarı `assets/lux-auth.js`-dədir.

### Domenlər / səhifələr
| URL | Fayl | Təsvir |
|---|---|---|
| luxresidence.az | index.html | Əsas sayt |
| luxresidence.az/3d | 3d.html | 3D bina (Three.js) |
| luxresidence.az/menzil-tur | menzil-tur.html | Mənzil içi 3D interyer turu (yeni) |
| luxresidence.az/komendant | komendant.html | Komendantlıq idarəetmə |
| luxresidence.az/satis | satis.html | Satış lövhəsi |
| luxresidence.az/muqavile | muqavile.html | Müqavilə + arxiv (Türkanə xanım üçün) |
| luxresidence.az/kalkulyator | kalkulyator.html | Qiymət kalkulyatoru |
| luxresidence.az/nezaret | nezaret.html | Sistem nəzarəti (sağlamlıq, trafik) |
| **ofis.pilothayat.az** | ofis.html | **Baş Ofis idarəetmə (əsas iş burada)** |
| techizat.pilothayat.az | techizat.html | Təchizat qiymət yoxlama |

---

## 2. XARİCİ AÇARLAR (office_secrets / app_secrets cədvəlində, id=1)

> Hamısı bazada gizli saxlanılır. **Təhlükəsizlik qeydi:** bu açarlar əvvəlki çatda mətn kimi göndərilib, iş sabitləşəndə yenilənməlidir (rotate).

- **OpenAI** (`openai_key`): AI assistent — Whisper (səs→mətn), gpt-4o-mini (anlama), gpt-4o-mini-tts (səsli cavab). Balans: ~10$.
- **Anthropic** (Təchizat layihəsində, `app_secrets.anthropic`): Claude Haiku, model `claude-haiku-4-5-20251001`.
- **ScrapingBee** (Təchizat): sayt scraping.
- **Cloudflare Analytics** (`sys_config.cf_token`, `sys_config.cf_zone`): sayt trafiki.
- **Öz brauzer serveri** (Render.com, Təchizat): `browser_url`, `browser_token`.
- **VAPID + FCM** (`vapid_public/private`, `fcm_sa`): telefon push bildirişləri.
- **Telegram bot** (`tg_token`, `tg_chats`): bot @qrmelumat_bot (t.me/qrmelumat_bot). `tg_chats` = Nihatın chat ID (8595432332). Giriş-çıxış bildirişləri bura gedir.
- **cron_secret**: edge funksiyaların qorunması.

---

## 3. BAŞ OFİS (ofis.html — əsas sistem, ~1972 sətir)

### Dizayn / rollar
- **Mavi dizayn** (işçilər) + **komendant dizaynı** (yalnız sahibkar — `body.owner`: krem fon, terrakota, şüşə, Playfair, ipək fon `/assets/km/bg.jpg`).
- Rollar (lux_profiles.perms): `ofis` (işçi), `ofis_admin` (rəhbər/MGR), `ofis_owner` (sahibkar/OWNER), `sys` (Nihat), `is_admin`.
- `MGR = is_admin || OWNER || perms.indexOf('ofis_admin')>=0`.
- Service worker: `ofis-sw.js`, versiya `ofis-vNN` (hər dəyişiklikdə artır → avtomatik yenilənmə var). Hazırda **v41**.
- `sb.functions.invoke`, `sb.from`, `sb.rpc`, `sb.channel` (realtime), `sb.storage` istifadə olunur. `$('id')` = getElementById. `esc()`, `toast()`, `modal()`, `closeModal()`, `run()` köməkçiləri var.

### Tab-lar (rola görə)
- **İşçi:** Bu gün, 💬 Çat, Aylıq plan, Tapşırıqlar, Sorğular, Komanda, Elanlar, Təqvim, Sənədlər, Profilim.
- **Sahibkar (OWNER):** Nəzarət, 💬 Çat, 🔔 Xatırlat, 🎯 Assistent, Profil.
- **Rəhbər (MGR):** Nəzarət, Panel, 🔔 Xatırlat + əsas tab-lar.
- Açıq tab **sessionStorage** ilə yadda qalır (yeniləmədə ana səhifəyə atmır).

### Davamiyyət (QR gəliş-çıxış)
- **office_check(p_kind, p_token, p_lat, p_lng, p_at)** RPC — QR oxunanda çağırılır.
  - `p_at` = telefonun **oxutma anı** (zəif internetdə düzgün saat, ±5 dəq pəncərə ilə saxtakarlıq qorunur).
  - Yer (GPS) yoxlaması: ofisdən 150m radius (`office_config.lat/lng/radius_m`).
  - **Çıxış gəlişdən ən azı 10 dəq sonra** (absurd eyni-dəqiqə qeydlərin qarşısı).
  - Gəliş/çıxışda **Telegram bildirişi** (tg_notify funksiyası): 🟢 gəldi / 🔴 getdi.
  - Selfie: `require_selfie=true` — həm giriş, həm çıxışda.
- İş saatı: `office_employees.work_start/work_end` (fərdi) və ya `schedule` jsonb (həftə günü üzrə). `office_day_hours(e,d)` funksiyası.
- **İş günləri:** `office_config.work_days = {1,2,3,4,5}` (B.e–Cümə). `office_is_workday(d)` funksiyası.
  - Şənbə-bazar: davamiyyət gözlənilmir, nudge/səhər bildirişi getmir, "Bu gün iş günü deyil" yumşaq qeydi (frontend `isWorkdayToday()`, `workdayNote()`).
- Cron: `office-outing-nudge` (*/10 5-15 * * 1-5), `office-morning` (30 5 * * 1-5).

### Aylıq plan
- `office_plans(employee_id, month 'YYYY-MM', items jsonb, status, mgr_note, submitted_at, approved_by/at)`.
- items hər bənd: `{t: mətn, done: bool, note: '', rec: bool}` (rec = mütəmadi/təkrarlanan).
- Axın: Yaz → Rəhbərə göndər (submitted) → Təsdiq (approved) / Geri qaytar (returned).
- **İcra (quş)** həm submitted, həm approved statusunda işləyir, həm cari həm gələn ay (`m<=mAdd(cur,1)`).
- **Excel/CSV import:** ağıllı sütun aşkarlama — ən çox mətn olan sütunu plan kimi götürür, nömrə/başlıq atır, status sütununu tanıyır. Düymə: "📄 Excel-dən yüklə".
- **Mütəmadi (rec) işlər** yeni aya avtomatik keçir.
- Rəhbər plan panelini açanda təsdiq gözləyən plan hansı aydadırsa avtomatik o aya keçir.

### 🎯 AI Assistent (yalnız sahibkar)
- Edge function: **office-assistant** (v15). Whisper/gpt-4o-transcribe (səs tanıma, işçi adları ipucu), gpt-4o-mini (tool calling), gpt-4o-mini-tts (səsli cavab, 8 səs seçimi).
- Vaxt: bütün saatlar **Bakı yerli** (bakuISO funksiyası +04:00).
- Alətlər (RPC-lər): davamiyyet (asst_attendance), iscilyer (asst_staff), adgunleri (asst_birthdays), sorgular (asst_leaves), colde (asst_outings — yalnız_colde), gecikme (asst_late_summary), menziller (asst_units — "sakin"=yasayir), menzil_xulase, borclular (asst_debts), plan_elave/plan_bitir/plan_sil/plan_vaxt.
- "İşdə kim var" → davamiyyet (status=ofisde), "çöldə kim var" → colde. Bunları qarışdırmır.
- Söhbət yaddaşı, fasiləsiz dinləmə (VAD), söz kəsmə (barge-in), PDF/cədvəl cavab, şəxsi tapşırıq idarəetməsi.
- `asst_guard()` = yalnız sahibkar/admin.

### 🔔 Xatırlat bölməsi (rəhbər/sahibkar)
- **office_forgot_list()** RPC — unudanları aşkar edir: cixis (çıxış qeyd etməyib), gelis (gəlməyib), colde (qısa çıxışdan qayıtmayıb), plan (aylıq plan verməyib), push (bildiriş aktiv etməyib). Həftə sonu gelis/cixis göstərmir.
- **office_remind_send(emp_id, title, body)** RPC → **office-push-one** edge function → işçiyə push.
- Şablonlar: `office_remind_templates` (6 hazır + istifadəçi öz şablonunu əlavə edə bilər). Fərdi və ya topluca göndərmə.

### 💬 Komanda çatı (hamıya — ƏN SON İŞ)
- **office_messages(sender, receiver, body, reply_to, reaction, image_url, created_at, read_at)**. RLS: yalnız öz yazışmanı görürsən.
- Realtime aktiv (`supabase_realtime` publication-a əlavə edilib).
- RPC-lər: **msg_threads()** (söhbətlər + son mesaj + oxunmamış), **msg_contacts()** (işçilər + sahibkar/admin, yeni çat üçün), **msg_open(p_other)** (mesajlar + reply/reaction/image, oxundu işarələ), **msg_unread()** (nişan), **msg_profile(p_uid)** (profil).
- **office_user_any()** = ofis icazəli hər kəs.
- Funksiyalar: reaksiya (👍❤️😂😮😢🙏 — uzun bas/sağ klik/ikiqat toxunuş), yanıt (reply/sitat), şəkil (storage bucket `chat`, 5MB, public), profilə keçid (ada/avatara bas).
- Dizayn: işçidə mavi, sahibkarda terrakota balonlar (WhatsApp/Telegram stili).
- CSS siniflər: `.chatrow .chatav .chatmeta .chatbadge .chathead .chatmsgs .msg(.mine/.their) .msgreact .msgreply .msgimg .replybar .chatreacts .tabbadge`.
- **Pending:** yeni mesaj gələndə push/Telegram bildirişi hələ YOXDUR (istifadəçidən soruşulub, əlavə oluna bilər).

### Digər
- **Profil bölməsi** (sahibkar): avatar, bildiriş aktivləşdirmə, sürətli keçidlər, çıxış.
- **Bildiriş (push):** VAPID (veb) + FCM (native). `office_push_subs` cədvəli. INSERT+UPDATE policy (upsert üçün).
  - **Admin bildirişləri (sys-monitor edge function)** yalnız `is_admin/ofis_owner/sys`-ə gedir (işçilərə yox).
  - 16 cihaz aktiv (14 işçi + admin). Aktiv etməyən 9: Aytac Soltanova, Hüseyn Cəfərzadə, Mahirə Məmmədbəyli, Mina Sadıqova, Mirzə Süleymanlı, Nəbi Ağayev, Saleh İskəndərov, Sevda Tağıyeva, Xeyrənsə Rəhmanova.
- **Ağ ekran həlli:** yüklənmə ekranı ("Baş Ofis · Yüklənir") + SW fetch 3san timeout + fallback.

---

## 4. KOMENDANTLIQ (komendant.html, ~755 sətir)
- 731 real mənzil, 9 bina, 165 sakin (20 demo var, hamı demo süzülür).
- `km_units(bina, floor, number, status, owner_name/phone, tenant_name/phone, rooms, area, car_plates, parking_spot, billing, discount_pct, household, pets, demo)`.
- Statuslar: **yasayir** (="sakin", köçüb yaşayır), bos, satilib, satisda, investor, fond.
- `km_charges` (hesablamalar), `km_payments` (ödənişlər). Borc = charges - payments.
- Bölmələr: Mənzil bazası (vizual bina xəritəsi), ödəniş/borc, müraciətlər, planlı texniki xidmət, parkinq, açar/kart/pult, qonaq keçidi (QR), gəlir-xərc, Excel ixracı, rezervasiya.
- Dizayn tokenləri: `--rust:#ba4d2c --esp:#251712 --cream:#f7f2ec`, Playfair + Inter, şüşə kartlar (blur), ipək fon.
- Açıq tab sessionStorage-da yadda qalır.
- **Online ödəniş:** Rabitəbank e-commerce (merchant/acquiring) açarları GÖZLƏNİLİR — hələ qurulmayıb. Sakin kartdan ödəsin, borc avtomatik bağlansın. Açarlar alınanda inteqrasiya ediləcək.

## 5. TƏCHİZAT (techizat.html, ayrı Supabase: syyybdouqdahsomfkemi)
- Material qiymət yoxlama: 15 mənbə (Tap.az, Lalafo, Qiymetleri, İnsaat, Tezbazar, Maqazin, Megamart, Omid, Boya, Kafel, Tvim, Elem, Orbi, Birmarket, Temir) + AI internet axtarışı.
- Təklif/smeta yoxlama (PDF/şəkil/Excel), brend kataloqu, bazar indeksi, qiymət xəbərdarlıqları, qənaət hesabatı.
- Başlıq: "Bazarla müqayisə et".

## 6. SATIŞ + MÜQAVİLƏ
- **satis.html**: satış lövhəsi (`lux_kv` key=lux_sales), mənzil statusları.
- **muqavile.html**: Türkanə İsmayılova üçün. `lux_contracts` cədvəli, avtomatik nömrə (LUX-2026-0001), arxiv axtarış, PDF müqavilə (alqı-satqı), ləğv/bərpa. İcazə: sales/contracts/archive.

## 7. LUX SAYT / 3D
- **3d.html**: Three.js bina (jsdelivr @0.160.0), WebGL yoxlaması (experimental-webgl fallback). Mənzil paneldə "🚶 İçində gəz" düyməsi.
- **16.11.2026 — Mərhələ 1 (satış ofisi konfiquratoru):** 3d.html-ə Bina 3–6 üçün qalan 4 plan izləndi (105=73,42; 113=134,33; 117=150,66; 119=174,53). İndi 6 tipdən 6-sı mərtəbədə divar+mebel ilə görünür, «İçəri bax» hamısında işləyir. Otaq sahələri rəsmi olmadığı üçün yeni planlarda göstərilmir. Növbəti: fotoreal interyer (Marble), pəncərədən real dron panoraması, gün vaxtı sürüşdürmə.
- **menzil-tur.html**: göz səviyyəsində 3D interyer gəzinti (modern mebel, PBR, WASD/joystick+toxunuş, otaq keçidləri). Three.js importmap jsdelivr.

---

## 8. İŞÇİLƏR / HESABLAR

### Xüsusi hesablar
- **Afiq Rəhmanov** (afiq.rehmanov@pilothayat.az) — sahibkar (ofis_owner, techizat). user_id: 85966bcb-0b24-49d3-860c-7c1e990ca1d6. İşçi kartı YOX.
- **Nihat Ömərov** (omrnihat@gmail.com) — IT/Marketinq mütəxəssis, sys icazə. emp_id=1, user_id: 52b4bdb3-bb32-4401-b15c-7ba4b0b000ba. İş saatı 12:00–18:00.
- **Rəhbər** (rehber@pilothayat.az / 123456) — HR rəhbəri, ofis_admin (plan təsdiqləyir).
- **Türkanə İsmayılova** (turkana@luxresidence.az / 123456) — sales/contracts/archive.
- **Fərid Ömərov** (farid.omerov@pilothayat.az / 123456) — Kreativ Direktor. İş saatı 12:00–17:00.
- **Raul Cavadov** (raul.cavadov@pilothayat.az / 123456) — Hüquqşünas.
- **Mirzə Süleymanlı** (mirze.suleymanli@pilothayat.az / 123456) — Ümumi şöbə mütəxəssisi.
- **Mina Sadıqova** — Ümumi şöbə müdiri (vəzifə adı; sistemdə sadə işçi, təsdiqləmir).

### Standart
- Yeni işçi parolu: **123456**.
- 23 aktiv işçi (əsas). Email formatı: ad.soyad@pilothayat.az.
- İşçi yaratma: auth.users + auth.identities + lux_profiles + office_employees (4 cədvəl).
- **Silinənlər:** İsa Qaraşov, Elgün Rəhmanov, Əli Rəhmanov, DEMO işçi.

---

## 9. ƏSAS SUPABASE FUNKSİYALARI (xülasə)
- `office_me()` — cari işçi id. `office_is_mgr()` — rəhbər (ofis_admin/owner). `office_user()` — ofis işçisi. `office_user_any()` — çat üçün. `lux_has_perm(p)` — icazə. `tz_norm(t)` — ad normallaşdırma (hər iki layihədə).
- `tg_notify(text)` — Telegrama göndər.

## 10. EDGE FUNKSİYALAR (avqchschbbltnnasabdm)
- **office-assistant** (v15) — AI assistent.
- **office-push-one** — tək işçiyə push (xatırlatma).
- **sys-monitor** (v4) — sys_alerts → push (yalnız admin/sahibkar/sys).
- **assistant-remind** (v2) — xatırlatma cron + səhər plan + broadcast.
- **cf-analytics** — Cloudflare trafik.

---

## 11. GÖZLƏYƏN İŞLƏR (pending)
- ⏳ Çatda **yeni mesaj bildirişi** (push/Telegram) — hələ yox.
- ⏳ **Rabitəbank online ödəniş** inteqrasiyası (açarlar gözlənilir).
- ⏳ API açarlarının **yenilənməsi** (rotate) — təhlükəsizlik.
- ⏳ 9 işçi bildiriş aktiv etməyib.
- ⏳ Native APK (ACCESS_BACKGROUND_LOCATION icazəsi).

## 12. İŞ PRİNSİPLƏRİ
- Dəyişiklikdən sonra: JS syntax yoxla (node --check), SW versiyasını artır, commit+push.
- HTML/JS Azərbaycan hərfləri: faylları `surrogateescape` ilə oxu/yaz.
- SQL funksiyalar: policy-dən əvvəl funksiya yarat.
- Həssas əməliyyat (silmə) əvvəl təsdiq al.
- Render/test üçün Playwright + stub luxAuth (CDN test mühitində bloklanır — jsdelivr real saytda işləyir).

---

## YENİLƏNMƏ — 3 oktyabr 2026 (bir çatda edilənlər)

**Çat (Instagram üslubu):** siyahı + otaq tam ekran, klaviatura uyğun (visualViewport), canlı qat (realtime `me-<uid>` kanalı + 6 san polling), yuxarı banner, push (trigger `trg_msg_push`), seçim rejimi/toplu sil-oxunmuş, Oxunmamış/Qruplar filtri, onlayn status (`office_presence`, `msg_ping`, `msg_presence`), "yazır…" (`msg_typing`), səsli mesaj (MediaRecorder → `chat` bucket `voice/`), fayl (`file/`), sürüşdürüb cavab, ❤️ animasiya, IG kontekst menyusu (`#igCtx`), redaktə/hamıdan sil 15 dəq (`msg_edit`,`msg_unsend`), sabitlə/ulduz/səssiz, status (`status_set`), qruplar (`office_groups`, `office_group_members`, `grp_*`, şöbə qrupları gecə `grp_sync_depts`). Göndərmə: `msg_send` RPC. Siyahı: `msg_threads` (DM + qrup).
**Zəng:** WebRTC, siqnal bazadan (`office_call_sig`, `call_sig`, `call_sig_get`), `office_calls`, `call_start/set/pending/get/diag`, edge `call-ice` (Cloudflare TURN — açarlar `office_secrets.turn_key_id/turn_key_token`). Push edge `office-push-one` (tag/url/important).
**Sosial:** hekayələr (`office_stories`, stikerlər), Lent (`office_posts` + `feed2`, karusel `media`, sorğu `poll`, paylaşma `shared_from`, klub `club_id`), reaksiyalar (`office_post_likes.emoji`, `post_react`), zəncirli şərh (`post_comment2`, `comment_like`), bildirişlər (`office_notifs`, `_notify`, `notif_*`), profil/izləmə/nişan (`soc_profile`, `soc_follow`, `office_badges`, `social_badges_check`), tədbirlər (`office_soc_events`, `ev_*` — köhnə `office_events` təqvim cədvəlinə toxunulmayıb), klublar (`office_soc_clubs`), albomlar (`office_soc_albums`), kəşf (`soc_explore`), ad günləri (`bday_upcoming`). Gündəlik cron `office-social-daily` → `social_daily2()` (ad günü, ildönümü, nişanlar, ayın ulduzu).
**Dizayn:** "Gün işığı" iOS glass qatı (ofis.html sonundakı CSS + `glassInit`), Bakı vaxtına görə fon (`tod-*`), mobil alt dock (`#dock`), avatar → profil vərəqi, geri düyməsi məntiqi (`backAct`). Performans üçün kartlarda blur YOXDUR.
**APK 2.0.0:** Capacitor 8 (API 36), imzalı release APK + Play AAB (secrets `ANDROID_KEYSTORE_*`, ehtiyat `office_secrets.android_upload_ks`), native `CallAudio` plugin (qulaqlıq/dinamik, yaxınlıq sensoru) `mobile/native/` + `capacitor:sync:after` hook. Birbaşa link: github.com/nhtomarr/luxresidence/releases/latest/download/bas-ofis.apk
**Play Console:** şəxsi hesab "Pilot Hayat CRM" yaradılıb, şəxsiyyət yoxlanışı gözlənilir → sonra qapalı test (closed testing) ilə yalnız işçilərə.
**SW versiyası:** ofis-v57.
**Gözləyən:** repo public → private etmək; tokenləri rotate (GitHub PAT, TURN, cf_token); Play qapalı test qurulumu.


## YENİLƏNMƏ — 4 oktyabr 2026: Sosial v3 (20 funksiya, ofis-v57)
Frontend ofis.html sonunda ayrıca `<style>`+`<script>` bloku ("SOSİAL v3"). Backend RPC-lər artıq bazada idi.
- Lent seqmentləri: 🏆 Komanda (`soc_digest`, `qotd_*`, `chal_*`, `eom_*`, `points_board`, `coffee_*`, `skill_search`), ❓ Suallar (`qa_*`), 🛡 Moderasiya (`rep_*`, `mod_*`, yalnız `_soc_mod`).
- "Hamısı": qarşılama (`onb_state`), elan (`ann_feed`/`ann_read`), günün sualı, xatirələr (`soc_memories`).
- Post: qaralama/planlı (`draft_*`, cron `social_tick`), çağırış (`post_add3`), statistika (`post_insights`, `post_seen`), şikayət.
- Hekayə: yaxın dostlar (`story_add3`, `cf_*`), önə çıxanlar (`hl_*`, `story_archive`). Profil: `soc_profile_x` (bacarıq, mentor, cf).
- Çat: video dairə (kind `vcircle`), 24 saat silinən mesaj/tema/ləqəb (`chat_style`, `chat_style_set`). `trg_msg_push`-a vcircle mətni əlavə edildi.
- Elanlar tabı (MGR): oxumayanlar + `ann_remind`.
- 4 okt: Bazarça interfeysdən silindi (ofis-v58); `office_market` cədvəli və `mk_*` RPC-lər bazada qalır.
- 4 okt: emoji ikonlar xətti SVG ikonlarla əvəz edildi (ofis.html sonunda 'UI İKONLARI' bloku: MutationObserver emoji→SVG, istifadəçi məzmunu — mesaj, post, reaksiya — toxunulmur; `uiIcon(name)`). Salamlama saat 00–05 üçün düzəldildi. ofis-v59.

## YENİLƏNMƏ — 4 oktyabr 2026: Sosial v4 (10 funksiya, ofis-v60)
- Xal: ümumi hesablama `_pts_calc(uid,t0,t1)` (+ `office_pts_bonus`), səviyyə `_lvl`, `lvl_map`. `points_board`-a bonus əlavə edildi.
- 🎁 Xal mağazası: `office_rewards`, `office_redeems`, `shop_state/buy/decide/reward_save` (rəhbər təsdiqi, rədd → xal qaytarılır). Lent → Komanda → kart.
- 🔥 Seriya: `streak_state` (vaxtında gəliş + günün sualı, həftəsonu qırmır), 7/30/100 nişan+bonus `social_daily4`.
- 🏆 Şöbələr liqası: `league_state`, `_league_close` (B.e. cron `social_weekly2`). DİQQƏT: hazırda hamı 1 şöbədədir (Mərkəzi ofis) — liqa üçün şöbələr ayrılmalıdır.
- 🎮 Əyləncə seqmenti: canlı viktorina (`office_quiz*`, `quiz_*`, 20 san/sual, deep link ?quiz=), səsli otaqlar (WebRTC mesh, `office_room*`, `room_*`, ?room=), "Bu kimdir?" (`guess_next/answer`, gündə 10, +3), anonim kompliment (`comp_*`, həftədə 1, moderasiya).
- 🎉 Satış: `lux_contracts` insert trigger `contract_sale_t` → Lent post (kind sale) + push; klientdə konfetti.
- 📊 Wrapped: `wrapped(month)`, Lentdə 25-dən 5-nə banner, ayın 1-i push, Lentdə şəkil kimi paylaşma.
- 4 okt: Hekayə baxıcısı Instagram üslubunda yenidən yazıldı (ofis-v61): canlı saniyə sayğacı (`stoAgo`), basıb saxla = pauza, yuxarı sürüşdür = baxanlar (öz) / cavab (başqası), aşağı sürüşdür = bağla, sağ/sol sürüşdürmə, cavab mesajı + ürək, ⋯ menyu. Baza: `_storyShow0` əvəz edildi.
- 4 okt: Lent Instagram üslubunda (ofis-v62): kənardan-kənara post, 4:5 media, ♡/💬/🔁/➤ sayları ilə + 🔖, altyazı, 'Bütün N şərhə bax', avatar ətrafında hekayə halqası, videolar səssiz avtomatik oynayır (🔇/🔊). Base `_postCard0` əvəz edildi. Hekayə cavab sahəsi klaviatura açılanda gizlənirdi — düzəldildi (`svType`, visualViewport).
- 4 okt (ofis-v63): tam ekran media baxıcısı `mediaView` (pinch/iki toxunuş zoom, sağ-sol, aşağı sürüşdür bağla; chatViewImage əvəz edildi; lentdə tək toxunuş açır, iki toxunuş ❤️). Çatda hekayə reaksiyası/cavabı IG kartı (story_view indi kind='story_react' + image_url yazır), paylaşılan post kartı (post_get). Statistika: `soc_insights(days)` — profildə '📊 Statistika', öz postun altında 'Statistikaya bax'. Geri düyməsi baxıcıları bağlayır.
- 4 okt (ofis-v64) IG paritet: şəkil sıxma (chatUpload → imgCompress 1600px/JPEG .82), lazy img, sonsuz lent (feed2 p_before) + skelet + yuxarı çək-yenilə; səhifə yığını `pgPush/pgPop` (geri düyməsi); profil tam səhifə (qeyd balonu, səviyyə çərçivəsi, Postlar/Reels/İşarələnən, izləyici siyahısı `follow_list`, `posts_tagged`); post səhifədə açılır; lent seqmentləri sadələşdi (Hamısı/İzlədiklərim + ⊞ Bölmələr); Reels tabı; Kəşfdə vahid axtarış `soc_search`; post redaktə `post_edit`, kəsmə 1:1/4:5 + 7 filtr; hekayə redaktoru (kamera/qalereya/yazı fon, sürüşdürülən yazı, @qeyd, stiker, zibil qutusu); DM: söhbətdə axtarış, media/fayl/link qalereyası, yönləndirmə; bildirişlər qruplaşdırılır (Bu gün/Bu həftə, "X və N nəfər", "Sən də izlə"); şərhlər: emoji zolağı, sabitləmə `comment_pin`, silmə `comment_delete`, basıb saxla menyu; Notes `note_set/note_list`; `lvl_map` 1 saatlıq keş; otaq açılışında hamıya push ləğv; video dairə güzgü düzəldi.
- Qalan: ofis.html-in modullara bölünməsi, qaranlıq rejim, GIF, qruplarda "kim gördü", şəkildə insan işarələmə, hekayə musiqisi, repo private.
- 4 okt (ofis-v65): bütün pəncərələr (sheet) aşağı çəkilərək və ya boş fona toxunaraq bağlanır; mbox sürüşdürmə düzəldi.
- 4 okt: Statistika düzəlişi — baxış/əhatə artıq `_pv(post)` ilə hesablanır (baxış ∪ reaksiya ∪ şərh ∪ saxlama, müəllif xaric). post_insights və soc_insights yeniləndi.
- 4 okt (ofis-v67): çatda qarşı tərəfin avatarına və başlıqdakı ada toxunanda profil səhifəsi açılır (qrupda — mesajı yazanın profili).
- 4 okt (ofis-v68) IG +10: reaksiya verənlər siyahısı (post_likers, emoji filtrli), profildə ümumi izləyicilər (soc_mutuals), lentdə 'Sizin üçün təkliflər' karuseli, 'Hamısını gördün' (3 gün), postu arxivlə + Arxiv səhifəsi (feed2 'archive'), şərhləri söndür / reaksiya sayını gizlət (post_settings; office_posts.archived/no_comments/hide_likes), postu hekayəyə paylaş (stiker type=post), hekayə link stikeri + sürətli emoji reaksiyaları, səsli mesaj sürəti 1×/1.5×/2×, profil QR kodu (?u= deep link). 'redaktə edilib' etiketi.
- 4 okt (ofis-v69): IG jestləri — Çat siyahısında sağa/sola sürüşdürmə → Lent; Lentdə sola sürüşdürmə → Çat; çat otağında sol kənardan sağa → siyahıya qayıt.
- 4 okt (ofis-v70) Sosial +15: edge `soc-ai` (Whisper səs→mətn, office_messages.transcript; gpt-4o-mini post yazısı təklifi); hekayə stikerləri addyours (`addyours_count`), geri sayım (`cd_remind/cd_state`, social_tick push), emoji slayder (story_answer); hekayədə qeyd → çatda "Hekayənə əlavə et" (kind story_mention); ⚡ Ofis anı (`office_moment_day/office_moments`, `moment_state/moment_post`, iş günü 10:00–17:00 təsadüfi push, ön+arxa kamera); şəkildə işarələmə/məkan/birgə müəllif (`post_meta`, `collab_answer`; office_posts.tags/place/collab); profildə 3 sabit post (`post_profile_pin`, ppin); səssizləşdirmə + Favorilər lenti (`office_user_mutes`, `office_favs`, feed2 'favs'); Kanallar (`office_channels*`, `ch_*`, ?ch=); qruplarda "Görüldü" + çoxlu reaksiya (`grp_extra`, `grp_react`, office_msg_reacts); canlı yayım (office_rooms.kind='live', `live_*`, office_live_chat, ?live=); qaranlıq rejim (html.dark filter, Profil ☰ → Görünüş).
- 4 okt (ofis-v71): önə çıxanlar baxıcısı yenidən yazıldı (`hlView` → toxun/saxla/aşağı sürüşdür bağla, geri düyməsi, sahibə 'Fəaliyyət · N' baxanlar — `hl_meta(id)` media_url ilə hekayəni tapır). Səhifələrdə (post/profil/kanal) yana sürüşdürmə → geri (pgPop).
- 4 okt (ofis-v72): öz postunda IG zolağı '👁 N · Statistikanı gör' + 'Hekayədə paylaş' (media ilə düymələr arasında); _post_json 'views' (yalnız müəllifə).
- 4 okt (ofis-v73): Şərhlər pəncərəsi IG üslubu — mərkəzdə başlıq, sağda ♡+say, 'Cavab ver', cavablar yığılır ('— N cavaba bax'), 'Müəllif' nişanı, altda emoji zolağı + avatarlı 'X üçün şərh yaz…' sahəsi.
- 4 okt (ofis-v74): önə çıxanı basıb saxla → Bax / Adını dəyiş (`hl_rename`) / Sil. Paylaşım IG kimi: pəncərə dərhal bağlanır, yuxarıda miniatür + real faizli rəngli yükləmə xətti (XHR storage upload, `upXhr`, `upBar`), xəta olsa 'Yenidən'. Post və hekayə üçün.
- 4 okt (ofis-v75): Android WebView 'image/*,video/*' qarışıq accept ilə fayl seçicini açmırdı. HTMLInputElement.click yamağı: tətbiqdə (isNative) əvvəl 'Şəkil / Video' seçimi, sonra tək MIME ilə açılır. Post, hekayə, albom hamısına aiddir.
- 4 okt (ofis-v77): Post yaratma sadələşdi (IG): yuxarıda 'Şəkil və ya video əlavə et' sahəsi, avatar + yazı (klaviatura avtomatik açılmır), kiçik düymələr (AI, #, Qaralamalar), siyahı: İşarələ/Məkan/Birgə/Sorğu/Çağırış/Vaxt (seçilən dəyər sağda göy), altda Qaralama + Paylaş.
- 4 okt (ofis-v78): səhifə sürüşdürməsi — yalnız həqiqətən yana sürüşən sətirlər (karusel, uzun nişan siyahısı) istisnadır; profildə hər yerdən geri işləyir.
- 4 okt (ofis-v79): Post '⋯' menyusu IG üslubunda yenidən qurulub (yuxarıda 3 dairəvi düymə: Saxla/Göndər/Hekayəyə; qruplaşmış siyahı, vahid xətti ikonlar, Sil/Şikayət qırmızı ayrıca qrupda). Bütün .igmenu-lar sola düzləndi.
- 4 okt (ofis-v80) Mavi tik + Sosial +15 (2): `office_verified` (Nihat Ömərov), `verified_list/verify_set` (yalnız sys), klientdə ada avtomatik IG nişanı (vMark). Söhbət sabitləmə (`chat_pin/chat_pins`, 3-ə qədər); planlı mesaj (`office_msg_sched`, `msg_schedule`, social_tick→`_msg_tick`); qrup video zəngi (office_rooms kind='gcall', `gcall_start/gcall_active`, ≤4, ?gcall=); məxfilik (office_social_profile.hide_seen/hide_online, _msg_json və msg_presence patch); brend stikerləri (kind='sticker', SVG data-URI, şərhdə ⟦st:id⟧); mesaj xatırlatma (`office_msg_remind`, `msg_remind`); hekayə kollajı, kviz stikeri, tətbiq daxili video/bumeranq çəkmə; hekayə xatirələri (`story_memories`); AI tərcümə (soc-ai op=translate, "Tərcüməyə bax"); saxlanılan kolleksiyalar (`office_save_coll`, office_post_saves.coll_id, feed2 saved+arg); Fəaliyyətin (`office_activity`, `act_ping`, `my_activity`, gündəlik limit); sakit rejim (quiet_until, `_office_push` susdurur — important xaric, trigger `quiet_reply_t` avtomatik cavab kind='auto'); profildə Zəng/WhatsApp/E-poçt (`soc_contact`).
- 4 okt (ofis-v82): səhifələrdə (profil, post, kanal, arxiv, fəaliyyət, Ofis anı) yuxarıdan aşağı çəkib yeniləmə (`pgRefresh`).
- 4 okt (ofis-v83): profildə nişan sətri gizlədildi; avatarın altındakı səviyyə yazısı 'Yeni · 🏅N' — toxunanda 'Nişanlar və səviyyə' pəncərəsi (bdOpen, nişan izahları).
- 4 okt (ofis-v84): Qəhvə tanışlığı ləğv edildi — Komandadan kart, onboarding addımı, profil ayarı silindi; social_weekly cütləşdirmə etmir; hamının coffee=false. Cədvəllər (office_coffee) toxunulmayıb.
- 4 okt (ofis-v85): Lent təmizliyi (IG) — 'Hamısı'da hekayələrdən dərhal sonra postlar; Ofis anı/xülasə/günün sualı/elanlar/ilk addımlar/xatirələr kiçik sürüşən 'bu gün' kartlarına yığıldı (tdCards, toxunanda pəncərədə açılır); yazı paneli əvəzinə başlıqda ⊕; saxlanılanlar ikonu başlıqdan çıxdı (Bölmələrdə var); satış/təşəkkür reytinqləri Komandaya köçdü.
- 4 okt (ofis-v86) SÜRƏT: Lent 'bu gün' kartlarının observer-i bütün body-ni izləyib hər 150 ms-də zolağı yenidən çəkirdi (sonsuz dövr → donma) — düzəldi (yalnız #soX3, dəyişməyəndə yazmır). Pəncərələr (modal z 720) indi Reels/hekayə redaktoru/canlı yayımın üstündə — Reels-də şərhlər arxada açılırdı. Şərhlər dərhal skelet+keşlə açılır. Reels videoları yalnız cari/qonşu yüklənir. Saat yalnız 'Bu gün' görünəndə yenilənir. Emoji→ikon observer çat mesajlarını və şərhləri keçir. Minifikasiya yoxlanıldı: JS/CSS onsuz da yığcamdır (cəmi ~7% qazanc), build addımı əlavə edilmədi.
- 4 okt (ofis-v87): video sıxma `vidCompress` — 6 MB-dan böyük videolar yükləmədən əvvəl 720p (maks. tərəf 1280), ~1.8 Mbit/s MP4 (və ya WebM) yenidən kodlanır (canvas.captureStream + MediaRecorder, real vaxtda). Post, hekayə və çat videolarına aiddir; yükləmə zolağında 'Video sıxılır… %'. Test: 4 MB → 354 KB.
- 4 okt (ofis-v88): Reels 🔖 saxla dərhal (optimistik): ikon dolur, 'Saxlanıldı' bildirişi, xəta olsa geri qaytarılır (`reelSave`).
- 4 okt (ofis-v89): 'Həftənin anı' kartında video postun önizləməsi (əvvəl video URL <img>-də sınıq görünürdü).
- 4 okt (ofis-v90): 'Həftənin anı' böyük kartı lentdən çıxdı, 'bu gün' kartları zolağına keçdi (fonunda postun şəkli; video olsa gradient + ikon).
- 4 okt (ofis-v91) PERFORMANS: profilə görə render vaxtı (6x zəif CPU) 4.5 san → 2.8 san (-38%). Başlıq/tablar/toast/kontekst menyusundan backdrop-filter blur çıxarıldı (sürüşdürmədə hər kadr yenidən bulanıqlaşdırırdı), sonsuz box-shadow pulsasiyaları söndürüldü, lent postlarına content-visibility:auto. Video: posteri olmayan videolara şəffaf poster + tünd fon (boz fon/qara play ikonu yox), yeni yüklənən videolar üçün ilk kadrdan poster yaradılır (media.poster, `vidPoster`), Reels-də də.
- 4 okt (ofis-v92): açılışda ~25 paralel RPC 6 bağlantı limitində növbəyə düşüb çatı 'Yüklənir…'də saxlayırdı → sorğu planlayıcısı (sb.rpc wrapper): çat/lent/post kimi vacib sorğular dərhal, ikinci dərəcəlilər (lvl_map, verified_list, live_list, note_list, moment_state və s.) vacib sorğu olmayanda maksimum 2 paralel. Bütün posterisiz videolara şəffaf poster (böyük qara play ikonu yox), profil şəbəkəsində video posteri.

## ⚠️ YENİ FAYL QURULUŞU (4 okt, ofis-v93) — redaktə buradan
ofis.html artıq ~16 KB-lıq qabıqdır (HTML markup). Kod ayrıca fayllardadır:
- `assets/ofis-app.css` — bütün CSS (əvvəlki 27 <style> bloku, eyni sırada)
- `assets/ofis-a.js` — əsas tətbiq (əvvəlki 1-ci inline skript: Bu gün, çat, tapşırıqlar, sosial v1…)
- `bg.js` — (dəyişməyib)
- `assets/ofis-b.js` — qalan hamısı (sosial v2…v4, IG funksiyaları, ikonlar, sürət yamaqları — əvvəlki 36 inline skript ardıcıl birləşdirilib)
Hamısı `defer` ilə, sıra: qrcode → ofis-a → bg.js → ofis-b. Yeni kod ofis-b.js sonuna əlavə edilir.
Versiya: ofis.html-də `?v=NN` və ofis-sw.js-də `C='ofis-vNN'` + `V='NN'` birlikdə artırılmalıdır.
SW: /ofis əvvəlcə keşdən (dərhal açılış), arxa planda yenilənir; ofis-a/b/app.css/bg.js keşdən (versiya ilə), install-da əvvəlcədən keşlənir.
XLSX (900 KB) artıq açılışda yüklənmir — yalnız 'Planlar' açılanda və ya Excel ixracında.
DİQQƏT: ofis-b.js tək fayl olduğundan yuxarı səviyyədə `function X(){}` elanı bütün fayla hoist olunur — mövcud funksiyanı əvəz etmək üçün həmişə `X=function(){}` yaz, yeni ad seçərkən toqquşmaya bax (livePoll toqquşması: v70-dən bəri çat/bildiriş canlı yenilənməsini sındırmışdı, canlı yayımınkı lvPoll adlandırıldı).
- 4 okt (ofis-v94): yuxarı 'Baş Ofis' başlığının şüşə (blur) görünüşü geri qaytarıldı (v91-də qeyri-şəffaf zolaq kimi görünürdü); blur yalnız bu başlıqda saxlanıldı.
- 4 okt (ofis-v95): profil skeletdə ilişirdi — planlayıcı 'aşağı prioritet' növbəsində soc_profile_x/lvl_map/note_list gözləyirdi; istifadəçinin açdığı ekranların sorğuları növbədən çıxarıldı, aşağı prioritet slotları 6 san sonra mütləq boşalır (asılı qalan sorğu növbəni bloklamır).
- 4 okt (ofis-v97) TAM AUDİT: bütün 30 ekran/hərəkət 4x zəif CPU + böyük məlumatla (300 mesaj, 30 post, 40 söhbət, 50 bildiriş) ölçüldü. Düzəlişlər: (1) lux-auth.js — bütün Supabase sorğularına 25 san limit (yükləmə/AI xaric), asılı qalan şəbəkə artıq heç bir ekranı dondurmur; (2) çat açılanda son 80 mesaj çəkilir, '↑ Əvvəlki mesajlar' ilə qalanı (300 mesajda 579→204 ms); (3) chat_style gələndə bütün çatın ikinci dəfə çəkilməsi ləğv edildi.
- 4 okt (ofis-v99) IG uyğunluğu: sürüşdür-geri hər yerdə (Lent bölmələri → Hamısı, Daha altındakı ekranlar → ana, çat otağı sol 70px, Reels/viktorina/canlı yayım izləyicisi sol kənardan) — 8 ssenari avtomatik test olundu. Kəşf IG şəbəkəsi (3 sütun, hündür kafellər, axtarış yuxarıda, trend #mövzular). Profil: İzlə | Mesaj | Əlaqə (Zəng/WhatsApp/E-poçt), 🙌 və QR ⋯ menyusunda. CSS toqquşması: .igcol (birgə müəllif banneri) çat mesaj sütunlarına bənövşəyi fon verirdi — .igpost daxilinə məhdudlaşdırıldı.
- 4 okt: Xəta xəbərdarlıqlarında 'file:///…2otaq-111.64.htm pushState SecurityError' — kimsə luxresidence.az mənzil səhifəsini kompüterə yükləyib fayl kimi açıb. Düzəliş: index/ru/3d/admin və lux-auth xəta göndəricisi yalnız öz domenlərimizdə (pilothayat.az, luxresidence.az, pages.dev, localhost) işləyir; index.html-də pushState qoruyucusu (alınmasa #apt-104 hash-a keçir).

## TİKİNTİ NƏZARƏTİ (5 okt 2026) — /tikinti (tikinti.html)
Anbar, mədaxil, məxaric, smeta (plan/fakt), hesabat. Supabase avqch… layihəsi, cədvəllər `tk_objects, tk_materials, tk_suppliers, tk_smeta, tk_moves, tk_move_lines` (RLS bağlı, yalnız RPC).
RPC: `tk_catalog, tk_stock (orta çəkili qiymət), tk_dash, tk_moves_list, tk_move_save (məxaricdə qalıq yoxlaması, qiymət=orta), tk_smeta_view (fakt = obyektə məxaric, smeta maddəsi və ya materiala görə), tk_save, tk_delete, tk_demo_clear`.
İcazələr (admin.html PERM_LIST): `tikinti` (rəhbər — hər şey, silmə, smeta), `tikinti_anbar` (anbardar — mədaxil/məxaric, baxış); is_admin və `sys` də girir. Admin panelində 'Tikinti ↗' linki.
Nümunə məlumat (demo=true): Bina 4/5, 10 material, 3 təchizatçı, 12 smeta sətri, 7 əməliyyat — İcmalda 'Nümunələri sil'. Qaimə şəkilləri `chat` bucket-də `tikinti/` qovluğu. Smeta Excel idxalı: Bölmə · Ad · Vahid · Miqdar · Qiymət.
- 5 okt: ⚡ Ofis anı tamamilə ləğv edildi (social_tick artıq _moment_tick çağırmır — gündəlik push yoxdur; Lentdə kart/banner, Bölmələrdə bölmə yoxdur). Cədvəllər (office_moments) toxunulmayıb.
- 5 okt: KOMENDANT → yeni 'Təhvil-təslim' bölməsi (staff). Cədvəl `km_handover` (unit_id PK; category alici/sakin/mtk/fond/barter, person, phone, handed+handed_at, keys, meter, libetka, fobs, repair, note) + `km_handover_log` (trigger ilə dəyişiklik tarixçəsi). RLS: km_staff() hamısı, sakin öz mənzilini oxuyur. Excel 'Təhvil_təslim_yeni.xlsx' (Bina 3/4/9, 262 mənzil) idxal olundu — hamısı (bina, mərtəbə, pos) ilə uyğunlaşdı; boş olan km_units.area (63) və owner_name/phone (151) Exceldən dolduruldu. UI: bina seçimi, KPI-lar, kateqoriya filtrləri, Xəritə/Siyahı, siyahıda checkbox ilə dərhal qeyd, redaktə pəncərəsi + tarixçə, '🖨 Akt' (təhvil-təslim aktı çapı), Excel ixrac. ALL_UNITS istifadə edir (MTK/Fond mənzilləri də görünür).
- 5 okt: KOMENDANT → Təhvil-təslim AKTI modulu. Cədvəl `km_acts` (no TT-B{bina}-{0001}, act_date, person, phone, id_doc, meters{elec,water,gas,heat}, items{keys,fobs,intercom,remote,libetka}, checks[{label,ok,note}], remarks, photos[], sign_receiver/sign_staff (PNG URL, chat bucket acts/), staff_name, request_id); dəyişdirilmir (yalnız insert RPC ilə). RPC `km_act_save(p)`: nömrə (bina üzrə advisory lock), irad varsa km_requests (category diger, priority normal) açır, km_handover-i yeniləyir (handed, tarix, açar, brelok, libetka, sayğac). UI: mənzil pəncərəsində '📝 Akt tərtib et' (sayğaclar, təhvil verilənlər, 11 bəndlik yoxlama siyahısı, foto, 2 barmaq imzası), nəticədə '🖨 Çap/PDF' və '💬 WhatsApp', '📄 Aktlar' arxivi (axtarış), mənzildə imzalanmış aktların siyahısı.
- 5 okt: Təhvil-təslim aktına SMS OTP: `km_otp` (bcrypt hash, 5 dəq, 3 cəhd, 10 dəq-də ≤3 göndərmə), `km_otp_send/km_otp_verify`, `km_sms_config` (tək sətir: enabled, method GET/POST, url şablonu {phone}{text}{sender}, headers, body, sender; pg_net ilə göndərilir; söndürülü olanda TEST rejimi — kod ekranda). km_act_save otp_id yoxlayır, aktda otp_phone/otp_verified_at/otp_registered/otp_test. Ayarlar → 'SMS xidməti' kartı (admin/sys, km_sms_config_get/set). SMS mətni latınca ASCII (1 SMS seqmenti).
- 5 okt: SMS provayderi 1sms.az (POST https://1sms.az/api/v1/sms/otp, X-API-Key, body {to:+994..., text, senderName:'OTP 1SMS'}). km_sms_config əvvəlcədən dolduruldu (enabled=false, açar gözlənilir). Hesab hələ provayderdə TEST rejimindədir — yalnız +994558800211-ə göndərir. Ayarlarda 'API açarı' sahəsi; km_otp.req_id + `km_otp_diag` (pg_net cavabı) — göndərmə xətası komendanta göstərilir.
- 5 okt: Akt OTP ilə imzalandıqdan sonra həmin nömrəyə təşəkkür SMS-i: km_sms_config.after_text ('LUX Residence: Akt tesdiq olundu, xeyirli, ugurlu olsun!'), `_km_sms_send(phone,text)` köməkçi, km_acts.thanks_req. Ayarlarda redaktə olunur. 1sms.az-da 2-ci şablon kimi təsdiq tələb olunur.
- 5 okt: OTP qeydiyyatda olmayan nömrəyə də gedir (1sms.az şablon rejimi aktiv: təsdiqli şablon istənilən nömrəyə, 050 695 00 88-ə 2 SMS 'Çatdırıldı'). Yeni nömrə təsdiqlənəndə km_handover.phone-a yazılır; qırmızı xəbərdarlıq yumşaq qeydlə əvəzləndi.
- 5 okt: Təhvil-təslim UX: mənzil və akt pəncərələri kənara toxunanda/Esc ilə bağlanmır (yalnız ✕; window._mLock, silkələnmə animasiyası); MTK və təhvil verilməmiş mənzildə toxunanda birbaşa akt forması açılır; mənzil pəncərəsində yazılan ad/telefon akta ötürülür; aktda 'Kateqoriya (təhvildən sonra)' — MTK üçün avtomatik 'Alıcı', km_act_save category-ni km_handover-ə yazır.
- 5 okt: 1sms.az: məhsul API-si olmadığı üçün 2-ci şablon (təşəkkür) hələ verilmir — after_text boşaldıldı, km_act_save boş olanda göndərmir. Təbrik WhatsApp mesajına əlavə edildi ('💬 Təbrik + akt'). Provayder açanda Ayarlarda mətni yazmaq kifayətdir.
- 5 okt (ofis-v101): Çıxış unudulanda: 'Bu gün'də iş vaxtı+15 dəq sonra (və son 14 günün çıxışsız günləri üçün) narıncı kart 'çıxış qeyd olunmayıb · Sorğu göndər' (saat + səbəb). Cədvəl `office_att_fix` (unique employee+day), RPC `att_fix_state/att_fix_request/att_fix_list/att_fix_decide` (təsdiq → office_attendance.check_out, worked_min, early_min, qeyd). Rəhbərlər (ofis_admin/owner və ya manager_id) 'Bu gün'də 'Çıxış sorğuları' kartı + push. `_att_out_remind` (social_tick): iş bitəndən 30 dəq sonra çıxış etməyənə bir dəfə push.
- 5 okt: Gültəkin Məmmədzadə (gultekin.memmedzade@pilothayat.az) hesabına 'komendant' icazəsi. Akt: təhvil verən sabit — km_config.act_giver_name/title/sign ('Gültəkin Məmmədzadə', 'Satış Direktoru', müvəqqəti yaradılmış SVG imza); formada komendant imza sahəsi yerinə hazır imza, yalnız təhvil alan imzalayır; km_acts.staff_title; çapda 'Satış Direktoru Gültəkin Məmmədzadə'. Real imza gələndə km_config.act_giver_sign dəyişdirilir.
- 5 okt: Akt silmə — `km_act_delete(id,reason,revert)` (admin/sys/komendant_kassa), silinən akt `km_acts_deleted`-də arxivlənir, 'new' statuslu müraciəti silinir, başqa aktı yoxdursa mənzil 'təhvil verilməyib'ə qaytarılır. Nömrələmə max(no)+1 (silinmədən sonra toqquşma yoxdur). UI: Aktlar siyahısında və mənzil pəncərəsində 🗑. Test aktı TT-B3-0001 (Bina 3 · 16-5) silindi, mənzil MTK/verilməyib vəziyyətinə qaytarıldı.
- 5 okt: yeni icazə `komendant_akt` (aktları silmək), admin PERM_LIST-ə əlavə; Gültəkin Məmmədzadəyə verildi.
- 5 okt (ofis-v102): çıxış kartı bu gün üçün: 'Hələ işdəyəm' (bu gün üçün gizlət, localStorage afx_stay) və 'Çıxmışam' (sorğu); gözləyən sorğunu işçi özü 'Ləğv et' edə bilər (`att_fix_cancel`). Nihat-ın səhv sorğusu silindi.
- 5 okt (ofis-v103): bu gün üçün gözləyən çıxış sorğusu varsa 'Çıxışı qeyd et'/'Qısa çıxış' düymələri gizlənir, yerində '⏳ Çıxış HH:MM — sorğu təsdiq gözləyir'.
- 5 okt: `_tg_user(uid,text)` — şəxsi Telegram (office_tg_links.chat_id / office_employees.tg_chat_id, office_secrets.tg_token). Çıxış sorğusu (rəhbərlərə), təsdiq/rədd (işçiyə) və 30 dəq xatırlatma artıq push + Telegram göndərir. Qeyd: əl ilə SQL ilə edilən təsdiqlər bildiriş göndərmir — həmişə att_fix_decide istifadə et.
- 10 okt (ofis-v105) ÇOXLU İŞ YERİ: cədvəl `office_locations` (id, name, lat, lng, radius_m, static_qr, qr_secret, active, sort) — 1 = LUX Satış ofisi, 2 = LUX Köçürmə ofisi (konumlar Ayarlar → İş yerləri-ndən təyin edilir). Baş Ofis əvvəlki kimi `office_config`-dədir (location_id = NULL). `qr_secret` sütununa klientdən select icazəsi YOXDUR (sütun səviyyəli grant) — həmişə açıq sütun siyahısı ilə seç. `office_employees.location_id`, `office_attendance.location_id`. QR kodu: Baş Ofis `<16hex>`, iş yeri `<id>.<16hex>`. RPC: `office_qr_token/static/rotate(p_loc default null)`, `office_site_of(emp)`; `office_check` iş yerinin öz konumu/radiusu ilə yoxlayır, işçi yalnız öz iş yerinin QR-ı ilə (rəhbər istənilən), Telegram-da iş yerinin adı; `office_geo_dist` və `office_outing_end` işçinin öz iş yerinə görə. UI: Ayarlar → İş yerləri (konum, radius, 🖨 Çap QR, 🖥 Ekran QR, ↻ yenilə), işçi kartında "İş yeri", Davamiyyətdə iş yeri filtri + 📍 nişan, Excel-də iş yeri sütunu. Ekran QR linki: `/ofis?qr=1&qrloc=ID`. SQL: supabase/migrations/20261010_office_multi_locations.sql.
- 10 okt (ofis-v106) LUX BRENDİ: işçinin iş yeri adında "LUX" varsa (və sahibkar deyilsə) `applyBrand()` → body.lux (terakota palitrası, ofis-app.css sonunda 'LUX RESIDENCE işçiləri' bloku), başlıq "LUX Residence · <iş yeri>", səhifə adı. localStorage `ofis_brand=lux` — növbəti açılışda yüklənmə ekranı da LUX (ofis.html-də kiçik inline skript). Manifest/APK adı "Baş Ofis" olaraq qalır.

## VMM Ofis (16 oktyabr 2026)
- Baş Ofisin tam nüsxəsi VMM (Viking, Maro, Marox) üçün, fərqli dizaynla: **https://vmm-ofis.netlify.app** (müvəqqəti test linki, Netlify `vmm-ofis`).
- Baza hələlik eyni Supabase-dədir, amma ayrıca **`vmm` sxemində** (124 cədvəl, ~360 funksiya, RLS, trigger, cron `vmm-*`, bucket `vmm-*`, edge `vmm-*`). Pilot məlumatı ilə qarışmır. Sonra yeni Supabase hesabına köçürüləcək.
- Mənbə: `vmm/` (build.py Baş Ofis kodundan yığır + `vmm/overlay`). `/vmm/*` luxresidence.az-da 404 verir.
- Admin: Nihat (omrnihat@gmail.com, eyni parol). Şöbələr: Viking, Maro, Marox. Tək QR (iş yerləri bölməsi gizlidir). Ofis koordinatı hələ təyin edilməyib (yer yoxlaması söndürülüb).

## VMM Ofis — Cloudflare-ə köçürmə (21 oktyabr 2026)
- Netlify kredit limiti bitdiyi üçün VMM Ofis Cloudflare Worker `vmm-ofis`-ə köçürüldü. Domen: **https://ofis.vmm.az** (həmçinin vmm.az, www.vmm.az). vmm.az zonası Cloudflare-də (NS: glen/molly.ns.cloudflare.com, domen online.az-da).
- Yükləmə: `python3 vmm/build.py <versiya>` → `cd vmm && npx wrangler deploy` (konfiq: `vmm/wrangler.jsonc`).
- VMM-də səsli assistent söndürülüb. Responsivlik: owner/rəhbər "İşçilər" cədvəli səhifəni enə dartırdı — `vmm-theme.css`-də minmax(0,1fr)/min-width:0 düzəlişi. Baş Ofisdə də eyni problem var (hələ düzəldilməyib).
- Azad (azad@vmm.az) tam admin edildi (is_admin + sys).

## ƏMƏK MÜQAVİLƏLƏRİ (27 oktyabr 2026, ofis-v110)
- Mənbə: e-gov əmək müqavilələri reyestrinin Excel ixracı (qrupun 23 şirkəti/fiziki şəxsi, 238 müqavilə). İstifadəçinin qərarı: yalnız **paneldə olan işçilər** üçün məlumat əlavə edilir, qalanlar idxal olunmur.
- Cədvəl `office_hr_contracts` (employee_id, grp, employer, kind, doc_no UNIQUE, doc_type, status, fin, id_serial, ssn, birth, salary, position, base_start, signed, start_date, end_date, place Əsas/Əlavə, regime, vac_days). RLS açıq, policy YOX, anon/authenticated üçün grant YOX — yalnız RPC.
- Giriş: `office_hr_ok()` = ofis_owner / sys / **ofis_hr** (+ is_admin). `rehber@pilothayat.az`-a `ofis_hr` verildi. RPC: `hr_can()`, `hr_emp(p_emp)`, `hr_list()`. Yoxlanıb: adi işçi → "İcazə yoxdur", birbaşa cədvəl → permission denied, anon → permission denied.
- İdxal: ad (ilk 2 söz, İ/ı, e/ə normallaşdırma) + doğum tarixi ilə uyğunlaşdırma → 40 işçiyə 51 müqavilə. Rədd edilən səhv uyğunluqlar: "Laçın Rəhmanov" (≠ Yalçın), "Elşən Məmmədov" (≠ Elşən Əhmədov). "Rəfail Mirzəyev" müqavilələri id=17-yə (passiv) bağlandı — id=60 "Rəfael Mirzəyev" (aktiv, Köçürmə) eyni şəxs ola bilər, yoxlanmalıdır.
- office_employees yeniləndi (əsas müqavilədən: Əsas yer, son imzalanan): birthday (boşdursa), hire_date = əsas müqavilənin başlama tarixi, leave_days = məzuniyyət günü, contract_end = bitmə tarixi (yalnız gələcəkdədirsə). Mövcud "müqavilə bitir" (30 gün) xatırlatmaları bundan işləyir.
- **Həssas məlumat repoya YAZILMIR** — data yalnız bazadadır; repoda yalnız sxem (`supabase/migrations/20261027_office_hr_contracts.sql`).
- UI (ofis-b.js sonu, 'ƏMƏK MÜQAVİLƏLƏRİ' bloku): işçi kartında (openEmp wrapper) "Əmək müqavilələri" bloku — şirkət, Əsas/Əlavə, vəzifə, maaş, tarixlər, rejim, məzuniyyət, sənəd №; FİN/vəsiqə/SSN gizli (son 4 rəqəm), "Göstər" ilə açılır. Ştat səhifəsində "İşçilər" başlığında "Əmək müqavilələri" düyməsi → siyahı (KPI: işçi, müqavilə, aylıq fond, 30 gündə bitir, müddəti keçib; axtarış, şirkət, seqment filtri; sətrə toxun → işçi kartı).
- DİQQƏT (deploy): push-dan dərhal sonra `?v=NN` ünvanını curl ilə yoxlama — Cloudflare köhnə faylı həmin URL-də 4 saat keşləyir (v109-da baş verdi, v110-a qaldırıldı). Əvvəl ofis-sw.js-in yeni versiyasını gözlə.
- Gözləyən: Excel-dən yenidən idxal düyməsi (hələ yoxdur — yeni reyestr gələndə SQL ilə yüklənir, doc_no üzrə upsert).
- 27 okt: **İsa Qaraşov — HR profili** (isa.qarasov@pilothayat.az, mövcud hesab yeniləndi): perms `ofis, ofis_admin, ofis_hr` — rəhbər görünüşü + əmək müqavilələri. İşçi kartı yoxdur (davamiyyət gözlənilmir, rehber@ kimi). Parol istifadəçiyə verildi.
- 27 okt: **lux-admin edge v6 (təhlükəsizlik):** ofis rəhbəri artıq yalnız ADİ ofis hesablarını (yalnız `ofis`/`ofis_admin`) idarə edir — `ofis_owner`, `sys`, `ofis_hr` və admin hesablarının parolunu/adını/aktivliyini dəyişə bilmir (əvvəl OFFICE_SET-də ofis_owner var idi; Afiqi yalnız `techizat` icazəsi qoruyurdu). PERMS siyahısı genişləndi (ofis_hr, techizat, sys, tikinti*, komendant_akt) və admin yeniləməsində naməlum icazələr artıq silinmir. Test: İsa tokeni ilə Afiq/Nihat parolu → 403. admin.html PERM_LIST-ə `ofis_hr` əlavə edildi.
- 27 okt (ofis-v111): Davamiyyət başlığında **Hesabat** düyməsi (attRangeOpen/attRangeExport, ofis-b.js sonu): başlanğıc–son tarix, hazır aralıqlar (bu/keçən həftə, bu/keçən ay, son 30 gün, bu il), işçi filtri, iş yeri filtri (LOCF) → Excel 3 vərəq: Xülasə (plan, gəlib, icazəli, gəlməyib, gecikmə, tez çıxma, işlənib saat, çöl çıxışı, davamiyyət %), Günlər, Çöl çıxışları (xəritə linki). Sorğular 1000-lik səhifələrlə (_arAll), maks. 1 il.
- 28 okt (ofis-v113) **VACİB ELAN (hero):** `office_announcements` + `audience uuid[]` (null = hamı, əks halda yalnız siyahıdakılar — RLS "ann read/upd/del" buna görə; insert MGR), `style` ('hero' = tam ekran kart), `image` (banner URL). ann_feed/ann_remind audience-ə hörmət edir; ann_remind linki `?ann=ID`. Frontend (ofis-b.js sonu): `annHeroCheck` — `?ann=ID` və ya oxunmamış hero elan → `annHeroShow` (animasiyalı kart, 3.5 san oxuma zolağı, "Tanış oldum" → office_ann_reads). Push: `_office_push2(uid,title,body,tag,url,important,image)`; edge **office-push-one v3**: mətn 1500 simvol, `image` (FCM android.image + web push image), Android vurğu rəngi. SW showNotification-a image əlavə edildi. Banner: assets/ofis/ann-davamiyyet-1nov.jpg. rehber@ hesabının adı "Rəhbərlik" edildi.
- 28 okt: TEST — elan id=9 (Davamiyyət 1 noyabrdan elektron) audience=[Nihat] ilə yaradıldı, push 2 cihaza getdi. Hamıya göndərmək üçün: `update office_announcements set audience=null where id=9` + aktiv işçilərə `_office_push2` (Nihat-ın təsdiqi ilə).
- 28 okt (ofis-v114) **Developer (dev) rolu** — Nihat-a verildi: office_is_mgr/office_user/asst_guard/office_hr_ok/_soc_mod dev-i qəbul edir; frontend DEV → MGR + '👁 Sahibkar kimi bax' (PREVIEW) + rol adı 'Developer'; lux-admin v7: dev ofis rəhbəri kimi işçi hesablarını idarə edir, dev hesabı PROTECTED (rəhbərlər toxuna bilməz); admin.html PERM_LIST-ə dev; sys_priv_watch dev/ofis_hr-ı da izləyir.
- 28 okt (ofis-v116) **Bildiriş məcburiyyəti** (ofis-b.js sonu, pushGate*): işçinin heç bir cihazında office_push_subs yoxdursa tam ekran 'Bildirişləri aktiv et' (iPhone-da ana ekrana əlavə təlimatı, bloklanıbsa ayar təlimatı, dəstəkləməyən brauzerdə 'telefonda aktiv et'); tətbiqdən istifadə olunmur. İstisna: sahibkar, admin, dev, PREVIEW, ?qr=1, native FCM sönülü. Sorğu xətasında açıq qalır (fail-open). visibilitychange-də yenidən yoxlanır.
- 28 okt (ofis-v118) **Ana ekran bilbordu**: 'Bu gün'də #tOwnerTasks-in yuxarısında ən son pinned hero elan (bbd*), audience RLS ilə; geri sayım (başlıqdakı 'N noyabr'), toxun → annHeroShow. Sahibkarın 'test' tapşırığı (id 27, Nihat-a) silindi.
- 28 okt: elan id=9 tarixi 2 noyabra dəyişdirildi (1 noyabr bazar günüdür); banner assets/ofis/ann-davamiyyet-2nov.jpg.
- 28 okt (ofis-v121) DÜZƏLİŞ: bildiriş ekranı boş göy ekran kimi görünürdü — '.pg' sinfi tətbiqin səhifə yığını sinfi ilə toqquşurdu (position:fixed; translateX(100%) → məzmun ekrandan kənarda). Hero/gate/bilbord sinifləri 'nc-' prefiksi ilə ayrıldı. DƏRS: ofis-b.js-ə yeni UI əlavə edəndə qısa ümumi sinif adları (pg, ok, out, go, in, done...) işlətmə — həmişə unikal prefiks; test harness-ə real assets/ofis-app.css qoş.

## NIZAMI CITY DAXİLİ SİSTEMLƏRİ (28 oktyabr 2026)
- Yer: `nc/` qovluğu → luxresidence.az/nc/{satis,kalkulyator,muqavile,komendant}. nizami-city.az qoşulanda middleware (`nizamiHost`) /satis, /kalkulyator, /muqavile, /komendant yollarını `nc/`-ə yönləndirir; kök `/` → ictimai sayt (`nc/site.html`), `/sayt` → sayt idarə paneli.
- Dizayn: Nizami (göy #070c18 / laym #c2cd3f), ortaq `nc/nc.css` + `nc/nc.js` (NC.auth = luxAuth üstündən, NC.kv, NC.modal, NC.toast). Loqo/ikonlar `assets/nc/`.
- Mənzil bazası: City Life MMC şahmatkası (07.10.2026 docx) → `lux_kv.nc_sales` (8 blok: A·1, A·2, B, E·1, E·2, F, G·1, G·2; mərtəbə "10"=Mansard, "1.5"=1-ci mərtəbə II səviyyə). Mənzildə `c` = vəziyyət (Təmirli/White Box/Kirayə). 415 mənzil. C, D, H binaları cədvəldə yox idi.
- Kalkulyator: `lux_kv.nc_cfg` (açıq oxunur; yazma nc_calc_admin). Qiymətlər (29.10): kotlovan 3800, hazır təmirsiz 3900–4000, hazır təmirli 4200; slayder 3800-dən; müddət 6:0, 12:+200, 24:+400 (36 ay 29.10-da çıxarıldı — max 24); binalar A,B,C (hazır), E,F,G (tikilir) — D, H, I yoxdur (D yeri həyətdir). `presets` düymələri; lövhədən mənzil seçəndə vəziyyətə görə (Təmirli → 4200, digər → 3900). Domen: nizami-city.az (Cloudflare zona + Pages custom domain, 29.10). Hesab: admin@nizami-city.az (bütün nc_* icazələri).
- Müqavilələr: `nc_contracts` cədvəli (NC-YYYY-0001), `nc_unit_status()` RPC lövhədə statusu dəyişir. Ofis lentinə satış bildirişi GETMİR (LUX-dakı kimi).
- Komendantlıq: `nc` SXEMİ — LUX km_* strukturunun tam surəti (28 cədvəl, 54 policy, funksiyalar, trigger, km_unit_balance view, cron nc-km-auto-generate). PostgREST db_schemas += nc. `nc/komendant.html` LUX komendant.html-dən `nc/build_komendant.py` ilə YIĞILIR (rəng, brend, icazə, bina adları BN(), fayl yolları nc/, ncacts/) — LUX komendant dəyişəndə skripti yenidən işə sal. Edge: `nc-km-notify`. SMS (nc.km_sms_config) söndürülüb — OTP test rejimində.
- İcazələr: nc_sales, nc_sales_edit, nc_calc, nc_calc_admin, nc_contracts, nc_komendant, nc_komendant_kassa, nc_komendant_akt, nc_sakin (admin.html PERM_LIST + lux-admin v8). nc.km_units satış lövhəsindən idxal olunub (424 obyekt).

## ELAN İZLƏMƏ (28 okt 2026, ofis-v122)
- `office_ann_track` (ann_id, employee_id, token, sent_at, devices, delivered_at, seen_at, seen_count). `office_announcements.push_title/push_body` — push üçün qısa mətn (tam mətn kartda).
- RPC: `ann_send(id, only_unread)` — hər işçiyə ayrıca push (url ?ann=ID&r=token); `ann_delivered(token)` — SW push alanda çağırır (anon); `ann_seen(id)` — kart açılanda; `ann_stats(id)` — rəhbər üçün siyahı.
- UI: Elanlar → hər elanda «📊 Kim gördü» (Çatdı / Gördü / Tanış oldu, süzgəc, Excel, xatırlat). «Xatırlat» indi ann_send(only_unread).
- Elan 9 (davamiyyət, 1 noyabr) audience=[Nihat] — "hamıya göndər" deyiləndə: update audience=null; select ann_send(9).

## MAAŞ VERİLİŞİ — BARMAQ İZİ (28 okt 2026, ofis-v126)
- Cihaz: ZKTeco SenseFace 2A (barmaq+üz+kart, ADMS standart). Rejim T&A Push. Cihazda Cloud Server = ofis.pilothayat.az (443 və ya 80). Davamiyyət üçün DEYİL — yalnız maaş təsdiqi.
- Axın: `functions/iclock/[[path]].js` (proxy, x-device-ip) → edge `bio-adms` → `bio_scan()` → açıq dövrdə (office_pay_period.open) ən köhnə «gozleyir» maaş «verildi» olur + işçiyə push. Dublikat (sn,pin,at) qəbul olunmur.
- Cihaz Baş Ofisdə «Təsdiqlə» ilə aktiv olur (bio_devices.allowed + info.lock_ip = həmin anın IP-si; başqa IP-dən gələn qəbul edilmir).
- PIN = office_employees.id. Şablonlar (FP/BIODATA/FACE) `bio_users.templates`-də ehtiyat (brauzerə verilmir — `bio_status()` RPC yalnız say qaytarır). Blok → DATA DELETE USERINFO; blokdan çıxanda USERINFO + şablonlar geri yüklənir.
- Cədvəllər: office_pay_base, office_pay_period, office_payroll, bio_devices, bio_users, bio_cmds, bio_logs. RPC: pay_make, pay_block, pay_manual, pay_scans, bio_push_user, bio_sync_all, bio_enroll, bio_block, bio_status. İcazə: office_pay_ok() = ofis_maas | ofis_owner | sys | dev | ofis_hr.
- UI (ofis-b.js sonu): «💰 Maaş verilişi» — İşçilər səhifəsində; ofis_maas olan (rəhbər olmayan) ana ekranda. ?maas=1 → kassir ekranı. Tablar: Siyahı / Kassir ekranı / Sabit maaşlar / Barmaq izi cihazı.
- bio_devices-də 'ZZTEST' test sətri qalıb (allowed=false) — silmək olar.

### Nizami City ictimai sayt (nizami-city.az, v2 — 29.10)
- Mənbə: `nc/site-src/` → `python3 nc/site-src/build.py` → `nc/site.html` (+ `nc/site-defaults.json` panel üçün). Dizayn faylları `nc/site-src/v2/` (app.js, app.css, maquette.js, index.tpl.html); məlumat `data.js`, canlı yükləyici `runtime.js`.
- Üslub: tünd zeytun + krem (loqo rəngləri), mis yalnız əsas düymədə. Şriftlər öz serverimizdə: `assets/nc/fonts/` (NC Display = Imbue, NC Text = Albert Sans; ə/Ə dəstəklənir; ₼ display şriftindən gəlir).
- Şəkillər `assets/nc/site/*-2560.webp` və `*-1280.webp` (srcset). `aerial` = hazır binaların fonsuz 3D vizualı. Paneldən dəyişəndə `lux_kv.nc_site.img` URL-i istifadə olunur.
- Hərəkət: GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13 (cdnjs/jsdelivr), three r128 — 3D baş plan maketi (`ncMaquette`) və imza səhnəsi (hazır binalar scroll ilə açılır). prefers-reduced-motion nəzərə alınır.
- Mənzillər real `nc_public_units()`-dən; qiymət nc_cfg presetlərindən; sorğular `nc_leads`.

## 30 okt 2026 — Nizami City sayt v3+ (önizləmə: nizami-city.az/nc/site-v3)
Mənbə: nc/site-src/v3/{app.js, plus.js, maq.js, app.css, plus.css}. build.py: APP=app.js+plus.js, CSS=app.css+plus.css, %MAQ%=maq.js, MODEL-ə ncSunPos əlavə olunur. render() → beforeRender()/afterRender() (plus.js).
20 əlavə: işıqlı 3D maket (three r128, yalnız görünəndə CDN-dən), virtual tur, günəş/kölgə (Bakı koord.), gecə görünüşü, bina səhifəsində 3D + mərtəbə sinxronu, mənzildə 3D yer, izometrik mərtəbə (CSS 3D), kinematik hero, səhifə keçidi/irəliləyiş zolağı, yumşaq görünmə + sayğaclar, kartlarda 3D meyl, tünd tema (defolt açıq), əlçatanlıq (şrift/kontrast/animasiya), ətraf sxemi (filtrli), baxış saatı, zəng vaxtı, QR (qrcode-generator 1.4.4), #brosur (çap/PDF), "Sual verin" əlaqə mərkəzi (WhatsApp hazır suallar), ödəniş planı (faizlə, qiymətsiz).
Bayraqlara hörmət: 3D-də kran yalnız showStatus=true olanda. Kök (site.html) hələ v2-dir — təsdiqdən sonra `python3 build.py` (NC_OUT-suz).

## DAMAFON SAKİNLƏRİ (4 noy 2026, ofis-v129)
- Problem: eyni ZKTeco terminalında (NYU7261304234) sakin breloku basanda maaş kassir ekranına «PIN 1001 · tanınmır» düşürdü.
- Cədvəllər: `bio_residents` (pin=100000+id, full_name, phone, unit_id→km_units, unit_label, card, templates, active), `bio_door_logs` (qapı jurnalı). RLS açıq, oxu yalnız RPC ilə.
- `bio_scan`: PIN bio_residents-dədirsə (və işçi deyilsə) → bio_door_logs, maaş jurnalına YAZILMIR. `bio_template` / `bio_dev_user_save` sakin şablonu/brelokunu bio_residents-ə yazır. `pay_scans` köhnə sakin qeydlərini göstərmir.
- RPC: bio_res_save(p jsonb), bio_res_active, bio_res_delete, bio_res_push, bio_res_list, bio_door_list, bio_unit_find. İcazə bio_res_ok() = office_pay_ok() or km_staff().
- UI: Maaş verilişi → «🔑 Damafon sakinləri» tabı (əlavə et, mənzil axtarışı, brelok, barmaq/üz yaz, söndür, sil, qapı jurnalı).
- Miqrasiya: supabase/migrations/20261104_bio_residents_intercom.sql. Test sakini PIN 1001 (brelok 11259893) siyahıya köçürülür.
- v130: «Sakin əlavə et → Yadda saxla» → avtomatik `bio_res_enroll` (ENROLL_BIO TYPE=1, yalnız son 5 dəq onlayn cihazlara) → cihaz ekranında barmaq qeydiyyatı açılır; panel canlı izləyir (bio_res_cmds, bio_res_n). ENROLL_FP bu cihazda Return=6 verdi; ENROLL_BIO gözləyib vaxt bitəndə Return=-1003.
- v131: sakinlər brelokla — formada brelok ilk sahədir (autofocus, USB brelok oxuducu klaviatura kimi yazır, Enter → ad). Yaradanda avtomatik barmaq qeydiyyatı söndürüldü (👆 Barmaq yaz düyməsi qalır). ENROLL_MF (uzaqdan kart qeydiyyatı) bu cihazda -1003 (gözləyib vaxt bitdi) — ekranda nə göstərdiyi təsdiqlənməyib.
- v132: cihaz rolu bio_devices.info->>'role' (maas | damafon | hamisi; Barmaq izi cihazı tabında seçilir). İşçi əmrləri (_bio_cmd) yalnız maas/hamisi, sakin əmrləri (_bio_cmd_res) yalnız damafon/hamisi cihazlarına. Damafon cihazında işçi basması maaşa toxunmur (bio_door_logs 'işçi'). Sakin yarat → bio_res_learn(id,'card') ENROLL_MF → cihazda brelok oxut → USER upload ilə card gəlir (bio_dev_user_save). Mənzil seçəndə ad/telefon km_units (kirayəçi/sahib), km_residents, household-dan dolur. Test cihazı NYU7261304234 = hamisi.
- Damafon ayrıca bölmədir: Baş Ofis → İşçilər səhifəsində «🔑 Damafon» (rəhbər olmayan icazəlilər üçün ana ekranda), ?damafon=1. Tablar: Sakinlər · Qapı jurnalı (5 san yenilənir). Maaş verilişində yalnız maaş + «Cihazlar» (rol seçimi) qalıb.
- 🚪 Qapını aç: Damafon başlığında düymə → bio_door_open() → AC_UNLOCK (yalnız son 30 san onlayn damafon/hamisi cihazı; jurnala 'paneldən açıldı · ad'). AC_UNLOCK hələ cihazda sınanmayıb (cihaz oflayn idi).
- v133: brelok USB oxuducu (klaviatura kimi) ilə: formada 3-cü addım brelok sahəsi, Enter → avtomatik saxla; sətirdə «🔑 Brelok oxut» → oxuducu pəncərəsi. Nömrə: yalnız rəqəm, öndəki 0-lar silinir (cihaz 11259893 saxlayır, oxuducu 0011259893 verə bilər). ENROLL_MF bu cihazda işləmir (ekranda heç nə, 65 san sonra -1003, növbəni bloklayır) — avtomatik çağırış söndürüldü.

## 5 noyabr 2026 — Nizami daxili sistemləri LUX məntiqinə gətirildi
- /satis — YALNIZ BAXIŞ (LUX satis kimi): qarşılama, «Bütün binalar · ətraflı» (donut + bina üzrə zolaqlar), mənzil kartı baxış üçün, «Kalkulyatorda hesabla», nc_sales_edit olanlara «Paneldə redaktə» linki. nc_commercial / nc_garage açarları olarsa «Qeyri-yaşayış» / «Qaraj» tabları görünür.
- /kalkulyator — ayarlar düyməsi götürüldü; ayarlar paneldədir. nc_cfg.mortgageEnabled=false (Nizami-də ipoteka yoxdur).
- İdarə paneli: nizami-city.az/admin (= /sayt, fayl nc/sayt.html; luxresidence.az/nc/admin da işləyir). Yeni tablar: «Satış lövhəsi» (nc_sales_edit — LUX admin redaktoru: klik → status/№/otaq/sahə/vəziyyət/qeyd, + mənzil, + mərtəbə, + mansard, mərtəbə adı, mərtəbə sil, çevir, Excel, PDF/çap, boş mənzil axtarışı; dəyişiklik təzə nc_sales üzərində tətbiq olunur, by/at yazılır) və «Kalkulyator» (nc_calc_admin — nc_cfg). Tablar icazəyə görə görünür; giriş icazəsi nc_site | nc_sales_edit | nc_calc_admin. Dərin link: /admin?t=sales&b=<bina>&f=<mərtəbə>&i=<index>.
- Dizayn: nc/nc.css saytın zeytun/krem palitrası + NC Display/NC Text (assets/nc/fonts/fonts.css), standart açıq tema (tünd — zeytun-tünd). nc.css/nc.js ?v=3. Komendant: nc/build_komendant.py OL xəritəsi ilə zeytun palitrası.
- C binası (Giriş 1, 2) nc_sales-a əlavə olundu (04.11.2026 şkalası); ehtiyat: lux_kv.nc_sales_bak_20261105.

## 10 noy 2026 — Nizami City: G binası üçün 13 yeni plan
- plans.js: 53,52 / 55,10 / 65,12 / 65,21 / 78,13 / 80,73 / 82,02 / 109,32 / 110,15 / 115,84 / 118,21 / 118,52 / 122,61 (qrup `G`). ncPlan: G → G+BFG planları ±0,45; C → yalnız G planları ±0,05 (8 mənzil); A/E, B/F dəyişmədi. Şəkillər 1080×1350 postlardan kəsilib, fon şəffaf. img yolu `?v=2`.
- Nəticə: G-də 100 mənzil, C-də 8 mənzil plan aldı. Əvvəl G-dəki 65,12/65,21/53,52 səhvən 65,00/53,83 planına düşürdü — düzəldi.
- Hələ plansız: A (34), B (23), C (~85), F (10), E 172,1.
- (10.11) Nihat: C və G planları eynidir → ncPlan C-ni G kimi işləyir (±0,45). C-də 37 mənzil plan alır, 83 hələ plansız (sahələri heç bir plana yaxın deyil).
- (10.11) Hesab: a.teymurzada@nizami-city.az — Aysel Teymurzadə, Nizami City satış direktoru, bütün nc_* icazələri (admin@ ilə eyni). Köhnə aysel.teymurzade@pilothayat.az (ofis, deaktiv) toxunulmadı.
- (10.11) Saytda planı olmayan mənzil tipləri gizlədildi (plus.js: uniqT/tCard/sim — t.plan şərti). Siyahıda 28 tip qaldı. Satış lövhəsi, bina şahmatı və birbaşa #menzil linkləri dəyişmədi. Geri qaytarmaq: uniqT-dən 't.plan &&' sil.
- (10.11) nc_sales: G·2 Giriş 2, 2–9 mərtəbə, 7-ci mənzil (110,12 / 110) otaq 2 → 3 (Nihatın sözü ilə; plan 110,15 — 2 yataq + zal).
- (10.11) Sorğular: hər sətirdə «ad — nömrə» kopyalama ikonu + «Kopyala» düyməsi (filtrə uyğun hamısı, sətir-sətir). 9 rəqəmli nömrəyə 0 əlavə olunur.
- (10.11) Baxış günü səhvi: toISOString() Bakı vaxtında bir gün geri yazırdı → yerli tarix. Köhnə 2 sorğu (id 6, 8) +1 gün düzəldildi.
- (10.11) trg_nc_lead: yeni sorğu handled_by = Aysel (a.teymurzada@), Telegram xəbəri tg_notify ilə (yalnız Nihat). Mövcud 10 yeni sorğu da Ayselə yazıldı.
- (10.11) Nihatın sözü ilə Ayseldən nc_sales_edit götürüldü: mənzil statusunu yalnız admin dəyişir (RLS: nc_sales/nc_commercial/nc_garage yazmaq nc_sales_edit tələb edir). Satış lövhəsinə baxış, kalkulyator, müqavilə, komendant, sayt paneli qalır.
- (10.11) App rejimi: nc/{satis,kalkulyator,muqavile,komendant,sayt}.webmanifest (display standalone, scope '/', start_url /nc/<app>), apple-mobile-web-app meta, standalone-da daxili target=_blank linklər eyni pəncərədə açılır. Aysel planşetində ana ekrana əlavə edir.
- (10.11) Kalkulyator (nc_cfg): müddət 6:0, 12:+200, 18:+300, 24:+400 ₼/m² (36 yoxdur); sahə min 55; qiymət min 3700 (def 3800, presetlər dəyişmədi). Kod defoltları da uyğunlaşdırıldı; ipoteka defoltu false.
- (10.11) Kalkulyator: sahə max 207, qiymət max 4200, ilkin ödəniş min 40% (nc_cfg.downMin, paneldə yeni sahə «İlkin ödəniş minimum»). İctimai sayt sürgüləri də nc_cfg-dən (area min/max, downMin).
- (10.11) Cihaz 2 VGU6261301547 (damafon) → info.location_id=3 (LUX Tikinti), ad «LUX Tikinti — qapı». İşçi barmağı → _bio_att davamiyyəti LUX Tikinti iş yerinə yazır. Cihaz 08.11-dən oflayn (tokdan ayrılıb); Nihat yenidən quraşdırır: domofon açma kontaktı → cihazın EXIT/BUT+GND girişinə. Port 80 işləmir (CF HTTPS yönləndirmə) — 443.
- (10.11) bio_push_user: Pri sabit 0 əvəzinə cihazın bildirdiyi Pri (bio_dev_users) saxlanır — cihazda Super Admin edilən (Nihat PIN 1) sinxronda adi istifadəçiyə düşmür. Qapı cihazında hələ admin yox idi; Nihat özünü cihazdan Super Admin edir.
- (10.11 17:50) Qapı cihazı VGU sıfırlanmışdı (yalnız əl ilə yaradılan PIN 39 + brelok 5407265, Pri 14). 38 işçi + 39 şablon yenidən göndərildi (77 əmr, hamısı Return=0). bio_scan: «PIN = işçi id» fallback silindi (39 → Müzəffər Qurbanzadəyə səhv gəliş yazmışdı, att id 743). bio_push_user: yeni PIN cihazdakı əl ilə nömrələrlə toqquşmur. Diqqət: PIN ≠ işçi id (PIN 1 = Rəfael Mirzəyev; Nihat = off-1, cihazda yox).
- (10.11 17:52) Nihat: PIN 39 Məhəmməd Məmmədli idi. att 743 → employee 57 (late 523 dəq yenidən hesablandı, qeyd əlavə). Brelok 5407265 → bio_users pin 36 (Məhəmməd); cihazdan PIN 39 silindi, PIN 36-ya kart yazıldı (Return=0). Cihazda indi admin yoxdur.
- (11.11) LUX mənzil planları kataloqu (A4, 23 səh., «Səhər işığı» dizaynı): tools/kataloq/{gen.py,data.py,pdf.cjs}. Mənbə: Lux R. təqdimat 2 (noyabr 2026) — otaq ölçüləri əl ilə köçürülüb (cəmlər yoxlanıb); planlar assets/plans/*.webp. PDF-də 123,55 və 124,70 otaq siyahısı eynidir (mənbə səhvi).
- (11.11) Kataloq v2: planlar PDF-in öz səhifələrindən kəsildi (rembg isnet + əl ilə təmizlik, tools/kataloq/pplans), mərtəbə sxemləri PDF-dən terrakota-bej monoton, otaq sayı dairələri yalnız LUX terrakota çalarları (espresso/qum çıxarıldı), fon saytın bej rəngi. Planların mənbə ölçüsü ~700 px — çapda bir az yumşaq.
- (11.11) luxresidence.az footer (index.html + ru.html): MilliNet 2026 «İştirakçı» banneri — <script src=https://millinet.az/banner.js?id=776>, .millinet-b blokunda mərkəzdə.
- (12.11) office_locations id=4 «Nizami City» (40.3806, 49.8295 — saytdakı təxmini nöqtə, Cəfər Cabbarlı 31; radius 300, statik QR). İşçilər hələ əlavə edilməyib (siyahı Nihatdan gözlənilir). Qeyd: id=3 LUX Tikinti-nin koordinatı yoxdur → orada QR ilə qeyd «konum təyin edilməyib» xətası verir.
- (12.11) office_locations 4 → «Nizami City satış ofisi». İşçilər: Aysel Teymurzadə (emp 42, aysel.teymurzade@pilothayat.az) və Nuray Kərimova (emp 43, nuray.kerimova@pilothayat.az) aktiv edildi, location_id=4, 09:00–18:00 B.e–Cümə, parol 123456 (ilk girişdə dəyişir).
- (12.11) Aysel hesabları birləşdirildi: emp 42 → a.teymurzada@nizami-city.az (perms + ofis); köhnə aysel.teymurzade@pilothayat.az (heç vaxt girməyib) Nihatın sözü ilə silindi (lux_profiles + auth.users). Nuray (emp 43) 29.09 idxalında deaktiv yaradılmışdı. Nizami QR ramkası (c=4.…) PNG/PDF hazırlandı, oxunuşu yoxlandı.
- (12.11) Nuray auth.users banned_until=2999 idi (deaktiv hesablar ban edilir) → açıldı, giriş yoxlandı. Aktiv işçi kartı olub girişi bloklu qalanlar: Müzəffər Qurbanzadə, Səbinə Hacıyeva (Nihatdan qərar gözlənilir).
- (12.11) Vacib elan id=10 (hero, pinned, hamı): «Xəbərdarlıq: daxil olan sənədlərin vaxtında icrası» — Afiq Rəhmanov, 11.11.2026 (docx-dən, yazı səhvləri düzəldilib). Push _office_push ilə 42 hesaba (25 işçidə push abunəsi var), Telegram 3 nəfərə. Oxunuş: Xəbərlər → 👁 N/aktiv.
- (12.11) ofis v141: .lux-me (lux-auth.js-in sabit «Ad | Çıxış» çipi, sağ-aşağı) ofis-app.css-də display:none!important — çatda yazı sahəsini örtürdü. iOS klaviatura üstündəki ˄˅✓ paneli Safari/PWA-nın öz paneli, veb koddan söndürülmür (yalnız native iOS tətbiqdə).
- (12.11) iPhone tətbiqi: .github/workflows/ios.yml (macos-15; cap add ios, Info.plist icazələri, imzasız simulyator yoxlaması → secrets olanda arxiv + TestFlight), @capacitor/ios + keyboard; ofis v142 iOS native-də Keyboard.setAccessoryBarVisible(false). İlk yığım uğurlu (imzasız). Gözlənilir: Nihat Apple Developer Program qeydiyyatı (99 $/il) → APPLE_TEAM_ID, ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8 secrets; push üçün APNs açarı Firebase-ə + GoogleService-Info.plist.
- (12.11) Apple Developer: Nihat fiziki şəxs kimi qeydiyyatdan keçir (satıcı adı «Nihat Ömərov»).
- (12.11) ofis v143 HİBRİD tətbiq: functions/app-bundle (latest JSON + ZIP: index=ofis.html, ofis-a/b, lux-auth, css, ikonlar, vendor supabase/qrcode/jsQR), mobile/build-www.js CI-də paketi www/-ə açır; capacitor server.url silindi (yerli paket), @capgo/capacitor-updater (autoUpdate false; ofis-b.js özü /app-bundle/latest yoxlayır, fonda yükləyir, arxa plana keçəndə tətbiq edir), haptics, status-bar. SW tətbiqdə qeydiyyat olunmur. Android 3.0.0 (111) imzalı APK: releases/android-latest/bas-ofis.apk. Diqqət: köhnə tətbiqdən keçəndə işçilər bir dəfə yenidən login olur (origin dəyişdi).
- (12.11) Şöbə «Nizami City satış ofisi» (vəzifələr: 48 Satış direktoru → Aysel, 49 Xadimə). Yeni işçi: Sevda Abbasova (emp 93, sevda.abbasova@pilothayat.az / 123456), Xadimə, 09:00–14:00 B.e–Cümə, iş yeri Nizami City satış ofisi.
- (12.11) Günel Hüseynli (emp 55): schedule {"7":["10:00","18:00"]} — bazar günü 10:00. Keçmiş bazar gecikmələri (11.10 – 34 dəq, 01.11 – 36 dəq) 0 edildi, qeyd əlavə olundu. workdays dəyişmədi.
- (12.11) Gültəkin Məmmədzadə (emp 41, g.memmedzade@luxresidence.az): ofis kartı aktiv, LUX Satış ofisi, yeni vəzifə «Satış direktoru» (şöbə 16), perms + ofis. Parol dəyişdirilmədi (komendant parolu ilə girir).
- (12.11) Damafon icazəsi ayrıldı: bio_res_ok() = office_pay_ok() or lux_has_perm('damafon') (əvvəl km_staff — komendant icazəsi olan hamı). damafon perm: Nihat, Məhəmməd Məmmədli. Gültəkin və Rəşadda artıq görünmür.

## 12.11 — Damafon gecikməsi (v144)
- Panel: sakin siyahısı/jurnal sessionStorage keşindən dərhal göstərilir, fonda yenilənir; axtarış artıq hər hərfdə şəbəkəyə getmir; "Sakinlər" tabı jurnal sorğusunu atmır.
- bio-adms: Delay cihaz roluna görə — damafon (VGU6261301547) 2 san, maaş 10 san (info.delay ilə əl ilə dəyişmək olar). Cihaz yeni Delay-i yenidən başlayanda / seçimləri təkrar alanda götürür.
- bio_door_list: işçi adı artıq bio_users.pin → employee_id ilə tapılır (əvvəl PIN=işçi id səhv fərziyyəsi idi).

## 12.11 — Səhv QR çıxışı qoruması (v145)
- Səbuhi Pirquliyev (№59) QR-ı skan etmədən 2 dəfə çıxış qeyd olundu (statik QR linki təkrar açılıb). Hər ikisi ləğv edildi.
- autoCheck: səhifə yenilənəndə / geri-irəli / 60 san içində eyni link — avtomatik qeyd edilmir. Erkən çıxışda xəbərdarlıq: "N dəq erkən çıxış yazılacaq".
- Səbinə Hacıyeva (№38): lux_profiles.active=false idi → açıldı; vəzifə 41; 12.11 gəliş 08:35. Ceyhun (№62) 12.11 08:45. Səbuhi 12.11 gəliş 08:30. Köhnə dublikat kart №40 → "(köhnə kart · arxiv)".

## 13.11 — Birbank Business API (komendant, test)
- Birbank B2B API = şirkət hesabı API-si (çıxarış, köçürmə, kart, POS/e-ticarət çıxarışı). Sakindən kartla ödəniş (ekvayrinq) YOXDUR — bankdan ayrıca e-commerce test hesabı istənilməlidir.
- Test login: POST https://pre-my.birbank.business/api/b2b/login {username,password} → responseData.jwttoken / jwtrefreshtoken. Real: my.birbank.business.
- Giriş məlumatları: office_secrets.birbank (jsonb: env, base, username, password). Repoya yazılmayıb.
- Edge function `birbank` (x-cron-secret ilə): ?a=ping → login yoxlanışı. 13.11 test: http 200, code 0, token alındı, TEST USER / "T M M", ~7.9 san. IP məhdudiyyəti yoxdur.
- Növbəti: "Köçürmə əməliyyatları" endpointi → gələn köçürmələrlə sakin borclarının avtomatik bağlanması.
- 13.11: `birbank?a=accounts` (GET https://pre-my.birbank.business/b2b/accounts/portal/v1, Bearer jwttoken) işləyir — test hesabında 8 hesab (AZN/USD/EUR). Token office_secrets.birbank_tok-da 10 dəq keşlənir, 401-də təkrar login. `?a=get&p=/b2b/...` — yalnız GET, reject/sign/confirm/create bloklu.
- 13.11: Çıxarış endpointi tapıldı (sənədsiz, yoxlamaqla): GET /b2b/accounts/portal/v1/statements?accountNumber=…&fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD → {"accountStatements":[...]}. Maks aralıq 10 gün. Test mühitində bütün yoxlanan hesab/tarixlərdə siyahı boşdur — sahə formatı üçün sənəddəki cavab nümunəsi lazımdır.
- 13.11 TUTUŞDURMA QURULDU (LUX komendant):
  - Cədvəl `km_bank_txns` (ref unique, status matched/unmatched/ignored, payment_id). `km_bank_match_unit(purpose)`: "B3 5-2", "Bina 3, mənzil 5-2", "LUX-<unit_id>". `km_bank_ingest` → uyğunsa km_payments (method kocurme, note "Birbank avtomatik · … · ref"). `km_bank_assign(id, unit|null)`, `km_bank_list`.
  - Edge `birbank?a=sync&days=3`: hesabların çıxarışı (maks 10 gün), yalnız drcrInd=C və amountTag=MAIN; Telegram xülasə. Cron `km-bank-sync` hər 15 dəq (km_bank_sync_call).
  - Test env-də hesab siyahısı avtomatik (AZN). PROD-da office_secrets.birbank.accounts mütləq LUX komendant hesabı(ları) ilə doldurulmalıdır, yoxsa sync xəta verir.
  - Çıxarışda ödəyicinin adı YOXDUR (yalnız purpose) — tutuşdurma təyinatdakı koda bağlıdır.
  - Panel: Maliyyə → "🏦 Bank ödənişləri" (tanınmayanları mənzilə bağla / aid deyil). Sakin "Ödənişlər": "təyinata B3 5-2 yazın".
  - km_config.bank_info BOŞDUR — sakinlərə IBAN göstərilmir, doldurulmalıdır.

## 13.11 — Məzuniyyət qalığı İR cədvəlindən (v146)
- Cədvəl `office_leave_hr` (employee_id, year, used_text, used_days, left_days, note, as_of). RLS: işçi yalnız öz sətrini, rəhbər hamısını görür (yoxlanıb).
- 2026 üçün 30 işçi Excel-dən yazıldı (as_of 13.11). Sistemdə olmayanlar: İsa Qaraşov, Gülfiyyə/Əfsanə/Əli Rəhmanov, İsmət Nəzərov, Qafil Nəsirov; Rəşad Rəhmanov — Excel-də boş. Rəfail Mirzəyev → aktiv kart №60 (Rəfael), Aytac Soltanlı → №36 (Soltanova).
- Panel: "Məzuniyyət" və "Mən" — İR məlumatı varsa qalıq ondan; as_of-dan sonra sistemdə götürülən məzuniyyət avtomatik çıxılır. Rəhbər sorğu siyahısında qalıq da buna görə.

## 15.11 — 3D səhifə realizm yeniləməsi (3d.html)
- Fon: brend tonlarında qradiyent səma (gecə tündləşir). Şüşə + podium + eyvan şüşəsi Sky shader-dən PMREM əksi alır (yalnız bu materiallar; ümumi işıq dəyişmədi). updSky() günəşlə sinxron, 700 ms-dən bir.
- Fasad: hər mərtəbəyə şüşə profilləri (şaquli + üfüqi), z tərəflərində eyvan plitələri, şüşə məhəccər və qapaq (mergeGeometries, mərtəbəyə 4 mesh).
- Gecə: hər mərtəbənin şüşəsi ayrıca material — 72% mərtəbədə isti işıq, gün batandan sonra yanır (nightGlass).
- Faktura: canvas ilə səki plitəsi, torpaq, ot; şəhər binalarına pəncərə faktura (dam yox); ağaclar 4 kürəli, 2 rəngli.
- YENİ «🌅 Eyvandan mənzərə» (mənzil panelində): kamera mənzilin tərəfində ən yaxın eyvana, mərtəbə hündürlüyünə uçur; ±83° baxış, «← Geri»/Esc ilə qayıdış; dəniz/şəhər tərəfi və hündürlük yazılır. window.__lux3d.view(n) test qarmağı.
- Yoxlama: headless Chrome ekran şəkilləri (masaüstü, mobil, gecə, eyvan görünüşü), konsol xətası yoxdur.

## 15.11 — Mənzil turu fotoreal yeniləmə (menzil-tur.html)
- Tam yenidən quruldu (idarəetmə/otaq keçidləri saxlanıb). Xarici fayl yoxdur — bütün fakturalar canvas: palıd parket (+roughness), suvaq, mikrosement vurğu divarı, mərmər, travertin, buklé, kətan, qoz, palıd, xalça, mücərrəd tablo.
- İşıq: pəncərədən günəş (yumşaq kölgə, profillərin kölgəsi döşəmədə), RectAreaLight səma işığı, RoomEnvironment PMREM əksi. Masaüstündə GTAO + yüngül bloom (EffectComposer, OutputPass). Mobil — post-effektsiz.
- Mebel RoundedBoxGeometry ilə: buklé divan, terrakota kreslo, travertin masa, qoz TV konsolu (lamel), fikus bitkiləri, palıd yemək masası + 6 stul + 3 şüşə kürə, mərmər mətbəx, açıq kitab rəfi, döşəmə lampası, yarımşəffaf pərdələr, gizli LED.
- «🌙 Axşam / ☀️ Gündüz» düyməsi: axşam işıqları (5 PointLight, yalnız axşam görünür — shader yükü azdır), LED, gecə panoraması.
- Pəncərə mənzərəsi: canvas panorama (dəniz, Alov qüllələri, 3 planlı şəhər), üfüq göz səviyyəsində. window.__tour test qarmağı.

## 15.11 — 3D: 11 binalı kompleks (ana səhifə renderi əsasında)
- LAYOUT (metr, kompleks mərkəzinə görə): Bina 1 (30,72) və Bina 2 (78,24) — 44×28 m, 20 mərtəbə (öndəki iri binalar); Bina 3–11 — 30×22 m, 14 yaşayış mərtəbəsi + podium. Nömrələmə renderdən TƏXMİNİDİR — real baş plana görə LAYOUT-u düzəlt.
- Seçilmiş bina (Bina 3–8 tabları) həmişə mərkəzdə interaktiv modeldir; qalan 10 bina kontekst (canvas fasad faktura, gecə pəncərə işığı). SITE qrupu seçilən binaya görə sürüşür (placeSite).
- HOME kamerası hər bina üçün avtomatik: kompleks mərkəzindən çölə, digər binaların kəsmədiyi bucaq seçilir (quş baxışı, r=112, y=138).
- Şəhər/dəniz konteksti kompleksdən kənara itələndi (bay city z 160+).

## 15.11 — Dizayn layihəsi albomu (PDF, A3) — 2 otaqlı 111,64 m²
- tools/album/build.py (reportlab, Poppins): plan108 məlumatından (3d.html ROOMS/WALLS/WINS/DEF108) 14 vərəq — üz qabığı, mündəricat, vizuallar (menzil-tur renderləri), 3D aksonometriya (three ortho render), ölçülü plan 1:60, mebel, qapılar (boşluqdan avtomatik aşkarlama + cədvəl), döşəmə + plintus hesabı, tavan, işıqlandırma + açarlar, elektrik (rozetka/TV/kondisioner), materiallar spesifikasiyası (+10%), qeydlər.
- Giriş faylları /tmp/album-da yaradılır (plan108.json, axon.png, r_*.png) — yenidən qurmaq üçün əvvəlcə onları yarat.

## 15.11 — 3D: «🏙 Rəqəmsal maket» rejimi
- Düymə (masaüstü: Günəş düyməsinin yanında, mobil: sol aşağı) və ya ?maket=1. Ağ studiya fonu, 269×286 m maket altlığı (qara kənar), perimetr + daxili yollar (zolaq xətləri, səkilər), binalar/yollardan boş xanalarda qazon + instanced ağaclar, uşaq/idman meydançaları, parklanmış maşınlar (instanced). Avtomatik fırlanma, «🌙 Gecə» (SUN 20:00 → pəncərə işıqları).
- Çıxanda hər şey bərpa olunur (gizlədilən SITE obyektləri, fog/dome, kamera limitləri, kölgə kamerası).

## 15.11 — Kompleks düzülüşü renderə uyğunlaşdırıldı
- LAYOUT indi şəbəkədir (LG): x addımı 32 m, z addımı 38 m; qüllə 26×20 m (W/D dəyişdi), iri binalar 40×26 m, 20 mərtəbə. Şəbəkə: arxa sıra Bina 9/8/5/4, ön sıra Bina 7/6/3, Bina 10 (2,2), Bina 11 (3,3), Bina 1 (4,-1), Bina 2 (4.7,0.5). Nömrələr renderdən TƏXMİNİ.
- Eyni sırada qonşu qüllələr arası 2 mərtəbəli birləşdirici podium. Maket altlığı LAYOUT-dan avtomatik ölçülür; həyətdə səki+qazon qarışığı. Maket kamerası renderin bucağına yaxın.

## 15.11 — TEST budağı `rentgen`: 3D «🩻 Rentgen · kommunikasiya»
- Preview: https://rentgen.luxresidence.pages.dev/3d?rentgen=1 (main-ə birləşdirilməyib, canlı saytda yoxdur).
- Seçilmiş binanın fasadı gizlənir, qonşular 6% şəffaf; şəffaf döşəmə plitələri + mərtəbə konturları, lift/pilləkən nüvəsi, sxematik qalxıcılar S-1…S-4 (su + kanalizasiya, mərtəbə qolları), 2 ventilyasiya şaxtası, elektrik qalxıcısı + mərtəbə xətti, yanğınsöndürmə (sprinkler). Qatlar paneldən açılıb-bağlanır.
- Müraciət pinləri və sayğac anomaliyası NÜMUNƏ məlumatdır (8 müraciət, S-2 boyunca 3 sızma; 3 anomal sayğac) + avtomatik nəticə kartları. Real versiya: km_requests/km_readings yalnız komendant girişi ilə (km_staff).

## 16.11 — Sakin tətbiqi `/sakin` (sakin.html + sakin.webmanifest)
- Ayrıca mobil tətbiq (PWA, ana ekrana əlavə, avtomatik açıq/tünd tema). Giriş: telefon (+994) + parol → `<son 9 rəqəm>@sakin.luxresidence.az` (komendantın yaratdığı hesab formatı); email də qəbul olunur. `?p=0501234567` nömrəni əvvəlcədən doldurur. Sessiya yadda qalır.
- Bölmələr (alt menyu): Evim (balans, aylıq haqq, sürətli düymələr, gözləyən bağlama bannerı, açıq müraciətlər, son elan) · Ödəniş (bank rekvizitləri km_config.bank_info, təyinat kodu «B3 5-2» kopyala, hesab çıxarışı; kartla onlayn — «qoşulma mərhələsində») · Xidmətlər (müraciət + şəkil WebP-yə kiçildilir, qonaq QR + WhatsApp, rezervasiya, sayğac, bağlamalar, təcili zəng) · İcma (elan, səsvermə, sənədlər) · Profil (mənzillər, push bildiriş office_push_subs ua='sakin', parol dəyiş, quraşdırma, çıxış).
- Məlumat mövcud km_* cədvəllərindən, RLS ilə (yeni cədvəl yoxdur). Bir neçə mənzili olan sakində mənzil seçimi.
- Komendant → Ayarlar → «Sakin tətbiqi»: statistika, «Hesabları yarat və kartları çap et» (yasayir/icare, demo deyil, telefonu olan, hesabı olmayan mənzillər; lux-admin create, 6 rəqəmli parol, km_residents sahib/kiraye), A4-də 4 xoş gəldin kartı (QR → /sakin?p=, telefon, parol). Parollar saxlanmır — yalnız çapda. «Lift posteri (QR) çap et» A4.
- Test: demo.sakin@luxresidence.az / LuxDemo2026 (Bina 9, 14-2, demo).
- Qalan: km_config.bank_info və phone boşdur; kartla onlayn ödəniş (bank e-commerce) gözlənilir; RU/EN dilləri hələ yoxdur.

## 16.11 — 3D: canlı və real kompleks (3d.html) + saytda alıcı funksiyaları (index.html)
**3D — reallıq**
- Kontekst qüllələri artıq yastı faktura deyil: `floorGeo(w,d,big)` hər mərtəbənin həndəsəsini (plitə, pilyastr, panel, şüşə profili, eyvan, məhəccər) bir dəfə qurur, hər qüllədə InstancedMesh ilə təkrarlanır; `staticGeo` — podium və dam (parapet, pavilyon). Əsas (seçilmiş) bina da eyni `floorGeo`-dan istifadə edir (köhnə `facade()`/`DET` silindi). Gecə pəncərələri: `litTex` (hər pəncərə ayrıca yanır, əsas binada arabir dəyişir).
- Çəkiliş çağırışları 1637 → ~410 (masaüstü), mobil ~340. Kölgə: 4096 xəritə, ±250 m (`SHB`).
- Səma: düzgün sRGB qradiyent + duman zolağı (`hz`), qürubda isti ton (`DUSK`), buludlar, ulduzlar, ay, günəş diski (`SKYG`).
**3D — canlılıq** (`LAND`, `NEIGH`, `LIFE`, `lifeTick`)
- LAND (həmişə görünür, əvvəl yalnız maketdə idi): perimetr yolları, səkilər, qazon xanaları, ağaclar (küləkdə yellənir), meydançalar, parklanmış maşınlar, küçə/həyət lampaları, fəvvarə. Maket rejimi indi yalnız altlıq əlavə edir.
- NEIGH: ətraf məhəllə (bloklar, binalar, küçələr), keçən maşınlar. LIFE: perimetrdə maşınlar (gecə fənərlər), səkilərdə və binaların ətrafında piyadalar, meydançada uşaqlar, quş dəstəsi. Dəniz — hərəkətli dalğa. Gecə: lampa işığı və yerdə işıq ləkələri, Alov qüllələri.
**3D — yeni funksiyalar**
- Alt panel (`#dock`): Günəş və kölgə · Maket · Gündüz/Qürub/Gecə (`setTOD`, rəvan keçid) · Tur (`startTour`, 7 kadr, başlıqlarla; `?tur=1`, sonsuz: `?tur=loop` — satış ofisi ekranı üçün) · Şəkil (`snap`, su nişanı ilə JPG).
- Qülləyə və ya üstündəki etiketə kliklə bina dəyişir (`goTower`, `buildTL/updTL`); status gizli deyilsə etiketdə «N mənzil satışda». Otaq sayına görə filtr (`RF`, `#rfilt`).
- Dərin link: `?bina=Bina 4&f=10&u=2` (mərtəbə + mənzil açılır), `?area=111.64` (həmin sahəli ilk mənzil). URL seçimlə birlikdə yenilənir; paneldə «Paylaş» və «Baxışa yazıl».
- Test qarmaqları: `__lux3d.tod('dusk'|'night'|'day')`, `.tour()`, `.tourAt(i)`, `.info()`, `.night(min)`, `.cam(x,y,z)`.
- QEYD: paralel sessiya eyni fayla interyer planları (PLANS 105/113/117/119) əlavə edir — push-dan əvvəl həmişə `git pull --rebase`. `rentgen` test budağı köhnə 3d.html üzərindədir, birləşdirmək üçün yenidən köçürülməlidir.
**Sayt (index.html, blok «LUX+» — faylın sonunda, `<style id="lux-plus">` + skript)**
- Seçim köməkçisi (`luxWizard()`, `/?komekci=1`): 3 sual (neçə nəfər, nə vacibdir, hansı bina) → 3 ən uyğun plan, səbəbi ilə; «Plana bax», «3D-də bax», məsləhət üçün ad+telefon (lux_leads, subject «Seçim köməkçisi», mesajda cavablar və tövsiyə olunan planlar).
- Baxışa yazılma (`luxVisit(ctx)`, `/?baxis=1&m=...`): 10 gün × 10:00–19:00, ad, telefon → lux_leads (subject «Baxış: 17.11.2026, 15:00»). Ana səhifədə, mənzil səhifəsində, köməkçidə və 3D panelində.
- Son baxdıqlarınız (localStorage `lux_recent`, ana səhifədə, 4 kart). Mənzil səhifəsində «3D-də bax» (Bina 3–8 üçün `?area=`) və «Çap et / PDF» (A4 üfüqi çap görünüşü).
- Qiymət, mərtəbə və satış statusu bu funksiyalarda göstərilmir (lux_showprices=0, lux_hidefloors=1, lux_hidestatus=1 ayarlarına uyğun).

## 16.11 — Sayt: vizual cila + 20 yenilik (index.html, blok «LUX v2» — `<style id="lux-v2">` + skript, faylın sonunda)
İstiqamət (unslop, cila rejimi — brend saxlanılıb): isti, memarlıq hissli, sakit-dəqiq; dünya — terrakota fasad, krem daş, axşam işığı; «anlar» — hero-dakı nömrəli render və gündüz/gecə sürgüsü; imza detalı — nömrəli bina nişanları (hero-dakı nişanlar kartlarda da).
1. Tipoqrafiya: başlıqlar Playfair 600 (əvvəl 700), sıx aralıq; sahələr «70,37 m²» formatında (MutationObserver mətn düyünlərində nöqtəni vergülə çevirir; `azA()` kartlarda).
2. Bölmə etiketləri: iri hərf + seyrək yazı əvəzinə adi yazı və nazik xətt.
3. Düymələr/kartlar: vahid keçid əyrisi (`--ease`), basanda .98, fokus halqası; rəngli parıltılı kölgələr götürüldü; kart hover — haşiyə + yüngül kölgə (yuxarı sıçrama yoxdur).
4. Emoji çıxarıldı (xəritə kateqoriyaları, forma təşəkkürü, WhatsApp ipucu, yükləmə düymələri).
5. Bina nişanları: kartda «Bina 3, 4, 5, 6» əvəzinə nömrəli nişanlar (`locHtml`, yalnız lux_hidefloors=1 olanda); 3D-də baxıla bilən planlarda «3D» nişanı (`l3d`).
6. Hero: «Mənzil seç» və «3D-də gəz» düymələri (masaüstü və mobil).
7. Yeni bölmə «Kompleksi gündüz və gecə görün»: müqayisə sürgüsü (assets/3d-gunduz.webp, 3d-gece.webp — 3D modeldən çəkilib; yenidən çəkmək üçün /tmp/shots/cap3d.py məntiqi: `__lux3d.cam(150,100,170)` + `tod('night')`).
8. Xəbərlər: fasiləsiz axan lent əvəzinə oxlu karusel (`#newsCar`); tərəfdaşlar sabit sıra.
9. Mobil: «Seçilmiş mənzillər», «Digər mənzillər», «Son baxdıqlarınız» üfüqi sürüşən sıra.
10. Mobil alt menyu (`#tabbar`: Ana səhifə, Planlar, 3D tur, Sevimlilər + say, Əlaqə).
11. Oxuma irəliləyişi xətti (`#rProg`) + «Yuxarı qayıt» düyməsi (masaüstü).
12. Səhifə keçidi (yumşaq açılma) və bölmələrin sürüşdükcə açılması (`.rv`, yalnız ekrandan aşağıdakılar; reduced-motion-da sönülü).
13. `::selection`, `:focus-visible`, `html{overflow-x:clip}`.
14. Plan böyüdücü (`#lxBox`): plana toxunanda tam ekran; təkər/çimdik/ikiqat kliklə yaxınlaşdırma, sürükləmə.
15. Mobil mənzil səhifəsində yapışqan panel (`#actBar`: Zəng, WhatsApp, Baxışa yazıl) — alt menyunu əvəz edir.
16. Planlar: sıralama (`#catSort`, `luxV2.sort`) + mobil 2 sütun.
17. Müqayisə paneli (`#cmpBar`): seçim olanda «Müqayisədə N mənzil — Müqayisə et».
18. `alert()` əvəzinə sakit bildiriş (`luxToast`; `window.alert` bununla əvəzlənib).
19. Suallar: axtarış (`#faqQ`).
20. Footer: «3D tur», «Baxışa yazıl», «Seçim köməkçisi», «Yuxarı qayıt».
Qarmaqlar: `showView` → `luxV2.view(v,nav)`, `updCounts` → `luxV2.counts()`, `renderCat` → `luxV2.sort(list)`. 3D səhifəyə toxunulmayıb.

## 16.11 (gecə) — Sayt v3: şüşə dizayn sistemi, tətbiq hissi, 30 yenilik, SEO
Fayllar: `index.html` (blok «LUX v3» — `<style id="lux-v3">` + markup + skript, `#waFab`-dan əvvəl; mənbə nüsxəsi iş vaxtı /tmp/psite/v3.*), `functions/_middleware.js`, `functions-lib/seo.js`, `functions/apt/[id].js`, `functions/xeber/[slug].js`, `functions/sitemap.xml.js`, `site.webmanifest`, `ru.html`. 3D səhifəyə toxunulmayıb.
**Düzəliş (vacib):** v2-dəki `html{overflow-x:clip}` başlığın yapışıq qalmasını pozurdu (body ayrıca sürüşmə konteyneri olurdu). `body{overflow-x:clip}` ilə əvəzləndi — `position:sticky` yenidən işləyir. Bir daha html-ə overflow yazma.
**Dizayn tokenləri (v3):** `--g1/--g2/--g3` (şüşə fonları), `--gd` (tünd şüşə), `--gb` (haşiyə), `--gblur`, `--gsh/--gsh2`. Bulanıqlıq yalnız «xrom»da (başlıq, alt menyu, hero paneli, filtr, alətlər sətri, pəncərə arxa planı); kart üstü düymələrdə bulanıqlıq yoxdur (sürət üçün).
**Qarmaqlar:** `showView` → `luxV3.view(v,nav)`; `route` sonu → `luxV3.seo(p)`; `renderCat` → `luxV3.cat(list)`; `renderCmp` → `luxV3.cmpRows()`; `window.route`, `renderCmp`, `renderFav`, `history.pushState` v3-də bükülüb (View Transitions, fərq işarəsi, sürüşmə yeri). `route()` daxilində: `window.__luxRoom` (otaq tipi səhifəsi), naməlum yol → `v-404`.
**30 yenilik:**
Dizayn — 1) şüşə başlıq (sıxılır; telefonda aşağı sürüşəndə gizlənir); 2) şüşə hero paneli + yumşaq fon keçidi; 3) şüşə pəncərələr (bulanıq arxa plan); 4) üzən şüşə alt menyu + sürüşən göstərici, üzən əməliyyat paneli; 5) vahid forma sahələri (16px, fokus halqası, xəta halı); 6) axıcı səhifə keçidi (View Transitions; plan kartdan mənzil səhifəsinə keçir).
Tətbiq hissi — 7) pəncərələr telefonda alt vərəq, tutacaqdan çəkib bağlanır; 8) filtr alt vərəqdə + aktiv filtr sayı + «N mənzili göstər», yapışqan alətlər sətri; 9) tətbiq üst paneli (geri, başlıq, paylaş) mənzil/xəbər/bina səhifələrində (`body.sub`); 10) mənzillər arası keçid (`#dcNav`, sürüşdürmə, ← →); 11) sürətli əlaqə vərəqi (`#qcModal`, alt menyuda «Əlaqə»); 12) ana ekrana quraşdırma (`luxInstall`, `.ins-link`; iPhone üçün təlimat) + manifest qısayolları; 13) geri qayıdanda siyahıda yer saxlanır; 14) toxunuş rəyi + oflayn bildirişi.
Funksiyalar — 15) ümumi axtarış (`luxSearch()`, Ctrl/⌘+K, «/»): mənzil, tip, bina, səhifə, xəbər, sual, əməliyyat; 16) filtr ünvanda (`/planlar?otaq=1,2&sahe=70-120&bina=3&sira=d`) + aktiv filtr çipləri; 17) sürətli baxış (`luxV3.quick(id)`, kartda «Sürətli bax», masaüstü); 18) sevimliləri linklə paylaş (`/sevimliler?m=101,113`); 19) müqayisəni linklə paylaş (`/muqayise?m=…`); 20) müqayisədə real otaq sətirləri (eksp-dən: yataq otaqları, zal/studiya, mətbəx, eyvan, sanitar qovşağı, qarderob) + fərqlənən sətirlər; 21) telefon sahəsi avtomatik format/yoxlama, ad-telefon `localStorage.lux_me`-də; 22) eksplikasiyada sahə zolaqları; 23) xəritədə məsafə/piyada vaxtı/yol tarifi (düz xətt × 1,3; 80 m/dəq — «təxminən»); 24) əlaqədə Google Maps/Waze/Yandex + kopyalama; 25) xəbərdə oxuma müddəti + paylaşma; 26) ana səhifədə otaq sayı üzrə keçid (`#roomsNav`).
SEO — 27) otaq tipi səhifələri `/1-otaqli-menziller` … `/4-otaqli-menziller` (başlıq, təsvir, H1, giriş mətni, canonical; sitemap-də yalnız planı olan tiplər); 28) BreadcrumbList (server `ldCrumb` + görünən yol), ItemList (`ldList`) planlar səhifələrində, başlıqlarda «111,64»; 29) əsl 404 (middleware: naməlum yolun ETag-ı index.html ilə eynidirsə 404 + noindex; `/xeber/yox` da 404; saytda `v-404`); 30) daxili linklər (kart «Ətraflı» və xəbər başlığı `<a>`, footer-də tip linkləri, JS-siz `<noscript>` mənzil siyahısı), AZ↔RU hreflang (ana səhifə və /ru), /ru sitemap-də, hero şəkli `fetchpriority=high`.
**Qeyd:** sınaq budağı `v3` (https://v3.luxresidence.pages.dev) — funksiyaları əsas budaqdan əvvəl yoxlamaq üçün istifadə olunub. Gizli parametrlər (qiymət, mərtəbə, status) yeni heç bir yerdə göstərilmir.
**Açıq:** gecə rejimi (cihaza görə) hələ yoxdur; hero başlığı ümumidir; baxış saatları (10:00–19:00) təsdiqlənməyib; real telefonda sınanmayıb (yalnız telefon ölçülü brauzer).

## 16.11 (gecə, 2) — Gecə rejimi, yeni giriş ekranı, əlavə 20 funksiya
Mənbə nüsxələri iş vaxtı /tmp/psite: `v4.css`, `v4.js`, `v4.body.html`, `dark.manual.css`, `dark.fix.css`, `darkgen.py`, `build4.py` (index.html-də `<!--v4-->…<!--/v4-->` və `<!--dark-->…<!--/dark-->` blokları).
**Gecə rejimi:** `html[data-theme]` ilk boyamadan əvvəl `<head>`-də təyin olunur (`localStorage.lux_theme` → yoxdursa cihaz rejimi). Düymə başlıqda (`#themeBtn`), menyuda və footer-də. Üslublar `<style id="lux-dark">`: əl ilə tokenlər + bütün qaydalardan avtomatik çevrilmiş tünd qaydalar (darkgen.py) + düzəlişlər. Yeni üslub yazanda rəngləri `var(--ink/--bg/--line/--g*)` ilə yaz, gecə rejimi özü işləyəcək.
**Hero:** başlıq «Yasamalda 11 binalı yaşayış kompleksi», üst yazı «Elmlər Akademiyası metrosunun yanında» (lux_content-də də yeniləndi). Tam enli render, açılış animasiyası (bir dəfə, `html.intro-done`), sağda şüşə «Mənzilinizi tapın» paneli (`.hfind`), telefonda kənardan-kənara şəkil + şüşə kart.
**Sürət jurnalı:** sys_rum app adı 30 simvoldan uzun olduğu üçün yazılmırdı — düzəldildi.
**Baxış saatları:** 10:00–19:00 hələ təsdiqsizdir (dəyişməyib).
**20 funksiya:** 1) sahənin bölgüsü (yaşayış/mətbəx/eyvan/SQ/köməkçi, %); 2) xüsusiyyət filtrləri (qarderob, 2 eyvan, 2+ SQ, ayrıca mətbəx; `?xus=`); 3) şəbəkə/siyahı görünüşü (`lux_view`); 4) «Baxılıb» işarəsi (`lux_seen`); 5) mənzilə şəxsi qeyd (`lux_notes`, sevimlilərdə görünür); 6) QR kod (`/assets/vendor/qrcode.js`, MIT) + çap vərəqində QR; 7) müqayisədə «Yalnız fərqlər» + çap; 8) mənzil səhifəsində yapışqan xülasə paneli (kompüter); 9) siyahıdakı mənzillərə birlikdə baxışa yazılma; 10) siyahını WhatsApp-da menecerə göndərmə; 11) «Nə vaxt zəng edək?»; 12) baxışı təqvimə əlavə (.ics + Google Təqvim); 13) müraciətə mənbə izi (utm/gclid/fbclid/referrer, `lux_src`) — mesaj sahəsinə yazılır; 14) spam qorunması (2,5 san, 10 dəqiqədə 5 müraciət, tələ sahəsi); 15) kuki bildirişi (yalnız zəruri → Google consent denied); 16) xəbərlərdə axtarış və mövzular; 17) əvvəlki/növbəti yazı; 18) xəritə altında ən yaxın yerlər siyahısı; 19) RSS (`/feed.xml`); 20) AI axtarışları üçün `/llms.txt` + AZ↔RU keçid düyməsi.

## 16.11 — Barmaq cihazı: sakin PIN-i işçi ilə qarışırdı (düzəldildi)
Komendant Cihaz 2-də (damafon, VGU6261301547) sakinləri birbaşa cihazda yaradırdı; cihaz ardıcıl PIN verir (39–59). `bio_template` naməlum PIN-i «PIN = işçi id» sayırdı → PIN 54 (ELNUR BEY, 4/14/4) Mirzə Süleymanlıya (işçi 54) bağlandı, sınaq basışları Mirzənin 13.11 çıxışı (14:17) oldu, izi maaş cihazına Mirzə kimi getdi.
Düzəliş: `bio_template(..., p_sn)` damafonda işçi fərziyyəsi yoxdur; `bio_dev_user_save` damafonda naməlum istifadəçini sakin edir; bio-adms v5 p_sn ötürür. 18 sakin qeydə alındı, qapı jurnalı «giriş» oldu. Mirzənin 13.11 çıxışı 18:03 (Nihatın təsdiqi). Maaş cihazına `DATA DELETE USERINFO PIN=54` növbədədir (cihaz 14.11-dən bəri oflayn — qoşulanda icra olunacaq).

## 16.11 — Nizami paneli: sorğular LUX kimi
nc/sayt.html «Sorğular» tabı: cədvəl əvəzinə kartlar (ad, telefon, növ, mənzil/vaxt, mesaj), hər kartda «✓ Cavablandı» / «Yeni et», WhatsApp, Kopyala, status seçimi, Sil; yuxarıda «Yeniləri kopyala», «Bu günküləri kopyala», seçilənləri kopyala / cavablandı. Status «contacted» indi «Cavablandı» adlanır. Yeniləmə `.select()` ilə yoxlanır — RLS yazmasa «icazə yoxdur» deyir.

## 16.11 — pilothayat.az şirkət saytı + komendant.pilothayat.az
- `pilot.html` — Pilot Həyat bir səhifəlik saytı (layihələr, komendant xidməti, ödəniş/qaytarma/məxfilik qaydaları, rekvizitlər). Rekvizitlər skriptdəki `CO` massivindən; boş sahə göstərilmir — hüquqi ad, VÖEN, hüquqi ünvan, telefon, e-poçt Nihatdan gözlənilir. Məqsəd: Kapital Bank e-commerce yoxlamasında domen boş/hostinq səhifəsi göstərməsin.
- Middleware: `pilotHost` (pilothayat.az → /pilot; www → 301), `komendantHost` (komendant.pilothayat.az → /komendant, /sakin; noindex).
- (16.11) Custom domains əlavə edildi (Cloudflare panel, daxili brauzer): pilothayat.az (köhnə A @ 136.243.3.33 hostinq → CNAME luxresidence.pages.dev), www.pilothayat.az (→ 301 kökə), komendant.pilothayat.az. Poçt toxunulmadı: MX → _dc-mx.8ac57fea2b84.pilothayat.az (136.243.3.33), SPF ip4 ilə. Hamısı 200 qaytarır.

## 16.11 (axşam) — Kinematik giriş + dron intro + yanıb-sönmə düzəlişi
- Hero kənardan-kənara (16:9, pinlər yerində qalsın deyə nisbət saxlanılıb), naviqasiyanın altından başlayır; `html.is-home/.hero-top` başlıqda (head skripti) təyin olunur. Sürüşdükcə `--hp` ilə yaxınlaşma. «Mənzilinizi tapın» `.hfind-strip` — şəklin altında.
- Dron intro (`html.intro`, sessiyada bir dəfə, sessionStorage.lux_intro): buludlar (`.hero::after`, dCloud) + şəkil perspektivdən enir (dDrop 3.2s); başlıq/pinlər sonra çıxır. reduced-motion-da yoxdur.
- Yanıb-sönmə səbəbi: v2–v4 və gecə üslubları body-nin sonundadır → ilk boyamada köhnə görünüş. Düzəliş: head-də `lx-boot` (DOMContentLoaded-dək body opacity 0, 3 san ehtiyat). İlk ziyarətdə (localStorage boş) `lx-wait` — məlumat sinxronu bitənə və ya reload-a qədər gizli (4 san ehtiyat).

## 16.11.2026 — Hero şəkillərinin keyfiyyəti
- img1/img2 (1600×900) Real-ESRGAN x4plus ilə (CPU) böyüdüldü, 25% Lanczos qarışığı + yüngül unsharp, 2560×1440 WebP: assets/img1-hd.webp (~580 KB), img2-hd.webp (~550 KB).
- ≥1000px və ya retina planşetdə --day/--night HD fayllara keçir; telefonda köhnə 1600 versiya qalır (sürət). Preload media ilə ayrıldı.
- Ən yaxşı nəticə üçün orijinal render (4K) faylları lazımdır — istənilib.

## 17.11.2026 — Mirzənin ad günü bildirişi
- Elan id=11 (Rəhbərlik adından), audience = Baş Ofisin aktiv işçiləri (location_id null), Mirzə (id 54) xaric — 22 nəfər; hər birinə _office_push2 push (tag bday-mirze, link ?ann=11).

## 17.11.2026 — Baş Ofis v147–v148: responsivlik və məntiq auditi
- **Ad günü kartı** (Bu gün): `.bdc` sinfi sosial ad günü şəbəkəsi ilə toqquşurdu (mətn 52px dairəyə sıxılırdı). Yeni unikal siniflər `tbd-*`; dar ekranda düymə alta düşür.
- **Sinif toqquşmaları:** `.go` (ox) → `arr-go` (şifrə kartında göy zolaq görünürdü); Lentdə təşəkkür postu `.kud` flex-i təsadüfən alırdı → `.igpost.ig2.kud` üçün ayrıca grid.
- **Məntiq:** `notYet(e,d)` — iş saatı başlamayan işçi Panel/Nəzarət/Davamiyyət/Sahibkar ekranında "gəlməyib" sayılmır ("gözlənilir"); Komandada `teamSt(e)` → "Hələ başlamayıb" / "İstirahət günü". `chatAgo` vahidləri: dəq/saat/gün/həftə (əvvəl d/s/g/h — "5h" həftə demək idi). `ini()` mötərizəni baş hərf saymır.
- **Hekayə:** "Baxanlar" vərəqi açıq ikən arxadakı hekayəni çəkmək vərəqi aşağı salıb bağlayır (`svSheetGest`, capture-faza), hekayə yerində qalır. Önə çıxanlarda da.
- **Cədvəllər (≤700px):** Sorğular siyahısı sətir kartlarına keçdi (`lvl-*`); qalan cədvəllər yana sürüşür (min-width), pill-lər qırılmır. Elanlarda uzun mətn 8 sətirdən sonra "Davamını oxu".
- **Kiçik telefon (≤400px):** Nəzarət plitələri, Bu gün statistika sətri kiçildi; tək qalan plitə tam en; `.linkbtn`/`+ Status` toxunma hündürlüyü 32px.
- **Test mühiti:** /tmp/ofh (saxta Supabase klienti + real bazadan yalnız-oxuma fiksturlar, Playwright; 320/360/390/1280, işçi və rəhbər rolu). Müvəqqəti `_fx_run`/`_fx_tok` bazadan silindi.
- Yoxlanmayıb: real iPhone-da toxunma jestləri (hekayə vərəqi emulyasiyada yoxlanıb), Təqvim/Sənədlər/Tapşırıqlar boş məlumatla baxılıb.
- v149: Sahibkar ekranında səhifə yana daşırdı (telefonda ekranın 60%-i qədər kiçilirdi) — `.odash`/`.oside` grid uşaqlarına min-width:0, cədvəllər kartın içində sürüşür.

## 17.11.2026 — Baş Ofis v150: VMM mobil UX paketi köçürüldü (hamıya)
- Yeni fayl `assets/ofis-ux.js` (VMM `vmm-ux.js`-dən; ofis.html və SW keş siyahısına əlavə edilib): alt menyu aşağı sürüşəndə kiçilir (`body.dk-mini`), toxunanda/sürüşdürəndə şüşə linza (`#dock.lq-on`), aşağı çəkib yeniləmə (`#ptr` → `loadAll()`), bölmələr arası sağa-sola keçid (sıra alt menyudakı kimi), aylıq hesabat tətbiq daxilində önizləmə + PDF (`ofisReport`, html2canvas + jsPDF cdnjs-dən).
- ofis-b.js: `dkPill` faizlə yerləşir; Çat↔Lent öz jesti söndürüldü (ümumi keçidlə toqquşmasın, çat otağında kənardan geri qalır); profil menyusunda «Şifrəmi dəyiş».
- ofis-a.js: İşçilər cədvəlində bütün sətir toxunulandır; `monthReport` seçilmiş ayı götürür, `ofisReport` yoxdursa köhnə çapa qayıdır.
- CSS `ofis-app.css` sonunda «Mobil UX» bloku. Linzadakı rəngli (göy qurşağı) haşiyə unslop qaydasına görə KÖÇÜRÜLMƏDİ, neytral şüşədir.
- KÖÇÜRÜLMƏDİ: sabit başlıq (Baş Ofisdə mobil başlıq şəffafdır və məzmunla sürüşür — dizayn fərqi), «yalnız HR» rolu, VMM rəngləri/Cloudflare hissəsi.
- Yoxlama: emulyasiyada (390px) keçid, kiçilmə, yeniləmə, menyu üzərində sürüşdürmə, hesabat önizləməsi işləyir. Real iPhone-da yoxlanmayıb; PDF yükləmə düyməsi sınaqdan keçirilməyib.

## 17.11.2026 — Sayt: video giriş (buludlardan dron enişi, gündüz)
- Higgsfield (Nihatın hesabı, Plus plan; bağlayıcı yalnız oxuyur — generasiya Claude tətbiqinin daxili brauzerində higgsfield.ai üzərindən edilir, hər generasiyadan əvvəl kredit təsdiqi alınır). Seedance 2.0, 5 san, 16:9, 1080p, səssiz, 60 kredit. Mənbə: assets/intro/day.jpg (1920×1080, CORS açıq — _headers).
- Üsul: video TƏRSİNƏ çəkilir (render → kamera qalxır → bulud), sonra ffmpeg `reverse` ilə çevrilir: eniş dəqiq bizim kadrda bitir. Xam fayl: /tmp/intro/day_raw.mp4.
- Fayllar: assets/intro/day.mp4 (1600×900, ~1,7 MB), day-m.mp4 (960×540, ~0,75 MB, <760px).
- Kod (v4.js/v4.css, /tmp/psite, build4.py): `html.vintro` → `.hvid` video hero-nun üstündə oynayır, `vplay` (başladı), `vtxt` (3,4 san — mobil kart görünür), `vout` (son 0,9 san əriyir), sonra `intro`+`vintro` silinir və `intro-done`. Yalnız açıq (gündüz) temada, sessiyada bir dəfə; reduced-motion / saveData / 2g / video 3 san-də başlamasa köhnə CSS girişi qalır.
- Gecə versiyası hələ yoxdur (assets/intro/night.jpg hazırdır): tünd temada köhnə CSS girişi işləyir.
- 17.11 (düzəliş): keçid hiss olunurdu — model ilk kadrı renderdən ~1% böyük və ~10px sürüşmüş çəkmişdi. `/tmp/intro/proc.py`: bütün kadrlar homografiya ilə renderə oturdulur; son ~1,3 san renderin özündən sintez olunur (videodan ölçülmüş kamera yolu ilə, yavaşıyıb dayanır), real kadrla yumşaq qarışır, kənarda maska; son kadr = render. Video 6,1 san. Kodda `vout` son 0,25 san, əriyiş 0,45 san; mətn/nöqtə gecikmələri +1 san. Fayllar: day.mp4 1920×1080 crf25 (~3,9 MB), day-m.mp4 1120×630 (~1,7 MB). Master: /tmp/intro/day_master.mp4. Gecə üçün eyni skript: `python3 proc.py night_raw.mp4 assets/intro/night.jpg night_master.mp4`.
- 17.11: brauzer köhnə day.mp4-ü 4 saat keşdən oynadırdı (yeni kodla uyğunsuz) → fayllar day-v2.mp4 / day-v2-m.mp4 adlandırıldı. QAYDA: video dəyişəndə fayl adını da dəyiş.
- 17.11: Nihatın iMac-ında (geniş, alçaq pəncərə) 16:9 hero ekrandan hündür idi, başlıq aşağıda kəsilirdi. ≥901px: `--hx` (56.25vw − 100svh + 56px artığı) qədər bölmə kəsilir (`.hero-sec` overflow hidden), `.hero` yuxarı sürüşür (nöqtələr və video yerində qalır), `.hcap` görünən hissənin altına qalxır.
- 17.11: Nihatın çəkilişində sıçrayış videonun İÇİNDƏ idi (video t≈4,5–5,0 san): kamera hələ enərkən menyu (backdrop-blur), tündləşmə və yazılar açılırdı, video bir anlıq donub irəli atılırdı. İndi video oynayarkən heç nə açılmır (`html.vintro` → hamısı opacity 0); video bitəndə `out()` → `vrev` sinfi ilə menyu/yazı/nöqtələr 0,7–1,5 san-də açılır. `vtxt`/`vplay`-ə bağlı gecikmələr silindi. DƏRS: telefonla çəkilmiş videoda sıçrayışı parlaqlıq/zaman xətti ilə video vaxtına bağla, yalnız son kadrı müqayisə etmə.
- 17.11: **Giriş ayar aləti** — https://luxresidence.az/?ayar=giris (assets/intro-tuner.js, yalnız bu ünvanda yüklənir; ayar localStorage `lux_tuner_v1`-də qalır, canlıya təsir etmir). Nihat şəklin kəsilmə yerini, videonun sürüşmə/böyütməsini, başdan/sondan kəsməni, sürəti, əriyişi, yazı gecikməsini tənzimləyir, sıçrayan anı işarələyir və `LUX1 pos=… fit=… nav=… | x=… y=… s=… a=… b=… r=… f=… d=… | m=… | ExH` kodunu göndərir. Tətbiq: index.html-də v4 blokundan əvvəl `<script>window.LUX_HERO={pos,fit,nav};window.LUX_INTRO={x,y,s,a,b,r,f,d};</script>` (v4.js bunları defoltların üstünə yazır) — /tmp/psite/v4.body.html-ə əlavə et, build4.py.
- 17.11: hero kəsilməsi yuxarıdan yox, AŞAĞIDAN (pos=0) — 3, 8, 9-cu binalar kəsilirdi. `--hpos/--hfit/--hnavpx/--hmt` dəyişənləri (#v-ana), `window._luxHero`, `window._luxIntro`.
- 17.11: Nihat alətdə sıçrayışı 4,94 san-də işarələdi (ekranına computer-use ilə baxıldı: Chrome, 2800×1309, alət işləyir). Kadr-kadr ölçmə: v2 videosunda 4,3–4,6 san arası kamera addımları xaotik idi (‰: −2,8 / +6 / +15,8 / −2) — keçid zonasında hər kadr üçün ayrıca homografiya səs-küylü idi; üstəlik modelin öz videosunda hər 4-cü kadr ikiqat addımdır. **v3** (`/tmp/intro/proc2.py`): ardıcıl kadrlardan kamera yolu ölçülür, 5-ci dərəcəli polinomla hamarlanır, real kadrlar hamar yola düzəldilir, son 20 kadrlıq yol 40 kadrda yumşaq dayanır (x=20(1−u)²), real→sintetik keçid x=16→8. Addımlar indi ~7‰ sabit, sonra rəvan 0-a enir. Fayllar day-v3.mp4 / day-v3-m.mp4 (v2 silindi), 6,2 san.
- 17.11: Nihatın kodu `LUX1 pos=0 fit=0 nav=1 | x=0 y=0 s=1 … | m=4.11,4.81,4.83,4.88 | 1927x1044` → **fit=0 canlıda defolt** (şəkil kəsilmir, tam 16:9). İşarələr v3-də real→sintetik qarışıq zonasına düşürdü (x=16→8): real videoda paralaks var, düz şəkildə yox → "oynama". **v4** (`/tmp/intro/proc3.py`): real kadrlar (iki qonşu kadr hamar yola gətirilib qarışdırılır) sona qədər gedir; yalnız x≤5-də (son ~0,9 san, kamera demək olar dayanıb) renderə DIS optical-flow morfu ilə keçir (0-cı kadrla render arası yerli fərq orta 0,47 px). Fayllar day-v4.mp4 / day-v4-m.mp4. Alət kodu indi video faylının adını da yazır.

## 17.11.2026 — Nizami City: giriş videosu (hazırlıq, hələ sayta QOYULMAYIB)
- Nihatın şəkli (Modern_Nizami_City_Entrance.png, 1536×1024) → 16:9 kəsim `assets/intro/nc-day.jpg` (1920×1080), orijinal `nc-day-src.jpg`.
- Higgsfield Seedance 2.0, 1080p: 1-ci cəhd 5 san (60 kredit) — məsafə az, rədd edildi; 2-ci cəhd 8 san (96 kredit): kamera darvazadan geri uçur, ağacların arasından qalxıb kompleksi uzaqdan göstərir. Xam: /tmp/intro/nc2_raw.mp4.
- Emal `/tmp/intro/proc4.py` (proc3 + uzaq hissə 3x→1x sürətlə, 113→56 kadr; hamar yol düzəlişi yalnız son 32 kadrda — ön planda ağac olanda ölçmə etibarsızdır). Nəticə 6,83 san, son kadr = nc-day.jpg. Master /tmp/intro/nc2_master.mp4; veb fayllar /tmp/intro/nc-v1.mp4 (6,8 MB — sayta qoymazdan əvvəl kiçilt), nc-v1-m.mp4.
- Plan: sonda şəkil axşam rejiminə keçsin (eyni kadrın axşam versiyası lazımdır) + «NIZAMI CITY» tağı ətrafında nazik xətt (kodla). Nizami saytının hero-su slayderdir (nc/site-src/v2|v3) — inteqrasiya ayrıca addımdır.
- Higgsfield balansı: 1000 − 60 (LUX) − 60 − 96 = ~784 kredit.
- 17.11 (sayta qoyuldu): **Nizami City ana səhifə — tam ekran kinematik giriş.** Mənbə `nc/site-src/v3/intro.css` + `intro.js` (build.py CSS/APP-ə əlavə edir); `heroBlock` → `.hero.cine`, ilk slayd `gate` (assets/nc/site/gate-2560/1280.webp — Real-ESRGAN ilə böyüdülmüş 16:9 kəsim; əvvəlki `front` slaydı çıxarıldı). Video `assets/nc/intro/gate-v1.mp4` (1080p, 4,4 MB) / `gate-v1-m.mp4` (720p, 2,2 MB) — masterin 1,0-ci saniyəsindən (Nihatın seçdiyi an), 5,8 san. Menyu şüşə kimi üstdə (`html.nc-cine .hd-in`), yaşıl təklif kartı şüşə (`.hero.cine .offer`), video zamanı yığılı (`html.nci`), bitəndə açılır; «Keç» düyməsi; sessiyada bir dəfə (`sessionStorage.nc_intro`); slayder video zamanı və sonrakı 5 san dayanır (`window.__nci/__nciT`). DİQQƏT: `heroIntro` ilk render zamanı intro.js oxunmadan çağırılır — yuxarı səviyyədə const istifadə etmə.
- Qalır: axşam rejiminə keçid (eyni kadrın axşam versiyası lazımdır), tağ ətrafında xətt.


### Nizami City: giriş ekranı — kartların səliqəsi və şəklin oturması (17.11.2026)
- Səbəb (şəkil videodan sonra sürüşürdü): plus.css-də `.slide` qutusu −7%/114% idi, şəkildə Ken Burns böyütməsi (1.02→1.11) və scroll parallaksı (`--py`) vardı; video isə inset 0, böyütməsiz. `.hero.cine` üçün slayd qutusu inset 0 / transform yox, birinci slaydın şəklində böyütmə və animasiya söndürüldü. Ölçü: videonun son kadrı ilə gate-2560.webp arasında sürüşmə 0,03 px (1080p) / 0,05 px (720p); səhifədə video və şəkil qutuları eynidir (1440, 2576, 390).
- Kompozisiya: başlıq + mətn + slayd nöqtələri/oxları bir tünd şüşə kartda (solda, menyunun sol kənarı), kredit təklifi yaşıl şüşə kartda (sağda, menyunun sağ kənarı); ikisi eyni alt xətdə (`--cb`), eyni radius/padding. Nöqtələr və oxlar `.hero-c` sətrinə köçürüldü (app.js heroBlock). Telefonda başlıq kartı yuxarıda, təklif aşağıda.
- `.offer .big` parıltılı qradiyent mətn giriş ekranında söndürüldü (düz ağ). Mətn: «12, 18 və 24 aylıq».
- Düzəliş (17.11, 15:30): Nihatın iMac-ində şəklin üstündə ~14 px açıq zolaq qalırdı (məndə təkrarlanmadı; `--hdh` menyunun ölçülən hündürlüyünə bağlı idi). İndi `heroIntro` şəklin səhifədəki yerini (offsetTop zənciri, animasiyadan asılı deyil) ölçüb qalan boşluğu özü bağlayır; şrift yüklənəndə, menyu/səhifə ölçüsü dəyişəndə (ResizeObserver) və 60 ms–2,5 s arası təkrar yoxlayır. Test: 2576, 1440, 820, 390 — üst boşluq 0.
- Düzəliş (17.11, 15:35): Nihatın istəyi ilə video vaxtı yaşıl kart artıq yığılı görünmür — video oynayarkən yalnız menyu və «Keç» var; bitəndə başlıq kartı və kredit kartı eyni anda, eyni hərəkətlə (0,7 s) gəlir.

## 17.11.2026 — Baş Ofis v151: Davamiyyət cədvəlində vəzifə
- «Davamiyyət» (gün cədvəli, `renderDay`) sətirlərində adın yanında mötərizədə vəzifə: `posOf(e).title`, sinif `.dt-pos` (solğun, qalın deyil). Vəzifəsi təyin olunmayan işçilərdə (72-dən 29-u, əsasən LUX Tikinti) mötərizə göstərilmir.
- Test (harness, 1440 və 390): 43 sətirdə vəzifə görünür, daşma yoxdur.

## 17.11.2026 — Baş Ofis v152: ana səhifədən sürətli icazə sorğusu
- Ana səhifədə giriş/çıxış kartının içində (`#tPerm`, `qpHome`) «İcazə al» düyməsi. Modal (`qpOpen/qpDraw/qpSend`): Tez çıxıram / Gec gəlirəm / Arada çıxıram / İş tapşırığı: ofisə sonra gəlirəm; 15 dəq–3 saat; Bu gün / Sabah; səbəb məcburidir.
- Sxem dəyişməyib: `office_leaves`-ə `type='icaze'`, `hours=dəq/60`, növ və müddət `reason`-un əvvəlində yazılır; status pending → mövcud «Sorğular → gözləyənlər» növbəsinə düşür, `notify('leave_new')` gedir. Eyni günə ikinci gözləyən sorğu bloklanır.
- Təsdiq: Baş Ofisdə ayrıca «HR» rolu yoxdur — təsdiqi `ofis_admin` icazəsi olan 3 nəfər verir (RLS: `office_is_mgr()`). Yalnız HR-ə bağlamaq Nihatın qərarını gözləyir.
- `lvRange` saatlıq icazəni dəqiqə ilə göstərir (`qpDur`). Davamiyyət cədvəlində təsdiqlənmiş saatlıq icazəsi olan və gəlmiş işçidə «icazəli · müddət» nişanı.
- AÇIQ: təsdiqlənmiş icazə gecikmə/tez çıxma dəqiqələrini (late_min/early_min) avtomatik silmir — tabeldə «X dəq gec» yanında «icazəli» görünür. Gecikmənin sayılmaması HR/davamiyyət qaydasıdır, Nihatın sözü ilə ediləcək.
- Düzəliş (18.11.2026, rəhbərlikdən WhatsApp ilə gələn mətn): giriş ekranında başlığın altı «Yasamal r-nu, Nizami m/st-nın yanında qapalı həyətli yaşayış kompleksi»; kredit kartının mətni «12, 18 və 24 ayadək daxili kredit şərtlərindən yararlanın.» (əvvəlki «Mənzili hissə-hissə alın…» cümləsi çıxdı). «Layihə haqqında» və «Ödəniş» bölmələrindəki mətnlərə toxunulmayıb.

### Nizami City: təmirli mənzilin real şəkilləri plan kartında (18.11.2026)
- A2-7-1 (87,95 m², 2 otaqlı, A/E planı) üçün 9 real təmir şəkli: `assets/nc/temir/87_95/1..9.webp` (960×1280) + `N-s.webp` (kiçik). Cəmi ~680 KB.
- `plans.js`: `window.NC_REPAIR` (açar = plan sahəsi, dəyər = şəkil başlıqları sırası) və `ncRepair(plan)`. Yeni mənzil əlavə etmək: şəkilləri `assets/nc/temir/<sahə_alt-xətlə>/` qovluğuna qoy, NC_REPAIR-ə sətir əlavə et.
- `plus.js`: tip kartında (`tCard`) plan şəklinin üstündə «Təmirlisi var · 9 şəkil» düyməsi (`data-rep`) — basanda səhifədən çıxmadan şəkil baxışı açılır (`openRep`); plan/mənzil səhifəsində plan kartının altında «Təmirli mənzil» qalereyası (`repBlock`, `data-lb="rp"`, mövcud lightbox; `data-full` dəstəyi `bindLb`-ə əlavə olundu).
- Otaq adları şəkillərə görə mənim təxminimdir (Zal və mətbəx, Zal, Yataq otağı ×2, Holl, Dəhliz, Sanitar qovşaq, Qarderob, Köməkçi otaq).
- (18.11, davamı) Daha iki təmirli mənzil əlavə olundu: A2-6-5 (154,53 m² → plan 154,76; 15 şəkil, `assets/nc/temir/154_76/`) və A2-6-6 (82 m² → plan 81,91; 13 şəkil, `assets/nc/temir/81_91/`). İndi 3 planda «Təmirlisi var» nişanı var: 81,91 · 87,95 · 154,76. 154 m² kartı «Mənzillər»də «Daha çox göstər»dən sonra görünür. Otaq adları yenə şəkilə görə təxmindir.
- (18.11, davamı) B-4-2 (162,91 m² → plan 163,21; 18 şəkil, `assets/nc/temir/163_21/`) əlavə olundu. İndi 4 planda «Təmirlisi var» nişanı var: 81,91 · 87,95 · 154,76 · 163,21.
- (18.11, davamı) C1-9-4 (80,73 m², C/G planı; 8 şəkil, `assets/nc/temir/80_73/`) əlavə olundu. İndi 5 planda «Təmirlisi var» nişanı var: 80,73 · 81,91 · 87,95 · 154,76 · 163,21.
- (18.11, davamı) C2-5-2 (119,97 m²): 13 şəkil `assets/nc/temir/119_97/`-də hazırdır və NC_REPAIR-də '119.97' açarı ilə yazılıb, AMMA bu sahənin planı yoxdur (C binasında ~120 m²-lik mənzillər — C2-5-2, C2-6-2, C1-8-5, C2-8-2, C2-9-5 — plansızdır, planı olmayan tip saytda göstərilmir). Plan şəkli gələndə NC_PLANS-a '119.97' əlavə etmək kifayətdir.

### Nizami City: ana səhifədə «Təmirli mənzillər» lenti + filtr (18.11.2026)
- Ana səhifə (`pages.home`), «Binalar»dan sonra: `repHome()` / `bindRepHome()` (plus.js). Təmirli şəkli olan hər plan üçün bir kart (indi 5 plan, 63 şəkil); lent fasiləsiz sola axır (CSS `rhmv`, 46 s, 4 nüsxə — geniş ekranda boşluq qalmır), hər 1,6 s-də növbəti kartın şəkli yumşaq dəyişir. Kursor üstünə gələndə dayanır; bölmə ekranda deyilsə işləmir; `prefers-reduced-motion`-da hərəkətsiz, əl ilə sürüşdürülən sıra.
- Karta və «Təmirlilərə bax» düyməsinə basanda `#menziller?rp=1` açılır: yeni filtr `F.rp` («Real şəkillər: Hamısı / Təmirlisi var»), `filtered()`-də `ncRepair(ncPlan(...))` şərti, URL-də `rp=1`. Belə gələndə səhifə nəticələrə sürüşür.
- Yeni təmirli plan əlavə olunanda (NC_REPAIR) lent və filtr avtomatik yenilənir.

### Nizami City ana səhifə: 3 dizayn istiqaməti (18.11.2026, seçim gözləyir)
- Kətan: https://claude.ai/artifact/9zbqPBeGXNUqgUB7B4HRro — A «Jurnal» (açıq krem fon, Imbue serif başlıqlar, iri foto mozaikası), B «Alət» (ağ fon, axtarış paneli və plan kartları öndə), C «Kino» (tünd zeytun fon, 5 nömrəli səhnə, nəhəng yazı). Hamısı brend rəngləri və real məzmunla (rəqəmlər saytdan; uydurma yoxdur).
- 20.11.2026: Nihat B «Alət» variantını seçdi → quruldu və canlıdadır (aşağıda).

## 19.11.2026 — 3D (3d.html): mənzillərin dünya tərəfləri satış ofisinin cədvəlinə uyğunlaşdırıldı
- Mənbə: Nihatın göndərdiyi əlyazma cədvəl (16-cı mərtəbə): №1 111,64 cənub-qərb · №2 70,37 qərb · №3 134,33 şimal-qərb · №4 73,42 şimal-şərq · №5 150,66 şimal-şərq · №6 174,53 cənub-şərq.
- Səbəb: 3D «№1 dəniz və Alov qüllələri tərəfdədir» fərziyyəsi ilə qurulmuşdu — hər mənzil 90° səhv idi. Əslində dənizə baxan fasad 4-5-6-dır, №6 Alov qüllələrinə ən yaxın küncdədir.
- Düzəliş: yeni tək sabit `BAY_F=(-0.76,0,0.65)` (əvvəl 3 yerdə təkrarlanan `(-0.65,0,-0.76)`): dəniz/şəhər/Alov qüllələri qrupu (`bay`), kompas (`PHI_N`) və qonşu məhəllələr (`NEIGH`) ondan asılıdır. Nəticə: −z fasadı (1,2,3) = qərb, +z (4,5,6) = şərq, −x ucu = cənub, +x ucu = şimal; Alov qüllələri 141,6° (cənub-şərq). Binanın həndəsəsi və mənzil nömrələmə dəyişməyib.
- Ardınca: «Dəniz · Alov qüllələri tərəfi» nişanı 4-5-6 tərəfə keçdi; «Eyvandan mənzərə»də dəniz tərəfi `side*BAY_F.z>0` ilə təyin olunur və baxış əvvəlcədən qüllələrə doğru çevrilir; tur «Mənzərə» addımı avtomatik uyğunlaşır; günəş/kölgə və mənzil panelindəki «Pəncərələr … tərəfə baxır» yeni kompasla hesablanır.
- Yoxlama (headless, Bina 3, 16-cı və 10-cu mərtəbə): 1 Qərb+Cənub, 2 Qərb, 3 Qərb+Şimal, 4 Şərq+Şimal, 5 Şərq, 6 Şərq+Cənub — cədvəllə eyni (yalnız №5 cədvəldə «şm-şq», 3D-də sırf şərq). Konsol xətası yoxdur.
- Ana səhifənin gündüz/gecə müqayisə şəkilləri (`assets/3d-gunduz.webp`, `3d-gece.webp`) yeni səhnədən yenidən çəkildi: `__lux3d.cam(175,100,-150)`.
- Yeni test qarmaqları: `__lux3d.dirs(mərtəbə)` (hər mənzilin tərəfi), `.view(n)` (eyvan baxışı), `.bina('Bina 4')`.
- QEYD: bütün binalar eyni oriyentasiya ilə modellənib; cədvəl bir bina üçündür. Başqa binalar fərqli dönübsə, bina üzrə ayrıca fırlanma lazım olacaq (hələ yoxdur).

## 19.11.2026 — Baş Ofis: «Nizami City komendant ofisi» iş yeri və 5 işçi
- office_locations 5 «Nizami City komendant ofisi» (koordinat müvəqqəti satış ofisi ilə eyni, radius 100000 — real nöqtə verilməlidir; QR ayrıdır). Şöbə «Nizami City komendant ofisi» + vəzifələr: Komendant, Menecer, Dalandar, Xadimə (2).
- Yenidən aktiv edildi (hesab bloku açıldı, parol 123456-ya qaytarıldı): Niyaz Qasımov (emp 48, Komendant, 09:00–18:00), Xəyalə Yusubova (emp 49, Menecer, 08:00–17:00).
- Yeni: Şölə Nuriyeva (emp 94, Xadimə), Mirzə İsmayılov (emp 95, Dalandar), Sənubər Əliyeva (emp 96, Xadimə) — 08:00–17:00, ad.soyad@pilothayat.az / 123456, perms ofis.
- Hamısı B.e–Cümə; yeni üçünün hire_date = 19.11.2026 (real işə qəbul tarixi verilsə dəyişdirilməlidir). Şənbə qrafiki soruşulmalıdır.

## 19.11.2026 — Qapı cihazı başqa iş yerinin işçisinə çıxış yazırdı (düzəldildi)
- Hal: Aysel Teymurzadə (emp 42, Nizami satış ofisi) axşam QR ilə çıxış vura bilmədi — «Çıxış artıq qeyd olunub». Səbəb: LUX Tikinti qapı cihazında (VGU6261301547) PIN 42 altında yazılmış barmaq izi gün ərzində basılıb (10:44, 15:30, 16:02) və `_bio_att` bunu onun çıxışı kimi yazıb. Barmaq onun deyil — çox güman cihazda başqa işçi (ola bilsin Aysel Əliyeva, emp 52 — bio_users-də öz qeydi yoxdur) səhvən bu adla qeydə alınıb.
- Düzəliş: `_bio_att` — işçinin location_id-si cihazın iş yerindən fərqlidirsə (və extra_sites-də yoxdursa) davamiyyətə toxunmur, qapı jurnalına «başqa iş yeri · davamiyyət yazılmadı» düşür. Baş Ofis işçiləri (location_id null) üçün davranış dəyişməyib.
- office_attendance id 1073: səhv çıxış (16:02) silindi, qeyd yazıldı; işçi QR ilə özü çıxış vurur.
- Qalan: cihazda PIN 42 barmağının kimə aid olduğu yerində yoxlanıb düz işçiyə bağlanmalıdır.

## 20.11.2026 — Nizami City ana səhifə: B «Alət» istiqaməti quruldu
- Hero (`heroBlock`, app.js): slaydlar və başlıq kartı çıxdı; video/son kadr üstündə solda şüşə axtarış kartı `form.hero-f#fd` (otaq sayı, Bina, Sahə, «Yalnız təmirli şəkilləri olanlar», «Planları göstər», «Seçməkdə kömək et»), sağda kredit kartı. Göndərəndə `#menziller?r=&b=&a0=&a1=&rp=1`. Köhnə `findBlock` ana səhifədən çıxdı (funksiya qalır). Video oynayarkən kartlar gizlidir (kompüter); telefonda (≤900px) kartlar videonun altında düz blokdur və gizlənmir.
- Yeni bloklar (plus.js sonu): `bldTiles()` (Bina A…G düymələri → süzülmüş planlar), `plansHome()` (hər otaq sayından 1 plan, təmirlisi olan öndə, 4 kart; telefonda üfüqi sürüşmə), `payHome()` (TERMS-dən ödəniş cədvəli + «Qiyməti öyrənin»). Ana səhifədən çıxarıldı: bina foto kartları, «satışda olan mənzillər» lenti, promo bloku. Qalır: təmirli lent, maket, rəqəmlər, baş plan, kompleksdə həyat, məkan, bloq, suallar.
- Stil: intro.css sonu (`.hero.cine.hb`, `.hf-*`, `.hb-*`). Həmçinin `.sec.wrap` yan boşluğu düzəldildi (`.sec` qısa yazılışı `.wrap`-ın yan boşluğunu sıfırlayırdı — telefonda bütün bölmələr kənara yapışırdı).
- Test: /tmp/shots/hb.py (1440, 390, 820, 1366×640) — xəta yoxdur, forma və bina düymələri düz süzür.

## 21.11.2026 — Nizami saytının açıq kodunda LUX izi silindi (kənar «texniki müqayisə» PDF-i)
- Kənar təhlil (2 səhifəlik PDF) hər iki saytın eyni Supabase layihəsindən istifadə etdiyini göstərdi; Nizami mənbəyində `lux_kv` cədvəl adı görünürdü — «Nizami saytında LUX heç yerdə görünməsin» qaydasına zidd idi.
- Düzəliş: `public.nc_kv` görünüşü (security_invoker, yalnız `nc_%` açarlar; anon yalnız açıq açarları görür: nc_site, nc_blog, nc_cfg). `nc/site-src/runtime.js` indi `/rest/v1/nc_kv` oxuyur; şərhlərdən «LUX» silindi. `nc/site.html`-də «lux» sözü: 0.
- Qalan iz: Supabase layihə ünvanı (avqchschbbltnnasabdm) və anon açar hər iki saytda eynidir — tam ayırmaq üçün Nizamiyə ayrıca Supabase layihəsi və ya öz domenində proksi (api.nizami-city.az) lazımdır. Qərar gözləyir.
- Təhlükəsizlik yoxlandı: lux_kv, lux_leads, nc_leads — RLS açıq; anonim istifadəçi yalnız müraciət göndərə bilir, oxuya/dəyişə/silə bilmir.

## 21.11.2026 — 3D: mənzil sahəsi saytdakı plan səhifəsi ilə eyni göstərilir
- Səbəb: 3D hər mənzilin sahəsini satış cədvəlindən oxuyurdu (məs. Bina 3 №1 = 111,62), plan səhifəsi isə plan tipinin sahəsini (111,64) göstərir — müştəri iki fərqli rəqəm görürdü.
- Düzəliş (3d.html `units()`): mənzil saytdakı tipə (`lux_apartments`, `area` + `alt`, ±0,05, sonra ±0,5) uyğunlaşdırılır və etiketdə, paneldə, «Baxışa yazıl» mətnində tipin sahəsi göstərilir; satış cədvəlindəki əsl rəqəm `area0`-da qalır. Uyğun tip tapılmayan mənzil öz sahəsi ilə qalır.
- Satış sistemindəki sahələrə toxunulmayıb (müqavilədə istifadə olunur). Qeyd: Bina 4-də №1 sırasında 3 fərqli sahə var (111,62 / 111,64 / 111,34), 10-cu mərtəbə №2-nin sahəsi boşdur — satış şöbəsi yoxlamalıdır.

## 21.11.2026 — 3D: bütün mərtəbələrdə eyni düzülüş; №5 «Şimal-şərq»
- İstək (Nihat): «16-cı mərtəbədə necədirsə, ardıcıllıq bütün mərtəbələrdə eyni olsun». Səbəb: satış cədvəlində bir çox mərtəbədə sahə boş və ya fərqlidir (məs. Bina 3 №3: 134,08 / 125 / 92; Bina 5-in 4–6-cı mərtəbələri tam boş), 3D isə plitənin enini və mini planı sahədən çıxarırdı — mərtəbələr fərqli görünürdü.
- Düzəliş (3d.html): `canonOf(bina)` — hər mənzil nömrəsinin tipi ən yuxarı tam mərtəbədəki sayt tipindən götürülür; `units(f)` mərtəbədə mənzil sayı eynidirsə həmin tipi tətbiq edir (sahə, otaq sayı, plan, en). Status (satışda/satılıb) və satış cədvəlinin öz rəqəmləri (`area0`) dəyişmir.
- №5 (6 mənzilli mərtəbələrdə): paneldə və `__lux3d.dirs`-də istiqamət «Şimal-şərq» (əvvəl «Şərq») — satış ofisinin cədvəlinə uyğun (`dirTxt`). Günəş saatı hesabı əvvəlki kimi real fasada görədir.
- Test /tmp/shots/t3b.py: Bina 3–6, mərtəbə 3–16 — hamısında 1:111.64, 2:70.37, 3:134.33, 4:73.42, 5:150.66, 6:174.53; xəta yoxdur. Bina 7, 8-in satış məlumatı yoxdur (mənzil göstərilmir — köhnə hal).

## 24.11.2026 — Baş Ofis: Nizami City üzrə 5 yeni işçi + 24 saatlıq növbə rejimi
- Yeni (iş yeri «Nizami City komendant ofisi», loc 5; ad.soyad@pilothayat.az / 123456; geo_exempt=true, plan_required=false): Kamil Əsədov (emp 97, Mühafizəçi, 24 saat rejim), Hikmət Aslanov (98, Fəhlə, 08:00–18:00), Məcnun Mirzəyev (99, Fəhlə, 08:00–18:00), Sabir Kərimov (100) və Əlikram Yaqubov (101) — vəzifə və saat verilməyib, müvəqqəti 09:00–18:00, vəzifəsiz.
- Yeni vəzifələr (şöbə 19): Mühafizəçi, Fəhlə.
- **24 saatlıq növbə** — yeni sütun `office_employees.shift24` (default false). `office_check` (5 arqumentli): shift24 işçidə gecikmə/tez çıxma 0 yazılır; dünən açıq qalan növbə (36 saata qədər) bu günkü ilk QR skanı ilə bağlanır («Növbə bitdi · çıxış qeyd olundu»), yeni növbə üçün ikinci skan lazımdır. Kamildə workdays = [] (hər gün «gəlməyib» sayılmasın). Paneldə bu rejim üçün hələ düymə yoxdur — bazadan qoyulur.

## 24.11.2026 — Baş Ofis davamiyyət auditi (QR + barmaq izi cihazı) — v153
**Tapılan əsas səhv (mənim 19.11 düzəlişim):** `_bio_att`-a qoyduğum «işçinin iş yeri cihazın iş yerindən fərqlidirsə yazma» qaydası LUX Satış (loc 1) və LUX Köçürmə (loc 2) işçilərini də kəsirdi — onların çoxu (mühafizə, xadimə, komendant və s.) tətbiqə heç girmir, davamiyyəti yalnız LUX qapısındakı cihazla (VGU6261301547) yazılır. 19–24.11 arası 337 keçid «başqa iş yeri» kimi atılmışdı.
**Düzəlişlər (baza):**
- `bio_devices.info.att_locations=[1,2,3]` — cihaz LUX-un üç iş yerinin və iş yeri təyin olunmayanların davamiyyətini yazır; başqa əraziyə (Nizami 4, 5) bağlı işçiyə toxunmur.
- `_bio_att` yenidən yazıldı: gəliş = günün ən erkən keçidi, çıxış = ən son keçidi (sıra qarışıq gəlsə də); gün ortası keçid (iş bitməsinə 90 dəq-dən çox qalmış, bu gün) çıxış kimi yazılmır → işçi gün ortası «getdi / N dəq tez» görünmür; Telegram «getdi» yalnız axşam bir dəfə; köhnə jurnal emalında bildiriş getmir; istirahət/bayram günü gecikmə və tez çıxma 0.
- `office_att_finalize()` + cron `office-att-finalize` (hər gün 23:55 Bakı): barmaqla gəlib axşam çıxış keçidi olmayanın günün son keçidi çıxış yazılır.
- Növbəli rejim (`office_employees.shift24`): mühafizəçilər Faiq Babayev (65), Gülrza Atakişiyev (66), Babək Aslanov (79), Kamil Əsədov (97) — gecikmə/tez çıxma yoxdur, workdays=[]; cihazda 9 saatdan az fasiləli keçidlər bir növbədir (gecəni keçir), QR-da dünənki açıq növbə bu günkü skanla bağlanır.
- `bio_scan`: eyni keçid (sn+pin+vaxt) ikinci dəfə emal olunmur (əvvəl cihaz jurnalı təkrar göndərəndə `_bio_att` yenə işləyirdi).
- `office_check` (5 arq.): radiusu ≥50 km olan iş yerində GPS tələb olunmur (Nizami — «GPS cavab vermədi / yer məlumatı alınmadı» xətası); istirahət/bayram günü gecikmə/tez çıxma 0 (`office_is_workday`); çıxış artıq yazılıbsa daha gec skan onu yeniləyir; köhnə 4 arqumentli variant yenisinə yönləndirildi (iş yeri qaydalarından yan keçirdi). `office_outing_end`-də də eyni GPS qaydası.
**Tətbiq (v153):** ana kartda çıxış yazılandan sonra «Çıxış vaxtını yenilə» düyməsi; növbəli işçi üçün «Növbəni başlat / bitir»; işçi formasında «Növbəli rejim» qutusu; cədvəllərdə növbəli işçi üçün «növbədə deyil».
**Qeydlərin bərpası:** 337 atılmış keçid yeni qayda ilə yenidən emal edildi (19–24.11, 34 yeni qeyd, 59 qeyd düzəldi); bu günün gün ortası «çıxış»ları geri alındı; növbəli işçilərdə və istirahət günlərində yazılmış gecikmə/tez çıxma sıfırlandı. Əvvəlki vəziyyət: `public._att_backup_20261124` (01.11-dən bütün qeydlər; RLS bağlı).
**Qərar gözləyən:** LUX-un real iş rejimi (məlumatda gəliş ~07:30–08:00, çıxış ~17:00–18:00, şənbə işlənir; sistemdə hamı 09:00–18:00, B.e–Cümə); PIN 42 (Aysel Teymurzadə adına yazılmış barmaq — kimindir); iş yeri boş olan, amma LUX-da cihazla işləyən 3 nəfər (İlham Abbasov 44, Elməddin Quliyev 46, Səbinə Dadaşova 47); 14 gündür keçidi olmayan 8 LUX Tikinti işçisi (78, 75, 73, 70, 80, 81, 82, 77); mühafizəçilərin 19.11-dən əvvəlki qarışıq qeydlərinin yenidən qurulması; QR-da çıxışı tez-tez unudanlar (Fəridə Əliyeva 13, Raul Cavadov 7, Günel Hüseynli 4 gün).

## 24.11.2026 (2) — Cihaz PIN toqquşması düzəldildi; bildiriş pəncərəsində «Chrome-da aç» (v154)
- **PIN toqquşması:** `bio_users`-də 42, 44, 46, 47 nömrələri köhnə «PIN = işçi id» fərziyyəsindən qalmışdı (Aysel Teymurzadə, İlham Abbasov, Elməddin Quliyev, Səbinə Dadaşova), qapı cihazında isə eyni nömrələrlə əllə başqa adamlar yaradılıb (`bio_dev_users`): 42 «Xeyyam qaz», 44 «elman elektrik», 46 «Seymur qapi», 47 «Qosqar fasad». Nəticə: podratçıların keçidləri bu 4 işçinin davamiyyəti kimi yazılırdı (sonuncu üçü deaktiv işçidir). 4 sətir `bio_users`-dən silindi (ehtiyat: `public._bio_users_backup_20261124`); cihazdakı barmaqlara toxunulmadı — qapı onlar üçün açılır, jurnalda «tanınmır» düşür.
- `_bio_att`: deaktiv işçinin davamiyyəti yazılmır («işçi aktiv deyil»).
- Qalıb (silmək üçün təsdiq gözləyir): İlham Abbasov 6, Elməddin Quliyev 2, Səbinə Dadaşova 11 günlük yalançı «barmaq» qeydi (12–24.11).
- **Bildiriş pəncərəsi (ofis-b.js `pushGateRender`):** Android-də push dəstəkləməyən brauzerdə (Xiaomi Mi Browser və s.) artıq «telefonunuzda açın» yox, «Google Chrome-da açın» təlimatı + `intent://…package=com.android.chrome` düyməsi göstərilir. Hal: Xəyalə Yusubova.

## 25.11.2026 — Mövsüm rejimi (Yeni il) — `assets/season.js`
- **Bir açar:** `assets/season.js` başında `SW` — `'auto'` (1 dekabr – 14 yanvar, Bakı vaxtı, özü yanır/sönür), `'on'`, `'off'`; `DEF` — standart variant (`'a'` sakit, `'b'` bayramlı). Dəyişəndə səhifələrdə `season.js?v=N` artırılmalıdır.
- **Sınaq (mövsümdən kənar da işləyir):** `?movsum=a`, `?movsum=b`, söndürmək `?movsum=0` — yalnız həmin brauzer sessiyasında qalır.
- Nə edir: yuxarıda nazik zolaq (mətn tarixə görə: 30.12-yə qədər «Yeni il ərəfəsində mənzilinizi seçin», 31.12 «Həmrəylik günü və Yeni iliniz mübarək», 1–14.01 «Yeni iliniz mübarək») + düymə + bağla (sessiya); loqonun yanında kiçik qar dənəsi; yalnız hero-da seyrək qar (canvas, 30 kadr/san, ekrandan çıxanda dayanır; reduced-motion / saveData / 2g / ≤2 GB yaddaşda yoxdur). B variantı: «Yeni ilə N gün» sayğacı, sıx qar, zolağın altında nöqtə sırası.
- Sayta görə ayar səhifədə `window.SEASON`: rənglər (`bg, fg, ac`), `hero`, `z`, `hideWhen` (giriş videosu zamanı qar gizli), `logo`, `cta` ({click | href | attr, label}), `offer` (kampaniya mətni — verilsə zolaqda əsas mətnin yerinə çıxır), `v`.
- Qoşulub: `index.html` (düymə → «Baxışa yazıl» pəncərəsi), `ru.html` (→ #zayavka), `nc/site-src/v3/index.tpl.html` (zeytun rəngi, düymə → zəng sifarişi; faylda «lux» sözü yoxdur — yoxlanıb). Skript brendsizdir, bütün mətn/rəng səhifədən gəlir.
- Qalıb: variant seçimi (A/B) və kampaniya mətni Nihatdan; qış səhnəsi (hero-nun qarlı axşam versiyası) — şəkil generasiyası tələb edir (kredit), hələ edilməyib; Odeo saytı ayrı repodadır — eyni skript ora da qoşulmalıdır; bayram iş saatları verilməyib.
- 25.11 (2): Nihat **B (bayramlı)** variantını seçdi — `DEF='b'`, səhifələrdə `season.js?v=2`. 1 dekabrda özü yanacaq.

## 26.11.2026 — LUX ana səhifə: geniş ekranda başlıq kəsilmirdi (düzəldi)
- Hal (Nihatın iMac-ı, 2576×1224): `fit=0` (şəkil kəsilmir, tam 16:9) seçildiyinə görə hero pəncərədən hündür olur və başlıq + düymələr ekranın altında qalırdı.
- Düzəliş (`/tmp/psite/v4.css` sonu → build4.py): `html.is-home #v-ana .hero .hcap` üçün `bottom = max(əvvəlki, 56.25vw − 100svh + 150px)` yalnız `--hfit=0` olanda — başlıq görünən hissənin altından ~150 px yuxarıda qalır (kuki pəncərəsi düymələri örtmür). Şəkil və bina nöqtələri dəyişməyib. 1440×900 və 1920×1080-də yer dəyişmir.
- Yan tapıntı: v4.css sonunda artıq bir `}` var idi (özündən sonra gələn qaydanı ləğv edirdi) — silindi.

## 26.11.2026 — LUX «Haqqımızda» səhifəsi dolğun yazıldı
- `#v-haqqimizda` (index.html) yenidən yazıldı: «LUX Residence nədir», «Layihə qısaca» (10 fakt: ünvan, metro, binalar, mənzillər, sahələr, təhvil vəziyyəti, parkinq, təhlükəsizlik, ödəniş, idarəetmə), «Yerləşmə» (məsafələr), «Mənzillər» (otaq sayına görə plan sayı və sahə aralığı, tip səhifələrinə link), «Ərazi», «Təhvildən sonra» (komendant xidməti, sakin kabineti), «Seçim» (3D, baxışa yazıl). Üçüncü göstərici «7/24 mühafizə» → «5 dəq metroya piyada».
- Mənbə yalnız özümüzün təsdiqli məlumatlar: assets/faq.json, İnfrastruktur səhifəsi, pilot.html, lux_apartments (16 plan: 4/1/8/3; 70,37–245,72 m²). Kənar saytlarda etibarlı məlumat tapılmadı. Qiymət, mərtəbə, status yazılmayıb.
- Başlıq/sloqan `lux_content.aboutTitle/aboutText`-dən gəlir — bazada, index.html-də və admin.html defoltunda yeniləndi. Meta description (`functions/_middleware.js`) yeniləndi. Stil: /tmp/psite/v4.css sonu (`.abt-facts, .abt-dist, .abt-rows, .abt-list`).
- DİQQƏT: mənzil tiplərinin sayı və sahə aralığı səhifədə statikdir — plan əlavə olunsa/silinsə əl ilə düzəldilməlidir.
- Nihatdan gözlənilir: tikintinin başlama ili, təhvil verilmiş binalar və növbəti təhvil tarixi, memar/layihəçi, ərazinin sahəsi, binaların mərtəbə sayı (yazmaq olarmı), konstruksiya/fasad materialı, lift markası, istilik sistemi, parkinq yerlərinin sayı, «Pilot Həyat» adının saytda çəkilməsinə razılıq.

## 27.11.2026 — «Seçim» bölməsi: mənzil sahələri 3D ilə eyniləşdirildi
- Satışdan irad: /secim mərtəbə panelində kvadratlar köhnə qalıb (məs. 111,62; 70,67; «2 otaqlı 125 m²»; 149,32; 176,3), 3D-də isə düzəldilib.
- Düzəliş (index.html, `floorUnits`): 3d.html-dəki məntiq köçürüldü — `canonOf(bina)` (mənzil nömrəsinin tipi ən yuxarı tam mərtəbəyə görə) + `_typeOf(sahə)`; göstərilən sahə və otaq sayı saytdakı plan səhifəsindən gəlir, satış cədvəlinin öz rəqəmi `area0`-da qalır. Siyahı mənzil nömrəsinə görə sıralanır, sahə vergüllə yazılır.
- Yoxlandı: Bina 3–6, 3/8/10/16-cı mərtəbələr → №1 2 otaqlı 111,64 · №2 1 otaqlı 70,37 · №3 3 otaqlı 134,33 · №4 1 otaqlı 73,42 · №5 3 otaqlı 150,66 · №6 4 otaqlı 174,53; klik düzgün mənzil səhifəsini açır.
- Qeyd: «Seçim»də Bina 7 və 8 düymələri var, amma satış cədvəlində məlumatları yoxdur.

## 27.11.2026 — LUX buklet (iş planı №1) — davam edir
- Dizayn lövhəsi: https://claude.ai/artifact/HG27nsX57WAJqJLfFqZswv (fayllar /home/claude/buklet/project). Üç cəhd: A4 üçqatlı (3 istiqamət) → «çox bəsit»; kvadrat 21×21 nümunə → bəyənilmədi (boş, rənglər zəif, şəkil az, quruluş); «Memar albomu» A4 üfüqi 6 vərəq (çertyoj çərçivəsi, ştamp, kontur sxemi, eksplikasiya, 16 planın cədvəli, QR) — cavab gözlənilir.
- Nihat: dizayn 5000 dollarlıq iş səviyyəsində olmalıdır, üslub — memarlıq. Çatışmayan: memarın orijinal renderləri (interyer, lobbi, həyət) və çertyojları; əldə yalnız 2560 px gündüz/axşam render və tower-3-8 var.
- 27.11 (buklet, davam): Nihat köhnə çap bukletinin şəklini göndərdi (A4 qatlanan 4 səhifə, yaşıl+qızılı, şüar «Zövqlü insanların seçimi», faktlar: 14/16/20 mərtəbə, 4,2 ha, 22,2% tikinti, mərtəbədə 6 mənzil, 1 blok; Bina 9–11 14 mərtəbə, Bina 3–6 16 mərtəbə). Seçim: eyni format, yeni dizayn, terrakota. Lövhədə K1–K4 (üz, iç sol, iç sağ, arxa). Illustrator üçün: /home/claude/buklet/pdf/{col,ic}.html → Chrome ilə vektor PDF → `.ai` (PDF əsaslı; mətn canlı, şriftlər Playfair Display, Inter, IBM Plex Mono). Kəsim payı (bleed) hələ yoxdur.
- 27.11 (buklet, yekun istiqamət): Nihat dəqiqləşdirdi — yeni dizayn lazım deyil; köhnə buklet olduğu kimi (yaşıl + qızılı) Illustrator faylı olmalıdır və içinə üçüncü bina planı əlavə olunacaq. Şəkildən yenidən yığıldı: /home/claude/buklet/old/{col,ic}.html → `LUX-kohne-buklet-col-uz.ai`, `LUX-kohne-buklet-ic-uz.ai` (A3 üfüqi, PDF əsaslı; şriftlər Montserrat + Playfair Display Italic; loqo vektor, qızılı #b0873c; yaşıl #1e3a2a). Renderlər və iki mərtəbə planı telefon şəklindən düzəldilmiş müvəqqəti şəkillərdir — orijinallar lazımdır. Üçüncü plan üçün boş çərçivə («Bina ___ Mərtəbə»); 2-ci mətn sol səhifəyə keçirildi, bina siluetləri çıxarıldı.
