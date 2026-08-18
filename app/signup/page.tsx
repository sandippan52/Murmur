"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignupSubmit = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/signup", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create account.");
        return;
      }

      const loginResponse = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginResponse?.error) {
        alert(
          "Account created successfully, but automatic login failed. Please login manually."
        );

        window.location.href = "/login";
        return;
      }

      window.location.href = "/home";

    } catch (error) {
      console.error("Signup error:", error);

      alert("Something went wrong. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    await signIn("google", {
      callbackUrl: "/home",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-5 py-10">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2"
          >

            <div className="bg-blue-600 p-3 rounded-2xl">
              <MessageCircle
                size={26}
                className="text-white"
              />
            </div>

            <span className="text-3xl font-bold tracking-tight">
              Murmur
            </span>

          </Link>

          <h1 className="text-3xl font-bold mt-8">
            Create your account
          </h1>

          <p className="text-zinc-500 mt-2">
            Join the conversation.
          </p>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-7 sm:p-8 shadow-2xl">

          <div className="mb-5">

            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Username
            </label>

            <div className="relative">

              <User
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Choose a username"
                disabled={loading}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />

            </div>

          </div>

          <div className="mb-5">

            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Email
            </label>

            <div className="relative">

              <Mail
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                disabled={loading}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />

            </div>

          </div>

          <div className="mb-6">

            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Password
            </label>

            <div className="relative">

              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Create a password"
                disabled={loading}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />

            </div>

          </div>
          <button
            type="button"
            onClick={handleSignupSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {loading ? (
              "Creating account..."
            ) : (
              <>
                Create Account
                <ArrowRight size={19} />
              </>
            )}

          </button>

          <div className="flex items-center gap-4 my-6">

            <div className="h-px bg-zinc-800 flex-1" />

            <span className="text-zinc-600 text-sm">
              OR
            </span>

            <div className="h-px bg-zinc-800 flex-1" />

          </div>
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >

            <span className="text-xl font-bold">
              G
            </span>

            Continue with Google

          </button>

          <p className="text-center text-zinc-500 text-sm mt-7">

            Already have an account?{" "}

            <Link
              href="/login"
              className="text-white font-medium hover:text-blue-400 transition"
            >
              Log in
            </Link>

          </p>

        </div>

        <p className="text-center text-zinc-700 text-xs mt-6">
          By creating an account, you agree to use Murmur responsibly.
        </p>

      </div>

    </div>
  );
}