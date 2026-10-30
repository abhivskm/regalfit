"use server";

import { isAdmin } from "@/lib/admin-auth";
import { ENQUIRY_STATUSES, updateEnquiryStatus, type EnquiryStatus } from "@/lib/analytics";

export async function setEnquiryStatus(id: number, status: EnquiryStatus): Promise<{ ok: boolean }> {
  if (!(await isAdmin())) return { ok: false };
  if (!Number.isInteger(id) || !ENQUIRY_STATUSES.includes(status)) return { ok: false };
  await updateEnquiryStatus(id, status);
  return { ok: true };
}
