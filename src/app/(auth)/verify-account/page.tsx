import type { Metadata } from "next";
import { VerificationForm } from "@/components/VerificationForm";

export const metadata: Metadata = {
  title: "Verify Code | Fiki Transit Driver Portal",
  description: "Verify your OTP code to reset your password.",
};

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function DriverVerifyPage({ searchParams }: Props) {
  const params = await searchParams;
  const email = params.email || "";

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900/90 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Verify Account</h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Enter the 6-digit code sent to your email to verify your identity.
          </p>
        </div>
        <VerificationForm email={email} />
      </div>
    </main>
  );
}
