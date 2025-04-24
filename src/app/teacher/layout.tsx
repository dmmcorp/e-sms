import type { Metadata } from "next";
import "@/lib/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import MainNav from "@/components/main-nav";
import { TeacherGuard } from "@/components/guards/teacher-guard";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProviderWithDynamicColors } from "@/components/theme-provider-with-dynamic-colors";
import { Footer } from "@/components/footer";

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
            className={`flex flex-col antialiased min-w-screen min-h-screen bg-zinc-50`}
          >
            <TeacherGuard>
              <ThemeProviderWithDynamicColors>
                <MainNav />
                {children}
                <Footer />
              </ThemeProviderWithDynamicColors>
            </TeacherGuard>
            <Toaster richColors />
          </body>
        </html>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
