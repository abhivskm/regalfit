import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

/**
 * Single-password admin login.
 * The session cookie holds an expiry time signed with ADMIN_SESSION_SECRET + ADMIN_PASSWORD,
 * so changing either value logs every device out.
 */
const COOKIE = "rf_admin";
const SESSION_DAYS = 7;

function signingKey(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const password = process.env.ADMIN_PASSWORD;
  if (!secret || secret.length < 32 || !password) {
    throw new Error("Admin login is not configured: set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.");
  }
  return `${secret}:${password}`;
}

const sign = (value: string) => createHmac("sha256", signingKey()).update(value).digest("base64url");

/** Constant-time comparison of two strings of any length. */
function safeEqual(a: string, b: string): boolean {
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(a), hash(b));
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(input, expected!);
}

export async function startSession(): Promise<void> {
  const expires = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  // Login state is per request: never part of a prerendered page (it also reads the clock).
  await connection();
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !(Number(expires) > Date.now())) return false;
  return safeEqual(signature, sign(expires));
}
