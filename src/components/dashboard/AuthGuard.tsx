"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { getDriverSession } from "@/lib/mock-auth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getDriverSession()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  return ready ? children : null;
}
