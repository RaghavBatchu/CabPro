import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    uniqueIndex
} from "drizzle-orm/pg-core";
import rides from "./ride.model.js";
import users from "./user.model.js";

const rideRequests = pgTable(
  "ride_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    rideId: uuid("ride_id")
      .references(() => rides.id)
      .notNull(),

    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),

    status: varchar("status", { length: 20 })
      .default("PENDING"), // PENDING | ACCEPTED | REJECTED | CANCELLED

    completionStatus: varchar("completion_status", { length: 30 })
      .default("PENDING"), 
      // PENDING | COMPLETED | COMPLETED_SAFELY | ISSUE_REPORTED

    issueDescription: varchar("issue_description", { length: 500 }),

    requestedAt: timestamp("requested_at").defaultNow(),
    respondedAt: timestamp("responded_at"),
  },
  (table) => ({
    uniqueRequestPerRide: uniqueIndex("unique_request_per_ride")
      .on(table.rideId, table.userId),
  })
);


export default rideRequests;
