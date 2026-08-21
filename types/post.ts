export interface Post {
    id:string

    title:string

    body:string|null

    likesCount:number

    commentsCount:number

    isLiked:boolean

    postType: "IMAGE" | "VIDEO" | "AUDIO";

    author:{
        id:string
        username:string
        avatarSeed:string,
        avatarUrl : string
    }

    community:{
        id:string
        name:string
    } | null

    postmedia:{
        fileUrl:string
    }[]
}