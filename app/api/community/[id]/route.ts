import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hasActiveSubscription } from "@/lib/subscription";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    

    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
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
      return Response.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    

    const community = await prisma.community.findUnique({
      where: {
        id,
      },

      include: {
        owner: true,

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
      },
    });

    if (!community) {
      return Response.json(
        { message: "Community not found" },
        { status: 404 }
      );
    }

    

    const isOwner =
      user.id === community.ownerId;

    

    let isSubscriber = false;

    if (!isOwner) {
      isSubscriber = await hasActiveSubscription(
        user.id,
        community.id
      );
    }

    

    const posts = community.posts.map((post) => {

      

      if (post.visibility === "PUBLIC") {
        return {
          ...post,
          locked: false,
        };
      }

      

      if (isOwner) {
        return {
          ...post,
          locked: false,
        };
      }

      

      if (isSubscriber) {
        return {
          ...post,
          locked: false,
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

        
        body: null,
        postmedia: [],
      };
    });

    

    return Response.json({
      ...community,

      posts,

      isOwner,

      isSubscriber,
    });

  } catch (err) {

    console.error(err);

    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}