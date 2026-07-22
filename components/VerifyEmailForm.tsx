"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuthContext } from "@/contexts/auth-context";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";

export default function VerifyEmailForm({
  authType,
}: {
  authType: "sign-in" | "sign-up";
}) {
  const {
    code,
    setCode,
    error,
    setError,
    seconds,
    setSeconds,
    defaultSite,
    emailAddress,
  } = useAuthContext();
  const { setActive } = useClerk();
  const router = useRouter();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
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

  async function handleVerifySignIn(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!signIn) return;

    try {
      // Validate the custom input string against the specific email_code endpoint
      const codeRes = await signIn.mfa.verifyEmailCode({ code });
      if (codeRes.error) {
        setError(codeRes.error.message);
        return;
      }

      // Wrap up session finalization once verified
      if (signIn.status === "complete") {
        // Core 3 uses finalize() to transition sessions cleanly
        await signIn.finalize();
        setIsEmailVerified(true);

        if (signIn.createdSessionId) {
          await setActive({ session: signIn.createdSessionId });
        }

        router.push("/admin");
      } else {
        setError(`Error: ${signIn.status}`);
      }
    } catch (err: any) {
      setError(err?.message || "Invalid verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifySignUp(e: React.FormEvent) {
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

      // Explicitly activate the new session before redirecting
      if (signUp.createdSessionId) {
        await setActive({ session: signUp.createdSessionId });
      }

      router.push("/admin");
    } catch {
      toast.error("We're unable to verify your email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    if (authType === "sign-up") handleVerifySignUp(e);
    else handleVerifySignIn(e);
  }

  async function resubmit() {
    const toastSuccess = () =>
      toast.success("Email sent!", {
        description: `We sent another code to ${emailAddress}!`,
      });
    const toastFailure = () =>
      toast.error("Uh oh! Something went wrong.", {
        description:
          "Token expired. Please refresh your browser and try again.",
        action: {
          label: "Refresh",
          onClick: async () => location.reload(),
        },
      });
    try {
      const result =
        authType === "sign-in"
          ? await signIn.mfa.sendEmailCode()
          : await signUp.verifications.sendEmailCode();
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
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
                className="size-10 md:size-14 text-xl md:text-3xl font-bold"
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
