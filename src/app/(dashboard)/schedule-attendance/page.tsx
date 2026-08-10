import type { Metadata } from "next";
import { ScheduleAttendance } from "@/components/dashboard/ScheduleAttendance";

export const metadata: Metadata = { title: "Schedule & Attendance" };

export default function ScheduleAttendancePage() {
  return <ScheduleAttendance />;
}
