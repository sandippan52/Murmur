
"use client"
import React from 'react'


const PostMedia = ({media} : any) => {
  return (
    <div>

    { media.map((item : any)=>{
    if(item.mediaType === "IMAGE"){

        return(
        <>
        <img key={item.id} src={item.fileUrl} alt="" width={700} height={500}/>
        
        </>
        )

    }

    if(item.mediaType === "VIDEO"){
      
        return(
            <>
            <video key = {item.id} controls>
                <source  src= {item.fileUrl}/>
            </video>
            
            
            </>
        )



    }

    if(item.mediaType === "AUDIO"){

        return(
        <>
        
        <audio key={item.id} controls> <source src={item.fileUrl}/></audio>
        
        
        </>
        )




    }






    })
    }



    </div>

    
  )
}

export default PostMedia