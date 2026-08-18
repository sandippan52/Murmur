import { prisma } from "@/lib/prisma";

export async function getActiveSubscription(
  userId: string,
  communityId: string
) {
  const subscription =
    await prisma.communitySubscription.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
    });

  if (!subscription) {
    return null;
  }

  const now = new Date();

  if (
    subscription.status !== "ACTIVE" ||
    (
      subscription.expiresAt !== null &&
      subscription.expiresAt <= now
    )
  ) {
    return null;
  }

  return subscription;
}

export async function hasActiveSubscription(
  userId: string,
  communityId: string
): Promise<boolean> {
  const subscription =
    await getActiveSubscription(
      userId,
      communityId
    );

  return subscription !== null;
}