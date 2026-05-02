// =============================================
// Navigation Types
// =============================================

export type NavItemType = {
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  active?: boolean;
};

export type NavSectionType = {
  title: string;
  items: NavItemType[];
};

// =============================================
// Auth & User Types
// =============================================

export type UserRole = "sales" | "manager";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  expiresAt: Date;
}

// =============================================
// Lead Types
// =============================================

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Lead {
  id: string;
  name: string;
  company?: string;
  contact: string;
  email?: string;
  address?: string;
  needs?: string;
  status: LeadStatus;
  sales_id: string;
  created_at: string;
  updated_at: string;
  // joined
  sales_name?: string;
}

// =============================================
// Product Types
// =============================================

export interface Product {
  id: string;
  name: string;
  description?: string;
  speed?: string;
  hpp: number;
  margin_percent: number;
  sell_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================
// Project / Deal Types
// =============================================

export type ProjectStatus = "waiting_approval" | "approved" | "rejected";

export interface Project {
  id: string;
  project_name: string;
  lead_id: string;
  sales_id: string;
  status: ProjectStatus;
  notes?: string;
  total_amount: number;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  // joined
  lead_name?: string;
  lead_company?: string;
  sales_name?: string;
  approver_name?: string;
  items?: ProjectItem[];
}

export interface ProjectItem {
  id: string;
  project_id: string;
  product_id: string;
  quantity: number;
  original_price: number;
  negotiated_price: number;
  needs_approval: boolean;
  created_at: string;
  // joined
  product_name?: string;
  product_speed?: string;
}

// =============================================
// Customer Types
// =============================================

export interface Customer {
  id: string;
  name: string;
  company?: string;
  contact: string;
  email?: string;
  address?: string;
  project_id?: string;
  sales_id: string;
  created_at: string;
  updated_at: string;
  // joined
  sales_name?: string;
  services?: CustomerService[];
}

export interface CustomerService {
  id: string;
  customer_id: string;
  product_id: string;
  price: number;
  start_date: string;
  end_date?: string;
  status: "active" | "inactive";
  created_at: string;
  // joined
  product_name?: string;
  product_speed?: string;
}

// =============================================
// Reporting Types
// =============================================

export interface ReportSummary {
  totalRevenue: number;
  totalDeals: number;
  totalCustomers: number;
  totalLeads: number;
  conversionRate: number;
  avgDealValue: number;
}

export interface ReportData {
  summary: ReportSummary;
  revenueByMonth: { month: string; revenue: number; deals: number }[];
  dealsByStatus: { status: string; count: number }[];
  topProducts: { name: string; revenue: number; count: number }[];
  transactions: ProjectWithDetails[];
}

export interface ProjectWithDetails extends Project {
  items: ProjectItem[];
}

// =============================================
// UI / Dashboard Types
// =============================================

export interface StatCard {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  sparklineData?: number[];
}

export interface ChartDataPoint {
  name: string;
  revenue?: number;
  orders?: number;
  profit?: number;
  deals?: number;
  leads?: number;
}

// =============================================
// API Response Types
// =============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// =============================================
// Form Types
// =============================================

export interface LeadFormData {
  name: string;
  company?: string;
  contact: string;
  email?: string;
  address?: string;
  needs?: string;
  status: LeadStatus;
}

export interface ProductFormData {
  name: string;
  description?: string;
  speed?: string;
  hpp: number;
  margin_percent: number;
  is_active: boolean;
}

export interface ProjectFormData {
  project_name: string;
  lead_id: string;
  notes?: string;
  items: ProjectItemFormData[];
}

export interface ProjectItemFormData {
  product_id: string;
  quantity: number;
  negotiated_price: number;
}
