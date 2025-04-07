import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const gradeLevel = v.union(
  v.literal('G7'),
  v.literal('G8'),
  v.literal('G9'),
  v.literal('G10'),
  v.literal('G11'),
  v.literal('G12'),
)
 
const schema = defineSchema({
  ...authTables,
  // Your other tables...
  users: defineTable({
    fullName: v.string(),
    role: v.union(
        v.literal("admin"),
        v.literal("subject-teacher"),
        v.literal("adviser"),
        v.literal("adviser/subject-teacher"),
        v.literal("principal"),
        v.literal("registrar")
    ), 
    principalType: v.optional(v.union(
        v.literal("junior-department"),
        v.literal("senior-department"),
        v.literal("entire-school"),
    )),
    isActive: v.optional(v.boolean()),
    email: v.string(),
    emailVerified: v.optional(v.boolean()),
  }),

  subjectToughts: defineTable({
    teacherId: v.id('users'),
    gradeLevel: gradeLevel,
    name: v.string(),
    quarter: v.array(v.union(
      v.literal('1st quarter'),
      v.literal('2nd quarter'),
      v.literal('3rd quarter'),
      v.literal('4th quarter'),
    )),
    semester: v.optional(v.array(v.union(
      v.literal('1st semester'),
      v.literal('2nd semester'),
    ))),
    gradeWeights: v.object({
      type: v.union(
        v.literal("Face to face"),
        v.literal("Modular"),
        v.literal("Other"),
      ),
    other: v.optional(v.array(v.object({
      component: v.union(
        v.literal('Written Works'),
        v.literal('Perfomance Tasks'),
        v.literal('Major Exam'),
      ),
      percentage: v.number(),

    }))),
    faceToFace: v.optional(v.object({
        ww: v.number(),
        pt: v.number(),
        majorExam: v.number(),
    })),
    modular: v.optional(v.object({
      ww: v.number(),
      pt: v.number(),
    }))
    })
  }),
  
  sections: defineTable({
      adviserId: v.id('users'),
      name: v.string(),
      gradeLevel: gradeLevel,
      schooYear: v.string(),

  }),

  students: defineTable({
    lastName: v.string(),
    firsName: v.string(), 
    middleName: v.string(), 
    sex: v.union(v.literal('male'), v.literal('female')),
    lrn: v.string(),
    dateOfBirth: v.string(),
    dateOfAdminssion: v.string(),
    prevSchool: v.string(),
    prevSchoolAddress: v.string(),
    alsRating: v.string(),
  }),

  enrollment: defineTable({
    studentId: v.id('students'),
    schoolYear: v.string(),
    gradeLevel: gradeLevel,
    status: v.string(),
    subjects: v.array(v.id('subjects'))
  }),

  systemSettings: defineTable({
    schoolImage: v.optional(v.string()),
    schoolName: v.optional(v.string()),
  })
});
 
export default schema;