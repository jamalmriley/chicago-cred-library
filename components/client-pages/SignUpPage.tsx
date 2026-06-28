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
import { useSignUpContext } from "@/contexts/sign-up-context";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  const { firstName, emailAddress, pendingVerification } = useSignUpContext();
  const { isLoaded } = useUser();

  if (!isLoaded) return;
  return (
    <div className="h-dvh w-full flex justify-center items-center">
      <Card
        className={`flex flex-col gap-3 w-full ${pendingVerification ? "max-w-md" : "max-w-sm"}`}
      >
        <CardHeader>
          <CardTitle className="text-4xl uppercase font-secondary">
            {!pendingVerification
              ? "Sign up"
              : `Check your email, ${firstName}!`}
          </CardTitle>
          <CardDescription className="mb-5">
            {!pendingVerification
              ? "Create an account in minutes."
              : `We just sent a code to ${emailAddress}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingVerification ? <SignUpForm /> : <VerifyEmailForm />}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
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
