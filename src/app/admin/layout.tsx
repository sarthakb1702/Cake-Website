import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin/AdminGuard";

export const metadata: Metadata = {
  title: "Admin Dashboard — Shreya's Home Bakery",
  description: "Administrative control panel for managing products, variations, orders, and subscribers.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-cream text-chocolate flex flex-col font-sans">
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
          <p>© 2026 Shreya&apos;s Home Bakery Administration System. Secured Access Only.</p>
        </footer>
      </div>
    </AdminGuard>
  );
}

