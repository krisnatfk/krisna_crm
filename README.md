# 🌐 PT. Smart CRM — Customer Relationship Management

Aplikasi CRM (Customer Relationship Management) untuk **PT. Smart**, sebuah perusahaan Internet Service Provider (ISP). Aplikasi ini dibangun untuk mendukung transformasi digital divisi sales dalam mengelola leads, produk layanan internet, deal pipeline, pelanggan aktif, dan laporan penjualan.

---

## 📋 Fitur Utama

| # | Fitur | Deskripsi |
|---|-------|-----------|
| 1 | **Login & Autentikasi** | JWT-based session dengan cookie httpOnly |
| 2 | **Dashboard** | Ringkasan statistik CRM (leads, pelanggan, deals, revenue) |
| 3 | **Leads Management** | CRUD calon pelanggan dengan filter status & pencarian |
| 4 | **Master Produk** | CRUD paket internet (HPP, margin, harga jual otomatis) |
| 5 | **Projects / Deal Pipeline** | Konversi lead → deal, multi-produk, negosiasi harga, approval manager |
| 6 | **Pelanggan Aktif** | Daftar pelanggan berlangganan dengan layanan aktif |
| 7 | **Laporan** | Reporting dengan filter periode, chart, dan export Excel |
| 8 | **Role-Based Access** | Sales hanya melihat data sendiri, Manager melihat semua |
| 9 | **Activity Log** | Audit trail — riwayat semua aksi CRUD, approval, dan export |
| 10 | **WhatsApp Integration** | Tombol click-to-chat WA langsung dari halaman leads & pelanggan |
| 11 | **PWA Support** | Installable sebagai native app di smartphone (Progressive Web App) |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19 + Tailwind CSS v4
- **Database**: Supabase PostgreSQL (REST API)
- **Auth**: JWT (jose) + bcryptjs + cookie session
- **Charts**: Recharts
- **Excel Export**: xlsx (SheetJS)
- **Containerization**: Docker + Docker Compose

---

## 📁 Struktur Project

```
krisna_crm/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # Halaman dashboard
│   │   ├── leads/            # Halaman leads
│   │   ├── products/         # Halaman master produk
│   │   ├── projects/         # Halaman deal pipeline
│   │   ├── customers/        # Halaman pelanggan aktif
│   │   ├── reporting/        # Halaman laporan
│   │   ├── activity-log/     # Halaman activity log (audit trail)
│   │   └── layout.tsx        # Dashboard layout wrapper
│   ├── api/                  # API Route Handlers
│   │   ├── auth/             # Login, logout, session check
│   │   ├── dashboard/        # Dashboard stats
│   │   ├── leads/            # Leads CRUD
│   │   ├── products/         # Products CRUD
│   │   ├── projects/         # Projects CRUD + approval
│   │   ├── customers/        # Customers list
│   │   ├── reporting/        # Report data + Excel export
│   │   └── activity-logs/    # Activity log API
│   ├── login/                # Halaman login (public)
│   ├── globals.css           # Global styles + design tokens
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Root redirect → /login
├── components/
│   ├── layout/               # Sidebar, Header, DashboardLayout
│   ├── providers/            # ThemeProvider, AuthProvider
│   └── ui/                   # Button, Card, Input, Select, Modal, Toast, etc.
├── lib/
│   ├── auth.ts               # JWT session + password helpers
│   ├── supabase.ts           # Supabase REST API client
│   ├── activity-logger.ts    # Activity logging helper
│   ├── data.ts               # Navigation config
│   └── utils.ts              # Format helpers (Rupiah, date, status)
├── types/
│   └── index.ts              # TypeScript type definitions
├── database/
│   ├── schema.sql            # Database schema + seed data
│   └── activity_logs.sql     # Activity logs table schema
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── logo.png              # Company logo
│   └── icons/                # PWA icons
├── middleware.ts              # Route protection middleware
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Docker Compose config
└── .env.local                 # Environment variables
```

---

## 🚀 Cara Menjalankan

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- Akun **Supabase** (sudah di-setup)

### 1. Clone & Install

```bash
git clone <repository-url>
cd krisna_crm
npm install
```

### 2. Setup Environment Variables

File `.env.local` sudah tersedia, berisi:

```env
SUPABASE_URL=https://bgharuggetsznnlrytyw.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SESSION_SECRET=<your-secret>
```

### 3. Setup Database

Buka **Supabase SQL Editor** dan jalankan isi file `database/schema.sql` untuk membuat tabel dan seed data.

> ⚠️ **Penting**: Pastikan tabel sudah dibuat sebelum menjalankan aplikasi.

Setelah tabel dibuat, Anda perlu generate hash password yang benar untuk seed users. Jalankan:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 10).then(h => console.log(h))"
```

Lalu update kolom `password_hash` pada tabel `users` dengan hash yang dihasilkan.

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 5. Login

| Role | Email | Password |
|------|-------|----------|
| Sales | `sales@smart.co.id` | `password123` |
| Manager | `manager@smart.co.id` | `password123` |

---

## 🐳 Docker Deployment

### Build & Run

```bash
docker-compose up --build -d
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000).

### Environment Variables

Pastikan file `.env.local` atau set environment variables di `docker-compose.yml`:

```yaml
environment:
  - SUPABASE_URL=https://bgharuggetsznnlrytyw.supabase.co
  - SUPABASE_ANON_KEY=<your-key>
  - SESSION_SECRET=<your-secret>
```

---

## 👥 Role & Akses

| Fitur | Sales | Manager |
|-------|-------|---------|
| Melihat data sendiri | ✅ | ✅ |
| Melihat data sales lain | ❌ | ✅ |
| CRUD Leads | ✅ (milik sendiri) | ✅ (semua) |
| CRUD Produk | ✅ | ✅ |
| Buat Project/Deal | ✅ | ✅ |
| Approve/Reject Deal | ❌ | ✅ |
| Lihat Pelanggan | ✅ (milik sendiri) | ✅ (semua) |
| Laporan | ✅ (data sendiri) | ✅ (semua data) |
| Export Excel | ✅ | ✅ |

---

## 📊 Alur Bisnis

```
Lead (Calon Customer)
  ↓ [Sales membuat project/deal]
Project / Deal Pipeline
  ↓ [Jika harga < harga jual → perlu approval]
  → Waiting Approval
    ↓ [Manager approve]
    → Approved → Customer + Services dibuat otomatis
    ↓ [Manager reject]
    → Rejected (dengan alasan)
```

---

## 📝 Catatan Teknis

1. **Autentikasi**: Menggunakan JWT stateless session yang disimpan di cookie httpOnly.
2. **Database**: Menggunakan Supabase PostgreSQL via REST API (bukan client library).
3. **Harga Jual**: Dihitung otomatis dari HPP + (HPP × Margin%).
4. **Approval**: Jika harga negosiasi < harga jual, project otomatis berstatus "waiting_approval".
5. **Auto-conversion**: Saat project di-approve, sistem otomatis membuat customer dan customer services.
6. **Role filtering**: Semua query API di-filter berdasarkan `sales_id` untuk role sales.
7. **Activity Log**: Setiap aksi CRUD, approval, dan rejection tercatat otomatis sebagai audit trail.
8. **WhatsApp**: Nomor kontak otomatis diformat ke format internasional (62xxx) untuk integrasi WA.
9. **PWA**: Aplikasi dapat di-install ke home screen perangkat mobile sebagai native app.

---

## 📄 Lisensi

Mini Project untuk keperluan pembelajaran — PT. Smart CRM.

**Happy Coding! 🚀**
