import { createAccount, getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, GenericId, v } from "convex/values";
import { UserForm } from "../src/lib/zod"
import { Doc, Id } from "./_generated/dataModel";
import { SubjectTaughtQueryResult } from "../src/lib/types";

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
                            quarter: undefined,
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

export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        return users.map((user) => {
            return {
                id: user._id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
            }
        });
    },
})

export const getUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new ConvexError("User not found");
        }

        // Get sections if adviser role
        let sections: Doc<"sections">[] = [];
        if (user.role === "adviser" || user.role === "adviser/subject-teacher") {
            sections = await ctx.db
                .query("sections")
                .withIndex("adviserId", q => q.eq("adviserId", args.userId))
                .collect();
        }

        // Get subjects taught if subject-teacher role
        let subjectsTaught: SubjectTaughtQueryResult[] = [];
        if (user.role === "subject-teacher" || user.role === "adviser/subject-teacher") {
            const subjects = await ctx.db
                .query("subjectThought")
                .withIndex("teacherId", q => q.eq("teacherId", args.userId))
                .collect();

            for (const subject of subjects) {
                const teachingLoads = await ctx.db
                    .query("teachingLoad")
                    .withIndex("subjectThoughId", q => q.eq("subjectThoughId", subject._id))
                    .collect();

                // Group teaching loads by section to handle teaching the same subject in multiple sections
                const sectionGroups = teachingLoads.reduce<Record<string, { quarters: Set<string>, semesters: Set<string>, sectionId: Id<"sections"> }>>((acc, load) => {
                    const sectionIdStr = load.sectionId.toString(); // Use string as key
                    if (!acc[sectionIdStr]) {
                        acc[sectionIdStr] = { quarters: new Set(), semesters: new Set(), sectionId: load.sectionId };
                    }
                    if (load.quarter) acc[sectionIdStr].quarters.add(load.quarter);
                    if (load.semester) acc[sectionIdStr].semesters.add(load.semester);
                    return acc;
                }, {});

                // Create a subject entry for each section the subject is taught in
                Object.values(sectionGroups).forEach((group) => {
                    subjectsTaught.push({
                        // Use a stable, unique ID combining subject and section IDs
                        id: `subject_${subject._id}_${group.sectionId}`,
                        subjectName: subject.subjectName,
                        gradeLevel: subject.gradeLevel,
                        sectionId: group.sectionId, // Use the actual section ID
                        quarter: Array.from(group.quarters), // Convert Set to array
                        semester: Array.from(group.semesters), // Convert Set to array
                        gradeWeights: subject.gradeWeights, // Include gradeWeights
                    });
                });
            }
        }

        // Ensure all necessary user fields are returned explicitly
        return {
            _id: user._id,
            _creationTime: user._creationTime,
            email: user.email,
            fullName: user.fullName,
            role: user.role, // Explicitly return role
            principalType: user.principalType, // Include principalType if it exists
            isActive: user.isActive, // Include isActive if it exists
            // Return the fetched sections and structured subjectsTaught
            sections,
            subjectsTaught,
        };
    },
});

// Mutation to update a user
export const updateUser = mutation({
    args: {
        userId: v.id("users"),
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
        password: v.optional(v.string()),
        principalType: v.optional(v.union(
            v.literal("junior-department"),
            v.literal("senior-department"),
            v.literal("entire-school"),
        )),
        subjectsTaught: v.optional(v.array(v.object({
            // Same schema as in createUser
            subjectName: v.string(),
            gradeLevel: v.union(
                v.literal('Grade 7'),
                v.literal('Grade 8'),
                v.literal('Grade 9'),
                v.literal('Grade 10'),
                v.literal('Grade 11'),
                v.literal('Grade 12'),
            ),
            sectionId: v.string(),
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
    },
    handler: async (ctx, args) => {
        // Verify if there is a current user logged in
        const adminId = await getAuthUserId(ctx);
        if (!adminId) throw new ConvexError("Not authenticated");

        // Get the current user from the database and check if it is an admin
        const admin = await ctx.db.get(adminId);
        if (!admin || admin.role !== "admin") {
            throw new ConvexError("Unauthorized - Only admins can update users");
        }

        // Check if user exists
        const existingUser = await ctx.db.get(args.userId);
        if (!existingUser) {
            throw new ConvexError("User not found");
        }

        // Check for email duplication
        if (args.email !== existingUser.email) {
            const userWithSameEmail = await ctx.db
                .query("users")
                .withIndex("email", (q) => q.eq("email", args.email))
                .first();

            if (userWithSameEmail && userWithSameEmail._id !== args.userId) {
                throw new ConvexError("A user with this email already exists");
            }
        }

        // Extract user data
        const { userId, password, subjectsTaught, sections, ...userData } = args;

        // Update basic user info
        await ctx.db.patch(userId, userData);

        // Handle sections if adviser role
        if ((args.role === "adviser" || args.role === "adviser/subject-teacher") && sections) {
            // Remove existing sections
            const existingSections = await ctx.db
                .query("sections")
                .withIndex("adviserId", q => q.eq("adviserId", userId))
                .collect();

            for (const section of existingSections) {
                await ctx.db.delete(section._id);
            }

            // Create new sections
            for (const section of sections) {
                await ctx.db.insert("sections", {
                    adviserId: userId,
                    name: section.name,
                    gradeLevel: section.gradeLevel,
                    schoolYear: section.schoolYear,
                });
            }
        }

        // Handle subjects if teacher role
        if ((args.role === "subject-teacher" || args.role === "adviser/subject-teacher") && subjectsTaught) {
            // Remove existing subjects and teaching loads
            const existingSubjects = await ctx.db
                .query("subjectThought")
                .withIndex("teacherId", q => q.eq("teacherId", userId))
                .collect();

            for (const subject of existingSubjects) {
                // Remove teaching loads
                const teachingLoads = await ctx.db
                    .query("teachingLoad")
                    .withIndex("subjectThoughId", q => q.eq("subjectThoughId", subject._id))
                    .collect();

                for (const load of teachingLoads) {
                    await ctx.db.delete(load._id);
                }

                // Remove subject
                await ctx.db.delete(subject._id);
            }

            // Create new subjects and teaching loads
            for (const subject of subjectsTaught) {
                // Check if sectionId is string or ID
                let sectionId = subject.sectionId;
                if (typeof sectionId === 'string' && !sectionId.startsWith('pending-section-')) {
                    sectionId = sectionId as Id<"sections">;
                }

                // Create subject thought
                const subjectThoughtId = await ctx.db.insert("subjectThought", {
                    teacherId: userId,
                    gradeLevel: subject.gradeLevel,
                    subjectName: subject.subjectName,
                    quarter: subject.quarter,
                    semester: subject.semester || [],
                    gradeWeights: subject.gradeWeights,
                });

                // Create teaching loads
                if (subject.quarter && subject.quarter.length > 0) {
                    for (const quarter of subject.quarter) {
                        await ctx.db.insert("teachingLoad", {
                            subjectThoughId: subjectThoughtId,
                            quarter: quarter,
                            semester: undefined,
                            sectionId: sectionId as Id<"sections">,
                        });
                    }
                }

                if (subject.semester && subject.semester.length > 0) {
                    for (const semester of subject.semester) {
                        await ctx.db.insert("teachingLoad", {
                            subjectThoughId: subjectThoughtId,
                            semester: semester,
                            quarter: undefined,
                            sectionId: sectionId as Id<"sections">,
                        });
                    }
                }
            }
        }

        return await ctx.db.get(userId);
    }
});

export const deleteUser = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // 1. Verify Authentication
        const adminId = await getAuthUserId(ctx)
        if (!adminId) {
            throw new ConvexError("Not authenticated")
        }

        const admin = await ctx.db.get(adminId)
        if (!admin || admin.role !== "admin") {
            throw new ConvexError("Unauthorized - Only admins can delete users")
        }

        // 2. Prevent Selft-Deletion
        if (adminId === args.userId) {
            throw new ConvexError("You cannot delete your own account")
        }

        // 3. Check if user to be deleted exists
        const userToDelete = await ctx.db.get(args.userId)
        if (!userToDelete) {
            throw new ConvexError("User not found")
        }

        // 4. Deleting related data

        // a) Sections for adviser role
        // if (userToDelete.role === "adviser" || userToDelete.role === "adviser/subject-teacher") {
        //     const sections = await ctx.db
        //         .query("sections")
        //         .withIndex("adviserId", q => q.eq("adviserId", args.userId))
        //         .collect()

        //     for (const section of sections) {
        //         await ctx.db.delete(section._id)
        //     }
        // }

        // b) Subjects and Teaching Loads (if subject-teacher role)
        if (userToDelete.role === "subject-teacher" || userToDelete.role === "adviser/subject-teacher") {
            const subjects = await ctx.db
                .query("subjectThought")
                .withIndex("teacherId", q => q.eq("teacherId", args.userId))
                .collect()

            for (const subject of subjects) {
                const teachingLoads = await ctx.db
                    .query("teachingLoad")
                    .withIndex("subjectThoughId", q => q.eq("subjectThoughId", subject._id))
                    .collect()

                for (const load of teachingLoads) {
                    await ctx.db.delete(load._id)
                }

                await ctx.db.delete(subject._id)
            }
        }

        // 5. Delete the user account
        await ctx.db.delete(args.userId)

        return { success: true, deletedUserId: args.userId }
    }
})