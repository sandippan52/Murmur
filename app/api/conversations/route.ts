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



export async function GET() {
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


    

    const conversations =
      await prisma.conversation.findMany({

        where: {
          participants: {
            some: {
              userId: currentUser.id,
            },
          },
        },

        orderBy: {
          lastMessageAt: "desc",
        },

        include: {

          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                  avatarSeed: true,
                },
              },
            },
          },

          messages: {
            orderBy: {
              createdAt: "desc",
            },

            take: 1,

            select: {
              id: true,
              content: true,
              senderId: true,
              createdAt: true,
            },
          },

        },
      });


    

    const formattedConversations =
      conversations.map((conversation) => {

        const otherParticipant =
          conversation.participants.find(
            (participant) =>
              participant.userId !== currentUser.id
          );

        const lastMessage =
          conversation.messages[0] ?? null;

        return {
          id: conversation.id,

          otherUser:
            otherParticipant?.user ?? null,

          lastMessage,

          lastMessageAt:
            conversation.lastMessageAt,
        };
      });


    

    return NextResponse.json(
      formattedConversations
    );

  } catch (error) {
    console.error(
      "GET CONVERSATIONS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch conversations",
      },
      { status: 500 }
    );
  }
}