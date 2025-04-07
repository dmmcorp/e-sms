"use client"

import { useCheckRole } from "@/features/current/api/use-check-role"
import { useConvexAuth } from "convex/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// TeacherGuard component to restrict access to teacher-specific routes
export function TeacherGuard({ children }: { children: React.ReactNode }) {
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
            if (role !== "teacher") {
                // Redirect non-teacher users to appropriate routes
                switch (role) {
                    case "admin":
                        router.push("/sysadmin")
                        break
                    case "school-head":
                        router.push("/school-head")
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

    // Only render children if authenticated and role is teacher
    if (isAuthenticated && role === "teacher") {
        return <>{children}</>
    }

    return null
}
