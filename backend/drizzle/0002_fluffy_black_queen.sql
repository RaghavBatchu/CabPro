ALTER TABLE "rides" ALTER COLUMN "origin" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "rides" ALTER COLUMN "base_price" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "time_minutes" integer;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "estimated_duration_min" integer;--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "time_minuters";--> statement-breakpoint
ALTER TABLE "rides" DROP COLUMN "estimated_minutes";