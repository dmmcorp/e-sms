import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { gradeLevel } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";
import { asyncMap } from "convex-helpers";
import { internal } from "./_generated/api";

export const addToSection = mutation({
    args: {
        studentId: v.id('students'),
        schoolYear: v.string(),
        gradeLevel: gradeLevel,
        status: v.union(
            v.literal('enrolled'),
            v.literal('dropped'),
            v.literal('promoted'),
            v.literal('conditionally-promoted'),
            v.literal('retained'),
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
    handler: async (ctx, args) => {
        const adviserId = await getAuthUserId(ctx)
        if (adviserId === null) return
        const student = await ctx.db.get(args.studentId)
        if (student === null) return

        if (student.status === 'enrolled') {
            throw new ConvexError('Student already enrolled.')
        }
        if (student.status === 'graduated') {
            throw new ConvexError('Student already graduated.')
        }
        await ctx.db.insert('enrollment', {
            ...args
        })
        await ctx.db.patch(args.studentId, {
            status: 'enrolled'
        })
        await ctx.db.insert('sectionStudents', {
            sectionId: args.sectionId,
            studentId: args.studentId
        })

        const loads = await asyncMap(args.subjects, async (subjectTaughtId) => {
            const teachingLoad = await ctx.db.query('teachingLoad')
                .withIndex('subjectTaughtId', (q) => q.eq('subjectTaughtId', subjectTaughtId))
                .filter((q) => q.eq(q.field('sectionId'), args.sectionId))
                .collect()
            return teachingLoad
        })

        const flatLoads = loads.flat()
        const filteredLoads = flatLoads.filter(l => l !== null)

        await asyncMap(filteredLoads, async (load) => {
            await ctx.runMutation(internal.classRecords.createClassRecords, {
                teachingLoadId: load._id,
                studentId: args.studentId,
            })
        })
    }
})

export const editSubjects = mutation({
    args: {
        enrollmentId: v.optional(v.id('enrollment')),
        subjects: v.array(v.id('subjectTaught'))
    },
    handler: async (ctx, args) => {
        if (!args.enrollmentId) return
        const enrollment = await ctx.db.get(args.enrollmentId);
        if (enrollment === null) return
        if (enrollment.status !== 'enrolled') {
            throw new ConvexError('Student not enrolled.')
        }
        await ctx.db.patch(args.enrollmentId, {
            subjects: args.subjects
        })
    }
})

export const getBySectionId = query({
    args: {
        sectionId: v.id("sections"),
    },
    handler: async (ctx, args) => {
        const enrollments = await ctx.db
            .query("enrollment")
            .filter((q) => q.eq(q.field("sectionId"), args.sectionId))
            .collect();
        return enrollments;
    },
});

export const dropStudent = mutation({
    args:{
        enrollmentId: v.id('enrollment')
    },
    handler: async(ctx,args) => {
        const enrollment = await ctx.db.get(args.enrollmentId)
        if(!enrollment) throw new ConvexError('No Enrollment Found.')

        await ctx.db.patch(enrollment._id, {
            status: "dropped"
        })

        await ctx.db.patch(enrollment.studentId, {
            status: "not-enrolled"
        })
    }
})

export const isEnrolled = query({
    args:{
        enrollmentId: v.optional(v.id('enrollment')),
    },
    handler: async(ctx, args) =>{
        if(!args.enrollmentId) throw new ConvexError("No enrollment ID.")
        
        const enrollment = await ctx.db.get(args.enrollmentId)
        if(!enrollment) throw new ConvexError("No enrollment found in database.")

        return enrollment.status === 'enrolled' ? true : false

    }
})