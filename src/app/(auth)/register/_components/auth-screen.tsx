"use client"

import { useState } from "react"
import { SignInCard } from "./sign-in-card"
import { SignUpCard } from "./sign-up-card"
import { useConvexAuth } from "convex/react"
import { RoleCheck } from "@/components/guards/logged-in"
import { AuthFlow } from "@/features/auth/types"

export const AuthScreen = () => {
    const [state, setState] = useState<AuthFlow>("signIn")
    const { isAuthenticated } = useConvexAuth()

    if (isAuthenticated) {
        return <RoleCheck />
    }

    return (
        <div className="h-screen w-full lg:flex lg:flex-row">
            {/* <div
                className="hidden lg:w-[50%] bg-primary/90 lg:flex lg:flex-col lg:justify-center lg:items-center text-white px-[76px]"
            >
                <Image
                    src="/images/black-logo.svg"
                    alt="Logo of Tanjay National High School"
                    width={500}
                    height={500}
                    className="invert"
                />

                <h1 className="text-[196px] font-bold">
                    ERMS.
                </h1>

                <h1 className="text-xl font-medium my-10">
                    Electronic Record Management System
                </h1>
            </div> */}

            <div className="hidden lg:w-[50%] bg-gradient-to-b from-primary to-primary/70 lg:flex lg:flex-col lg:justify-center lg:items-center text-white px-[76px]">
                <h1 className="text-3xl font-bold mb-4 text-center">Simplify your workflow with seamless electronic records management!</h1>
                <p className="text-lg font-medium">
                    Electronic Record Management System
                </p>
            </div>

            <div className="h-full w-full lg:w-[50%] flex flex-col flex-1 items-center justify-center bg-gradient-to-b from-primary to-primary/70">

                <div className="h-full flex items-center justify-center ">
                    <div className="md:h-auto md:w-[420px]">
                        {state === "signIn" ? <SignInCard setState={setState} /> : <SignUpCard setState={setState} />}
                    </div>
                </div>
            </div>
        </div>
    )
}