import { razorpay } from "@/lib/razorpay";

export async function GET() {
  try {
    const plan = await razorpay.plans.create({
      period: "monthly",
      interval: 1,

      item: {
        name: "Murmur Test Plan",
        amount: 10000,
        currency: "INR",
        description: "Test subscription plan",
      },

      notes: {
        test: "true",
      },
    });

    return Response.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("PLAN TEST ERROR:", error);

    return Response.json(
      {
        success: false,
        error,
      },
      {
        status: 500,
      }
    );
  }
}