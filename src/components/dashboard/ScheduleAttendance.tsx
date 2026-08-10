"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Info,
  Play,
  Square,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShiftForm } from "@/components/dashboard/ShiftForm";
import { cn } from "@/lib/utils";

const upcoming = [
  ["MON", "28"],
  ["TUE", "29"],
  ["WED", "30"],
  ["THU", "31"],
  ["FRI", "1"],
];

const week = [
  ["Monday", "Jul 21", "07:00 AM – 03:00 PM", "8h", "Present", "Approved"],
  ["Tuesday", "Jul 22", "07:00 AM – 03:00 PM", "8h", "Present", "Approved"],
  ["Wednesday", "Jul 23", "07:00 AM – 03:00 PM", "8h", "Present", "Approved"],
  ["Thursday", "Jul 24", "07:00 AM – 03:00 PM", "8h", "Present", "Approved"],
  ["Friday", "Jul 25", "07:00 AM – 03:00 PM", "8h", "Present", "Approved"],
  ["Saturday", "Jul 26", "08:00 AM – 04:00 PM", "8h", "Present", "Approved"],
  ["Sunday", "Jul 27", "08:00 AM – 04:00 PM", "—", "In Progress", "Pending"],
];

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
            ["Scheduled Start", "08:00 AM", "blue"],
            ["Scheduled End", "04:00 PM", "amber"],
            ["Scheduled Hours", "8 hours", "green"],
            ["Status", "In Progress", "green"],
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
                    "inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700",
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
            <button
              type="button"
              onClick={() => setShiftModal("start")}
              className="flex min-h-28 flex-col items-center justify-center rounded-xl bg-emerald-100 p-3 text-center text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-200"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-emerald-500 text-white">
                <Play className="size-5 fill-current" />
              </span>
              <span className="mt-3">START SHIFT</span>
            </button>
            <button
              type="button"
              onClick={() => setShiftModal("end")}
              className="flex min-h-28 flex-col items-center justify-center rounded-xl bg-red-100 p-3 text-center text-xs font-bold text-red-600 transition-colors hover:bg-red-200"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-red-500 text-white">
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
              ["Started", "08:03 AM"],
              ["Ended", "04:07 PM"],
              ["Total Hours", "8h 04m"],
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
            {upcoming.map(([day, date]) => (
              <div
                key={day}
                className="flex items-center rounded-xl border border-border bg-muted/60 px-4 py-3"
              >
                <span className="w-12 border-r border-border text-center">
                  <small className="block text-[0.6rem] font-bold text-muted-foreground">
                    {day}
                  </small>
                  <strong className="text-sm">{date}</strong>
                </span>
                <span className="ml-4 text-xs text-muted-foreground">
                  07:00 AM – 03:00 PM
                </span>
                <span className="ml-auto rounded-full bg-blue-100 px-3 py-1 text-[0.68rem] font-semibold text-blue-600">
                  Scheduled
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold">Today&apos;s Trip Summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ["6", "Total Trips", "blue"],
              ["4", "Completed", "green"],
              ["1", "In Progress", "amber"],
              ["1", "Remaining", "violet"],
            ].map(([value, label, tone]) => (
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
          <table className="w-full min-w-[48rem] text-left text-xs">
            <thead className="bg-muted text-[0.65rem] uppercase text-muted-foreground">
              <tr>
                {[
                  "Day",
                  "Date",
                  "Schedule",
                  "Hours",
                  "Attendance",
                  "Status",
                ].map((head) => (
                  <th key={head} className="px-4 py-3 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {week.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td
                      key={cell}
                      className={cn(
                        "px-4 py-3",
                        index === 0 || index === 3
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground",
                        index === 4 &&
                          (row[0] === "Sunday"
                            ? "text-amber-500"
                            : "text-emerald-600"),
                      )}
                    >
                      {index === 4 && (
                        <CheckCircle2 className="mr-1.5 inline size-3.5" />
                      )}
                      {index === 5 ? (
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 font-semibold",
                            cell === "Pending"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-emerald-100 text-emerald-700",
                          )}
                        >
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-700">
        <Info className="size-4 shrink-0" />
        <div>
          <h2 className="text-xs font-semibold">Shift Reminders</h2>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-blue-600">
            <li>
              Always start your shift before beginning your first trip of the
              day.
            </li>
            <li>End your shift after completing your last assigned trip.</li>
            <li>
              Failure to clock out will trigger an automatic logout after 30
              minutes of inactivity.
            </li>
          </ul>
        </div>
      </aside>
      {shiftModal && (
        <ShiftForm mode={shiftModal} onClose={() => setShiftModal(null)} />
      )}
    </section>
  );
}
