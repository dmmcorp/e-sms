import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/lib/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import MainNav from "@/components/main-nav";
import { TeacherGuard } from "@/components/guards/teacher-guard";
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
}

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
            className={`${geistSans.variable} ${geistMono.variable} flex flex-col antialiased min-w-screen min-h-screen`}
          >
            <TeacherGuard>

              <MainNav/>
              {children}
            </TeacherGuard>
            <Toaster richColors/>
          </body>
        </html>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
