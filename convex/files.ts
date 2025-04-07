import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const getStorageUrl = query({
    args: { storageId: v.string() },
    handler: async (ctx, args) => {
        if (!args.storageId) return null;
        try {
            return await ctx.storage.getUrl(args.storageId);
        } catch (error) {
            console.error("Error getting storage URL:", error);
            return null;
        }
    },
}); 