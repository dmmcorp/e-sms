"use client"

import useTeacherStore from "@/app/teacher/_store/useTeacher"
import { useCheckRole } from "@/features/current/api/use-check-role"
import { useCurrentUser } from "@/features/current/api/use-current-user"
import { useConvexAuth } from "convex/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// TeacherGuard component to restrict access to teacher-specific routes
export function TeacherGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth() // Check if the user is authenticated
    const { data: role, isLoading: isRoleLoading } = useCheckRole() // Fetch the user's role
    const {user, isLoading} = useCurrentUser()
    const setTeacher = useTeacherStore(state => state.setTeacher)
    useEffect(() => {
        // Redirect logic based on authentication and role
        if (!isAuthLoading && !isRoleLoading) {
            if (!isAuthenticated) {
                router.push("/") // Redirect to home if not authenticated
                return
            }
            
            // Based on schema.ts roles: "admin", "teacher", "school-head", "registrar"
            if (
                role !== "adviser/subject-teacher" 
            ) {
                // Redirect non-teacher users to appropriate routes
                switch (role) {

                    case "adviser":
                        router.push("/teacher/adviser")
                        break
                    case "subject-teacher":
                        router.push("/teacher/subject-teacher")
                        break
                    case "admin":
                        router.push("/admin")
                        break
                    case "principal":
                        router.push("/principal")
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
    if (
        isAuthenticated && 
        (
            role === "subject-teacher" ||
            role === "adviser" ||
            role === "adviser/subject-teacher"
        ) &&
        !isLoading && user
    ) {
        setTeacher(user)
        return <>{children}</>
    }

    return null
}
