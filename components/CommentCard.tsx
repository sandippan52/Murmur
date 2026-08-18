"use client";

import { useState } from "react";
import { Comment } from "@/types/comment";
import Link from "next/link";

type Props = {
  comment: Comment;
  postId: string;
};

export default function CommentCard({
  comment,
  postId,
}: Props) {

  const [reply, setReply] = useState("");

  const [loading, setLoading] = useState(false);

  const [activeReply, setActiveReply] =
    useState<number | null>(null);

  async function commentReply(parentCommentId: number) {

    if (!reply.trim()) return;

    setLoading(true);

    try {

      const res = await fetch(
        `/api/posts/${postId}/replies`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            reply,
            parentCommentId,
          }),
        }
      );

      const data = await res.json();

      alert(data.message);

      setReply("");

      setActiveReply(null);

    } finally {

      setLoading(false);

    }
  }

  return (

    <div className="ml-4 border-l border-zinc-800 pl-6">

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">

        <div className="flex items-center gap-3">
          <Link href={`/user/${comment.user.id}`}>
          <div className="w-11 h-11 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white">

            {comment.user.username
              .charAt(0)
              .toUpperCase()}

          </div>
          </Link>
          <div>

            <p className="font-semibold text-white">
            <Link href={`/user/${comment.user.id}`}>
              @{comment.user.username}
            </Link>
            </p>

            <p className="text-xs text-zinc-500">

              Community Member

            </p>

          </div>

        </div>

        <p className="mt-5 text-zinc-300 leading-7 whitespace-pre-line">

          {comment.content}

        </p>

        <div className="flex items-center gap-6 mt-6">

          <button className="text-zinc-400 hover:text-pink-500 transition">

            ❤️ {comment.likesCount}

          </button>

          <button
            onClick={() =>
              setActiveReply(
                activeReply === comment.id
                  ? null
                  : comment.id
              )
            }
            className="text-zinc-400 hover:text-white transition"
          >

            💬 Reply

          </button>

        </div>

        {activeReply === comment.id && (

          <div className="mt-6">

            <textarea
              value={reply}
              onChange={(e) =>
                setReply(e.target.value)
              }
              rows={3}
              placeholder="Write your reply..."
              className="w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-white resize-none outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />

            <div className="flex justify-end gap-3 mt-4">

              <button
                onClick={() => {

                  setReply("");

                  setActiveReply(null);

                }}
                className="px-5 py-2 rounded-xl border border-zinc-700 text-white hover:bg-zinc-800 transition"
              >

                Cancel

              </button>

              <button
                disabled={loading}
                onClick={() =>
                  commentReply(comment.id)
                }
                className="bg-white text-black px-6 py-2 rounded-xl font-semibold hover:bg-zinc-200 transition disabled:opacity-50"
              >

                {loading
                  ? "Replying..."
                  : "Reply"}

              </button>

            </div>

          </div>

        )}

      </div>
      {comment.replies.length > 0 && (

        <div className="mt-6 space-y-5">

          {comment.replies.map((reply) => (

            <CommentCard
              key={reply.id}
              comment={reply}
              postId={postId}
            />

          ))}

        </div>

      )}

    </div>

  );
}