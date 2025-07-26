import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  MutationCtx,
  query,
  QueryCtx,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { Id } from "./_generated/dataModel";

export const createUserLogs = mutation({
  args: {
    userId: v.optional(v.id("users")), // The ID of the user performing the action
    action: v.string(),
    details: v.optional(v.string()), // Additional details about the action
    target: v.string(), // e.g., "user", "section", "subject"
  },
  handler: async (ctx, args) => {
    const { userId, action, details, target } = args;
    if (userId && action === "sign_in") {
      // If userId is provided and action is "sign_in", we assume this is a user sign-in log
      await ctx.db.insert("logs", {
        userId,
        action,
        details: details || "User signed in",
        target: target || "N/A",
      });
      return { success: true };
    } else {
      const authUserId = await getAuthUserId(ctx);
      if (!authUserId) {
        throw new Error("Unauthorized");
      }
      await ctx.db.insert("logs", {
        userId: authUserId,
        action,
        details,
        target,
      });
      return { success: true };
    }
  },
});

export const addUserLogs = async (
  ctx: MutationCtx, // Convex context
  args: {
    userId?: Id<"users">; // ID of the user performing the action
    action: string; // Action performed by the user
    details?: string; // Additional details about the action
    target: string; // Target of the action, e.g., "user", "section", "subject"
  }
) => {
  const { userId, action, details, target } = args;
  if (userId && action === "sign_in") {
    // If userId is provided and action is "sign_in", we assume this is a user sign-in log
    await ctx.db.insert("logs", {
      userId,
      action,
      details: details || "User signed in",
      target: target || "N/A",
    });
    return { success: true };
  } else {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.insert("logs", {
      userId: authUserId,
      action,
      details,
      target,
    });
    return { success: true };
  }
};
export const getUserLogs = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const result = await ctx.db
      .query("logs")
      .order("desc")
      .paginate(args.paginationOpts);
    return result;
  },
});
