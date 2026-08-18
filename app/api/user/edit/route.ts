import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import cloudinary from '@/lib/cloudinary';

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      redirect("/login");
    }

    // const { username, bio } = await req.json();
    const formData = await req.formData()

    const username = formData.get("username") as string

    const bio = formData.get("bio") as string

    const avatar = formData.get("avatar") as File | null

    
    let avatarUrl:string|undefined


    if(avatar){

    const bytes=await avatar.arrayBuffer()

    const buffer=Buffer.from(bytes)

    const base64=buffer.toString("base64")

    const dataURI=`data:${avatar.type};base64,${base64}`

    const uploadResult=await cloudinary.uploader.upload(

    dataURI,

   {

    folder:"murmur/profile-pictures",

    resource_type:"image"

   }

  )

avatarUrl=uploadResult.secure_url

}












    if (!username || username.trim() === "") {
      return Response.json(
        {
          message: "Username is required.",
        },
        {
          status: 400,
        }
      );
    }

    
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
    });

    if (!currentUser) {
      return Response.json(
        {
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser && existingUser.id !== currentUser.id) {
      return Response.json(
        {
          message: "Username already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        username: username.trim(),
        bio: bio?.trim() || null,
        
        ...(avatarUrl && {
        avatarUrl,
        }),
      },
      select: {
        id: true,
        username: true,
        bio: true,
        avatarUrl : true
      },
    });

    return Response.json(updatedUser);
  } catch (err) {
    console.log(err);

    return Response.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}