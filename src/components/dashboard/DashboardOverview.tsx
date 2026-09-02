"use client";

import { useEffect, useState } from "react";
import { getDriverTripsApi, updateDriverTripStatusApi } from "@/lib/api";
import {
  Accessibility,
  ArrowRight,
  Bell,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Fuel,
  Gauge,
  type LucideIcon,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  Route,
  ShieldAlert,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { ShiftAlertModal } from "./ShiftAlertModal";
import { cn } from "@/lib/utils";

function formatTimeTo12Hour(timeStr?: string): string {
  if (!timeStr) return "";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

type SummaryTone = "primary" | "secondary" | "success";
type TripStatus = "inProgress" | "scheduled" | "completed" | "missed";

type SummaryItem = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: SummaryTone;
};

type Trip = {
  id: string;
  status: TripStatus;
  rideType: string;
  time: string;
  date?: string;
  passenger: string;
  initials: string;
  mobility: string;
  pickup: string;
  dropoff: string;
  mapsUrl: string;
};

const CENTRAL_TZ = "America/Chicago";

function getCentralTodayDateStr(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CENTRAL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function formatFullCardDate(dateVal?: string | Date) {
  if (!dateVal) {
    const d = new Date();
    const dayName = d.toLocaleDateString("en-US", { weekday: "long", timeZone: CENTRAL_TZ });
    const dayNum = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: CENTRAL_TZ }).format(d);
    const monthName = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: CENTRAL_TZ }).format(d);
    const year = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: CENTRAL_TZ }).format(d);
    return `${dayName} ${dayNum} ${monthName} ${year}`;
  }

  const rawStr = String(dateVal);
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawStr.trim())) {
    const [y, m, d] = rawStr.trim().split("-").map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long", timeZone: CENTRAL_TZ });
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[m - 1];
    return `${dayName} ${d} ${monthName} ${y}`;
  }

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);

  const dayName = d.toLocaleDateString("en-US", { weekday: "long", timeZone: CENTRAL_TZ });
  const dayNum = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: CENTRAL_TZ }).format(d);
  const monthName = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: CENTRAL_TZ }).format(d);
  const year = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: CENTRAL_TZ }).format(d);
  return `${dayName} ${dayNum} ${monthName} ${year}`;
}

function getTripTimestamp(dateVal?: string | Date, timeStr?: string): number {
  if (!dateVal) return 0;

  let dateStr = "";
  const rawStr = String(dateVal).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawStr)) {
    dateStr = rawStr;
  } else {
    const dObj = new Date(dateVal);
    if (!isNaN(dObj.getTime())) {
      dateStr = getCentralTodayDateStr(dObj);
    } else {
      dateStr = getCentralTodayDateStr();
    }
  }

  const [year, month, day] = dateStr.split("-").map(Number);

  let hours = 8;
  let minutes = 0;

  if (timeStr) {
    const trimmedTime = timeStr.trim();
    const ampmMatch = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(trimmedTime);
    if (ampmMatch) {
      let h = parseInt(ampmMatch[1], 10);
      const m = parseInt(ampmMatch[2], 10);
      const period = ampmMatch[3] ? ampmMatch[3].toUpperCase() : null;
      if (period === "PM" && h < 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      hours = h;
      minutes = m;
    }
  }

  const sampleDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const timeZoneName = new Intl.DateTimeFormat("en-US", {
    timeZone: CENTRAL_TZ,
    timeZoneName: "short",
  }).format(sampleDate);
  const offsetHours = timeZoneName.includes("CDT") ? 5 : 6;

  return Date.UTC(year, month - 1, day, hours + offsetHours, minutes, 0, 0);
}

function isTripToday(dateVal?: string | Date): boolean {
  if (!dateVal) return false;
  const todayCentralStr = getCentralTodayDateStr();

  let cardDateStr = "";
  if (typeof dateVal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
    cardDateStr = dateVal.trim();
  } else if (dateVal instanceof Date) {
    cardDateStr = getCentralTodayDateStr(dateVal);
  } else {
    const dObj = new Date(dateVal);
    if (!isNaN(dObj.getTime())) {
      cardDateStr = getCentralTodayDateStr(dObj);
    }
  }

  return todayCentralStr === cardDateStr;
}

function SummaryCardSkeleton() {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-[0_4px_16px_rgba(8,37,82,0.04)] animate-pulse">
      <div className="size-10 shrink-0 rounded-xl bg-muted" />
      <div className="space-y-2 flex-1">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-6 w-12 rounded bg-muted" />
        <div className="h-2.5 w-24 rounded bg-muted" />
      </div>
    </div>
  );
}

function TripCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_20px_rgba(8,37,82,0.05)] animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
        </div>
        <div className="h-4 w-28 rounded bg-muted" />
      </div>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-36 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-2.5 rounded-xl bg-muted/40 p-3.5">
        <div className="h-3.5 w-3/4 rounded bg-muted" />
        <div className="h-3.5 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}

const summaryToneStyles: Record<SummaryTone, string> = {
  primary: "bg-primary/7 text-primary",
  secondary: "bg-secondary/16 text-brand-yellow-hover",
  success: "bg-brand-success/10 text-brand-success",
};

const tripStatusStyles: Record<TripStatus, { label: string; badge: string }> = {
  inProgress: {
    label: "In progress",
    badge: "border-secondary/50 bg-secondary/14 text-secondary-foreground",
  },
  scheduled: {
    label: "Scheduled",
    badge: "border-primary/15 bg-primary/6 text-primary",
  },
  completed: {
    label: "Completed",
    badge: "border-brand-success/20 bg-brand-success/9 text-brand-success",
  },
  missed: {
    label: "Missed",
    badge: "border-red-500/30 bg-red-50 text-red-600 font-bold",
  },
};

function SummaryCard({ item }: { item: SummaryItem }) {
  const Icon = item.icon;
  const tone = summaryToneStyles[item.tone];

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full",
            tone,
          )}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[0.68rem] font-semibold",
            tone,
          )}
        >
          {item.detail}
        </span>
      </div>
      <p className="mt-5 text-2xl font-bold tracking-[-0.04em] text-foreground">
        {item.value}
      </p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">
        {item.label}
      </p>
    </article>
  );
}

function LocationRow({
  address,
  isLast = false,
  label,
}: {
  address: string;
  isLast?: boolean;
  label: string;
}) {
  return (
    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2.5">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "mt-1 size-2.5 rounded-full ring-4",
            label === "Pickup"
              ? "bg-brand-success ring-brand-success/10"
              : "bg-secondary ring-secondary/16",
          )}
        />
        {!isLast && <span className="my-1 w-px flex-1 bg-border" />}
      </div>
      <div className={cn(!isLast && "pb-3")}>
        <p className="text-[0.68rem] font-medium text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-xs leading-5 text-foreground">{address}</p>
      </div>
    </div>
  );
}

function TripCard({ trip, index, isLastItem = false }: { trip: Trip; index: number; isLastItem?: boolean }) {
  const status = tripStatusStyles[trip.status];

  return (
    <div className="relative pl-11 sm:pl-14">
      <div
        className={cn(
          "absolute left-0 top-0 z-10 grid size-9 place-items-center rounded-full border-2 bg-card text-xs font-bold sm:size-10",
          trip.status === "inProgress" &&
          "border-secondary bg-secondary text-secondary-foreground",
          trip.status === "completed" &&
          "border-brand-success bg-brand-success text-white",
          trip.status === "missed" &&
          "border-red-500 bg-red-500 text-white",
          trip.status === "scheduled" && "border-border text-muted-foreground",
        )}
      >
        {index + 1}
      </div>
      {!isLastItem && (
        <div
          className={cn(
            "absolute bottom-[-0.75rem] left-[1.08rem] top-9 w-px sm:left-[1.22rem] sm:top-10",
            trip.status === "completed" ? "bg-brand-success" : "bg-border",
          )}
        />
      )}
      <article
        className={cn(
          "overflow-hidden rounded-2xl border bg-card shadow-[0_6px_20px_rgba(8,37,82,0.05)]",
          trip.status === "inProgress"
            ? "border-l-2 border-l-secondary"
            : trip.status === "completed"
              ? "border-l-2 border-l-brand-success"
              : "border-border",
        )}
      >
        <div className="p-4 sm:p-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-muted px-2 py-1 font-mono text-[0.65rem] font-semibold text-muted-foreground">
                {trip.id}
              </span>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold",
                  status.badge,
                )}
              >
                {status.label}
              </span>
              <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground">
                {trip.rideType}
              </span>
              <span className="ml-auto rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {trip.date}
              </span>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="font-semibold text-foreground">Pickup Time </span>
              <Clock3 aria-hidden="true" className="size-3.5" />
              {trip.time}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary/18 text-xs font-bold text-secondary-foreground">
              {trip.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {trip.passenger}
              </p>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-2 py-0.5 text-[0.68rem] font-medium text-primary">
                <Accessibility aria-hidden="true" className="size-3" />
                {trip.mobility}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-muted p-3.5">
            <LocationRow label="Pickup" address={trip.pickup} />
            <LocationRow label="Drop-off" address={trip.dropoff} isLast />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border bg-card p-3 sm:flex sm:justify-end">
          <Link
            href={`/ride-details?id=${(trip as any).rawId || trip.id}`}
            className="col-span-2 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:col-auto sm:mr-auto"
          >
            View details
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>

          {(trip as any).rawId && (trip as any).nextStatus && (
            <button
              type="button"
              onClick={() => (trip as any).onStatusChange?.((trip as any).rawId, (trip as any).nextStatus)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-xs font-bold text-secondary-foreground transition-colors hover:bg-secondary/90"
            >
              {(trip as any).nextActionLabel}
            </button>
          )}
          <a
            href={trip.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-primary/20 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Navigation aria-hidden="true" className="size-3.5" />
            Maps
          </a>
          <a
            href="tel:+18003454825"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-brand-success/25 px-3 text-xs font-semibold text-brand-success transition-colors hover:bg-brand-success/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Phone aria-hidden="true" className="size-3.5" />
            Call
          </a>
        </div>
      </article>
    </div>
  );
}

function PanelHeader({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
      <Icon aria-hidden="true" className="size-4 text-brand-yellow-hover" />
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function WorkingHoursPanel({ todayShift }: { todayShift?: any }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!todayShift || !todayShift.startedAt) {
      setElapsedSeconds(0);
      return;
    }

    const calcElapsed = () => {
      const startTime = new Date(todayShift.startedAt).getTime();
      const endTime = todayShift.status === "COMPLETED" && todayShift.endedAt
        ? new Date(todayShift.endedAt).getTime()
        : Date.now();
      const diffSec = Math.max(0, Math.floor((endTime - startTime) / 1000));
      setElapsedSeconds(diffSec);
    };

    calcElapsed();

    if (todayShift.status === "IN_PROGRESS") {
      const interval = setInterval(calcElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [todayShift]);

  const clockInDisplay = todayShift?.startedAt
    ? new Date(todayShift.startedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: CENTRAL_TZ })
    : "—";

  const clockOutDisplay = todayShift?.status === "COMPLETED" && todayShift?.endedAt
    ? new Date(todayShift.endedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: CENTRAL_TZ })
    : "—";

  const todayScheduleDisplay = todayShift?.todayScheduleHours || "Day Off";

  const formatHoursSeconds = (totalSec: number) => {
    if (totalSec <= 0) return "0h 00m 00s";
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}h ${m < 10 ? "0" : ""}${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  const total8HoursInSeconds = 8 * 3600;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / total8HoursInSeconds) * 100));

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <PanelHeader icon={Timer} title="Working hours" />
      <div className="p-4">
        <dl className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-muted p-3">
            <dt className="text-[0.68rem] text-muted-foreground">Clock in</dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">
              {clockInDisplay}
            </dd>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <dt className="text-[0.68rem] text-muted-foreground">Clock out</dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">
              {clockOutDisplay}
            </dd>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <dt className="text-[0.68rem] text-muted-foreground">Today&apos;s schedule</dt>
            <dd className="mt-1 text-sm font-semibold text-foreground truncate" title={todayScheduleDisplay}>
              {todayScheduleDisplay}
            </dd>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <dt className="text-[0.68rem] text-muted-foreground">Today&apos;s hours</dt>
            <dd className="mt-1 text-sm font-semibold text-foreground font-mono">
              {formatHoursSeconds(elapsedSeconds)}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex items-center justify-between text-[0.68rem] font-medium text-muted-foreground">
          <span>Day progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Day progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
        >
          <div
            className="h-full rounded-full bg-secondary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function NextPickupPanel({ nextPickup }: { nextPickup?: Trip | null }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <PanelHeader icon={MapPin} title="Next pickup" />
      <div className="p-4">
        {nextPickup ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{nextPickup.passenger}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {nextPickup.pickup}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-secondary/16 px-2.5 py-1 text-[0.68rem] font-semibold text-secondary-foreground">
                {nextPickup.time.split("–")[0]?.trim() || nextPickup.time}
              </span>
            </div>
            <a
              href={nextPickup.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Open in maps
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          </>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs font-semibold text-muted-foreground">No Next Pickup Assigned</p>
          </div>
        )}
      </div>
    </section>
  );
}

const fuelLevelLabels: Record<string, string> = {
  empty: "Empty (E)",
  quarter: "1/4 (Low)",
  half: "1/2 (Half)",
  "three-quarters": "3/4 (Mostly Full)",
  three_quarters: "3/4 (Mostly Full)",
  full: "Full (F)",
  "E": "Empty (E)",
  "1/4": "1/4 (Low)",
  "1/2": "1/2 (Half)",
  "3/4": "3/4 (Mostly Full)",
  "F": "Full (F)",
};

function VehiclePanel({
  vehicle,
  shiftStatus,
  shiftFuel,
}: {
  vehicle?: { make?: string; model?: string; year?: number; color?: string; licensePlate?: string };
  shiftStatus?: string | null;
  shiftFuel?: string | null;
}) {
  const vehicleName = vehicle
    ? [vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(" ")
    : "—";
  const plate = vehicle?.licensePlate || "—";

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <PanelHeader icon={CarFront} title="Vehicle information" />
      <dl className="space-y-3 p-4 text-xs">
        <div className="flex items-center justify-between gap-4">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <CarFront aria-hidden="true" className="size-3.5" />
            Vehicle
          </dt>
          <dd className="text-right font-semibold text-foreground">
            {vehicleName}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Gauge aria-hidden="true" className="size-3.5" />
            Plate
          </dt>
          <dd className="font-semibold text-foreground">{plate}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Fuel aria-hidden="true" className="size-3.5" />
            Fuel
          </dt>
          <dd className="font-semibold">
            {shiftStatus === "IN_PROGRESS" || shiftStatus === "COMPLETED" ? (
              shiftFuel ? (
                <span className="text-foreground">{fuelLevelLabels[shiftFuel] || shiftFuel}</span>
              ) : (
                <span className="text-foreground font-medium">Recorded</span>
              )
            ) : (
              <span className="text-amber-500 font-semibold text-xs">Start Your Shift First</span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function EmergencyPanel({ dispatchNumber }: { dispatchNumber: string }) {
  return (
    <section className="rounded-2xl border border-destructive/20 bg-destructive/4 p-4">
      <a
        href="tel:911"
        className="inline-flex items-center gap-2 text-destructive hover:underline focus:outline-none focus:ring-2 focus:ring-destructive/20 rounded-md cursor-pointer transition-colors"
        title="Call 911 (Emergency)"
      >
        <ShieldAlert aria-hidden="true" className="size-4 shrink-0" />
        <h2 className="text-sm font-semibold">Emergency contact</h2>
        <PhoneCall aria-hidden="true" className="size-3.5 shrink-0 ml-0.5" />
        <span className="text-xs font-bold">911</span>
      </a>
      <p className="mt-3 text-xs font-semibold text-foreground">
        FIKI Dispatch
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Available 24 hours, 7 days a week
      </p>
      <a
        href={`tel:${dispatchNumber}`}
        className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-destructive/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
      >
        <Phone aria-hidden="true" className="size-3.5" />
        Call dispatch
      </a>
    </section>
  );
}

function getEffectiveTripDateAndTs(t: any, isReturnLeg = false): { formattedDate: string; rawDate: string; timestampMs: number } {
  // If this trip has an explicit YYYY-MM-DD pickupDate, use it directly!
  if (t.pickupDate && /^\d{4}-\d{2}-\d{2}$/.test(String(t.pickupDate).trim())) {
    const rawDateStr = String(t.pickupDate).trim();
    const timeStr = t.pickupTime
      ? formatTimeTo12Hour(t.pickupTime)
      : (isReturnLeg ? (t.returnPickupTime ? formatTimeTo12Hour(t.returnPickupTime) : "Return Pickup") : "Scheduled");
    const ts = getTripTimestamp(rawDateStr, timeStr);
    return {
      formattedDate: formatFullCardDate(rawDateStr),
      rawDate: rawDateStr,
      timestampMs: ts,
    };
  }

  const isRecurring = t.schedule === "recurring" || t.tripType === "recurring" || (Array.isArray(t.recurringDays) && t.recurringDays.length > 0);

  const baseDateVal = isReturnLeg
    ? (t.returnDate || t.endDate || t.startDate || t.pickupDate || t.createdAt)
    : (t.startDate || t.pickupDate || t.createdAt);

  const timeStr = isReturnLeg
    ? (t.returnPickupTime ? formatTimeTo12Hour(t.returnPickupTime) : "Return Pickup")
    : (t.pickupTime ? formatTimeTo12Hour(t.pickupTime) : "Scheduled");

  let rawDateStr = typeof baseDateVal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(baseDateVal.trim())
    ? baseDateVal.trim()
    : getCentralTodayDateStr(new Date(baseDateVal));

  let ts = getTripTimestamp(rawDateStr, timeStr);

  const now = new Date();
  const todayCentralStr = getCentralTodayDateStr(now);
  const [cY, cM, cD] = todayCentralStr.split("-").map(Number);
  const todayStartMs = getTripTimestamp(todayCentralStr, "12:00 AM");

  if (isRecurring && ts < todayStartMs) {
    const weekDaysFull = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const weekDaysShort = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    const targetDays = Array.isArray(t.recurringDays) && t.recurringDays.length > 0
      ? t.recurringDays.map((d: string) => String(d).trim().toLowerCase())
      : [];

    for (let offset = 0; offset <= 14; offset++) {
      const candidateCentralObj = new Date(Date.UTC(cY, cM - 1, cD + offset, 12, 0, 0));
      const candDateStr = getCentralTodayDateStr(candidateCentralObj);

      const dayIdx = candidateCentralObj.getUTCDay();
      const candFull = weekDaysFull[dayIdx];
      const candShort = weekDaysShort[dayIdx];

      const matches = targetDays.length === 0 || targetDays.some((d: string) => d === candFull || d === candShort || candFull.startsWith(d));
      if (matches) {
        const candTs = getTripTimestamp(candDateStr, timeStr);

        rawDateStr = candDateStr;
        ts = candTs;
        break;
      }
    }
  }

  return {
    formattedDate: formatFullCardDate(rawDateStr),
    rawDate: rawDateStr,
    timestampMs: ts,
  };
}

export function DashboardOverview() {
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  }).format(today);
  const shortDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/Chicago",
  }).format(today);

  const [liveTrips, setLiveTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatchNumber, setDispatchNumber] = useState("+18003454825");
  const [sessionVehicle, setSessionVehicle] = useState<any>(null);
  const [shiftStatus, setShiftStatus] = useState<string | null>(null);
  const [shiftFuel, setShiftFuel] = useState<string | null>(null);
  const [todayShift, setTodayShift] = useState<any>(null);
  const [showShiftAlert, setShowShiftAlert] = useState(false);
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "completed" | "missed">("today");
  const [backendTodayTripsCount, setBackendTodayTripsCount] = useState<number | null>(null);

  const fetchTrips = () => {
    setLoading(true);
    import("@/lib/auth").then(({ getDriverSession }) => {
      const session = getDriverSession();
      if (session?.vehicle) {
        setSessionVehicle(session.vehicle);
      }
      const token = session?.token;
      if (token) {
        import("@/lib/api").then(({ getDispatchNumberApi, getTodayShiftApi, getDriverTripsApi }) => {
          Promise.all([
            getDispatchNumberApi(token).then((res) => {
              if (res.success && res.data) {
                setDispatchNumber(res.data.dispatchNumber);
              }
            }),
            getTodayShiftApi(token).then((res) => {
              if (res.success && res.data) {
                if (res.data.shift && res.data.shift.status) {
                  setShiftStatus(res.data.shift.status);
                  setShiftFuel(res.data.shift.startFuel || res.data.shift.fuelLevel || null);
                } else {
                  setShiftStatus(null);
                  setShiftFuel(null);
                }
                setTodayShift({
                  ...(res.data.shift || {}),
                  todayScheduleHours: res.data.todayScheduleHours || res.data.shift?.todayScheduleHours || res.data.todaySchedule?.hoursText || "Day Off",
                });
              } else {
                setShiftStatus(null);
                setShiftFuel(null);
                setTodayShift(null);
              }
            }),
            getDriverTripsApi(token).then((res) => {
              if (res.success && res.data && Array.isArray(res.data.trips)) {
                if (typeof res.data.todayTripsCount === "number") {
                  setBackendTodayTripsCount(res.data.todayTripsCount);
                }

                const now = new Date();
                const todayDayFull = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: CENTRAL_TZ }).format(now);
                const todayDayShort = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: CENTRAL_TZ }).format(now);

                const mappedList: any[] = [];

                res.data.trips.forEach((t: any) => {
                  let uiStatus: TripStatus = "scheduled";
                  if (t.status === "COMPLETED") uiStatus = "completed";
                  else if (t.status === "MISSED") uiStatus = "missed";
                  else if (["DRIVER_ARRIVING", "DRIVER_ARRIVED", "IN_PROGRESS"].includes(t.status)) uiStatus = "inProgress";
                  else uiStatus = "scheduled";

                  let nextStatus = "";
                  let nextActionLabel = "";
                  if (t.status === "ACCEPTED") {
                    nextStatus = "DRIVER_ARRIVING";
                    nextActionLabel = "Start Pickup";
                  } else if (t.status === "DRIVER_ARRIVING") {
                    nextStatus = "DRIVER_ARRIVED";
                    nextActionLabel = "Mark Arrived";
                  } else if (t.status === "DRIVER_ARRIVED") {
                    nextStatus = "IN_PROGRESS";
                    nextActionLabel = "Pick Up Passenger";
                  } else if (t.status === "IN_PROGRESS") {
                    nextStatus = "COMPLETED";
                    nextActionLabel = "Complete Drop-off";
                  }

                  const passengerName = t.fullName || t.passengerId?.name || "Passenger";
                  const initials = passengerName.split(" ").filter(Boolean).map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "PA";
                  const mobility = Array.isArray(t.mobilityOptions) && t.mobilityOptions.length > 0 ? t.mobilityOptions.join(", ") : "Standard";

                  const isChildLeg = Boolean(t.parentRequestId || t.legType);
                  const isRecurring = t.schedule === "recurring" || t.tripType === "recurring" || (Array.isArray(t.recurringDays) && t.recurringDays.length > 0);
                  const isRoundTrip = t.tripType === "round-trip" || t.tripType === "round_trip" || t.isRoundTrip === true;

                  // Filter unexpanded master recurring trips to ensure they only appear on their scheduled Recurring Days
                  if (!isChildLeg && isRecurring && Array.isArray(t.recurringDays) && t.recurringDays.length > 0) {
                    const matchesDay = t.recurringDays.some((day: string) => {
                      const d = day.trim().toLowerCase();
                      return (
                        d === todayDayFull.toLowerCase() ||
                        d === todayDayShort.toLowerCase() ||
                        todayDayFull.toLowerCase().startsWith(d)
                      );
                    });
                    if (!matchesDay) return;
                  }

                  const outboundInfo = getEffectiveTripDateAndTs(t, Boolean(t.isReturnLeg));
                  const outboundPickupTime = t.pickupTime
                    ? formatTimeTo12Hour(t.pickupTime)
                    : (t.createdAt
                        ? new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
                        : "Scheduled");

                  const legLabel = t.isReturnLeg
                    ? "Round Trip (Return)"
                    : isRoundTrip
                      ? "Round Trip (Outbound)"
                      : isRecurring
                        ? "Recurring Trip"
                        : (t.tripType || "One way");

                  // Outbound / Individual Leg
                  mappedList.push({
                    id: `TRP-${t._id.substring(t._id.length - 4).toUpperCase()}${t.isReturnLeg ? "-RET" : ""}`,
                    rawId: t._id,
                    rawStatus: t.status,
                    status: uiStatus,
                    rideType: legLabel,
                    time: outboundPickupTime,
                    date: outboundInfo.formattedDate,
                    rawDate: outboundInfo.rawDate,
                    timestampMs: outboundInfo.timestampMs,
                    isToday: isTripToday(outboundInfo.rawDate),
                    passenger: passengerName,
                    initials,
                    mobility,
                    pickup: t.pickupLocation?.address || t.streetAddress || t.pickupAddress || "Pickup Location",
                    dropoff: t.dropoffLocation?.address || t.destinationAddress || "Dropoff Location",
                    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.pickupLocation?.address || t.streetAddress || "Pickup")}`,
                    nextStatus,
                    nextActionLabel,
                  });

                  // Legacy single-doc fallback for unexpanded round trips only
                  if (!isChildLeg && isRoundTrip && (t.returnPickupTime || t.returnPickupAddress)) {
                    const returnInfo = getEffectiveTripDateAndTs(t, true);
                    const returnTimeFormatted = t.returnPickupTime ? formatTimeTo12Hour(t.returnPickupTime) : "Return Pickup";
                    mappedList.push({
                      id: `TRP-${t._id.substring(t._id.length - 4).toUpperCase()}-RET`,
                      rawId: t._id,
                      rawStatus: t.status,
                      status: uiStatus,
                      rideType: "Round Trip (Return)",
                      time: returnTimeFormatted,
                      date: returnInfo.formattedDate,
                      rawDate: returnInfo.rawDate,
                      timestampMs: returnInfo.timestampMs,
                      isToday: isTripToday(returnInfo.rawDate),
                      passenger: passengerName,
                      initials,
                      mobility,
                      pickup: t.returnPickupAddress || t.dropoffLocation?.address || t.destinationAddress || "Return Pickup",
                      dropoff: t.returnDestinationAddress || t.pickupLocation?.address || t.pickupAddress || "Return Destination",
                      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.returnPickupAddress || t.dropoffLocation?.address || "Return")}`,
                      nextStatus,
                      nextActionLabel,
                    });
                  }
                });
                setLiveTrips(mappedList);
              } else {
                setLiveTrips([]);
              }
            }),
          ]).finally(() => {
            setLoading(false);
          });
        });
      } else {
        setLiveTrips([]);
        setLoading(false);
      }
    });
  };
  const [currentDateStr, setCurrentDateStr] = useState(getCentralTodayDateStr());

  useEffect(() => {
    fetchTrips();
    
    // Check every minute if the day has rolled over. If it has, update state and refetch.
    const interval = setInterval(() => {
      const newDateStr = getCentralTodayDateStr();
      if (newDateStr !== currentDateStr) {
        setCurrentDateStr(newDateStr);
        fetchTrips();
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [currentDateStr]);

  const handleStatusChange = async (tripId: string, nextStatus: string) => {
    // Block only if shift was never started (null). Allow both IN_PROGRESS and COMPLETED
    // so drivers can finish any in-progress trips even after shift auto-ends.
    if (shiftStatus !== "IN_PROGRESS" && shiftStatus !== "COMPLETED") {
      setShowShiftAlert(true);
      return;
    }
    const { getDriverSession } = await import("@/lib/auth");
    const session = getDriverSession();
    const token = session?.token;
    if (token) {
      const res = await updateDriverTripStatusApi(token, tripId, nextStatus);
      if (res.success) {
        fetchTrips();
      } else if (res.error?.code === "SHIFT_NOT_STARTED") {
        setShowShiftAlert(true);
      }
    }
  };

  const todayCentralStr = currentDateStr;

  const isLegMissed = (t: any) => {
    // If the backend explicitly flagged it as completed or missed, honour that
    if (t.status === "completed" || t.status === "missed") {
      return t.status === "missed";
    }
    // Never mark as missed if the driver is already actively working the trip
    if (["DRIVER_ARRIVING", "DRIVER_ARRIVED", "IN_PROGRESS"].includes(t.rawStatus)) {
      return false;
    }
    // A trip is "missed" ONLY when its scheduled date is fully in the past
    // (i.e. belongs to a prior day). If the trip is still today, keep it in
    // Today's Trips regardless of whether the pickup time has already elapsed.
    if (!t.rawDate) return false;
    return t.rawDate < todayCentralStr;
  };

  const activeTripList: any[] = liveTrips.map((t: any) => {
    const missed = isLegMissed(t);
    // Dynamically recalculate isToday on render to handle day rollovers
    const isActuallyToday = t.rawDate === todayCentralStr;
    return {
      ...t,
      isToday: isActuallyToday,
      status: missed ? "missed" : t.status,
      onStatusChange: handleStatusChange,
    };
  });

  // Separate into Today's Trips, Upcoming Trips (future days), Completed, and Missed
  const todayTrips = activeTripList
    .filter((t) => t.status !== "completed" && t.status !== "missed" && t.isToday)
    .sort((a, b) => (a.timestampMs || 0) - (b.timestampMs || 0));

  const upcomingTrips = activeTripList
    .filter((t) => t.status !== "completed" && t.status !== "missed" && !t.isToday && (t.rawDate ? t.rawDate > todayCentralStr : true))
    .sort((a, b) => (a.timestampMs || 0) - (b.timestampMs || 0));

  const completedTrips = activeTripList
    .filter((t) => t.status === "completed")
    .sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));

  const missedTrips = activeTripList
    .filter((t) => t.status === "missed")
    .sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));

  const todayCount = todayTrips.length;
  const upcomingCount = upcomingTrips.length;
  const completedCount = completedTrips.length;
  const missedCount = missedTrips.length;
  const nextPickup = todayTrips.length > 0 ? todayTrips[0] : (upcomingTrips.length > 0 ? upcomingTrips[0] : null);

  const localTodayCount = activeTripList.filter((t) => t.isToday).length;
  const todayTripsCount = backendTodayTripsCount !== null && backendTodayTripsCount > 0
    ? backendTodayTripsCount
    : localTodayCount;

  const dynamicSummaryItems: SummaryItem[] = [
    {
      label: "Today's trips",
      value: String(todayTripsCount),
      detail: "Daily schedule",
      icon: CalendarDays,
      tone: "primary",
    },
    {
      label: "Completed",
      value: String(completedCount),
      detail: activeTripList.length > 0 ? `${Math.round((completedCount / activeTripList.length) * 100)}% of schedule` : "0% of schedule",
      icon: CheckCircle2,
      tone: "success",
    },
    {
      label: "Upcoming",
      value: String(upcomingCount),
      detail: nextPickup ? `Next at ${nextPickup.time}` : "No upcoming",
      icon: Clock3,
      tone: "secondary",
    },
    {
      label: "Total distance",
      value: `${((todayTripsCount > 0 ? todayTripsCount : activeTripList.length) * 4.5).toFixed(1)} mi`,
      detail: `Est. ${(todayTripsCount > 0 ? todayTripsCount : activeTripList.length) * 15} min driving`,
      icon: Route,
      tone: "primary",
    },
  ];

  const displayedList =
    activeTab === "today"
      ? todayTrips
      : activeTab === "upcoming"
        ? upcomingTrips
        : activeTab === "completed"
          ? completedTrips
          : missedTrips;

  return (
    <section aria-labelledby="dashboard-title">
      <h1 id="dashboard-title" className="sr-only">
        Driver dashboard for {formattedDate}
      </h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => <SummaryCardSkeleton key={i} />)
        ) : (
          dynamicSummaryItems.map((item) => (
            <SummaryCard key={item.label} item={item} />
          ))
        )}
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-labelledby="schedule-title">
          <div className="mb-4">
            <h2
              id="schedule-title"
              className="text-base font-semibold text-foreground"
            >
              Trip Schedules
            </h2>

            {/* Horizontal Tabs: Today's Trips, Upcoming Trips, Completed Trips, Missed Trips */}
            <div className="mt-3 flex items-center border-b border-border overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("today")}
                className={cn(
                  "relative px-5 py-3 text-xs font-bold transition-colors whitespace-nowrap",
                  activeTab === "today"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Today's Trips ({todayCount})
                {activeTab === "today" && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className={cn(
                  "relative px-5 py-3 text-xs font-bold transition-colors whitespace-nowrap",
                  activeTab === "upcoming"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Upcoming Trips ({upcomingCount})
                {activeTab === "upcoming" && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("completed")}
                className={cn(
                  "relative px-5 py-3 text-xs font-bold transition-colors whitespace-nowrap",
                  activeTab === "completed"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Completed Trips ({completedCount})
                {activeTab === "completed" && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("missed")}
                className={cn(
                  "relative px-5 py-3 text-xs font-bold transition-colors whitespace-nowrap",
                  activeTab === "missed"
                    ? "text-red-600 font-extrabold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Missed Trips ({missedCount})
                {activeTab === "missed" && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-red-600" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              [1, 2].map((i) => <TripCardSkeleton key={i} />)
            ) : displayedList.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-[0_6px_20px_rgba(8,37,82,0.05)]">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {activeTab === "today" ? (
                    <CalendarDays className="size-6" />
                  ) : activeTab === "upcoming" ? (
                    <Clock3 className="size-6" />
                  ) : activeTab === "completed" ? (
                    <CheckCircle2 className="size-6" />
                  ) : (
                    <Clock3 className="size-6 text-red-500" />
                  )}
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">
                  {activeTab === "today"
                    ? "No Trips Scheduled For Today"
                    : activeTab === "upcoming"
                      ? "No Upcoming Trips Scheduled"
                      : activeTab === "completed"
                        ? "No Completed Trips"
                        : "No Missed Trips"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeTab === "today"
                    ? "You currently have no ride assignments scheduled for today."
                    : activeTab === "upcoming"
                      ? "Assigned future trips starting from tomorrow will appear here."
                      : activeTab === "completed"
                        ? "Trips you complete will be stored here for your records."
                        : "Uncompleted past trips whose scheduled pickup time passed will appear here."}
                </p>
              </div>
            ) : (
              displayedList.map((trip: any, index: number) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  index={index}
                  isLastItem={index === displayedList.length - 1}
                />
              ))
            )}
          </div>
        </section>

        <aside aria-label="Daily information" className="space-y-3">
          <WorkingHoursPanel todayShift={todayShift} />
          <NextPickupPanel nextPickup={loading ? undefined : nextPickup} />
          <VehiclePanel vehicle={sessionVehicle} shiftStatus={shiftStatus} shiftFuel={shiftFuel} />
          <EmergencyPanel dispatchNumber={dispatchNumber} />
        </aside>
      </div>

      <ShiftAlertModal
        isOpen={showShiftAlert}
        onClose={() => setShowShiftAlert(false)}
      />
    </section>
  );
}

