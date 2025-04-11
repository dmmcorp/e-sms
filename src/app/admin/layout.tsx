import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/lib/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import MainNav from "@/components/main-nav";
import { SystemAdminGuard } from "@/components/guards/admin-guard";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERMS-Teacher",
  description: "Teacher Page",
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
            className={`${geistSans.variable} ${geistMono.variable} antialiased min-w-screen min-h-screen flex flex-col bg-zinc-50`}
          >
            <SystemAdminGuard>
              <MainNav />
              <Toaster richColors />
              <div className="flex-1 overflow-hidden">{children}</div>
            </SystemAdminGuard>
          </body>
        </html>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
