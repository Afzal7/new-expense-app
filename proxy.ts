import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Proxy for route protection (Next.js 16+ Middleware replacement).
 *
 * Rules:
 * 1. Public routes are accessible to everyone.
 * 2. All other routes require authentication.
 * 3. Unauthenticated users accessing protected routes are redirected to /login.
 */

const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/api/auth", // Better Auth endpoints must be public
    "/api/webhooks", // Webhooks (Stripe) must be public
];

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. Check if the current route is public
    const isPublic = publicRoutes.some((route) => {
        // Exact match or sub-path match for API/Auth routes
        return path === route || path.startsWith(route + "/");
    });

    if (isPublic) {
        return NextResponse.next();
    }

    // 2. Check for session cookie
    // Uses better-auth/cookies helper for safe cookie reading
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
        // Redirect to login with return URL
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("callbackUrl", path); // Optional: preserve intent
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all paths except static files, images, etc.
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
