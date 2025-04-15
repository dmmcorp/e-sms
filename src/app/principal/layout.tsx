import { ConvexClientProvider } from "@/components/convex-client-provider";
import { SchoolHeadGuard } from "@/components/guards/sh-guard";
import MainNav from "@/components/main-nav";
import { ThemeProviderWithDynamicColors } from "@/components/theme-provider-with-dynamic-colors";
import { Toaster } from "@/components/ui/sonner";
import "@/lib/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ERMS-Principal",
  description: "Principal Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>
        <html lang="en">
          <body
            className={`flex flex-col antialiased min-w-screen min-h-screen bg-zinc-50`}
          >
            <SchoolHeadGuard>
              <ThemeProviderWithDynamicColors>
                <MainNav />
                {children}
              </ThemeProviderWithDynamicColors>
            </SchoolHeadGuard>
            <Toaster richColors />
          </body>
        </html>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
