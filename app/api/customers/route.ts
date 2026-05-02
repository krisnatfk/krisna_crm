import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");

  const filter: Record<string, string> = {};
  if (user.role === "sales") filter.sales_id = `eq.${user.userId}`;
  if (search) {
    filter.or = `(name.ilike.*${search}*,company.ilike.*${search}*,contact.ilike.*${search}*)`;
  }

  const customers = await supabase.select("customers", {
    filter,
    order: "created_at.desc",
  });

  // Fetch services for each customer
  const customersWithServices = await Promise.all(
    (customers as Record<string, unknown>[]).map(async (customer) => {
      const services = await supabase.select("customer_services", {
        filter: { customer_id: `eq.${customer.id}` },
      });
      return { ...customer, services };
    })
  );

  return NextResponse.json({ success: true, data: customersWithServices });
}
