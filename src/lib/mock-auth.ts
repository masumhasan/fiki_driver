export const DRIVER_SESSION_KEY = "fiki-transit-driver-session";

export type DriverSession = {
  name: string;
  email: string;
  initials: string;
  vehicle: string;
};

export function saveDriverSession(email?: string) {
  const localPart = email?.split("@")[0] || "john.driver";
  const name = localPart
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const session: DriverSession = {
    name: name === "John Driver" ? "John Rivera" : name,
    email: email || "john.driver@fikitransit.com",
    initials: "JR",
    vehicle: "Toyota Sienna · MIA-4821",
  };
  window.localStorage.setItem(DRIVER_SESSION_KEY, JSON.stringify(session));
}

export function getDriverSession(): DriverSession | null {
  const value = window.localStorage.getItem(DRIVER_SESSION_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as DriverSession;
  } catch {
    return null;
  }
}

export function clearDriverSession() {
  window.localStorage.removeItem(DRIVER_SESSION_KEY);
}
