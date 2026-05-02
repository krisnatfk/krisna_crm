import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, createSession, verifyPassword, hashPassword } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, avatar_url, currentPassword, newPassword } = body;

    // Handle Profile Update (Name, Email, Avatar)
    if (name || email || avatar_url !== undefined) {
      const updates: any = { updated_at: new Date().toISOString() };
      
      if (name) updates.name = name;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      
      // If email is changing, we should check for uniqueness, but Supabase handles unique constraints.
      // We will just try to update it and catch the error if it exists.
      if (email && email !== user.email) {
        updates.email = email;
      }

      try {
        await supabase.update("users", { id: `eq.${user.userId}` }, updates);
      } catch (error: any) {
        if (error.message?.includes('23505') || error.message?.includes('duplicate key')) {
          return NextResponse.json({ success: false, error: "Email sudah digunakan oleh pengguna lain" }, { status: 400 });
        }
        throw error;
      }

      // Update session with new name/email
      await createSession({
        id: user.userId,
        email: email || user.email,
        name: name || user.name,
        role: user.role,
      });

      return NextResponse.json({ success: true, message: "Profile updated" });
    }

    // Handle Password Update
    if (currentPassword && newPassword) {
      // 1. Get current password hash
      const dbUser = await supabase.selectOne<{ password_hash: string }>("users", {
        filter: { id: `eq.${user.userId}` },
        select: "password_hash"
      });

      if (!dbUser) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }

      // 2. Verify current password
      const isValid = await verifyPassword(currentPassword, dbUser.password_hash);
      if (!isValid) {
        return NextResponse.json({ success: false, error: "Password saat ini salah" }, { status: 400 });
      }

      // 3. Hash new password and update
      const newHash = await hashPassword(newPassword);
      await supabase.update("users", { id: `eq.${user.userId}` }, { password_hash: newHash, updated_at: new Date().toISOString() });

      return NextResponse.json({ success: true, message: "Password updated" });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
