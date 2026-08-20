"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { loginApi, getDriverProfileApi } from "@/lib/api";
import { saveDriverSession } from "@/lib/auth";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const router = useRouter();

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function handleLogin(values: LoginValues) {
    setApiError("");

    const res = await loginApi(values.email, values.password);

    if (!res.success || !res.data) {
      setApiError(res.error?.message || "Invalid email or password");
      return;
    }

    // Role guard — only DRIVER accounts can access this portal
    if (res.data.user.role !== "DRIVER") {
      setApiError(
        "This portal is for drivers only. Please sign in with a driver account."
      );
      return;
    }

    const { user, token } = res.data;

    // Fetch driver profile to get vehicle + availability data
    const profileRes = await getDriverProfileApi(token);
    const profileData = profileRes?.data?.profile ?? null;

    saveDriverSession({
      userId: user.id,
      token,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountStatus: user.accountStatus,
      approvalStatus: profileData?.approvalStatus ?? "PENDING",
      vehicle: profileData?.vehicle ?? undefined,
      availabilityStatus: profileData?.availabilityStatus ?? "OFFLINE",
    });

    router.replace("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(handleLogin)} noValidate>
      {apiError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-lg bg-red-50 p-3.5 text-sm text-red-700 border border-red-200"
        >
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden="true" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="driver-email"
          className="mb-2 block text-sm font-semibold text-foreground"
        >
          Email Address
        </label>
        <input
          id="driver-email"
          type="email"
          autoComplete="email"
          placeholder="john.driver@fikitransit.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "emailError" : undefined}
          className="h-12 w-full rounded-full border border-input bg-muted px-4 text-sm text-foreground transition-colors placeholder:text-brand-placeholder hover:border-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 aria-invalid:border-destructive"
          {...register("email")}
        />
        <p id="emailError" className="mt-1.5 min-h-4 text-xs text-red-600">
          {errors.email?.message}
        </p>
      </div>

      {/* Password */}
      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            htmlFor="driver-password"
            className="text-sm font-semibold text-foreground"
          >
            Password
          </label>
          <a
            href="#forgotPassword"
            className="text-xs font-medium text-secondary-foreground/70 transition-colors hover:text-secondary-foreground"
          >
            Forgot Password?
          </a>
        </div>

        <div className="relative">
          <input
            id="driver-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "passwordError" : undefined}
            className="h-12 w-full rounded-full border border-input bg-muted px-4 pr-12 text-sm text-foreground transition-colors placeholder:text-brand-placeholder hover:border-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 aria-invalid:border-destructive"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-brand-icon transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-4.5" />
            ) : (
              <Eye aria-hidden="true" className="size-4.5" />
            )}
          </button>
        </div>
        <p id="passwordError" className="mt-1.5 min-h-4 text-xs text-red-600">
          {errors.password?.message}
        </p>
      </div>

      {/* Remember me */}
      <Controller
        control={control}
        name="rememberMe"
        render={({ field }) => (
          <label
            htmlFor="rememberMe"
            className="mt-3 flex w-fit cursor-pointer items-center gap-2.5 text-sm text-brand-label"
          >
            <Checkbox
              id="rememberMe"
              checked={field.value}
              onCheckedChange={field.onChange}
              className="size-4.5 border-input bg-card data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground"
            />
            Remember me on this device
          </label>
        )}
      />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 h-12 w-full rounded-full bg-secondary px-5 text-sm font-bold text-secondary-foreground hover:bg-secondary/90"
      >
        {isSubmitting && (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        )}
        {isSubmitting ? "Signing In…" : "Sign In to Driver Portal"}
      </Button>
    </form>
  );
}
