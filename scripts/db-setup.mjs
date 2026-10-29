/**
 * Creates the tracking tables (safe to run again; it only adds what is missing).
 *
 *   node --env-file=.env.local scripts/db-setup.mjs
 *
 * Needs DATABASE_URL (added by the Neon integration; pull it with `vercel env pull`).
 */
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS events (
    id       bigserial PRIMARY KEY,
    ts       timestamptz NOT NULL DEFAULT now(),
    visitor  text NOT NULL,          -- random ID kept in the visitor's browser (no personal data)
    session  text NOT NULL,          -- random ID per browser tab session
    type     text NOT NULL,          -- pageview, product_view, whatsapp, call, category, ...
    item     text,                   -- product / combo / category / slide ID
    label    text,                   -- its name at the time
    source   text,                   -- instagram, google, whatsapp, direct, ...
    device   text,                   -- mobile, tablet, desktop
    city     text,
    region   text,
    country  text,
    is_new   boolean NOT NULL DEFAULT false  -- first ever visit of this visitor (pageviews only)
  )`;
await sql`CREATE INDEX IF NOT EXISTS events_ts_idx ON events (ts DESC)`;
await sql`CREATE INDEX IF NOT EXISTS events_type_ts_idx ON events (type, ts DESC)`;

// Who is on the site right now (updated by a heartbeat; one row per visitor).
await sql`
  CREATE TABLE IF NOT EXISTS presence (
    visitor   text PRIMARY KEY,
    last_seen timestamptz NOT NULL,
    device    text,
    source    text
  )`;

// Daily totals kept forever, after detailed events older than 90 days are removed.
await sql`
  CREATE TABLE IF NOT EXISTS daily_stats (
    day      date NOT NULL,
    type     text NOT NULL,
    item     text NOT NULL DEFAULT '',
    count    integer NOT NULL,
    visitors integer NOT NULL,
    PRIMARY KEY (day, type, item)
  )`;

await sql`
  CREATE TABLE IF NOT EXISTS enquiries (
    id         bigserial PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now(),
    name       text NOT NULL,
    email      text NOT NULL,
    phone      text,
    message    text NOT NULL,
    status     text NOT NULL DEFAULT 'new',   -- new, contacted, done
    source     text,
    visitor    text
  )`;
await sql`CREATE INDEX IF NOT EXISTS enquiries_created_idx ON enquiries (created_at DESC)`;

console.log("Tracking tables are ready.");
