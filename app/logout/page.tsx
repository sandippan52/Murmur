"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({
      callbackUrl: "/login",
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">

      <div className="text-center">

        <div className="text-5xl mb-5">
          👋
        </div>

        <h1 className="text-2xl font-bold text-white">
          Logging you out...
        </h1>

        <p className="text-zinc-500 mt-2">
          See you soon on Murmur.
        </p>

      </div>

    </div>
  );
}