
import {prisma} from '@/lib/prisma';

import bcrypt from 'bcryptjs';



export async function POST(req : Request){

try{

const body = await req.json()

const {username, email, password} = body;

if(!username || !email || !password){
    return Response.json({
    error : "Missing fields"
    },{
     status : 400   
    })
}

const existingUser = await prisma.user.findUnique({
    where :{
        email:email
    }
})


if(existingUser){
return Response.json({
message : "User already exists"
})
}


const passwordHash = await bcrypt.hash(password,10)


const newUser = await prisma.user.create({
    data : {
        username : username,
        email : email,
        passwordHash : passwordHash,
        avatarSeed : 'default-seed'
    }
})

return Response.json(
{
    success : true,
    message : "User Created Successfully",
    userDetails : {
        username : newUser.username,
        email: newUser.email
    }
}
    
)

}catch(err){
console.log(err)

return Response.json(

{error : "Internal server error"}
    
)

}

}



















