import {prisma} from '@/lib/prisma'
import { auth } from '@/auth'
import { json } from 'stream/consumers'

export async function POST(req:Request){

try{

const session = await auth()


if(!session?.user?.email){
    return Response.json(
        {message: "User unauthorized"},
        {status:401}
    )
}

const user = await prisma.user.findUnique({
    where:{
        email:session?.user?.email
    }
})

if(!user){
    return Response.json(
        {message : "User does not exist"}
    )
}
// For creating community we need -> ownerId (can get from backend), name (can get from the frontend),
//  description (can get from the frontend), monthlyprice (can get from the frontend)

const ownerId = user.id

const {name, description, monthlyprice} = await req.json()


const newCommunity = await prisma.community.create({
    data:{
        ownerId,
        name,
        description,
        monthlyPrice:monthlyprice
    }
})

return Response.json(
    {message : "New community created."},
    {status : 201}
)

}catch(err){
    console.log(err)
    return Response.json(
       err 
    )
}


}


