-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "job_id" INTEGER,
    "rating" INTEGER,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_keywords" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,

    CONSTRAINT "review_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReviewToReviewKeyword" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "reviews_receiver_id_idx" ON "reviews"("receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_keywords_keyword_key" ON "review_keywords"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "_ReviewToReviewKeyword_AB_unique" ON "_ReviewToReviewKeyword"("A", "B");

-- CreateIndex
CREATE INDEX "_ReviewToReviewKeyword_B_index" ON "_ReviewToReviewKeyword"("B");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReviewToReviewKeyword" ADD CONSTRAINT "_ReviewToReviewKeyword_A_fkey" FOREIGN KEY ("A") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReviewToReviewKeyword" ADD CONSTRAINT "_ReviewToReviewKeyword_B_fkey" FOREIGN KEY ("B") REFERENCES "review_keywords"("id") ON DELETE CASCADE ON UPDATE CASCADE;
