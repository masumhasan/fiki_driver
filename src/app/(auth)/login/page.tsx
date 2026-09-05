import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";

const portalBenefits = ["24/7 Support", "HIPAA Compliant", "Real-Time Updates"];

export const metadata: Metadata = {
  title: "Driver Sign In | FIKI Transit",
  description:
    "Securely sign in to the FIKI Transit driver portal to access your schedule and trips.",
};

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-12 place-items-center rounded-[15px] bg-card">
        <Image
          src="/logo.png"
          alt=""
          width={48}
          height={48}
          className="size-10"
          priority
        />
      </span>
      <div className="leading-none">
        <p className="text-xl font-bold tracking-[-0.02em] text-primary-foreground">
          FIKI TRANSIT
        </p>
        <p className="mt-1.5 text-xs font-semibold tracking-[0.16em] text-secondary">
          DRIVER PORTAL
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="h-svh overflow-hidden bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-1/2 overflow-hidden bg-primary text-primary-foreground lg:block">
        <Image
          src="/top-highlight.png"
          alt=""
          width={224}
          height={224}
          className="pointer-events-none absolute right-0 top-0 w-[29%] max-w-60"
          priority
        />
        <Image
          src="/right-highlight.png"
          alt=""
          width={80}
          height={160}
          className="pointer-events-none absolute right-0 top-[34%] w-[9%] max-w-20"
        />
        <Image
          src="/bottom-highlight.png"
          alt=""
          width={180}
          height={180}
          className="pointer-events-none absolute bottom-0 left-0 w-[25%] max-w-48"
        />

        <div className="relative z-10 flex h-full flex-col px-[7%] py-[5vh]">
          <Brand />

          <div className="mt-[11vh]">
            <h1 className="text-[clamp(2.5rem,4vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.04em]">
              Welcome Back,
              <span className="mt-2 block text-secondary">Driver</span>
            </h1>
            <p className="mt-6 max-w-md text-[clamp(1rem,1.35vw,1.25rem)] leading-relaxed text-brand-soft">
              Secure access to your assigned transportation schedule and
              today&apos;s trips.
            </p>

            <ul
              className="mt-8 flex flex-wrap gap-2.5"
              aria-label="Portal benefits"
            >
              {portalBenefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-2 rounded-full border border-secondary/70 bg-card/4 px-3.5 py-1.5 text-xs font-medium text-primary-foreground xl:text-sm"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-3.5 text-secondary"
                  />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <Image
            src="/DriverIllustration.png"
            alt="FIKI Transit shuttle following its route"
            width={420}
            height={298}
            className="absolute bottom-[3vh] left-1/2 h-auto w-[52%] max-w-90 -translate-x-1/2"
            priority
          />
        </div>
      </aside>

      <section className="h-svh max-w-full overflow-x-hidden overflow-y-auto lg:ml-[50%]">
        <div className="flex min-h-full min-w-0 max-w-full flex-col px-5 py-5 sm:px-8 lg:px-10 lg:py-7 xl:px-14">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="grid size-11 place-items-center rounded-xl bg-card">
              <Image
                src="/logo.png"
                alt=""
                width={48}
                height={48}
                className="size-9"
                priority
              />
            </span>
            <div className="leading-none text-primary">
              <p className="text-lg font-bold tracking-[-0.02em]">
                FIKI TRANSIT
              </p>
              <p className="mt-1.5 text-[0.65rem] font-semibold tracking-[0.16em] text-secondary">
                DRIVER PORTAL
              </p>
            </div>
          </div>

          <div className="my-auto min-w-0 max-w-full">
            <div className="mx-auto w-full max-w-130 rounded-[22px] border border-border bg-card px-6 py-7 sm:px-8 sm:py-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground">
                  Sign In
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
                  Enter your credentials to access your schedule
                </p>
              </div>

              <LoginForm />
            </div>

            <footer className="mx-auto mt-5 w-full max-w-130 text-center text-xs text-muted-foreground">
              <nav
                aria-label="Legal links"
                className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5"
              >
                <a
                  className="transition-colors hover:text-primary"
                  href="/privacy"
                >
                  Privacy Policy
                </a>
                <span aria-hidden="true">•</span>
                <a
                  className="transition-colors hover:text-primary"
                  href="/terms"
                >
                  Terms of Service
                </a>
                <span aria-hidden="true">•</span>
                <a
                  className="transition-colors hover:text-primary"
                  href="/help-center"
                >
                  Help Center
                </a>
              </nav>
              <p className="mt-2 text-brand-soft">
                © {new Date().getFullYear()} FIKI Transit. All rights reserved.
              </p>
            </footer>
          </div>
        </div>
      </section>
    </main>
  );
}


