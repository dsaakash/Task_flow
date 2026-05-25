import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth-edge";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Static assets and favicon bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;
  const user = token ? await verifyToken(token) : null;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/team");

  // Not logged in
  if (!user) {
    if (isProtectedPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    // Logged in
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Role-based access control
    // Admin-only routing
    if (pathname.startsWith("/team") && user.role !== "Admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
