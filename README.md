# SMM Panel — Laravel 12 + React/Inertia

Panel SMM (Social Media Marketing) lengkap: katalog layanan, order otomatis via provider API, deposit multi payment gateway, kurs realtime, affiliate, tiket, laporan, dan dashboard admin multi-bahasa.

**Stack:** Laravel 12 · React 19 · Inertia 2 · Tailwind CSS 4 · Vite 6 · MySQL/SQLite

---

## Fitur Utama

| Modul | Keterangan |
|---|---|
| **Layanan (Services)** | Katalog per kategori & grup, urut alfabetis, rating/review, harga dinamis per provider |
| **Order Otomatis** | Order diteruskan ke provider API (type=auto), monitoring status, refill, cancel |
| **Sync Services** | Sinkronisasi layanan & harga dari provider secara terjadwal (cron) maupun manual (tombol di /admin/services) |
| **Deposit** | Multi payment gateway (Midtrans, Tripay, Paydisini, Cryptomus, Duitku, dll.), konversi USD → mata uang lokal |
| **Kurs Realtime** | Kurs beli/jual per mata uang dari Yahoo Finance (fallback open.er-api.com), cron tiap 5 menit, kelola manual di /admin/locales |
| **Multi Bahasa** | 10 bahasa (id, en, ru, hi, pt, tr, ar, es, de, it) dengan kurs per mata uang |
| **Affiliate & Referral** | Komisi per level, saldo affiliate |
| **Tiket & Laporan** | Sistem tiket, laporan profit/loss, log aktivitas lengkap |
| **Keamanan** | Role-based access control per grup admin, log login, sesi aman |

---

## Persyaratan

| Perangkat | Versi Minimum |
|---|---|
| PHP | **8.2+** (ekstensi: pdo_mysql/sqlite, mbstring, openssl, curl, gd, zip, intl) |
| Composer | 2.x |
| Node.js | **20+** (disarankan 22+) |
| pnpm | 9+ (`npm install -g pnpm`) — atau ganti dengan npm/yarn |
| Database | MySQL 8+ **atau** SQLite (default) |
| Web Server | Apache/Nginx, atau `artisan serve` untuk development |

---

## Instalasi

### 1. Clone & masuk folder proyek

```bash
git clone https://github.com/willy911/smm-laravel-v2.git
cd smm-laravel-v2
```

### 2. Install dependency

```bash
composer install
pnpm install
```

> Pakai npm? Ganti `pnpm install` dan `pnpm build` di bawah dengan `npm install` / `npm run build`.

### 3. Siapkan environment

```bash
cp .env.example .env        # Windows: copy .env.example .env
php artisan key:generate
```

Buka `.env` dan sesuaikan:

```dotenv
APP_NAME="SMM Panel"
APP_URL=http://localhost:8000

# Database — pilih salah satu:
DB_CONNECTION=sqlite                    # paling mudah untuk mulai
# ATAU MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=smm
# DB_USERNAME=root
# DB_PASSWORD=

QUEUE_CONNECTION=database               # wajib untuk order/sync antar proses
```

Opsional — integrasi kurs (default sudah aktif):

```dotenv
KURS_SYNC_ENABLED=true
KURS_SPREAD_PERCENT=1.0
```

### 4. Migrasi & data awal

```bash
php artisan migrate
php artisan db:seed
```

### 5. Build aset frontend

```bash
pnpm build
```

### 6. Link storage

```bash
php artisan storage:link
```

### 7. Jalankan

```bash
# Development:
php artisan serve                 # http://localhost:8000
pnpm dev                          # vite dev server (hot reload), terminal kedua

# Proses queue (WAJIB berjalan agar order & sync provider diproses):
php artisan queue:work
```

### 8. Scheduler (cron) — untuk produksi

Tambahkan ke crontab / Task Scheduler:

```bash
* * * * * cd /path/ke/proyek && php artisan schedule:run >> /dev/null 2>&1
```

Scheduler menangani:

| Command | Interval | Fungsi |
|---|---|---|
| `order:send-order` | 10 detik | Kirim order ke provider |
| `order:status-order` | 10 detik | Polling status order |
| `order:status-order-refill` | 1 menit | Status refill |
| `service:sync-service` | 30 menit | Sync layanan dari provider |
| `deposit:cancel-deposit` | 10 menit | Batalkan deposit expired |
| `kurs:sync` | 5 menit | Update kurs beli/jual |

> **Catatan:** sync layanan via cron memakai queue (`QUEUE_CONNECTION=database`) — pastikan `php artisan queue:work` berjalan. Tombol **Sync** manual di halaman admin menjalankan sync secara inline (tanpa worker), jadi tetap berfungsi tanpa queue worker.

---

## Login Default (setelah `db:seed`)

| Panel | Username | Password | URL |
|---|---|---|---|
| **Admin** | `demoadmin` | `demoadmin` | `/admin/auth/signin` |
| **User** | `jhondelton` | `jhondelton` | `/auth/signin` |

> **Penting:** ganti password default sebelum dipakai di produksi!

---

## Struktur Direktori Penting

```
app/
├── Console/Commands/          # kurs:sync, service:sync-service, order:*, deposit:*
├── Http/Controllers/
│   ├── Admin/                 # Dashboard, Service, Locale, Deposit, Order, ...
│   └── User/                  # Services, Order, Deposit, Account, ...
├── Jobs/Service/              # FetchProviderServicesJob, UpsertProviderServiceJob, ...
resources/js/
├── pages/admin/               # Halaman admin (Inertia/React)
├── pages/user/                # Halaman user
├── components/datatable/      # DataTable reusable
└── lib/utils.jsx              # createCurrencyFormatter, dll.
routes/
├── admin.php                  # Route admin (prefix /admin)
├── user.php                   # Route user
└── console.php                # Definisi scheduler
```

---

## Konfigurasi Provider & Payment Gateway

1. Login sebagai admin → **Providers** (`/admin/providers`): tambah provider API (endpoint, parameter, profit config, type=`auto`).
2. **Payment Methods** (`/admin/payment-methods`): aktifkan gateway dan isi kredensial.
3. **Locales** (`/admin/locales`): atur mata uang & kurs — biarkan **Auto-sync** aktif agar cron `kurs:sync` memperbarui otomatis, atau atur manual (matikan toggle per locale). Gunakan tombol **Sync Kurs** untuk memicu pembaruan langsung.
4. **Services** (`/admin/services`): kelola layanan, gunakan tombol **Fetch Services** untuk import dari provider, dan **Sync Services** untuk memperbarui harga/status dari semua provider aktif.

---

## i18n (Multi Bahasa)

- File sumber: `resources/lang/{locale}/...` dan `resources/lang/{locale}/admin/...`
- Runtime membaca JSON hasil export: setelah mengubah file lang, jalankan `GET /export-translations` (atau buka URL tersebut di browser) untuk regenerate `public/language/{locale}/*.json`.

---

## Produksi Checklist

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
pnpm build
php artisan storage:link
```

- Set `APP_ENV=production`, `APP_DEBUG=false` di `.env`
- Jalankan **queue worker** via supervisor/daemon (mis. Supervisor, pm2, atau Windows Service)
- Pasang cron `schedule:run` tiap menit
- Ganti semua kredensial default (admin, user, payment gateway, provider API)

---

## Sumber & Kredit

Berdasarkan proyek SMM Panel by **jhonroot** ([fb.me/jhonroott](https://fb.me/jhonroott)), di-port dan dikembangkan ke Laravel 12 + React/Inertia.

## Lisensi

MIT
