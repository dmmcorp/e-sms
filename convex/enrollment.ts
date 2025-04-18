import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { gradeLevel } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";
import { asyncMap } from "convex-helpers";
import { createClassRecords } from "./classRecords";
import { internal } from "./_generated/api";

export const addToSection = mutation({
    args:{
        studentId: v.id('students'),
        schoolYear: v.string(),
        gradeLevel: gradeLevel,
        status: v.union(
          v.literal('enrolled'),
          v.literal('dropped'),
          v.literal('Passed'),
          v.literal('Failed'),
        ),
        subjects: v.array(v.id('subjectTaught')),
        isReturning: v.boolean(),
        sectionId: v.id('sections'),
        semester: v.optional(
            v.union(
              v.literal("1st semester"),
              v.literal("2nd semester"),
            )
          )
    },
    handler: async(ctx,args) =>{
        const adviserId = await getAuthUserId(ctx)
        if(adviserId === null) return
        const student = await ctx.db.get(args.studentId)
        if(student === null) return

        if(student.status === 'enrolled'){
            throw new ConvexError('Student already enrolled.')
        }
        if(student.status === 'graduated'){
            throw new ConvexError('Student already graduated.')
        }
        await ctx.db.insert('enrollment',{
            ...args
        })
        await ctx.db.patch(args.studentId,{
            status: 'enrolled'
        })
        await ctx.db.insert('sectionStudents',{
            sectionId: args.sectionId,
            studentId: args.studentId
        })

        const loads = await asyncMap(args.subjects, async(subject)=>{
            const teachingLoad = await ctx.db.query('teachingLoad')
                .withIndex('subjectTaughtId', (q)=> q.eq('subjectTaughtId', subject))
                .filter((q)=> q.eq(q.field('sectionId'), args.sectionId))
                .first()
            return teachingLoad
        })
        const filteredLoads = loads.filter(l => l !== null)

        await asyncMap(filteredLoads, async(load)=>{
            await ctx.runMutation(internal.classRecords.createClassRecords, {
                teachingLoadId: load._id
            })
        })
    }
})

//get the subjects of students
//let the teacher choose a subjects to assign to the student