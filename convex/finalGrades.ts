import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { asyncMap } from "convex-helpers";
import { GradeLevelsTypes } from "../src/lib/types";

export const create = mutation({
    args:{
        adviserId: v.id('users'),
        studentId: v.id('students'),
        sectionId: v.id('sections'),
        subjects: v.array(v.object({
            subjectTaughtId: v.id("subjectTaught"),
            subjectName: v.string(),
            finalGrade: v.number(),
            forRemedial: v.boolean(),
        })),
        generalAverage: v.number(),
        semester: v.optional(v.string()),
        isPassed: v.optional(v.boolean()),
        dateSubmitted: v.optional(v.string())
    },
    handler: async(ctx, args) =>{
     
        const failedSubjects = args.subjects.filter(subject => subject.finalGrade <= 74)
        const student = await ctx.db.get(args.studentId)
        const enrollment = await ctx.db.query('enrollment')
        .filter(q => q.eq(q.field('studentId'),args.studentId))
        .filter(q => q.eq(q.field('status'),'enrolled'))
        .first()

        const isShs = args.semester ? true : false
        if(!isShs && failedSubjects.length >= 3) { // if Junior high and has more than or equal to 3 failed subejcts
            const id =  await ctx.db.insert('finalGrades',{
                ...args,
                promotionType: "Retained"
            })
            await ctx.db.patch(args.studentId,{
                status: 'not-enrolled',
            })
            await ctx.db.patch(args.studentId,{
                status: 'not-enrolled',
            })
            if(enrollment) {
                await ctx.db.patch(enrollment._id,{
                    status: 'Failed'
                })
            }
            return id
        }

        //To record the grades of the student
        const id = await ctx.db.insert('finalGrades',{
            ...args,
            promotionType: failedSubjects.length >= 1 ? "Conditionally Promoted": "Promoted" 
        })
        //To promote the student
        const currentGradeLevel = student?.enrollingIn;
        const nextGradeLevel = currentGradeLevel ? `Grade ${parseInt(currentGradeLevel.split(' ')[1]) + 1}` : "Grade 7";
        if(args.semester) {
            if(args.semester === "1st semester") {
                await ctx.db.patch(args.studentId,{
                    status: 'not-enrolled',
                    semesterEnrollingIn: "2nd semester",
                })
                return id
            } else {
              
                const isGraduated = nextGradeLevel === "Grade 13"
                if(isGraduated) return
                
                await ctx.db.patch(args.studentId,{
                    status: 'not-enrolled',
                    enrollingIn: nextGradeLevel as GradeLevelsTypes,
                    semesterEnrollingIn: "1st semester",
                 
                })
                return id
            }
        } else {
            if(nextGradeLevel === "Grade 11") {
                await ctx.db.patch(args.studentId,{
                    status: 'not-enrolled',
                    enrollingIn: nextGradeLevel as GradeLevelsTypes,
                    semesterEnrollingIn: "1st semester",
                })
            }
            await ctx.db.patch(args.studentId,{
                status: 'not-enrolled',
                enrollingIn: nextGradeLevel as GradeLevelsTypes,
            })

            return id
        }
    
   
    }
})

export const isStudentPromoted = query({
    args:{
        sectionId: v.id('sections'),
        studentId: v.id('students'),
        semester: v.optional(v.string())
    },
    handler: async(ctx, args) =>{
        const teacherId = await getAuthUserId(ctx)
        if(!teacherId) throw new ConvexError('No teacher Id')
        if(args.semester) {
            const studentFinalGradeExist = await ctx.db.query('finalGrades')
            .filter(q => q.eq(q.field('studentId'), args.studentId))
            .filter(q => q.eq(q.field('adviserId'), teacherId))
            .filter(q => q.eq(q.field('sectionId'), args.sectionId))
            .filter(q => q.eq(q.field('semester'), args.semester))
            .unique()
    
            if(studentFinalGradeExist) {
                return {hasPromoted : true, studentFinalFGrade: studentFinalGradeExist}
            } else {
                return {hasPromoted: false}
            }
        } else {
            const studentFinalGradeExist = await ctx.db.query('finalGrades')
            .filter(q => q.eq(q.field('studentId'), args.studentId))
            .filter(q => q.eq(q.field('adviserId'), teacherId))
            .filter(q => q.eq(q.field('sectionId'), args.sectionId))
            .unique()
    
            if(studentFinalGradeExist) {
                return {hasPromoted : true, studentFinalFGrade: studentFinalGradeExist}
            } else {
                return {hasPromoted: false}
            }
        }
    
    }
})

export const forRemedial = query({
    args:{
        subjectTaughtId: v.optional(v.id('subjectTaught')),
        sectionId:  v.optional(v.id('sections')),
    },
    handler: async(ctx, args)=>{
        if(!args.subjectTaughtId) return []
        if(!args.sectionId) return []
        
        const studentFinalGrades = await ctx.db.query('finalGrades')
        .filter(q => q.eq(q.field('sectionId'), args.sectionId))
        .collect()

        const forRemedial = await asyncMap (studentFinalGrades ,async(sfg)=>{
            const subjectForRemedial = sfg.subjects.find(s=> s.forRemedial === true && s.subjectTaughtId === args.subjectTaughtId)
            const student = await ctx.db.get(sfg.studentId)
            if(student === null) return null
            return {
                ...sfg,
                student: student,
                subjectForRemedial: subjectForRemedial
            }
        })

        const withRemedialSub = forRemedial.filter(fr => fr !== null).filter(fr => fr.subjectForRemedial !== undefined)

        return withRemedialSub
    }
})

export const updateStatus = mutation({
    args: {
        finalGradeId: v.id('finalGrades'),
        subjectTaughtId: v.id('subjectTaught'),
        studentId: v.id('students'),
        status: v.string(), // New status to set
        remedialGrade: v.optional(v.number()),
        sem: v.optional(v.string()),
        gradeLevelToEnroll: v.optional(v.string()),
        isSHS: v.boolean()
    },
    handler: async (ctx, args) => {
        const finalGrade = await ctx.db.get(args.finalGradeId);

        const student = await ctx.db.get(args.studentId)
        if(!student) return
        const enrollment = await ctx.db.query('enrollment')
            .filter(q => q.eq(q.field('studentId'),args.studentId))
            .filter(q => q.eq(q.field('status'),'enrolled'))
            .first()

        if (!finalGrade) {
            throw new Error('FinalGrade record not found');
        }

        if(args.remedialGrade) {
            if(args.isSHS) {
                if(args.remedialGrade <= 74){
                    if(args.sem === "1st semester"){
                        await ctx.db.patch(args.studentId, {
                            semesterEnrollingIn: "1st semester" // meaning retained in the same semester
                        })
                    } 
                    if(args.sem === "2nd semester"){
                        await ctx.db.patch(args.studentId, {
                            semesterEnrollingIn: "2nd semester", // meaning retained in the same semester
                            enrollingIn: `Grade ${parseInt(student.enrollingIn.split(' ')[1]) + 1}` as GradeLevelsTypes
                        })
                    } 

                    if(enrollment) {
                        await ctx.db.patch(enrollment._id,{
                            status: 'Failed'
                        })
                    }
                }
            }
            const updatedSubjects = finalGrade.subjects.map((subject) => {
                if (subject.subjectTaughtId === args.subjectTaughtId) {
                    return {
                        ...subject,
                        remedialGrade: args.remedialGrade, // Update only the status field
                    };
                }
                return subject; // Keep other subjects unchanged
            });
            await ctx.db.patch(args.finalGradeId, {
                subjects: updatedSubjects,
            });
        } else {
            const updatedSubjects = finalGrade.subjects.map((subject) => {
                if (subject.subjectTaughtId === args.subjectTaughtId) {
                    return {
                        ...subject,
                        status: args.status, // Update only the status field
                    };
                }
                return subject; // Keep other subjects unchanged
            });
            await ctx.db.patch(args.finalGradeId, {
                subjects: updatedSubjects,
            });
        }

        // Update the specific subject within the subjects array
       

        // Save the updated subjects array back to the database
      

        return { success: true, message: 'Subject updated successfully' };
    },
});

export const remedialGrades = query({
    args:{
        studentId: v.optional(v.id('students')),
        sectionId: v.optional(v.id('sections'))
    },
    handler: async(ctx, args) =>{
        if(!args.sectionId) return null
        if(!args.studentId) return null
        const studentFinalGrades = await ctx.db.query('finalGrades')
        .filter(q => q.eq(q.field('sectionId'), args.sectionId))
        .filter(q => q.eq(q.field('studentId'), args.studentId))
        .unique()

        return studentFinalGrades
    }
})

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
        
//             if(!fg.adviserId) return 
//             if(!fg.sectionId) return 
//             const adviser = await ctx.db.get(fg.adviserId)
//             const section = await ctx.db.get(fg.sectionId)
//             if(!adviser) return
//             if(!section) return
//             const subjects = await asyncMap(fg.subjects, async(s) =>{
//                 const subjectTaught = await ctx.db.get(s.subjectTaughtId)
//                 if(!subjectTaught) return
//                 return {
//                     ...s,
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
