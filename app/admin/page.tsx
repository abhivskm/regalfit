import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminEditor } from "@/components/admin/AdminEditor";
import { isAdmin } from "@/lib/admin-auth";
import { readContent, storageConfigured } from "@/lib/content";

export default function AdminPage() {
  return (
    // Reading the login cookie happens at request time, so it sits inside Suspense (Cache Components).
    <Suspense fallback={<p className="p-10 text-center text-sm text-muted">Loading admin portal…</p>}>
      <AdminGate />
    </Suspense>
  );
}

async function AdminGate() {
  if (!(await isAdmin())) redirect("/admin/login");
  const content = await readContent();
  return <AdminEditor initialContent={content} storageReady={storageConfigured()} />;
}
