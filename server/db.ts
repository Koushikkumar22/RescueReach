import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Make sure DATABASE_URL is defined in Vercel environment variables
const sql = neon(process.env.DATABASE_URL!);

// Export a single instance of drizzle for use across your app
export const db = drizzle(sql);
