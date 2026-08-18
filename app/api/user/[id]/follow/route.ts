import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      redirect("/login");
    }

    const { id } = await params;

    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
    });

    if (!currentUser) {
      return Response.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // Prevent following yourself
    if (currentUser.id === id) {
      return Response.json(
        {
          message: "You cannot follow yourself.",
        },
        {
          status: 400,
        }
      );
    }

    const alreadyFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: id,
        },
      },
    });

    if (alreadyFollowing) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: id,
          },
        },
      });

      const followersCount = await prisma.follow.count({
        where: {
          followingId: id,
        },
      });

      return Response.json({
        isFollowing: false,
        followersCount,
      });
    }

    await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: id,
      },
    });

    const followersCount = await prisma.follow.count({
      where: {
        followingId: id,
      },
    });

    return Response.json({
      isFollowing: true,
      followersCount,
    });

  } catch (err) {
    console.log(err);

    return Response.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}