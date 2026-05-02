import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyPassword, createSession } from "@/lib/auth";
import type { User } from "@/types";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: "sales" | "manager";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Find user by email
    let user: UserRow | null = null;
    try {
      user = await supabase.selectOne<UserRow>("users", {
        filter: { email: `eq.${email}` },
        select: "id,email,password_hash,name,role",
      });
    } catch (dbError) {
      console.error("DB query error:", dbError);
      return NextResponse.json(
        { success: false, error: "Gagal mengakses database. Pastikan RLS sudah dinonaktifkan pada tabel users." },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Create session
    const sessionUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    await createSession(sessionUser);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
