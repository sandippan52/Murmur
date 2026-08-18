import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        avatarSeed: true,
      },
    });

    if (!user) {
      return Response.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(user);
  } catch (error) {
    console.error("Me API error:", error);

    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}