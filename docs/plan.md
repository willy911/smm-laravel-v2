# PLAN — Port Fitur `admin-smm` + `smm` → `wuzzuser`

- **Dibuat:** 2026-10-31
- **PRD:** `wuzzuser/docs/prd/2026-10-31-port-fitur-admin-smm-smm.md`
- **Status:** SELESAI — T0–T14 (port) + bugfix pasca-port (B1–B6) semuanya
  terverifikasi; build produksi final 31-10-2026
- **Aturan emas:** DB target `smm`; TIDAK membuat tabel baru selain `order_reviews`;
  ikuti kolom DB `smm` (bukan smdemo); semua mutasi saldo via transaksi + `UserBalanceLog`.

---

## Ringkasan Fase

| Fase | Isi | Status |
|---|---|---|
| F0 | Migrasi `order_reviews` + model + relasi | ✅ selesai (diverifikasi: DB 44 tabel, struktur+unique index benar) |
| F1 | Uang & order: A1, A2, U1, U2, U3+A3 | ✅ selesai (E2E PASS, build sukses 31-10-2026) |
| F2 | Laporan: A4, U4 | ✅ selesai (E2E PASS, build sukses 31-10-2026) |
| F3 | Administrasi: A6, A7, C1 | ✅ selesai (E2E PASS, build sukses 31-10-2026) |
| F4 | Guest & verifikasi: G1, G2, U5 | ✅ selesai (E2E PASS, build sukses 31-10-2026) |
| F5 | Integrasi akhir + regresi | ✅ selesai (sidebar + regresi 15 PASS, build sukses 31-10-2026) |
| Bugfix | Blank putih & konsistensi: B1–B6 | ✅ selesai (Chrome headless CDP 24 halaman 0 exception, build sukses 31-10-2026) |

---

## F0 — Fondasi Data (mandor sendiri, satu tugas kecil)

**T0 — migrasi order_reviews** ✅
- [x] Buat `wuzzuser/database/migrations/2026_10_31_000001_create_order_reviews_table.php`
      (kolom persis PRD §6: user_id, order_id, service_id, rating, message,
      is_read_admin enum('0','1'), status enum('0','1'), timestamps + deleted_at,
      UNIQUE(user_id, service_id))
- [x] Buat `wuzzuser/app/Models/Order/OrderReview.php` (relasi user/order/service)
- [x] Tambah relasi `orderReviews()` di `wuzzuser/app/Models/Order/Order.php`
      (+ relasi `orderReviews()` di `Service.php` — ternyata sudah ada)
- [x] `php artisan migrate` (DB `smm`) → verifikasi `SHOW COLUMNS FROM order_reviews`
      + `SHOW INDEX` (unique ada)
- [x] Verifikasi anti-duplikasi: `SHOW TABLES` → 44 tabel (43 + 1)

---

## F1 — Uang & Order (P0)

**T1 — A1: Withdraw komisi approval admin** ✅
- Ternyata SUDAH ADA: `Admin\AffiliateController` (index tabel + switch
  approve/reject) + UI tombol di `admin/affiliate.jsx`.
- [x] Verifikasi E2E: approve 200 + status `approved` + `UserBalanceLog` tercatat
- [x] HARDENING oleh mandor: idempoten — approve/reject hanya dari `waiting`
      (sebelumnya reject atas data `approved` mengembalikan komisi dua kali)
- [x] Uji idempoten: reject dari approved TIDAK mengubah status
- [x] Data uji dibersihkan

**T2 — A2: Laba/Rugi admin** ✅ (tukang `f1-profit-loss`)
- Milik: controller baru `wuzzuser/app/Http/Controllers/Admin/ProfitLossController.php`,
  halaman `wuzzuser/resources/js/pages/admin/profit-loss/index.jsx`, route
- Sumber: `admin-smm/app/Http/Controllers/Admin/ProfitLossController.php`
  + `admin-smm/resources/js/pages/Admin/ProfitLoss/Index.jsx`
- [x] Ringkasan periode (pendapatan, modal, laba, margin) dari `orders.profit`
- [x] Export CSV stream (BOM UTF-8 + baris TOTAL)
- [x] Uji: cocok dengan query manual SQL (seed 4 order completed, angka identik)
- [x] Kunci lang `admin/profit-loss` (id+en) + ditambahkan ke route
      `export-translations` + JSON public/language tergenerate
- Catatan: GET halaman Inertia 500 di E2E CLI sebelum build (Vite manifest) —
  setelah `npm run build` sukses, halaman terverifikasi 200.

**T3 — U1: Order Cancel store (user)** ✅
- Ternyata SUDAH ADA: `AJAX\OrderController::storeCancel` + route
  `ajax/orders/cancels` + tombol UI di halaman order user.
- [x] E2E: endpoint hidup, JSON valid, validasi status order bekerja
      (order sintetis tanpa dukungan provider → gagal rapi via
      `service_provider_responses`, tanpa baris dummy)

**T4 — U2: Order Refill store (user)** ✅
- Ternyata SUDAH ADA: `AJAX\OrderController::storeRefill` + route + tombol UI.
- [x] E2E: POST 200 + status true; order sintetis dengan provider real →
      provider gagal dipanggil → tercatat rapi di `service_provider_responses`
      (perilaku sama seperti admin-smm)

**T5 — U3+A3: Order Review (user store + admin list)** ✅ (tukang `f1-order-review`)
- Milik: `User/Order/ReviewController.php` + `Admin/Order/ReviewController.php`
  (baru), halaman `admin/order/review/index.jsx` + `review-dialog.jsx`, tombol
  "Ulasan" di `user/order/index.jsx`, kunci lang orders toast/log (id+en)
- Sumber: `smm/.../OrderReviewController.php`, `admin-smm/.../ReviewController.php`
- [x] Store user: validasi order milik user + belum pernah review service itu
- [x] Admin: index + switch status + tandai `is_read_admin`
- [x] Verifikasi mandor (harness sendiri): store 200 + baris DB + duplikat ditolak
      rapi + admin JSON tabel memuat review + switch status & is_read_admin → '1'
- [x] Route user ternyata root-path (`/orders/reviews`, tanpa prefix /user) —
      harness disesuaikan
- [x] Cleanup data uji + sessions Symfony

---

## F2 — Laporan (P0/P1)

**T6 — A4: Report Order & Deposit admin** ✅ (tukang `f2-report-admin`)
- Milik: method `report()` di `Admin/Order/OrderController.php` (L198) +
  `Admin/DepositController.php` (L330), halaman `admin/order/report.jsx`,
  `admin/deposit/report.jsx`, lang `admin/report` (id+en), route `admin.orders.report`
  + `admin.deposits.report` (pra-wire mandor)
- Sumber: `admin-smm/.../OrderController.php::report`, `Deposit/DepositController.php::report`,
  pages Report.jsx
- [x] JSON report (from/to, ringkasan per status + 500 baris terbaru) terverifikasi:
      seed 2 order (100+250, profit 10+20) → price=350 profit=30 ✓; deposit
      50+75 → success amount=125 ✓
- [x] Halaman inertia (defer pageProps) — 200 setelah build
- [x] `admin/report` didaftarkan ke `/export-translations` → JSON id+en tergenerate

**T7 — U4: Report Order & Deposit user** ✅ (tukang `f2-report-user`)
- Milik: method `report()` di `User/Order/OrderController.php` (L115) +
  `User/DepositController.php` (L499), halaman `user/order/report.jsx`,
  `user/deposit/report.jsx`, lang `report` (id+en), route `user.orders.report`
  (`/orders/report`) + `user.deposits.report` (`/deposits/report`)
- Sumber: `smm/.../User/Order/OrderController.php::report` + pages
- [x] Scoping `user_id` terverifikasi: user hanya melihat datanya sendiri
- [x] Verifikasi mandori (sesi user bersih): order count=1 price=100 ✓,
      deposit count=1 amount=50 ✓
- [x] `report` didaftarkan ke `/export-translations` → JSON id+en tergenerate
- Catatan: kolom `profit` TIDAK dikirim ke frontend user (hidden model) —
  sesuai panel user smm

---

## F3 — Administrasi (P1)

**T8 — A6: Settings akun admin** ✅ (tukang `f3-admin-settings`)
- Milik: `Admin/Account/SettingsController.php` (baru, UpdateRequest +
  UpdatePasswordRequest inline), halaman `admin/account/settings.jsx`
  (laravel-precognition), lang `admin/account` (id+en), route
  `admin.settings.edit/update/update-password` (pra-wire mandor)
- Sumber: `admin-smm/app/Http/Controllers/Admin/Account/SettingsController.php`
- [x] edit() hanya menampilkan field yang ada di tabel admins (tanpa email)
- [x] update() profil (input bersarang `admin.full_name` + username
      unique-ignore-self) + activity log
- [x] updatePassword() Hash::check manual → flash error (bukan 500), min 8,
      confirmed, tanpa logout paksa
- [x] Verifikasi mandor: profil berubah (HTTP 302 + DB), password salah ditolak
      rapi (hash tetap), password benar → hash berubah + Hash::check lolos,
      nilai asli di-restore
- [x] `admin/account` didaftarkan ke `/export-translations` → JSON tergenerate

**T9 — A7: Log response provider** ✅ (tukang `f3-provider-response`)
- Milik: `Admin/Service/Provider/ResponseController.php` (baru, index), 6 relasi
  belongsTo di model `ServiceProviderResponse`, halaman
  `admin/service/provider/response.jsx`, lang `admin/provider-response` (id+en),
  route `admin.services.providers.response` (pra-wire mandor)
- Sumber: `admin-smm/.../ResponseController.php` + pages
- Data: `service_provider_responses` versi DB `smm` (11 kolom, order_id bigint)
- [x] JSON DataTable + filter type/status/daterange/search + paginate
- [x] logs longtext truncated + dialog JSON pretty
- [x] Verifikasi mandor: seed 1 baris → JSON 200 memuat baris + relasi; filter
      bekerja; cleanup tuntas
- [x] Fix ikon oleh mandor: `FileCodeIcon` → `SourceCodeIcon` (tidak ada di
      hugeicons-react 0.4.0 — sempat memblokir build; setelah fix build sukses)
- [x] `admin/provider-response` didaftarkan ke `/export-translations`

**T10 — C1: Cronjob BCA + Mobile Notification (stub)** ✅ (tukang
      `f3-cronjob-stub`)
- Milik: `Cronjob/BCAMutationController.php` (invokable) +
  `Cronjob/MobileNotificationController.php` (baru); config stub
  `services.bca_mutation` (BCA_MUTATION_ENABLED=false default) + route
  `/cron/bca-mutation` + `/cron/update-mobile-notification` (pra-wire mandor)
- Sumber: `admin-smm/Cronjob/*.php` (perilaku disederhanakan, tanpa referral)
- Data: `mobile_notifications` versi DB `smm` (is_used tinyint, tanpa is_expired)
- [x] Stub off: 200 teks 'dinonaktifkan', TIDAK ada panggilan API eksternal
- [x] Saat enabled+api_key: port logika referensi (dedup payment+amount+content
      hari ini; kredit saldo DB::transaction + lockForUpdate + UserBalanceLog
      content_key pola wuzzuser)
- [x] MobileNotificationController: DELETE notifikasi is_used=0 sebelum hari ini
      (adaptasi skema DB smm tanpa is_expired)
- [x] Verifikasi mandor: cron keduanya 200; notifikasi uji kemarin terhapus (1);
      idempoten 'Tidak ada mutasi.'; stub tanpa efek samping

---

## F4 — Guest & Verifikasi (P2)

**T11 — G1: Ranking guest (halaman terpisah)** ✅ (tukang `f4-ranking-guest`)
- Milik: `Guest/RankingController.php` (baru, invokable, live-query TANPA tabel
  leaderboards & TANPA website_config user_menu), halaman `guest/ranking.jsx`,
  lang `ranking` (id+en), route `guest.ranking` (`/ranking`) pra-wire mandor
- Sumber: `smm/.../Guest/Page/RankingController.php` +
  `smm/resources/js/pages/Guest/Page/Ranking.jsx`
- [x] 3 kartu: top orders (SUM price completed bulan ini), top deposits (SUM
      amount success), top services (COUNT orders completed) — pola
      `Admin\LeaderboardController` + `getServiceDataForPeriod` smm
- [x] Privasi: full_name dimask (helper `maskFullName`), tanpa email/balance
- [x] Verifikasi mandor: GET /ranking 200 (setelah build); partial Inertia
      (X-Inertia-Version xxh128 manifest) → pageProps memuat order seed
      (amount+count benar), services benar, privasi ok; cleanup tuntas
- [x] `ranking` didaftarkan ke `/export-translations` → JSON id+en tergenerate

**T12 — G2: Favorite dari guest service** ✅ (ternyata SUDAH ADA)
- `AJAX\ServiceController::favorite` (add/remove + rate limiter) + route
  `ajax/services/favorite/{type}` + tombol & handler di
  `guest/service/index.jsx` sudah lengkap sejak awal
- [x] Verifikasi kode (baca langsung): toggle ServiceFavorite::updateOrCreate /
      delete scoped user_id — aman

**T13 — U5: Verifikasi klaim referral** ✅ (kesimpulan: TIDAK di-port)
- `smm/.../User/Account/ReferralController.php::claim` bergantung pada tabel
  `referral_commissions` + `withdraw_requests` + kolom
  `users.referral_code/referred_by` — SEMUA tidak ada di wuzzuser
- Padanan fungsional wuzzuser: `User\AffiliateController::withdraw` (komisi →
  saldo, DB::transaction + UserBalanceLog + idempoten) — sudah ada & teruji F1
- Keputusan PRD §5.1 (port hanya yang tidak duplikat) → klaim referral smm
  tidak direplikasi; alur komisi yang ada tetap dipakai

---

## F5 — Integrasi Akhir (mandor sendiri)

**T14 — Integrasi & regresi** ✅ (mandor sendiri)
- [x] Sidebar `resources/js/components/layouts/app-sidebar.jsx`: menu
      Afiliasi (diaktifkan, isSuperAdmin), Ulasan (grup Orders), Laba Rugi +
      Laporan (order/deposit) + Log Response Provider (grup baru), Pengaturan
      (grup Site); ikon hugeicons tervalidasi eksplisit (ProfitIcon,
      ChartColumnIcon, SourceCodeIcon, Link03Icon, MessageMultiple02Icon);
      namespace i18n ditambah (admin/report, admin/provider-response, orders)
- [x] Kunci lang baru: admin/report (review, profit-loss-menu, reports),
      admin/provider-response (menu) — id+en, json re-ekspor
- [x] prettier --check sidebar & semua jsx baru lolos; `npm run build` sukses
      (45.03s)
- [x] `php artisan route:list` bersih; `php -l` semua file PHP baru
- [x] Anti-duplikasi final: `information_schema` DB `smm` = 44 tabel
- [x] Regresi E2E (15 asersi PASS): /admin/services JSON 200 + kolom type
      valid (enum lengkap, type_labels terisi); /admin/profit-loss JSON+render
      +export CSV; /admin/orders/report; /admin/deposits/report;
      /admin/orders/reviews; /admin/services/providers/response;
      /admin/settings render; /ranking render; /cron/bca-mutation;
      /orders/report + /deposits/report (user); 6 namespace x 2 locale JSON
      language tergenerate; sessions Symfony dibersihkan

---

## Verifikasi Global (setiap fase selesai)

1. `php -l` semua file PHP yang diubah/dibuat.
2. Uji HTTP nyata via proses PHP terpisah (login admin/user), lalu
   `DELETE FROM sessions WHERE user_agent='Symfony'`.
3. Cek isi DB langsung (baris baru, log saldo, status).
4. `npx prettier --check` + build di akhir fase yang menyentuh JSX.
5. Tidak ada tabel baru selain `order_reviews` (cek `SHOW TABLES`).

---

## Bugfix Pasca-Port (2026-10-31 sore/malam) — Blank Putih & Konsistensi

**Latar:** setelah katalog dipulihkan (kategori ber-icon aktif), banyak halaman
"muncul sebentar lalu blank putih". Uji HTTP 200 tidak menangkapnya karena crash
terjadi saat render React di browser. Diagnosa akhir dilakukan dengan Chrome
headless + CDP (dev mode Vite) sehingga error asli terbaca:

```
Error: Element type is invalid ... got: <HugeiconsIcon />
Check the render method of `DynamicIcon`  →  React #130 → blank
```

**B1 — DynamicIcon anti-crash #130** ✅ (mandor)
- [x] Tulis ulang `resources/js/components/ui/dynamic-icon.jsx`:
      validasi tipe sebelum render (`isValidIconComponent` — hanya fungsi/
      forwardRef/memo; element React ditolak), `IconErrorBoundary` per icon,
      placeholder senyap bila icon tidak ada/tidak valid
- [x] Efek: satu icon rusak tidak mungkin memblank-kan halaman lagi
- [x] Verifikasi: `/orders/create` + 20 halaman lain di Chrome headless mode
      produksi (build final) — 0 exception

**B2 — File bahasa 404 + i18n suspense (penyebab blank massal #1)** ✅ (mandor)
- [x] 96 file lang dibuat (namespace fitur baru untuk 9 bahasa non-utama;
      `admin/logs`, `admin/products`, `blog` untuk id+en — semuanya 404 sebelumnya)
- [x] `routes/web.php` `export-translations`: daftar hard-coded dilengkapi
      (`blog.php`, `logs.php`, `products.php`, `users.php`)
- [x] Regen via `/export-translations` → verifikasi **297/297** kombinasi
      bahasa × namespace = HTTP 200

**B3 — `/admin/orders/reviews` 500 (ViteException)** ✅ (mandor)
- [x] `Admin/Order/ReviewController.php`: `inertia('admin/order/review')` →
      `inertia('admin/order/review/index')` (nama komponen sesuai file halaman)

**B4 — Typo `websiteConfig` di `app-layout.jsx` (bom waktu popup berita)** ✅ (mandor)
- [x] L472: `websiteConfig.default_news_banner` → `config().default_news_banner`
- [x] Akan memblank-kan SEMUA halaman begitu ada berita popup — dicegah

**B5 — `/admin/profit-loss` crash `cn is not defined`** ✅ (mandor)
- [x] `admin/profit-loss/index.jsx`: tambah `cn` ke import `@/lib/utils`

**B6 — `/admin/services/categories` crash `null.type`** ✅ (mandor)
- [x] `admin/service/category/index.jsx` L675: guard null `profit_configs`
      (265 kategori pulihan memang NULL — sama seperti import asli) → tampil "—"
- [x] `admin/service/provider/index.jsx` L736: guard null serupa
      (`service_provider_configuration?.services_configuration?.profit_configs`)

**Temuan mati (tidak diperbaiki, dicatat):** 6 pemanggilan `inertia()` ke
komponen yang tidak ada (User/Order/Detail, Admin/User/Detail, Role/Index/Form,
dsb.) — semuanya dead code karena route-nya tidak terdaftar.

**Verifikasi akhir bugfix** ✅
- [x] Chrome headless CDP mode produksi (build final): guest 3 halaman ✓,
      user 9 halaman ✓, admin 12 halaman ✓ — semua title benar, 0 exception
- [x] `php -l` file PHP yang diedit ✓; `npm run build` sukses (1m 6s)
- [x] Dev server uji dimatikan; `public/hot` dihapus → mode produksi murni
- [x] Artefak uji dibersihkan: user uji `cdptest`, admin uji `cdpadmin`,
      12 sesi uji (HeadlessChrome/Symfony/curl) — sesi asli user tidak disentuh
- [x] `demouser`, admin asli, payment method "qris" utuh

---

## Pembagian Kerja (untuk dispatch tukang)

- **Paralel aman dalam F1:** T1 (admin affiliate+route admin) / T3+T4+T5
  (user order+route user) — file berbeda, tapi route admin.php vs user.php berbeda
  file → aman. T2 terpisah penuh.
- **Paralel aman dalam F3:** T8 / T9 / T10 — file & route berbeda.
- Jangan paralelkan dua tugas yang menyentuh file sama (mis. dua tugas mengubah
  `routes/admin.php` sekaligus → gabungkan ke satu tugas atau kerjakan berurutan).
- Mandor: integrasi sidebar (F5) + verifikasi setiap fase.
