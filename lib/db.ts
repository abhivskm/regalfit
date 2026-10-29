import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/** Postgres (Neon) for tracking and enquiries. Tables are created by scripts/db-setup.mjs. */
let client: NeonQueryFunction<false, false> | null = null;

export const dbConfigured = () => Boolean(process.env.DATABASE_URL);

export function sql(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set.");
  client ??= neon(process.env.DATABASE_URL);
  return client;
}
