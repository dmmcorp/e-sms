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
    action: v.string(),
    details: v.optional(v.string()), // Additional details about the action
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const userDetails = await ctx.db.get(userId);
    const { action, details } = args;
    const fullName = userDetails?.fullName;
    const role = userDetails?.role;
    if (!fullName || !role) {
      throw new Error("User details not found");
    }
    if (userId && action === "sign_in") {
      // If userId is provided and action is "sign_in", we assume this is a user sign-in log
      await ctx.db.insert("logs", {
        userId,
        action,
        details: details || "User signed in",
        fullName,
        role,
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
        fullName,
        role,
      });
      return { success: true };
    }
  },
});

export const addUserLogs = async (
  ctx: MutationCtx, // Convex context
  args: {
    action: string; // Action performed by the user
    details?: string; // Additional details about the action
  }
) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const userDetails = await ctx.db.get(userId);
  const { action, details } = args;
  const fullName = userDetails?.fullName;
  const role = userDetails?.role;
  if (!fullName || !role) {
    throw new Error("User details not found");
  }
  if (userId && action === "sign_in") {
    // If userId is provided and action is "sign_in", we assume this is a user sign-in log
    await ctx.db.insert("logs", {
      userId,
      action,
      details: details || "User signed in",
      fullName,
      role,
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
      fullName,
      role,
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
