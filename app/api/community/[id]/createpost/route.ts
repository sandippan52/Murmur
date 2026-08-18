
// To create a community post we need -> authorId (can get from the backend), communityId (can get from the params),
// postType (can be sent from the frontEnd), title ( can get from the frontend), body(cgftf), Visibility(cgftf)




import {prisma} from '@/lib/prisma'
import { auth } from '@/auth';
import cloudinary from '@/lib/cloudinary';
export const runtime = "nodejs";





export async function POST(req: Request, {params}:{params : Promise<{id : string}>}){

try{

const session = await auth()


if(!session?.user?.email){
return Response.json(
    {error : "Unauthorized"},
    {status : 401}
)
}



const user = await prisma.user.findUnique(
    {
        where: {email: session.user.email}
    }
)

if(!user){
    return Response.json({
        message : "User not found, please sign in first."
    })
}




const formData = await req.formData()

const postType = formData.get("postType") as string;
// const caption = formData.get("caption") as string;
const title = formData.get("title") as string
const bodyText = formData.get("bodyText") as string
const file = formData.get("file") as File|null
const visibility = formData.get("visibility") as any

const {id} = await params

const communityId = id

let uploadedURL : string | null = null
let fileSize : number | null = null


if(postType === 'TEXT'){

const post = await prisma.post.create({
data:{
    authorId: user.id,
    postType,
    title, 
    body : bodyText,
    visibility,
    communityId    
}
})

return Response.json({
    message : "Post created successfully"
},
{status:200})

}





if(!file){

    return Response.json({
      message : "No file uploaded"
    })

}

const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes)

const base64 = buffer.toString("base64")

const dataURI = `data:${file.type};base64,${base64}`


const uploadResult = await cloudinary.uploader.upload(
    dataURI,
    {
        folder:"murmur",
        resource_type:"auto"
    }
)

uploadedURL = uploadResult.secure_url;

fileSize = file.size

const post = await prisma.post.create({
    data:{
       authorId : user.id,
       postType : postType as any,
       title : title,
       body : bodyText,
       visibility,
       communityId,
       
       postmedia:{
        create:{
            fileUrl:uploadedURL,
            mediaType: postType as any,
            fileSize:fileSize
        }
       }
    },
    include:{
        postmedia:true
    }
})

return Response.json(
    {
        message : "Post created successfully",
        post

    },
    
)







}catch(err){
console.log(err)

return Response.json(
    {
        message : "Internal server error"
    },
    {status:500}
)

}





}














