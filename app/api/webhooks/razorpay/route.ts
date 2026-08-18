import { prisma } from "@/lib/prisma";
import crypto from "crypto";


interface RazorpaySubscription {
  id: string;

  plan_id: string;

  customer_id?: string | null;

  status: string;

  current_start?: number | null;

  current_end?: number | null;

  start_at?: number | null;

  end_at?: number | null;

  quantity?: number;

  notes?: {
    userId?: string;
    communityId?: string;
  } | null;
}

interface RazorpayPayment {
  id: string;

  amount: number;

  currency: string;

  status: string;

  method?: string;

  description?: string;

  subscription_id?: string | null;
}

interface RazorpayWebhookPayload {
  entity: string;

  event: string;

  payload: {
    subscription?: {
      entity: RazorpaySubscription;
    };

    payment?: {
      entity: RazorpayPayment;
    };
  };
}


export async function POST(req: Request) {
  try {
    

    const rawBody = await req.text();

    const razorpaySignature =
      req.headers.get("x-razorpay-signature");

    if (!razorpaySignature) {
      console.error(
        "RAZORPAY WEBHOOK: Missing signature"
      );

      return Response.json(
        {
          error: "Missing Razorpay signature",
        },
        {
          status: 400,
        }
      );
    }


    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "RAZORPAY WEBHOOK: Webhook secret is missing"
      );

      return Response.json(
        {
          error: "Webhook secret is not configured",
        },
        {
          status: 500,
        }
      );
    }

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          webhookSecret
        )
        .update(rawBody)
        .digest("hex");

    if (
      expectedSignature.length !==
      razorpaySignature.length
    ) {
      console.error(
        "RAZORPAY WEBHOOK: Invalid signature length"
      );

      return Response.json(
        {
          error: "Invalid webhook signature",
        },
        {
          status: 400,
        }
      );
    }

    const signaturesMatch =
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf8"),
        Buffer.from(razorpaySignature, "utf8")
      );

    if (!signaturesMatch) {
      console.error(
        "RAZORPAY WEBHOOK: Invalid signature"
      );

      return Response.json(
        {
          error: "Invalid webhook signature",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "RAZORPAY WEBHOOK: Signature verified"
    );


    const razorpayEventId =
      req.headers.get(
        "x-razorpay-event-id"
      );

    console.log(
      "RAZORPAY WEBHOOK EVENT ID:",
      razorpayEventId
    );


    const body =
      JSON.parse(
        rawBody
      ) as RazorpayWebhookPayload;

    const event =
      body.event;

    console.log(
      "RAZORPAY WEBHOOK EVENT:",
      event
    );


    const subscription =
      body.payload?.subscription?.entity;

    const payment =
      body.payload?.payment?.entity;


    if (
      event === "subscription.activated"
    ) {
      if (!subscription) {
        console.error(
          "subscription.activated without subscription data"
        );

        return Response.json(
          {
            error:
              "Subscription data missing",
          },
          {
            status: 400,
          }
        );
      }

      const userId =
        subscription.notes?.userId;

      const communityId =
        subscription.notes?.communityId;

      if (!userId || !communityId) {
        console.error(
          "Missing userId or communityId in subscription notes",
          subscription
        );

        return Response.json(
          {
            error:
              "Missing subscription metadata",
          },
          {
            status: 400,
          }
        );
      }


      const user =
        await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

      if (!user) {
        console.error(
          "Webhook user not found:",
          userId
        );

        return Response.json(
          {
            error: "User not found",
          },
          {
            status: 404,
          }
        );
      }


      const community =
        await prisma.community.findUnique({
          where: {
            id: communityId,
          },
        });

      if (!community) {
        console.error(
          "Webhook community not found:",
          communityId
        );

        return Response.json(
          {
            error: "Community not found",
          },
          {
            status: 404,
          }
        );
      }


      const startsAt =
        subscription.current_start
          ? new Date(
              subscription.current_start * 1000
            )
          : new Date();

      const expiresAt =
        subscription.current_end
          ? new Date(
              subscription.current_end * 1000
            )
          : new Date(
              startsAt.getTime() +
                30 *
                  24 *
                  60 *
                  60 *
                  1000
            );

      

      const existingSubscription =
        await prisma.communitySubscription.findUnique({
          where: {
            userId_communityId: {
              userId,
              communityId,
            },
          },
        });

     

      if (existingSubscription) {
        const updatedSubscription =
          await prisma.communitySubscription.update({
            where: {
              id: existingSubscription.id,
            },

            data: {
              startsAt,

              expiresAt,

              status: "ACTIVE",

              provider: "razorpay",

              providerCustomerId:
                subscription.customer_id ??
                null,

              providerSubscriptionId:
                subscription.id,
            },
          });

        console.log(
          "COMMUNITY SUBSCRIPTION UPDATED:",
          updatedSubscription.id
        );
      }

     

      else {
        const newSubscription =
          await prisma.communitySubscription.create({
            data: {
              userId,

              communityId,

              startsAt,

              expiresAt,

              status: "ACTIVE",

              provider: "razorpay",

              providerCustomerId:
                subscription.customer_id ??
                null,

              providerSubscriptionId:
                subscription.id,
            },
          });

        console.log(
          "COMMUNITY SUBSCRIPTION CREATED:",
          newSubscription.id
        );
      }

      console.log(
        "SUBSCRIPTION ACTIVATED:",
        subscription.id
      );

      return Response.json(
        {
          success: true,

          event,

          message:
            "Subscription activated successfully",
        },
        {
          status: 200,
        }
      );
    }

  

    if (
      event === "subscription.charged"
    ) {
      if (!subscription) {
        console.error(
          "subscription.charged without subscription"
        );

        return Response.json(
          {
            error:
              "Subscription data missing",
          },
          {
            status: 400,
          }
        );
      }

      if (!payment) {
        console.error(
          "subscription.charged without payment"
        );

        return Response.json(
          {
            error:
              "Payment data missing",
          },
          {
            status: 400,
          }
        );
      }

      const userId =
        subscription.notes?.userId;

      const communityId =
        subscription.notes?.communityId;

      if (!userId || !communityId) {
        console.error(
          "Missing userId or communityId"
        );

        return Response.json(
          {
            error:
              "Missing subscription metadata",
          },
          {
            status: 400,
          }
        );
      }


      const dbSubscription =
        await prisma.communitySubscription.findUnique({
          where: {
            userId_communityId: {
              userId,
              communityId,
            },
          },
        });

      if (!dbSubscription) {
        console.error(
          "Database subscription not found:",
          {
            userId,
            communityId,
          }
        );

        return Response.json(
          {
            error:
              "Subscription not found",
          },
          {
            status: 404,
          }
        );
      }


      const existingTransaction =
        await prisma.paymentTransaction.findFirst({
          where: {
            providerPaymentId:
              payment.id,
          },
        });

      if (existingTransaction) {
        console.log(
          "PAYMENT ALREADY PROCESSED:",
          payment.id
        );

        return Response.json(
          {
            success: true,

            event,

            message:
              "Payment already processed",
          },
          {
            status: 200,
          }
        );
      }


      const grossAmount =
        payment.amount / 100;

      const platformFee =
        0;

      const creatorAmount =
        grossAmount -
        platformFee;


      const transaction =
        await prisma.paymentTransaction.create({
          data: {
            subscriptionId:
              dbSubscription.id,

            userId,

            communityId,

            grossAmount,

            platformFee,

            creatorAmount,

            currency:
              payment.currency ||
              "INR",

            provider:
              "razorpay",

            providerPaymentId:
              payment.id,

            status:
              "SUCCESS",
          },
        });

      console.log(
        "PAYMENT TRANSACTION CREATED:",
        transaction.id
      );

      

      if (
        subscription.current_start &&
        subscription.current_end
      ) {
        await prisma.communitySubscription.update({
          where: {
            id: dbSubscription.id,
          },

          data: {
            startsAt:
              new Date(
                subscription.current_start *
                  1000
              ),

            expiresAt:
              new Date(
                subscription.current_end *
                  1000
              ),

            status:
              "ACTIVE",

            provider:
              "razorpay",

            providerCustomerId:
              subscription.customer_id ??
              null,

            providerSubscriptionId:
              subscription.id,
          },
        });
      }

      console.log(
        "SUBSCRIPTION PAYMENT PROCESSED:",
        payment.id
      );

      return Response.json(
        {
          success: true,

          event,

          transactionId:
            transaction.id,
        },
        {
          status: 200,
        }
      );
    }



if (
  event === "subscription.cancelled"
) {
  if (!subscription) {
    return Response.json(
      {
        error:
          "Subscription data missing",
      },
      {
        status: 400,
      }
    );
  }

  const userId =
    subscription.notes?.userId;

  const communityId =
    subscription.notes?.communityId;

  if (!userId || !communityId) {
    console.error(
      "Missing userId or communityId in cancellation webhook"
    );

    return Response.json(
      {
        error:
          "Missing subscription metadata",
      },
      {
        status: 400,
      }
    );
  }

  

  const dbSubscription =
    await prisma.communitySubscription.findFirst({
      where: {
        providerSubscriptionId:
          subscription.id,

        userId,

        communityId,
      },
    });

  if (!dbSubscription) {
    console.error(
      "Database subscription not found for cancellation:",
      subscription.id
    );

    return Response.json(
      {
        error:
          "Subscription not found",
      },
      {
        status: 404,
      }
    );
  }

 

  await prisma.communitySubscription.update({
    where: {
      id: dbSubscription.id,
    },

    data: {
      status:
        "CANCELLED",
    },
  });

  console.log(
    "SUBSCRIPTION CANCELLED:",
    subscription.id
  );

  return Response.json(
    {
      success: true,

      event,

      subscriptionId:
        subscription.id,
    },
    {
      status: 200,
    }
  );
}

  

    if (
      event === "subscription.completed"
    ) {
      if (!subscription) {
        return Response.json(
          {
            error:
              "Subscription data missing",
          },
          {
            status: 400,
          }
        );
      }

      const userId =
        subscription.notes?.userId;

      const communityId =
        subscription.notes?.communityId;

      if (userId && communityId) {
        await prisma.communitySubscription.updateMany({
          where: {
            userId,

            communityId,
          },

          data: {
            status:
              "EXPIRED",

            providerSubscriptionId:
              subscription.id,
          },
        });

        console.log(
          "SUBSCRIPTION COMPLETED:",
          subscription.id
        );
      }

      return Response.json(
        {
          success: true,

          event,
        },
        {
          status: 200,
        }
      );
    }

   

    if (
      event === "subscription.pending"
    ) {
      console.log(
        "RAZORPAY SUBSCRIPTION PENDING:",
        subscription?.id
      );

      return Response.json(
        {
          success: true,

          event,

          message:
            "Subscription pending event received",
        },
        {
          status: 200,
        }
      );
    }

    

    if (
      event === "subscription.halted"
    ) {
      console.log(
        "RAZORPAY SUBSCRIPTION HALTED:",
        subscription?.id
      );

      return Response.json(
        {
          success: true,

          event,

          message:
            "Subscription halted event received",
        },
        {
          status: 200,
        }
      );
    }

    

    if (
      event ===
      "subscription.authenticated"
    ) {
      console.log(
        "RAZORPAY SUBSCRIPTION AUTHENTICATED:",
        subscription?.id
      );

      return Response.json(
        {
          success: true,

          event,

          message:
            "Subscription authenticated event received",
        },
        {
          status: 200,
        }
      );
    }


    if (
      event ===
      "subscription.updated"
    ) {
      console.log(
        "RAZORPAY SUBSCRIPTION UPDATED:",
        subscription?.id
      );

      return Response.json(
        {
          success: true,

          event,

          message:
            "Subscription updated event received",
        },
        {
          status: 200,
        }
      );
    }


    if (
      event ===
      "subscription.paused"
    ) {
      console.log(
        "RAZORPAY SUBSCRIPTION PAUSED:",
        subscription?.id
      );

      return Response.json(
        {
          success: true,

          event,

          message:
            "Subscription paused event received",
        },
        {
          status: 200,
        }
      );
    }

    

    if (
      event ===
      "subscription.resumed"
    ) {
      console.log(
        "RAZORPAY SUBSCRIPTION RESUMED:",
        subscription?.id
      );

      return Response.json(
        {
          success: true,

          event,

          message:
            "Subscription resumed event received",
        },
        {
          status: 200,
        }
      );
    }


    console.log(
      "RAZORPAY WEBHOOK: Unhandled event:",
      event
    );

    return Response.json(
      {
        success: true,

        message:
          "Webhook received",

        event,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "RAZORPAY WEBHOOK ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Webhook processing failed",
      },
      {
        status: 500,
      }
    );
  }
}