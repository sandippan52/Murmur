import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canAccessPost } from "@/lib/postAccess";

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

    

    const post = await prisma.post.findUnique({
      where: {
        id,
      },

      include: {
        author: true,
        community: true,
        postmedia: true,
        commentDetail: true,
      },
    });

    if (!post) {
      return Response.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    let access;

    try {
      access = await canAccessPost(user.id, post.id);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "POST_NOT_FOUND"
      ) {
        return Response.json(
          { message: "Post not found" },
          { status: 404 }
        );
      }

      throw error;
    }


    if (!access.allowed) {
      return Response.json({
        id: post.id,

        author: post.author,

        community: post.community,

        title: post.title,

        visibility: post.visibility,

        postType: post.postType,

        likesCount: post.likesCount,

        commentsCount: post.commentsCount,

        repostsCount: post.repostsCount,

        createdAt: post.createdAt,

        updatedAt: post.updatedAt,

        locked: true,

        
        body: null,

        postmedia: [],

        commentDetail: [],
      });
    }


    return Response.json({
      ...post,

      locked: false,
    });

  } catch (err) {
    console.error(err);

    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}