import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { gradeLevel } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";

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
        subjects: v.array(v.string()),
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
    }
})

//get the subjects of students
//let the teacher choose a subjects to assign to the student