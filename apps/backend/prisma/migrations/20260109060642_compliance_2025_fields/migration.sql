-- CreateEnum
CREATE TYPE "HiringWorkflowStatus" AS ENUM ('DRAFT', 'PLAN_APPROVED', 'PUBLISHED', 'RECEIVING', 'SCREENING', 'INTERVIEW', 'DEMONSTRATION', 'FINALIZING', 'CONTRACTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "HiringReason" AS ENUM ('LEAVE', 'SICK_LEAVE', 'MATERNITY', 'DISPATCH', 'STUDY', 'VACANCY', 'SEASONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "EvaluationType" AS ENUM ('DOCUMENT', 'INTERVIEW', 'DEMONSTRATION');

-- AlterTable
ALTER TABLE "job_listings" ADD COLUMN     "contract_end_date" TIMESTAMP(3),
ADD COLUMN     "contract_start_date" TIMESTAMP(3),
ADD COLUMN     "draft_document_number" TEXT,
ADD COLUMN     "hiring_reason" "HiringReason",
ADD COLUMN     "original_teacher_name" TEXT,
ADD COLUMN     "salary_step_limit" INTEGER DEFAULT 14,
ADD COLUMN     "workflow_status" "HiringWorkflowStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "evaluations" (
    "id" SERIAL NOT NULL,
    "job_listing_id" INTEGER NOT NULL,
    "application_id" INTEGER NOT NULL,
    "evaluator_name" TEXT NOT NULL,
    "evaluator_role" TEXT,
    "type" "EvaluationType" NOT NULL,
    "total_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "criteria_scores" JSONB,
    "comment" TEXT,
    "merit_bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evaluations_job_listing_id_idx" ON "evaluations"("job_listing_id");

-- CreateIndex
CREATE INDEX "evaluations_application_id_idx" ON "evaluations"("application_id");

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_job_listing_id_fkey" FOREIGN KEY ("job_listing_id") REFERENCES "job_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
