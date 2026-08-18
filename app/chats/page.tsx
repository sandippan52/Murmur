


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Avatar from "@/components/ui/Avatar";




interface User {
  id: string;
  username: string;
  avatarUrl: string | null;
  avatarSeed: string;
}

interface LastMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  id: string;

  otherUser: User | null;

  lastMessage: LastMessage | null;

  lastMessageAt: string;
}




export default function ChatsPage() {

  const router = useRouter();


  

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  

  useEffect(() => {

    async function loadConversations() {

      try {

        setLoading(true);

        setError("");


        const res =
          await fetch("/api/conversations");


        const data =
          await res.json();


        if (!res.ok) {

          throw new Error(
            data?.error ||
            "Failed to load conversations"
          );

        }


        if (!Array.isArray(data)) {

          throw new Error(
            "Invalid conversations response"
          );

        }


        setConversations(
          data as Conversation[]
        );

      }

      catch (err) {

        console.error(
          "LOAD CHATS ERROR:",
          err
        );


        setError(
          err instanceof Error
            ? err.message
            : "Failed to load chats."
        );

      }

      finally {

        setLoading(false);

      }

    }


    loadConversations();

  }, []);


  

  function openConversation(
    conversationId: string
  ) {

    router.push(
      `/messages?conversationId=${conversationId}`
    );

  }



  function formatTime(
    dateString: string
  ) {

    const date =
      new Date(dateString);

    const now =
      new Date();


    const difference =
      now.getTime() -
      date.getTime();


    const minutes =
      Math.floor(
        difference / (1000 * 60)
      );


    if (minutes < 1) {
      return "now";
    }


    if (minutes < 60) {
      return `${minutes}m`;
    }


    const hours =
      Math.floor(minutes / 60);


    if (hours < 24) {
      return `${hours}h`;
    }


    const days =
      Math.floor(hours / 24);


    if (days < 7) {
      return `${days}d`;
    }


    return date.toLocaleDateString(
      [],
      {
        day: "numeric",
        month: "short",
      }
    );

  }



  if (loading) {

    return (

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">

        <div className="text-zinc-400">
          Loading chats...
        </div>

      </div>

    );

  }


 
  if (error) {

    return (

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">

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
              window.location.reload()
            }
            className="mt-6 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition"
          >
            Try Again
          </button>

        </div>

      </div>

    );

  }


  

  return (

    <div className="h-[calc(100vh-80px)] bg-black text-white flex">


    

      <aside className="w-full md:w-[360px] lg:w-[400px] shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950">


       

        <div className="px-5 py-5 border-b border-zinc-800">

          <h1 className="text-2xl font-bold">
            Messages
          </h1>

        </div>


        

        <div className="flex-1 overflow-y-auto">


          {conversations.length === 0 ? (

            <div className="px-6 py-16 text-center">

              <div className="text-4xl mb-4">
                💬
              </div>

              <h2 className="text-lg font-semibold text-white">
                No conversations yet
              </h2>

              <p className="text-sm text-zinc-500 mt-2 leading-6">
                Visit someone's profile and click Message
                to start a conversation.
              </p>

            </div>

          ) : (

            <div>

              {conversations.map(
                (conversation) => {

                  const user =
                    conversation.otherUser;

                  if (!user) {
                    return null;
                  }


                  const lastMessage =
                    conversation.lastMessage;


                  return (

                    <button
                      key={conversation.id}
                      onClick={() =>
                        openConversation(
                          conversation.id
                        )
                      }
                      className="w-full text-left px-5 py-4 flex items-center gap-3 border-b border-zinc-900 hover:bg-zinc-900 transition"
                    >


                     

                      <div className="shrink-0">

                        <Avatar
                          image={
                            user.avatarUrl
                          }
                          username={
                            user.username
                          }
                          size={52}
                        />

                      </div>


                    

                      <div className="min-w-0 flex-1">

                        <div className="flex items-center justify-between gap-3">

                          <h2 className="font-semibold text-white truncate">

                            {user.username}

                          </h2>


                          {conversation.lastMessageAt && (

                            <span className="text-xs text-zinc-500 shrink-0">

                              {formatTime(
                                conversation.lastMessageAt
                              )}

                            </span>

                          )}

                        </div>


                        <p className="text-sm text-zinc-500 truncate mt-1">

                          {lastMessage
                            ? lastMessage.content
                            : "Start chatting..."}

                        </p>

                      </div>


                    </button>

                  );

                }
              )}

            </div>

          )}

        </div>

      </aside>


     

      <main className="hidden md:flex flex-1 items-center justify-center bg-black">

        <div className="text-center px-6">

          <div className="text-5xl mb-5">
            💬
          </div>

          <h2 className="text-xl font-semibold text-white">
            Select a chat to start messaging
          </h2>

          <p className="text-zinc-500 mt-2">
            Choose someone from your conversations.
          </p>

        </div>

      </main>

    </div>

  );

}