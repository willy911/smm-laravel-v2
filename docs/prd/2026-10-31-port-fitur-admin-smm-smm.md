# PRD — Port Semua Fitur `admin-smm` + `smm` ke `wuzzuser`

- **Tanggal:** 2026-10-31 (revisi 2 — setelah audit skema 2 DB)
- **Status:** Draft — menunggu persetujuan user. **Eksekusi DIJEDA** atas
  permintaan user ("buat prd nya dulu saja"); tidak ada migrasi yang dijalankan.
- **Target aplikasi:** `wuzzuser` (Laravel 12 + React/Inertia, DB MySQL **`smm`**,
  berjalan di `http://localhost:8000`)
- **Referensi sumber:**
  - `admin-smm` (DB **`smdemo`**) — panel **Admin** lengkap
  - `smm` (DB **`smdemo`**) — panel **User** + **Guest**

---

## 1. Latar Belakang

`wuzzuser` adalah aplikasi gabungan (admin + user + guest) yang secara bertahap
menerima port fitur dari `admin-smm` (admin-side) dan `smm` (user-side). Fitur
besar sudah masuk: flazpay payment gateway, 5 alur fetch layanan, order, deposit,
ticket, blog/news/sitemap, payment method, leaderboard, affiliate, log, website
configuration, dan perbaikan kolom Tipe daftar layanan.

PRD ini mendefinisikan sisa fitur yang belum di-port, **hasil audit skema kedua
database** (supaya tidak ada tabel ganda/tumpang tindih), urutan prioritas, dan
kriteria selesainya.

## 2. Tujuan

1. `wuzzuser` memiliki **semua** fitur yang ada di `admin-smm` (admin) dan `smm`
   (user/guest), dengan perilaku & tampilan mengikuti pola yang sudah mapan di
   `wuzzuser` sendiri (bukan salinan mentah).
2. **Tidak ada tabel/konsep duplikat**: setiap fitur memakai skema yang sudah ada
   di DB `smm`; tabel baru hanya dibuat bila benar-benar tidak ada padanannya
   (saat ini: hanya `order_reviews`).
3. Seluruh UI berbahasa Indonesia (i18n namespace `common` / `admin/common` /
   `admin/services` sesuai konvensi repo).
4. Setiap fitur lolos uji E2E nyata (HTTP + database) sebelum dinyatakan selesai.

## 3. Non-Tujuan (Out of Scope)

- Tidak menyalin/memindahkan data DB `smdemo` ke `smm`; hanya **skema** yang
  dibutuhkan.
- Tidak mem-port file legacy/terbengkalai: `Signin-old.jsx`, `Old.jsx`,
  `MonitorPanel.jsx`, `dashboard-new.jsx` (eksperimen lokal).
- Tidak mengubah payment method **"qris" (id=2)** milik user — larangan keras.
- Tidak melakukan inisialisasi git (user menunda).
- **Tidak membuat tabel-tabel ini** (sudah punya padanan di wuzzuser — lihat §5):
  `withdraw_requests`, `admin_roles`, `user_roles`, `leaderboards`,
  `referral_commissions`, `user_recovery_password_emails`.

## 4. Peran & Aktor

| Peran | Deskripsi | Guard |
|---|---|---|
| Admin | Operator panel `/admin` | `auth('admin')` + role group (`hasRole`) |
| User | Pelanggan panel (via login) | `auth` + `auth.session` + `user.account.verify` |
| Guest | Pengunjung publik | — |

## 5. Hasil Audit Skema DB (31-10-2026) & Keputusan Anti-Duplikasi

Koneksi diaudit langsung: `smdemo` (48 tabel, dipakai admin-smm & smm) dan
`smm` (43 tabel, dipakai wuzzuser).

### 5.1 Pemetaan tabel sumber → padanan wuzzuser (WAJIB dipatuhi eksekusi)

| Tabel di `smdemo` | Padanan di DB `smm` / wuzzuser | Keputusan |
|---|---|---|
| `withdraw_requests` (17 kolom: status pending/approved/rejected/paid, fee, admin_note) | **`user_commission_withdrawals`** sudah ada (10 kolom: type balance/bank, amount, bank_*, status waiting/approved/rejected) | **Pakai `user_commission_withdrawals`.** `withdraw_requests` TIDAK dibuat. Semantik `paid` dipetakan ke `approved` (atau kolom tambahan bila benar-benar perlu — audit dulu) |
| `admin_roles` + `user_roles` | **`admin_groups`** sudah ada (kolom identik: name, is_primary, roles JSON) + `Admin\Admin\RoleController` + `GroupController` sudah ada | **Fitur roles SUDAH ADA.** Hanya verifikasi + cek kesiapan i18n. Tabel roles TIDAK dibuat |
| `leaderboards` (hasil cronjob agregat) | wuzzuser menghitung leaderboard **live-query** (`getUserDataForPeriod`) — sudah jalan di admin & user | **Tanpa tabel baru.** Halaman ranking guest (G1) memakai pendekatan live-query yang sama |
| `referral_commissions` | wuzzuser memakai `users.commission` + `user_balance_logs` (category=commission) + `user_commission_withdrawals` | **Tidak dibuat.** U5 hanya verifikasi alur klaim vs withdraw |
| `order_reviews` | **TIDAK ADA di DB `smm`** | **SATU-SATUNYA migrasi baru** (skema §6) |
| `order_cancels` (smdemo: 14 kolom, ada `status`+`ref_id`+`deleted_at`) | **sudah ada di DB `smm` (10 kolom, TANPA kolom `status`/`ref_id`)** | **Pakai skema DB `smm` apa adanya.** U1 menulis baris sesuai 10 kolom ini; jangan menambah kolom tanpa audit ulang |
| `order_refills` | sudah ada di DB `smm` (12 kolom, ada `status`) | Pakai apa adanya |
| `service_provider_responses` | sudah ada di DB `smm` (11 kolom; order_id bigint, ada order_cancel_id, tanpa deleted_at) | **A7 memakai skema DB `smm`** (bukan versi smdemo) |
| `mobile_notifications` | sudah ada di DB `smm` (7 kolom: is_used tinyint, tanpa is_expired/transaction_at) | Cronjob BCA/notification menyesuaikan kolom DB `smm` |
| `service_favorites` | sudah ada di DB `smm` | G2 pakai apa adanya |
| `website_configurations`, `image_libraries`, `service_recommendations` | wuzzuser memakai `configs` + mekanismenya sendiri | Tidak dibuat |

### 5.2 Ringkasan gap fitur (setelah koreksi audit)

**Sudah setara / sudah ada (tidak dikerjakan):**
Admin: dashboard, leaderboard, admins(+group), users(+group/show/balance-reduction),
services penuh (list/show/updates/monitoring/custom-prices/categories/groups/
providers/fetch×5), **roles (`Admin\Admin\RoleController` + `admin_groups`)**,
orders (list/cancel/refill), deposits, tickets, payment-methods, logs (admin &
user), website (blog/news/configs/sitemap), locale, affiliates (list+switch).
User: dashboard, affiliate+withdraw komisi, leaderboard, settings+switch notif,
verify email, logs, orders (index/create/store/show), refills (index), deposits,
tickets, api-docs, auth lengkap (signup/signin/forgot/reset).
Guest: dashboard, blog, service, monitoring, update, sitemap.
Cronjob inti: CheckApiStatus, Generate*, SendOrder, StatusOrder(+Refill),
SyncService, CancelDeposit.

**Gap yang benar-benar dikerjakan:**

| # | Fitur | Referensi | Kebutuhan DB |
|---|---|---|---|
| **A1** | Withdraw komisi — approval admin (index, approve, markPaid, reject) | `admin-smm/Admin/Withdraw/WithdrawController.php` + pages | Tanpa tabel baru (pakai `user_commission_withdrawals`) |
| **A2** | Laporan Laba/Rugi (index + export) | `admin-smm/Admin/ProfitLossController.php` + pages | Tanpa tabel baru (agregat `orders.profit`) |
| **A3** | Order Review — admin (index, show, switch) | `admin-smm/Admin/Order/ReviewController.php` | **Migrasi `order_reviews`** |
| **A4** | Report Order & Deposit — admin (halaman + export) | pages `Admin/Order/Report.jsx`, `Admin/Deposit/Report.jsx`, method `report()` | Tanpa tabel baru |
| **A6** | Settings akun admin (profil + ganti password) | `admin-smm/Admin/Account/SettingsController.php` | Tanpa tabel baru |
| **A7** | Log response provider (index) | `admin-smm/Admin/Service/Provider/ResponseController.php` | Tanpa tabel baru (pakai skema DB `smm`) |
| **C1** | Cronjob BCA Mutation + Mobile Notification — **stub config** (keputusan user) | `admin-smm/Cronjob/BCAMutationController.php`, `MobileNotificationController.php`, route `bca-mutation`, `update-mobile-notification` | Tanpa tabel baru (`mobile_notifications` ada); kredensial via config stub |
| **U1** | Order Cancel — user mengajukan (store + UI) | `smm/User/Order/OrderCancelController.php` | Tanpa tabel baru (10 kolom DB `smm`) |
| **U2** | Order Refill — user mengajukan (store + UI) | `smm/User/Order/OrderRefillController.php` | Tanpa tabel baru |
| **U3** | Order Review — user mengajukan (store + UI) | `smm/User/Order/OrderReviewController.php` | Migrasi yang sama dgn A3 |
| **U4** | Report Order & Deposit — user | pages `User/Order/Report.jsx`, `User/Deposit/Report.jsx` | Tanpa tabel baru |
| **G1** | Ranking — halaman guest terpisah (keputusan user) | `smm/Guest/Page/RankingController.php` + pages | Tanpa tabel baru (live-query) |
| **G2** | Favorite layanan dari guest service | `smm/Guest/Page/Service/ServiceController.php::favorite` | Tanpa tabel baru |
| **U5** | Klaim referral — **verifikasi dulu** (keputusan user) | `smm/User/Account/ReferralController.php::claim` | Tanpa tabel baru; port hanya bila perilakunya beda dari withdraw komisi |

## 6. Desain Migrasi `order_reviews` (satu-satunya perubahan skema)

Sumber: `smm/database/migrations/2024_02_28_175732_create_order_reviews_table.php`
+ unique index `2026_10_12_000000_*` + kolom `is_read_admin` yang terlihat di DB
`smdemo` (11 kolom). Skema final (DB `smm`):

```
order_reviews:
  id (pk)
  user_id (fk users)
  order_id (fk orders)
  service_id (fk services)
  rating double default 0
  message longtext nullable
  is_read_admin enum('0','1') default '0'
  status enum('0','1') default '0'
  created_at, updated_at, deleted_at (nullable)
  UNIQUE (user_id, service_id)   -- satu review per user per layanan
```

- Model baru `App\Models\Order\OrderReview` (relasi user/order/service).
- Relasi `orderReviews()` ditambahkan ke model `Order` (dan bila perlu `Service`).
- Migrasi dijalankan **hanya** di wuzzuser (DB `smm`) via `php artisan migrate`;
  nama file mengikuti konvensi tanggal repo. Tidak ada migrasi lain di seluruh
  porting ini.

## 7. Keputusan Desain

1. **Pola kode mengikuti wuzzuser**, bukan salinan admin-smm: controller Inertia +
   DataTable ajax (`page`/`length`/`order[column]`/`order[direction]`), aksi via
   `action/{action}` / `switch/...`, validasi `rules()`/`attributes()`, halaman
   React di `resources/js/pages/...`, sidebar `app-sidebar.jsx` diperluas.
2. **Semua mutasi saldo/komisi WAJIB** lewat jalur yang sudah ada (transaksi DB +
   log `UserBalanceLog` dengan `initial_balance`/`final_balance`, pola
   `AffiliateController::withdraw`); tidak ada update `users.balance`/`commission`
   langsung tanpa transaksi+log. Approve/reject withdraw (A1) memakai pola ini dan
   idempoten (tolak bila status bukan `waiting`).
3. **Laporan (A2/A4/U4)**: agregat `DATE(created_at)` + filter rentang tanggal,
   export CSV stream, angka via `format_currency()`.
4. **Cronjob BCA/notification (C1)** dibuat sebagai stub yang aman: route cron
   ada, controller membaca config stub (`services.bca-mutation` semacam itu),
   melewatkan eksekusi dengan log jelas bila kredensial kosong — tidak error saat
   dipanggil tanpa konfigurasi.
5. Semua teks UI bahasa Indonesia; kunci i18n baru di namespace yang benar.
6. **Setiap fitur menyesuaikan skema DB `smm`** (bukan smdemo) — contoh: U1
   menulis `order_cancels` tanpa kolom `status`; A7 menampilkan kolom versi
   `smm`.

## 8. Fase & Urutan Eksekusi (mulai SETELAH PRD disetujui)

| Fase | Isi | Catatan |
|---|---|---|
| **F0 — Fondasi data** | 1 migrasi `order_reviews` + model `OrderReview` + relasi + `php artisan migrate` (DB `smm`) + verifikasi struktur | Satu-satunya perubahan skema |
| **F1 — Uang & order (P0)** | A1 withdraw-approval, A2 profit/loss, U1 cancel-store, U2 refill-store, U3 review-store + A3 review-admin | Menyentuh order/saldo; uji race approve |
| **F2 — Laporan (P0/P1)** | A4 report admin, U4 report user | Memanfaatkan data F1 |
| **F3 — Administrasi (P1)** | A6 settings admin, A7 provider-response, C1 cronjob stub | Isolasi, tak nyentuh saldo |
| **F4 — Guest & verifikasi (P2)** | G1 ranking, G2 favorite, U5 verifikasi klaim referral | Tambahan publik |
| **F5 — Integrasi akhir** | Sidebar & menu, i18n sweep, `npm run build`, E2E menyeluruh + regression deposit/fetch/kolom Tipe | Satu pintu keluar berkualitas |

Setiap fase diakhiri verifikasi: `php -l`, build sukses, uji HTTP nyata (login
admin/user via proses PHP terpisah; bersihkan `sessions user_agent='Symfony'`),
pemeriksaan isi DB, dan cek anti-duplikasi (`SHOW TABLES` tidak bertambah selain
`order_reviews`).

## 9. Kriteria Penerimaan (per fitur)

- **A1**: halaman admin withdraw 200; approve → status `approved`, komisi terpotong
  benar + `user_balance_logs` bertambah (saldo awal/akhir benar); reject → status
  `rejected` tanpa menyentuh komisi; dua approve bersamaan → hanya satu berhasil
  (idempoten).
- **A2**: ringkasan laba/rugi cocok dengan query manual SQL pada periode sama;
  export CSV terunduh & baris benar.
- **A3/U3**: user submit review → tersimpan; submit kedua utk service sama →
  ditolak (unique); admin melihat list + switch status + tandai terbaca
  (`is_read_admin`).
- **U1/U2**: cancel/refill dari halaman order user membuat baris baru sesuai skema
  DB `smm` + muncul di daftar admin terkait; validasi status order sesuai
  referensi.
- **A4/U4**: halaman report 200 dengan filter tanggal; total sesuai query manual.
- **A6**: admin bisa ganti password-nya sendiri (password lama diverifikasi).
- **A7**: halaman response 200 menampilkan `service_provider_responses` terbaru
  dengan filter provider/type/status.
- **C1**: route cron merespons 200 tanpa kredensial (stub aktif), log jelas;
  tidak mengubah data bila config kosong.
- **G1**: halaman ranking guest tampil (user & layanan bulan berjalan) sesuai
  data live-query.
- **G2**: favorite di guest service menambah/menghapus baris `service_favorites`
  milik user yang login.
- **U5**: dokumen verifikasi singkat — apakah `claim` smm sudah terwakili withdraw
  komisi; port hanya bila berbeda.
- **Anti-duplikasi**: setelah semua fase, `SHOW TABLES` DB `smm` hanya bertambah
  `order_reviews` (43 → 44 tabel).
- **Umum**: `npm run build` sukses; deposit (flazpay) & fetch layanan tetap hijau;
  kolom Tipe daftar layanan tetap terisi.

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Membuat tabel yang sudah ada padanannya (tumpuk) | Pemetaan §5.1 wajib; verifikasi `SHOW TABLES` tiap fase |
| Skema smdemo ≠ skema DB `smm` | Selalu ikuti kolom DB `smm`; baca `SHOW COLUMNS` sebelum menulis model/controller |
| Mutasi saldo ganda/race | Transaksi + log + idempoten; uji konkurensi approve |
| DB kotor dari import (kasus 'Package') | Cek distribusi `type`/status vs enum di tiap fase akhir |
| Regression fitur lama | E2E deposit + fetch + kolom Tipe di tiap fase akhir |
| Tukang gagal diam | Mandor verifikasi artefak langsung; ambil alih bila perlu |

## 11. Batasan Teknis (berlaku semua fase)

- Edit PHP: UTF-8 tanpa BOM; `php -l` wajib setelah tiap edit.
- Uji HTTP lewat proses PHP terpisah (`auth('admin')->login(...)` /
  `auth('user')->login(...)`), GET dulu untuk session+CSRF; bersihkan
  `DELETE FROM sessions WHERE user_agent='Symfony'` setelahnya; jangan boot dua
  aplikasi Laravel dalam satu proses.
- `npm run build` ±1–2 menit; `npx prettier --check` untuk validasi JSX cepat.
- DataTable menyimpan state kolom di localStorage (`table_state_`+route) —
  ingatkan hard-refresh ke user saat kolom berubah.
- Jangan sentuh `payment_methods` id=2 ("qris").
- Repo tanpa git — jangan jalankan perintah git.

## 12. Keputusan User (31-10-2026)

1. Cronjob BCA & Mobile Notification → **di-port dengan stub config** (C1).
2. U5 klaim referral → **verifikasi dulu**; port hanya bila perilakunya beda.
3. G1 Ranking → **halaman guest terpisah**.
4. Eksekusi F0+F1 → **disetujui pada prinsip**, tetapi **dijeda** setelah user
   meminta PRD direview dulu dan audit DB dilakukan. Eksekusi dimulai kembali
   hanya setelah konfirmasi user.
