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

    // FOR ADVISERS
    sections: z.array(z.object({
        adviserId: z.string().optional(),
        name: z.string().min(1, "Section name is required"),
        gradeLevel: z
            .enum(["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"])
            .optional(),
        schoolYear: z
            .enum([
                "2024-2025",
                "2025-2026",
                "2026-2027",
                "2027-2028",
                "2028-2029",
                "2029-2030",
                "2030-2031",
                "2031-2032",
                "2032-2033",
                "2033-2034",
                "2034-2035",
                "2035-2036",
                "2036-2037",
                "2037-2038",
                "2038-2039",
                "2039-2040",
                "2040-2041",
                "2041-2042",
                "2042-2043",
                "2043-2044",
                "2044-2045",
            ])
            .optional(),
    })).optional(),
});

export type UserFormData = z.infer<typeof UserForm>;