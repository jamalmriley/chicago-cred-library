import { useAuthContext } from "@/contexts/auth-context";
import { useClerk, useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Required from "./Required";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { PasswordInput } from "./ui/password-input";
import { Spinner } from "./ui/spinner";

export default function SignInForm() {
  const {
    emailAddress,
    setEmailAddress,
    password,
    setPassword,
    pendingVerification,
    setPendingVerification,
    error,
    setError,
    setSeconds,
  } = useAuthContext();
  const { setActive } = useClerk();
  const router = useRouter();
  const { signIn } = useSignIn();
  const { isSignedIn } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isButtonDisabled = emailAddress === "" || password === "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!signIn) return;

    try {
      // Step 1: Supply the identifier (email)
      const createRes = await signIn.create({ identifier: emailAddress });
      if (createRes.error) {
        setError(createRes.error.message);
        return;
      }

      // Step 2: Supply the password
      const passwordRes = await signIn.password({ password });
      if (passwordRes.error) {
        setError(passwordRes.error.message);
        return;
      }

      // Step 3: Check status reactively on the root signIn object
      if (signIn.status === "complete") {
        // Core 3 uses finalize() to transition sessions cleanly
        await signIn.finalize();

        if (signIn.createdSessionId) {
          await setActive({ session: signIn.createdSessionId });
        }

        router.push("/admin");
      } else if (signIn.status === "needs_second_factor") {
        await signIn.mfa.sendEmailCode();
        setPendingVerification(true);
        setSeconds(60);
      } else {
        setError(`Error: ${signIn.status}`);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle signed-in users visiting this page, or sign-up already complete (e.g. after refresh)
  useEffect(() => {
    if (isSignedIn || signIn.status === "complete") {
      router.push("/admin");
    }
  }, [isSignedIn, signIn.status, router]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-5">
      {/* Email */}
      <Field>
        <FieldLabel htmlFor="emailAddress">
          Email <Required />
        </FieldLabel>
        <Input
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
          id="emailAddress"
          name="emailAddress"
          placeholder="name@chicagocred.com"
          type="email"
          autoCapitalize="off"
          autoComplete="email"
          required
          className="custom-card-input"
        />
      </Field>

      {/* Password */}
      <Field>
        <FieldLabel htmlFor="password">
          Password <Required />
        </FieldLabel>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="password"
          name="password"
          placeholder="••••••••"
          autoCapitalize="off"
          autoComplete="new-password"
          required
          className="custom-card-input"
        />
      </Field>

      {/* Catcha Placeholder for custom sign-in flow */}
      <div id="clerk-captcha" />

      {/* Error (if applicable) */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* "Sign in" button */}
      <Button
        type="submit"
        className="molde-button"
        disabled={isButtonDisabled || isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
        {isSubmitting && <Spinner data-icon="inline-start" />}
      </Button>
    </form>
  );
}
