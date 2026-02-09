import { DB_URI } from "./src/config/env.js";

export default {
    schema: "./src/models/*.js",
    dialect: "postgresql",
    out: "./drizzle",
    dbCredentials: {
        url: DB_URI,
    },
};  