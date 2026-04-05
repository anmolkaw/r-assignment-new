import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/app/providers";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Rayeva AI Commerce Console";

export const metadata: Metadata = {
  title: appName,
  description: "Production-style AI commerce dashboard for category tagging and B2B proposal generation."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
