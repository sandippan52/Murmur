"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import { Post } from "@/types/post";

interface Community {
  id: string;
  name: string;
  description: string;

  owner: {
    username: string;
  };

  posts: Post[];

  isOwner: boolean;
  isSubscriber: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}




export default function CommunityPage() {
  const params = useParams();
  const id = params.id;

  const [communityDetail, setCommunityDetail] = useState<Community>();
  const [communityHolder, setCommunityHolder] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommunity() {
      try {
        const res = await fetch(`/api/community/${id}`);

        const data = await res.json();

        setCommunityDetail(data);
        setCommunityHolder(data.isOwner);
        setIsSubscriber(data.isSubscriber);
        setCommunityPosts(data.posts);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCommunity();
  }, [id]);

  async function likeSubmit(postId: string) {
    const res = await fetch(`/api/posts/${postId}/likes`, {
      method: "POST",
    });

    const data = await res.json();

    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        return {
          ...post,
          isLiked: data.isLiked,
          likesCount: data.likesCount,
        };
      })
    );
  }

  async function handleSubscribe() {
  try {
    
    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = async () => {
      try {
        
        const res = await fetch(
          `/api/community/${id}/subscribe`,
          {
            method: "POST",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Unable to create subscription");
          return;
        }

        
        const options = {
          key: data.razorpayKey,

          subscription_id: data.subscriptionId,

          name: "Murmur",

          description: `Subscription to ${data.communityName}`,

          handler: function (response: any) {
            console.log(
              "RAZORPAY PAYMENT SUCCESS:",
              response
            );

            alert(
              "Payment successful! 🎉\n\n" +
              `Payment ID: ${response.razorpay_payment_id}`
            );
          },

          modal: {
            ondismiss: function () {
              console.log(
                "Razorpay Checkout closed"
              );
            },
          },

          theme: {
            color: "#ffffff",
          },
        };

      
        const razorpayCheckout =
          new window.Razorpay(options);

        razorpayCheckout.open();

      } catch (error) {
        console.error(
          "SUBSCRIPTION ERROR:",
          error
        );

        alert(
          "Something went wrong while subscribing."
        );
      }
    };

    script.onerror = () => {
      alert(
        "Failed to load Razorpay Checkout."
      );
    };

    document.body.appendChild(script);

  } catch (error) {
    console.error(error);

    alert(
      "Something went wrong."
    );
  }
}
async function handleUnsubscribe() {
  const confirmed = window.confirm(
    "Are you sure you want to cancel your subscription?\n\n" +
    "You will continue to have access until the end of your current billing cycle."
  );

  if (!confirmed) {
    return;
  }

  try {
    const res = await fetch(
      `/api/community/${id}/unsubscribe`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(
        data.error ||
        "Unable to cancel subscription."
      );

      return;
    }

    alert(
      "Cancellation requested successfully.\n\n" +
      "You will continue to have access until the end of your current billing cycle."
    );

    

  } catch (error) {
    console.error(
      "UNSUBSCRIBE ERROR:",
      error
    );

    alert(
      "Something went wrong while cancelling your subscription."
    );
  }
}







  if (loading) {
    return (
      <div className="flex justify-center mt-20 text-lg">
        Loading Community...
      </div>
    );
  }

  return (
     <div className="max-w-7xl mx-auto px-5 py-8">

    <div className="grid lg:grid-cols-3 gap-8">

    

      <div className="lg:col-span-2">

      

        <div className="h-52 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-black border border-zinc-800 relative overflow-hidden">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#27272a,transparent_45%)]" />

          <div className="absolute bottom-8 left-8 flex items-end gap-6">

            <div className="w-28 h-28 rounded-full border-4 border-black bg-zinc-700 flex items-center justify-center text-5xl font-bold text-white shadow-xl">

              {communityDetail?.name.charAt(0).toUpperCase()}

            </div>

            <div>

              <h1 className="text-4xl font-bold text-white break-all">

                {communityDetail?.name}

              </h1>

              <p className="text-zinc-400 mt-2">

                Created by

                <span className="text-white font-semibold">

                  {" "}@{communityDetail?.owner.username}

                </span>

              </p>

            </div>

          </div>

        </div>

        

        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h2 className="text-xl font-semibold text-white">

            About

          </h2>

          <p className="text-zinc-400 leading-8 mt-4">

            {communityDetail?.description || "No description provided."}

          </p>

        </div>

        

        <div className="mt-10">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-3xl font-bold text-white">

              Posts

            </h2>

            <span className="text-zinc-500">

              {communityPosts.length} Posts

            </span>

          </div>

          {communityPosts.length === 0 ? (

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-14 text-center">

              <div className="text-6xl">

                📭

              </div>

              <h3 className="text-white text-2xl font-semibold mt-5">

                No Posts Yet

              </h3>

              <p className="text-zinc-500 mt-3">

                Be the first person to post in this community.

              </p>

            </div>

          ) : (

            <div className="space-y-6">

              {communityPosts.map((post) => (

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

      </div>

      <div>

        <div className="sticky top-24 space-y-6">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

            <h3 className="text-white font-semibold text-xl">

              Community

            </h3>

            <p className="text-zinc-500 mt-3 leading-7">

              Join discussions, discover exclusive content and interact with the creator.

            </p>

            <div className="mt-6">

              {communityHolder ? (

  <Link
    href={`/community/${communityDetail?.id}/createcommunitypost`}
  >
    <button
      className="w-full rounded-xl bg-white text-black font-semibold py-3 hover:bg-zinc-200 transition"
    >
      + Create Community Post
    </button>
  </Link>

) : isSubscriber ? (

  <div className="space-y-3">

    <div className="w-full rounded-xl border border-green-700 bg-green-950/30 text-green-400 py-3 text-center font-semibold">
      ✓ Subscribed
    </div>

    <button
      onClick={handleUnsubscribe}
      className="w-full rounded-xl border border-red-800 bg-red-950/30 text-red-400 py-3 hover:bg-red-950 transition"
    >
      Cancel Subscription
    </button>

  </div>

) : (

  <button
    onClick={handleSubscribe}
    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 text-white py-3 hover:bg-zinc-800 transition"
  >
    ⭐ Subscribe
  </button>

)}

            </div>

          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

            <h3 className="text-white font-semibold text-xl mb-5">

              Statistics

            </h3>

            <div className="space-y-5">

              <div className="flex justify-between">

                <span className="text-zinc-500">

                  Posts

                </span>

                <span className="text-white font-semibold">

                  {communityPosts.length}

                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-zinc-500">

                  Owner

                </span>

                <span className="text-white">

                  @{communityDetail?.owner.username}

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