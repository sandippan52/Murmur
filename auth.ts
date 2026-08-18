import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { authConfig } from "./auth.config";

import { generateUsername } from "./lib/generateUsername";
import { generateAvatarSeed } from "./lib/generateAvatarSeed";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  ...authConfig,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          return null;
        }

        if (!user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
        };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser =
          await prisma.user.findUnique({
            where: {
              email: user.email!,
            },
          });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              username: generateUsername(),
              avatarSeed: generateAvatarSeed(),

              provider: "google",

              providerId:
                account.providerAccountId,
            },
          });
        }
      }

      return true;
    },
  },
});