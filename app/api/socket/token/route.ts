import { NextResponse } from "next/server";
import { SignJWT } from "jose";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
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
      },
    });


    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }


    const secret = process.env.SOCKET_SECRET;

    if (!secret) {
      console.error(
        "SOCKET_SECRET is not configured"
      );

      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }


    const secretKey =
      new TextEncoder().encode(secret);



    const token =
      await new SignJWT({
        userId: user.id,
        username: user.username,
      })
        .setProtectedHeader({
          alg: "HS256",
        })
        .setIssuedAt()
        .setExpirationTime("10m")
        .sign(secretKey);



    return NextResponse.json({
      token,
    });

  } catch (error) {

    console.error(
      "SOCKET TOKEN ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create socket token",
      },
      { status: 500 }
    );
  }
}