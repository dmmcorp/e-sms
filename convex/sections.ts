import { v } from "convex/values";
import { query } from "./_generated/server";

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