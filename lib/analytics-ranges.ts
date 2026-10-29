/** Date ranges for the tracking page (kept separate so the browser bundle doesn't pull in the database code). */
export type Range = "today" | "7d" | "30d";

export const RANGES: { value: Range; label: string; days: number }[] = [
  { value: "today", label: "Today", days: 1 },
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
];
