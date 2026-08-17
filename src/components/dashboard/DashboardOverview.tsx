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
  Route,
  ShieldAlert,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type SummaryTone = "primary" | "secondary" | "success";
type TripStatus = "inProgress" | "scheduled" | "completed";

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
  passenger: string;
  initials: string;
  mobility: string;
  pickup: string;
  dropoff: string;
  mapsUrl: string;
};

const summaryItems: SummaryItem[] = [
  {
    label: "Today's trips",
    value: "4",
    detail: "Daily schedule",
    icon: CalendarDays,
    tone: "primary",
  },
  {
    label: "Completed",
    value: "1",
    detail: "25% of schedule",
    icon: CheckCircle2,
    tone: "success",
  },
  {
    label: "Upcoming",
    value: "2",
    detail: "Next at 10:15 AM",
    icon: Clock3,
    tone: "secondary",
  },
  {
    label: "Total distance",
    value: "17.5 mi",
    detail: "Est. 84 min driving",
    icon: Route,
    tone: "primary",
  },
];

const trips: Trip[] = [
  {
    id: "TRP-2847",
    status: "inProgress",
    rideType: "One way",
    time: "8:00 AM – 8:45 AM",
    passenger: "Margaret Johnson",
    initials: "MJ",
    mobility: "Wheelchair",
    pickup: "1204 NW 14th Ave, Miami, FL 33125",
    dropoff: "1611 NW 12th Ave, Miami, FL 33136",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=1204%20NW%2014th%20Ave%20Miami%20FL",
  },
  {
    id: "TRP-2848",
    status: "scheduled",
    rideType: "Round trip",
    time: "10:15 AM – 11:00 AM",
    passenger: "Robert Chen",
    initials: "RC",
    mobility: "Walker",
    pickup: "8900 SW 117th Ave, Miami, FL 33186",
    dropoff: "9100 SW 97th Ave, Miami, FL 33176",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=8900%20SW%20117th%20Ave%20Miami%20FL",
  },
  {
    id: "TRP-2849",
    status: "completed",
    rideType: "One way",
    time: "1:30 PM – 2:10 PM",
    passenger: "Dorothy Williams",
    initials: "DW",
    mobility: "Ambulatory",
    pickup: "2501 SW 3rd Ave, Miami, FL 33129",
    dropoff: "1400 NW 12th Ave, Miami, FL 33136",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=2501%20SW%203rd%20Ave%20Miami%20FL",
  },
  {
    id: "TRP-2850",
    status: "scheduled",
    rideType: "Round trip",
    time: "3:45 PM – 4:30 PM",
    passenger: "Harold Garcia",
    initials: "HG",
    mobility: "Wheelchair",
    pickup: "7800 W Flagler St, Miami, FL 33144",
    dropoff: "9075 SW 87th Ave, Miami, FL 33176",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=7800%20W%20Flagler%20St%20Miami%20FL",
  },
];

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

function TripCard({ trip, index }: { trip: Trip; index: number }) {
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
          trip.status === "scheduled" && "border-border text-muted-foreground",
        )}
      >
        {index + 1}
      </div>
      {index < trips.length - 1 && (
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
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
            href="/ride-details"
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

function WorkingHoursPanel() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <PanelHeader icon={Timer} title="Working hours" />
      <div className="p-4">
        <dl className="grid grid-cols-2 gap-2">
          {[
            ["Clock in", "7:15 AM"],
            ["Est. clock out", "5:30 PM"],
            ["Break", "12:00 PM"],
            ["Total", "9h 15m"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-muted p-3">
              <dt className="text-[0.68rem] text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-center justify-between text-[0.68rem] font-medium text-muted-foreground">
          <span>Day progress</span>
          <span>35%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Day progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={35}
        >
          <div className="h-full w-[35%] rounded-full bg-secondary" />
        </div>
      </div>
    </section>
  );
}

function NextPickupPanel() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <PanelHeader icon={MapPin} title="Next pickup" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Robert Chen</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              8900 SW 117th Ave, Miami, FL 33186
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-secondary/16 px-2.5 py-1 text-[0.68rem] font-semibold text-secondary-foreground">
            10:15 AM
          </span>
        </div>
        <a
          href="https://www.google.com/maps/search/?api=1&query=8900%20SW%20117th%20Ave%20Miami%20FL"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Open in maps
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      </div>
    </section>
  );
}

function VehiclePanel() {
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
            Toyota Sienna 2023
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Gauge aria-hidden="true" className="size-3.5" />
            Plate
          </dt>
          <dd className="font-semibold text-foreground">MIA-4821</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Fuel aria-hidden="true" className="size-3.5" />
            Fuel
          </dt>
          <dd className="font-semibold text-foreground">78% remaining</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Accessibility aria-hidden="true" className="size-3.5" />
            Wheelchair lift
          </dt>
          <dd className="flex items-center gap-1.5 font-semibold text-brand-success">
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            Operational
          </dd>
        </div>
      </dl>
    </section>
  );
}

function EmergencyPanel() {
  return (
    <section className="rounded-2xl border border-destructive/20 bg-destructive/4 p-4">
      <div className="flex items-center gap-2 text-destructive">
        <ShieldAlert aria-hidden="true" className="size-4" />
        <h2 className="text-sm font-semibold">Emergency contact</h2>
      </div>
      <p className="mt-3 text-xs font-semibold text-foreground">
        FIKI Dispatch
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Available 24 hours, 7 days a week
      </p>
      <a
        href="tel:+18003454825"
        className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-destructive/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
      >
        <Phone aria-hidden="true" className="size-3.5" />
        Call dispatch
      </a>
    </section>
  );
}

function NotificationsPanel() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Bell aria-hidden="true" className="size-4 text-brand-yellow-hover" />
          <h2 className="text-sm font-semibold text-foreground">
            Recent updates
          </h2>
        </div>
        <span className="grid size-5 place-items-center rounded-full bg-destructive text-[0.62rem] font-bold text-primary-foreground">
          2
        </span>
      </div>
      <ul className="divide-y divide-border">
        <li className="px-4 py-3">
          <p className="text-xs font-medium leading-5 text-foreground">
            New trip TRP-2850 assigned to you
          </p>
          <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
            2 minutes ago
          </p>
        </li>
        <li className="px-4 py-3">
          <p className="text-xs font-medium leading-5 text-foreground">
            TRP-2848 pickup updated to 10:15 AM
          </p>
          <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
            14 minutes ago
          </p>
        </li>
      </ul>
    </section>
  );
}

export function DashboardOverview() {
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(today);
  const shortDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(today);

  const [liveTrips, setLiveTrips] = useState<any[] | null>(null);

  const fetchTrips = () => {
    import("@/lib/auth").then(({ getDriverSession }) => {
      const session = getDriverSession();
      const token = session?.token;
      if (token) {
        getDriverTripsApi(token).then((res) => {
          if (res.success && res.data && res.data.trips) {
            const mapped = res.data.trips.map((t: any) => {
              let uiStatus: TripStatus = "scheduled";
              if (t.status === "COMPLETED") uiStatus = "completed";
              else if (["ACCEPTED", "DRIVER_ARRIVING", "DRIVER_ARRIVED", "IN_PROGRESS"].includes(t.status)) uiStatus = "inProgress";

              let nextStatus = "";
              let nextActionLabel = "";
              if (t.status === "ACCEPTED") {
                nextStatus = "DRIVER_ARRIVING";
                nextActionLabel = "Mark Arriving";
              } else if (t.status === "DRIVER_ARRIVING") {
                nextStatus = "DRIVER_ARRIVED";
                nextActionLabel = "Mark Arrived";
              } else if (t.status === "DRIVER_ARRIVED") {
                nextStatus = "IN_PROGRESS";
                nextActionLabel = "Start Trip";
              } else if (t.status === "IN_PROGRESS") {
                nextStatus = "COMPLETED";
                nextActionLabel = "Complete Trip";
              }

              const passengerName = t.passengerId?.name || "Passenger";
              const initials = passengerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "PA";

              return {
                id: `TRP-${t._id.substring(t._id.length - 4).toUpperCase()}`,
                rawId: t._id,
                status: uiStatus,
                rideType: "One way",
                time: t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now",
                passenger: passengerName,
                initials,
                mobility: "Standard",
                pickup: t.pickupLocation?.address || "Pickup Address",
                dropoff: t.dropoffLocation?.address || "Dropoff Address",
                mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.pickupLocation?.address || "Miami")}`,
                nextStatus,
                nextActionLabel,
              };
            });
            if (mapped.length > 0) {
              setLiveTrips(mapped);
            }
          }
        });
      }
    });
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleStatusChange = async (tripId: string, nextStatus: string) => {
    const { getDriverSession } = await import("@/lib/auth");
    const session = getDriverSession();
    const token = session?.token;
    if (token) {
      const res = await updateDriverTripStatusApi(token, tripId, nextStatus);
      if (res.success) {
        fetchTrips();
      }
    }
  };

  const activeTripList = (liveTrips || trips).map((t: any) => ({
    ...t,
    onStatusChange: handleStatusChange,
  }));

  return (
    <section aria-labelledby="dashboard-title">
      <h1 id="dashboard-title" className="sr-only">
        Driver dashboard for {formattedDate}
      </h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <SummaryCard key={item.label} item={item} />
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-labelledby="schedule-title">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2
                id="schedule-title"
                className="text-base font-semibold text-foreground"
              >
                Today&apos;s schedule
              </h2>
            </div>
            <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {shortDate}
            </span>
          </div>

          <div className="space-y-3">
            {activeTripList.map((trip: any, index: number) => (
              <TripCard key={trip.id} trip={trip} index={index} />
            ))}
          </div>
        </section>

        <aside aria-label="Daily information" className="space-y-3">
          <WorkingHoursPanel />
          <NextPickupPanel />
          <VehiclePanel />
          <EmergencyPanel />
          <NotificationsPanel />
        </aside>
      </div>
    </section>
  );
}
