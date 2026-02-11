CREATE TABLE "rides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid NOT NULL,
	"ride_type" varchar(20) NOT NULL,
	"origin" varchar NOT NULL,
	"destination" varchar(255) NOT NULL,
	"ride_date" timestamp NOT NULL,
	"ride_time" varchar(10) NOT NULL,
	"time_minuters" integer,
	"total_seats" integer NOT NULL,
	"available_seats" integer NOT NULL,
	"pricing_type" varchar(20) NOT NULL,
	"price_per_head" numeric,
	"base_price" numeric NOT NULL,
	"price_per_km" numeric,
	"estimated_distance_km" numeric,
	"estimated_minutes" integer,
	"gender_preference" varchar(20) DEFAULT 'ALL',
	"status" varchar(20) DEFAULT 'OPEN',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;