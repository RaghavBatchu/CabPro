import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: uuid("id").primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  personalEmail: varchar("personal_email", { length: 150 }).notNull().unique(),
  collegeEmail: varchar("college_email", { length: 150 }).notNull().unique(),
  whatsappNumber: varchar("whatsapp_number", { length: 15 }).notNull().unique(),
  gender: varchar("gender", { length: 10 }).notNull(),

  //reviews
  averageRating: integer("average_rating").default(0),
  totalReviews: integer("total_reviews").default(0),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),

});