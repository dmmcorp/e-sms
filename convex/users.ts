import { createAccount, getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { UserForm } from "../src/lib/zod"
import { Id } from "./_generated/dataModel";


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

        // FOR SUBJECT-TEACHER
        subjectsTaught: v.optional(v.array(v.object({
            subjectName: v.string(),
            gradeLevel: v.union(
                v.literal('Grade 7'),
                v.literal('Grade 8'),
                v.literal('Grade 9'),
                v.literal('Grade 10'),
                v.literal('Grade 11'),
                v.literal('Grade 12'),
            ),
            sectionId: v.string(), // Changed from v.id to v.string to accept pending IDs
            quarter: v.array(v.union(
                v.literal('1st quarter'),
                v.literal('2nd quarter'),
                v.literal('3rd quarter'),
                v.literal('4th quarter'),
            )),
            semester: v.optional(v.array(v.union(
                v.literal('1st semester'),
                v.literal('2nd semester'),
            ))),
            gradeWeights: v.object({
                type: v.union(
                    v.literal("Face to face"),
                    v.literal("Modular"),
                    v.literal("Other"),
                ),
                faceToFace: v.optional(v.object({
                    ww: v.number(),
                    pt: v.number(),
                    majorExam: v.number(),
                })),
                modular: v.optional(v.object({
                    ww: v.number(),
                    pt: v.number(),
                })),
                other: v.optional(v.array(v.object({
                    component: v.union(
                        v.literal('Written Works'),
                        v.literal('Performance Tasks'),
                        v.literal('Major Exam'),
                    ),
                    percentage: v.number(),
                }))),
            }),
        }))),

        // FOR ADVISER

        sections: v.optional(v.array(v.object({
            name: v.string(),
            gradeLevel: v.union(
                v.literal('Grade 7'),
                v.literal('Grade 8'),
                v.literal('Grade 9'),
                v.literal('Grade 10'),
                v.literal('Grade 11'),
                v.literal('Grade 12'),
            ),
            schoolYear: v.string(),
        }))),

        // FOR OTHERS
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
        const { email, password, subjectsTaught, sections, ...userData } = args;

        // Create the user account in auth system
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
        });

        // if no response throw an error
        if (!accountResponse?.user?._id) {
            throw new ConvexError("Failed to create account");
        }

        // Array to store created section IDs
        const createdSections = [];

        // Handle adviser sections first
        if ((args.role === "adviser" || args.role === "adviser/subject-teacher") && sections && sections.length > 0) {
            for (const section of sections) {
                const sectionId = await ctx.db.insert("sections", {
                    adviserId: accountResponse.user._id,
                    name: section.name,
                    gradeLevel: section.gradeLevel,
                    schoolYear: section.schoolYear,
                });

                createdSections.push({
                    id: sectionId,
                    name: section.name,
                    gradeLevel: section.gradeLevel,
                    index: createdSections.length,
                });
            }
        }

        // Handle subject teacher subjects (for both subject-teacher and adviser/subject-teacher roles)
        if ((args.role === "subject-teacher" || args.role === "adviser/subject-teacher") && subjectsTaught) {
            for (const subject of subjectsTaught) {
                // Check if this is a reference to a pending section
                let sectionId = subject.sectionId;

                // If it's a pending section reference (pending-section-X)
                if (sectionId.startsWith('pending-section-')) {
                    const pendingIndex = parseInt(sectionId.replace('pending-section-', ''));

                    // Find the corresponding created section by index AND matching grade level
                    const createdSection = createdSections.find(
                        s => s.index === pendingIndex &&
                            s.gradeLevel === subject.gradeLevel
                    );

                    if (!createdSection) {
                        throw new ConvexError(`Invalid pending section reference: ${sectionId}`);
                    }

                    // Use the actual created section ID instead
                    sectionId = createdSection.id;
                }

                // First create the subject thought
                const subjectThoughtId = await ctx.db.insert("subjectThought", {
                    teacherId: accountResponse.user._id,
                    gradeLevel: subject.gradeLevel,
                    subjectName: subject.subjectName,
                    quarter: subject.quarter,
                    semester: subject.semester || [],
                    gradeWeights: subject.gradeWeights,
                });

                // Then create teaching load entries based on quarters/semesters
                if (subject.quarter && subject.quarter.length > 0) {
                    for (const quarter of subject.quarter) {
                        await ctx.db.insert("teachingLoad", {
                            subjectThoughId: subjectThoughtId,
                            quarter: quarter,
                            semester: undefined,
                            sectionId: sectionId as Id<"sections">, // Use resolved sectionId
                        });
                    }
                }

                if (subject.semester && subject.semester.length > 0) {
                    for (const semester of subject.semester) {
                        await ctx.db.insert("teachingLoad", {
                            subjectThoughId: subjectThoughtId,
                            semester: semester,
                            quarter: subject.quarter?.[0] || "1st quarter",
                            sectionId: sectionId as Id<"sections">, // Use resolved sectionId
                        });
                    }
                }
            }
        }

        // return the created user
        return accountResponse.user;
    }
})