import type { Metadata } from "next";
import { AuthGuard } from "@/components/dashboard/AuthGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: {
    default: "Driver Dashboard | FIKI Transit",
    template: "%s | FIKI Transit",
  },
  description:
    "Manage daily rides, schedules, and driver activity from the FIKI Transit driver portal.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
