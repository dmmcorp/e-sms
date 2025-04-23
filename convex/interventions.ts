
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const id = await getAuthUserId(ctx);
        if (!id) throw new ConvexError("Not authenticated");

        const admin = await ctx.db.get(id);
        if (!admin || admin.role !== "admin") throw new ConvexError("Unauthorized");

        return await ctx.db.insert("interventions", {
            name: args.name,
            description: args.description,
        });
    },
});
export const get = query({
    handler: async(ctx) =>{
        const interventions = await ctx.db.query('interventions').collect()
        return interventions
    }
})