import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { compare, hash } from "bcryptjs";
import type { SessionPayload, User } from "@/types";

const secretKey = process.env.SESSION_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

// =============================================
// Password Helpers
// =============================================

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// =============================================
// JWT Helpers
// =============================================

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    avatar_url: payload.avatar_url,
    role: payload.role,
    expiresAt: payload.expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      avatar_url: payload.avatar_url as string | undefined,
      role: payload.role as "sales" | "manager",
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch {
    return null;
  }
}

// =============================================
// Session Management
// =============================================

export async function createSession(user: User): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({
    userId: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    role: user.role,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return decrypt(session);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getCurrentUser(): Promise<{
  userId: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: "sales" | "manager";
} | null> {
  const session = await getSession();
  if (!session) return null;
  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    avatar_url: session.avatar_url,
    role: session.role,
  };
}
