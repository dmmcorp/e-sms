import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { asyncMap } from "convex-helpers";
import { StudentWithFinalGrades } from "../src/lib/types";
import { Id } from "./_generated/dataModel";

export const getFinalGradesForSF10 = query({
  args: {
    studentId: v.optional(v.id("students")),
    sectionId: v.optional(v.id("sections")),
  },
  handler: async (ctx, args) => {
    if (!args.sectionId) return;
    if (!args.studentId) return;
    const student = await ctx.db.get(args.studentId);
    if (student === null) return;
    const finalGrades = await ctx.db
      .query("finalGrades")
      .filter((q) => q.eq(q.field("studentId"), student._id))
      .filter((q) => q.eq(q.field("sectionId"), args.sectionId))
      .collect();

    const forRemedialFG = finalGrades.filter((g) => g.forRemedial === true);

    const withSubject = await asyncMap(forRemedialFG, async (fGrade) => {
      const subject = await ctx.db.get(fGrade.subjectTaughtId);
      if (subject === null) return null;
      return {
        ...fGrade,
        subject: subject,
      };
    });
    const noNull = withSubject.filter((s) => s !== null);

    return noNull;
  },
});

export const create = mutation({
  args: {
    studentId: v.id("students"),
    sectionId: v.id("sections"),
    subjectTaughtId: v.id("subjectTaught"),
    generalAverage: v.number(),
    forRemedial: v.optional(v.boolean()),
    remedialGrade: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    const section = await ctx.db.get(args.sectionId);
    if (!section) return null;

    await ctx.db.insert("finalGrades", {
      ...args,
    });
  },
});

export const forRemedial = query({
  args: {
    sectionId: v.optional(v.id("sections")),
  },
  handler: async (ctx, args) => {
    const finalGrades = await ctx.db
      .query("finalGrades")
      .filter((q) => q.eq(q.field("sectionId"), args.sectionId))
      .filter((q) => q.eq(q.field("forRemedial"), true))
      .collect();

    const studentFinalGradesMap: Map<string, StudentWithFinalGrades> =
      new Map();

    for (const grades of finalGrades) {
      const student = await ctx.db.get(grades.studentId);
      const subject = await ctx.db.get(grades.subjectTaughtId);
      if (!student) continue;

      if (!studentFinalGradesMap.has(grades.studentId)) {
        studentFinalGradesMap.set(grades.studentId, {
          ...student,
          finalGrades: [],
        });
      }

      const studentData = studentFinalGradesMap.get(grades.studentId);
      studentData?.finalGrades.push({
        ...grades,
        subject: subject,
      });
    }

    return Array.from(studentFinalGradesMap.values());
  },
});

export const saveRemedialData = mutation({
  args: {
    studentId: v.id("students"),
    conductedFrom: v.string(),
    conductedTo: v.string(),
    remedialMarks: v.optional(v.record(v.id("finalGrades"), v.number())),
  },
  handler: async (ctx, args) => {
    if (args.remedialMarks) {
      for (const [finalGradeId, mark] of Object.entries(args.remedialMarks)) {
        const finalGrade = await ctx.db.get(finalGradeId as Id<"finalGrades">);
        if (finalGrade) {
          await ctx.db.patch(finalGrade._id, {
            remedialGrade: mark,
            remedialConductedFrom: args.conductedFrom,
            remedialConductedTo: args.conductedTo,
          });
        }
      }
    }

    return { succes: true, status: 200 };
  },
});

// export const isStudentPromoted = query({
//     args:{
//         sectionId: v.id('sections'),
//         schoolYearId: v.optional(v.id('schoolYears')),
//         studentId: v.id('students'),
//         semester: v.optional(v.string())
//     },
//     handler: async(ctx, args) =>{
//         const teacherId = await getAuthUserId(ctx)
//         if(!teacherId) throw new ConvexError('No teacher Id')
//         if(args.semester) {
//             const studentFinalGradeExist = await ctx.db.query('finalGrades')
//             .filter(q => q.eq(q.field('studentId'), args.studentId))
//             .filter(q => q.eq(q.field('advisorId'), teacherId))
//             .filter(q => q.eq(q.field('sectionId'), args.sectionId))
//             .filter(q => q.eq(q.field('semester'), args.semester))
//             .unique()

//             if(studentFinalGradeExist) {
//                 return {hasPromoted : true, studentFinalFGrade: studentFinalGradeExist}
//             } else {
//                 return {hasPromoted: false}
//             }
//         } else {
//             const studentFinalGradeExist = await ctx.db.query('finalGrades')
//             .filter(q => q.eq(q.field('studentId'), args.studentId))
//             .filter(q => q.eq(q.field('advisorId'), teacherId))
//             .filter(q => q.eq(q.field('sectionId'), args.sectionId))
//             .unique()

//             if(studentFinalGradeExist) {
//                 return {hasPromoted : true, studentFinalFGrade: studentFinalGradeExist}
//             } else {
//                 return {hasPromoted: false}
//             }
//         }

//     }
// })

// export const forRemedial = query({
//     args:{
//         subjectTaughtId: v.optional(v.id('subjectTaught')),
//         sectionId:  v.optional(v.id('sections')),
//     },
//     handler: async(ctx, args)=>{
//         if(!args.subjectTaughtId) return []
//         if(!args.sectionId) return []

//         const studentFinalGrades = await ctx.db.query('finalGrades')
//         .filter(q => q.eq(q.field('sectionId'), args.sectionId))
//         .collect()

//         const forRemedial = await asyncMap (studentFinalGrades ,async(sfg)=>{
//             const subjectForRemedial = sfg.subjects.find(s=> s.forRemedial === true && s.subjectTaughtId === args.subjectTaughtId)
//             const student = await ctx.db.get(sfg.studentId)
//             if(student === null) return null
//             return {
//                 ...sfg,
//                 student: student,
//                 subjectForRemedial: subjectForRemedial
//             }
//         })

//         const withRemedialSub = forRemedial.filter(fr => fr !== null).filter(fr => fr.subjectForRemedial !== undefined)

//         return withRemedialSub
//     }
// })

// export const remedialGrades = query({
//     args:{
//         studentId: v.optional(v.id('students')),
//         sectionId: v.optional(v.id('sections'))
//     },
//     handler: async(ctx, args) =>{
//         if(!args.sectionId) return null
//         if(!args.studentId) return null
//         const studentFinalGrades = await ctx.db.query('finalGrades')
//         .filter(q => q.eq(q.field('sectionId'), args.sectionId))
//         .filter(q => q.eq(q.field('studentId'), args.studentId))
//         .unique()

//         return studentFinalGrades
//     }
// })

// export const getFinalGradesForSF10 = query({
//     args:{
//         studentId: v.id('students')
//     },
//     handler: async(ctx, args) =>{
//         const finalsGrades = await ctx.db.query('finalGrades')
//             .filter(q => q.eq(q.field('studentId'), args.studentId))
//             .collect()

//             console.log(args.studentId)

//         const studentQuarterlyGrades = await ctx.db.query('quarterlyGrades')
//             .filter(q => q.eq(q.field('studentId'), args.studentId))
//             .collect()

//         const finalGradesWithDetails = await asyncMap(finalsGrades, async(fg) =>{
//             if(!fg.schoolYearId) return
//             if(!fg.advisorId) return
//             if(!fg.sectionId) return
//             const schoolYear = await ctx.db.get(fg.schoolYearId)
//             const advisor = await ctx.db.get(fg.advisorId)
//             const section = await ctx.db.get(fg.sectionId)
//             if(!schoolYear) return
//             if(!advisor) return
//             if(!section) return
//             const gradeLevel = await ctx.db.get(section.gradeLevelId)
//             const subjects = await asyncMap(fg.subjects, async(s) =>{
//                 const cLass = await ctx.db.get(s.classId)
//                 if(!cLass) return
//                 const subject = await ctx.db.get(cLass.subjectId)
//                 if(!subject) return
//                 return {
//                     ...s,
//                     cLass: cLass,
//                     subject: subject
//                 }
//             })
//             const filteredSubjects = subjects.filter(s => s !== undefined)
//             const filtererdQG = studentQuarterlyGrades.filter(qg => fg.subjects.find(c => c.classId === qg.classId))

//             const qgWithSubject = await asyncMap(filtererdQG, async (qg) => {
//                 const cLAss = await ctx.db.get(qg.classId)
//                 if (!cLAss) return null
//                 const subject = await ctx.db.get(cLAss.subjectId)
//                 if (!subject) return null

//                 return {
//                   ...qg,
//                   subject: subject
//                 }
//               })

//               const notNull = qgWithSubject.filter(item => item !== null)
//             return {
//                 ...fg,
//                 schoolYear: schoolYear,
//                 advisor: advisor,
//                 section: {...section, gradeLevel: gradeLevel},
//                 subjectsWithClass: filteredSubjects,
//                 quarterlyGrades: notNull
//             }
//         })

//         const filteredFG = finalGradesWithDetails.filter(fg => fg !== undefined)

//         return filteredFG
//     }
// })
