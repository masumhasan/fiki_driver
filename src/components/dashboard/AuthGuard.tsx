"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { getDriverSession } from "@/lib/auth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

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

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
