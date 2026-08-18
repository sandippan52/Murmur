import { prisma } from "@/lib/prisma";
import { getActiveSubscription } from "@/lib/subscription";

export type PostAccessResult =
  | {
      allowed: true;
      reason: "PUBLIC" | "OWNER" | "SUBSCRIBER";
    }
  | {
      allowed: false;
      reason: "NOT_SUBSCRIBED";
    };

export async function canAccessPost(
  userId: string,
  postId: string
): Promise<PostAccessResult> {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      authorId: true,
      communityId: true,
      visibility: true,
    },
  });

  if (!post) {
    throw new Error("POST_NOT_FOUND");
  }

  if (post.visibility === "PUBLIC") {
    return {
      allowed: true,
      reason: "PUBLIC",
    };
  }

  if (post.authorId === userId) {
    return {
      allowed: true,
      reason: "OWNER",
    };
  }

  if (!post.communityId) {
    return {
      allowed: false,
      reason: "NOT_SUBSCRIBED",
    };
  }

  const subscription = await getActiveSubscription(
    userId,
    post.communityId
  );

  if (subscription) {
    return {
      allowed: true,
      reason: "SUBSCRIBER",
    };
  }

  return {
    allowed: false,
    reason: "NOT_SUBSCRIBED",
  };
}