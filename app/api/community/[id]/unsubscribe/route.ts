import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { razorpay } from "@/lib/razorpay";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    

    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return Response.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    

    const { id: communityId } = await params;

    

    const subscription =
      await prisma.communitySubscription.findUnique({
        where: {
          userId_communityId: {
            userId: user.id,
            communityId,
          },
        },
      });

    if (!subscription) {
      return Response.json(
        {
          error: "Subscription not found.",
        },
        {
          status: 404,
        }
      );
    }

    

    if (subscription.status !== "ACTIVE") {
      return Response.json(
        {
          error: "This subscription is not active.",
        },
        {
          status: 400,
        }
      );
    }

    
    if (!subscription.providerSubscriptionId) {
      return Response.json(
        {
          error:
            "Razorpay subscription ID is missing.",
        },
        {
          status: 400,
        }
      );
    }

    

    const razorpaySubscription =
      await razorpay.subscriptions.cancel(
        subscription.providerSubscriptionId,
    true
      );

    console.log(
      "RAZORPAY SUBSCRIPTION CANCELLATION REQUESTED:",
      razorpaySubscription.id
    );

   

    return Response.json(
      {
        success: true,

        message:
          "Your subscription will be cancelled at the end of the current billing cycle.",

        expiresAt:
          subscription.expiresAt,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "UNSUBSCRIBE ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Unable to cancel subscription.",
      },
      {
        status: 500,
      }
    );
  }
}