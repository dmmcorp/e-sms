import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { asyncMap } from "convex-helpers";
import { Doc } from "./_generated/dataModel";

export const get = query({
    args: {
        gradeLevel: v.optional(v.union(
            v.literal("Grade 7"),
            v.literal('Grade 8'),
            v.literal('Grade 9'),
            v.literal('Grade 10'),
            v.literal('Grade 11'),
            v.literal('Grade 12'),
        ))
    },
    handler: async (ctx, args) => {
        if (args.gradeLevel) {
            return await ctx.db
                .query("sections")
                .filter((q) => q.eq(q.field("gradeLevel"), args.gradeLevel))
                .collect();
        }
        return await ctx.db.query("sections").collect();
    }
})

export const addSubjectTaught = internalMutation({
    args: {
        sectionId: v.id('sections'),
        id: v.id('subjectTaught')
    },
    handler: async (ctx, args) => {

        const section = await ctx.db.get(args.sectionId)
        if (section === null) return

        // Check if subject already exists in the array
        const existingSubjects = section.subjects || [];
        if (!existingSubjects.includes(args.id)) {
            await ctx.db.patch(section._id, {
                subjects: [...existingSubjects, args.id]
            });
        }
    }
});

export const getSection = query({
    args: {
        sectionId: v.optional(v.id('sections'))
    },
    handler: async (ctx, args) => {
        if (!args.sectionId) return undefined
        return await ctx.db.get(args.sectionId)
    }
})

export const handledSection = query({
    args: {
        schoolYear: v.string()
    },
    handler: async (ctx, args) => {
        const adviserId = await getAuthUserId(ctx)

        const sections = await ctx.db.query('sections')
            .filter(q => q.eq(q.field('adviserId'), adviserId))
            .filter(q => q.eq(q.field('schoolYear'), args.schoolYear))
            .collect()

        return sections
    }
});

export const getSectionSubject = query({
    args: {
        sectionId: v.optional(v.id('sections'))
    },
    handler: async (ctx, args) => {
        if (!args.sectionId) return undefined

        const section = await ctx.db.get(args.sectionId)
        if (section === null) throw new ConvexError('Section not found.')

        let subjects: Doc<'subjectTaught'>[] | null
        if (section.subjects) {

            const s = await asyncMap(section.subjects, async (id) => {
                const subjectThought = await ctx.db.get(id)
                if (subjectThought === null) return null
                return subjectThought
            });
            subjects = s.filter(sub => sub !== null)
        } else {
            subjects = []
        }

        return subjects
    }
})