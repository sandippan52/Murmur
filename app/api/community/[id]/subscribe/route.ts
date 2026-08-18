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
        username: true,
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

   

    const { id } = await params;

   

    console.log("RAZORPAY CONFIG CHECK:", {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecretExists: !!process.env.RAZORPAY_KEY_SECRET,
      keySecretLength:
        process.env.RAZORPAY_KEY_SECRET?.length,
    });

   

    const community = await prisma.community.findUnique({
      where: {
        id,
      },
    });

    if (!community) {
      return Response.json(
        {
          error: "Community not found",
        },
        {
          status: 404,
        }
      );
    }

    

    if (community.ownerId === user.id) {
      return Response.json(
        {
          error:
            "You cannot subscribe to your own community.",
        },
        {
          status: 400,
        }
      );
    }

    

    const existingSubscription =
      await prisma.communitySubscription.findUnique({
        where: {
          userId_communityId: {
            userId: user.id,
            communityId: community.id,
          },
        },
      });

   

    if (
      existingSubscription &&
      existingSubscription.status === "ACTIVE" &&
      existingSubscription.expiresAt &&
      existingSubscription.expiresAt > new Date()
    ) {
      return Response.json(
        {
          error:
            "You are already subscribed to this community.",
        },
        {
          status: 400,
        }
      );
    }

    

    if (
      existingSubscription &&
      existingSubscription.status === "PENDING"
    ) {
      return Response.json(
        {
          error:
            "You already have a pending subscription for this community. Please complete the payment.",
        },
        {
          status: 400,
        }
      );
    }

    

    const monthlyPrice = Number(
      community.monthlyPrice
    );

    if (
      !Number.isFinite(monthlyPrice) ||
      monthlyPrice <= 0
    ) {
      return Response.json(
        {
          error:
            "Invalid community subscription price.",
        },
        {
          status: 400,
        }
      );
    }

  

    const amountInPaise = Math.round(
      monthlyPrice * 100
    );

   

    let razorpayPlanId =
      community.razorpayPlanId;

    if (!razorpayPlanId) {
      console.log(
        "Creating new Razorpay plan..."
      );

      const plan =
        await razorpay.plans.create({
          period: "monthly",

          interval: 1,

          item: {
            name: `${community.name} Subscription`,

            amount: amountInPaise,

            currency: "INR",

            description:
              community.description ||
              `Monthly subscription to ${community.name}`,
          },

          notes: {
            communityId: community.id,
          },
        });

      console.log(
        "PLAN CREATED:",
        plan.id
      );

      razorpayPlanId = plan.id;

     

      await prisma.community.update({
        where: {
          id: community.id,
        },

        data: {
          razorpayPlanId,
        },
      });

      console.log(
        "PLAN SAVED TO DATABASE"
      );
    }

    console.log(
      "Using Razorpay plan:",
      razorpayPlanId
    );

    

    const razorpaySubscription =
      await razorpay.subscriptions.create({
        plan_id: razorpayPlanId,

        total_count: 12,

        quantity: 1,

        customer_notify: true,

        notes: {
          userId: user.id,

          communityId: community.id,
        },
      });

    console.log(
      "SUBSCRIPTION CREATED:",
      razorpaySubscription.id
    );

    

    const murmurSubscription =
      await prisma.communitySubscription.upsert({
        where: {
          userId_communityId: {
            userId: user.id,

            communityId: community.id,
          },
        },

        update: {
          status: "PENDING",

          startsAt: new Date(),

          expiresAt: null,

          provider: "razorpay",

          providerSubscriptionId:
            razorpaySubscription.id,
        },

        create: {
          userId: user.id,

          communityId: community.id,

          startsAt: new Date(),

          expiresAt: null,

          status: "PENDING",

          provider: "razorpay",

          providerSubscriptionId:
            razorpaySubscription.id,
        },
      });

    console.log(
      "MURMUR SUBSCRIPTION SAVED:",
      murmurSubscription.id
    );

    

    return Response.json(
      {
        subscriptionId:
          razorpaySubscription.id,

        razorpayKey:
          process.env.RAZORPAY_KEY_ID,

        amount: amountInPaise,

        currency: "INR",

        communityId: community.id,

        communityName: community.name,
      },
      {
        status: 201,
      }
    );
  } catch (err) {
    console.error(
      "CREATE SUBSCRIPTION ERROR:",
      err
    );

    return Response.json(
      {
        error:
          "Unable to create subscription",
      },
      {
        status: 500,
      }
    );
  }
}