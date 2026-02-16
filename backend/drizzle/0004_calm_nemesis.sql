ALTER TABLE "ride_requests" ADD COLUMN "completion_status" varchar(30) DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "ride_requests" ADD COLUMN "issue_description" varchar(500);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_request_per_ride" ON "ride_requests" USING btree ("ride_id","user_id");