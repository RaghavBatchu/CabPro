import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { DB_URI } from "../config/env.js";

if (!DB_URI) {
  throw new Error("Missing DB_URI in environment variables");
}

const pool = new Pool({
  connectionString: DB_URI,
});

export const db = drizzle(pool);
