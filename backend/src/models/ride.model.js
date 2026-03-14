import {
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import users from "./user.model.js";

const rides = pgTable("rides", {
  id: uuid("id").defaultRandom().primaryKey(),

  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),

  // CAR | BIKE | AUTO | TEMPO
  rideType: varchar("ride_type", { length: 20 }).notNull(),

  origin: varchar("origin", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),

  rideDate: timestamp("ride_date").notNull(),
  rideTime: varchar("ride_time", { length: 10 }).notNull(),

  // system derived later
  timeMinutes: integer("time_minutes"),

  totalSeats: integer("total_seats").notNull(),
  availableSeats: integer("available_seats").notNull(),

  // Pricing
  pricingType: varchar("pricing_type", { length: 20 }).notNull(),
  pricePerHead: numeric("price_per_head"),
  basePrice: numeric("base_price"), // nullable ✅
  pricePerKm: numeric("price_per_km"),

  estimatedDistanceKm: numeric("estimated_distance_km"),
  estimatedDurationMin: integer("estimated_duration_min"),

  genderPreference: varchar("gender_preference", { length: 20 })
    .default("ALL"),

  status: varchar("status", { length: 20 })
    .default("OPEN"),

  cancellationReason: varchar("cancellation_reason", { length: 255 }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export default rides;
