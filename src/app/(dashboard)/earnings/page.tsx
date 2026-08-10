import type { Metadata } from "next";
import { EarningsOverview } from "@/components/dashboard/EarningsOverview";

export const metadata: Metadata = { title: "My Earnings" };

export default function EarningsPage() {
  return <EarningsOverview />;
}
