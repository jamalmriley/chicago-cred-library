"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuthContext } from "@/contexts/auth-context";
import { useSignUp, useUser } from "@clerk/nextjs";
import { Circle, CircleCheckBig } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Required from "./Required";
import SiteSelect from "./SiteSelect";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import { Spinner } from "./ui/spinner";

export default function SignUpForm() {
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    emailAddress,
    setEmailAddress,
    password,
    setPassword,
    defaultSite,
    setDefaultSite,
    setPendingVerification,
    error,
    setError,
    setSeconds,
  } = useAuthContext();
  const router = useRouter();
  const { signUp } = useSignUp();
  const { isSignedIn } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordChecks = {
    length: password.length >= 8,
    special: /[!@#$%^&*(),.?":{}|<>_]/.test(password),
  };
  const isButtonDisabled =
    firstName === "" ||
    lastName === "" ||
    emailAddress === "" ||
    !passwordChecks.length ||
    !passwordChecks.special;

  function isAllowedEmail(email: string): boolean {
    const allowedDomains = [
      "chicagocred.com",
      "emersoncollective.com",
      // "gmail.com",
    ];
    const domain = email.split("@")[1]?.toLowerCase();
    return Boolean(domain) && allowedDomains.includes(domain);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!isAllowedEmail(emailAddress)) {
        setError("Please use a Chicago CRED or Emerson Collective email.");
        return;
      }

      const { error } = await signUp.password({
        firstName,
        lastName,
        emailAddress,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      const verification = await signUp.verifications.sendEmailCode();

      if (verification.error) {
        setError(verification.error.message);
        return;
      }

      setPendingVerification(true);
      setSeconds(60);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle signed-in users visiting this page, or sign-up already complete (e.g. after refresh)
  useEffect(() => {
    if (isSignedIn || signUp.status === "complete") {
      router.push("/admin");
    }
  }, [isSignedIn, signUp.status, router]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-5">
      {/* First and Last Name */}
      <div className="flex gap-5">
        <Field>
          <FieldLabel htmlFor="firstName">
            First Name <Required />
          </FieldLabel>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            id="firstName"
            name="firstName"
            placeholder="John"
            type="text"
            autoCapitalize="on"
            autoComplete="given-name"
            required
            className="custom-card-input"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="lastName">
            Last Name <Required />
          </FieldLabel>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            id="lastName"
            name="lastName"
            placeholder="Doe"
            type="text"
            autoCapitalize="on"
            autoComplete="family-name"
            required
            className="custom-card-input"
          />
        </Field>
      </div>

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
          pattern="^[A-Za-z0-9._%+-]+@(chicagocred\.com|emersoncollective\.com)$"
          required
          className="custom-card-input"
        />
        <FieldDescription className="text-xs custom-card-text">
          A <span className="font-bold">Chicago CRED</span> or{" "}
          <span className="font-bold">Emerson Collective</span> email is
          required.
        </FieldDescription>
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
        <FieldDescription className="text-xs flex flex-col gap-1.5 text-white">
          <span className="flex gap-1.5 items-center">
            {passwordChecks.length ? (
              <CircleCheckBig className="size-4 text-green-400" />
            ) : (
              <Circle className="size-4" />
            )}
            <span
              className={passwordChecks.length ? "line-through opacity-50" : ""}
            >
              At least 8 characters
            </span>
          </span>
          <span className="flex gap-1.5 items-center">
            {passwordChecks.special ? (
              <CircleCheckBig className="size-4 text-green-400" />
            ) : (
              <Circle className="size-4" />
            )}
            <span
              className={
                passwordChecks.special ? "line-through opacity-50" : ""
              }
            >
              Contains a special character
            </span>
          </span>
        </FieldDescription>
      </Field>

      {/* Site */}
      <Field>
        <FieldLabel htmlFor="site">Default Site</FieldLabel>
        <SiteSelect
          selectedSite={defaultSite}
          setSelectedSite={setDefaultSite}
          side="right"
          isCustom
        />
        <FieldDescription className="text-xs custom-card-text">
          Leave this blank if you don't work at a specific site.
        </FieldDescription>
      </Field>

      {/* Catcha Placeholder for custom sign-up flow */}
      <div id="clerk-captcha" />

      {/* Error (if applicable) */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* "Sign up" button */}
      <Button
        type="submit"
        className="molde-button"
        disabled={isButtonDisabled || isSubmitting}
      >
        {isSubmitting && <Spinner data-icon="inline-start" />}
        {isSubmitting ? "Creating account..." : "Sign up"}
      </Button>
    </form>
  );
}
