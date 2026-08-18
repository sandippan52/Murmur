import { createServer } from "node:http";

import { Server } from "socket.io";
import { jwtVerify } from "jose";

import { prisma } from "@/lib/prisma";


// const PORT = Number(
//   process.env.SOCKET_PORT ||
//   process.env.SOCKET_PORT ||
//   4000
// );

const PORT = Number(
  process.env.PORT ||
  process.env.SOCKET_PORT ||
  4000
);



const SOCKET_SECRET =
  process.env.SOCKET_SECRET;

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";


if (!SOCKET_SECRET) {
  throw new Error(
    "SOCKET_SECRET is not configured"
  );
}


const secretKey =
  new TextEncoder().encode(
    SOCKET_SECRET
  );


const httpServer =
  createServer();


const io =
  new Server(httpServer, {

    cors: {
      origin: FRONTEND_URL,
      credentials: true,
    },

  });


io.use(async (socket, next) => {

  try {

    const token =
      socket.handshake.auth?.token;


    if (
      !token ||
      typeof token !== "string"
    ) {

      return next(
        new Error(
          "Authentication required"
        )
      );

    }


    const { payload } =
      await jwtVerify(
        token,
        secretKey
      );


    if (
      typeof payload.userId !== "string"
    ) {

      return next(
        new Error(
          "Invalid authentication token"
        )
      );

    }


    socket.data.userId =
      payload.userId;

    socket.data.username =
      typeof payload.username === "string"
        ? payload.username
        : null;


    next();

  } catch (error) {

    console.error(
      "SOCKET AUTH ERROR:",
      error
    );

    next(
      new Error(
        "Invalid authentication token"
      )
    );

  }

});

io.on("connection", (socket) => {

  const userId =
    socket.data.userId;


  console.log(
    ` Socket connected: ${userId}`
  );

  socket.on(
    "joinConversation",
    async (conversationId: string) => {

      try {

        if (
          typeof conversationId !== "string" ||
          !conversationId
        ) {

          return;

        }

        const participant =
          await prisma.conversationParticipant.findUnique({

            where: {

              conversationId_userId: {
                conversationId,
                userId,
              },

            },

          });


        if (!participant) {

          console.log(
            ` User ${userId} tried to join unauthorized conversation ${conversationId}`
          );

          socket.emit(
            "conversationError",
            "You are not part of this conversation."
          );

          return;

        }

        socket.join(
          `conversation:${conversationId}`
        );


        console.log(
          `${userId} joined conversation ${conversationId}`
        );

        socket.emit(
          "conversationJoined",
          conversationId
        );

      } catch (error) {

        console.error(
          "JOIN CONVERSATION ERROR:",
          error
        );

      }

    }
  );


socket.on(
  "sendMessage",
  async (data: {
    conversationId: string;
    content: string;
  }) => {

    try {

      const userId =
        socket.data.userId;

      if (
        !data ||
        typeof data.conversationId !== "string" ||
        typeof data.content !== "string"
      ) {

        socket.emit(
          "messageError",
          "Invalid message data."
        );

        return;

      }


      const conversationId =
        data.conversationId;


      const content =
        data.content.trim();

      if (!content) {

        socket.emit(
          "messageError",
          "Message cannot be empty."
        );

        return;

      }


      if (content.length > 5000) {

        socket.emit(
          "messageError",
          "Message is too long."
        );

        return;

      }

      const participant =
        await prisma.conversationParticipant.findUnique({

          where: {

            conversationId_userId: {
              conversationId,
              userId,
            },

          },

        });


      if (!participant) {

        socket.emit(
          "messageError",
          "You are not part of this conversation."
        );

        return;

      }

      const message =
        await prisma.$transaction(
          async (tx) => {

            const newMessage =
              await tx.message.create({

                data: {

                  conversationId,

                  senderId: userId,

                  content,

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
                lastMessageAt:
                  newMessage.createdAt,
              },

            });


            return newMessage;

          }
        );

      io
        .to(`conversation:${conversationId}`)
        .emit(
          "newMessage",
          message
        );


    } catch (error) {

      console.error(
        "SEND MESSAGE ERROR:",
        error
      );


      socket.emit(
        "messageError",
        "Failed to send message."
      );

    }

  }
);


  socket.on(
    "disconnect",
    (reason) => {

      console.log(
        `Socket disconnected: ${userId} (${reason})`
      );

    }
  );

});

httpServer.listen(
  PORT,
 "0.0.0.0",
  () => {
    console.log(
      ` Socket.IO server running on ${PORT}`
    );

  }
);