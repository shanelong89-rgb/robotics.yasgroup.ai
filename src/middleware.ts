import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/",
  "/risk",
  "/claims",
  "/treasury",
  "/capital",
  "/fleet",
  "/asset",
  "/insights",
  "/alerts",
  "/telemetry",
  "/markets",
  "/invest",
];

const PUBLIC_ROUTES = ["/login", "/signup", "/quote", "/onboard", "/demo", "/_next", "/api", "/favicon"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((pub) => pathname === pub || pathname.startsWith(pub + "/") || pathname.startsWith(pub));
}

function isProtectedRoute(pathname: string): boolean {
  // Static files / API routes are not protected
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return false;
  }
  return PROTECTED_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(route + "/");
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes and static assets
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Only protect designated protected routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const token = request.cookies.get("yas_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|yas-logo.png|manifest.json|sw.js|apple-touch-icon.png|icon-.*\\.png).*)",
  ],
};
