-- AlterTable
ALTER TABLE "evaluations" ADD COLUMN     "aggregated_data" JSONB,
ALTER COLUMN "evaluator_name" DROP NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'DOCUMENT';

-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN     "compliance_checklist" JSONB,
ADD COLUMN     "signature_data" TEXT;

-- CreateTable
CREATE TABLE "document_sections" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "embedding" vector(768),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_sections_created_at_idx" ON "document_sections"("created_at");
