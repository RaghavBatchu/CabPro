import { config } from 'dotenv';

const NODE_ENV = process.env.NODE_ENV || 'development';

// Try .env.{NODE_ENV}.local first (local dev convention), then .env.{NODE_ENV} (Docker/CI convention)
// If neither file exists, env vars are already injected by the runtime (docker-compose env_file, etc.)
config({ path: `.env.${NODE_ENV}.local` });
config({ path: `.env.${NODE_ENV}` });

export const DB_URI = process.env.DATABASE_URL;
