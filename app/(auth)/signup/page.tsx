"use client";
/* This file renders the sign up page for new users. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { signUpWithEmail } from "@/services/authService";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-10">
      <h1 className="text-2xl font-bold">Create Account</h1>
      <AuthForm
        submitLabel="Create account"
        onSubmit={async (email, password) => {
          await signUpWithEmail(email, password);
          router.replace("/dashboard");
        }}
      />
      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-700">
          Login
        </Link>
      </p>
    </main>
  );
}
