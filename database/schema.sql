-- =============================================
-- PT. Smart CRM — Database Schema
-- Supabase PostgreSQL
-- PENTING: RLS dinonaktifkan karena auth ditangani
-- oleh server-side API routes dengan JWT
-- =============================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'sales' CHECK (role IN ('sales', 'manager')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  contact VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  needs TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  sales_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  speed VARCHAR(50),
  hpp DECIMAL(15, 2) NOT NULL DEFAULT 0,
  margin_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  sell_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sales_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'waiting_approval' CHECK (status IN ('waiting_approval', 'approved', 'rejected')),
  notes TEXT,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Project Items Table
CREATE TABLE IF NOT EXISTS project_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  original_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  negotiated_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  needs_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  contact VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  project_id UUID REFERENCES projects(id),
  sales_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Customer Services Table
CREATE TABLE IF NOT EXISTS customer_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Activity Logs Table (Audit Trail)
-- Tracks all important actions in the CRM
-- =============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  entity_name VARCHAR(255),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_leads_sales_id ON leads(sales_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_projects_sales_id ON projects(sales_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_project_items_project_id ON project_items(project_id);
CREATE INDEX IF NOT EXISTS idx_customers_sales_id ON customers(sales_id);
CREATE INDEX IF NOT EXISTS idx_customer_services_customer_id ON customer_services(customer_id);

-- =============================================
-- DISABLE ROW LEVEL SECURITY
-- (Auth ditangani oleh server-side API routes)
-- =============================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_services DISABLE ROW LEVEL SECURITY;

-- 8. Activity Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  entity_name VARCHAR(255),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- =============================================
-- SEED DATA
-- =============================================

-- Default users (password: password123)
INSERT INTO users (email, password_hash, name, role) VALUES
  ('sales@smart.co.id', '$2b$10$2Ia1PzGZbuh7uBgDCyspP.r6PUtBo5eRsRYN6yWlcYbjMSpZYCqtK', 'Budi Santoso', 'sales'),
  ('manager@smart.co.id', '$2b$10$2Ia1PzGZbuh7uBgDCyspP.r6PUtBo5eRsRYN6yWlcYbjMSpZYCqtK', 'Rina Wijaya', 'manager')
ON CONFLICT (email) DO NOTHING;

-- Sample products (ISP packages)
INSERT INTO products (name, description, speed, hpp, margin_percent, sell_price) VALUES
  ('Paket Home 10', 'Internet rumah 10 Mbps', '10 Mbps', 100000, 30, 130000),
  ('Paket Home 20', 'Internet rumah 20 Mbps', '20 Mbps', 150000, 30, 195000),
  ('Paket Home 50', 'Internet rumah 50 Mbps', '50 Mbps', 250000, 25, 312500),
  ('Paket Home 100', 'Internet rumah 100 Mbps', '100 Mbps', 400000, 25, 500000),
  ('Paket Business 50', 'Internet bisnis 50 Mbps dedicated', '50 Mbps', 500000, 35, 675000),
  ('Paket Business 100', 'Internet bisnis 100 Mbps dedicated', '100 Mbps', 800000, 35, 1080000),
  ('Paket Enterprise 200', 'Internet enterprise 200 Mbps dedicated + SLA', '200 Mbps', 1500000, 40, 2100000),
  ('Paket Enterprise 500', 'Internet enterprise 500 Mbps dedicated + SLA', '500 Mbps', 3000000, 40, 4200000)
ON CONFLICT DO NOTHING;
