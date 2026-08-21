import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";


export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      conversationId: string;
    }>;
  }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }


    const currentUser =
      await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      });


    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }


    const { conversationId } =
      await params;


    const conversation =
      await prisma.conversation.findFirst({
        where: {
          id: conversationId,

          participants: {
            some: {
              userId: currentUser.id,
            },
          },
        },
      });


    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }


    const messages =
      await prisma.message.findMany({
        where: {
          conversationId,
        },

        orderBy: {
          createdAt: "asc",
        },

        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              avatarSeed: true,
            },
          },
        },
      });


    return NextResponse.json(messages);

  } catch (error) {
    console.error(
      "GET MESSAGES ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}