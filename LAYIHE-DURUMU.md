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
