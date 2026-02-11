import {
  pgTable,
  uuid,
  integer,
  varchar,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core";

import users from "./user.model.js";
import rides from "./ride.model.js";

const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    rideId: uuid("ride_id")
      .references(() => rides.id)
      .notNull(),

    reviewerId: uuid("reviewer_id")
      .references(() => users.id)
      .notNull(),

    reviewedUserId: uuid("reviewed_user_id")
      .references(() => users.id)
      .notNull(),

    rating: integer("rating").notNull(),

    comment: varchar("comment", { length: 500 }),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    uniqueReviewPerRide: uniqueIndex("unique_review_per_ride").on(
      table.rideId,
      table.reviewerId,
      table.reviewedUserId
    ),
  })
);

export default reviews;
