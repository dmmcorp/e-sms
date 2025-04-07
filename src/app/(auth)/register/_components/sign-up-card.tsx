import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

import { TriangleAlertIcon } from "lucide-react"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { useAuthActions } from "@convex-dev/auth/react"
import { AuthFlow } from "@/features/auth/types"

export const SignUpCard = ({
    setState
}: {
    setState: (state: AuthFlow) => void
}) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // const [birthDate, setBirthDate] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");
    const { signIn } = useAuthActions()
    const [pending, setPending] = useState<boolean>(false);
    const [error, setError] = useState("");

    const router = useRouter()

    const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setPending(true)

        const role = "admin"
        const firstName = "System"
        const lastName = "Administrator"

        try {
            await signIn("password", {
                email,
                firstName,
                lastName,
                password,
                role,
                // birthDate,
                flow: "signUp"
            });
            setError("");

        } catch (error) {
            console.error("Sign in error:", error);

            if (error instanceof Error) {
                if (error.message.includes("Failed to fetch")) {
                    setError("Connection error. Please check your internet connection and try again.");
                } else {
                    setError("Invalid email or password");
                }
            } else {
                setError("Invalid email or password");
            }
        } finally {
            setPending(false);
        }
    }

    return (
        <Card className="w-full h-full p-8">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-primary">
                    Sign up to continue
                </CardTitle>
                <CardDescription>
                    All fields are required to continue
                </CardDescription>
            </CardHeader>
            {!!error && (
                <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                    <TriangleAlertIcon className="size-4" />
                    {error}
                </div>
            )}
            <CardContent className="space-y-5 px-0 pb-0">
                <form onSubmit={onSignUp} className="space-y-2.5">
                    <Input
                        disabled={pending}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        required
                    />
                    <Input
                        disabled={pending}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        type="password"
                        required
                    />
                    <Input
                        disabled={pending}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        type="password"
                        required
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        size={"lg"}
                        disabled={pending}
                    >
                        Continue
                    </Button>
                </form>
                <Separator />
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Already have an account? <span
                            className="text-primary hover:underline cursor-pointer"
                            onClick={() => setState("signIn")}>
                            Sign in
                        </span>
                    </p>

                    <p className="block lg:hidden text-sm text-muted-foreground">
                        Changed your mind? <span
                            className="text-primary hover:underline cursor-pointer"
                            onClick={() => router.push("/")}>
                            Go back to homepage.
                        </span>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}