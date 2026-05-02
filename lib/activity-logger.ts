import { supabase } from "@/lib/supabase";

interface LogActivityParams {
  userId: string;
  userName: string;
  action: "created" | "updated" | "deleted" | "approved" | "rejected" | "exported";
  entityType: "lead" | "product" | "project" | "customer" | "report";
  entityId?: string;
  entityName?: string;
  details?: string;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await supabase.insert("activity_logs", {
      user_id: params.userId,
      user_name: params.userName,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      entity_name: params.entityName || null,
      details: params.details || null,
    }, false);
  } catch (error) {
    // Don't throw — logging should never break the main flow
    console.error("Failed to log activity:", error);
  }
}
