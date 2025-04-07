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
import { AuthFlow } from "@/features/auth/types"
import { useAuthActions } from "@convex-dev/auth/react"
import { TriangleAlertIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export const SignInCard = ({
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    setState
}: {
    setState: (state: AuthFlow) => void
}) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState<boolean>(false);
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState("");
    const { signIn } = useAuthActions()

    const router = useRouter()

    const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (pending) return;

        setPending(true);
        setError("");

        try {
            await signIn("password", {
                email,
                password,
                flow: "signIn"
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
        <div className="relative h-full w-full flex items-center justify-center ">
            {/* <Image
                src="/images/logo.png"
                alt="Logo of Tanjay National High School"
                width={1800}
                height={1800}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-10 lg:hidden block"
            /> */}

            <Card className="w-full h-full p-8 z-50">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-primary">
                        Login to continue
                    </CardTitle>
                    <CardDescription>
                        Please fill in the form below to login to your account.
                    </CardDescription>
                </CardHeader>
                {!!error && (
                    <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                        <TriangleAlertIcon className="size-4" />
                        {error}
                    </div>
                )}
                <CardContent className="space-y-5 px-0 pb-0">
                    <form onSubmit={onSignIn} className="space-y-2.5">
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
                        <Button
                            type="submit"
                            className="w-full text-white"
                            size={"lg"}
                            disabled={pending}
                        >
                            Continue
                        </Button>
                    </form>
                    <Separator />
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            Don&apos;t have an account? <span
                                className="text-primary hover:underline cursor-pointer"
                                onClick={() => setState("signUp")}>
                                Sign up
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
        </div>
    )
}