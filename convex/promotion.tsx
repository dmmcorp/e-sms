import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { gradeLevels } from "../src/lib/constants";

export const promote = mutation({
    args:{
        studentId: v.id('students'),
        sectionId: v.id('sections'),
        noOfFailedSub: v.number(),
        isSHS: v.boolean(),
        generalAverage: v.optional(v.number())
    },
    handler: async(ctx, args) =>{
        if(!args.generalAverage) throw new ConvexError('No general Average Found.')
        const gradeLevel = gradeLevels
        const student = await ctx.db.get(args.studentId)
        const section = await ctx.db.get(args.sectionId)

        if(!section) throw new ConvexError('No section Found.')
        if(!student) throw new ConvexError('No student Found.')

        const enrollment = await ctx.db.query('enrollment')
            .withIndex('by_studentId', q=> q.eq('studentId', student._id))
            .filter(q => q.eq(q.field('sectionId'), section._id))
            .unique()
        if(!enrollment) throw new ConvexError('No Enrollment Found.')

        const sem = args.isSHS ? section.semester : undefined

        const typeOfPromotion = args.noOfFailedSub >= 3 
            ? "retained" 
            : args.noOfFailedSub > 0 
            ? "conditionally-promoted" 
            : "promoted"

        const nextGradeLevel = gradeLevel.find((level, index) => {
            if (level === student?.enrollingIn) {
                return gradeLevel[index + 1];
            }
        });
        if(args.isSHS) {

            if(typeOfPromotion === 'promoted' || typeOfPromotion === 'conditionally-promoted') {
                await ctx.db.patch(args.studentId,{
                    enrollingIn: sem === "1st semester" ? student.enrollingIn : nextGradeLevel,
                    semesterEnrollingIn: sem === "1st semester" ? "2nd semester" : "2nd semester",
                    status: nextGradeLevel ? "not-enrolled" : "graduated",
                })
                await ctx.db.patch(enrollment._id, {
                    status: typeOfPromotion
                })
            }
            await ctx.db.insert('promotion',{
                studentId: args.studentId,
                sectionId: args.sectionId,
                type: typeOfPromotion
            })

            return {success: true, promotionType: typeOfPromotion}
        } 

        if(!args.isSHS) {
            if(typeOfPromotion === 'promoted' || typeOfPromotion === 'conditionally-promoted') {
                await ctx.db.patch(args.studentId,{
                    enrollingIn: nextGradeLevel,
                    semesterEnrollingIn: undefined,
                    status: nextGradeLevel ? "not-enrolled" : "graduated"
                })
                await ctx.db.patch(args.studentId,{
                    enrollingIn: nextGradeLevel,
                    semesterEnrollingIn: nextGradeLevel === "Grade 11" ? "1st semester" : undefined,
                    status: nextGradeLevel ? "not-enrolled" : "graduated",
                    juniorHigh: nextGradeLevel === "Grade 11"  ? {
                        school: "Tanjay National High School (Opao)",
                        address: "BRGY. IX, OPAO, TANJAY CITY, NEGROS ORIENTAL",
                        genAve: args.generalAverage.toString()
                    } : undefined
                })
                await ctx.db.patch(enrollment._id, {
                    status: typeOfPromotion
                })
            }

            if(typeOfPromotion === 'retained') {
                await ctx.db.patch(args.studentId,{
                    enrollingIn: student.enrollingIn,
                    semesterEnrollingIn: undefined,
                    status: "not-enrolled"
                })
                await ctx.db.patch(enrollment._id, {
                    status: typeOfPromotion
                })
            }


            await ctx.db.insert('promotion',{
                studentId: args.studentId,
                sectionId: args.sectionId,
                type: typeOfPromotion
            })

            return {success: true, promotionType: typeOfPromotion}
        }
        
    }
})