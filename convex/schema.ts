import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const gradeLevel = v.union(
  v.literal("Grade 7"),
  v.literal("Grade 8"),
  v.literal("Grade 9"),
  v.literal("Grade 10"),
  v.literal("Grade 11"),
  v.literal("Grade 12")
);

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
    principalType: v.optional(
      v.union(
        v.literal("junior-department"),
        v.literal("senior-department"),
        v.literal("entire-school")
      )
    ),
    isActive: v.optional(v.boolean()),
    email: v.string(),
    emailVerified: v.optional(v.boolean()),
  }).index("email", ["email"]),

  subjectTaught: defineTable({
    teacherId: v.id("users"),
    gradeLevel: gradeLevel,
    category: v.optional(
      v.union(v.literal("core"), v.literal("specialized"), v.literal("applied"))
    ), // for senior high
    subjectName: v.string(),
    quarter: v.array(
      v.union(
        v.literal("1st quarter"),
        v.literal("2nd quarter"),
        v.literal("3rd quarter"),
        v.literal("4th quarter")
      )
    ),
    semester: v.optional(
      v.array(v.union(v.literal("1st semester"), v.literal("2nd semester")))
    ),
    gradeWeights: v.object({
      type: v.union(
        v.literal("Face to face"),
        v.literal("Modular"),
        v.literal("Other")
      ),
      other: v.optional(
        v.array(
          v.object({
            component: v.union(
              v.literal("Written Works"),
              v.literal("Performance Tasks"),
              v.literal("Major Exam")
            ),
            percentage: v.number(),
          })
        )
      ),
      faceToFace: v.optional(
        v.object({
          ww: v.number(),
          pt: v.number(),
          majorExam: v.number(),
        })
      ),
      modular: v.optional(
        v.object({
          ww: v.number(),
          pt: v.number(),
        })
      ),
    }),
  }).index("teacherId", ["teacherId"]),

  //if the teacher teach on 1st, to 4th quarter then theere will be 4 teaching load will be created.
  //each teaching load has many classrecords(student records for the subject.).
  //if the student enroll only on math then find the teaching load that has a subject thought with a subject name of Math. then use the teaching load Id to create a class record for the student

  teachingLoad: defineTable({
    subjectTaughtId: v.id("subjectTaught"),
    semester: v.optional(
      v.union(v.literal("1st semester"), v.literal("2nd semester"))
    ),
    quarter: v.optional(
      v.union(
        v.literal("1st quarter"),
        v.literal("2nd quarter"),
        v.literal("3rd quarter"),
        v.literal("4th quarter")
      )
    ),
    subComponent: v.optional(
      v.union(
        v.literal("Music"),
        v.literal("Arts"),
        v.literal("Physical Education"),
        v.literal("Health")
      )
    ),
    sectionId: v.id("sections"),
  }).index("subjectTaughtId", ["subjectTaughtId"]),

  sections: defineTable({
    adviserId: v.id("users"),
    name: v.string(),
    gradeLevel: gradeLevel,
    schoolYear: v.string(),
    semester: v.optional(
      v.union(v.literal("1st semester"), v.literal("2nd semester"))
    ),
    subjects: v.optional(v.array(v.id("subjectTaught"))),
  }).index("adviserId", ["adviserId"]),

  //add column to this table when assigning students to a section
  sectionStudents: defineTable({
    sectionId: v.id("sections"),
    studentId: v.id("students"),
  })
    .index("by_sectionId", ["sectionId"])
    .index("by_studentId", ["studentId"]),

  // table for students record for subject teachers
  classRecords: defineTable({
    teachingLoadId: v.id("teachingLoad"),
    studentId: v.id("students"),
    quarterlyGrade: v.optional(v.number()),
    needsIntervention: v.optional(v.boolean()),
    interventionGrade: v.optional(v.number()),
    interventionUsed: v.optional(v.array(v.string())), // ex. Big book, General remarks
    interventionRemarks: v.optional(v.string()),
  })
    .index("by_teachingLoadId", ["teachingLoadId"])
    .index("by_studentId", ["studentId"]),

  highestScores: defineTable({
    teachingLoadId: v.id("teachingLoad"),
    componentType: v.union(
      v.literal("Written Works"),
      v.literal("Performance Tasks"),
      v.literal("Major Exam")
    ),
    scores: v.array(
      v.object({
        assessmentNo: v.number(),
        score: v.number(),
      })
    ),
  }).index("by_teachingLoadId", ["teachingLoadId"]),

  writtenWorks: defineTable({
    classRecordId: v.id("classRecords"),
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
      v.literal(10)
    ),
    score: v.number(),
  }).index("by_classRecordId", ["classRecordId"]),

  performanceTasks: defineTable({
    classRecordId: v.id("classRecords"),
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
      v.literal(10)
    ),
    score: v.number(),
  }).index("by_classRecordId", ["classRecordId"]),

  majorExams: defineTable({
    classRecordId: v.id("classRecords"),
    assessmentNo: v.union(v.literal(1)),
    score: v.number(),
  }).index("by_classRecordId", ["classRecordId"]),

  students: defineTable({
    lastName: v.string(),
    firstName: v.string(),
    middleName: v.optional(v.string()),
    sex: v.union(v.literal("male"), v.literal("female")),
    lrn: v.string(),
    dateOfBirth: v.string(),
    elementary: v.object({
      genAve: v.string(),
      school: v.string(),
      address: v.string(),
      schoolId: v.optional(v.string()),
    }),
    juniorHigh: v.optional(
      v.object({
        genAve: v.string(),
        school: v.string(),
        address: v.string(),
        completion: v.optional(v.string()),
      })
    ),
    isArchived: v.optional(v.boolean()),
    juniorHighDateOfAdmission: v.string(),
    seniorHighDateOfAdmission: v.optional(v.string()),
    alsRating: v.optional(v.string()),
    status: v.union(
      v.literal("graduated"),
      v.literal("enrolled"),
      v.literal("not-enrolled")
    ), // once promoted or retained it needs to update
    enrollingIn: gradeLevel, // once promoted or retained it needs to update
    semesterEnrollingIn: v.optional(
      v.union(v.literal("1st semester"), v.literal("2nd semester"))
    ), // once promoted or retained it needs to update
  })
    .index("by_lrn", ["lrn"])
    .searchIndex("search_name", {
      searchField: "firstName",
      filterFields: ["isArchived"],
    })
    .searchIndex("search_full_name", {
      searchField: "lastName",
      filterFields: ["isArchived"],
    })
    .searchIndex("search_middle_name", {
      searchField: "middleName",
      filterFields: ["isArchived"],
    }),

  interventions: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
  }),
  enrollment: defineTable({
    studentId: v.id("students"),
    schoolYear: v.string(),
    gradeLevel: gradeLevel,
    status: v.union(
      v.literal("enrolled"),
      v.literal("dropped"),
      v.literal("promoted"),
      v.literal("conditionally-promoted"),
      v.literal("retained")
    ),
    subjects: v.array(v.id("subjectTaught")),
    isReturning: v.boolean(),
    sectionId: v.id("sections"),
    semester: v.optional(
      v.union(v.literal("1st semester"), v.literal("2nd semester"))
    ),
  })
    .index("by_studentId", ["studentId"])
    .index("by_sectionId", ["sectionId"]),

  systemSettings: defineTable({
    schoolImage: v.optional(v.string()),
    schoolName: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
  }),

  values: defineTable({
    studentId: v.id("students"),
    sectionStudentId: v.id("sectionStudents"),
    makaDyos: v.object({
      first: v.object({
        first: v.optional(v.string()),
        second: v.optional(v.string()),
        third: v.optional(v.string()),
        fourth: v.optional(v.string()),
      }),
      second: v.object({
        first: v.optional(v.string()),
        second: v.optional(v.string()),
        third: v.optional(v.string()),
        fourth: v.optional(v.string()),
      }),
    }),
    makaTao: v.object({
      first: v.object({
        first: v.optional(v.string()),
        second: v.optional(v.string()),
        third: v.optional(v.string()),
        fourth: v.optional(v.string()),
      }),
      second: v.object({
        first: v.optional(v.string()),
        second: v.optional(v.string()),
        third: v.optional(v.string()),
        fourth: v.optional(v.string()),
      }),
    }),
    makakalikasan: v.object({
      first: v.object({
        first: v.optional(v.string()),
        second: v.optional(v.string()),
        third: v.optional(v.string()),
        fourth: v.optional(v.string()),
      }),
    }),
    makaBansa: v.object({
      first: v.object({
        first: v.optional(v.string()),
        second: v.optional(v.string()),
        third: v.optional(v.string()),
        fourth: v.optional(v.string()),
      }),
      second: v.object({
        first: v.optional(v.string()),
        second: v.optional(v.string()),
        third: v.optional(v.string()),
        fourth: v.optional(v.string()),
      }),
    }),
  }),

  attendance: defineTable({
    studentId: v.id("students"),
    sectionStudentId: v.id("sectionStudents"),
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

  finalGrades: defineTable({
    studentId: v.id("students"),
    sectionId: v.id("sections"),
    subjectTaughtId: v.id("subjectTaught"),
    generalAverage: v.number(),
    forRemedial: v.optional(v.boolean()),
    remedialConductedFrom: v.optional(v.string()),
    remedialConductedTo: v.optional(v.string()),
    remedialGrade: v.optional(v.number()),
    status: v.optional(v.string()),
  }).index("sectionId", ["sectionId"]),

  promotion: defineTable({
    studentId: v.id("students"),
    sectionId: v.id("sections"),
    type: v.union(
      v.literal("promoted"),
      v.literal("conditionally-promoted"),
      v.literal("retained")
    ),
  }),
});

export default schema;
