import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { asyncMap } from "convex-helpers";

export const getClassRecords = query({
    args:{

    },
    handler: async(ctx, args) =>{

        return
    }
})

export const createClassRecords = mutation({
    args:{
        teachingLoadId: v.id('teachingLoad'),
    },
    handler: async(ctx,args) =>{
        const load = await ctx.db.get(args.teachingLoadId)
        if(load === null) return 

        const sectionId = load.sectionId;
        const loadId = load._id;

        const students = await ctx.db.query('sectionStudents')
            .withIndex('by_sectionId', (q)=> q.eq("sectionId", sectionId))
            .collect();

        await asyncMap(students, async(student)=>{
            await ctx.db.insert('classRecords',{
                teachingLoadId: loadId,
                studentId: student.studentId,
            })
        })
        
    }
});