"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useSignUpContext } from "@/contexts/sign-up-context";
import { useClerk, useSignUp } from "@clerk/nextjs";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { Check } from "lucide-react";

export default function VerifyEmailForm() {
  const { session } = useClerk();
  const router = useRouter();
  const { signUp } = useSignUp();
  const {
    code,
    setCode,
    error,
    setError,
    seconds,
    setSeconds,
    defaultSite,
    emailAddress,
  } = useSignUpContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds: number) => {
        if (prevSeconds > 0) return prevSeconds - 1;
        clearInterval(interval);
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setSeconds]);

  async function handleVerifyEmail(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      setError("");
      setIsSubmitting(true);

      const verification = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (verification.error) {
        setError(
          code === ""
            ? verification.error.message
            : "Invalid code. Please try again.",
        );
        return;
      }

      if (signUp.status !== "complete") {
        setError("Verification is not complete.");
        return;
      }

      await signUp.finalize();
      const publicMetadata: UserPublicMetadata = {
        defaultSite,
        isTestUser: false,
        role: "staff",
      };

      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(publicMetadata),
      });

      if (res.ok) {
        setIsEmailVerified(true);
      } else {
        setError("Unable to complete user signup.");
        return;
      }

      await session?.reload(); // Forces session refresh
      router.push("/admin");
    } catch {
      toast.error("We're unable to verify your email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resubmit() {
    const toastSuccess = () =>
      toast.success("Email sent!", {
        description: `We sent another code to ${emailAddress}!`,
      });
    const toastFailure = () =>
      toast.error("Uh oh! Something went wrong.", {
        description: "Token expired. Please refresh your browser",
        action: {
          label: "Refresh",
          onClick: async () => location.reload(),
        },
      });
    try {
      const result = await signUp.verifications.sendEmailCode();

      if (result.error) {
        toastFailure();
        return;
      }

      toastSuccess();
      setSeconds(60);
    } catch {
      toastFailure();
    }
  }

  return (
    <form onSubmit={handleVerifyEmail} className="flex flex-col gap-5 w-full">
      {/* OTP */}
      <div className="flex justify-center items-center">
        <InputOTP
          maxLength={6}
          name="verification_code"
          id="verification_code"
          value={code}
          onChange={setCode}
          pattern={REGEXP_ONLY_DIGITS}
          required
          autoComplete="one-time-code"
          disabled={isSubmitting}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="size-14 text-3xl font-bold"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Error (if applicable) */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* "Verify email" Button */}
      <Button
        type="submit"
        className="molde-button"
        disabled={isSubmitting || isEmailVerified}
      >
        {isSubmitting && <Spinner data-icon="inline-start" />}
        {isEmailVerified && <Check />}
        {isEmailVerified
          ? "Email verified"
          : isSubmitting
            ? "Verifying email..."
            : "Verify email"}
      </Button>

      {/* "Resend code" Button */}
      <Button
        type="button"
        variant="link"
        onClick={resubmit}
        disabled={seconds !== 0 || isSubmitting || isEmailVerified}
      >
        <span className="text-sm text-muted-foreground">
          {seconds === 0
            ? "Resend code"
            : `Resend in ${seconds} ${seconds === 1 ? "second" : "seconds"}`}
        </span>
      </Button>
    </form>
  );
}
