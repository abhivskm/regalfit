"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/admin-auth";
import {
  CONTENT_TAG,
  ContentError,
  readContent,
  storageConfigured,
  validateContent,
  writeContent,
  type SiteContent,
} from "@/lib/content";

export type LoginState = { error?: string };

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || !checkPassword(password)) {
    // Slow down repeated guesses.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "Wrong password. Please try again." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

export type SaveResult = { ok: true; content: SiteContent } | { ok: false; error: string };

/** Validates and stores everything edited in the portal, then refreshes the live site. */
export async function saveContent(input: unknown): Promise<SaveResult> {
  if (!(await isAdmin())) return { ok: false, error: "Your login has expired. Please log in again." };
  if (!storageConfigured()) return { ok: false, error: "Photo storage is not set up yet (BLOB_READ_WRITE_TOKEN is missing)." };

  let content: SiteContent;
  try {
    content = validateContent(input);
  } catch (error) {
    if (error instanceof ContentError) return { ok: false, error: error.message };
    throw error;
  }

  await writeContent(content, await readContent());
  updateTag(CONTENT_TAG);
  return { ok: true, content };
}
