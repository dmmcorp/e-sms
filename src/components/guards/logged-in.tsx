"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useConvexAuth } from "convex/react"
import { useCheckRole } from "@/features/current/api/use-check-role"

export function RoleCheck() {
    const router = useRouter()
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
    const { data: role, isLoading: isRoleLoading } = useCheckRole()

    useEffect(() => {
        if (!isAuthLoading && !isRoleLoading && isAuthenticated) {
            switch (role) {
                case "admin":
                    router.push("/sysadmin")
                    break
                case "teacher":
                    router.push("/dashboard")
                    break
                case "school-head":
                    router.push("/school-head")
                    break
                case "staff":
                    router.push("/sr-dashboard")
                    break
                default:
                    router.push("/")
            }
        }
    }, [isAuthenticated, isAuthLoading, isRoleLoading, role, router])

    return null
}