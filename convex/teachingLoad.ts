import { v } from "convex/values";
import { query } from "./_generated/server";
import {asyncMap} from "convex-helpers"

export const getTeachingLoad = query({
    args: {
        // Optional ID of the subject being taught
        subjectThoughtId: v.optional(v.id('subjectThought')),
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
        if (!args.subjectThoughtId) return undefined;

        // Query the teachingLoad collection based on subjectThoughtId and quarter
        let teachingLoad = ctx.db.query('teachingLoad')
            .filter(q => q.eq(q.field('subjectThoughId'), args.subjectThoughtId))
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
            const droppedStudents = await asyncMap(
                classRecords.filter(record => record.isDropped),
                async (record) => {
                    const student = await ctx.db.get(record.studentId);
                    return {
                        ...record,
                        student: student
                    };
                }
            );

            // Fetch returning students and include their details
            const returningStudents = await asyncMap(
                classRecords.filter(record => record.isReturning),
                async (record) => {
                    const student = await ctx.db.get(record.studentId);
                    return {
                        ...record,
                        student: student
                    };
                }
            );

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
            const subject = await ctx.db.get(load.subjectThoughId);

            // Return the teaching load with all associated data
            return {
                ...load,
                section: section,
                subject: subject,
                classRecords: classRecords,
                droppedStud: droppedStudents,
                returningStud: returningStudents,
                needsInterventions: needsInterventions
            };
        });
    }
});