"use client";

import { useAuthContext } from "@/contexts/auth-context";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import SignInForm from "../SignInForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import VerifyEmailForm from "../VerifyEmailForm";

export default function SignInPage() {
  const { firstName, emailAddress, pendingVerification } = useAuthContext();
  const { isLoaded } = useUser();

  if (!isLoaded) return;
  return (
    <div className="h-dvh w-full flex justify-center items-center">
      <Card className="w-sm max-w-sm flex flex-col gap-3 bg-white/20 backdrop-blur-md border border-white/20 custom-card-text">
        <CardHeader>
          <CardTitle className="text-4xl uppercase font-secondary custom-card-text">
            {!pendingVerification
              ? "Sign in"
              : firstName === ""
                ? "Check your email!"
                : `Check your email, ${firstName}!`}
          </CardTitle>
          <CardDescription className="mb-5 custom-card-text">
            {!pendingVerification
              ? "Log into your CRED Library account."
              : `We just sent a code to ${emailAddress}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingVerification ? (
            <SignInForm />
          ) : (
            <VerifyEmailForm authType="sign-in" />
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground custom-card-text">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
