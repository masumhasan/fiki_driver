import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | Fiki Transit Driver Portal",
  description: "Request a password reset verification code for your Fiki Transit driver account.",
};

export default function DriverForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900/90 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Enter your email address and we will send you a 6-digit verification code to reset your password.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
