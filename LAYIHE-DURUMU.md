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
