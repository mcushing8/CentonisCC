"use client";
/* This file renders the shared sign up and login email/password form. */
import { useState } from "react";

type AuthFormProps = {
  submitLabel: string;
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function AuthForm({ submitLabel, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await onSubmit(email, password);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authentication failed.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          className="mt-1 w-full rounded border border-slate-300 p-2"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Password
        <input
          className="mt-1 w-full rounded border border-slate-300 p-2"
          type="password"
          minLength={6}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {errorMessage ? (
        <p className="rounded bg-red-50 p-2 text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Please wait..." : submitLabel}
      </button>
    </form>
  );
}
