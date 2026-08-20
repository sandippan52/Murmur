"use client";

import { useParams,useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";

import PostCard from "@/components/PostCard";
import { Post } from "@/types/post";

type Tab = "Posts" | "Communities" | "Subscriptions";


interface Community {
  id: string;
  name: string;
  description: string | null;

  owner: {
    username: string;
  };
}

interface Subscription {
  id: number;

  community: {
    id: string;
    name: string;
  };
}

interface Profile {
  id: string;

  username: string;

  avatarSeed: string;

  avatarUrl: string;

  bio: string | null;

  followersCount: number;
  
  followingCount: number;

  ownedCommunities: Community[];

  subscriptions: Subscription[];

  posts: Post[];

  isMe: boolean;

  isFollowing: boolean;
}

export default function UserProfilePage() {
  const { id } = useParams();

  const router = useRouter();

  const [profile, setProfile] = useState<Profile>();

  const [posts, setPosts] = useState<Post[]>([]);

  const [communities, setCommunities] = useState<Community[]>([]);

  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>([]);

  const [tab, setTab] = useState<Tab>("Posts");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile() {
      try {
        const res = await fetch(`/api/user/${id}`);

        const data = await res.json();

        setProfile(data);

        setPosts(data.posts);

        setCommunities(data.ownedCommunities);

        setSubscriptions(data.subscriptions);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [id]);

  async function likeSubmit(postId: string) {
    const res = await fetch(`/api/posts/${postId}/likes`, {
      method: "POST",
    });

    const data = await res.json();

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
  }

  async function followUser() {
    if (!profile) return;

    const res = await fetch(`/api/user/${profile.id}/follow`, {
      method: "POST",
    });

    const data = await res.json();

    setProfile((prev) => {
  if (!prev) return prev;

  return {
    ...prev,

    isFollowing: data.isFollowing,

    followersCount: data.followersCount,
  };
});

  }

  async function startConversation() {
  if (!profile) return;

  try {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: profile.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data.error);
      return;
    }

    router.push(
      `/messages?conversationId=${data.conversationId}`
    );

  } catch (error) {
    console.error(
      "Failed to start conversation:",
      error
    );
  }
}

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-zinc-400">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center py-20 text-zinc-400">
        User not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <Card className="p-8">

        <div className="flex flex-col md:flex-row items-center gap-8">

          <Avatar
            image={profile.avatarUrl}
            username={profile.username}
            size={120}
          />

          <div className="flex-1 w-full">

            <h1 className="text-4xl font-bold text-white">

              {profile.username}

            </h1>

            {profile.bio && (
              <p className="text-zinc-400 mt-3 whitespace-pre-wrap leading-7">
                {profile.bio}
              </p>
            )}

            <div className="grid grid-cols-3 gap-4 mt-8">

              <StatCard
                value={posts.length}
                label="Posts"
              />

              <StatCard
                value={profile.followersCount}
                label="Followers"
              />

              <StatCard
                value={profile.followingCount}
                label="Following"
              />

            </div>

            <div className="flex flex-wrap gap-3 mt-8">

              {profile.isMe ? (
                <>
                  <Link href="/edit-profile">

                    <Button variant="secondary">

                      Edit Profile

                    </Button>

                  </Link>

                  <Button variant="primary">

                    Share Profile

                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={followUser}
                    variant={
                      profile.isFollowing
                        ? "secondary"
                        : "primary"
                    }
                  >
                    {profile.isFollowing
                      ? "✓ Following"
                      : "+ Follow"}
                  </Button>

                  <Button variant="secondary"
                  onClick={startConversation}
                  >

                    Message

                  </Button>
                </>
              )}

            </div>

          </div>

        </div>

      </Card>

      <Card className="mt-8 p-2">

<div className="grid grid-cols-3">

<button
onClick={() => setTab("Posts")}
className={`rounded-xl py-3 transition-all ${
tab === "Posts"
? "bg-blue-600 text-white shadow-lg"
: "text-zinc-400 hover:bg-zinc-800"
}`}
>

Posts

</button>

<button
onClick={() => setTab("Communities")}
className={`rounded-xl py-3 transition-all ${
tab === "Communities"
? "bg-blue-600 text-white shadow-lg"
: "text-zinc-400 hover:bg-zinc-800"
}`}
>

Communities

</button>

{profile.isMe ? (

<button
onClick={() => setTab("Subscriptions")}
className={`rounded-xl py-3 transition-all ${
tab === "Subscriptions"
? "bg-blue-600 text-white shadow-lg"
: "text-zinc-400 hover:bg-zinc-800"
}`}
>

Subscriptions

</button>

) : (

<div />

)}

</div>

</Card>
          
      

{tab === "Posts" && (

<div className="space-y-6">

{posts.length === 0 ? (

<EmptyState
emoji="📝"
title="No Posts Yet"
description={
profile.isMe
? "Share your first post with Murmur."
: `${profile.username} hasn't posted anything yet.`
}
/>

) : (

posts.map((post) => (

<PostCard
key={post.id}
post={post}
onLike={likeSubmit}
onComment={() => {}}
/>

))

)}

</div>

)}



{tab === "Communities" && (

<div className="space-y-5">

{profile.isMe && (

<div className="flex justify-end">

<Link href="/createcommunity">

<Button variant="primary">

+ Create Community

</Button>

</Link>

</div>

)}

{communities.length === 0 ? (

<EmptyState
emoji="🌍"
title="No Communities"
description={
profile.isMe
? "Create your first community and start building your audience."
: `${profile.username} hasn't created any communities yet.`
}
/>

) : (

<div className="space-y-4">

{communities.map((community) => (

<Link
href={`/community/${community.id}`}
key={community.id}
>

<Card className="p-6 hover:border-blue-500 transition-all duration-300 hover:scale-[1.01]">

<div className="flex items-center justify-between">

<div>

<h2 className="text-xl font-semibold text-white">

🌍 {community.name}

</h2>

{community.description && (

<p className="text-zinc-400 mt-2 leading-7">

{community.description}

</p>

)}

<p className="text-zinc-500 mt-4 text-sm">

Created by @{community.owner.username}

</p>

</div>

<div>

<Button variant="secondary">

View →

</Button>

</div>

</div>

</Card>

</Link>

))}

</div>

)}

</div>

)}

{profile.isMe && tab === "Subscriptions" && (

<div className="space-y-5">

{subscriptions.length === 0 ? (

<EmptyState
emoji="⭐"
title="No Active Subscriptions"
description="Communities you subscribe to will appear here."
/>

) : (

<div className="space-y-4">

{subscriptions.map((subscription) => (

<Link
href={`/community/${subscription.community.id}`}
key={subscription.id}
>

<Card className="p-6 hover:border-yellow-500 transition-all duration-300 hover:scale-[1.01]">

<div className="flex items-center justify-between">

<div>

<h2 className="text-xl font-semibold text-white">

⭐ {subscription.community.name}

</h2>

<p className="text-zinc-400 mt-2">

Premium Community

</p>

</div>

<Button variant="secondary">

Visit →

</Button>

</div>

</Card>

</Link>

))}

</div>

)}

</div>

)}

</div>

);
}
      
