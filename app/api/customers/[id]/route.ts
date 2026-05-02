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
