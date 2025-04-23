import { ConvexError, v } from "convex/values";
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
        studentId: v.id('students')
    },
    handler: async(ctx,args) =>{
        const load = await ctx.db.get(args.teachingLoadId)
        if(load === null) return 
        
        const loadId = load._id;

        await ctx.db.insert('classRecords',{
            teachingLoadId: loadId,
            studentId: args.studentId,
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

export const saveQuarterlyGrades = mutation({
    args:{
        loadId: v.id('teachingLoad'),
        studentId: v.optional(v.id('students')),
        transmutedGrade: v.optional(v.number()),

    },  
    handler: async(ctx, args)=>{
        if(!args.studentId) return
        if(!args.transmutedGrade) return
        
        const teachingLoad = await ctx.db.get(args.loadId)
        const student = await ctx.db.get(args.studentId)

        if(!teachingLoad || !student) throw new ConvexError('Unable to save grades.')
        
        const classRecord = await ctx.db.query('classRecords')
            .withIndex('by_teachingLoadId', (q) => q.eq('teachingLoadId', teachingLoad._id))
            .filter(q => q.eq(q.field('studentId'), student._id))
            .first()
        
        if(!classRecord) throw new ConvexError('No class record found.')

        await ctx.db.patch(classRecord._id, {
            needsIntervention: args.transmutedGrade <= 74 ? true : false,
            quarterlyGrade: args.transmutedGrade,
        })

    }   
})

export const saveInterventionGrade = mutation({
    args:{
        id: v.optional(v.id('classRecords')),
        remarks: v.string(),
        interventionUsed: v.array(v.string()),
        interventionGrade: v.number()
    },
    handler: async(ctx, args) =>{
        if(!args.id) return 

        const classRecord = await ctx.db.get(args.id);

        if(classRecord){
            await ctx.db.patch(classRecord._id,{
                interventionGrade: args.interventionGrade,
                interventionUsed: args.interventionUsed,
                interventionRemarks: args.remarks
            })
        }


        
    }
})