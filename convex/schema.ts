import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const gradeLevel = v.union(
  v.literal('Grade 7'),
  v.literal('Grade 8'),
  v.literal('Grade 9'),
  v.literal('Grade 10'),
  v.literal('Grade 11'),
  v.literal('Grade 12'),
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
  }).index('email', ['email']),

  subjectThought: defineTable({
    teacherId: v.id('users'),
    gradeLevel: gradeLevel,
    subjectName: v.string(),
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

  teachingLoad: defineTable({
    subjectThoughId: v.id('subjectThought'),
    semester: v.optional(v.union(
      v.literal('1st semester'),
      v.literal('2nd semester')
    )),
    quarter: v.union(
      v.literal('1st quarter'),
      v.literal('2nd quarter'),
      v.literal('3rd quarter'),
      v.literal('4th quarter'),
    ),
    sectionId: v.id('sections'),
  }),

  sections: defineTable({
    adviserId: v.id('users'),
    name: v.string(),
    gradeLevel: gradeLevel,
    schooYear: v.string(),
  }),

  classRecords: defineTable({
    teachingLoadId: v.id('teachingLoad'),
    studentId: v.id('students'),
    isDropped: v.boolean(), // change this when the enrollment status of the student becomes dropped
    isReturning: v.boolean(), // get the value from the student enrollment isReturning column
    needsIntervention: v.optional(v.boolean()),
    interventionGrade: v.optional(v.number()),
    interventionUsed: v.optional(v.array(v.string())), // ex. Big book, General remarks
    interventionRemarks: v.optional(v.string())
  }),

  writtenWorks: defineTable({
    classRecordId: v.id('classRecords'),
    assessmentNo: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
      v.literal(6),
      v.literal(7),
      v.literal(8),
      v.literal(9),
      v.literal(10),
    ),
    score: v.number(),
    highestPossibleScore: v.number(),
  }),

  performanceTasks: defineTable({
    classRecordId: v.id('classRecords'),
    assessmentNo: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
      v.literal(6),
      v.literal(7),
      v.literal(8),
      v.literal(9),
      v.literal(10),
    ),
    score: v.number(),
    highestPossibleScore: v.number()
  }),

  majorExams: defineTable({
    classRecordId: v.id('classRecords'),
    assessmentNo: v.union(
      v.literal(1),
    ),
    score: v.number(),
    highestPossibleScore: v.number()
  }),

  students: defineTable({
    lastName: v.string(),
    firstName: v.string(),
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
    status: v.union(
      v.literal('enrolled'),
      v.literal('dropped')
    ),
    subjects: v.array(v.id('subjects')),
    isReturning: v.boolean(),

  }),

  systemSettings: defineTable({
    schoolImage: v.optional(v.string()),
    schoolName: v.optional(v.string()),
  })
});

export default schema;