-- Skrip Data Dummy Skala Besar untuk PT. Smart CRM
-- Cara menggunakan: Copy semua isi file ini, buka Supabase SQL Editor, paste, lalu klik RUN.

DO $$ 
DECLARE
    sales_id UUID;
    manager_id UUID;

    -- Product IDs
    prod_h10 UUID := gen_random_uuid();
    prod_h20 UUID := gen_random_uuid();
    prod_h50 UUID := gen_random_uuid();
    prod_b50 UUID := gen_random_uuid();
    prod_e100 UUID := gen_random_uuid();
    prod_e200 UUID := gen_random_uuid();

    -- Leads UUIDs
    l1 UUID := gen_random_uuid(); l2 UUID := gen_random_uuid(); l3 UUID := gen_random_uuid();
    l4 UUID := gen_random_uuid(); l5 UUID := gen_random_uuid(); l6 UUID := gen_random_uuid();
    l7 UUID := gen_random_uuid(); l8 UUID := gen_random_uuid(); l9 UUID := gen_random_uuid();
    l10 UUID := gen_random_uuid(); l11 UUID := gen_random_uuid(); l12 UUID := gen_random_uuid();
    l13 UUID := gen_random_uuid(); l14 UUID := gen_random_uuid(); l15 UUID := gen_random_uuid();
    l16 UUID := gen_random_uuid(); l17 UUID := gen_random_uuid(); l18 UUID := gen_random_uuid();
    l19 UUID := gen_random_uuid(); l20 UUID := gen_random_uuid(); l21 UUID := gen_random_uuid();
    l22 UUID := gen_random_uuid(); l23 UUID := gen_random_uuid(); l24 UUID := gen_random_uuid();
    l25 UUID := gen_random_uuid(); l26 UUID := gen_random_uuid(); l27 UUID := gen_random_uuid();
    l28 UUID := gen_random_uuid(); l29 UUID := gen_random_uuid(); l30 UUID := gen_random_uuid();

    -- Projects UUIDs
    p1 UUID := gen_random_uuid(); p2 UUID := gen_random_uuid(); p3 UUID := gen_random_uuid();
    p4 UUID := gen_random_uuid(); p5 UUID := gen_random_uuid(); p6 UUID := gen_random_uuid();
    p7 UUID := gen_random_uuid(); p8 UUID := gen_random_uuid(); p9 UUID := gen_random_uuid();
    p10 UUID := gen_random_uuid(); p11 UUID := gen_random_uuid(); p12 UUID := gen_random_uuid();
    p13 UUID := gen_random_uuid(); p14 UUID := gen_random_uuid(); p15 UUID := gen_random_uuid();
    p16 UUID := gen_random_uuid(); p17 UUID := gen_random_uuid(); p18 UUID := gen_random_uuid();

    -- Customers UUIDs
    c1 UUID := gen_random_uuid(); c2 UUID := gen_random_uuid(); c3 UUID := gen_random_uuid();
    c4 UUID := gen_random_uuid(); c5 UUID := gen_random_uuid(); c6 UUID := gen_random_uuid();
    c7 UUID := gen_random_uuid(); c8 UUID := gen_random_uuid(); c9 UUID := gen_random_uuid();
    c10 UUID := gen_random_uuid(); c11 UUID := gen_random_uuid(); c12 UUID := gen_random_uuid();

BEGIN
    -- 1. Get Sales and Manager ID
    SELECT id INTO sales_id FROM users WHERE role = 'sales' LIMIT 1;
    SELECT id INTO manager_id FROM users WHERE role = 'manager' LIMIT 1;

    -- Bersihkan data lama (kecuali users) agar tidak duplikat
    DELETE FROM customer_services;
    DELETE FROM customers;
    DELETE FROM project_items;
    DELETE FROM projects;
    DELETE FROM leads;
    DELETE FROM products;

    -- 2. Insert Products
    INSERT INTO products (id, name, description, speed, hpp, margin_percent, sell_price, is_active) VALUES
    (prod_h10, 'Paket Home 10', 'Internet Fiber untuk rumah (1-3 device)', '10 Mbps', 100000, 50, 150000, true),
    (prod_h20, 'Paket Home 20', 'Internet Fiber untuk rumah (3-5 device)', '20 Mbps', 150000, 30, 195000, true),
    (prod_h50, 'Paket Home 50', 'Internet Fiber ultra cepat untuk rumah', '50 Mbps', 250000, 40, 350000, true),
    (prod_b50, 'Paket Bisnis 50', 'Internet Dedicated IP Public untuk UMKM', '50 Mbps', 400000, 50, 600000, true),
    (prod_e100, 'Paket Enterprise 100', 'Internet Dedicated SLA 99.9% 100Mbps', '100 Mbps', 1500000, 60, 2400000, true),
    (prod_e200, 'Paket Enterprise 200', 'Internet Dedicated SLA 99.9% 200Mbps', '200 Mbps', 2500000, 60, 4000000, true);

    -- 3. Insert Leads (30 Data tersebar di 4 bulan terakhir)
    INSERT INTO leads (id, name, company, contact, email, needs, status, sales_id, created_at) VALUES
    -- Won Leads (Untuk jadi customer)
    (l1, 'Budi Gunawan', 'PT. Sentosa Makmur', '0811111111', 'budi@sentosa.id', 'Internet kantor 100Mbps', 'won', sales_id, NOW() - INTERVAL '110 days'),
    (l2, 'Citra Lestari', 'Klinik Sehat', '0811111112', 'citra@klinik.id', 'Home 20Mbps', 'won', sales_id, NOW() - INTERVAL '95 days'),
    (l3, 'Dimas Anggara', 'Cafe Kopi Kita', '0811111113', 'dimas@kopi.com', 'Bisnis 50Mbps', 'won', sales_id, NOW() - INTERVAL '80 days'),
    (l4, 'Eka Putra', 'CV. Maju Jaya', '0811111114', 'eka@maju.id', 'Home 50Mbps', 'won', sales_id, NOW() - INTERVAL '70 days'),
    (l5, 'Faisal Akbar', 'PT. Logistik Cepat', '0811111115', 'faisal@logistik.com', 'Enterprise 200Mbps', 'won', sales_id, NOW() - INTERVAL '60 days'),
    (l6, 'Gita Wirjawan', 'Sekolah Alam', '0811111116', 'gita@sekolah.id', 'Bisnis 50Mbps', 'won', sales_id, NOW() - INTERVAL '50 days'),
    (l7, 'Hadi Mulyadi', 'Toko Bangunan Sukses', '0811111117', 'hadi@tokosukses.com', 'Home 20Mbps', 'won', sales_id, NOW() - INTERVAL '45 days'),
    (l8, 'Indah Permata', 'Butik Indah', '0811111118', 'indah@butik.com', 'Home 10Mbps', 'won', sales_id, NOW() - INTERVAL '35 days'),
    (l9, 'Joko Susilo', 'PT. Manufaktur Kuat', '0811111119', 'joko@manufaktur.id', 'Enterprise 100Mbps', 'won', sales_id, NOW() - INTERVAL '30 days'),
    (l10, 'Kartika Putri', 'Apotek K-24', '0811111120', 'kartika@apotek.com', 'Home 20Mbps', 'won', sales_id, NOW() - INTERVAL '25 days'),
    (l11, 'Lukman Hakim', 'Yayasan Peduli', '0811111121', 'lukman@peduli.org', 'Bisnis 50Mbps', 'won', sales_id, NOW() - INTERVAL '20 days'),
    (l12, 'Maya Estianty', 'Studio Foto Indah', '0811111122', 'maya@studio.com', 'Home 50Mbps', 'won', sales_id, NOW() - INTERVAL '15 days'),

    -- Active Pipeline (New, Contacted, Qualified, Proposal, Negotiation)
    (l13, 'Ahmad Fais', 'PT. Konstruksi Hebat', '0812345601', 'ahmad@konstruksi.id', 'Enterprise 200Mbps', 'new', sales_id, NOW() - INTERVAL '1 days'),
    (l14, 'Nisa Sabyan', 'Travel Agent', '0812345602', 'nisa@travel.com', 'Home 50Mbps', 'new', sales_id, NOW() - INTERVAL '2 days'),
    (l15, 'Omar Daniel', 'Startup Tech', '0812345603', 'omar@startup.id', 'Enterprise 100Mbps', 'new', sales_id, NOW() - INTERVAL '3 days'),
    (l16, 'Putri Titian', 'Salon Cantik', '0812345604', 'putri@salon.com', 'Home 20Mbps', 'contacted', sales_id, NOW() - INTERVAL '4 days'),
    (l17, 'Qori Khasanah', 'Minimarket 24', '0812345605', 'qori@mini.com', 'Home 10Mbps', 'contacted', sales_id, NOW() - INTERVAL '5 days'),
    (l18, 'Rafi Ahmad', 'Production House', '0812345606', 'rafi@ph.id', 'Enterprise 200Mbps', 'contacted', sales_id, NOW() - INTERVAL '6 days'),
    (l19, 'Siti Badriah', 'Toko Roti', '0812345607', 'siti@roti.com', 'Home 20Mbps', 'qualified', sales_id, NOW() - INTERVAL '7 days'),
    (l20, 'Tora Sudiro', 'Bengkel Motor', '0812345608', 'tora@bengkel.com', 'Bisnis 50Mbps', 'qualified', sales_id, NOW() - INTERVAL '8 days'),
    (l21, 'Umar Lubis', 'Koperasi Warga', '0812345609', 'umar@koperasi.id', 'Home 50Mbps', 'qualified', sales_id, NOW() - INTERVAL '10 days'),
    (l22, 'Vino Bastian', 'Distro Baju', '0812345610', 'vino@distro.com', 'Home 20Mbps', 'proposal', sales_id, NOW() - INTERVAL '12 days'),
    (l23, 'Wulan Guritno', 'Klinik Kecantikan', '0812345611', 'wulan@klinik.com', 'Bisnis 50Mbps', 'proposal', sales_id, NOW() - INTERVAL '14 days'),
    (l24, 'Xavier Anwar', 'Konsultan Hukum', '0812345612', 'xavier@lawfirm.id', 'Enterprise 100Mbps', 'proposal', sales_id, NOW() - INTERVAL '15 days'),
    (l25, 'Yuni Shara', 'Sekolah Musik', '0812345613', 'yuni@musik.com', 'Home 50Mbps', 'negotiation', sales_id, NOW() - INTERVAL '16 days'),
    (l26, 'Zaskia Adya', 'Grosir Hijab', '0812345614', 'zaskia@hijab.com', 'Bisnis 50Mbps', 'negotiation', sales_id, NOW() - INTERVAL '18 days'),

    -- Lost Leads
    (l27, 'Agus Ringgo', 'Rental Mobil', '0812345615', 'agus@rental.com', 'Home 10Mbps', 'lost', sales_id, NOW() - INTERVAL '40 days'),
    (l28, 'Baim Wong', 'Restoran Seafood', '0812345616', 'baim@resto.com', 'Bisnis 50Mbps', 'lost', sales_id, NOW() - INTERVAL '65 days'),
    (l29, 'Cinta Laura', 'Gym Fitness', '0812345617', 'cinta@gym.com', 'Enterprise 100Mbps', 'lost', sales_id, NOW() - INTERVAL '85 days'),
    (l30, 'Dedy Corbuzier', 'Podcast Studio', '0812345618', 'dedy@studio.com', 'Enterprise 200Mbps', 'lost', sales_id, NOW() - INTERVAL '100 days');

    -- 4. Insert Projects (Deals)
    INSERT INTO projects (id, project_name, lead_id, sales_id, status, notes, total_amount, created_at) VALUES
    -- Won Deals (Approved)
    (p1, 'Pemasangan PT. Sentosa', l1, sales_id, 'approved', 'Sudah pasang', 2400000, NOW() - INTERVAL '105 days'),
    (p2, 'Instalasi Klinik Sehat', l2, sales_id, 'approved', 'Selesai', 195000, NOW() - INTERVAL '90 days'),
    (p3, 'Wifi Cafe Kopi Kita', l3, sales_id, 'approved', 'Setup selesai', 600000, NOW() - INTERVAL '75 days'),
    (p4, 'Koneksi CV. Maju Jaya', l4, sales_id, 'approved', 'Lancar', 350000, NOW() - INTERVAL '65 days'),
    (p5, 'Dedicated PT. Logistik', l5, sales_id, 'approved', 'Pasang tiang', 4000000, NOW() - INTERVAL '55 days'),
    (p6, 'Jaringan Sekolah Alam', l6, sales_id, 'approved', 'Disetujui Kepsek', 600000, NOW() - INTERVAL '45 days'),
    (p7, 'Wifi Toko Bangunan', l7, sales_id, 'approved', 'Oke', 195000, NOW() - INTERVAL '40 days'),
    (p8, 'Internet Butik Indah', l8, sales_id, 'approved', 'Selesai', 150000, NOW() - INTERVAL '30 days'),
    (p9, 'Dedicated Manufaktur', l9, sales_id, 'approved', 'Perlu switch tambahan & backup link', 2750000, NOW() - INTERVAL '25 days'),
    (p10, 'Wifi Apotek K-24', l10, sales_id, 'approved', 'Selesai', 195000, NOW() - INTERVAL '20 days'),
    (p11, 'Koneksi Yayasan Peduli', l11, sales_id, 'approved', 'Diskon khusus yayasan', 500000, NOW() - INTERVAL '15 days'),
    (p12, 'Internet Studio Foto', l12, sales_id, 'approved', 'Oke', 350000, NOW() - INTERVAL '10 days'),

    -- Pending/Negotiation/Proposal Deals
    (p13, 'Penawaran Distro Baju', l22, sales_id, 'waiting_approval', 'Minta harga promo 180rb', 180000, NOW() - INTERVAL '10 days'),
    (p14, 'Project Klinik Kecantikan', l23, sales_id, 'waiting_approval', 'Standard', 600000, NOW() - INTERVAL '12 days'),
    (p15, 'Dedicated Law Firm', l24, sales_id, 'waiting_approval', 'Perlu ACC Dirut, dedicated + backup UMKM', 3000000, NOW() - INTERVAL '13 days'),
    (p16, 'Wifi Sekolah Musik', l25, sales_id, 'waiting_approval', 'Menunggu ttd kontrak', 350000, NOW() - INTERVAL '14 days'),
    (p17, 'Koneksi Grosir Hijab', l26, sales_id, 'waiting_approval', 'Nego harga pasang', 600000, NOW() - INTERVAL '15 days'),

    -- Rejected Deals
    (p18, 'Instalasi Gym Fitness', l29, sales_id, 'rejected', 'Harga kemahalan', 2400000, NOW() - INTERVAL '80 days');

    -- 5. Insert Project Items
    INSERT INTO project_items (project_id, product_id, quantity, original_price, negotiated_price, needs_approval) VALUES
    (p1, prod_e100, 1, 2400000, 2400000, false),
    (p2, prod_h20, 1, 195000, 195000, false),
    (p3, prod_b50, 1, 600000, 600000, false),
    (p4, prod_h50, 1, 350000, 350000, false),
    (p5, prod_e200, 1, 4000000, 4000000, false),
    (p6, prod_b50, 1, 600000, 600000, false),
    (p7, prod_h20, 1, 195000, 195000, false),
    (p8, prod_h10, 1, 150000, 150000, false),
    (p9, prod_e100, 1, 2400000, 2400000, false),
    (p9, prod_h50, 1, 350000, 350000, false), -- Multiple items (Backup link)
    (p10, prod_h20, 1, 195000, 195000, false),
    (p11, prod_b50, 1, 600000, 500000, true), -- Custom price discount
    (p12, prod_h50, 1, 350000, 350000, false),
    (p13, prod_h20, 1, 195000, 180000, true), -- Custom price discount
    (p14, prod_b50, 1, 600000, 600000, false),
    (p15, prod_e100, 1, 2400000, 2400000, false),
    (p15, prod_b50, 1, 600000, 600000, false), -- Multiple items
    (p16, prod_h50, 1, 350000, 350000, false),
    (p17, prod_b50, 1, 600000, 600000, false),
    (p18, prod_e100, 1, 2400000, 2400000, false);

    -- 6. Insert Customers (Pelanggan Aktif)
    INSERT INTO customers (id, name, company, contact, email, address, sales_id, created_at) VALUES
    (c1, 'Budi Gunawan', 'PT. Sentosa Makmur', '0811111111', 'budi@sentosa.id', 'Jl. Sudirman 1', sales_id, NOW() - INTERVAL '100 days'),
    (c2, 'Citra Lestari', 'Klinik Sehat', '0811111112', 'citra@klinik.id', 'Jl. Thamrin 2', sales_id, NOW() - INTERVAL '85 days'),
    (c3, 'Dimas Anggara', 'Cafe Kopi Kita', '0811111113', 'dimas@kopi.com', 'Jl. Gatot Subroto 3', sales_id, NOW() - INTERVAL '70 days'),
    (c4, 'Eka Putra', 'CV. Maju Jaya', '0811111114', 'eka@maju.id', 'Jl. Rasuna Said 4', sales_id, NOW() - INTERVAL '60 days'),
    (c5, 'Faisal Akbar', 'PT. Logistik Cepat', '0811111115', 'faisal@logistik.com', 'Kawasan Industri 5', sales_id, NOW() - INTERVAL '50 days'),
    (c6, 'Gita Wirjawan', 'Sekolah Alam', '0811111116', 'gita@sekolah.id', 'Jl. Pramuka 6', sales_id, NOW() - INTERVAL '40 days'),
    (c7, 'Hadi Mulyadi', 'Toko Bangunan Sukses', '0811111117', 'hadi@tokosukses.com', 'Jl. Asia Afrika 7', sales_id, NOW() - INTERVAL '35 days'),
    (c8, 'Indah Permata', 'Butik Indah', '0811111118', 'indah@butik.com', 'Jl. Dago 8', sales_id, NOW() - INTERVAL '25 days'),
    (c9, 'Joko Susilo', 'PT. Manufaktur Kuat', '0811111119', 'joko@manufaktur.id', 'Kawasan Industri 9', sales_id, NOW() - INTERVAL '20 days'),
    (c10, 'Kartika Putri', 'Apotek K-24', '0811111120', 'kartika@apotek.com', 'Jl. Braga 10', sales_id, NOW() - INTERVAL '15 days'),
    (c11, 'Lukman Hakim', 'Yayasan Peduli', '0811111121', 'lukman@peduli.org', 'Jl. Pahlawan 11', sales_id, NOW() - INTERVAL '10 days'),
    (c12, 'Maya Estianty', 'Studio Foto Indah', '0811111122', 'maya@studio.com', 'Jl. Riau 12', sales_id, NOW() - INTERVAL '5 days');

    -- 7. Insert Customer Services (Layanan Aktif/Nonaktif Pelanggan)
    INSERT INTO customer_services (customer_id, product_id, price, start_date, status) VALUES
    (c1, prod_e100, 2400000, (NOW() - INTERVAL '99 days')::DATE, 'active'),
    (c1, prod_h20, 195000, (NOW() - INTERVAL '50 days')::DATE, 'active'), -- Tambah layanan kedua
    (c2, prod_h20, 195000, (NOW() - INTERVAL '84 days')::DATE, 'active'),
    (c3, prod_b50, 600000, (NOW() - INTERVAL '69 days')::DATE, 'active'),
    (c4, prod_h50, 350000, (NOW() - INTERVAL '59 days')::DATE, 'active'),
    (c5, prod_e200, 4000000, (NOW() - INTERVAL '49 days')::DATE, 'active'),
    (c6, prod_b50, 600000, (NOW() - INTERVAL '39 days')::DATE, 'inactive'), -- Berhenti berlangganan
    (c7, prod_h20, 195000, (NOW() - INTERVAL '34 days')::DATE, 'active'),
    (c8, prod_h10, 150000, (NOW() - INTERVAL '24 days')::DATE, 'active'),
    (c9, prod_e100, 2400000, (NOW() - INTERVAL '19 days')::DATE, 'active'),
    (c10, prod_h20, 195000, (NOW() - INTERVAL '14 days')::DATE, 'active'),
    (c11, prod_b50, 500000, (NOW() - INTERVAL '9 days')::DATE, 'active'),
    (c12, prod_h50, 350000, (NOW() - INTERVAL '4 days')::DATE, 'active');
    
END $$;
