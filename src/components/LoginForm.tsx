"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, MessageSquare, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { saveDriverSession } from "@/lib/mock-auth";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const router = useRouter();

  const {
    control,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    trigger,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function handleLogin(values: LoginValues) {
    setStatusMessage("");
    await new Promise((resolve) => window.setTimeout(resolve, 550));
    saveDriverSession(values.email);
    router.replace("/dashboard");
  }

  async function handleMagicLink() {
    const isEmailValid = await trigger("email");
    if (!isEmailValid) {
      document.querySelector<HTMLInputElement>("#email")?.focus();
      return;
    }

    setStatusMessage(`Signing you in securely as ${getValues("email")}…`);
    window.setTimeout(() => {
      saveDriverSession(getValues("email"));
      router.replace("/dashboard");
    }, 500);
  }

  return (
    <>
      <form onSubmit={handleSubmit(handleLogin)} noValidate>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Email Address
          </label>
          <input
            id="email"
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

        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between gap-4">
            <label
              htmlFor="password"
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
              id="password"
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
              onClick={() => setShowPassword((isVisible) => !isVisible)}
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



      <div className="mt-3 border-t border-brand-divider pt-4 text-center">
        <p className="text-sm text-brand-help">Need Help?</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-brand-navy">
          <a
            href="tel:+18003454825"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-secondary-foreground/70"
          >
            <Phone aria-hidden="true" className="size-3.5" />
            (800) 345-4825
          </a>
          <span
            aria-hidden="true"
            className="hidden size-1 rounded-full bg-brand-dot sm:block"
          />
          <a
            href="#liveChat"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-secondary-foreground/70"
          >
            <MessageSquare aria-hidden="true" className="size-3.5" />
            Live Chat
          </a>
        </div>
      </div>
    </>
  );
}
