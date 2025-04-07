import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const create = mutation({
    args: {
        schoolImage: v.optional(v.string()),
        schoolName: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const id = await getAuthUserId(ctx)
        if (!id) throw new ConvexError("Not authenticated")

        const admin = await ctx.db.get(id)
        if (!admin || admin.role !== "admin") throw new ConvexError("Unauthorized")

        const existingSettings = await ctx.db
            .query("systemSettings")
            .order("desc")
            .first();

        if (existingSettings) {
            await ctx.db.delete(existingSettings._id);
        }

        return await ctx.db.insert("systemSettings", {
            schoolImage: args.schoolImage,
            schoolName: args.schoolName,
        })
    }
})

export const get = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db
            .query("systemSettings")
            .order("desc")
            .first()

        if (!settings?.schoolImage) {
            return null
        }

        const imageUrl = await ctx.storage.getUrl(settings?.schoolImage)

        return {
            ...settings,
            schoolImage: imageUrl
        }
    }
})