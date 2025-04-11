import { createAccount, getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { UserForm } from "../src/lib/zod"


// backend function to get the current logged in user
export const current = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;
        return await ctx.db.get(userId);
    },
});

// backend function to get the role of the current logged in user
export const role = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        return user?.role;
    },
});

export const createUser = mutation({
    args: {
        role: v.union(
            v.literal("admin"),
            v.literal("subject-teacher"),
            v.literal("adviser"),
            v.literal("adviser/subject-teacher"),
            v.literal("principal"),
            v.literal("registrar")
        ),
        fullName: v.string(),
        email: v.string(),
        password: v.string(),

        // optional depending on role
        // FOR PRINCIPAL
        principalType: v.optional(v.union(
            v.literal("junior-department"),
            v.literal("senior-department"),
            v.literal("entire-school"),
        )),
    },
    handler: async (ctx, args) => {
        // Verify if there is a current user logged in
        const adminId = await getAuthUserId(ctx);
        if (!adminId) throw new ConvexError("Not authenticated");

        // Get the current user from the database and check if it is an admin
        const admin = await ctx.db.get(adminId);
        if (!admin || admin.role !== "admin") {
            throw new ConvexError("Unauthorized - Only admins can create users");
        }

        // validate the input (for more security we validate it too in server side)
        const { error } = UserForm.safeParse(args)
        if (error) {
            throw new ConvexError(error.format())
        }

        // Check if user with this email already exists (to avoid email duplication)
        const existingUser = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", args.email))
            .first();

        if (existingUser) {
            throw new ConvexError("A user with this email already exists");
        }

        // extract user input
        const { email, password, ...userData } = args;

        // @ts-expect-error - type error in convex auth
        const accountResponse = await createAccount(ctx, {
            provider: "password",
            account: {
                id: email,
                secret: password,
            },
            profile: {
                email,
                ...userData,
                isActive: true,
            }
        })

        // if no response throw an error
        if (!accountResponse?.user?._id) {
            throw new ConvexError("Failed to create account");
        }

        // else return the created user meaning success
        return accountResponse.user;
    }
})