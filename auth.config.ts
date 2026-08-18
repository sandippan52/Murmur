import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const pathname = nextUrl.pathname;

      // Public pages
      const isPublic =
        pathname === "/home" ||
        pathname === "/login" ||
        pathname === "/signup";

      // Anyone can access public pages
      if (isPublic) {
        return true;
      }

      // Everything else requires login
      return isLoggedIn;
    },
  },

  providers: [],
} satisfies NextAuthConfig;