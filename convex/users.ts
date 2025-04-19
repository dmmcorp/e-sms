import { createAccount, getAuthUserId, modifyAccountCredentials } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { UserForm } from "../src/lib/zod"
import { Doc, Id } from "./_generated/dataModel";
import { SubjectTaughtQueryResult } from "../src/lib/types";
import { internal } from "./_generated/api";
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

            // FOR SHS
            category: v.optional(v.union(
                v.literal('core'),
                v.literal('specialized'),
                v.literal('applied'),
            )),
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
        // @ts-expect-error - type error in convex
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

        const newUserId = accountResponse.user?._id;

        // Array to store created section IDs
        const createdSectionsMap = new Map<number, Id<"sections">>();

        // Handle adviser sections first
        if ((args.role === "adviser" || args.role === "adviser/subject-teacher") && sections && sections.length > 0) {
            for (const [index, section] of sections.entries()) {
                const newSectionId = await ctx.db.insert("sections", {
                    adviserId: newUserId,
                    name: section.name,
                    gradeLevel: section.gradeLevel,
                    schoolYear: section.schoolYear,
                    subjects: []
                });
                createdSectionsMap.set(index, newSectionId);
            }
        }

        // Map to store existing/newly created subjectTaught IDs (subjectName_gradeLevel -> ID)
        const subjectTaughtMap = new Map<string, Id<"subjectTaught">>();

        // Handle subject teacher subjects
        if ((args.role === "subject-teacher" || args.role === "adviser/subject-teacher") && subjectsTaught) {
            for (const subject of subjectsTaught) {
                let subjectTaughtId: Id<"subjectTaught">;
                let resolvedSectionId: Id<"sections">;

                // Resolve section ID (handle pending sections)
                if (subject.sectionId.startsWith('pending-section-')) {
                    const pendingIndex = parseInt(subject.sectionId.replace('pending-section-', ''));
                    const actualId = createdSectionsMap.get(pendingIndex);
                    if (!actualId) throw new ConvexError(`Could not resolve pending section: ${subject.sectionId}`);
                    resolvedSectionId = actualId;
                } else {
                    resolvedSectionId = subject.sectionId as Id<"sections">;

                    // const sectionDoc = await ctx.db.get(resolvedSectionId);
                    // if (!sectionDoc) throw new ConvexError(`Section not found: ${resolvedSectionId}`);
                }

                // Check if subjectTaught already exists or was just created in this mutation
                const subjectKey = `${subject.subjectName}_${subject.gradeLevel}`;
                const existingSubjectTaughtId = subjectTaughtMap.get(subjectKey);

                if (existingSubjectTaughtId) {
                    subjectTaughtId = existingSubjectTaughtId;
                } else {
                    // Check database for existing subjectTaught for this teacher
                    const dbSubject = await ctx.db.query("subjectTaught")
                        .withIndex("teacherId", q => q.eq("teacherId", newUserId))
                        .filter(q => q.eq(q.field("subjectName"), subject.subjectName))
                        .filter(q => q.eq(q.field("gradeLevel"), subject.gradeLevel))
                        .first();

                    if (dbSubject) {
                        subjectTaughtId = dbSubject._id;

                        // await ctx.db.patch(dbSubject._id, { gradeWeights: subject.gradeWeights, category: subject.category });
                    } else {
                        // Insert new subjectTaught if not found
                        subjectTaughtId = await ctx.db.insert("subjectTaught", {
                            teacherId: newUserId,
                            subjectName: subject.subjectName,
                            gradeLevel: subject.gradeLevel,
                            category: subject.category,
                            gradeWeights: subject.gradeWeights,
                            // Store ALL quarters/semesters defined for this subjectTaught,
                            // not just the ones for this specific teaching load entry
                            quarter: subject.quarter,
                            semester: subject.semester || [],
                        });
                    }
                    // Store the ID (whether found or newly created) in the map for reuse within this mutation
                    subjectTaughtMap.set(subjectKey, subjectTaughtId);
                }

                // Add subjectTaughtId to the section's subjects array (if not already present)
                try {
                    await ctx.runMutation(internal.sections.addSubjectTaught, {
                        sectionId: resolvedSectionId,
                        id: subjectTaughtId
                    });
                } catch (error) {
                    console.error(`Failed to add subject ${subjectTaughtId} to section ${resolvedSectionId}:`, error);
                }

                // Create TeachingLoad entries for each specified quarter/semester
                if (subject.quarter && subject.quarter.length > 0) {
                    for (const q of subject.quarter) {
                        // Check if this specific load already exists
                        // const existingLoad = await ctx.db.query("teachingLoad")
                        //     .withIndex("subjectTaughtId", q => q.eq("subjectTaughtId", subjectTaughtId))
                        //     .filter(q => q.eq(q.field("sectionId"), resolvedSectionId))
                        //     .filter(q => q.eq(q.field("quarter"), q))
                        //     .first();
                        // if (!existingLoad) { ... }

                        await ctx.db.insert("teachingLoad", {
                            subjectTaughtId: subjectTaughtId,
                            sectionId: resolvedSectionId,
                            quarter: q,
                            semester: undefined,
                            // subComponent: subject.subComponent
                        });
                    }
                } else if (subject.semester && subject.semester.length > 0) {
                    for (const s of subject.semester) {
                        // Check if this specific load already exists (optional)
                        await ctx.db.insert("teachingLoad", {
                            subjectTaughtId: subjectTaughtId,
                            sectionId: resolvedSectionId,
                            semester: s,
                            quarter: undefined,
                            // subComponent: subject.subComponent
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
                .query("subjectTaught")
                .withIndex("teacherId", q => q.eq("teacherId", args.userId))
                .collect();

            for (const subject of subjects) {
                const teachingLoads = await ctx.db
                    .query("teachingLoad")
                    .withIndex("subjectTaughtId", q => q.eq("subjectTaughtId", subject._id))
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
            // _id: v.optional(v.string()),
            // subjectThoughtId: v.optional(v.id("subjectThought")),
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
            // _id: v.optional(v.id("sections")),
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

        // Handle Password Update
        if (args.password && args.password.trim() !== "") {
            try {
                // @ts-expect-error - type error in convex
                await modifyAccountCredentials(ctx, {
                    provider: "password",
                    account: {
                        id: existingUser.email,
                        secret: args.password,
                    },
                })
            } catch (error) {
                console.error("Failed to update password in auth", error)
                throw new ConvexError("Failed to update password")
            }
        }

        // Extract user data
        const { userId, password, subjectsTaught: submittedSubjectsInput, sections: submittedSectionsInput, ...userData } = args;

        // Update basic user info
        await ctx.db.patch(userId, userData);

        // Handle sections if adviser role
        const managedSectionIds = new Set<Id<"sections">>();
        const createdSectionsMap = new Map<number, Id<"sections">>();

        if ((args.role === "adviser" || args.role === "adviser/subject-teacher")) {
            const submittedSections = args.sections || [];
            const existingDbSections = await ctx.db
                .query("sections")
                .withIndex("adviserId", q => q.eq("adviserId", userId))
                .collect();
            const existingDbSectionIds = new Set(existingDbSections.map(s => s._id));

            // Process submitted sections: Create new or identify existing
            for (let i = 0; i < submittedSections.length; i++) {
                const submittedSection = submittedSections[i];

                const matchingDbSection = existingDbSections.find(dbSec =>
                    dbSec.name === submittedSection.name &&
                    dbSec.gradeLevel === submittedSection.gradeLevel &&
                    dbSec.schoolYear === submittedSection.schoolYear
                );

                if (matchingDbSection) {
                    // Section exists, keep it.
                    managedSectionIds.add(matchingDbSection._id);
                    existingDbSectionIds.delete(matchingDbSection._id);
                    createdSectionsMap.set(i, matchingDbSection._id);
                } else {
                    // Section is new, insert it
                    const newSectionId = await ctx.db.insert("sections", {
                        adviserId: userId,
                        name: submittedSection.name,
                        gradeLevel: submittedSection.gradeLevel,
                        schoolYear: submittedSection.schoolYear,
                    });
                    managedSectionIds.add(newSectionId);
                    // Store mapping for potential pending subject references
                    createdSectionsMap.set(i, newSectionId);
                }
            }

            // Delete sections that were in DB but not submitted
            for (const sectionIdToDelete of existingDbSectionIds) {
                await ctx.db.delete(sectionIdToDelete);
            }
        }
        // else {
        //     // If role changed away from adviser, delete all previously associated sections
        //     const sectionsToDelete = await ctx.db
        //         .query("sections")
        //         .withIndex("adviserId", q => q.eq("adviserId", userId))
        //         .collect();
        //     for (const section of sectionsToDelete) {
        //         await ctx.db.delete(section._id);
        //          // Consider deleting related student data or other links here if necessary
        //     }
        // }

        // Handle Subjects & Teaching Loads (For teacher roles)

        const existingSubjectDocs = await ctx.db
            .query("subjectTaught")
            .withIndex("teacherId", q => q.eq("teacherId", userId))
            .collect();

        const existingSubjectIds = existingSubjectDocs.map(s => s._id);
        const existingLoadDocs = (await Promise.all(
            existingSubjectIds.map(subjectId =>
                ctx.db
                    .query("teachingLoad")
                    .withIndex("subjectTaughtId", q => q.eq("subjectTaughtId", subjectId))
                    .collect()
            )
        )).flat()

        const existingSubjectsMap = new Map<string, Doc<"subjectTaught">>(
            existingSubjectDocs.map(doc => [`${doc.subjectName}_${doc.gradeLevel}`, doc])
        );

        const existingLoadsMap = new Map<Id<"subjectTaught">, Map<Id<"sections">, { quarters: Set<string>, semesters: Set<string>, loadIds: Set<Id<"teachingLoad">> }>>();

        for (const load of existingLoadDocs) {
            if (!existingLoadsMap.has(load.subjectTaughtId)) {
                existingLoadsMap.set(load.subjectTaughtId, new Map());
            }
            const sectionMap = existingLoadsMap.get(load.subjectTaughtId)!;
            if (!sectionMap.has(load.sectionId)) {
                sectionMap.set(load.sectionId, { quarters: new Set(), semesters: new Set(), loadIds: new Set() });
            }
            const loadInfo = sectionMap.get(load.sectionId)!;
            loadInfo.loadIds.add(load._id);
            if (load.quarter) loadInfo.quarters.add(load.quarter);
            if (load.semester) loadInfo.semesters.add(load.semester);
        }

        const keptSubjectThoughtIds = new Set<Id<"subjectTaught">>();
        const processedLoadIds = new Set<Id<"teachingLoad">>();

        if ((args.role === "subject-teacher" || args.role === "adviser/subject-teacher") && submittedSubjectsInput) {
            for (const submittedSubject of submittedSubjectsInput) {
                let subjectTaughtId: Id<"subjectTaught">;
                let resolvedSectionId: Id<"sections">;

                if (submittedSubject.sectionId.startsWith('pending-section-')) {
                    const pendingIndex = parseInt(submittedSubject.sectionId.replace('pending-section-', ''));
                    const actualId = createdSectionsMap.get(pendingIndex);
                    if (!actualId) throw new ConvexError(`Could not resolve pending section: ${submittedSubject.sectionId}`);
                    resolvedSectionId = actualId;
                } else {
                    resolvedSectionId = submittedSubject.sectionId as Id<"sections">;
                }

                const subjectKey = `${submittedSubject.subjectName}_${submittedSubject.gradeLevel}`;
                const existingSubjectDoc = existingSubjectsMap.get(subjectKey);

                if (existingSubjectDoc) {
                    subjectTaughtId = existingSubjectDoc._id;
                    keptSubjectThoughtIds.add(subjectTaughtId);

                    if (JSON.stringify(existingSubjectDoc.gradeWeights) !== JSON.stringify(submittedSubject.gradeWeights)) {
                        await ctx.db.patch(subjectTaughtId, { gradeWeights: submittedSubject.gradeWeights });
                    }

                } else {
                    // Insert new subjectThought
                    subjectTaughtId = await ctx.db.insert("subjectTaught", {
                        teacherId: userId,
                        gradeLevel: submittedSubject.gradeLevel,
                        subjectName: submittedSubject.subjectName,
                        gradeWeights: submittedSubject.gradeWeights,
                        quarter: submittedSubject.quarter,
                        semester: submittedSubject.semester || [],
                    });
                    keptSubjectThoughtIds.add(subjectTaughtId);
                }

                try {
                    await ctx.runMutation(internal.sections.addSubjectTaught, {
                        sectionId: resolvedSectionId,
                        id: subjectTaughtId
                    });
                } catch (error) {
                    console.error(`Failed to add subject ${subjectTaughtId} to section ${resolvedSectionId}:`, error);
                }

                const submittedQuarters = new Set(submittedSubject.quarter || []);
                const submittedSemesters = new Set(submittedSubject.semester || []);

                const existingLoadInfo = existingLoadsMap.get(subjectTaughtId)?.get(resolvedSectionId);
                const existingQuarters = existingLoadInfo?.quarters ?? new Set<string>();
                const existingSemesters = existingLoadInfo?.semesters ?? new Set<string>();
                const existingLoadIdsInSection = existingLoadInfo?.loadIds ?? new Set<Id<"teachingLoad">>();

                // Loads to Add
                for (const quarter of submittedQuarters) {
                    if (!existingQuarters.has(quarter)) {
                        await ctx.db.insert("teachingLoad", { subjectTaughtId: subjectTaughtId, sectionId: resolvedSectionId, quarter: quarter, semester: undefined });
                    }
                }
                for (const semester of submittedSemesters) {
                    if (!existingSemesters.has(semester)) {
                        await ctx.db.insert("teachingLoad", { subjectTaughtId: subjectTaughtId, sectionId: resolvedSectionId, semester: semester, quarter: undefined });
                    }
                }

                // Mark existing loads that are kept
                existingLoadIdsInSection.forEach(loadId => {
                    const loadDoc = existingLoadDocs.find(l => l._id === loadId);
                    if (loadDoc) {
                        if (loadDoc.quarter && submittedQuarters.has(loadDoc.quarter)) {
                            processedLoadIds.add(loadId);
                        } else if (loadDoc.semester && submittedSemesters.has(loadDoc.semester)) {
                            processedLoadIds.add(loadId);
                        }
                    }
                });
            }
        }

        // DELETING LOADS THAT ARE REMOVED IN THE FORM.
        for (const load of existingLoadDocs) {
            if (!processedLoadIds.has(load._id)) {
                await ctx.db.delete(load._id);
            }
        }

        // Delete subjectThought documents that are no longer taught by this teacher
        for (const subjectDoc of existingSubjectDocs) {
            if (!keptSubjectThoughtIds.has(subjectDoc._id)) {
                // Double-check: Ensure all loads for this subject were indeed deleted or processed for deletion
                const loadsForSubject = existingLoadDocs.filter(l => l.subjectTaughtId === subjectDoc._id);
                let safeToDelete = true;
                for (const load of loadsForSubject) {
                    if (processedLoadIds.has(load._id)) {
                        // Should not happen if logic is correct, but safety check
                        console.warn(`Subject ${subjectDoc._id} marked for deletion, but load ${load._id} was kept.`);
                        safeToDelete = false;
                        break;
                    }
                }
                if (safeToDelete) {
                    await ctx.db.delete(subjectDoc._id);
                }
            }
        }

        // If role changed away from teacher, ensure all subjects/loads are deleted
        if (!(args.role === "subject-teacher" || args.role === "adviser/subject-teacher")) {
            for (const subjectDoc of existingSubjectDocs) {
                if (!keptSubjectThoughtIds.has(subjectDoc._id)) {
                    const loads = await ctx.db.query("teachingLoad").withIndex("subjectTaughtId", q => q.eq("subjectTaughtId", subjectDoc._id)).collect();
                    for (const load of loads) { await ctx.db.delete(load._id); }
                    await ctx.db.delete(subjectDoc._id);
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
                .query("subjectTaught")
                .withIndex("teacherId", q => q.eq("teacherId", args.userId))
                .collect()

            for (const subject of subjects) {
                const teachingLoads = await ctx.db
                    .query("teachingLoad")
                    .withIndex("subjectTaughtId", q => q.eq("subjectTaughtId", subject._id))
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