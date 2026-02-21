"use client";
/* This file wraps the app with client-side providers like authentication state. */
import { AuthProvider } from "@/hooks/useAuth";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
