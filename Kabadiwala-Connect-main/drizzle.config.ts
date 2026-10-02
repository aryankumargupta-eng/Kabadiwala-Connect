import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL || "file:./data/kabadiwala.db";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle-sqlite",
  dialect: "sqlite",
  dbCredentials: {
    url: connectionString.replace(/^file:/, ""),
  },
});
