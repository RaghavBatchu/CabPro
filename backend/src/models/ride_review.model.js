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

const rideReviews = pgTable(
    "ride_reviews",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        rideId: uuid("ride_id")
            .references(() => rides.id)
            .notNull(),

        reviewerId: uuid("reviewer_id")
            .references(() => users.id)
            .notNull(),

        rating: integer("rating").notNull(),

        comment: varchar("comment", { length: 500 }),

        createdAt: timestamp("created_at").defaultNow(),
    },
    (table) => ({
        uniqueRideReviewPerUser: uniqueIndex("unique_ride_review_per_user").on(
            table.rideId,
            table.reviewerId
        ),
    })
);

export default rideReviews;
