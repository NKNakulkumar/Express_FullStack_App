// config/db.js
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

// Create a connection pool using the URL from environment variables
const poolConnection = mysql.createPool(process.env.DATABASE_URL);

// Pass the pool to drizzle
export const db = drizzle(poolConnection);
