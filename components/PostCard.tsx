"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
} from "lucide-react";

interface Author {
  id: string;
  username: string;
  avatarSeed: string;
  avatarUrl: string | null;
}

interface Community {
  id: string;
  name: string;
}

interface PostMedia {
  fileUrl: string;
}

interface Post {
  id: string;
  title: string;
  body: string | null;

  likesCount: number;
  commentsCount: number;

  isLiked: boolean;

  postType: "IMAGE" | "VIDEO" | "AUDIO";

  author: Author;

  community: Community | null;

  postmedia: PostMedia[];

  locked?: boolean;

  hasMedia?: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onComment?: () => void;
}

export default function PostCard({
  post,
  onLike,
  onComment,
}: PostCardProps) {

  const showSeeMore =
    !!post.body && post.body.length > 220;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-200 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20">


      <div className="flex items-center justify-between p-5">

        <div className="flex items-center gap-3">

          <Link href={`/user/${post.author.id}`}>

            {post.author.avatarUrl ? (

              <Image
                src={post.author.avatarUrl}
                alt={post.author.username}
                width={48}
                height={48}
                className="rounded-full object-cover w-12 h-12"
              />

            ) : (

              <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-lg">

                {post.author.username
                  .charAt(0)
                  .toUpperCase()}

              </div>

            )}

          </Link>

          <div>

            <Link
              href={`/user/${post.author.id}`}
              className="text-white font-semibold hover:underline"
            >
              {post.author.username}
            </Link>

            {post.community && (

              <Link
                href={`/community/${post.community.id}`}
                className="block text-sm text-zinc-400 hover:text-white transition"
              >
                {post.community.name}
              </Link>

            )}

          </div>

        </div>

      </div>

      <div className="px-5">

        <Link href={`/posts/${post.id}`}>

          <h2 className="text-2xl font-bold text-white">

            {post.title}

          </h2>

        </Link>

      </div>

      {post.body && (

        <div className="px-5 pt-3">

          <Link href={`/posts/${post.id}`}>

            <p
              className={`text-zinc-300 leading-7 whitespace-pre-line ${
                showSeeMore
                  ? "line-clamp-4"
                  : ""
              }`}
            >
              {post.body}
            </p>

          </Link>

          {showSeeMore && (

            <Link
              href={`/posts/${post.id}`}
              className="inline-block mt-3 text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              See More →
            </Link>

          )}

        </div>

      )}


      
{post.locked && post.hasMedia ? (

  <Link
    href={`/posts/${post.id}`}
    className="block mt-5"
  >

    <div className="relative h-[280px] overflow-hidden bg-zinc-950">

    

      <div className="absolute inset-0">

        <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-900 to-black blur-2xl scale-110" />

      </div>

      

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">

        <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-zinc-600">

          <span className="text-3xl">
            🔒
          </span>

        </div>

        <p className="text-white font-semibold text-lg mt-4">
          Subscriber-only media
        </p>

        <p className="text-zinc-300 text-sm mt-1">
          Subscribe to view this media
        </p>

      </div>

    </div>

  </Link>

) : post.postmedia.length > 0 && (

  <div className="mt-5">

    {post.postType === "VIDEO" ? (

      <video
        src={post.postmedia[0].fileUrl}
        controls
        className="w-full max-h-[650px] object-contain bg-black"
      />

    ) : (

      <Link href={`/posts/${post.id}`}>

        <Image
          src={post.postmedia[0].fileUrl}
          alt={post.title}
          width={1200}
          height={800}
          className="w-full max-h-[650px] object-cover"
        />

      </Link>

    )}

  </div>

)}


      

      <div className="border-t border-zinc-800 mt-5">

        <div className="flex items-center justify-between px-5 py-4">

          

          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 transition ${
              post.isLiked
                ? "text-pink-500"
                : "text-zinc-300 hover:text-pink-500"
            }`}
          >

            <Heart
              size={20}
              fill={
                post.isLiked
                  ? "currentColor"
                  : "none"
              }
            />

            {post.likesCount}

          </button>


          

          <Link href={`/posts/${post.id}`}>

            <button
              onClick={onComment}
              className="flex items-center gap-2 text-zinc-300 hover:text-white transition"
            >

              <MessageCircle size={20} />

              {post.commentsCount}

            </button>

          </Link>


          

          <button
            className="text-zinc-300 hover:text-white transition"
          >

            <Bookmark size={20} />

          </button>


        

          <button
            className="text-zinc-300 hover:text-white transition"
          >

            <Share2 size={20} />

          </button>

        </div>

      </div>

    </div>
  );
}