import { getAuthUserId } from "@convex-dev/auth/server";
import { internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { asyncMap } from "convex-helpers";


export const getSubjects = query({
    handler: async (ctx) => {

        const teacherId = await getAuthUserId(ctx);
        const subjectTaught = await ctx.db.query("subjectTaught").filter(q => q.eq(q.field('teacherId'), teacherId)).collect();


        return subjectTaught
    }
})

export const getSectionSubjects = internalQuery({
    args:{
        sectionSubjects: v.optional(v.array(v.id('subjectTaught'))),
        studentId: v.id('students')
    },
    handler: async(ctx, args) =>{
        if(!args.sectionSubjects) return
        const classsRecords = await ctx.db.query('classRecords').withIndex('by_studentId').collect()

        const ClassRecordsWithTeachingLoad = await asyncMap(classsRecords, async(record)=>{ 
            const load = await ctx.db.get(record.teachingLoadId)
            if(!load) return null

            return {
                ...record,
                teachingLoad: load
            }
        })

        const filteredCR = ClassRecordsWithTeachingLoad.filter(r => r !== null)

        const subjectWithGrades = await asyncMap(args.sectionSubjects, async(subjectId)=>{
            const subject = await ctx.db.get(subjectId);
          
            if(!subject) return null

            // Define the type for grades
            type QuarterGrades = {
                "1st": number | undefined;
                "2nd": number | undefined;
                "3rd": number | undefined;
                "4th": number | undefined;
            };

            // Define the type for interventions
            type QuarterInterventions = {
                "1st": {
                    grade: number | undefined;
                    used: string[] | undefined;
                    remarks: string | undefined;
                };
                "2nd": {
                    grade: number | undefined;
                    used: string[] | undefined;
                    remarks: string | undefined;
                };
                "3rd": {
                    grade: number | undefined;
                    used: string[] | undefined;
                    remarks: string | undefined;
                };
                "4th": {
                    grade: number | undefined;
                    used: string[] | undefined;
                    remarks: string | undefined;
                };
            };

            // Initialize the grades object
            const grades: QuarterGrades = {
                "1st": undefined,
                "2nd": undefined,
                "3rd": undefined,
                "4th": undefined,
            };

            // Initialize the interventions object
            const interventions: QuarterInterventions = {
                "1st": { grade: undefined, used: undefined, remarks: undefined },
                "2nd": { grade: undefined, used: undefined, remarks: undefined },
                "3rd": { grade: undefined, used: undefined, remarks: undefined },
                "4th": { grade: undefined, used: undefined, remarks: undefined }
            };

            for (const record of filteredCR) {
                if (record.teachingLoad.subjectTaughtId === subjectId) {
                    const quarter = record.teachingLoad.quarter?.replace(' quarter', '') as keyof QuarterGrades;
                    if (quarter && quarter in grades) {
                        grades[quarter] = record.quarterlyGrade;
                        
                        if (record.needsIntervention) {
                            interventions[quarter] = {
                                grade: record.interventionGrade,
                                used: record.interventionUsed,
                                remarks: record.interventionRemarks
                            };
                        }
                    }
                }
            }

            return {
                ...subject,
                grades: grades,
                interventions: interventions
            }
        })

        return subjectWithGrades;
    }
})