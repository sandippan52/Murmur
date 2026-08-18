"use client";

import { Bell, Sparkles } from "lucide-react";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">

      <div className="max-w-4xl mx-auto">

        <div className="flex items-center gap-3 mb-8">

          <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">

            <Bell
              size={22}
              className="text-zinc-300"
            />

          </div>

          <div>

            <h1 className="text-3xl font-bold">
              Notifications
            </h1>

            <p className="text-zinc-500 mt-1">
              Stay updated with what is happening on Murmur.
            </p>

          </div>

        </div>

        <div className="min-h-[55vh] flex flex-col items-center justify-center text-center">

          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">

            <Bell
              size={36}
              className="text-zinc-600"
            />

          </div>

          <h2 className="text-2xl font-semibold text-white">
            No notifications yet
          </h2>

          <p className="text-zinc-500 max-w-md mt-3 leading-7">
            Notifications will appear here when someone interacts
            with your posts, follows you, or when something important
            happens on Murmur.
          </p>

          <div className="flex items-center gap-2 mt-6 text-zinc-600">
            <span className="text-sm">
              Notifications are coming soon.
            </span>

          </div>

        </div>

      </div>

    </main>
  );
}