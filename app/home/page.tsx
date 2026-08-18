"use client";

import { useEffect, useState } from "react";
import { Flame, RefreshCcw } from "lucide-react";
import PostCard from "@/components/PostCard";
import { Post } from "@/types/post";

export default function HomePage() {
  const [homePosts, setHomePosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchHomeData() {
  try {
    setLoading(true);

    const res = await fetch("/api/home", {
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(
        data.message || "Failed to fetch home feed"
      );

      setHomePosts([]);
      return;
    }

    if (!Array.isArray(data)) {
      console.error("Invalid home response:", data);

      setHomePosts([]);
      return;
    }

    setHomePosts(data);

  } catch (err) {
    console.error("Failed to fetch home:", err);

    setHomePosts([]);

  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    fetchHomeData();
  }, []);

 async function likeSubmit(postId: string) {
  try {
    const res = await fetch(
      `/api/posts/${postId}/likes`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }

    if (!res.ok) {
      console.error(
        data.error ||
        data.message ||
        "Failed to like post."
      );

      return;
    }

    setHomePosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          isLiked: data.isLiked,
          likesCount: data.likesCount,
        };
      })
    );

  } catch (error) {
    console.error(
      "Failed to like post:",
      error
    );
  }
}

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="bg-blue-600 p-3 rounded-xl">

                <Flame className="text-white" size={24} />

              </div>

              <div>

                <h1 className="text-3xl font-bold text-white">

                  Home Feed

                </h1>

                <p className="text-zinc-400 mt-1">

                  Discover posts from creators and communities.

                </p>

              </div>

            </div>

          </div>

          <button
            onClick={fetchHomeData}
            className="border border-zinc-700 rounded-xl p-3 hover:bg-zinc-800 transition"
          >
            <RefreshCcw
              size={20}
              className={`${loading ? "animate-spin" : ""}`}
            />
          </button>

        </div>

      </div>

      {loading ? (

        <div className="space-y-6">

          {[1, 2, 3].map((item) => (

            <div
              key={item}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl h-72 animate-pulse"
            />

          ))}

        </div>

      ) : homePosts.length === 0 ? (

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-14 text-center">

          <div className="text-7xl mb-4">

            📭

          </div>

          <h2 className="text-2xl font-semibold text-white">

            Your feed is empty

          </h2>

          <p className="text-zinc-400 mt-3">

            Follow creators or subscribe to communities to
            start seeing posts here.

          </p>

        </div>

      ) : (

        <div className="space-y-8">

          {homePosts.map((post) => (

            <PostCard
              key={post.id}
              post={post}
              onLike={likeSubmit}
              onComment={() => {}}
            />

          ))}

        </div>

      )}

    </div>
  );
}