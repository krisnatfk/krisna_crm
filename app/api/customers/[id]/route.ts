import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const rows = await supabase.select("customers", {
    filter: { id: `eq.${id}` },
  });

  if (!rows || (rows as unknown[]).length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const customer = (rows as Record<string, unknown>[])[0];

  // Fetch services
  const services = await supabase.select("customer_services", {
    filter: { customer_id: `eq.${id}` },
  });

  // Fetch products for service names
  const products = await supabase.select("products", {});

  return NextResponse.json({
    success: true,
    data: { ...customer, services, products },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const allowedFields = ["name", "company", "contact", "email", "address"];
  const updateData: Record<string, any> = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) updateData[field] = body[field];
  });

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    await supabase.update("customers", { id: `eq.${id}` }, updateData);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Gagal memperbarui pelanggan" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // Hapus layanan pelanggan
    await supabase.delete("customer_services", { customer_id: `eq.${id}` });
    
    // Hapus pelanggan
    await supabase.delete("customers", { id: `eq.${id}` });
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Gagal menghapus pelanggan" }, { status: 500 });
  }
}
