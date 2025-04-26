import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { asyncMap } from "convex-helpers";
import { GradeLevelsTypes } from "../src/lib/types";

export const getFinalGradesForSF10 = query({
    args:{
        studentId: v.optional(v.id('students')),
        sectionId: v.optional(v.id('sections'))
    },
    handler: async(ctx, args) =>{
        if(!args.sectionId) return
        if(!args.studentId) return
        const student = await ctx.db.get(args.studentId)
        if(student === null) return
        const  finalGrades = await ctx.db.query('finalGrades')
            .filter(q => q.eq(q.field('studentId'), student._id))
            .filter(q => q.eq(q.field('sectionId'), args.sectionId))
            .collect()

        const forRemedialFG = finalGrades.filter(g => g.forRemedial === true)

        const withSubject = await asyncMap(forRemedialFG, async(fGrade)=> {
            const subject = await ctx.db.get(fGrade.subjectTaughtId)
            if(subject === null) return null
            return {
                ...fGrade,
                subject: subject
            }
        })
        const noNull = withSubject.filter(s => s !== null)
        
        return noNull
    }
})

// export const create = mutation({
//     args:{
//         advisorId: v.id('users'),
//         studentId: v.id('students'),
//         sectionId: v.id('sections'),
//         schoolYearId: v.optional(v.id('schoolYears')),
//         subjects: v.array(v.object({
//             subjectName: v.string(),
//             finalGrade: v.number(),
//             forRemedial: v.boolean(),
//             subjectTaughtId: v.id('subjectTaught'),
//         })),
//         generalAverage: v.number(),
//         semester: v.optional(v.string()),
//         isPassed: v.optional(v.boolean()),
//         dateSubmitted: v.optional(v.string())
//     },
//     handler: async(ctx, args) =>{
     
//         const failedSubjects = args.subjects.filter(subject => subject.finalGrade <= 74)
//         const student = await ctx.db.get(args.studentId)
//         const isShs = args.semester ? true : false
//         if(!isShs && failedSubjects.length >= 3) { // if Junior high and has more than or equal to 3 failed subejcts
//             const id =  await ctx.db.insert('finalGrades',{
//                 ...args,
//                 promotionType: "Retained"
//             })
//             await ctx.db.patch(args.studentId,{
//                 status: 'not-enrolled',
//             })
//             return id
//         }

//         //To recorrd the grades of the student
//         const id = await ctx.db.insert('finalGrades',{
//             ...args,
//             promotionType: failedSubjects.length >= 1 ? "Conditionally Promoted": "Promoted" 
//         })
//         //To promote the student
      
//         const nextGradeLevel = (Number(student?.enrollingIn?.replace("Grade ", "")) ?? 0) + 1
//         if(args.semester) {
//             if(args.semester === "1st semester") {
//                 await ctx.db.patch(args.studentId,{
//                     status: 'not-enrolled',
//                     semesterEnrollingIn: "2nd semester",
//                 })
//                 return id
//             } else {
              
//                 const isGraduated = nextGradeLevel === 13
//                 if(isGraduated){
//                     await ctx.db.patch(args.studentId,{
//                         status: 'not-enrolled',
//                         enrollingIn: undefined,
//                         semesterEnrollingIn: undefined,
//                     })
//                 }
//                 await ctx.db.patch(args.studentId,{
//                     status: 'not-enrolled',
//                     enrollingIn: `Grade ${nextGradeLevel}` as GradeLevelsTypes,
//                     semesterEnrollingIn: "1st semester",
//                 })
//                 return id
//             }
//         } else {
//             if(nextGradeLevel === 11) {
//                 await ctx.db.patch(args.studentId,{
//                     status: 'not-enrolled',
//                     enrollingIn: `Grade ${nextGradeLevel}` as GradeLevelsTypes,
//                     semesterEnrollingIn: "1st semester",
//                 })
//             }
//             await ctx.db.patch(args.studentId,{
//                 status: 'not-enrolled',
//                 enrollingIn: `Grade ${nextGradeLevel}` as GradeLevelsTypes,
//             })

//             return id
//         }
    
   
//     }
// })

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
