import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    const { id } = await params;

    const postId = id;

    

    if (!session?.user?.email) {
      return Response.json(
        {
          message: "User unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return Response.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const userId = user.id;

    

    const postLike =
      await prisma.postLikes.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });

    

    if (!postLike) {
      const [, updatedPost] =
        await prisma.$transaction([
          prisma.postLikes.create({
            data: {
              postId,
              userId,
            },
          }),

          prisma.post.update({
            where: {
              id: postId,
            },

            data: {
              likesCount: {
                increment: 1,
              },
            },
          }),
        ]);

      return Response.json({
        isLiked: true,
        likesCount: updatedPost.likesCount,
      });
    }


    const [, updatedPost] =
      await prisma.$transaction([
        prisma.postLikes.delete({
          where: {
            postId_userId: {
              postId,
              userId,
            },
          },
        }),

        prisma.post.update({
          where: {
            id: postId,
          },

          data: {
            likesCount: {
              decrement: 1,
            },
          },
        }),
      ]);

    return Response.json({
      isLiked: false,
      likesCount: updatedPost.likesCount,
    });

  } catch (err) {
    console.error("Like error:", err);

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