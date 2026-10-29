import { isAdmin } from "@/lib/admin-auth";
import { listEnquiries } from "@/lib/analytics";

/** Downloads all enquiries as a CSV file (opens in Excel / Google Sheets). Admins only. */
export async function GET(): Promise<Response> {
  if (!(await isAdmin())) return new Response("Please log in.", { status: 401 });

  const rows = await listEnquiries(5000);
  // Quote every cell; prefix formula-like values so spreadsheets don't execute them.
  const cell = (value: string | null) => {
    const text = (value ?? "").replace(/"/g, '""');
    return `"${/^[=+\-@]/.test(text) ? `'${text}` : text}"`;
  };
  const lines = [
    ["Date (IST)", "Name", "Email", "Phone", "Message", "Status", "Came from"].map(cell).join(","),
    ...rows.map((r) =>
      [
        new Date(r.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        r.name,
        r.email,
        r.phone,
        r.message,
        r.status,
        r.source,
      ]
        .map(cell)
        .join(","),
    ),
  ];

  // The BOM makes Excel read the file as UTF-8 (₹, Hindi names, etc.).
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="regalfit-enquiries.csv"`,
      "cache-control": "no-store",
    },
  });
}
