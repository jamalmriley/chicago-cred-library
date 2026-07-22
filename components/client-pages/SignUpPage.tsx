"use client";

import SignUpForm from "@/components/SignUpForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import VerifyEmailForm from "@/components/VerifyEmailForm";
import { useAuthContext } from "@/contexts/auth-context";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  const { firstName, emailAddress, pendingVerification } = useAuthContext();
  const { isLoaded } = useUser();

  if (!isLoaded) return;
  return (
    <div className="h-dvh w-full flex justify-center items-center">
      <Card
        className={`flex flex-col gap-3 bg-white/20 backdrop-blur-md border border-white/20 custom-card-text ${pendingVerification ? "w-xs md:w-md" : "w-xs md:w-sm"}`}
      >
        <CardHeader>
          <CardTitle
            className={`text-2xl md:text-4xl uppercase font-secondary custom-card-text ${pendingVerification ? "text-center" : ""}`}
          >
            {!pendingVerification
              ? "Sign up"
              : firstName === ""
                ? "Check your email!"
                : `Check your email, ${firstName}!`}
          </CardTitle>
          <CardDescription
            className={`text-xs md:text-base mb-5 custom-card-text ${pendingVerification ? "text-center" : ""}`}
          >
            {!pendingVerification
              ? "Create an account in minutes."
              : `We just sent a code to ${emailAddress}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingVerification ? (
            <SignUpForm />
          ) : (
            <VerifyEmailForm authType="sign-up" />
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground custom-card-text">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
