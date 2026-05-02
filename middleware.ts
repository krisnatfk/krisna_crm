import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

const publicPaths = ["/login", "/api/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bolehkan akses public routes
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Abaikan file statis & internal Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Cek cookie session
  const session = request.cookies.get("session")?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(session, encodedKey, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch {
    // Jika session tidak valid/expired
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
