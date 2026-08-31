"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
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

interface ScheduleCheck {
  isWorkingDay: boolean;
  startTime: string;
  endTime: string;
  allowStart: boolean;
  reason: string;
  isOneTimeOverride: boolean;
}

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

function ScheduleSkeleton() {
  return (
    <section className="space-y-5 animate-pulse">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="h-4 w-36 rounded bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-muted/70 p-4 space-y-2">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-6 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-muted/60" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="h-4 w-44 rounded bg-muted" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-muted/60" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="h-4 w-36 rounded bg-muted" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-muted/60" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-muted/60" />
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-10 w-full rounded bg-muted/40" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScheduleAttendance() {
  const [shiftModal, setShiftModal] = useState<"start" | "end" | null>(null);
  const [shift, setShift] = useState<any>(null);
  const [scheduleCheck, setScheduleCheck] = useState<ScheduleCheck | null>(null);
  const [summaryData, setSummaryData] = useState<{
    tripSummary: { totalTrips: number; completed: number; inProgress: number; remaining: number };
    upcomingSchedule: Array<{ day: string; date: string; hours: string; status: string }>;
    weeklySchedule: Array<{ day: string; date: string; shiftHours: string; total: string; attendance: string; approval: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        if (res.data.todayScheduleCheck) {
          setScheduleCheck(res.data.todayScheduleCheck as ScheduleCheck);
        }
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

  if (loading) {
    return <ScheduleSkeleton />;
  }

  const upcomingList = summaryData?.upcomingSchedule || [];

  const tripSummaryItems = [
    [String(summaryData?.tripSummary?.totalTrips ?? 0), "Total Trips", "blue"],
    [String(summaryData?.tripSummary?.completed ?? 0), "Completed", "green"],
    [String(summaryData?.tripSummary?.inProgress ?? 0), "In Progress", "amber"],
    [String(summaryData?.tripSummary?.remaining ?? 0), "Remaining", "violet"],
  ];

  const weeklyList = summaryData?.weeklySchedule || [];

  const todayStartDisplay = (summaryData as any)?.todaySchedule?.startTime || "—";
  const todayEndDisplay = (summaryData as any)?.todaySchedule?.endTime || "—";
  const todayHoursDisplay = (summaryData as any)?.todaySchedule?.hours || "—";

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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold">Attendance Actions</h2>
            {currentTime && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-2xs">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span>
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "America/Chicago",
                  })}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="font-mono font-bold text-foreground">
                  {currentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                    timeZone: "America/Chicago",
                  })} CT
                </span>
              </div>
            )}
          </div>
          {/* ── Schedule enforcement banner ── */}
          {scheduleCheck && !scheduleCheck.allowStart && !isInProgress && (
            <div className={cn(
              "mt-3 flex items-start gap-3 rounded-xl border px-4 py-3 text-xs leading-5",
              !scheduleCheck.isWorkingDay
                ? "border-slate-200 bg-slate-50 text-slate-700"
                : "border-amber-300 bg-amber-50 text-amber-800",
            )}>
              <AlertCircle className={cn(
                "mt-0.5 size-4 shrink-0",
                !scheduleCheck.isWorkingDay ? "text-slate-500" : "text-amber-600",
              )} />
              <div>
                <p className="font-semibold">
                  {!scheduleCheck.isWorkingDay
                    ? scheduleCheck.isOneTimeOverride
                      ? "Emergency Override: Day Off"
                      : "Scheduled Day Off"
                    : "Outside Shift Window"}
                </p>
                <p className="mt-0.5 text-muted-foreground">{scheduleCheck.reason}</p>
                {scheduleCheck.isWorkingDay && (
                  <p className="mt-1 font-medium">
                    Your window: {scheduleCheck.startTime} – {scheduleCheck.endTime}
                  </p>
                )}
              </div>
            </div>
          )}

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
                onClick={() => {
                  // Block start if schedule not allowed
                  if (scheduleCheck && !scheduleCheck.allowStart) return;
                  setShiftModal("start");
                }}
                disabled={isCompleted || (scheduleCheck !== null && !scheduleCheck.allowStart)}
                title={scheduleCheck && !scheduleCheck.allowStart ? scheduleCheck.reason : undefined}
                className={cn(
                  "flex min-h-28 flex-col items-center justify-center rounded-xl p-3 text-center text-xs font-bold transition-colors",
                  isCompleted
                    ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                    : scheduleCheck && !scheduleCheck.allowStart
                      ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
                )}
              >
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-xl text-white",
                    isCompleted || (scheduleCheck && !scheduleCheck.allowStart)
                      ? "bg-muted-foreground"
                      : "bg-emerald-500",
                  )}
                >
                  {scheduleCheck && !scheduleCheck.allowStart && !isCompleted
                    ? <LockKeyhole className="size-5" />
                    : <Play className="size-5 fill-current" />
                  }
                </span>
                <span className="mt-3">
                  {isCompleted
                    ? "SHIFT COMPLETED"
                    : scheduleCheck && !scheduleCheck.allowStart
                      ? !scheduleCheck.isWorkingDay ? "DAY OFF" : "LOCKED"
                      : "START SHIFT"}
                </span>
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
              <span className="mt-3">
                {isInProgress ? "IN PROGRESS" : isCompleted ? "COMPLETED" : "SHIFT STATUS"}
              </span>
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
            {upcomingList.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground font-semibold">
                No upcoming scheduled shifts.
              </div>
            ) : (
              upcomingList.map((item, idx) => (
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
              ))
            )}
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
              {weeklyList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground font-semibold">
                    No weekly schedule entries found.
                  </td>
                </tr>
              ) : (
                weeklyList.map((row, idx) => (
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
                ))
              )}
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
