import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { DB_URI } from "../src/config/env.js";

if (!DB_URI) {
    throw new Error("Missing DB_URI in environment variables");
}

const pool = new Pool({
    connectionString: DB_URI,
});

export const db = drizzle(pool);

const connectDB = async () => {
    try {
        await pool.query("SELECT 1");
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;
