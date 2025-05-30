"use client"

import { useCheckRole } from "@/features/current/api/use-check-role"
import { useConvexAuth } from "convex/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function SchoolHeadGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
    const { data: role, isLoading: isRoleLoading } = useCheckRole()

    useEffect(() => {
        if (!isAuthLoading && !isRoleLoading) {
            if (!isAuthenticated) {
                router.push("/")
                return
            }

            // Based on schema.ts roles: "admin", "teacher", "school-head", "registrar"
            if (role !== "principal") {
                // Redirect non-admin users to appropriate routes
                switch (role) {
                    case "adviser":
                        router.push("/teacher") // Redirect to teacher dashboard
                        break
                    case "subject-teacher":
                        router.push("/teacher") // Redirect to teacher dashboard
                        break
                    case "adviser/subject-teacher":
                        router.push("/teacher") // Redirect to teacher dashboard
                        break
                    case "admin":
                        router.push("/sysadmin")
                        break
                    case "registrar":
                        router.push("/registrar")
                        break
                    default:
                        router.push("/")
                }
                return
            }
        }
    }, [isAuthenticated, isAuthLoading, isRoleLoading, role, router])

    // Show nothing while checking authentication and role
    if (isAuthLoading || isRoleLoading) {
        return null
    }

    // Only render children if authenticated and system admin
    if (isAuthenticated && role === "principal") {
        return <>{children}</>
    }

    return null
}
