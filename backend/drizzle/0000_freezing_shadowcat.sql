CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"personal_email" varchar(150) NOT NULL,
	"college_email" varchar(150) NOT NULL,
	"whatsapp_number" varchar(15) NOT NULL,
	"gender" varchar(10) NOT NULL,
	"average_rating" integer DEFAULT 0,
	"total_reviews" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_personal_email_unique" UNIQUE("personal_email"),
	CONSTRAINT "users_college_email_unique" UNIQUE("college_email"),
	CONSTRAINT "users_whatsapp_number_unique" UNIQUE("whatsapp_number")
);
