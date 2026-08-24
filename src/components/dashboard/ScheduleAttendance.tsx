"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Pause,
  Play,
  Square,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShiftForm } from "@/components/dashboard/ShiftForm";
import { getDriverSession } from "@/lib/auth";
import { getScheduleSummaryApi, getTodayShiftApi } from "@/lib/api";
import { cn } from "@/lib/utils";

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-[0_8px_28px_rgba(8,37,82,0.05)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function ScheduleAttendance() {
  const [shiftModal, setShiftModal] = useState<"start" | "end" | null>(null);
  const [shift, setShift] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<{
    tripSummary: { totalTrips: number; completed: number; inProgress: number; remaining: number };
    upcomingSchedule: Array<{ day: string; date: string; hours: string; status: string }>;
    weeklySchedule: Array<{ day: string; date: string; shiftHours: string; total: string; attendance: string; approval: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchShiftStatus = async () => {
    const session = getDriverSession();
    const token = session?.token;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await getScheduleSummaryApi(token);
      if (res.success && res.data) {
        setShift(res.data.todayShift);
        setSummaryData(res.data);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftStatus();
  }, []);

  useEffect(() => {
    if (!shiftModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShiftModal(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [shiftModal]);

  const isInProgress = shift?.status === "IN_PROGRESS";
  const isCompleted = shift?.status === "COMPLETED";

  // Format Started time
  const startedDisplay = shift?.startedAt
    ? new Date(shift.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  // Format Ended time
  const endedDisplay = isCompleted && shift?.endedAt
    ? new Date(shift.endedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : isInProgress
      ? "In Progress"
      : "—";

  // Calculate live or recorded total hours
  let totalHoursDisplay = "—";
  if (isCompleted && shift?.totalHoursText) {
    totalHoursDisplay = shift.totalHoursText;
  } else if (isInProgress && shift?.startedAt) {
    const diffMs = new Date().getTime() - new Date(shift.startedAt).getTime();
    const totalMinutes = Math.max(1, Math.round(diffMs / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    totalHoursDisplay = `${hours}h ${mins < 10 ? "0" : ""}${mins}m`;
  }

  // Today's schedule status badge
  const scheduleStatusText = isInProgress
    ? "In Progress"
    : isCompleted
      ? "Completed"
      : "Scheduled";

  const upcomingList = summaryData?.upcomingSchedule || [
    { day: "MON", date: "28", hours: "07:00 AM – 03:00 PM", status: "Scheduled" },
    { day: "TUE", date: "29", hours: "07:00 AM – 03:00 PM", status: "Scheduled" },
    { day: "WED", date: "30", hours: "07:00 AM – 03:00 PM", status: "Scheduled" },
    { day: "THU", date: "31", hours: "07:00 AM – 03:00 PM", status: "Scheduled" },
    { day: "FRI", date: "1", hours: "07:00 AM – 03:00 PM", status: "Scheduled" },
  ];

  const tripSummaryItems = [
    [String(summaryData?.tripSummary?.totalTrips ?? 0), "Total Trips", "blue"],
    [String(summaryData?.tripSummary?.completed ?? 0), "Completed", "green"],
    [String(summaryData?.tripSummary?.inProgress ?? 0), "In Progress", "amber"],
    [String(summaryData?.tripSummary?.remaining ?? 0), "Remaining", "violet"],
  ];

  const weeklyList = summaryData?.weeklySchedule || [
    { day: "Monday", date: "Jul 21", shiftHours: "07:00 AM – 03:00 PM", total: "8h", attendance: "Present", approval: "Approved" },
    { day: "Tuesday", date: "Jul 22", shiftHours: "07:00 AM – 03:00 PM", total: "8h", attendance: "Present", approval: "Approved" },
    { day: "Wednesday", date: "Jul 23", shiftHours: "07:00 AM – 03:00 PM", total: "8h", attendance: "Present", approval: "Approved" },
    { day: "Thursday", date: "Jul 24", shiftHours: "07:00 AM – 03:00 PM", total: "8h", attendance: "Present", approval: "Approved" },
    { day: "Friday", date: "Jul 25", shiftHours: "07:00 AM – 03:00 PM", total: "8h", attendance: "Present", approval: "Approved" },
    { day: "Saturday", date: "Jul 26", shiftHours: "08:00 AM – 04:00 PM", total: "8h", attendance: "Present", approval: "Approved" },
    { day: "Sunday", date: "Jul 27", shiftHours: "08:00 AM – 04:00 PM", total: "—", attendance: isInProgress ? "In Progress" : "Pending", approval: "Pending" },
  ];

  const todayStartDisplay = (summaryData as any)?.todaySchedule?.startTime || "08:00 AM";
  const todayEndDisplay = (summaryData as any)?.todaySchedule?.endTime || "04:00 PM";
  const todayHoursDisplay = (summaryData as any)?.todaySchedule?.hours || "8 hours";

  return (
    <section aria-labelledby="schedule-page-title" className="space-y-5">
      <div className="sr-only">
        <h1 id="schedule-page-title">My Schedule & Attendance</h1>
        <p>Track your shifts and view your upcoming schedule.</p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold">Today&apos;s Schedule</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Scheduled Start", todayStartDisplay, "blue"],
            ["Scheduled End", todayEndDisplay, "amber"],
            ["Scheduled Hours", todayHoursDisplay, "green"],
            ["Status", scheduleStatusText, "green"],
          ].map(([label, value, tone]) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-muted/70 p-4"
            >
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3
                  className={cn(
                    "size-4",
                    tone === "amber"
                      ? "text-amber-500"
                      : tone === "green"
                        ? "text-emerald-500"
                        : "text-blue-600",
                  )}
                />
                {label}
              </dt>
              <dd
                className={cn(
                  "mt-3 text-lg font-bold text-foreground",
                  label === "Status" &&
                    "inline-block rounded-full px-3 py-1 text-xs font-semibold",
                  label === "Status" &&
                    (isInProgress
                      ? "bg-amber-100 text-amber-700"
                      : isCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"),
                )}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold">Attendance Actions</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {isInProgress ? (
              <button
                type="button"
                onClick={() => setShiftModal("start")}
                className="flex min-h-28 flex-col items-center justify-center rounded-xl bg-amber-100 p-3 text-center text-xs font-bold text-amber-700 transition-colors hover:bg-amber-200"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-amber-500 text-white">
                  <Pause className="size-5 fill-current" />
                </span>
                <span className="mt-3">IN PROGRESS</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShiftModal("start")}
                disabled={isCompleted}
                className={cn(
                  "flex min-h-28 flex-col items-center justify-center rounded-xl p-3 text-center text-xs font-bold transition-colors",
                  isCompleted
                    ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
                )}
              >
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-xl text-white",
                    isCompleted ? "bg-muted-foreground" : "bg-emerald-500",
                  )}
                >
                  <Play className="size-5 fill-current" />
                </span>
                <span className="mt-3">{isCompleted ? "SHIFT COMPLETED" : "START SHIFT"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShiftModal("end")}
              disabled={!isInProgress}
              className={cn(
                "flex min-h-28 flex-col items-center justify-center rounded-xl p-3 text-center text-xs font-bold transition-colors",
                isInProgress
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed",
              )}
            >
              <span
                className={cn(
                  "grid size-12 place-items-center rounded-xl text-white",
                  isInProgress ? "bg-red-500" : "bg-muted-foreground",
                )}
              >
                <Square className="size-4 fill-current" />
              </span>
              <span className="mt-3">END SHIFT</span>
            </button>

            <div className="flex min-h-28 flex-col items-center justify-center rounded-xl border border-border bg-muted p-3 text-center text-xs font-bold text-muted-foreground">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-soft/50">
                <Clock3 className="size-5" />
              </span>
              <span className="mt-3">SHIFT STATUS</span>
            </div>
          </div>
          <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
            Always clock in before your first trip and clock out after your last
            trip of the day.
          </p>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold">
            Today&apos;s Attendance Status
          </h2>
          <dl className="mt-4 space-y-3">
            {[
              ["Started", startedDisplay],
              ["Ended", endedDisplay],
              ["Total Hours", totalHoursDisplay],
            ].map(([label, value], index) => (
              <div
                key={label}
                className="flex items-center rounded-xl border border-border bg-muted/70 p-4"
              >
                <span
                  className={cn(
                    "mr-3 grid size-8 place-items-center rounded-lg",
                    index === 2
                      ? "bg-blue-100 text-blue-600"
                      : "bg-emerald-100 text-emerald-600",
                  )}
                >
                  {index === 2 ? (
                    <Clock3 className="size-4" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                </span>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd
                  className={cn(
                    "ml-auto text-sm font-bold",
                    index === 2 ? "text-blue-600" : "text-emerald-600",
                  )}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold">Upcoming Schedule</h2>
          <div className="mt-4 space-y-2">
            {upcomingList.map((item, idx) => (
              <div
                key={item.day + idx}
                className="flex items-center rounded-xl border border-border bg-muted/60 px-4 py-3"
              >
                <span className="w-12 border-r border-border text-center">
                  <small className="block text-[0.6rem] font-bold text-muted-foreground">
                    {item.day}
                  </small>
                  <strong className="text-sm">{item.date}</strong>
                </span>
                <span className="ml-4 text-xs text-muted-foreground">
                  {item.hours}
                </span>
                <span className="ml-auto rounded-full bg-blue-100 px-3 py-1 text-[0.68rem] font-semibold text-blue-600">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold">Today&apos;s Trip Summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {tripSummaryItems.map(([value, label, tone]) => (
              <div
                key={label}
                className={cn(
                  "rounded-xl border p-4 text-center",
                  tone === "green"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-500"
                    : tone === "amber"
                      ? "border-amber-200 bg-amber-50 text-amber-500"
                      : tone === "violet"
                        ? "border-violet-200 bg-violet-50 text-violet-500"
                        : "border-blue-200 bg-blue-50 text-blue-600",
                )}
              >
                <strong className="text-2xl">{value}</strong>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/ride-details"
            className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-border text-xs font-semibold text-blue-600 hover:bg-muted"
          >
            View Today&apos;s Trips <ArrowRight className="size-3.5" />
          </Link>
        </Card>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <h2 className="px-5 py-4 text-sm font-semibold">Weekly Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-y border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Day</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Shift Hours</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Attendance</th>
                <th className="px-5 py-3 font-semibold">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {weeklyList.map((row, idx) => (
                <tr key={row.day + idx} className="hover:bg-muted/40">
                  <td className="px-5 py-3.5 font-bold text-foreground">{row.day}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.date}</td>
                  <td className="px-5 py-3.5 text-foreground">{row.shiftHours}</td>
                  <td className="px-5 py-3.5 text-foreground">{row.total}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold",
                        row.attendance === "Present"
                          ? "bg-emerald-100 text-emerald-700"
                          : row.attendance === "In Progress"
                            ? "bg-amber-100 text-amber-700"
                            : row.attendance === "Off"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-blue-100 text-blue-700",
                      )}
                    >
                      {row.attendance}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold",
                        row.approval === "Approved"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {row.approval}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {shiftModal && (
        <ShiftForm
          mode={shiftModal}
          startOdometerVal={shift?.startingOdometer}
          onClose={() => setShiftModal(null)}
          onSuccess={fetchShiftStatus}
        />
      )}
    </section>
  );
}
