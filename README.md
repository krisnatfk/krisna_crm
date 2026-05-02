# 🌐 PT. Smart CRM — Customer Relationship Management

Aplikasi CRM (Customer Relationship Management) untuk **PT. Smart**, sebuah perusahaan Internet Service Provider (ISP). Aplikasi ini dibangun secara khusus untuk mendukung transformasi digital divisi *sales* dalam mengelola prospek (*leads*), produk layanan internet, *deal pipeline* (penjualan multi-produk), manajemen pelanggan aktif, *activity log*, serta laporan analitik.

---

## 📋 Fitur Utama

| # | Fitur | Deskripsi |
|---|-------|-----------|
| 1 | **Login & Autentikasi** | JWT-based session dengan *cookie* `httpOnly` |
| 2 | **Dashboard Analytics** | Ringkasan statistik CRM (leads, pelanggan, deals, revenue) |
| 3 | **Leads Management** | CRUD calon pelanggan dengan *filter* status & pencarian |
| 4 | **Master Produk** | CRUD paket internet (HPP, margin, perhitungan harga jual otomatis) |
| 5 | **Projects / Deal Pipeline** | Konversi lead → deal, **multi-produk per transaksi**, negosiasi harga, dan *approval manager* |
| 6 | **Pelanggan Aktif** | Daftar pelanggan berlangganan beserta riwayat layanan aktif |
| 7 | **Laporan (Reporting)** | Laporan penjualan dengan *filter* periode, visualisasi grafik, dan *export* Excel |
| 8 | **Activity Log & Notifikasi** | Riwayat audit (*audit trail*) otomatis dengan notifikasi interaktif (*Mark All as Read*) |
| 9 | **Pengaturan Profil** | Fitur mengubah nama, *password*, dan **unggah foto profil** (*Base64 uploader*) |
| 10 | **WhatsApp Integration** | Tombol *click-to-chat* dengan logo resmi WA langsung dari halaman Leads & Pelanggan |
| 11 | **Role-Based Access** | *Sales* hanya melihat datanya sendiri, *Manager* memiliki akses melihat & menyetujui (Approve) semua data |
| 12 | **PWA Support** | Dapat diinstal sebagai *native app* di *smartphone* (*Progressive Web App*) |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19 + Tailwind CSS v4 + Lucide Icons
- **Database**: Supabase PostgreSQL (REST API custom client)
- **Auth**: JWT (jose) + bcryptjs + cookie session
- **Charts**: Recharts
- **Excel Export**: xlsx (SheetJS)
- **Containerization**: Docker + Docker Compose

---

## 📁 Struktur Project & Sidebar Navigasi

Sistem navigasi dikelompokkan menjadi 4 kategori utama (*Sidebar*):
1. **OVERVIEW**: Dashboard statistik.
2. **SALES**: Manajemen *Leads*, Produk, dan *Projects*.
3. **MANAGEMENT**: Database Pelanggan Aktif dan Laporan Penjualan.
4. **SYSTEM**: Riwayat *Activity Log* dan Pengaturan Akun.

```
krisna_crm/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # Halaman dashboard (OVERVIEW)
│   │   ├── leads/            # Halaman leads (SALES)
│   │   ├── products/         # Halaman master produk (SALES)
│   │   ├── projects/         # Halaman deal pipeline (SALES)
│   │   ├── customers/        # Halaman pelanggan aktif (MANAGEMENT)
│   │   ├── reporting/        # Halaman laporan (MANAGEMENT)
│   │   ├── activity-log/     # Halaman activity log (SYSTEM)
│   │   ├── settings/         # Pengaturan Profil & Keamanan (SYSTEM)
│   │   └── layout.tsx        # Dashboard layout wrapper
│   ├── api/                  # API Route Handlers
│   │   ├── auth/             # Login, logout, session check, me
│   │   ├── users/profile/    # API endpoint update nama, password & foto
│   │   └── ...               # API endpoints lainnya
│   └── globals.css           # Global styles + design tokens
├── components/
│   ├── layout/               # Sidebar terstruktur, Header (Notifikasi UI)
│   ├── providers/            # ThemeProvider, AuthProvider
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── auth.ts               # JWT session management
│   ├── supabase.ts           # Supabase REST API wrapper
│   └── data.ts               # Navigation state config
├── database/
│   ├── schema.sql            # Database schema + Alter tables
│   └── seed_dummy_data.sql   # Data dummy dengan skenario Multi-produk
└── docker-compose.yml        # Konfigurasi container
```

---

## 🚀 Cara Menjalankan Aplikasi

### Prerequisites

- **Node.js** >= 18.x
- Akun **Supabase** (dengan project yang sudah di-setup)

### 1. Clone & Install

```bash
git clone <repository-url>
cd krisna_crm
npm install
```

### 2. Setup Database Supabase

Buka **SQL Editor** pada *dashboard* Supabase Anda dan jalankan *script* secara berurutan:
1. Copy-paste isi `database/schema.sql` (Termasuk perintah *ALTER TABLE* untuk `avatar_url`).
2. Copy-paste isi `database/activity_logs.sql`.
3. Copy-paste isi `database/seed_dummy_data.sql` (Terdapat skenario transaksi riil dengan diskon manajer dan multi-produk).
4. *(Optional)* Jalankan `NOTIFY pgrst, 'reload schema';` jika API Cache belum me-*refresh* kolom profil gambar.

### 3. Setup Environment Variables

Buat file `.env.local` pada *root project*:

```env
SUPABASE_URL=https://<id-project-anda>.supabase.co
SUPABASE_ANON_KEY=<anon-key-anda>
SESSION_SECRET=<random-string-rahasia-minimal-32-karakter>
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 5. Login Dummy Akun

| Role | Email | Password |
|------|-------|----------|
| Sales | `sales@smart.co.id` | `password123` |
| Manager | `manager@smart.co.id` | `password123` |

---

## 🐳 Docker Deployment

Aplikasi sudah memiliki *Dockerfile* dan *docker-compose*.
Untuk menjalankan melalui Docker:

```bash
docker-compose up --build -d
```

Aplikasi akan di-*serve* secara terisolasi pada `localhost:3000`. Pastikan memasukkan ENV variable yang sesuai pada konfigurasi kontainer.

---

## 📊 Alur Bisnis Deal Pipeline

Sistem diatur agar otomatis menangani persetujuan diskon jika *Sales* memasukkan harga negosiasi di bawah standar:

```text
Lead (Calon Customer)
  ↓ [Sales membuat project/deal]
Project Pipeline (Multi-produk)
  ↓ [Jika Harga Negosiasi < Harga Normal → Butuh Approval Manager]
  → Status: Waiting Approval
    ↓ [Manager Login & Review]
    → [Approve] → Status menjadi "Approved", lalu otomatis masuk ke tabel Pelanggan!
    → [Reject]  → Status "Rejected" (disertai keterangan alasan dari Manager)
```

---

## 📝 Catatan Teknis (Highlight Mini Project)

1. **Avatar & Image Uploader**: Penyimpanan foto profil dikonversi ke *Base64* (limit maksimal 500KB) untuk memastikan *database* tetap ringan dan menghindari kerumitan konfigurasi Supabase Storage.
2. **Notification Bell**: Dropdown notifikasi bersifat dinamis berdasarkan data `Activity Log` (CRUD), dilengkapi fitur persisten penanda *"Mark All as Read"* yang menggunakan *localStorage*.
3. **Responsive UI**: Desain berbasis *card* pada mode *mobile* (tabel responsif) agar sangat nyaman diakses oleh *Sales* saat berada di lapangan.
4. **WhatsApp C2C**: *Hyperlink* pintar `wa.me` langsung memformat nomor telepon (misal dari `0812...` menjadi `62812...`) tanpa menghapus spasi/karakter khusus lainnya.

---

## 📄 Lisensi

Proyek dikembangkan secara independen sebagai tugas seleksi *Fullstack Developer* untuk PT. Smart.

**Happy Coding! 🚀**
