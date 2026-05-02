import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await supabase.select("products", {
    order: "name.asc",
  });

  return NextResponse.json({ success: true, data: products });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, description, speed, hpp, margin_percent, is_active } = body;

  if (!name || hpp === undefined || margin_percent === undefined) {
    return NextResponse.json(
      { error: "Nama, HPP, dan margin wajib diisi" },
      { status: 400 }
    );
  }

  const sell_price = hpp + (hpp * margin_percent) / 100;

  const products = await supabase.insert("products", {
    name,
    description: description || null,
    speed: speed || null,
    hpp,
    margin_percent,
    sell_price,
    is_active: is_active !== undefined ? is_active : true,
  });

  const created = products[0] as Record<string, unknown>;
  await logActivity({
    userId: user.userId,
    userName: user.name,
    action: "created",
    entityType: "product",
    entityId: created.id as string,
    entityName: name,
    details: `Produk baru: ${name} (${speed || "-"})`,
  });

  return NextResponse.json({ success: true, data: created }, { status: 201 });
}
