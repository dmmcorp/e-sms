import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

const CustomPassword = Password({
  profile(params) {
    return {
      email: params.email as string,
      fullName: params.fullName as string,
      role: params.role as "admin" | "adviser" | "principal" | "subject-teacher" | "adviser/subject-teacher" ,
      isActive: true,
      // department: (params.department as string) ?? null,
      // specialization: (params.specialization as string) ?? null,
      // yearsOfExperience: (params.yearsOfExperience as number) ?? null,
      // birthDate: params.birthDate as string,
    };
  },
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [CustomPassword],
});