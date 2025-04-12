import { z } from "zod";
import { gradeComponentTypes, gradeLevels, quarters, semesters } from "./constants";

const gradeWeightSchema = z.object({
    type: z.enum(["Face to face", "Modular", "Other"]),
    faceToFace: z
        .object({
            ww: z.number(),
            pt: z.number(),
            majorExam: z.number(),
        })
        .optional(),
    modular: z
        .object({
            ww: z.number(),
            pt: z.number(),
        })
        .optional(),
    other: z
        .array(
            z.object({
                component: z.enum(gradeComponentTypes),
                percentage: z.number(),
            })
        )
        .optional(),
});

export const UserForm = z.object({
    // BASIC USER INFORMATION
    role: z.enum([
        "admin",
        "subject-teacher",
        "adviser",
        "adviser/subject-teacher",
        "principal",
        "registrar",
    ]),
    fullName: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),

    // FOR PRINCIPAL
    principalType: z.enum([
        "junior-department",
        "senior-department",
        "entire-school",
    ]).optional(),

    // FOR TEACHERS
    subjectsTaught: z.array(z.object({
        subjectName: z.string(),
        gradeLevel: z.enum(gradeLevels),
        sectionId: z.string(),
        quarter: z.array(z.enum(quarters)),
        semester: z.array(z.enum(semesters)).optional(),
        gradeWeights: gradeWeightSchema,
    })).optional(),
});

export type UserFormData = z.infer<typeof UserForm>;