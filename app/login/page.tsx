"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  
  ArrowRight,
  MessageCircle,
} from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
  const message = searchParams.get("message");

  if (message) {
    alert(message);
  }
}, [searchParams]);

  const handleLoginSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (response?.error) {
        alert("Invalid credentials");
        return;
      }

      window.location.href = "/home";
    } catch (err) {
      console.error("Login failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/home",
      });
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12">

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[-100px] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />

      </div>

      <div className="relative w-full max-w-md">

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">

          <div className="flex justify-center mb-8">

            <Link
              href="/"
              className="flex items-center gap-3"
            >

              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">

                <MessageCircle
                  size={25}
                  className="text-white"
                />

              </div>

              <span className="text-3xl font-bold tracking-tight">
                Murmur
              </span>

            </Link>

          </div>


          {/* Heading */}

          <div className="text-center mb-8">

            <h1 className="text-3xl font-bold">
              Welcome back
            </h1>

            <p className="text-zinc-400 mt-2">
              Sign in to continue to Murmur
            </p>

          </div>

          <button
         type="button"
         onClick={handleGoogleLogin}
         disabled={loading}
         className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50"
>
  <span className="text-lg font-bold">
    G
  </span>

  Continue with Google
</button>


        

          <div className="flex items-center gap-4 my-7">

            <div className="h-px flex-1 bg-zinc-800" />

            <span className="text-zinc-500 text-sm">
              OR
            </span>

            <div className="h-px flex-1 bg-zinc-800" />

          </div>

          <div className="space-y-2">

            <label className="text-sm font-medium text-zinc-300">
              Email
            </label>

            <div className="relative">

              <Mail
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

          </div>

          <div className="space-y-2 mt-5">

            <label className="text-sm font-medium text-zinc-300">
              Password
            </label>

            <div className="relative">

              <Lock
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLoginSubmit();
                  }
                }}
              />

            </div>

          </div>

          <button
            type="button"
            onClick={handleLoginSubmit}
            disabled={loading}
            className="w-full mt-7 bg-blue-600 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                Signing in...
              </>
            ) : (
              <>
                Sign in

                <ArrowRight size={19} />
              </>
            )}

          </button>

          <p className="text-center text-zinc-500 text-sm mt-7">

            Don't have an account?{" "}

            <Link
              href="/signup"
              className="text-white font-semibold hover:text-blue-400 transition"
            >
              Create one
            </Link>

          </p>

        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          By continuing, you agree to use Murmur responsibly.
        </p>

      </div>

    </div>
  );
}