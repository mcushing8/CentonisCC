"use client";
/* This file renders the login page for email/password authentication. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { loginWithEmail } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-10">
      <h1 className="text-2xl font-bold">Login</h1>
      <AuthForm
        submitLabel="Login"
        onSubmit={async (email, password) => {
          await loginWithEmail(email, password);
          router.replace("/dashboard");
        }}
      />
      <p className="text-sm text-slate-600">
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-blue-700">
          Sign up
        </Link>
      </p>
    </main>
  );
}
