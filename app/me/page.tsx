
"use client"

import React from 'react'
// import { auth } from '@/auth'
// import { redirect } from 'next/navigation'

import { useState } from 'react'
import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Post } from '@/types/post'
import PostCard from '@/components/PostCard'


type createTab = "Posts"|"Communities"|"Subscriptions"

interface followers{
  followerId : string,
}

interface followings {
  followingId : string
}




interface Communities{
  id : string,
  name : string,
  description : string,
  owner : {
    username : string
  }
}







interface mydetail {
id : string,
username : string,
followers : followers[]
followings : followings[]
ownedCommunities : Communities[]
posts : Post[]



}




export default function myPage(){

  const [mydata, setMydata] = useState<mydetail>()
  const [tab, setTab] = useState<createTab>("Posts")
  const [mypost, setMyposts] = useState<Post[]>([])
  const [mycommunities, setMycommunities] = useState<Communities[]>([])
  const [loading, setLoading] = useState(false)
  const [liked, setLiked] = useState<boolean>(false)
  const [likedCounts, setLikedCounts] = useState<number>(0)



  useEffect(() => {
    async function getMydata(){
    const response = await fetch ("/api/me")
    
    const data = await response.json()
    
    console.log(data)
    console.log(data.posts)
    
    setMydata(data)
    setMyposts(data.posts)
    setMycommunities(data.ownedCommunities)

    }

    getMydata()
    

  }, [])

  const likeSubmit = async(postId : string)=>{

  const res = await fetch(`/api/posts/${postId}/likes`, {method:"POST"})

  const data = await res.json()

  setMyposts(prev =>
    prev.map(post => {

        if (post.id !== postId)
            return post;

        return {
            ...post,
            isLiked: data.isLiked,
            likesCount: data.likesCount
        };

    })
);


}
  

  

  return(
    <>
    <div>
    <div>
      {mydata?.username}
    </div>

    <span>
      <div>{mydata?.posts?.length}</div>
      <div>Posts</div>
    </span>

    <span>
      <div>{mydata?.followers.length}</div>
      <div>Followers</div>
    </span>
     
     <span>
      <div>{mydata?.followings.length}</div>
      <div>Following</div>
     </span>
     </div>
     <div>
      <span><button onClick={()=>setTab("Posts")}>Posts</button></span>
      <span><button onClick={()=>setTab("Communities")}>Communities</button></span>
      <span><button onClick={()=>setTab("Subscriptions")}>Subscriptions</button></span>
      
      {
        tab === "Posts" && 
       mypost.map(post => (
  <PostCard
    key={post.id}
    post={post}
    onLike={likeSubmit}
    onComment={() => {}}
  />
))

      }

      {
        tab === "Communities" && 
        <div>
          <div><Link href={`/createcommunity`}> <button>Create Comminity</button> </Link></div>
          <div>
            {mycommunities.map(community =>
              <div key={community.id}>
                
                <Link href={`/community/${community.id}`}><div>{community.name} by {community.owner.username} </div></Link>
              </div>
            )}
          </div>
       
        </div>
      }







     </div>

    </>
  )





}

