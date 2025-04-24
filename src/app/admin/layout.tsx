import type { Metadata } from "next";
import "@/lib/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import MainNav from "@/components/main-nav";
import { SystemAdminGuard } from "@/components/guards/admin-guard";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProviderWithDynamicColors } from "@/components/theme-provider-with-dynamic-colors";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "ERMS-Admin",
  description: "Admin Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`antialiased min-w-screen min-h-screen flex flex-col bg-zinc-50`}
          >
            <SystemAdminGuard>
              <ThemeProviderWithDynamicColors>
                <MainNav />
                <Toaster richColors />
                <div className="flex-1 overflow-hidden">{children}</div>
                <Footer />
              </ThemeProviderWithDynamicColors>
            </SystemAdminGuard>
          </body>
        </html>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
