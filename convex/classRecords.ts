import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { asyncMap } from "convex-helpers";
import { Doc } from "./_generated/dataModel";
import { AssessmentNoType } from "../src/lib/types";

export const getClassRecords = query({
    args:{

    },
    handler: async(ctx, args) =>{

        return
    }
})

export const createClassRecords = internalMutation({
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


export const createComponentScore = mutation({
    args:{
        classRecordId: v.optional(v.id('classRecords')),
        componentType: v.union(
            v.literal("Written Works"),
            v.literal("Performance Tasks"),
            v.literal("Major Exam"),
        ),
        scores: v.array(v.object({
            assessmentNo: v.number(),
            score: v.number()
        }))
    },
    handler: async(ctx, args)=>{
        const componentMap = {
            "Written Works": "writtenWorks",
            "Performance Tasks": "performanceTasks",
            "Major Exam": "majorExams"
          } as const;
        // Get the table name
        const componentType = componentMap[args.componentType as keyof typeof componentMap];

        if (componentType && args.classRecordId) {
            const existingComponents = await ctx.db
                .query(componentType)
                .filter(q => q.eq(q.field('classRecordId'), args.classRecordId))
                .collect();
        
            for (const assessment of args.scores) {
                const existing = existingComponents.find(c => c.assessmentNo === assessment.assessmentNo);
        
                if (existing) {
                    await ctx.db.patch(existing._id, {
                        score: assessment.score,
                    });
                } else {
                    await ctx.db.insert(componentType, {
                        classRecordId: args.classRecordId,
                        assessmentNo: assessment.assessmentNo as AssessmentNoType,
                        score: assessment.score,
                    });
                }
            }
        } else {
            return;
        }
        
      
    }
})