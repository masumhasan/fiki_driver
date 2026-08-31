"use client";

import { useEffect, useState, useRef } from "react";
import { getDriverSession } from "@/lib/auth";
import {
  getDriverTripsApi,
  getDriverTripByIdApi,
  updateDriverTripStatusApi,
  updateDriverTripNotesApi,
  getTodayShiftApi,
} from "@/lib/api";
import { ShiftAlertModal } from "./ShiftAlertModal";
import { cn } from "@/lib/utils";

import {
  Accessibility,
  ArrowLeft,
  Building2,
  CarFront,
  Check,
  ClipboardList,
  ExternalLink,
  FileCheck2,
  FileText,
  HeartPulse,
  type LucideIcon,
  Map as MapIcon,
  MapPin,
  Navigation,
  Phone,
  Route,
  Save,
  ShieldAlert,
  UserRound,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";

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

type DetailItem = {
  label: string;
  value: string;
};

type SectionHeaderProps = {
  icon: LucideIcon;
  title: string;
};

const quickNotes = [
  "Passenger late",
  "Traffic delay",
  "No issues",
  "Wheelchair assistance",
  "Facility delay",
];

function SectionHeader({ icon: Icon, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-3.5 sm:px-5">
      <span className="grid size-7 place-items-center rounded-lg bg-primary/6 text-primary">
        <Icon aria-hidden="true" className="size-3.5" />
      </span>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function DetailGrid({
  details,
  columns = "three",
}: {
  details: DetailItem[];
  columns?: "two" | "three";
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4",
        columns === "three"
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-2",
      )}
    >
      {details.map((detail) => (
        <div key={detail.label} className="min-w-0">
          <dt className="text-[0.68rem] font-medium text-muted-foreground">
            {detail.label}
          </dt>
          <dd className="mt-1 text-xs font-semibold leading-5 text-foreground">
            {detail.label === "Phone number" &&
            detail.value &&
            detail.value !== "—" ? (
              <a
                href={`tel:${detail.value.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-1.5 text-primary transition-colors hover:text-foreground"
              >
                <Phone aria-hidden="true" className="size-3.5 text-primary" />
                <span>{detail.value}</span>
              </a>
            ) : (
              detail.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function LocationCard({
  address,
  contactName,
  contactPhone,
  contactLabel,
  instructions,
  title,
  type,
  onAction,
  actionText,
  actionDisabled,
}: {
  address: string;
  city?: string;
  contactName: string;
  contactPhone: string;
  contactLabel: string;
  facility?: string;
  instructions?: string;
  title: string;
  type: "pickup" | "dropoff";
  zip?: string;
  onAction?: () => void;
  actionText?: string;
  actionDisabled?: boolean;
}) {
  const isPickup = type === "pickup";

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3.5 sm:px-5">
        <span
          className={cn(
            "grid size-7 place-items-center rounded-lg",
            isPickup
              ? "bg-brand-success/10 text-brand-success"
              : "bg-secondary/16 text-brand-yellow-hover",
          )}
        >
          {isPickup ? (
            <Building2 aria-hidden="true" className="size-3.5" />
          ) : (
            <MapPin aria-hidden="true" className="size-3.5" />
          )}
        </span>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>

      <div className="p-4 sm:p-5">
        <div>
          <p className="text-[0.68rem] font-medium text-muted-foreground">
            Address
          </p>
          <p className="mt-1 text-xs leading-5 text-foreground">{address}</p>
        </div>

        {instructions && (
          <div className="mt-4 rounded-xl border border-secondary/25 bg-secondary/8 p-3">
            <p className="text-[0.68rem] font-semibold text-secondary-foreground">
              Pickup instructions
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {instructions}
            </p>
          </div>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-[0.68rem] font-medium text-muted-foreground">
            {contactLabel}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-foreground">
            <span className="font-semibold">{contactName}</span>
            {contactName && contactPhone && <span>·</span>}
            {contactPhone ? (
              <a
                href={`tel:${contactPhone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-1.5 text-primary transition-colors hover:text-foreground"
              >
                <Phone aria-hidden="true" className="size-3.5" />
                <span>{contactPhone}</span>
              </a>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
        {actionText && (
          <button
            type="button"
            disabled={actionDisabled}
            onClick={onAction}
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-secondary text-xs font-bold text-secondary-foreground shadow-[0_4px_10px_rgba(255,189,32,0.28)] transition-colors hover:bg-brand-yellow-hover disabled:opacity-50"
          >
            {actionText}
          </button>
        )}
      </div>
    </section>
  );
}

function formatStepTime(dateVal?: string | Date): string | null {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function TripStatusPanel({
  status,
  trip,
  onNextStatus,
  nextActionText,
}: {
  status: string;
  trip?: any;
  onNextStatus?: () => void;
  nextActionText?: string;
}) {
  const getStepStates = (currentStatus: string, tripObj: any) => {
    const createdTime = formatStepTime(tripObj?.createdAt) || "9:40 AM";
    const assignedTime =
      formatStepTime(tripObj?.assignedAt || tripObj?.createdAt) || createdTime;
    const acceptedTime =
      formatStepTime(
        tripObj?.acceptedAt || tripObj?.assignedAt || tripObj?.createdAt,
      ) || assignedTime;
    const arrivingTime = formatStepTime(tripObj?.arrivingAt);
    const arrivedTime = formatStepTime(tripObj?.arrivedAt);
    const inProgressTime = formatStepTime(
      tripObj?.inProgressAt || tripObj?.startedAt,
    );
    const completedTime = formatStepTime(tripObj?.completedAt);

    switch (currentStatus) {
      case "ACCEPTED":
        return [
          { label: "Assigned", state: "complete", time: assignedTime },
          { label: "Accepted", state: "complete", time: acceptedTime },
          {
            label: "Heading to pickup",
            state: "current",
            time: arrivingTime || acceptedTime,
          },
          { label: "Passenger picked up", state: "upcoming", time: null },
          { label: "Heading to destination", state: "upcoming", time: null },
          { label: "Trip completed", state: "upcoming", time: null },
        ];
      case "DRIVER_ARRIVING":
        return [
          { label: "Assigned", state: "complete", time: assignedTime },
          { label: "Accepted", state: "complete", time: acceptedTime },
          {
            label: "Heading to pickup",
            state: "complete",
            time: arrivingTime || acceptedTime,
          },
          {
            label: "Passenger picked up",
            state: "current",
            time: arrivedTime || arrivingTime,
          },
          { label: "Heading to destination", state: "upcoming", time: null },
          { label: "Trip completed", state: "upcoming", time: null },
        ];
      case "DRIVER_ARRIVED":
        return [
          { label: "Assigned", state: "complete", time: assignedTime },
          { label: "Accepted", state: "complete", time: acceptedTime },
          {
            label: "Heading to pickup",
            state: "complete",
            time: arrivingTime || acceptedTime,
          },
          {
            label: "Passenger picked up",
            state: "complete",
            time: arrivedTime || arrivingTime,
          },
          {
            label: "Heading to destination",
            state: "current",
            time: inProgressTime || arrivedTime,
          },
          { label: "Trip completed", state: "upcoming", time: null },
        ];
      case "IN_PROGRESS":
        return [
          { label: "Assigned", state: "complete", time: assignedTime },
          { label: "Accepted", state: "complete", time: acceptedTime },
          {
            label: "Heading to pickup",
            state: "complete",
            time: arrivingTime || acceptedTime,
          },
          {
            label: "Passenger picked up",
            state: "complete",
            time: arrivedTime || arrivingTime,
          },
          {
            label: "Heading to destination",
            state: "current",
            time: inProgressTime || arrivedTime,
          },
          { label: "Trip completed", state: "upcoming", time: null },
        ];
      case "COMPLETED":
        return [
          { label: "Assigned", state: "complete", time: assignedTime },
          { label: "Accepted", state: "complete", time: acceptedTime },
          {
            label: "Heading to pickup",
            state: "complete",
            time: arrivingTime || acceptedTime,
          },
          {
            label: "Passenger picked up",
            state: "complete",
            time: arrivedTime || arrivingTime,
          },
          {
            label: "Heading to destination",
            state: "complete",
            time: inProgressTime || arrivedTime,
          },
          {
            label: "Trip completed",
            state: "complete",
            time: completedTime || inProgressTime,
          },
        ];
      default:
        return [
          { label: "Assigned", state: "complete", time: assignedTime },
          { label: "Accepted", state: "complete", time: acceptedTime },
          { label: "Heading to pickup", state: "upcoming", time: null },
          { label: "Passenger picked up", state: "upcoming", time: null },
          { label: "Heading to destination", state: "upcoming", time: null },
          { label: "Trip completed", state: "upcoming", time: null },
        ];
    }
  };

  const steps = getStepStates(status, trip);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <SectionHeader icon={Route} title="Trip status" />
      <div className="p-4 sm:p-5">
        <ol>
          {steps.map((step, index) => {
            const isComplete = step.state === "complete";
            const isCurrent = step.state === "current";
            const isLast = index === steps.length - 1;

            return (
              <li
                key={step.label}
                className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2.5"
              >
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full border",
                      isComplete &&
                        "border-brand-success bg-brand-success text-primary-foreground",
                      isCurrent &&
                        "border-secondary bg-secondary text-secondary-foreground",
                      step.state === "upcoming" &&
                        "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {isComplete ? (
                      <Check aria-hidden="true" className="size-3.5" />
                    ) : (
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          isCurrent ? "bg-secondary-foreground" : "bg-border",
                        )}
                      />
                    )}
                  </span>
                  {!isLast && (
                    <span
                      className={cn(
                        "min-h-5 w-px flex-1",
                        isComplete ? "bg-brand-success" : "bg-border",
                      )}
                    />
                  )}
                </div>

                <div className={cn("pb-4 pt-0.5", isLast && "pb-0")}>
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        step.state === "upcoming"
                          ? "text-muted-foreground"
                          : "text-foreground",
                      )}
                    >
                      {step.label}
                    </p>
                    {step.time && (
                      <span className="text-[11px] font-bold text-primary">
                        {step.time}
                      </span>
                    )}
                  </div>
                  {isCurrent && (
                    <p className="mt-1 text-[0.68rem] font-medium text-brand-yellow-hover">
                      Current status
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {nextActionText && (
          <button
            type="button"
            onClick={onNextStatus}
            className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {nextActionText}
            <ArrowLeft aria-hidden="true" className="size-3.5 rotate-180" />
          </button>
        )}
      </div>
    </section>
  );
}

function DriverNotes({
  initialNotes,
  onSave,
}: {
  initialNotes: string;
  onSave: (notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleAddQuickNote = (quick: string) => {
    setNotes((prev) => (prev ? `${prev}. ${quick}` : quick));
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await onSave(notes);
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <SectionHeader icon={FileText} title="Driver notes" />
      <div className="p-4 sm:p-5">
        <fieldset>
          <legend className="text-[0.68rem] font-medium text-muted-foreground">
            Quick notes
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {quickNotes.map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => handleAddQuickNote(note)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-[0.68rem] font-medium text-muted-foreground transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {note}
              </button>
            ))}
          </div>
        </fieldset>

        <label
          htmlFor="driver-notes"
          className="mt-4 block text-[0.68rem] font-medium text-muted-foreground"
        >
          Notes
        </label>
        <textarea
          id="driver-notes"
          name="driverNotes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add trip notes, observations, or issues..."
          className="mt-2 w-full resize-y rounded-xl border border-input bg-muted px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-ring focus:ring-3 focus:ring-ring/12"
        />

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveNotes}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
        >
          <Save aria-hidden="true" className="size-3.5" />
          {saving ? "Saving..." : savedMsg ? "Notes saved!" : "Save notes"}
        </button>
      </div>
    </section>
  );
}

function SignaturePad({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (val: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange?.(canvas.toDataURL());
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange?.("");
  };

  return (
    <div className="relative w-full h-36 border border-border rounded-xl bg-slate-50 overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button
        type="button"
        onClick={clear}
        className="absolute top-2 right-2 rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 shadow-sm cursor-pointer"
      >
        Clear
      </button>
    </div>
  );
}

function HandToHandSignatureModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    receiverName: string;
    receiverRelationship: string;
    receiverSignature: string;
  }) => void;
}) {
  const [receiverName, setReceiverName] = useState("");
  const [receiverRelationship, setReceiverRelationship] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName.trim()) {
      setError("Please enter the receiver's full name.");
      return;
    }
    if (!signature) {
      setError("Please capture the receiver's digital signature.");
      return;
    }
    setError("");
    onConfirm({
      receiverName: receiverName.trim(),
      receiverRelationship:
        receiverRelationship.trim() || "Assigned Representative",
      receiverSignature: signature,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2 text-primary">
            <FileCheck2 className="size-5" />
            <h3 className="text-base font-bold text-foreground">
              Hand to Hand Verification
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            This trip requires Hand to Hand drop-off verification. Please
            capture the assigned receiver's details and digital signature to
            complete the trip.
          </p>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold text-foreground">
              Receiver Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-foreground">
              Receiver Relationship / Role (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Nurse, Guardian, Staff, Family Member"
              value={receiverRelationship}
              onChange={(e) => setReceiverRelationship(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-foreground">
              Receiver Digital Signature *
            </label>
            <SignaturePad value={signature} onChange={setSignature} />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Sign above using finger or mouse.
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-success px-5 py-2 text-xs font-bold text-white hover:bg-emerald-600 shadow-sm cursor-pointer"
            >
              Confirm & Complete Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RideDetailsOverview() {
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [shiftStatus, setShiftStatus] = useState<string | null>(null);
  const [showShiftAlert, setShowShiftAlert] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const fetchTrip = async () => {
    if (typeof window === "undefined") return;
    const session = getDriverSession();
    const token = session?.token;
    if (!token) {
      setLoading(false);
      return;
    }

    getTodayShiftApi(token).then((res) => {
      if (res.success && res.data && res.data.shift) {
        setShiftStatus(res.data.shift.status);
      } else {
        setShiftStatus(null);
      }
    });

    const queryId = new URLSearchParams(window.location.search).get("id");

    try {
      if (queryId) {
        const res = await getDriverTripByIdApi(token, queryId);
        if (res.success && res.data) {
          setTrip(res.data);
          setLoading(false);
          return;
        }
      }

      const res = await getDriverTripsApi(token);
      if (
        res.success &&
        res.data &&
        Array.isArray(res.data.trips) &&
        res.data.trips.length > 0
      ) {
        setTrip(res.data.trips[0]);
      }
    } catch {
      // error handling fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    if (!trip) return;
    const isHandToHand =
      Array.isArray(trip.mobilityOptions) &&
      trip.mobilityOptions.some((opt: string) =>
        opt.toLowerCase().includes("hand"),
      );

    if (newStatus === "COMPLETED" && isHandToHand && !trip.receiverSignature) {
      setShowSignatureModal(true);
      return;
    }

    const session = getDriverSession();
    const token = session?.token;
    if (!token) return;
    const res = await updateDriverTripStatusApi(token, trip._id, newStatus);
    if (res.success) {
      fetchTrip();
    } else if (res.error?.code === "SHIFT_NOT_STARTED") {
      setShowShiftAlert(true);
    }
  };

  const handleConfirmHandToHand = async (data: {
    receiverName: string;
    receiverRelationship: string;
    receiverSignature: string;
  }) => {
    if (!trip) return;
    const session = getDriverSession();
    const token = session?.token;
    if (!token) return;
    const res = await updateDriverTripStatusApi(
      token,
      trip._id,
      "COMPLETED",
      data,
    );
    if (res.success) {
      setShowSignatureModal(false);
      fetchTrip();
    } else if (res.error?.code === "SHIFT_NOT_STARTED") {
      setShowSignatureModal(false);
      setShowShiftAlert(true);
    }
  };

  const handleSaveNotes = async (newNotes: string) => {
    if (!trip) return;
    const session = getDriverSession();
    const token = session?.token;
    if (!token) return;
    await updateDriverTripNotesApi(token, trip._id, newNotes);
    fetchTrip();
  };

  function RideDetailsSkeleton() {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-5 animate-pulse">
        {/* Top Bar Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-20 rounded-xl bg-muted" />
            <div className="h-5 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-24 rounded bg-muted" />
              <div className="h-6 w-20 rounded-full bg-muted" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 rounded-xl bg-muted" />
            <div className="h-9 w-32 rounded-xl bg-muted" />
          </div>
        </div>

        {/* Main Trip Card Skeleton */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-2xl bg-muted shrink-0" />
              <div className="space-y-2">
                <div className="h-5 w-40 rounded bg-muted" />
                <div className="h-3 w-28 rounded bg-muted" />
                <div className="flex gap-2 pt-1">
                  <div className="h-5 w-20 rounded-full bg-muted" />
                  <div className="h-5 w-16 rounded-full bg-muted" />
                </div>
              </div>
            </div>
            <div className="flex gap-6 sm:border-l sm:border-border sm:pl-8">
              <div className="space-y-1 text-right">
                <div className="h-3 w-10 rounded bg-muted ml-auto" />
                <div className="h-4 w-20 rounded bg-muted ml-auto" />
              </div>
              <div className="space-y-1 text-right">
                <div className="h-3 w-10 rounded bg-muted ml-auto" />
                <div className="h-4 w-16 rounded bg-muted ml-auto" />
              </div>
              <div className="space-y-1 text-right">
                <div className="h-3 w-10 rounded bg-muted ml-auto" />
                <div className="h-4 w-16 rounded bg-muted ml-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Grid 2 Column Layout Skeleton */}
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted/60" />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="h-4 w-36 rounded bg-muted" />
              <div className="h-12 rounded-xl bg-muted/40" />
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="h-4 w-36 rounded bg-muted" />
              <div className="h-12 rounded-xl bg-muted/40" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-16 rounded bg-muted" />
                    <div className="h-4 w-24 rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-24 rounded-xl bg-muted/40" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return <RideDetailsSkeleton />;
  }

  const session = getDriverSession();
  const driverName = session?.name || "Driver";
  const vehicleObj = session?.vehicle;
  const vehicleStr = vehicleObj
    ? `${[vehicleObj.make, vehicleObj.model].filter(Boolean).join(" ")} · ${vehicleObj.licensePlate || "—"}`
    : "Toyota Sienna · MIA-4821";

  if (!trip) {
    return (
      <section className="mx-auto w-full max-w-6xl p-10 text-center">
        <div className="rounded-2xl border border-border bg-card p-10 shadow-sm">
          <p className="text-base font-bold text-foreground">
            No Ride Details Available
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            You currently have no active or scheduled rides assigned.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    );
  }

  // Data extraction
  const tripDisplayId = `TRP-${trip._id.substring(trip._id.length - 4).toUpperCase()}`;
  const passengerName = trip.fullName || trip.passengerId?.name || "Passenger";
  const passengerPhone = trip.phoneNumber || trip.passengerId?.phone || "";
  const cleanPassengerPhone = passengerPhone
    ? passengerPhone.replace(/[^\d+]/g, "")
    : "";
  const passengerInitials =
    passengerName
      .split(" ")
      .filter(Boolean)
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "PA";

  const mobilityType =
    Array.isArray(trip.mobilityOptions) && trip.mobilityOptions.length > 0
      ? trip.mobilityOptions.join(", ")
      : "Wheelchair";
  const tripType = trip.tripType || "One way";

  const pickupAddress =
    trip.pickupLocation?.address ||
    trip.streetAddress ||
    "1204 NW 14th Ave, Miami, FL";
  const dropoffAddress =
    trip.dropoffLocation?.address ||
    trip.returnDestinationAddress ||
    "1611 NW 12th Ave, Miami, FL";

  const pickupDateStr = trip.pickupDate
    ? new Date(trip.pickupDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date(trip.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  const pickupTimeStr = trip.pickupTime ? formatTimeTo12Hour(trip.pickupTime) : "8:00 AM";
  const dropoffTimeStr = trip.appointmentTime ? formatTimeTo12Hour(trip.appointmentTime) : "8:45 AM";

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickupAddress)}&destination=${encodeURIComponent(dropoffAddress)}`;

  // Determine status button & status badge
  let statusBadgeLabel = "In progress";
  let pickupActionText = "";
  let pickupActionNext = "";
  let dropoffActionText = "";
  let dropoffActionNext = "";
  let nextStatusText = "";
  let nextStatusVal = "";

  if (trip.status === "ACCEPTED") {
    statusBadgeLabel = "Accepted";
    pickupActionText = "Start pickup";
    pickupActionNext = "DRIVER_ARRIVING";
    nextStatusText = "Mark heading to pickup";
    nextStatusVal = "DRIVER_ARRIVING";
  } else if (trip.status === "DRIVER_ARRIVING") {
    statusBadgeLabel = "Heading to pickup";
    pickupActionText = "Mark Arrived";
    pickupActionNext = "DRIVER_ARRIVED";
    nextStatusText = "Mark arrived at pickup";
    nextStatusVal = "DRIVER_ARRIVED";
  } else if (trip.status === "DRIVER_ARRIVED") {
    statusBadgeLabel = "Arrived at pickup";
    pickupActionText = "Pick up passenger";
    pickupActionNext = "IN_PROGRESS";
    nextStatusText = "Pick up passenger";
    nextStatusVal = "IN_PROGRESS";
  } else if (trip.status === "IN_PROGRESS") {
    statusBadgeLabel = "Heading to destination";
    dropoffActionText = "Complete drop-off";
    dropoffActionNext = "COMPLETED";
    nextStatusText = "Complete drop-off";
    nextStatusVal = "COMPLETED";
  } else if (trip.status === "COMPLETED") {
    statusBadgeLabel = "Completed";
  }

  const passengerDetails: DetailItem[] = [
    { label: "Full name", value: passengerName },
    { label: "Phone number", value: passengerPhone },
    { label: "Mobility type", value: mobilityType },
    {
      label: "Additional attendant",
      value: trip.additionalAttendant ? "Yes" : "No",
    },
  ];

  const tripDetailsList: DetailItem[] = [
    { label: "Assigned driver", value: driverName },
    { label: "Assigned vehicle", value: vehicleStr },
    { label: "Trip distance", value: "3.2 mi" },
    { label: "Estimated duration", value: "18 min" },
    { label: "Recurring schedule", value: trip.schedule || "One-time trip" },
  ];

  return (
    <section
      aria-labelledby="ride-details-title"
      className="mx-auto w-full max-w-6xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Back
          </Link>
          <span className="hidden h-5 w-px bg-border sm:block" />
          <div className="min-w-0">
            <div className="mt-0.5 flex items-center gap-2">
              <h1
                id="ride-details-title"
                className="text-base font-bold tracking-tight text-foreground"
              >
                {tripDisplayId}
              </h1>
              <span className="rounded-full border border-secondary/50 bg-secondary/14 px-2.5 py-1 text-[0.68rem] font-semibold text-secondary-foreground">
                {statusBadgeLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-card px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Navigation aria-hidden="true" className="size-3.5" />
            <span className="hidden sm:inline">Google Maps</span>
            <span className="sm:hidden">Maps</span>
          </a>
          <a
            href={`tel:${cleanPassengerPhone || passengerPhone}`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-brand-success/25 bg-card px-3 text-xs font-semibold text-brand-success transition-colors hover:bg-brand-success/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Phone aria-hidden="true" className="size-3.5" />
            <span className="hidden sm:inline">Call passenger</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </div>

      <section className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-[0_6px_22px_rgba(8,37,82,0.05)] sm:p-5">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary/20 text-sm font-bold text-secondary-foreground">
              {passengerInitials}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight text-foreground">
                {passengerName}
              </h2>
              <a
                href={`tel:${cleanPassengerPhone || passengerPhone}`}
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone aria-hidden="true" className="size-3.5" />
                {passengerPhone || "—"}
              </a>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-1 text-[0.68rem] font-medium text-primary">
                  <Accessibility aria-hidden="true" className="size-3" />
                  {mobilityType}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground">
                  <Route aria-hidden="true" className="size-3" />
                  {tripType}
                </span>
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-5 border-t border-border pt-4 text-right sm:block sm:space-y-3 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <div>
              <dt className="text-[0.65rem] text-muted-foreground">Date</dt>
              <dd className="mt-1 text-xs font-semibold text-foreground">
                {pickupDateStr}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] text-muted-foreground">Pickup</dt>
              <dd className="mt-1 text-xs font-semibold text-foreground">
                {pickupTimeStr}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] text-muted-foreground">Drop-off</dt>
              <dd className="mt-1 text-xs font-semibold text-foreground">
                {dropoffTimeStr}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <LocationCard
          type="pickup"
          title="Pickup information"
          address={pickupAddress}
          instructions={
            trip.driverNotes ||
            trip.specialInstructions ||
            trip.accessInformation ||
            "Call upon arrival. Use the main entrance on the west side."
          }
          contactLabel="Pickup contact"
          contactName="Front Desk"
          contactPhone={passengerPhone}
          actionText={pickupActionText}
          onAction={() => handleStatusChange(pickupActionNext)}
        />
        <LocationCard
          type="dropoff"
          title="Drop-off information"
          address={dropoffAddress}
          contactLabel="Destination contact"
          contactName={
            trip.emergencyContactPhone
              ? trip.emergencyContactName || "Admissions"
              : "Admissions"
          }
          contactPhone={trip.emergencyContactPhone || "(305) 555-0140"}
          actionText={dropoffActionText}
          onAction={() => handleStatusChange(dropoffActionNext)}
        />
      </div>

      <div className="mt-4 space-y-4">
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <SectionHeader icon={UserRound} title="Passenger information" />
          <div className="p-4 sm:p-5">
            <DetailGrid details={passengerDetails} columns="two" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-primary/12 bg-primary/4 p-3">
                <div className="flex items-center gap-2 text-primary">
                  <Accessibility aria-hidden="true" className="size-3.5" />
                  <p className="text-[0.68rem] font-semibold">Mobility type</p>
                </div>
                <p className="mt-1.5 text-xs font-bold leading-5 text-foreground capitalize">
                  {mobilityType}
                </p>
              </div>
              <div className="rounded-xl border border-primary/12 bg-primary/4 p-3">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldAlert aria-hidden="true" className="size-3.5" />
                  <p className="text-[0.68rem] font-semibold">
                    Emergency contact
                  </p>
                </div>
                <div className="mt-1.5 text-xs leading-5 text-muted-foreground flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-foreground">
                    {trip.emergencyContactName || "Linda Johnson"}
                  </span>
                  <span>·</span>
                  <a
                    href={`tel:${(trip.emergencyContactPhone || "(305) 555-0198").replace(/[^\d+]/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-primary transition-colors hover:text-foreground"
                  >
                    <Phone aria-hidden="true" className="size-3.5" />
                    <span>
                      {trip.emergencyContactPhone || "(305) 555-0198"}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <SectionHeader icon={ClipboardList} title="Trip information" />
          <div className="p-4 sm:p-5">
            <DetailGrid details={tripDetailsList} columns="three" />
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mx-auto mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-6 text-xs font-bold text-secondary-foreground hover:bg-brand-yellow-hover sm:w-auto"
            >
              <Navigation className="size-3.5" />
              Open Google Maps
            </a>
          </div>
        </section>
      </div>

      <div className="mt-4">
        <TripStatusPanel
          status={trip.status}
          trip={trip}
          onNextStatus={() =>
            nextStatusVal && handleStatusChange(nextStatusVal)
          }
          nextActionText={nextStatusText}
        />
      </div>

      <div className="mt-4">
        <DriverNotes
          initialNotes={trip.driverShiftNotes || ""}
          onSave={handleSaveNotes}
        />
      </div>

      <ShiftAlertModal
        isOpen={showShiftAlert}
        onClose={() => setShowShiftAlert(false)}
      />

      <HandToHandSignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onConfirm={handleConfirmHandToHand}
      />
    </section>
  );
}
