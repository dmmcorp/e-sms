import { z } from "zod";
import {
  gradeComponentTypes,
  gradeLevels,
  quarters,
  semesters,
} from "./constants";

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
  role: z.union([
    z.literal("admin"),
    z.literal("subject-teacher"),
    z.literal("adviser"),
    z.literal("adviser/subject-teacher"),
    z.literal("principal"),
    z.literal("registrar"),
  ]),
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),

  // FOR PRINCIPAL
  principalType: z
    .union([
      z.literal("junior-department"),
      z.literal("senior-department"),
      z.literal("entire-school"),
    ])
    .optional(),

  // FOR TEACHERS
  subjectsTaught: z
    .array(
      z.object({
        subjectName: z.string(),
        gradeLevel: z.enum(gradeLevels),
        sectionId: z.string(),
        quarter: z.array(z.enum(quarters)),
        semester: z.array(z.enum(semesters)).optional(),
        isMapeh: z.boolean().optional(),
        mapehComponent: z
          .union([
            z.literal("Music"),
            z.literal("Arts"),
            z.literal("Physical Education"),
            z.literal("Health"),
          ])
          .optional(),
        gradeWeights: gradeWeightSchema,
        category: z
          .union([
            z.literal("core"),
            z.literal("specialized"),
            z.literal("applied"),
          ])
          .optional(),
      })
    )
    .optional(),

  // FOR ADVISERS
  sections: z
    .array(
      z.object({
        sectionId: z.string().optional(),
        adviserId: z.string().optional(),
        name: z.string().min(1, "Section name is required"),
        gradeLevel: z.enum([
          "Grade 7",
          "Grade 8",
          "Grade 9",
          "Grade 10",
          "Grade 11",
          "Grade 12",
        ]),
        schoolYear: z.enum([
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
        ]),
      })
    )
    .optional(),
});

export type UserFormData = z.infer<typeof UserForm>;

export const enrollmentSchema = z.object({
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." })
    .max(50, { message: "Last name must be at most 50 characters." })
    .nonempty({ message: "Last name is required." }),

  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." })
    .max(50, { message: "First name must be at most 50 characters." })
    .nonempty({ message: "First name is required." }),

  middleName: z
    .string()
    .min(2, { message: "Middle name must be at least 2 characters." })
    .max(50, { message: "Middle name must be at most 50 characters." })
    .nonempty({ message: "Middle name is required." }),

  lrn: z.coerce
    .number()
    .refine((value) => value.toString().length === 12, {
      message: "LRN must be exactly 12 digits.",
    })
    .refine((value) => value !== null && value !== undefined, {
      message: "LRN is required.",
    }),

  enrollingTo: z
    .string()
    .nonempty({ message: "Select the grade level you are enrolling in" }),

  semesterEnrollingIn: z
    .string()
    .nonempty({ message: "Select the semester you are enrolling in" }),

  dateOfBirth: z.date({
    required_error: "Date of birth is required.",
  }),

  sex: z.string().nonempty({ message: "Gender is required." }),

  elemGenAve: z.coerce
    .number({
      required_error: "Elementary general average is required.",
      invalid_type_error: "Elementary general average is required.",
    })
    .optional(),
  elemSchoolId: z.string().optional(),

  elemPrevSchoolName: z.string().optional(),

  elemPrevSchoolAddress: z.string().optional(),

  jnrGenAve: z.coerce.number().optional(),
  jnrPrevSchoolName: z.string().optional(),
  jnrPrevSchoolAddress: z.string().optional(),
  jnrDateOfAdmission: z.date({
    required_error: "Date of admission is required.",
  }),
  jnrDateOfCompletion: z
    .date({
      required_error: "Date of admission is required.",
    })
    .optional(),

  alsRating: z.string().optional(),
});
