"use client";

import { AlertTriangle, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface ShiftAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function ShiftAlertModal({
  isOpen,
  onClose,
  title = "Shift Not Started",
  message = "You must start your shift from the 'My Schedule & Attendance' page before performing trip actions or starting a pickup.",
}: ShiftAlertModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shift-alert-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
          <AlertTriangle className="size-7" />
        </div>

        <div className="space-y-2">
          <h2 id="shift-alert-title" className="text-lg font-bold text-foreground">
            {title}
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {message}
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Link
            href="/schedule-attendance"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 text-xs font-bold text-white shadow-md transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Go to Schedule & Attendance <ArrowRight className="size-4" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-full rounded-xl border border-border text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
