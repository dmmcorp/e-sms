import { ConvexClientProvider } from "@/components/convex-client-provider";
import "@/lib/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "ERMS-Authentication",
    description: "Authentication Page",
}

const AuthLayout = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return (
        <ConvexAuthNextjsServerProvider>
            <html className="h-full" lang="en">
                <body>
                    <ConvexClientProvider>
                            {children}
                    </ConvexClientProvider>
                </body>
            </html>
        </ConvexAuthNextjsServerProvider>
    )
}

export default AuthLayout;