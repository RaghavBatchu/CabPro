import {
    pgTable,
    uuid,
    varchar,
    timestamp
} from "drizzle-orm/pg-core";
import rides from "./ride.model.js";
import users from "./user.model.js";

const rideRequests = pgTable("ride_requests", {
    id: uuid("id").defaultRandom().primaryKey(),

    rideId: uuid("ride_id")
        .references(() => rides.id)
        .notNull(),

    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),

    status: varchar("status", { length: 20 })
        .default("PENDING"), // PENDING | ACCEPTED | REJECTED | CANCELLED

    requestedAt: timestamp("requested_at").defaultNow(),
    respondedAt: timestamp("responded_at"),
});

export default rideRequests;
