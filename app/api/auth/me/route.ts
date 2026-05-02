import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Fetch latest data from database
  try {
    const dbUser = await supabase.selectOne<any>("users", {
      filter: { id: `eq.${user.userId}` },
      select: "id, email, name, avatar_url, role",
    });

    if (dbUser) {
      return NextResponse.json({ 
        success: true, 
        user: {
          userId: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          avatar_url: dbUser.avatar_url,
          role: dbUser.role
        } 
      });
    }
  } catch (err) {
    console.error("Failed to fetch fresh user data:", err);
  }

  // Fallback to session data if DB fetch fails
  return NextResponse.json({ success: true, user });
}
