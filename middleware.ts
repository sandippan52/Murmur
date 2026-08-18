import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Run on application pages.
     *
     * Exclude:
     * - API routes
     * - Next.js internals
     * - static files
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};