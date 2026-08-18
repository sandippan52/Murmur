import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";




export async function GET(
  req: NextRequest,
  context: {
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


    

    const { conversationId } = await context.params;


    

    const participant =
      await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId: currentUser.id,
          },
        },
      });

    if (!participant) {
      return NextResponse.json(
        { error: "You are not part of this conversation" },
        { status: 403 }
      );
    }


    

    const messages = await prisma.message.findMany({
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




export async function POST(
  req: NextRequest,
  context: {
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


    

    const { conversationId } = await context.params;



    const body = await req.json();

    const content = body.content;


   

    if (
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }


    const trimmedContent = content.trim();


    if (trimmedContent.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long" },
        { status: 400 }
      );
    }


    

    const participant =
      await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId: currentUser.id,
          },
        },
      });

    if (!participant) {
      return NextResponse.json(
        { error: "You are not part of this conversation" },
        { status: 403 }
      );
    }


    

    const message =
      await prisma.$transaction(async (tx) => {

        const newMessage =
          await tx.message.create({
            data: {
              conversationId,
              senderId: currentUser.id,
              content: trimmedContent,
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


        await tx.conversation.update({
          where: {
            id: conversationId,
          },

          data: {
            lastMessageAt: newMessage.createdAt,
          },
        });


        return newMessage;
      });


    

    return NextResponse.json(
      message,
      { status: 201 }
    );

  } catch (error) {
    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to send message",
      },
      { status: 500 }
    );
  }
}