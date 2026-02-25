"use client";
/* This file wraps the app with client-side providers like authentication state. */
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme } from "next-themes";

// We need a wrapper to make the Toaster theme dynamic
function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme as "light" | "dark" | "system"} position="bottom-right" className="font-sans" />;
}

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        {children}
        <ThemedToaster />
      </AuthProvider>
    </NextThemesProvider>
  );
}
