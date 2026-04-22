import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-change-in-prod");

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    // Public Paths
    if (pathname === "/login" || pathname === "/signup" || pathname === "/") {
        if (token) {
            // If already logged in, redirect to role-specific dashboard
            try {
                const { payload } = await jwtVerify(token, JWT_SECRET);
                const role = payload.role as string;

                const dashboardMap: Record<string, string> = {
                    ADMIN: "/admin",
                    DOCTOR: "/doctor",
                    PATIENT: "/patient",
                    STAFF_NURSE: "/staff",
                    STAFF_RECEPTION: "/staff",
                    STAFF_LAB: "/staff",
                    STAFF_PHARMACY: "/staff"
                };

                const dashboard = dashboardMap[role] || "/login";
                return NextResponse.redirect(new URL(dashboard, request.url));
            } catch {
                // Invalid token, continue to login
            }
        }
        return NextResponse.next();
    }

    // Protected Paths
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.role as string;

        // RBAC Logic
        if (pathname.startsWith("/admin") && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
        if (pathname.startsWith("/doctor") && role !== "DOCTOR") {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
        if (pathname.startsWith("/patient") && role !== "PATIENT") {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
        // Staff logic...

        return NextResponse.next();
    } catch (error) {
        // Invalid token
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
