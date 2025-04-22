import { createAccount, getAuthUserId, modifyAccountCredentials } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { UserForm } from "../src/lib/zod"
import { Doc, Id } from "./_generated/dataModel";
import { GradeLevelsTypes, QuarterType, SemesterType, SubjectTaughtQueryResult } from "../src/lib/types";
import { internal } from "./_generated/api";
import { seniorHighGrades } from "../src/lib/constants";

const quarterType = v.union(
    v.literal('1st quarter'),
    v.literal('2nd quarter'),
    v.literal('3rd quarter'),
    v.literal('4th quarter'),
);
const semesterType = v.union(
    v.literal('1st semester'),
    v.literal('2nd semester'),
);
const gradeLevelType = v.union(
    v.literal('Grade 7'),
    v.literal('Grade 8'),
    v.literal('Grade 9'),
    v.literal('Grade 10'),
    v.literal('Grade 11'),
    v.literal('Grade 12'),
);

// Helper function to get quarters for a semester
const getQuartersForSemester = (semester: SemesterType): QuarterType[] => {
    if (semester === '1st semester') return ['1st quarter', '2nd quarter'];
    if (semester === '2nd semester') return ['3rd quarter', '4th quarter'];
    return [];
};


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
            sectionId: v.string(),
            semester: v.optional(v.array(semesterType)),
            quarter: v.array(quarterType),
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
            semester: v.optional(
                v.union(
                    v.literal('1st semester'),
                    v.literal('2nd semester'),
                )),
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
        if ((args.role === "adviser" || args.role === "adviser/subject-teacher") && sections) {
            for (const [index, section] of sections.entries()) {
                const newSectionId = await ctx.db.insert("sections", {
                    adviserId: newUserId,
                    name: section.name,
                    gradeLevel: section.gradeLevel,
                    schoolYear: section.schoolYear,
                    semester: section.semester, // Store semester if provided
                    subjects: []
                });
                createdSectionsMap.set(index, newSectionId);
            }
        }

        // Handle subjects (Teacher roles)
        const subjectTaughtMap = new Map<string, Id<"subjectTaught">>();
        if ((args.role === "subject-teacher" || args.role === "adviser/subject-teacher") && subjectsTaught) {
            for (const subject of subjectsTaught) {
                let subjectTaughtId: Id<"subjectTaught">;
                let resolvedSectionId: Id<"sections">;

                // Resolve section ID
                if (subject.sectionId.startsWith('pending-section-')) {
                    const pendingIndex = parseInt(subject.sectionId.replace('pending-section-', ''));
                    const actualId = createdSectionsMap.get(pendingIndex);
                    if (!actualId) throw new ConvexError(`Could not resolve pending section: ${subject.sectionId}`);
                    resolvedSectionId = actualId;
                } else {
                    try {
                        resolvedSectionId = subject.sectionId as Id<"sections">;
                        // Optional: Verify section exists
                        // const sectionDoc = await ctx.db.get(resolvedSectionId);
                        // if (!sectionDoc) throw new ConvexError(`Section ${resolvedSectionId} not found.`);
                    } catch (e) {
                        throw new ConvexError(`Invalid section ID format: ${subject.sectionId}`);
                    }
                }

                // Find or Create subjectTaught record
                const subjectKey = `${subject.subjectName}_${subject.gradeLevel}`;
                const existingSubjectTaughtId = subjectTaughtMap.get(subjectKey);

                if (existingSubjectTaughtId) {
                    subjectTaughtId = existingSubjectTaughtId;
                } else {
                    const dbSubject = await ctx.db.query("subjectTaught")
                        .withIndex("teacherId", q => q.eq("teacherId", newUserId))
                        .filter(q => q.eq(q.field("subjectName"), subject.subjectName))
                        .filter(q => q.eq(q.field("gradeLevel"), subject.gradeLevel))
                        .first();

                    if (dbSubject) {
                        subjectTaughtId = dbSubject._id;
                        // Optionally patch semester/category/gradeWeights if needed on existing
                        // await ctx.db.patch(dbSubject._id, { semester: subject.semester, category: subject.category, gradeWeights: subject.gradeWeights });
                    } else {
                        subjectTaughtId = await ctx.db.insert("subjectTaught", {
                            teacherId: newUserId,
                            subjectName: subject.subjectName,
                            gradeLevel: subject.gradeLevel,
                            category: subject.category,
                            semester: seniorHighGrades.includes(subject.gradeLevel as GradeLevelsTypes) ? subject.semester : undefined,
                            gradeWeights: subject.gradeWeights,
                            quarter: subject.quarter,
                        });
                    }
                    subjectTaughtMap.set(subjectKey, subjectTaughtId);
                }

                // Link subjectTaught to section
                try {
                    await ctx.runMutation(internal.sections.addSubjectTaught, {
                        sectionId: resolvedSectionId,
                        id: subjectTaughtId
                    });
                } catch (error) {
                    console.error(`Failed to add subject ${subjectTaughtId} to section ${resolvedSectionId}:`, error);
                }

                // Create TeachingLoad records based on selected quarters
                const isSenior = seniorHighGrades.includes(subject.gradeLevel as GradeLevelsTypes);
                const quartersToLoad = subject.quarter || []; // Use quarters sent from frontend

                for (const q of quartersToLoad) {
                    let loadSemester: SemesterType | undefined = undefined;
                    if (isSenior) {
                        if (['1st quarter', '2nd quarter'].includes(q)) {
                            loadSemester = '1st semester';
                        } else if (['3rd quarter', '4th quarter'].includes(q)) {
                            loadSemester = '2nd semester';
                        }
                        // Ensure the semester is actually selected in the input if SHS
                        if (!subject.semester?.includes(loadSemester!)) {
                            console.warn(`Quarter ${q} selected for SHS subject ${subject.subjectName} but semester ${loadSemester} was not.`);
                            continue; // Skip creating load if semester doesn't match quarter
                        }
                    }

                    // Optional: Check if this specific load already exists before inserting
                    // const existingLoad = await ctx.db.query("teachingLoad")
                    //     .withIndex("subjectTaughtId", qIdx => qIdx.eq("subjectTaughtId", subjectTaughtId))
                    //     .filter(qF => qF.eq(qF.field("sectionId"), resolvedSectionId))
                    //     .filter(qF => qF.eq(qF.field("quarter"), q))
                    //     .filter(qF => qF.eq(qF.field("semester"), loadSemester)) // Check semester too
                    //     .first();
                    // if (!existingLoad) { ... }

                    await ctx.db.insert("teachingLoad", {
                        subjectTaughtId: subjectTaughtId,
                        sectionId: resolvedSectionId,
                        quarter: q,
                        semester: loadSemester, // Set semester if SHS
                        // subComponent: subject.subComponent // Add if applicable
                    });
                }
            }
        }
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
            semester: v.optional(v.array(semesterType)),
            quarter: v.array(quarterType),
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
            category: v.optional(v.union(
                v.literal('core'),
                v.literal('specialized'),
                v.literal('applied'),
            )),
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
            semester: v.optional(
                v.union(
                    v.literal('1st semester'),
                    v.literal('2nd semester'),
                )),
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

            // Process submitted sections: Create new, update existing, identify for deletion
            for (let i = 0; i < submittedSections.length; i++) {
                const submittedSection = submittedSections[i];
                // Try to find existing based on name/grade/year (or a hidden ID if passed from frontend)
                const matchingDbSection = existingDbSections.find(dbSec =>
                    dbSec.name === submittedSection.name &&
                    dbSec.gradeLevel === submittedSection.gradeLevel &&
                    dbSec.schoolYear === submittedSection.schoolYear
                    // Add more criteria if needed, e.g., semester for SHS sections
                    && dbSec.semester === submittedSection.semester
                );

                if (matchingDbSection) {
                    // Section exists, mark as managed and remove from deletion set
                    managedSectionIds.add(matchingDbSection._id);
                    existingDbSectionIds.delete(matchingDbSection._id);
                    createdSectionsMap.set(i, matchingDbSection._id); // Map index to existing ID

                    // Patch section if details like semester or schoolYear changed
                    if (matchingDbSection.semester !== submittedSection.semester ||
                        matchingDbSection.schoolYear !== submittedSection.schoolYear) {
                        await ctx.db.patch(matchingDbSection._id, {
                            semester: submittedSection.semester,
                            schoolYear: submittedSection.schoolYear,
                            // Keep existing subjects array
                            subjects: matchingDbSection.subjects
                        });
                    }
                } else {
                    // Section is new, insert it
                    const newSectionId = await ctx.db.insert("sections", {
                        adviserId: userId,
                        name: submittedSection.name,
                        gradeLevel: submittedSection.gradeLevel,
                        schoolYear: submittedSection.schoolYear,
                        semester: submittedSection.semester, // Store semester
                        subjects: [] // Initialize subjects
                    });
                    managedSectionIds.add(newSectionId);
                    createdSectionsMap.set(i, newSectionId); // Map index to new ID
                }
            }

            // Delete sections that were in DB but not submitted
            for (const sectionIdToDelete of existingDbSectionIds) {
                // Add robust cleanup: delete teaching loads, class records, etc., linked to this section
                console.warn(`Deleting section ${sectionIdToDelete}. Implement cleanup for related data.`);
                // Example cleanup (needs expansion):
                const loadsInSection = await ctx.db.query("teachingLoad")
                    .filter(q => q.eq(q.field("sectionId"), sectionIdToDelete))
                    .collect();
                for (const load of loadsInSection) {
                    // Delete class records, scores, etc., for this load first
                    await ctx.db.delete(load._id);
                }
                await ctx.db.delete(sectionIdToDelete);
            }
        }

        // else {
        //     // If role changed *away* from adviser, delete all sections previously advised by this user
        //     const existingDbSections = await ctx.db
        //         .query("sections")
        //         .withIndex("adviserId", q => q.eq("adviserId", userId))
        //         .collect();
        //     for (const sectionToDelete of existingDbSections) {
        //         console.warn(`Deleting section ${sectionToDelete._id} due to role change. Implement cleanup.`);
        //         // Add cleanup logic here too
        //         await ctx.db.delete(sectionToDelete._id);
        //     }
        // }

        // Handle Subjects & Teaching Loads (For teacher roles)
        const existingSubjectDocs = await ctx.db
            .query("subjectTaught")
            .withIndex("teacherId", q => q.eq("teacherId", userId))
            .collect();

        const existingSubjectIds = existingSubjectDocs.map(s => s._id);
        const existingLoadDocs = existingSubjectIds.length > 0 ? (await Promise.all(
            existingSubjectIds.map(subjectId =>
                ctx.db
                    .query("teachingLoad")
                    .withIndex("subjectTaughtId", q => q.eq("subjectTaughtId", subjectId))
                    .collect()
            )
        )).flat() : [];

        const existingSubjectsMap = new Map<string, Doc<"subjectTaught">>(
            existingSubjectDocs.map(doc => [`${doc.subjectName}_${doc.gradeLevel}`, doc])
        );

        // Map: subjectTaughtId -> sectionId -> quarter -> loadId
        const existingLoadsMap = new Map<Id<"subjectTaught">, Map<Id<"sections">, Map<QuarterType, Id<"teachingLoad">>>>();
        for (const load of existingLoadDocs) {
            if (!existingLoadsMap.has(load.subjectTaughtId)) {
                existingLoadsMap.set(load.subjectTaughtId, new Map());
            }
            const sectionMap = existingLoadsMap.get(load.subjectTaughtId)!;
            if (!sectionMap.has(load.sectionId)) {
                sectionMap.set(load.sectionId, new Map());
            }
            sectionMap.get(load.sectionId)!.set(load.quarter!, load._id);
        }

        const keptSubjectTaughtIds = new Set<Id<"subjectTaught">>();
        const processedLoadIds = new Set<Id<"teachingLoad">>(); // Track loads to keep/add

        if ((args.role === "subject-teacher" || args.role === "adviser/subject-teacher") && submittedSubjectsInput) {
            for (const submittedSubject of submittedSubjectsInput) {
                let subjectTaughtId: Id<"subjectTaught">;
                let resolvedSectionId: Id<"sections">;

                // Resolve section ID (handle pending)
                if (submittedSubject.sectionId.startsWith('pending-section-')) {
                    const pendingIndex = parseInt(submittedSubject.sectionId.replace('pending-section-', ''));
                    const actualId = createdSectionsMap.get(pendingIndex);
                    if (!actualId) throw new ConvexError(`Could not resolve pending section: ${submittedSubject.sectionId}`);
                    resolvedSectionId = actualId;
                } else {
                    try {
                        resolvedSectionId = submittedSubject.sectionId as Id<"sections">;
                        // Optional: Verify section exists
                    } catch (e) {
                        throw new ConvexError(`Invalid section ID format: ${submittedSubject.sectionId}`);
                    }
                }

                // Find or Create subjectTaught
                const subjectKey = `${submittedSubject.subjectName}_${submittedSubject.gradeLevel}`;
                const existingSubjectDoc = existingSubjectsMap.get(subjectKey);
                const isSenior = seniorHighGrades.includes(submittedSubject.gradeLevel as GradeLevelsTypes);
                const submittedSemesters = isSenior ? submittedSubject.semester : undefined;

                if (existingSubjectDoc) {
                    subjectTaughtId = existingSubjectDoc._id;
                    keptSubjectTaughtIds.add(subjectTaughtId);

                    // Patch if gradeWeights, category, or semester list changed
                    const needsPatch = JSON.stringify(existingSubjectDoc.gradeWeights) !== JSON.stringify(submittedSubject.gradeWeights) ||
                        existingSubjectDoc.category !== submittedSubject.category ||
                        JSON.stringify(existingSubjectDoc.semester) !== JSON.stringify(submittedSemesters); // Compare semesters

                    if (needsPatch) {
                        await ctx.db.patch(subjectTaughtId, {
                            gradeWeights: submittedSubject.gradeWeights,
                            category: submittedSubject.category,
                            semester: submittedSemesters // Update semester list
                        });
                    }
                } else {
                    // Insert new subjectTaught
                    subjectTaughtId = await ctx.db.insert("subjectTaught", {
                        teacherId: userId,
                        gradeLevel: submittedSubject.gradeLevel,
                        subjectName: submittedSubject.subjectName,
                        gradeWeights: submittedSubject.gradeWeights,
                        category: submittedSubject.category,
                        semester: submittedSemesters, // Store semesters if SHS
                        quarter: submittedSubject.quarter,
                    });
                    keptSubjectTaughtIds.add(subjectTaughtId);
                }

                // Link subjectTaught to section
                try {
                    await ctx.runMutation(internal.sections.addSubjectTaught, {
                        sectionId: resolvedSectionId,
                        id: subjectTaughtId
                    });
                } catch (error) {
                    console.error(`Failed to add subject ${subjectTaughtId} to section ${resolvedSectionId}:`, error);
                }


                // --- Sync Teaching Loads for this Subject/Section ---
                const submittedQuarters = new Set(submittedSubject.quarter || []);
                const existingQuarterMap = existingLoadsMap.get(subjectTaughtId)?.get(resolvedSectionId);

                // Process submitted quarters
                for (const submittedQuarter of submittedQuarters) {
                    let loadSemester: SemesterType | undefined = undefined;
                    if (isSenior) {
                        if (['1st quarter', '2nd quarter'].includes(submittedQuarter)) loadSemester = '1st semester';
                        else if (['3rd quarter', '4th quarter'].includes(submittedQuarter)) loadSemester = '2nd semester';

                        // Ensure semester matches quarter for SHS
                        if (!submittedSemesters?.includes(loadSemester!)) {
                            console.warn(`Skipping load creation: Quarter ${submittedQuarter} submitted but semester ${loadSemester} was not selected for SHS subject ${subjectKey}.`);
                            continue;
                        }
                    }

                    const existingLoadId = existingQuarterMap?.get(submittedQuarter);

                    if (existingLoadId) {
                        // Load exists, mark it as processed
                        processedLoadIds.add(existingLoadId);
                        // Optional: Check if semester needs updating on existing load (e.g., if subject changed grade level)
                        const existingLoadDoc = existingLoadDocs.find(l => l._id === existingLoadId);
                        if (existingLoadDoc && existingLoadDoc.semester !== loadSemester) {
                            await ctx.db.patch(existingLoadId, { semester: loadSemester });
                        }
                    } else {
                        // Load is new, insert it
                        const newLoadId = await ctx.db.insert("teachingLoad", {
                            subjectTaughtId: subjectTaughtId,
                            sectionId: resolvedSectionId,
                            quarter: submittedQuarter,
                            semester: loadSemester, // Set semester if SHS
                        });
                        processedLoadIds.add(newLoadId);
                    }
                }
                // --- End Sync Teaching Loads ---
            }
        }

        // --- Deletion Phase ---

        // Delete Teaching Loads that were not processed (i.e., not in the final submitted state)
        for (const load of existingLoadDocs) {
            if (!processedLoadIds.has(load._id)) {
                console.warn(`Deleting teaching load ${load._id}. Implement cleanup for class records, scores etc.`);
                // Add cleanup for classRecords, scores etc. before deleting load
                await ctx.db.delete(load._id);
            }
        }

        // Delete subjectTaught documents that are no longer associated with any kept teaching load
        for (const subjectDoc of existingSubjectDocs) {
            if (!keptSubjectTaughtIds.has(subjectDoc._id)) {
                // Double-check if any loads associated with this subject were somehow kept
                const associatedKeptLoads = existingLoadDocs.filter(l => l.subjectTaughtId === subjectDoc._id && processedLoadIds.has(l._id));

                if (associatedKeptLoads.length === 0) {
                    console.warn(`Deleting subjectTaught ${subjectDoc._id}. Implement cleanup in sections.subjects array.`);
                    await ctx.db.delete(subjectDoc._id);
                    // Also remove this subject from any section.subjects arrays
                    // await ctx.runMutation(internal.sections.removeSubjectTaughtFromAll, { subjectTaughtId: subjectDoc._id }); // Example internal mutation
                } else {
                    console.error(`Subject ${subjectDoc._id} was marked for deletion but still has kept loads: ${associatedKeptLoads.map(l => l._id).join(', ')}`);
                }
            }
        }

        // If role changed away from teacher, ensure all remaining subjects/loads are deleted
        if (!(args.role === "subject-teacher" || args.role === "adviser/subject-teacher")) {
            const finalSubjects = await ctx.db.query("subjectTaught").withIndex("teacherId", q => q.eq("teacherId", userId)).collect();
            for (const subjectDoc of finalSubjects) {
                const loads = await ctx.db.query("teachingLoad").withIndex("subjectTaughtId", q => q.eq("subjectTaughtId", subjectDoc._id)).collect();
                for (const load of loads) {
                    console.warn(`Deleting teaching load ${load._id} due to role change. Implement cleanup.`);
                    await ctx.db.delete(load._id);
                }
                console.warn(`Deleting subjectTaught ${subjectDoc._id} due to role change. Implement cleanup.`);
                await ctx.db.delete(subjectDoc._id);
                // Also remove from section.subjects arrays
            }
        }
        // --- End Deletion Phase ---

        return await ctx.db.get(userId); // Return updated user
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