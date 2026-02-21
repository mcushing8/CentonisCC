/* This file defines the root HTML layout and app-wide metadata. */
import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/app/providers";

export const metadata: Metadata = {
  title: "Workspace MVP",
  description: "Personal and team goal workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
