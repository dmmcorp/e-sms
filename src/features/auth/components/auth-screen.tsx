"use client"

import { RoleCheck } from "@/components/guards/logged-in"
import { useConvexAuth, useQuery } from "convex/react"
import { Loader2Icon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { api } from "../../../../convex/_generated/api"
import { AuthFlow } from "../types"
import { SignInCardRegister } from "./sign-in-card-register"
import { SignUpCardRegister } from "./sign-up-card-register"

export const AuthScreenRegister = () => {
    const [state, setState] = useState<AuthFlow>("signIn")
    const { isAuthenticated } = useConvexAuth()
    const school = useQuery(api.systemSettings.get)

    if (isAuthenticated) {
        return <RoleCheck />
    }

    return (
        <div className="h-screen w-full lg:flex lg:flex-row">
            {school === undefined ? (
                <div className="w-full h-full lg:w-[50%] lg:flex lg:flex-col lg:justify-center lg:items-center">
                    <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-primary mt-4">Loading school information...</p>
                </div>
            ) : school ? (
                <>
                    <div className="hidden lg:w-[50%] bg-zinc-50 lg:flex lg:flex-col lg:justify-center lg:items-center text-white px-[76px]">
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <Image
                                src={school.schoolImage as string}
                                alt={school.schoolName as string}
                                width={240}
                                height={240}
                                className="mb-6"
                            />

                            <h1 className="text-3xl font-bold leading-tight text-black">
                                {school.schoolName}
                            </h1>
                        </div>

                        <div className="text-lg font-medium flex flex-col justify-center items-center mt-auto mb-[60px] text-black">
                            <h1>ERMS.</h1>
                            <h1>Electronic Record Management System</h1>
                        </div>
                    </div>
                </>
            ) : <>
                <div className="hidden lg:w-[50%] bg-zinc-50 lg:flex lg:flex-col lg:justify-center lg:items-center text-white px-[76px]">
                    <div className="text-lg font-medium flex flex-col justify-center items-center mt-auto mb-[60px] text-black">
                        <h1>ERMS.</h1>
                        <h1>Electronic Record Management System</h1>
                    </div>
                </div>
            </>
            }

            <div className="h-full w-full lg:w-[50%] flex flex-col flex-1 items-center justify-center bg-zinc-800">
                <div className="h-full flex items-center justify-center ">
                    <div className="md:h-auto md:w-[420px]">
                        {state === "signIn" ? <SignInCardRegister setState={setState} /> : <SignUpCardRegister setState={setState} />}
                    </div>
                </div>
            </div>
        </div>
    )
}