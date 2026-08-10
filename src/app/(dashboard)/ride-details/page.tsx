import type { Metadata } from "next";
import { RideDetailsOverview } from "@/components/dashboard/RideDetailsOverview";

export const metadata: Metadata = {
  title: "Ride Details",
};

export default function RideDetailsPage() {
  return <RideDetailsOverview />;
}
