"use client"

import { useCheckRole } from "@/features/current/api/use-check-role"
import { useConvexAuth } from "convex/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// RegistrarGuard component to restrict access to registrar-specific routes
export function RegistrarGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth() // Check if the user is authenticated
    const { data: role, isLoading: isRoleLoading } = useCheckRole() // Fetch the user's role

    useEffect(() => {
        // Redirect logic based on authentication and role
        if (!isAuthLoading && !isRoleLoading) {
            if (!isAuthenticated) {
                router.push("/") // Redirect to home if not authenticated
                return
            }

            // Based on schema.ts roles: "admin", "teacher", "school-head", "registrar"
            if (role !== "registrar") {
                // Redirect non-registrar users to appropriate routes
                switch (role) {
                    case "teacher":
                        router.push("/teacher") // Redirect to teacher dashboard
                        break
                    case "admin":
                        router.push("/sysadmin") // Redirect to admin dashboard
                        break
                    case "school-head":
                        router.push("/school-head") // Redirect to school-head dashboard
                        break
                    default:
                        router.push("/auth") // Redirect to authentication page
                }
                return
            }
        }
    }, [isAuthenticated, isAuthLoading, isRoleLoading, role, router])

    // Show nothing while checking authentication and role
    if (isAuthLoading || isRoleLoading) {
        return null
    }

    // Only render children if authenticated and role is registrar
    if (isAuthenticated && role === "registrar") {
        return <>{children}</>
    }

    return null
}
