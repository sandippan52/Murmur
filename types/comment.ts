

export interface Comment{
    id : number,
    content : string,
    parentCommentId : number | null,
    postId : string,
    repliesCount : number,
    
    user: {
        id : string,
        username : string
    },
    replies : Comment[],
    likesCount : number

}