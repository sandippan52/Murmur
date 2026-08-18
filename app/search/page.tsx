"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User as UserIcon } from "lucide-react";

import PostCard from "@/components/PostCard";
import { Post } from "@/types/post";

interface UserResult {
  id: string;
  username: string;
  avatarUrl: string | null;
  avatarSeed: string;
  bio: string | null;
}

interface SearchResponse {
  users: UserResult[];
  posts: Post[];
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setUsers([]);
      setPosts([]);
      setSearched(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedQuery)}`,
          {
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          throw new Error("Search failed");
        }

        const data: SearchResponse = await res.json();

        setUsers(data.users || []);
        setPosts(data.posts || []);
        setSearched(true);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Search error:", error);
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  async function likeSubmit(postId: string) {
    try {
      const res = await fetch(`/api/posts/${postId}/likes`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        return;
      }

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            isLiked: data.isLiked,
            likesCount: data.likesCount,
          };
        })
      );
    } catch (error) {
      console.error("Like error:", error);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Search Murmur
        </h1>

        <div className="relative">

          <Search
            size={22}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people or posts..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-5 py-4 text-white placeholder:text-zinc-500 outline-none focus:border-blue-500 transition"
          />

        </div>

        {loading && (
          <div className="text-center text-zinc-500 py-8">
            Searching...
          </div>
        )}

        {!loading && searched && (
          <div className="mt-8 space-y-10">

            {users.length > 0 && (
              <section>

                <h2 className="text-xl font-semibold mb-4">
                  People
                </h2>

                <div className="space-y-3">

                  {users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/user/${user.id}`}
                      className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition"
                    >

                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.username}
                          width={52}
                          height={52}
                          className="w-13 h-13 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-full bg-zinc-700 flex items-center justify-center text-lg font-bold">
                          {user.username
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">

                        <p className="font-semibold text-white">
                          @{user.username}
                        </p>

                        {user.bio && (
                          <p className="text-sm text-zinc-400 truncate">
                            {user.bio}
                          </p>
                        )}

                      </div>

                    </Link>
                  ))}

                </div>

              </section>
            )}

            {posts.length > 0 && (
              <section>

                <h2 className="text-xl font-semibold mb-4">
                  Posts
                </h2>

                <div className="space-y-6">

                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={likeSubmit}
                      onComment={() => {}}
                    />
                  ))}

                </div>

              </section>
            )}

            {users.length === 0 && posts.length === 0 && (
              <div className="text-center py-16">

                <div className="flex justify-center mb-4">
                  <UserIcon
                    size={42}
                    className="text-zinc-700"
                  />
                </div>

                <h2 className="text-xl font-semibold">
                  No results found
                </h2>

                <p className="text-zinc-500 mt-2">
                  Nothing matched "{query.trim()}"
                </p>

              </div>
            )}

          </div>
        )}

        {!searched && !loading && (
          <div className="text-center py-16 text-zinc-600">
            <Search
              size={48}
              className="mx-auto mb-4"
            />

            <p>
              Search for people or posts on Murmur.
            </p>
          </div>
        )}

      </div>

    </main>
  );
}