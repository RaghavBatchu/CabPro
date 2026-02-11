import { integer, numeric, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

const users = pgTable('users', {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  personalEmail: varchar("personal_email", { length: 150 }).notNull().unique(),
  collegeEmail: varchar("college_email", { length: 150 }).notNull().unique(),
  whatsappNumber: varchar("whatsapp_number", { length: 15 }).notNull().unique(),
  gender: varchar("gender", { length: 10 }).notNull(),

  //reviews
  averageRating: numeric("average_rating").default(0),
  totalReviews: integer("total_reviews").default(0),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),

});

export default users;