import { v } from "convex/values";
import { query } from "./_generated/server";

export const searchStudents = query({
    args: {
        searchText: v.optional(v.string()),
        searchLRN: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (args.searchLRN) {
            const student = await ctx.db
                .query("students")
                .withIndex("by_lrn", (q) => q.eq("lrn", args.searchLRN as string))
                .filter((q) => q.eq(q.field("isArchived"), false))
                .first();

            return student ? [student] : [];
        }

        if (args.searchText) {
            const results = await ctx.db
                .query("students")
                .withSearchIndex("search_name", (q) =>
                    q.search("firstName", args.searchText as string)
                        .eq("isArchived", false)
                )
                .take(10);
            return results;
        }

        return [];
    }
})