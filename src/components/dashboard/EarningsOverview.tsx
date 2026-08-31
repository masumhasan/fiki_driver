"use client";

import { useEffect, useRef, useState } from "react";
import { getDriverEarningsApi } from "@/lib/api";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Info,
  Inbox,
  Loader2,
  Route,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";

export interface FortnightPeriod {
  id: string;
  startDate: string;
  endDate: string;
  label: string;
  isCurrent: boolean;
  expectedPayDate: string;
  payrollStatus: "Approved" | "Paid" | "Entered into Payroll" | "Waiting Deposit";
}

function EarningsSkeleton() {
  return (
    <section className="space-y-5 animate-pulse">
      <div className="flex justify-end">
        <div className="h-10 w-52 rounded-xl bg-muted" />
      </div>
      <div className="rounded-2xl bg-[#112f5f] p-6 sm:p-8 text-white shadow-md">
        <div className="grid md:grid-cols-[1.5fr_1fr] gap-6">
          <div className="space-y-3">
            <div className="h-3 w-32 rounded bg-white/20" />
            <div className="h-10 w-48 rounded bg-white/20" />
            <div className="h-3 w-28 rounded bg-white/20" />
            <div className="h-4 w-40 rounded bg-white/20" />
            <div className="h-8 w-56 rounded-xl bg-white/10 mt-4" />
          </div>
          <div className="space-y-4 border-t border-white/10 pt-6 md:border-l md:border-t-0 md:pt-0 md:pl-6">
            <div className="h-3 w-28 rounded bg-white/20" />
            <div className="h-6 w-32 rounded bg-white/20" />
            <div className="space-y-3 pt-2">
              <div className="h-4 w-40 rounded bg-white/10" />
              <div className="h-4 w-36 rounded bg-white/10" />
              <div className="h-4 w-28 rounded bg-white/10" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="size-9 rounded-xl bg-muted" />
            <div className="h-5 w-20 rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="h-4 w-36 rounded bg-muted" />
        <div className="divide-y divide-border pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between py-4">
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
              <div className="h-5 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EarningsOverview() {
  const [loading, setLoading] = useState(true);
  const [fetchingPeriod, setFetchingPeriod] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [availablePeriods, setAvailablePeriods] = useState<FortnightPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<FortnightPeriod | null>(null);

  const [liveEarnings, setLiveEarnings] = useState<{
    hourlyRate: number;
    approvedHours: number;
    completedTripsCount: number;
    tripBonusPerRide: number;
    tripBonusRate?: number;
    tripBonus: number;
    regularWages: number;
    grossEarnings: number;
    payrollStatus: string;
    payPeriodRange: string;
    expectedPayDate: string;
    isCurrentPeriod?: boolean;
    rideHistory: Array<{
      date: string;
      tripId: string;
      passenger: string;
      type: string;
      pickup: string;
      destination: string;
      status: string;
      bonus: string;
    }>;
  } | null>(null);

  const fetchEarningsForPeriod = async (startDate?: string, endDate?: string) => {
    const { getDriverSession } = await import("@/lib/auth");
    const session = getDriverSession();
    const token = session?.token;
    if (!token) return;

    setFetchingPeriod(true);
    const res = await getDriverEarningsApi(token, startDate, endDate);
    setFetchingPeriod(false);

    if (res.success && res.data) {
      setLiveEarnings(res.data);
      if (res.data.availablePeriods && res.data.availablePeriods.length > 0) {
        setAvailablePeriods(res.data.availablePeriods);
      }
      if (res.data.selectedPeriod) {
        setSelectedPeriod(res.data.selectedPeriod);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchEarningsForPeriod().finally(() => setLoading(false));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPeriod = (period: FortnightPeriod) => {
    setSelectedPeriod(period);
    setSelectorOpen(false);
    fetchEarningsForPeriod(period.startDate, period.endDate);
  };

  const handleNavigatePeriod = (direction: "prev" | "next") => {
    if (!selectedPeriod || availablePeriods.length === 0) return;
    const currentIndex = availablePeriods.findIndex((p) => p.id === selectedPeriod.id);
    if (currentIndex === -1) return;

    const newIndex = direction === "prev" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < availablePeriods.length) {
      const target = availablePeriods[newIndex];
      handleSelectPeriod(target);
    }
  };

  if (loading) {
    return <EarningsSkeleton />;
  }

  const hourlyRate = liveEarnings?.hourlyRate ?? 0;
  const approvedHours = liveEarnings?.approvedHours ?? 0;
  const completedTripsCount = liveEarnings?.completedTripsCount ?? 0;
  const tripBonusRate = liveEarnings?.tripBonusRate ?? liveEarnings?.tripBonusPerRide ?? 3;
  const tripBonus = liveEarnings?.tripBonus ?? (completedTripsCount * tripBonusRate);
  const regularWages = liveEarnings?.regularWages ?? (hourlyRate * approvedHours);
  const grossEarnings = liveEarnings?.grossEarnings ?? (regularWages + tripBonus);

  const payPeriodRange = liveEarnings?.payPeriodRange || selectedPeriod?.label || "Aug 17 – Aug 31, 2026";
  const expectedPayDate = liveEarnings?.expectedPayDate || selectedPeriod?.expectedPayDate || "Sep 4, 2026";
  const isCurrentPeriod = liveEarnings?.isCurrentPeriod ?? selectedPeriod?.isCurrent ?? true;

  const currentPeriodIndex = availablePeriods.findIndex((p) => p.id === selectedPeriod?.id);
  const hasPrevPeriod = currentPeriodIndex < availablePeriods.length - 1;
  const hasNextPeriod = currentPeriodIndex > 0;

  const summary = [
    [`$${hourlyRate}/hr`, "Hourly Rate", CircleDollarSign],
    [`${approvedHours} hrs`, "Approved Hours", Clock3],
    [`${completedTripsCount}`, "Completed Trips", Route],
    [`${completedTripsCount} × $${tripBonusRate}`, "Trip Bonus", TrendingUp],
    [`$${grossEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Total Salary", WalletCards],
  ] as const;

  const rideList = liveEarnings?.rideHistory || [];

  return (
    <section aria-labelledby="earnings-title" className="space-y-5">
      {/* Top Bar: Fortnightly Pay Period Selector */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-muted-foreground hidden sm:block">
          Showing 14-day payroll period records
        </div>
        <div className="relative ml-auto" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setSelectorOpen((v) => !v)}
            disabled={fetchingPeriod}
            className="flex h-10 items-center gap-2.5 rounded-xl border border-border bg-card px-4 text-xs font-semibold shadow-sm transition-all hover:bg-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer"
            aria-expanded={selectorOpen}
            aria-haspopup="true"
          >
            {fetchingPeriod ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <CalendarDays className="size-4 text-primary" />
            )}
            <span className="font-bold text-foreground">{payPeriodRange}</span>
            {isCurrentPeriod && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                CURRENT
              </span>
            )}
            <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${selectorOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Pay Period Selector Dropdown / Popover Modal */}
          {selectorOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card p-4 shadow-2xl animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground">Select Pay Period</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectorOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Quick Stepper Navigation */}
              <div className="my-3 flex items-center justify-between rounded-xl bg-muted/60 p-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleNavigatePeriod("prev")}
                  disabled={!hasPrevPeriod}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                  <span>Previous</span>
                </button>
                <span className="text-[11px] font-bold text-muted-foreground">Fortnightly Cycles</span>
                <button
                  type="button"
                  onClick={() => handleNavigatePeriod("next")}
                  disabled={!hasNextPeriod}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* List of 14-day Fortnightly Periods */}
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                {availablePeriods.map((period) => {
                  const isSelected = selectedPeriod?.id === period.id;
                  return (
                    <button
                      key={period.id}
                      type="button"
                      onClick={() => handleSelectPeriod(period)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 font-bold text-primary border border-primary/20"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">{period.label}</span>
                        <span className="text-[10px] text-muted-foreground">
                          Pay Date: {period.expectedPayDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {period.isCurrent ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                            CURRENT
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                            PAID
                          </span>
                        )}
                        {isSelected && <Check className="size-4 text-primary shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 border-t border-border pt-2 text-[10px] text-muted-foreground text-center">
                System fortnightly pay periods (14 days)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gross Earnings Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#112f5f] text-white shadow-[0_12px_35px_rgba(8,37,82,0.12)]">
        <div className="absolute -top-20 right-[18%] size-56 rounded-full bg-white/[0.035]" />
        <div className="grid md:grid-cols-[1.5fr_1fr]">
          <div className="p-6 sm:p-8">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white/50">
              Estimated gross earnings
            </p>
            <h1
              id="earnings-title"
              className="mt-2 text-4xl font-bold tracking-[-0.04em] text-secondary sm:text-5xl"
            >
              ${grossEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            <p className="mt-2 text-xs text-white/50">
              {isCurrentPeriod ? "Current Pay Period" : "Pay Period Selected"}
            </p>
            <p className="mt-1 text-sm font-semibold">{payPeriodRange}</p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/8 px-4 py-3 text-xs text-white/65 ring-1 ring-white/10">
              <span className={`size-2 rounded-full ${isCurrentPeriod ? "bg-emerald-400" : "bg-blue-400"}`} />
              Expected Pay Date: <strong className="text-white">{expectedPayDate}</strong>
            </p>
          </div>
          <div className="border-t border-white/10 p-6 sm:p-8 md:border-l md:border-t-0">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white/50">
              Payroll status
            </p>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid size-6 place-items-center rounded-full bg-emerald-400 text-[#112f5f]">
                <Check className="size-4" />
              </span>
              <span className="text-sm font-semibold">{liveEarnings?.payrollStatus || (isCurrentPeriod ? "Approved" : "Paid")}</span>
            </div>
            {["Entered into Payroll", "Waiting Deposit", "Paid"].map(
              (label) => {
                const isPaidStatus = !isCurrentPeriod || liveEarnings?.payrollStatus === "Paid";
                return (
                  <div
                    key={label}
                    className={`ml-1 mt-5 flex items-center gap-4 text-sm ${isPaidStatus ? "text-white/80" : "text-white/30"}`}
                  >
                    <span className={`size-5 rounded-full border-2 ${isPaidStatus ? "border-emerald-400 bg-emerald-400/20" : "border-white/25"}`} />
                    {label}
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {summary.map(([value, label, Icon]) => (
          <article
            key={label}
            className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.05)]"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Icon className="size-4" />
            </span>
            <p className="mt-4 text-lg font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </article>
        ))}
      </div>

      {/* Earnings Breakdown */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Earnings Breakdown</h2>
        <dl className="mt-5 divide-y divide-border">
          {[
            ["Regular Wages", `${approvedHours} hrs × $${hourlyRate}/hr`, `$${regularWages.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
            ["Trip Bonus", `${completedTripsCount} trips × $${tripBonusRate.toFixed(2)}`, `$${tripBonus.toFixed(2)}`],
            ["Gross Earnings", `${payPeriodRange} total`, `$${grossEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ].map(([label, detail, amount], index) => (
            <div key={label} className="flex justify-between gap-4 py-4">
              <div>
                <dt className="text-sm font-semibold">{label}</dt>
                <dd className="text-xs text-muted-foreground">{detail}</dd>
              </div>
              <dd
                className={
                  index === 2
                    ? "text-xl font-bold text-secondary"
                    : "text-sm font-bold"
                }
              >
                {amount}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Ride History */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Ride History</h2>
          <span className="text-xs text-muted-foreground font-medium">
            Pay Period: <strong>{payPeriodRange}</strong> · {rideList.length} rides
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[58rem] text-left text-xs">
            <thead className="bg-muted text-[0.65rem] uppercase text-muted-foreground">
              <tr>
                {[
                  "Date",
                  "Trip ID",
                  "Passenger",
                  "Type",
                  "Pickup",
                  "Destination",
                  "Status",
                  "Bonus",
                ].map((head) => (
                  <th key={head} className="px-4 py-3 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rideList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="mx-auto flex flex-col items-center justify-center max-w-sm text-center">
                      <div className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground mb-3">
                        <Inbox className="size-6" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">No Earnings Recorded</h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-normal">
                        There are no completed rides or logged hours found for the pay period <strong>{payPeriodRange}</strong>.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rideList.map((ride, rIdx) => (
                  <tr key={ride.tripId + rIdx}>
                    <td className="px-4 py-3 text-muted-foreground">{ride.date}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{ride.tripId}</td>
                    <td className="px-4 py-3 font-medium">{ride.passenger}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ride.type}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{ride.pickup}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{ride.destination}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        {ride.status || "Completed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{ride.bonus || "+$3.00"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {rideList.length > 0 && (
          <div className="flex items-center justify-between border-t px-5 py-4 text-xs text-muted-foreground">
            <span>Showing {rideList.length} rides for this pay period</span>
            <div className="flex gap-2">
              <button type="button" className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-muted disabled:opacity-40" disabled>
                Prev
              </button>
              <button type="button" className="rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white">
                1
              </button>
              <button type="button" className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-muted disabled:opacity-40" disabled>
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      <aside className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-700">
        <Info className="size-4 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-xs font-semibold">Payroll Disclaimer</h2>
          <p className="mt-1 text-xs leading-5 text-blue-600">
            Earnings shown are estimated and subject to final payroll
            processing for the pay period <strong>{payPeriodRange}</strong>. Scheduled payout date is <strong>{expectedPayDate}</strong>.
          </p>
        </div>
      </aside>
    </section>
  );
}
