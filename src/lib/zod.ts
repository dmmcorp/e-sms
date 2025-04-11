import { z } from "zod";

export const UserForm = z.object({
    role: z
        .enum([
            "admin",
            "subject-teacher",
            "adviser",
            "adviser/subject-teacher",
            "principal",
            "registrar",
        ])
        .optional(),
    principalType: z.enum([
        "junior-department",
        "senior-department",
        "entire-school",
    ]).optional(),
    fullName: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type UserFormData = z.infer<typeof UserForm>;