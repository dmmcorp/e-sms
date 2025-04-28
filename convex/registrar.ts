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
            // Split the search text into words
            const searchTerms = args.searchText.toLowerCase().split(/\s+/);

            // Search by first name
            const firstNameResults = await ctx.db
                .query("students")
                .withSearchIndex("search_name", (q) =>
                    q.search("firstName", args.searchText as string)
                        .eq("isArchived", false)
                )
                .take(10);

            // Search by last name
            const lastNameResults = await ctx.db
                .query("students")
                .withSearchIndex("search_full_name", (q) =>
                    q.search("lastName", args.searchText as string)
                        .eq("isArchived", false)
                )
                .take(10);

            // Search by middle name
            const middleNameResults = await ctx.db
                .query("students")
                .withSearchIndex("search_middle_name", (q) =>
                    q.search("middleName", args.searchText as string)
                        .eq("isArchived", false)
                )
                .take(10);

            // Combine and deduplicate results
            const allResults = [...firstNameResults, ...lastNameResults, ...middleNameResults];
            const uniqueResults = Array.from(new Map(allResults.map(item => [item._id, item])).values());

            // If we have multiple search terms, filter results to match all terms
            if (searchTerms.length > 1) {
                return uniqueResults.filter(student => {
                    const fullName = `${student.firstName} ${student.middleName || ''} ${student.lastName}`.toLowerCase();
                    return searchTerms.every(term => fullName.includes(term));
                });
            }

            return uniqueResults;
        }

        return [];
    }
})