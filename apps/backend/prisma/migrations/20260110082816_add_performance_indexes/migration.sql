-- CreateIndex
CREATE INDEX "job_listings_active_status_idx" ON "job_listings"("active", "status");

-- CreateIndex
CREATE INDEX "job_listings_job_type_idx" ON "job_listings"("job_type");

-- CreateIndex
CREATE INDEX "school_profiles_school_name_idx" ON "school_profiles"("school_name");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");
