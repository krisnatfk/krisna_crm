import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await supabase.selectOne("products", { filter: { id: `eq.${id}` } });

  if (!product) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: product });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  // Recalculate sell_price if hpp or margin changed
  if (body.hpp !== undefined && body.margin_percent !== undefined) {
    body.sell_price = body.hpp + (body.hpp * body.margin_percent) / 100;
  }

  const updated = await supabase.update("products", { id: `eq.${id}` }, {
    ...body,
    updated_at: new Date().toISOString(),
  });

  if (!updated.length) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  const result = updated[0] as Record<string, unknown>;
  await logActivity({
    userId: user.userId,
    userName: user.name,
    action: "updated",
    entityType: "product",
    entityId: id,
    entityName: (result.name as string) || "",
    details: `Produk diperbarui: ${result.name}`,
  });

  return NextResponse.json({ success: true, data: result });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await supabase.selectOne("products", { filter: { id: `eq.${id}` } });
  
  if (!product) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  await supabase.delete("products", { id: `eq.${id}` });
  await logActivity({
    userId: user.userId,
    userName: user.name,
    action: "deleted",
    entityType: "product",
    entityId: id,
    entityName: (product.name as string) || "",
    details: `Produk dihapus: ${product.name}`,
  });
  return NextResponse.json({ success: true });
}
