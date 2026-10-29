"use server";

import { isAdmin } from "@/lib/admin-auth";
import { ENQUIRY_STATUSES, getLiveData, updateEnquiryStatus, type EnquiryStatus, type LiveData } from "@/lib/analytics";

/** Polled by the tracking page every few seconds. */
export async function fetchLiveData(): Promise<LiveData | null> {
  if (!(await isAdmin())) return null;
  return getLiveData();
}

export async function setEnquiryStatus(id: number, status: EnquiryStatus): Promise<{ ok: boolean }> {
  if (!(await isAdmin())) return { ok: false };
  if (!Number.isInteger(id) || !ENQUIRY_STATUSES.includes(status)) return { ok: false };
  await updateEnquiryStatus(id, status);
  return { ok: true };
}
