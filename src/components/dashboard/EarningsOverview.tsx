"use client";

import { useEffect, useState } from "react";
import { getDriverEarningsApi } from "@/lib/api";
import {
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  Info,
  Route,
  TrendingUp,
  WalletCards,
} from "lucide-react";

const summary = [
  ["$14/hr", "Hourly Rate", CircleDollarSign],
  ["80 hrs", "Approved Hours", Clock3],
  ["40", "Completed Trips", Route],
  ["40 × $3", "Trip Bonus", TrendingUp],
  ["$1,240.00", "Total Salary", WalletCards],
] as const;

const rides = [
  [
    "Jul 27",
    "TRP-1001",
    "Maria Chen",
    "Standard",
    "123 Main St",
    "Miami Airport",
  ],
  [
    "Jul 27",
    "TRP-1002",
    "James Wilson",
    "Express",
    "45 Park Ave",
    "Brickell City",
  ],
  [
    "Jul 26",
    "TRP-1003",
    "Sarah Johnson",
    "Standard",
    "789 Oak Blvd",
    "Wynwood Arts",
  ],
  [
    "Jul 26",
    "TRP-1004",
    "Robert Davis",
    "Standard",
    "321 Elm St",
    "Coral Gables",
  ],
  [
    "Jul 25",
    "TRP-1005",
    "Emily Martinez",
    "Express",
    "654 Pine Rd",
    "South Beach",
  ],
  [
    "Jul 25",
    "TRP-1006",
    "Michael Brown",
    "Standard",
    "987 Cedar Ln",
    "Coconut Grove",
  ],
  [
    "Jul 24",
    "TRP-1007",
    "Jessica Taylor",
    "Standard",
    "147 Maple Dr",
    "Little Havana",
  ],
  [
    "Jul 24",
    "TRP-1008",
    "David Anderson",
    "Express",
    "258 Birch Way",
    "Design District",
  ],
];

export function EarningsOverview() {
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

  useEffect(() => {
    import("@/lib/auth").then(({ getDriverSession }) => {
      const session = getDriverSession();
      const token = session?.token;
      if (token) {
        getDriverEarningsApi(token).then((res) => {
          if (res.success && res.data) {
            setLiveEarnings(res.data);
          }
        });
      }
    });
  }, []);

  const hourlyRate = liveEarnings?.hourlyRate ?? 14;
  const approvedHours = liveEarnings?.approvedHours ?? 80;
  const completedTripsCount = liveEarnings?.completedTripsCount ?? 40;
  const tripBonusRate = liveEarnings?.tripBonusRate ?? liveEarnings?.tripBonusPerRide ?? 3;
  const tripBonus = liveEarnings?.tripBonus ?? (completedTripsCount * tripBonusRate);
  const regularWages = liveEarnings?.regularWages ?? (hourlyRate * approvedHours);
  const grossEarnings = liveEarnings?.grossEarnings ?? (regularWages + tripBonus);

  const payPeriodRange = liveEarnings?.payPeriodRange || "Jul 14 – Jul 27, 2026";
  const expectedPayDate = liveEarnings?.expectedPayDate || "Jul 31, 2026";

  const summary = [
    [`$${hourlyRate}/hr`, "Hourly Rate", CircleDollarSign],
    [`${approvedHours} hrs`, "Approved Hours", Clock3],
    [`${completedTripsCount}`, "Completed Trips", Route],
    [`${completedTripsCount} × $${tripBonusRate}`, "Trip Bonus", TrendingUp],
    [`$${grossEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Total Salary", WalletCards],
  ] as const;

  const rideList = liveEarnings?.rideHistory?.length
    ? liveEarnings.rideHistory.map((r) => [
        r.date,
        r.tripId,
        r.passenger,
        r.type,
        r.pickup,
        r.destination,
        r.status,
        r.bonus,
      ])
    : rides;

  return (
    <section aria-labelledby="earnings-title" className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-semibold shadow-sm"
        >
          <CalendarDays className="size-4 text-muted-foreground" /> {payPeriodRange}
        </button>
      </div>

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
            <p className="mt-2 text-xs text-white/50">Current Pay Period</p>
            <p className="mt-1 text-sm font-semibold">{payPeriodRange}</p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/8 px-4 py-3 text-xs text-white/65 ring-1 ring-white/10">
              <span className="size-2 rounded-full bg-emerald-400" /> Expected
              Pay Date: <strong className="text-white">{expectedPayDate}</strong>
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
              <span className="text-sm font-semibold">{liveEarnings?.payrollStatus || "Approved"}</span>
            </div>
            {["Entered into Payroll", "Waiting Deposit", "Paid"].map(
              (label) => (
                <div
                  key={label}
                  className="ml-1 mt-5 flex items-center gap-4 text-sm text-white/30"
                >
                  <span className="size-5 rounded-full border-2 border-white/25" />
                  {label}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

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

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Earnings Breakdown</h2>
        <dl className="mt-5 divide-y divide-border">
          {[
            ["Regular Wages", `${approvedHours} hrs × $${hourlyRate}/hr`, `$${regularWages.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
            ["Trip Bonus", `${completedTripsCount} trips × $${tripBonusRate.toFixed(2)}`, `$${tripBonus.toFixed(2)}`],
            ["Gross Earnings", "Current pay period total", `$${grossEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
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

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Ride History</h2>
          <span className="text-xs text-muted-foreground">
            Pay Period {payPeriodRange} · {rideList.length} rides
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
              {rideList.map((ride, rIdx) => (
                <tr key={ride[1] + rIdx}>
                  {ride.slice(0, 6).map((cell, index) => (
                    <td
                      key={index}
                      className={`px-4 py-3 ${index === 1 ? "font-semibold text-blue-600" : index === 0 || index > 2 ? "text-muted-foreground" : ""}`}
                    >
                      {cell}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                      {ride[6] || "Completed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600">{ride[7] || "+$3.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-5 py-4 text-xs text-muted-foreground">
          <span>Page 1 of 2</span>
          <div className="flex gap-2">
            <button type="button" className="rounded-lg border px-3 py-2">
              Prev
            </button>
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-3 py-2 font-bold text-white"
            >
              1
            </button>
            <button type="button" className="rounded-lg border px-3 py-2">
              2
            </button>
            <button type="button" className="rounded-lg border px-3 py-2">
              Next
            </button>
          </div>
        </div>
      </section>

      <aside className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-700">
        <Info className="size-4 shrink-0" />
        <div>
          <h2 className="text-xs font-semibold">Payroll Disclaimer</h2>
          <p className="mt-1 text-xs leading-5 text-blue-600">
            Earnings shown are estimated and subject to final payroll
            processing. Actual amounts may vary slightly. Payment is scheduled
            for <strong>Jul 31, 2026.</strong>
          </p>
        </div>
      </aside>
    </section>
  );
}
