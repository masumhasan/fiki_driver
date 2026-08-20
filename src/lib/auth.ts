export const DRIVER_SESSION_KEY = "fiki_driver_session";

export type DriverSession = {
  userId: string;
  token: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  accountStatus: string;
  /** PENDING until admin approves; APPROVED once admin approves */
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  /** Populated from DriverProfile after login */
  vehicle?: {
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    licensePlate?: string;
  };
  availabilityStatus?: "OFFLINE" | "ONLINE" | "ASSIGNED" | "UNAVAILABLE";
};

export function saveDriverSession(session: DriverSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRIVER_SESSION_KEY, JSON.stringify(session));
}

export function getDriverSession(): DriverSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DRIVER_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DriverSession;
  } catch {
    return null;
  }
}

export function clearDriverSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRIVER_SESSION_KEY);
}

/** Derive display initials from a full name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/** Format vehicle summary for sidebar quick-info */
export function formatVehicleLine(vehicle?: DriverSession["vehicle"]): string {
  if (!vehicle) return "—";
  const parts = [vehicle.make, vehicle.model].filter(Boolean).join(" ");
  return parts || "—";
}
