import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

// GET /api/activity-logs — Fetch activity logs
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const entityType = searchParams.get("entity_type");

    const filter: Record<string, string> = {};

    // Sales can only see their own activity
    if (user.role === "sales") {
      filter.user_id = `eq.${user.userId}`;
    }

    if (entityType) {
      filter.entity_type = `eq.${entityType}`;
    }

    const logs = await supabase.select("activity_logs", {
      filter,
      order: "created_at.desc",
      limit,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    console.error("Activity Logs GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/activity-logs — Create a new log entry
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, entity_type, entity_id, entity_name, details } = body;

    if (!action || !entity_type) {
      return NextResponse.json({ error: "action and entity_type are required" }, { status: 400 });
    }

    const log = await supabase.insert("activity_logs", {
      user_id: user.userId,
      user_name: user.name,
      action,
      entity_type,
      entity_id: entity_id || null,
      entity_name: entity_name || null,
      details: details || null,
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    console.error("Activity Logs POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
