"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type { FormEvent } from "react";

import {
  useSearchParams,
  useRouter,
} from "next/navigation";

import Avatar from "@/components/ui/Avatar";


import { io, Socket } from "socket.io-client";




interface User {
  id: string;
  username: string;
  avatarUrl: string | null;
  avatarSeed: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;

  sender: User;
}

interface ConversationResponse {
  id: string;

  otherUser: User | null;

  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  } | null;

  lastMessageAt: string;
}


export default function MessagesPage() {

  const searchParams = useSearchParams();

  const router = useRouter();

  const conversationId =
    searchParams.get("conversationId");


  const [messages, setMessages] =
    useState<Message[]>([]);

  const [otherUser, setOtherUser] =
    useState<User | null>(null);

  const [content, setContent] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");


  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const socketRef =
  useRef<Socket | null>(null);  

  useEffect(() => {

    if (!conversationId) {

      setLoading(false);

      return;
    }


    async function loadConversation() {

      try {

        setLoading(true);

        setError("");

        const conversationRes =
          await fetch("/api/conversations");


        const conversationData =
          await conversationRes.json();


        if (!conversationRes.ok) {

          throw new Error(
            conversationData?.error ||
            "Failed to load conversations"
          );

        }

        if (!Array.isArray(conversationData)) {

          throw new Error(
            "Invalid conversations response"
          );

        }


        const conversation =
          conversationData.find(
            (item: ConversationResponse) =>
              item.id === conversationId
          );


        if (!conversation) {

          throw new Error(
            "Conversation not found"
          );

        }

        setOtherUser(
          conversation.otherUser
        );

        const messagesRes =
          await fetch(
            `/api/conversations/${conversationId}/messages`
          );


        const messagesData =
          await messagesRes.json();


        if (!messagesRes.ok) {

          throw new Error(
            messagesData?.error ||
            "Failed to load messages"
          );

        }


        if (!Array.isArray(messagesData)) {

          throw new Error(
            "Invalid messages response"
          );

        }

        setMessages(
          messagesData as Message[]
        );

      }

      catch (err) {

        console.error(
          "LOAD CONVERSATION ERROR:",
          err
        );


        setError(
          err instanceof Error
            ? err.message
            : "Failed to load conversation."
        );

      }

      finally {

        setLoading(false);

      }

    }


    loadConversation();

  }, [conversationId]);



useEffect(() => {

  let socket: Socket | null = null;

  async function connectSocket() {

    try {

      const res =
        await fetch("/api/socket/token");

      const data =
        await res.json();


      if (!res.ok) {

        throw new Error(
          data?.error ||
          "Failed to authenticate socket"
        );

      }

      socket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL ||
        "http://localhost:4000",
        {
          auth: {
            token: data.token,
          },

          transports: ["websocket"],
        }
      );


      socketRef.current =
        socket;

  socket.on("connect", () => {

  console.log(
    "Connected to Socket.IO:",
    socket?.id
  );


  if (conversationId) {

    socket?.emit(
      "joinConversation",
      conversationId
    );

  }

});


socket.on(
  "conversationJoined",
  (joinedConversationId: string) => {

    console.log(
      "Joined conversation:",
      joinedConversationId
    );

  }
);


socket.on(
  "conversationError",
  (message: string) => {

    console.error(
      "Conversation error:",
      message
    );

  }
);


socket.on(
  "newMessage",
  (message: Message) => {

    console.log(
      "📨 New message:",
      message
    );


    setMessages((prev) => {

      if (
        prev.some(
          (item) =>
            item.id === message.id
        )
      ) {

        return prev;

      }


      return [
        ...prev,
        message,
      ];

    });

  }
);


socket.on(
  "messageError",
  (message: string) => {

    console.error(
      "Message error:",
      message
    );

    setError(message);

  }
);


      socket.on(
        "connect_error",
        (error) => {

          console.error(
            "Socket connection error:",
            error.message
          );

        }
      );

    } catch (error) {

      console.error(
        "SOCKET CONNECTION ERROR:",
        error
      );

    }

  }


  connectSocket();

  return () => {

    socket?.disconnect();

    socketRef.current =
      null;

  };

}, []);



  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);


  async function sendMessage(
  e: FormEvent<HTMLFormElement>
) {

  e.preventDefault();


  if (!conversationId) {
    return;
  }


  const trimmedContent =
    content.trim();


  if (!trimmedContent) {
    return;
  }


  const socket =
    socketRef.current;


  if (!socket) {

    setError(
      "Realtime connection is not ready."
    );

    return;

  }


  if (!socket.connected) {

    setError(
      "Realtime connection is disconnected."
    );

    return;

  }


  try {

    setSending(true);

    setError("");


    

    socket.emit(
      "sendMessage",
      {
        conversationId,
        content: trimmedContent,
      }
    );

    setContent("");

  } catch (error) {

    console.error(
      "SEND MESSAGE ERROR:",
      error
    );


    setError(
      error instanceof Error
        ? error.message
        : "Failed to send message."
    );

  } finally {

    setSending(false);

  }

}


  if (!conversationId) {

    return (

      <div className="h-[calc(100vh-80px)] flex items-center justify-center px-4">

        <div className="text-center">

          <div className="text-5xl mb-4">
            💬
          </div>

          <h1 className="text-xl font-semibold text-white">
            Select a conversation
          </h1>

          <p className="text-zinc-500 mt-2">
            Choose someone from your chats to start messaging.
          </p>

          <button
            onClick={() =>
              router.push("/chats")
            }
            className="mt-6 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition"
          >
            Go to Chats
          </button>

        </div>

      </div>

    );

  }


  if (loading) {

    return (

      <div className="h-[calc(100vh-80px)] flex items-center justify-center text-zinc-400">

        Loading conversation...

      </div>

    );

  }


  if (error && !otherUser) {

    return (

      <div className="h-[calc(100vh-80px)] flex items-center justify-center px-4">

        <div className="text-center">

          <div className="text-4xl mb-4">
            😕
          </div>

          <h1 className="text-xl font-semibold text-white">
            Something went wrong
          </h1>

          <p className="text-zinc-500 mt-2">
            {error}
          </p>

          <button
            onClick={() =>
              router.push("/chats")
            }
            className="mt-6 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition"
          >
            Back to Chats
          </button>

        </div>

      </div>

    );

  }


  return (

    <div className="h-[calc(100vh-80px)] flex flex-col bg-black">

      <div className="h-16 shrink-0 border-b border-zinc-800 bg-zinc-950 flex items-center px-4 md:px-6">

        <button
          onClick={() =>
            router.push("/chats")
          }
          className="mr-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Back to chats"
        >
          ←
        </button>


        {otherUser && (

          <div className="flex items-center gap-3">

            <Avatar
              image={
                otherUser.avatarUrl
              }
              username={
                otherUser.username
              }
              size={42}
            />

            <div>

              <h1 className="text-white font-semibold">

                {otherUser.username}

              </h1>

              <p className="text-xs text-zinc-500">

                Murmur

              </p>

            </div>

          </div>

        )}

      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">

        <div className="max-w-4xl mx-auto space-y-3">


          {messages.length === 0 ? (

            <div className="h-full min-h-[400px] flex items-center justify-center">

              <div className="text-center">

                {otherUser && (

                  <Avatar
                    image={
                      otherUser.avatarUrl
                    }
                    username={
                      otherUser.username
                    }
                    size={80}
                  />

                )}

                <h2 className="text-white text-lg font-semibold mt-4">

                  {otherUser?.username}

                </h2>

                <p className="text-zinc-500 mt-1">

                  Start the conversation 👋

                </p>

              </div>

            </div>

          ) : (

            messages.map((message) => {

              const isMine =
                message.senderId !==
                otherUser?.id;


              return (

                <div
                  key={message.id}
                  className={`flex ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[75%] md:max-w-[60%] px-4 py-2.5 rounded-2xl text-sm leading-6 ${
                      isMine
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-zinc-800 text-zinc-100 rounded-bl-md"
                    }`}
                  >

                    <p className="whitespace-pre-wrap break-words">

                      {message.content}

                    </p>


                    <div
                      className={`text-[10px] mt-1 ${
                        isMine
                          ? "text-blue-100"
                          : "text-zinc-500"
                      }`}
                    >

                      {new Date(
                        message.createdAt
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}

                    </div>

                  </div>

                </div>

              );

            })

          )}


          <div
            ref={messagesEndRef}
          />

        </div>

      </div>

      {error && (

        <div className="px-4 pb-2">

          <p className="max-w-4xl mx-auto text-sm text-red-400">

            {error}

          </p>

        </div>

      )}


      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-3 md:px-6 py-3">

        <form
          onSubmit={sendMessage}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >

          <input
            type="text"
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 min-w-0 bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-blue-500 transition disabled:opacity-50"
          />


          <button
            type="submit"
            disabled={
              sending ||
              !content.trim()
            }
            className="shrink-0 px-5 py-3 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >

            {sending
              ? "..."
              : "Send"}

          </button>

        </form>

      </div>

    </div>

  );

}