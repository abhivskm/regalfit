import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin login" };

export default function AdminLoginPage() {
  return (
    <main id="main" className="flex min-h-svh items-center justify-center px-4 py-12">
      <LoginForm />
    </main>
  );
}
