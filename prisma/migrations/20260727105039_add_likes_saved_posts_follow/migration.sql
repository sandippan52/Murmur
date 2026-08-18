-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "postmedia" DROP CONSTRAINT "postmedia_postId_fkey";

-- CreateTable
CREATE TABLE "postlikes" (
    "id" SERIAL NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postlikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commentlikes" (
    "id" SERIAL NOT NULL,
    "commentId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commentlikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savedposts" (
    "id" SERIAL NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savedposts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "postlikes_postId_idx" ON "postlikes"("postId");

-- CreateIndex
CREATE INDEX "postlikes_userId_idx" ON "postlikes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "postlikes_postId_userId_key" ON "postlikes"("postId", "userId");

-- CreateIndex
CREATE INDEX "commentlikes_commentId_idx" ON "commentlikes"("commentId");

-- CreateIndex
CREATE INDEX "commentlikes_userId_idx" ON "commentlikes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "commentlikes_userId_commentId_key" ON "commentlikes"("userId", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "savedposts_postId_userId_key" ON "savedposts"("postId", "userId");

-- AddForeignKey
ALTER TABLE "postmedia" ADD CONSTRAINT "postmedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postlikes" ADD CONSTRAINT "postlikes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postlikes" ADD CONSTRAINT "postlikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentlikes" ADD CONSTRAINT "commentlikes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentlikes" ADD CONSTRAINT "commentlikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savedposts" ADD CONSTRAINT "savedposts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savedposts" ADD CONSTRAINT "savedposts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
