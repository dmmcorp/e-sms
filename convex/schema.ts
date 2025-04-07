import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
 
const schema = defineSchema({
  ...authTables,
  // Your other tables...
    users: defineTable({
        fullName: v.string(),
        email: v.string(),
        emailVerified: v.optional(v.boolean()),
        role: v.union(
            v.literal("admin"),
            v.literal("teacher"),
            v.literal("adviser"),
            v.literal("adviser/teacher"),
            v.literal("school-head"),
            v.literal("registrar")
        ),
        schoolHeadType: v.optional(v.union(
            v.literal("junior-high"),
            v.literal("senior-high")
        )),
    }),
    students: defineTable({
        firstName: v.string(),
        middleName: v.string(),
        lastName: v.string(),
        lrn: v.string(),
        dateOfBirth: v.string(),
        sex: v.union(v.literal('Male'),v.literal('Female')),
        dateOfAdmission: v.string(),

        jrGenAve: v.string(),
        prevSchool: v.string(),
        schoolAddress: v.string(),
        alsRating: v.string(),
        subjects: v.optional(v.id('enrolledSubjects'))
    }),

    enrolledSubjects: defineTable({
        studentId: v.id('students'),
        schoolYear: v.string(),
        subjectId: v.id('subject')
    }),

    subjects: defineTable({
        name: v.string(),
        gradeLevel: v.string(),
        subjectCode: v.string(),
        subjectCategory: v.optional(v.string()), // core, applied and, specialized
        gradeWeights: v.optional(v.object({
            written: v.number(),
            performance: v.number(),
            exam: v.optional(v.number())
        }))
    }),

    values: defineTable({
        studentId: v.id('students'),
        classId: v.id('classes'),
        makaDyos: v.object({
        first: v.object({
            first: v.optional(v.string()),
            second: v.optional(v.string()),
            third: v.optional(v.string()),
            fourth: v.optional(v.string())
        }),
        second: v.object({
            first: v.optional(v.string()),
            second: v.optional(v.string()),
            third: v.optional(v.string()),
            fourth: v.optional(v.string())
        })
        }),
        makaTao: v.object({
        first: v.object({
            first: v.optional(v.string()),
            second: v.optional(v.string()),
            third: v.optional(v.string()),
            fourth: v.optional(v.string())
        }),
        second: v.object({
            first: v.optional(v.string()),
            second: v.optional(v.string()),
            third: v.optional(v.string()),
            fourth: v.optional(v.string())
        })
        }),
        makakalikasan: v.object({
        first: v.object({
            first: v.optional(v.string()),
            second: v.optional(v.string()),
            third: v.optional(v.string()),
            fourth: v.optional(v.string())
        })
        }),
        makaBansa: v.object({
        first: v.object({
            first: v.optional(v.string()),
            second: v.optional(v.string()),
            third: v.optional(v.string()),
            fourth: v.optional(v.string())
        }),
        second: v.object({
            first: v.optional(v.string()),
            second: v.optional(v.string()),
            third: v.optional(v.string()),
            fourth: v.optional(v.string())
        })
        }),
    }),

    attendance: defineTable({
        studentId: v.id('students'),
        classId: v.id('classes'),
        june: v.object({
        totalSchooldays: v.optional(v.number()),
        daysAbsent: v.optional(v.number()),
        daysPresent: v.optional(v.number()),
        }),
        july: v.object({
        totalSchooldays: v.optional(v.number()),
        daysAbsent: v.optional(v.number()),
        daysPresent: v.optional(v.number()),
        }),
        august: v.object({
        totalSchooldays: v.optional(v.number()),
        daysAbsent: v.optional(v.number()),
        daysPresent: v.optional(v.number()),
        }),
        september: v.object({
        totalSchooldays: v.optional(v.number()),
        daysAbsent: v.optional(v.number()),
        daysPresent: v.optional(v.number()),
        }),
        october: v.object({
        totalSchooldays: v.optional(v.number()),
        daysAbsent: v.optional(v.number()),
        daysPresent: v.optional(v.number()),
        }),
        november: v.object({
        totalSchooldays: v.optional(v.number()),
        daysAbsent: v.optional(v.number()),
        daysPresent: v.optional(v.number()),
        }),
        december: v.object({
        totalSchooldays: v.optional(v.number()),
        daysAbsent: v.optional(v.number()),
        daysPresent: v.optional(v.number()),
        }),
        january: v.object({
        totalSchooldays: v.optional(v.number()),
        daysAbsent: v.optional(v.number()),
        daysPresent: v.optional(v.number()),
        }),
        february: v.object({
        totalSchooldays: v.optional(v.number()),
        daysAbsent: v.optional(v.number()),
        daysPresent: v.optional(v.number()),
        }),
        march: v.object({
        totalSchooldays: v.optional(v.number()),
        daysAbsent: v.optional(v.number()),
        daysPresent: v.optional(v.number()),
        }),
        april: v.object({
        totalSchooldays: v.optional(v.number()),
        daysAbsent: v.optional(v.number()),
        daysPresent: v.optional(v.number()),
        }),
        may: v.object({
        totalSchooldays: v.optional(v.number()),
        daysAbsent: v.optional(v.number()),
        daysPresent: v.optional(v.number()),
        }),
    }),
    systemSettings: defineTable({
        schoolImage: v.optional(v.string()),
        schoolName: v.optional(v.string()),
    }),
});
 
export default schema;