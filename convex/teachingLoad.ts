import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {asyncMap} from "convex-helpers"

export const getTeachingLoad = query({
    args: {
        // Optional ID of the subject being taught
        subjectTaughtId: v.optional(v.id('subjectTaught')),
        // Quarter of the academic year
        quarter: v.union(
            v.literal('1st quarter'),
            v.literal('2nd quarter'),
            v.literal('3rd quarter'),
            v.literal('4th quarter'),
        ),
        // Optional semester of the academic year
        semester: v.optional(v.union(
            v.literal('1st semester'),
            v.literal('2nd semester')
        )),
    },
    handler: async (ctx, args) => {
        // If no subjectThoughtId is provided, return undefined
        if (!args.subjectTaughtId) return undefined;

        // Query the teachingLoad collection based on subjectThoughtId and quarter
        let teachingLoad = ctx.db.query('teachingLoad')
            .filter(q => q.eq(q.field('subjectTaughtId'), args.subjectTaughtId))
            .filter(q => q.eq(q.field('quarter'), args.quarter));

        // If semester is provided, filter teachingLoad by semester
        if (args.semester) {
            teachingLoad = teachingLoad.filter(q => q.eq(q.field('semester'), args.semester));
        }

        // Collect the filtered teachingLoad data
        const query = await teachingLoad.collect();

        // Process each teaching load entry
        return await asyncMap(query, async (load) => {
            // Fetch initial class records associated with the teaching load
            const initClassRecords = await ctx.db.query('classRecords').filter(q => q.eq(q.field('teachingLoadId'), load._id)).collect();

            // Process each class record to calculate averages and prepare chart data
            const classRecords = await asyncMap(initClassRecords, async (classRecord) => {
                const ww = await ctx.db.query('writtenWorks').filter(q => q.eq(q.field('classRecordId'), classRecord._id)).collect();
                const pt = await ctx.db.query('performanceTasks').filter(q => q.eq(q.field('classRecordId'), classRecord._id)).collect();
                const me = await ctx.db.query('majorExams').filter(q => q.eq(q.field('classRecordId'), classRecord._id)).collect();

                // Calculate the number of entries for each type
                const wwLength = ww.length;
                const ptLength = pt.length;
                const meLength = me.length;

                // Calculate average scores for each type
                const wwAverage = wwLength > 0 ? ww.reduce((sum, item) => sum + item.score, 0) / wwLength : 0;
                const ptAverage = ptLength > 0 ? pt.reduce((sum, item) => sum + item.score, 0) / ptLength : 0;
                const meAverage = meLength > 0 ? me.reduce((sum, item) => sum + item.score, 0) / meLength : 0;

                // Prepare chart data for the class record
                const chartData = [
                    {
                        type: "Written",
                        aveScores: wwAverage,
                    },
                    {
                        type: "Performance",
                        aveScores: ptAverage,
                    },
                    {
                        type: "Major Exam",
                        aveScores: meAverage,
                    },
                ];

                // Return the class record with chart data
                return {
                    ...classRecord,
                    chartData: chartData
                };
            });

            // Fetch dropped students and include their details
            // const droppedStudents = await asyncMap(
            //     classRecords.filter(record => record.isDropped),
            //     async (record) => {
            //         const student = await ctx.db.get(record.studentId);
            //         return {
            //             ...record,
            //             student: student
            //         };
            //     }
            // );

            // Fetch returning students and include their details
            // const returningStudents = await asyncMap(
            //     classRecords.filter(record => record.isReturning),
            //     async (record) => {
            //         const student = await ctx.db.get(record.studentId);
            //         return {
            //             ...record,
            //             student: student
            //         };
            //     }
            // );

            // Fetch students needing interventions and include their details
            const needsInterventions = await asyncMap(
                classRecords.filter(record => record.needsIntervention),
                async (record) => {
                    const student = await ctx.db.get(record.studentId);
                    return {
                        ...record,
                        student: student
                    };
                }
            );

            // Fetch section and subject details for the teaching load
            const section = await ctx.db.get(load.sectionId);
            const subject = await ctx.db.get(load.subjectTaughtId);

            // Return the teaching load with all associated data
            return {
                ...load,
                section: section,
                subject: subject,
                classRecords: classRecords,
                // droppedStud: droppedStudents,
                // returningStud: returningStudents,
                needsInterventions: needsInterventions
            };
        });
    }
});
export const getById = query({
    args:{ 
       id: v.optional(v.id('teachingLoad'))

    },
    handler: async(ctx, args) =>{
        if(!args.id) return undefined;

        const load = await ctx.db.get(args.id)

        if(load === null) return undefined;

        const subjectTaught = await ctx.db.get(load.subjectTaughtId);
        const section = await ctx.db.get(load.sectionId);
        
        if(!subjectTaught) throw new ConvexError('No subject Taught Found!');
        if(!section) throw new ConvexError('No section Found!');

        const teacher = await ctx.db.get(subjectTaught.teacherId)

        const classRecords = await ctx.db.query('classRecords')
            .filter(q => q.eq(q.field('teachingLoadId'), load._id))
            .order('desc').collect()
          
        const recordWithStudentInfo = await asyncMap(classRecords, async(record)=>{
            const student = await ctx.db.get(record.studentId);
            if(student === null) return null
            return {
                ...record,
                student: student
            }
        });

        const highestScores = await ctx.db.query('highestScores')
            .filter(q => q.eq(q.field('teachingLoadId'), load._id))
            .collect()
        

        return {
            ...load,
            subjectTaught: {
                ...subjectTaught,
                teacher: teacher
            },
            section: section,
            classRecords: recordWithStudentInfo.filter( rec => rec !== null),
            highestScores: highestScores
        }
    }
});

export const saveHighestScores = mutation({
    args:{
        loadId: v.id('teachingLoad'),
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
    handler: async(ctx, args) =>{
        const isExisting = await ctx.db.query('highestScores')
            .filter(q => q.eq(q.field('teachingLoadId'), args.loadId))
            .filter(q => q.eq(q.field('componentType'), args.componentType))
            .first()
        if(isExisting !== null) {
            await ctx.db.patch(isExisting._id,{
                teachingLoadId: args.loadId,
                componentType: args.componentType,
                scores: args.scores
            })
        } else {
            await ctx.db.insert('highestScores',{
                teachingLoadId: args.loadId,
                componentType: args.componentType,
                scores: args.scores
            })
        }
    }
})

export const getLoadUsingSectionId = query({
    args:{
        sectionId: v.id('sections'),
        quarter: v.union(
            v.literal('1st quarter'),
            v.literal('2nd quarter'),
            v.literal('3rd quarter'),
            v.literal('4th quarter'),
        ),
        semester: v.optional(v.union(
            v.literal('1st semester'),
            v.literal('2nd semester'),
        )),
    },
    handler: async(ctx, args) =>{
        let query = await ctx.db.query('teachingLoad')
            .filter(q => q.eq(q.field('sectionId'), args.sectionId))
            .filter(q => q.eq(q.field('quarter'), args.quarter))

        if(args.semester) {
            query = query.filter(q => q.eq(q.field('semester'), args.semester))
        }

        let loads = query.collect()

        const subjects = await asyncMap(loads, async(load)=>{
      
            // Fetch initial class records associated with the teaching load
            const initClassRecords = await ctx.db.query('classRecords').filter(q => q.eq(q.field('teachingLoadId'), load._id)).collect();

             // Process each class record to calculate averages and prepare chart data
             const classRecords = await asyncMap(initClassRecords, async (classRecord) => {
                const ww = await ctx.db.query('writtenWorks').filter(q => q.eq(q.field('classRecordId'), classRecord._id)).collect();
                const pt = await ctx.db.query('performanceTasks').filter(q => q.eq(q.field('classRecordId'), classRecord._id)).collect();
                const me = await ctx.db.query('majorExams').filter(q => q.eq(q.field('classRecordId'), classRecord._id)).collect();

                // Calculate the number of entries for each type
                const wwLength = ww.length;
                const ptLength = pt.length;
                const meLength = me.length;

                // Calculate average scores for each type
                const wwAverage = wwLength > 0 ? ww.reduce((sum, item) => sum + item.score, 0) / wwLength : 0;
                const ptAverage = ptLength > 0 ? pt.reduce((sum, item) => sum + item.score, 0) / ptLength : 0;
                const meAverage = meLength > 0 ? me.reduce((sum, item) => sum + item.score, 0) / meLength : 0;

                // Prepare chart data for the class record
                const chartData = [
                    {
                        type: "Written",
                        aveScores: wwAverage,
                    },
                    {
                        type: "Performance",
                        aveScores: ptAverage,
                    },
                    {
                        type: "Major Exam",
                        aveScores: meAverage,
                    },
                ];

                // Return the class record with chart data
                return {
                    ...classRecord,
                    chartData: chartData
                };
            });

             // Fetch dropped students and include their details
            //  const droppedStudents = await asyncMap(
            //     classRecords.filter(record => record.isDropped),
            //     async (record) => {
            //         const student = await ctx.db.get(record.studentId);
            //         return {
            //             ...record,
            //             student: student
            //         };
            //     }
            // );

            // // Fetch returning students and include their details
            // const returningStudents = await asyncMap(
            //     classRecords.filter(record => record.isReturning),
            //     async (record) => {
            //         const student = await ctx.db.get(record.studentId);
            //         return {
            //             ...record,
            //             student: student
            //         };
            //     }
            // );

            // Fetch students needing interventions and include their details
            const needsInterventions = await asyncMap(
                classRecords.filter(record => record.needsIntervention),
                async (record) => {
                    const student = await ctx.db.get(record.studentId);
                    return {
                        ...record,
                        student: student
                    };
                }
            );

            // Fetch subject details for the teaching load

            const subject = await ctx.db.get(load.subjectTaughtId);
            if(subject === null) return null
            const teacher = await ctx.db.get(subject.teacherId);
            if(teacher === null) return null;

            return{
                ...load,
                subject:{
                    ...subject,
                    teacher: teacher
                },
                classRecords: classRecords,
                // droppedStud: droppedStudents,
                // returningStud: returningStudents,
                needsInterventions: needsInterventions
            }
        })
        return subjects.filter(s => s != null)
    }
})