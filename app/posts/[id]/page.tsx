"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import { buildCommentTree } from "@/lib/buildCommentTree";
import CommentCard from "@/components/CommentCard";
import { Comment } from "@/types/comment";

export default function Posts() {
  interface User {
    id: string;
    username: string;
  }

  interface Community {
    id?: string;
    name: string;
  }

  interface Media {
    id: number;
    fileUrl: string;
  }

  interface Post {
    id: string;
    author: User;
    title: string;
    body: string | null;
    community: Community | null;
    postmedia: Media[];
    commentDetail: Comment[];
    isLiked: boolean;
    likesCount: number;
    commentsCount: number;
    postType: "IMAGE" | "VIDEO" | "AUDIO";
    visibility: "PUBLIC" | "SUBSCRIBER_ONLY";
    locked: boolean;
  }

  const [post, setPost] = useState<Post>();

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);

  const [allcomments, setAllComments] = useState<Comment[]>([]);

  const [reply, setReply] = useState("");

  const [activereply, setActiveReply] =
    useState<number | null>(null);

  const [liked, setLiked] = useState<boolean>(false);

  const [likedCounts, setLikedCounts] =
    useState<number>(0);

  const [postLoading, setPostLoading] =
    useState(true);

  const params = useParams();

  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    const fetchPostAndComments = async () => {
      try {
        setPostLoading(true);

       
        const postRes = await fetch(
          `/api/posts/${id}`
        );

        const postData = await postRes.json();

        if (!postRes.ok) {
          console.error(
            "Failed to fetch post:",
            postData.message || postData.error
          );

          return;
        }

        console.log(postData);

        setPost(postData);

        setLiked(postData.isLiked ?? false);

        setLikedCounts(
          postData.likesCount ?? 0
        );


        if (postData.locked) {
          setAllComments([]);
          return;
        }

       
        const commentsRes = await fetch(
          `/api/posts/${id}/comments`
        );

        const commentsData =
          await commentsRes.json();

        if (!commentsRes.ok) {
          console.error(
            "Failed to fetch comments:",
            commentsData.error ||
              commentsData.message ||
              "Unknown error"
          );

          setAllComments([]);

          return;
        }

        if (!Array.isArray(commentsData)) {
          console.error(
            "Invalid comments response:",
            commentsData
          );

          setAllComments([]);

          return;
        }

        const tree =
          buildCommentTree(commentsData);

        setAllComments(tree);

      } catch (error) {
        console.error(
          "Failed to load post:",
          error
        );

        setAllComments([]);
      } finally {
        setPostLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id]);

  const handleComment = async () => {
    if (!comment.trim()) return;

    if (post?.locked) return;

    try {
      setLoading(true);

      const res = await fetch(
        `/api/posts/${id}/comments`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            comment,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            data.message ||
            "Failed to post comment."
        );

        return;
      }

      alert(data.message);

      setComment("");
      const commentsRes = await fetch(
        `/api/posts/${id}/comments`
      );

      const commentsData =
        await commentsRes.json();

      if (
        commentsRes.ok &&
        Array.isArray(commentsData)
      ) {
        setAllComments(
          buildCommentTree(commentsData)
        );
      }

    } catch (err) {
      console.error(
        "Failed to post comment:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  
  const commentLike = async () => {
    // Not implemented yet
  };

  

  const commentReply = async (
    parentCommentId: number
  ) => {
    if (post?.locked) return;

    if (!reply.trim()) return;

    try {
      setLoading(true);

      const res = await fetch(
        `/api/posts/${id}/replies`,
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

      if (!res.ok) {
        alert(
          data.error ||
            data.message ||
            "Failed to post reply."
        );

        return;
      }

      alert(data.message);

      setReply("");

    } catch (error) {
      console.error(
        "Failed to post reply:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  if (postLoading) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-20 text-center">

        <p className="text-zinc-500">
          Loading post...
        </p>

      </div>
    );
  }


  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-20 text-center">

        <h1 className="text-2xl font-bold text-white">
          Post not found
        </h1>

        <p className="text-zinc-500 mt-3">
          This post may have been deleted or is no
          longer available.
        </p>

      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 py-8">

      <div className="grid lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2">

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

            <div className="p-6 border-b border-zinc-800">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-white font-semibold text-lg">
                    @{post.author.username}
                  </p>

                  {post.community && (
                    <p className="text-zinc-500 mt-1">

                      Posted in

                      <span className="text-white">
                        {" "}
                        {post.community.name}
                      </span>

                    </p>
                  )}

                </div>

              </div>

            </div>

            <div className="px-6 pt-6">

              <h1 className="text-4xl font-bold text-white leading-tight">
                {post.title}
              </h1>

            </div>

            {post.locked ? (

              <div className="px-6 py-12">

                <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-10 text-center">

                  <div className="text-6xl">
                    🔒
                  </div>

                  <h2 className="text-2xl font-bold text-white mt-5">
                    Subscriber-only post
                  </h2>

                  <p className="text-zinc-500 mt-3 max-w-lg mx-auto leading-7">
                    This post is available only to
                    subscribers of this community.
                  </p>

                  {post.community && (
                    <p className="text-zinc-400 mt-5">
                      Subscribe to{" "}
                      <span className="text-white font-semibold">
                        {post.community.name}
                      </span>{" "}
                      to view the full post.
                    </p>
                  )}

                </div>

              </div>

            ) : (

              <>
                {post.postmedia?.[0] && (

  <div className="mt-8">

    {post.postType === "VIDEO" ? (

      <video
        src={post.postmedia[0].fileUrl}
        controls
        className="w-full max-h-[650px] object-contain bg-black"
      />

    ) : (

      <Image
        src={post.postmedia[0].fileUrl}
        alt={post.title}
        width={1200}
        height={700}
        className="w-full object-cover max-h-[650px]"
      />

    )}

  </div>

)}

                {post.body && (

                  <div className="px-6 py-8">

                    <p className="text-zinc-300 leading-8 whitespace-pre-line">
                      {post.body}
                    </p>

                  </div>

                )}
              </>

            )}

            <div className="border-t border-zinc-800 px-6 py-5 flex items-center gap-8 text-zinc-400">

              <button
                className={`transition ${
                  liked
                    ? "text-pink-500"
                    : "hover:text-pink-500"
                }`}
              >
                {liked ? "❤️" : "♡"}{" "}
                {likedCounts}
              </button>

              <button className="hover:text-white transition">
                💬 {post.commentsCount ?? 0}
              </button>

              <button className="hover:text-white transition">
                🔖 Save
              </button>

              <button className="hover:text-white transition">
                ↗ Share
              </button>

            </div>

          </div>
          {!post.locked && (

            <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

              <h2 className="text-white text-xl font-semibold mb-5">
                Join the Discussion
              </h2>

              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value)
                }
                placeholder="Write a thoughtful comment..."
                rows={5}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-white resize-none outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />

              <div className="flex justify-end mt-5">

                <button
                  onClick={handleComment}
                  disabled={
                    loading ||
                    !comment.trim()
                  }
                  className="bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50"
                >
                  {loading
                    ? "Posting..."
                    : "Comment"}
                </button>

              </div>

            </div>

          )}

          <div className="mt-10">

            <div className="flex items-center justify-between mb-8">

              <div className="flex items-center gap-3">

                <h2 className="text-3xl font-bold text-white">
                  Comments
                </h2>

                <div className="bg-zinc-800 text-zinc-300 rounded-full px-3 py-1 text-sm">
                  {post.commentsCount ?? 0}
                </div>

              </div>

              {!post.locked && (
                <span className="text-zinc-500">
                  Join the conversation
                </span>
              )}

            </div>

            {post.locked ? (

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">

                <div className="text-5xl">
                  🔒
                </div>

                <h3 className="text-xl font-semibold text-white mt-4">
                  Comments are locked
                </h3>

                <p className="text-zinc-500 mt-2">
                  Subscribe to this community to
                  view and participate in the
                  discussion.
                </p>

              </div>

            ) : allcomments.length === 0 ? (

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-14 text-center">

                <div className="text-6xl">
                  💬
                </div>

                <h3 className="text-2xl font-semibold text-white mt-5">
                  No comments yet
                </h3>

                <p className="text-zinc-500 mt-3">
                  Be the first person to start this
                  discussion.
                </p>

              </div>

            ) : (

              <div className="space-y-6">

                {allcomments.map((comment) => (

                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    postId={id}
                  />

                ))}

              </div>

            )}

          </div>

        </div>

        <div>

          <div className="sticky top-24 space-y-6">

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

              <h3 className="text-xl font-bold text-white">
                About this Post
              </h3>

              <div className="mt-6 space-y-5">

                <div>

                  <p className="text-zinc-500 text-sm">
                    Creator
                  </p>

                  <p className="text-white mt-1">
                    @{post.author.username}
                  </p>

                </div>

                {post.community && (

                  <div>

                    <p className="text-zinc-500 text-sm">
                      Community
                    </p>

                    <p className="text-white mt-1">
                      {post.community.name}
                    </p>

                  </div>

                )}

                <div>

                  <p className="text-zinc-500 text-sm">
                    Media
                  </p>

                  <p className="text-white mt-1">
                    {post.postmedia.length
                      ? "Attached"
                      : "Text Only"}
                  </p>

                </div>

                <div>

                  <p className="text-zinc-500 text-sm">
                    Visibility
                  </p>

                  <p className="text-white mt-1">
                    {post.locked
                      ? "🔒 Subscriber Only"
                      : "🌎 Public"}
                  </p>

                </div>

              </div>

            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

              <h3 className="text-xl font-bold text-white">
                Engagement
              </h3>

              <div className="mt-6 space-y-4">

                <div className="flex justify-between">

                  <span className="text-zinc-500">
                    Likes
                  </span>

                  <span className="text-white">
                    {likedCounts}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-zinc-500">
                    Comments
                  </span>

                  <span className="text-white">
                    {post.commentsCount ?? 0}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}