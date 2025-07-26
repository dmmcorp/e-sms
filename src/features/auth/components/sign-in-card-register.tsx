import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthActions } from "@convex-dev/auth/react";
import { TriangleAlertIcon } from "lucide-react";
import { useState } from "react";
import { AuthFlow } from "../types";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const SignInCardRegister = ({
  setState,
}: {
  setState: (state: AuthFlow) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState("");
  const { signIn } = useAuthActions();
  const getUserByEmail = useMutation(api.users.getUserByEmail);
  const createLogs = useMutation(api.logs.createUserLogs);
  // const router = useRouter()

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (pending) return;

    setPending(true);
    setError("");

    try {
      await signIn("password", {
        email,
        password,
        flow: "signIn",
      }).then(async (res) => {
        const user = await getUserByEmail({ email });
        if (user) {
          await createLogs({
            action: "sign_in",
            details: `User signed in with email: ${email}`,
          });
        }
      });
      setError("");
    } catch (error) {
      console.error("Sign in error:", error);

      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          setError(
            "Connection error. Please check your internet connection and try again."
          );
        } else {
          setError("Invalid email or password");
        }
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    // <div className="relative h-full w-full flex items-center justify-center ">

    //     <Card className="w-full h-full p-8 z-50">
    //         <CardHeader className="px-0 pt-0">
    //             <CardTitle className="text-primary">
    //                 Login to continue
    //             </CardTitle>
    //             <CardDescription>
    //                 Please fill in the form below to login to your account.
    //             </CardDescription>
    //         </CardHeader>
    //         {!!error && (
    //             <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
    //                 <TriangleAlertIcon className="size-4" />
    //                 {error}
    //             </div>
    //         )}
    //         <CardContent className="space-y-5 px-0 pb-0">
    //             <form onSubmit={onSignIn} className="space-y-2.5">
    //                 <Input
    //                     disabled={pending}
    //                     value={email}
    //                     onChange={(e) => setEmail(e.target.value)}
    //                     placeholder="Email"
    //                     type="email"
    //                     required
    //                 />
    //                 <Input
    //                     disabled={pending}
    //                     value={password}
    //                     onChange={(e) => setPassword(e.target.value)}
    //                     placeholder="Password"
    //                     type="password"
    //                     required
    //                 />
    //                 <Button
    //                     type="submit"
    //                     className="w-full text-white"
    //                     size={"lg"}
    //                     disabled={pending}
    //                 >
    //                     Continue
    //                 </Button>
    //             </form>
    //             <Separator />
    //         </CardContent>
    //     </Card>
    // </div>
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

          {/* <div className="mt-6 grid grid-cols-2 gap-3">
                        <Button type="button" variant="outline">
                            <svg xmlns="http://www.w3.org/2000/svg" width="0.98em" height="1em" viewBox="0 0 256 262">
                                <path fill="#4285f4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                                <path fill="#34a853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                                <path fill="#fbbc05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
                                <path fill="#eb4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                            </svg>
                            <span>Google</span>
                        </Button>
                        <Button type="button" variant="outline">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256">
                                <path fill="#f1511b" d="M121.666 121.666H0V0h121.666z"></path>
                                <path fill="#80cc28" d="M256 121.666H134.335V0H256z"></path>
                                <path fill="#00adef" d="M121.663 256.002H0V134.336h121.663z"></path>
                                <path fill="#fbbc09" d="M256 256.002H134.335V134.336H256z"></path>
                            </svg>
                            <span>Microsoft</span>
                        </Button>
                    </div> */}

          {!!error && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
              <TriangleAlertIcon className="size-4" />
              {error}
            </div>
          )}

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
                {/* <Button asChild variant="link" size="sm">
                                    <Link href="#" className="link intent-info variant-ghost text-sm">
                                        Forgot your Password ?
                                    </Link>
                                </Button> */}
              </div>
              <Input
                type="password"
                className="input sz-md variant-mixed"
                placeholder="Password"
                disabled={pending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              className="w-full bg-primary"
              type="submit"
              size="lg"
              disabled={pending}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* <div className="bg-muted rounded-(--radius) border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Don't have an account ?
                        <Button asChild variant="link" className="px-2">
                            <Link href="#">Create account</Link>
                        </Button>
                    </p>
                </div> */}
      </form>
    </section>
  );
};
