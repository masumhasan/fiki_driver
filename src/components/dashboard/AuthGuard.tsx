"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { getDriverSession, clearDriverSession } from "@/lib/auth";
import { Clock, CheckCircle, XCircle, LogOut } from "lucide-react";

function PendingApprovalScreen({ name, status }: { name: string; status: "PENDING" | "REJECTED" }) {
  const router = useRouter();

  function handleSignOut() {
    clearDriverSession();
    router.replace("/login");
  }

  const isRejected = status === "REJECTED";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      {/* Glow backdrop */}
      <div
        className={`pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,${
          isRejected ? "hsl(0_80%_60%/0.08)" : "hsl(var(--secondary)/0.12)"
        },transparent)]`}
      />

      <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 text-center shadow-xl shadow-black/5 backdrop-blur-sm">
        {/* Icon */}
        <div
          className={`mx-auto mb-6 flex size-20 items-center justify-center rounded-full ${
            isRejected
              ? "bg-red-100 text-red-500"
              : "bg-amber-100 text-amber-500"
          }`}
        >
          {isRejected ? (
            <XCircle className="size-10" strokeWidth={1.5} />
          ) : (
            <Clock className="size-10 animate-pulse" strokeWidth={1.5} />
          )}
        </div>

        {/* Heading */}
        <h1 className="text-xl font-bold text-foreground">
          {isRejected ? "Application Not Approved" : "Pending Admin Approval"}
        </h1>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Hello, {name.split(" ")[0]}!
        </p>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {isRejected ? (
            <>
              Unfortunately your driver application was not approved at this time.
              Please contact FIKI Transit support for more information.
            </>
          ) : (
            <>
              Your driver account is currently under review. Our team will
              verify your credentials and documents before granting access to
              the driver portal.
            </>
          )}
        </p>

        {/* Steps (only for PENDING) */}
        {!isRejected && (
          <div className="mt-6 space-y-3 rounded-2xl bg-muted/60 p-4 text-left">
            {[
              { label: "Account created", done: true },
              { label: "Application under review", done: false, active: true },
              { label: "Background verification", done: false },
              { label: "Approval & vehicle assignment", done: false },
            ].map(({ label, done, active }) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                    done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : active
                        ? "border-amber-400 bg-amber-50 text-amber-600"
                        : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <CheckCircle className="size-3" /> : null}
                </span>
                <span
                  className={`text-xs font-medium ${
                    done || active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Support contact */}
        <p className="mt-5 text-xs text-muted-foreground">
          Questions?{" "}
          <a
            href="mailto:support@fikitransit.com"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Contact support
          </a>
        </p>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-input bg-muted py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "pending" | "rejected" | "ready">("loading");
  const [driverName, setDriverName] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<"PENDING" | "REJECTED">("PENDING");

  useEffect(() => {
    const session = getDriverSession();

    // No session or missing token → send to login
    if (!session || !session.token) {
      router.replace("/login");
      return;
    }

    // Extra safety: ensure it's actually a driver session
    if (session.role !== "DRIVER") {
      router.replace("/login");
      return;
    }

    // Check driver approval status
    const approval = session.approvalStatus ?? "PENDING";
    if (approval === "PENDING" || approval === "REJECTED") {
      setDriverName(session.name || "Driver");
      setApprovalStatus(approval);
      setState(approval === "REJECTED" ? "rejected" : "pending");
      return;
    }

    setState("ready");
  }, [router]);

  if (state === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (state === "pending" || state === "rejected") {
    return (
      <PendingApprovalScreen
        name={driverName}
        status={approvalStatus}
      />
    );
  }

  return <>{children}</>;
}
