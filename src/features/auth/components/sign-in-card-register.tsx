import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthActions } from "@convex-dev/auth/react"
import { TriangleAlertIcon } from "lucide-react"
import { useState } from "react"
import { AuthFlow } from "../types"
import { Checkbox } from "@/components/ui/checkbox"

export const SignInCardRegister = ({
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
    const [type, setType] = useState("password")
    // const router = useRouter()

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
        <section className="flex min-h-screen px-4 py-16 md:py-32">
            <form
                onSubmit={onSignIn}
                className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
            >
                <div className="p-8 pb-6">
                    <div>
                        {/* <Link href="/" aria-label="go home">
                            Logo
                        </Link> */}
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In</h1>
                        <p className="text-sm">Welcome back! Sign in to continue</p>
                    </div>
                    {!!error && (
                        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                            <TriangleAlertIcon className="size-4" />
                            {error}
                        </div>
                    )
                    }


                    <hr className="my-4 border-dashed" />

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="block text-sm">
                                Username
                            </Label>
                            <Input
                                type="email"
                                placeholder="Email"
                                disabled={pending}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="pwd" className="text-title text-sm">
                                    Password
                                </Label>
                            </div>
                            <Input
                                type={type}
                                className="input sz-md variant-mixed"
                                placeholder="Password"
                                disabled={pending}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="hover:cursor-pointer flex items-center gap-x-2 text-muted-foreground">
                            <Checkbox name="show" id="show" onCheckedChange={(value)=> {value === true ? setType("text") : setType("password")}} />
                            <Label htmlFor="show">Show Password</Label>
                        </div>
                        <Button
                            className="w-full"
                            type="submit"
                            size="lg"
                            disabled={pending}
                        >
                            Sign In
                        </Button>
                    </div>
                </div>
            </form >
        </section >
    )
}