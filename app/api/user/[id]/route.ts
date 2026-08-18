import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    

    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        { message: "User unauthorized" },
        { status: 401 }
      );
    }

    
    const myself = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!myself) {
      return Response.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    

    const { id } = await params;


    const profile = await prisma.user.findUnique({
      where: {
        id,
      },

      include: {
        posts: {
          include: {
            author: true,
            community: true,
            postmedia: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        ownedCommunities: {
          include: {
            owner: true,
          },
        },

        subscriptions: {
          include: {
            community: true,
          },
        },

        followers: true,

        followings: true,
      },
    });

    if (!profile) {
      return Response.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }


    const isMe = myself.id === profile.id;


    const activeSubscriptions =
      await prisma.communitySubscription.findMany({
        where: {
          userId: myself.id,

          status: "ACTIVE",

          expiresAt: {
            gt: new Date(),
          },
        },

        select: {
          communityId: true,
        },
      });

    const subscribedCommunityIds = new Set(
      activeSubscriptions.map(
        (subscription) => subscription.communityId
      )
    );


    const posts = profile.posts.map((post) => {

      if (post.visibility === "PUBLIC") {
        return {
          ...post,
          locked: false,
          isLiked: !!post.likesCount,
        };
      }

      if (isMe) {
        return {
          ...post,
          locked: false,
          isLiked: !!post.likesCount,
        };
      }


      const isSubscriber =
        post.communityId
          ? subscribedCommunityIds.has(post.communityId)
          : false;

      if (isSubscriber) {
        return {
          ...post,
          locked: false,
          isLiked: !!post.likesCount,
        };
      }


      return {
        id: post.id,

        authorId: post.authorId,

        author: post.author,

        communityId: post.communityId,

        community: post.community,

        postType: post.postType,

        title: post.title,

        visibility: post.visibility,

        likesCount: post.likesCount,

        commentsCount: post.commentsCount,

        repostsCount: post.repostsCount,

        createdAt: post.createdAt,

        updatedAt: post.updatedAt,

        locked: true,

        isLiked: false,

        
        body: null,
        postmedia: [],
      };
    });


    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: myself.id,
          followingId: profile.id,
        },
      },
    });


    return Response.json({
      id: profile.id,

      username: profile.username,

      avatarSeed: profile.avatarSeed,

      avatarUrl: profile.avatarUrl,

      bio: profile.bio,

      followers: profile.followers,

      followings: profile.followings,

      ownedCommunities: profile.ownedCommunities,

      subscriptions: profile.subscriptions,

      posts,

      isMe,

      isFollowing: !!isFollowing,
    });

  } catch (err) {

    console.error(err);

    return Response.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}