import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";




export async function POST(req: NextRequest) {
  try {
    

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
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


    

    const body = await req.json();

    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }


    

    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot message yourself" },
        { status: 400 }
      );
    }


    

    const targetUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }


    

    const userIds = [
      currentUser.id,
      targetUser.id,
    ].sort();

    const directKey = userIds.join(":");


    

    const existingConversation =
      await prisma.conversation.findUnique({
        where: {
          directKey,
        },
      });

    if (existingConversation) {
      return NextResponse.json({
        conversationId: existingConversation.id,
      });
    }


    

    const conversation = await prisma.conversation.create({
      data: {
        directKey,

        participants: {
          create: [
            {
              userId: currentUser.id,
            },
            {
              userId: targetUser.id,
            },
          ],
        },
      },

      select: {
        id: true,
      },
    });


    

    return NextResponse.json({
      conversationId: conversation.id,
    });

  } catch (error) {
    console.error(
      "CREATE CONVERSATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create conversation",
      },
      { status: 500 }
    );
  }
}



export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
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

    const { conversationId } = await params;

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