import {prisma} from '@/lib/prisma'

import { auth } from '@/auth'

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){



try{


const session = await auth()


// For replying I need -> postId(from params), parentCommentId(sent from the frontend), userId(got from the session, not directly), content(sent from the frontend)


if(!session?.user?.email){
return Response.json(
    {message:"User unauthorized"},
    {status:401}
)
}


const user = await prisma.user.findUnique({
    where:{
       email:session.user.email 
    }
})



if(!user){
    return Response.json({
        message : "User not found"
    })
}

const {id} = await params

const postId = id

const userId = user.id

const body = await req.json()

const parentCommentId = await body.parentCommentId;

const content = await body.reply


const newReply = await prisma.comment.create({
    data:{
        postId,
        userId,
        parentCommentId,
        content
    }
})

return Response.json({
    message : "Reply posted"
})





}catch(err){
console.log(err)
return Response.json(
    err
)





}




}










