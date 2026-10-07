import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cookie identifiers matching backend and frontend auth service
const COOKIES = {
  SESSION: "session_id",
  PENDING_VERIFY_EMAIL: "pending_verification_email",
  PENDING_RESET_EMAIL: "pending_reset_email",
  PENDING_RESET_VERIFIED: "pending_reset_verified",
};

// Route definitions
const PROTECTED_PREFIXES = ["/workspace", "/dashboard"];
const GUEST_ONLY_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1. Read authentication and flow cookies
  const sessionId = req.cookies.get(COOKIES.SESSION)?.value;
  const pendingVerifyEmail = req.cookies.get(
    COOKIES.PENDING_VERIFY_EMAIL
  )?.value;
  const pendingResetEmail = req.cookies.get(COOKIES.PENDING_RESET_EMAIL)?.value;
  const isResetVerified =
    req.cookies.get(COOKIES.PENDING_RESET_VERIFIED)?.value === "true";

  // Check URL query parameters as fallback for deep links
  const queryEmail = req.nextUrl.searchParams.get("email");

  // Route alias shortcuts (/login -> /auth/login, etc.)
  if (pathname === "/login") {
    return NextResponse.redirect(new URL(`/auth/login${search}`, req.url));
  }
  if (pathname === "/register") {
    return NextResponse.redirect(new URL(`/auth/register${search}`, req.url));
  }
  if (pathname === "/forgot-password") {
    return NextResponse.redirect(
      new URL(`/auth/forgot-password${search}`, req.url)
    );
  }

  // 2. Check if route is protected (requires active session)
  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedRoute && !sessionId) {
    const fullPath = `${pathname}${search}`;
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", fullPath);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Guest-only routes: redirect logged-in users away from login/register/forgot-password
  const isGuestOnlyRoute = GUEST_ONLY_ROUTES.includes(pathname);
  if (isGuestOnlyRoute && sessionId) {
    return NextResponse.redirect(new URL("/workspace", req.url));
  }

  // 4. Multi-step route step protections:
  // Step 2 of registration: Verify OTP page
  if (pathname === "/auth/verify") {
    // Requires step 1 (registration) to have completed
    const hasPendingEmail = Boolean(pendingVerifyEmail || queryEmail);
    if (!hasPendingEmail) {
      return NextResponse.redirect(new URL("/auth/register", req.url));
    }
  }

  // Step 2 of forgot password: Verify OTP page
  if (pathname === "/auth/verify-forgot-password-otp") {
    // Requires step 1 (forgot password) to have completed
    const hasResetEmail = Boolean(pendingResetEmail || queryEmail);
    if (!hasResetEmail) {
      return NextResponse.redirect(new URL("/auth/forgot-password", req.url));
    }
  }

  // Step 3 of forgot password: Reset Password page
  if (pathname === "/auth/reset-password") {
    // Requires step 2 (verify reset OTP) to be confirmed
    if (!isResetVerified) {
      // If we have the email, go back to step 2; otherwise step 1
      const destination =
        pendingResetEmail || queryEmail
          ? "/auth/verify-forgot-password-otp"
          : "/auth/forgot-password";
      return NextResponse.redirect(new URL(destination, req.url));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - metadata files (favicon.ico, robots.txt, sitemap.xml)
     * - public assets (.png, .svg, .jpg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
