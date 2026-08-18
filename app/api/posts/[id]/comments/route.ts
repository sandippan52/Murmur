import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canAccessPost } from "@/lib/postAccess";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
   

    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        { error: "Unauthorized" },
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
        { error: "User doesn't exist" },
        { status: 404 }
      );
    }

    const { id } = await params;

    

    let access;

    try {
      access = await canAccessPost(user.id, id);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "POST_NOT_FOUND"
      ) {
        return Response.json(
          { error: "Post not found" },
          { status: 404 }
        );
      }

      throw error;
    }

    if (!access.allowed) {
      return Response.json(
        {
          error:
            "You must be subscribed to comment on this post.",
        },
        { status: 403 }
      );
    }

    

    const body = await req.json();

    const { comment } = body;

    if (
      typeof comment !== "string" ||
      !comment.trim()
    ) {
      return Response.json(
        { error: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    

   const newComment = await prisma.$transaction(async (tx) => {
  const newComment = await tx.comment.create({
    data: {
      postId: id,
      userId: user.id,
      content: comment.trim(),
    },
  });

  await tx.post.update({
    where: {
      id: id,
    },
    data: {
      commentsCount: {
        increment: 1,
      },
    },
  });

  return comment;
});

return Response.json(
  {
    message: "Comment Posted",
    comment: newComment,
  },
  { status: 201 }
);

  } catch (err) {
    console.error(err);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    

    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        { error: "Unauthorized" },
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
        { error: "User doesn't exist" },
        { status: 404 }
      );
    }

    const { id } = await params;

    

    let access;

    try {
      access = await canAccessPost(user.id, id);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "POST_NOT_FOUND"
      ) {
        return Response.json(
          { error: "Post not found" },
          { status: 404 }
        );
      }

      throw error;
    }

    if (!access.allowed) {
      return Response.json(
        {
          error:
            "You must be subscribed to view comments on this post.",
        },
        { status: 403 }
      );
    }

    

    const comments = await prisma.comment.findMany({
      where: {
        postId: id,
      },

      include: {
        user: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    return Response.json(comments);

  } catch (err) {
    console.error(err);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}