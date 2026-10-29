"use server";

import { headers } from "next/headers";
import { saveEnquiry } from "@/lib/analytics";
import { dbConfigured } from "@/lib/db";
import { validateEnquiry, type EnquiryErrors, type EnquiryValues } from "@/lib/enquiry-rules";
import { visitFrom } from "@/lib/visit";

export type EnquiryResult = { ok: true } | { ok: false; errors?: EnquiryErrors; message?: string };

/** Saves a contact-form enquiry so it appears in the admin "Tracking" page. */
export async function submitEnquiry(
  values: EnquiryValues,
  ids: { visitor?: string; session?: string; source?: string },
): Promise<EnquiryResult> {
  const clean: EnquiryValues = {
    name: String(values?.name ?? ""),
    email: String(values?.email ?? ""),
    phone: String(values?.phone ?? ""),
    message: String(values?.message ?? ""),
  };
  const errors = validateEnquiry(clean);
  if (Object.keys(errors).length) return { ok: false, errors };

  if (!dbConfigured()) {
    return { ok: false, message: "Sorry, messages can't be sent right now. Please message us on WhatsApp." };
  }

  // The visit context links the enquiry to its traffic source; bots get no visit (but a real
  // person who blocked storage still has their message saved).
  const visit = visitFrom({ ...ids, isNew: false }, await headers());
  try {
    await saveEnquiry(
      {
        name: clean.name.trim(),
        email: clean.email.trim(),
        phone: clean.phone.trim() || null,
        message: clean.message.trim(),
      },
      visit,
    );
  } catch (error) {
    console.error("Could not save enquiry:", error);
    return { ok: false, message: "Sorry, something went wrong. Please try again or message us on WhatsApp." };
  }
  return { ok: true };
}
