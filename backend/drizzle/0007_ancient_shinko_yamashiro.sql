CREATE TABLE "ride_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ride_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" varchar(500),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ride_reviews" ADD CONSTRAINT "ride_reviews_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride_reviews" ADD CONSTRAINT "ride_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_ride_review_per_user" ON "ride_reviews" USING btree ("ride_id","reviewer_id");