import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    

    const session = await auth();

    let user = null;

    
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      });
    }

    

    const subscribedCommunityIds = new Set<string>();

    if (user) {
      const activeSubscriptions =
        await prisma.communitySubscription.findMany({
          where: {
            userId: user.id,

            status: "ACTIVE",

            expiresAt: {
              gt: new Date(),
            },
          },

          select: {
            communityId: true,
          },
        });

      activeSubscriptions.forEach((subscription) => {
        subscribedCommunityIds.add(
          subscription.communityId
        );
      });
    }

    

    const posts = await prisma.post.findMany({
      include: {
        author: true,
        community: true,
        postmedia: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    

    const response = posts.map((post) => {

     

      if (post.visibility === "PUBLIC") {
        return {
          ...post,

          locked: false,

          isLiked: false,
        };
      }

      
      if (!user) {
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

          hasMedia: post.postmedia.length > 0,
        };
      }

      

      const isCreator =
        post.authorId === user.id;

      const isSubscriber =
        post.communityId
          ? subscribedCommunityIds.has(
              post.communityId
            )
          : false;

      const hasAccess =
        isCreator || isSubscriber;

      

      if (hasAccess) {
        return {
          ...post,

          locked: false,

          isLiked: false,
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

        hasMedia: post.postmedia.length > 0,
      };
    });

    

    return Response.json(response, {
      headers: {
        "Cache-Control": "no-store",
      },
    });

  } catch (err) {
    console.error("Home API error:", err);

    return Response.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}