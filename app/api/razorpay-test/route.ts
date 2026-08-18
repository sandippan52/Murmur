import { razorpay } from "@/lib/razorpay";

export async function GET() {
  try {
    const result = await razorpay.payments.all({
      count: 1,
    });

    return Response.json({
      success: true,
      message: "Razorpay authentication works!",
      result,
    });
  } catch (error) {
    console.error("RAZORPAY AUTH TEST ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Razorpay authentication failed",
      },
      {
        status: 500,
      }
    );
  }
}








