import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "User unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

   
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

    const subscribedCommunityIds = new Set(
      activeSubscriptions.map(
        (subscription) => subscription.communityId
      )
    );

    

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({
        users: [],
        posts: [],
      });
    }


    const [users, posts] = await Promise.all([
      prisma.user.findMany({
        where: {
          username: {
            contains: q,
            mode: "insensitive",
          },
        },

        select: {
          id: true,
          username: true,
          avatarUrl: true,
          avatarSeed: true,
          bio: true,
        },

        take: 10,
      }),

      prisma.post.findMany({
        where: {
          OR: [
            {
              title: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              body: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        },

        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              avatarSeed: true,
            },
          },

          community: {
            select: {
              id: true,
              name: true,
            },
          },

          postmedia: true,

          likedBy: {
            where: {
              userId: user.id,
            },

            select: {
              id: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 20,
      }),
    ]);


    const accessiblePosts = posts
      .filter((post) => {
       
        if (post.visibility === "PUBLIC") {
          return true;
        }


        const isCreator =
          post.authorId === user.id;

        const isSubscriber =
          post.communityId
            ? subscribedCommunityIds.has(post.communityId)
            : false;

        return isCreator || isSubscriber;
      })
      .map((post) => ({
        ...post,

        isLiked: post.likedBy.length > 0,

        likedBy: undefined,
      }));


    return NextResponse.json(
      {
        users,
        posts: accessiblePosts,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Search error:", error);

    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}