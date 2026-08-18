
import { Comment } from "@/types/comment"


export function buildCommentTree(comments: Comment[]) {

    const map = new Map<number, Comment>();

    comments.forEach(comment => {

        comment.replies = [];

        map.set(comment.id, comment);

    });

    const roots: Comment[] = [];

    comments.forEach(comment => {

        if (comment.parentCommentId === null) {

            roots.push(comment);

        } else {

            map.get(comment.parentCommentId)?.replies.push(comment);

        }

    });

    return roots;

}