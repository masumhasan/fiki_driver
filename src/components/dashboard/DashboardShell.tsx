"use client";

import {
  Activity,
  CalendarDays,
  CarFront,
  ChevronDown,
  Hash,
  IdCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Route,
  Settings,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { clearDriverSession, getDriverSession, getInitials, formatVehicleLine, type DriverSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

const primaryNavigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Schedule & attendance",
    href: "/schedule-attendance",
    icon: CalendarDays,
  },
  {
    label: "Ride details",
    href: "/ride-details",
    icon: Route,
  },
  {
    label: "My earnings",
    href: "/earnings",
    icon: Activity,
  },
];



type DashboardShellProps = {
  children: React.ReactNode;
};

type SidebarProps = {
  session: DriverSession | null;
  onNavigate?: () => void;
};

function Brand() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
      aria-label="FIKI Transit dashboard"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-foreground">
        <Image
          src="/logo.png"
          alt=""
          width={44}
          height={44}
          className="size-9"
          priority
        />
      </span>
      <span className="leading-none">
        <span className="block text-[1.05rem] font-bold tracking-[-0.02em]">
          FIKI TRANSIT
        </span>
        <span className="mt-1.5 block text-[0.65rem] font-semibold tracking-[0.14em] text-secondary">
          DRIVER PORTAL
        </span>
      </span>
    </Link>
  );
}

function NavigationLink({
  href,
  icon: Icon,
  label,
  onNavigate,
}: (typeof primaryNavigation)[number] & {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex h-11 items-center gap-3 rounded-xl border border-transparent px-3.5 text-sm font-medium text-primary-foreground/72 transition-colors",
        "hover:bg-primary-foreground/8 hover:text-primary-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
        isActive &&
          "border-primary-foreground/10 bg-primary-foreground/10 text-secondary",
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "size-[1.1rem] text-primary-foreground/58 transition-colors",
          isActive && "text-secondary",
        )}
      />
      <span>{label}</span>
    </Link>
  );
}

function Sidebar({ session, onNavigate }: SidebarProps) {
  const router = useRouter();
  const [shiftStatus, setShiftStatus] = useState<string | null>(null);

  useEffect(() => {
    const token = session?.token;
    if (token) {
      import("@/lib/api").then(({ getTodayShiftApi }) => {
        getTodayShiftApi(token)
          .then((res) => {
            if (res.success && res.data && res.data.shift) {
              setShiftStatus(res.data.shift.status);
            } else {
              setShiftStatus(null);
            }
          })
          .catch(() => {});
      });
    }
  }, [session?.token]);

  function signOut() {
    clearDriverSession();
    onNavigate?.();
    router.replace("/login");
  }

  const vehicleMakeModel = formatVehicleLine(session?.vehicle);
  const licensePlate = session?.vehicle?.licensePlate ?? "—";
  const licenseNumber = session?.licenseNumber ?? "DL-987654321";

  // Dynamic Driver Status
  let statusLabel = "Off duty";
  let statusClassName = "text-primary-foreground/50";

  if (shiftStatus === "IN_PROGRESS") {
    statusLabel = "On duty";
    statusClassName = "text-brand-success font-medium";
  } else if (session?.availabilityStatus === "ONLINE") {
    statusLabel = "On duty";
    statusClassName = "text-brand-success font-medium";
  } else if (session?.availabilityStatus === "ASSIGNED") {
    statusLabel = "Assigned";
    statusClassName = "text-secondary font-medium";
  } else if (session?.availabilityStatus === "UNAVAILABLE") {
    statusLabel = "Unavailable";
    statusClassName = "text-red-400 font-medium";
  }

  return (
    <div className="flex h-full flex-col bg-primary text-primary-foreground">
      <div className="flex h-20 shrink-0 items-center border-b border-primary-foreground/10 px-5">
        <Brand />
      </div>

      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto px-3 py-4"
      >
        <p className="px-3.5 pb-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-primary-foreground/35">
          Navigation
        </p>
        <div className="space-y-1">
          {primaryNavigation.map((item) => (
            <NavigationLink key={item.href} {...item} onNavigate={onNavigate} />
          ))}
        </div>

        {/* Quick info — live vehicle data */}
        <p className="mt-7 px-3.5 pb-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-primary-foreground/35">
          Quick info
        </p>
        <div className="mx-1 rounded-2xl bg-primary-foreground/[0.06] p-3.5 text-xs text-primary-foreground/75">
          <p className="flex items-center gap-2">
            <CarFront className="size-3.5 text-secondary" />
            {vehicleMakeModel}
          </p>
          <p className="mt-2 flex items-center gap-2">
            <Hash className="size-3.5 text-secondary" />
            {licensePlate}
          </p>
          <p className="mt-2 flex items-center gap-2 text-primary-foreground/75">
            <IdCard className="size-3.5 text-secondary" />
            {licenseNumber}
          </p>
          <p className={cn("mt-2 flex items-center gap-2", statusClassName)}>
            <Activity className="size-3.5" />
            {statusLabel}
          </p>
        </div>
      </nav>
    </div>
  );
}



export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<DriverSession | null>(null);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const mobileNavigationId = useId();
  const notificationsId = useId();
  const notificationsRef = useRef<HTMLDivElement>(null);
  const isSchedulePage = pathname === "/schedule-attendance";
  const isEarningsPage = pathname === "/earnings";

  // Load real session on mount
  useEffect(() => {
    setSession(getDriverSession());
  }, []);

  const driverFirstName = session?.name?.split(" ")[0] ?? "Driver";
  const initials = session ? getInitials(session.name) : "—";
  const shortName = session?.name?.split(" ")[0]
    ? session.name.split(" ")[0] + (session.name.split(" ")[1]?.[0] ? " " + session.name.split(" ")[1][0] + "." : "")
    : "Driver";

  // Get current day + date
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    if (!isNavigationOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsNavigationOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isNavigationOpen]);

  useEffect(() => {
    if (!isNotificationsOpen) return;

    function closeNotifications(event: KeyboardEvent | PointerEvent) {
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        setIsNotificationsOpen(false);
        return;
      }
      if (
        event instanceof PointerEvent &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener("keydown", closeNotifications);
    document.addEventListener("pointerdown", closeNotifications);
    return () => {
      document.removeEventListener("keydown", closeNotifications);
      document.removeEventListener("pointerdown", closeNotifications);
    };
  }, [isNotificationsOpen]);

  return (
    <div className="min-h-svh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[15.5rem] lg:block">
        <Sidebar session={session} />
      </aside>

      {isNavigationOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-primary/46"
            aria-label="Close navigation"
            onClick={() => setIsNavigationOpen(false)}
          />
          <aside
            id={mobileNavigationId}
            aria-label="Mobile navigation"
            className="relative h-full w-[min(19rem,88vw)]"
          >
            <button
              type="button"
              onClick={() => setIsNavigationOpen(false)}
              className="absolute right-3 top-4 z-10 grid size-10 place-items-center rounded-xl text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-secondary"
              aria-label="Close navigation"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
            <Sidebar
              session={session}
              onNavigate={() => setIsNavigationOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-[15.5rem]">
        <header className="sticky top-0 z-20 h-18 border-b border-border bg-card/96">
          <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsNavigationOpen(true)}
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
                aria-label="Open navigation"
                aria-controls={mobileNavigationId}
                aria-expanded={isNavigationOpen}
              >
                <Menu aria-hidden="true" className="size-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                  {isSchedulePage
                    ? "My Schedule & Attendance"
                    : `Good morning, ${driverFirstName} 👋`}
                </p>
                <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                  {isSchedulePage
                    ? "Track your shifts and view your upcoming schedule."
                    : isEarningsPage
                      ? "Here is an overview of your earnings this pay period."
                      : today}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">


              {/* Live driver name/initials profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((isOpen) => !isOpen)}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                  className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-2 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:pr-3 cursor-pointer"
                  aria-label="Open profile menu"
                >
                  <span className="grid size-7 place-items-center rounded-lg bg-secondary text-[0.7rem] font-bold text-secondary-foreground">
                    {initials}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-xs font-semibold text-foreground">
                      {shortName}
                    </span>
                    <span className="mt-0.5 block text-[0.65rem] text-muted-foreground">
                      Driver
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn("hidden size-3.5 text-muted-foreground sm:block transition-transform duration-200", isProfileOpen && "rotate-180")}
                  />
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 w-52 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-[0_10px_30px_rgba(8,37,82,0.12)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                      <div className="border-b border-border/80 px-3 py-2.5">
                        <p className="text-xs font-bold text-foreground">{session?.name || "Driver"}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{session?.email || "driver@fikitransit.com"}</p>
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false);
                            clearDriverSession();
                            router.replace("/login");
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                        >
                          <LogOut className="size-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[100rem] px-4 py-5 sm:px-6 sm:py-6 lg:px-6 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
