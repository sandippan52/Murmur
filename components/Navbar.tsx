"use client";

import {
  Home,
  Search,
  PlusSquare,
  User,
  Bell,
  MessageCircle,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface UserData {
  id: string;
  username: string;
  avatarUrl: string | null;
  avatarSeed: string;
}

const navItems = [
  {
    label: "Home",
    href: "/home",
    icon: Home,
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
  },
  {
    label: "Create",
    href: "/create",
    icon: PlusSquare,
  },
  {
    label: "Chats",
    href: "/chats",
    icon: MessageCircle,
  },
  {
    label: "Me",
    href: "/user",
    icon: User,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
];

export default function Navbar() {
  const pathname = usePathname();

  const [user, setUser] =
    useState<UserData | null>(null);

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const res = await fetch("/api/me");

        if (!res.ok) return;

        const data = await res.json();

        setUser(data);
      } catch (error) {
        console.error(
          "Failed to get current user:",
          error
        );
      }
    }

    getCurrentUser();
  }, []);

  function getHref(
    item: (typeof navItems)[number]
  ) {
    if (item.label === "Me") {
      return user
        ? `/user/${user.id}`
        : "/home";
    }

    return item.href;
  }

  function isActive(
    item: (typeof navItems)[number]
  ) {
    if (item.label === "Me") {
      return user
        ? pathname === `/user/${user.id}`
        : false;
    }

    if (item.href === "/home") {
      return pathname === "/home";
    }

    return pathname.startsWith(item.href);
  }

  return (
    <>
      <header className="hidden md:block sticky top-0 z-50 border-b border-zinc-800 bg-black/90 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-6">

          <div className="h-16 flex items-center justify-between">

            <Link
              href="/home"
              className="text-2xl font-bold text-white tracking-tight"
            >
              Murmur
            </Link>

            <nav className="flex items-center gap-2">

              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);

                return (
                  <Link
                    key={item.label}
                    href={getHref(item)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      active
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                  >

                    <Icon size={20} />

                    <span>
                      {item.label}
                    </span>

                  </Link>
                );
              })}

            </nav>

          </div>

        </div>

      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-black/95 backdrop-blur-xl">

        <div className="h-16 flex items-center justify-around px-1">

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.label}
                href={getHref(item)}
                className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl transition-all ${
                  active
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
              >

                <Icon
                  size={23}
                  strokeWidth={
                    active ? 2.5 : 2
                  }
                />

                <span className="text-[9px] font-medium">
                  {item.label}
                </span>

              </Link>
            );
          })}

        </div>

      </nav>
    </>
  );
}