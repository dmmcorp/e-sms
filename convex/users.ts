import {
  createAccount,
  getAuthUserId,
  modifyAccountCredentials,
} from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { UserForm } from "../src/lib/zod";
import { Doc, Id } from "./_generated/dataModel";
import {
  GradeLevelsTypes,
  QuarterType,
  SemesterType,
  SubjectTaughtQueryResult,
} from "../src/lib/types";
import { internal } from "./_generated/api";
import { seniorHighGrades } from "../src/lib/constants";

const quarterType = v.union(
  v.literal("1st quarter"),
  v.literal("2nd quarter"),
  v.literal("3rd quarter"),
  v.literal("4th quarter")
);
const semesterType = v.union(
  v.literal("1st semester"),
  v.literal("2nd semester")
);
const gradeLevelType = v.union(
  v.literal("Grade 7"),
  v.literal("Grade 8"),
  v.literal("Grade 9"),
  v.literal("Grade 10"),
  v.literal("Grade 11"),
  v.literal("Grade 12")
);

// Helper function to get quarters for a semester
const getQuartersForSemester = (semester: SemesterType): QuarterType[] => {
  if (semester === "1st semester") return ["1st quarter", "2nd quarter"];
  if (semester === "2nd semester") return ["3rd quarter", "4th quarter"];
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
    principalType: v.optional(
      v.union(
        v.literal("junior-department"),
        v.literal("senior-department"),
        v.literal("entire-school")
      )
    ),

    // FOR SUBJECT-TEACHER
    subjectsTaught: v.optional(
      v.array(
        v.object({
          subjectName: v.string(),
          gradeLevel: v.union(
            v.literal("Grade 7"),
            v.literal("Grade 8"),
            v.literal("Grade 9"),
            v.literal("Grade 10"),
            v.literal("Grade 11"),
            v.literal("Grade 12")
          ),
          sectionId: v.string(),
          semester: v.optional(v.array(semesterType)),
          quarter: v.array(quarterType),
          gradeWeights: v.object({
            type: v.union(
              v.literal("Face to face"),
              v.literal("Modular"),
              v.literal("Other")
            ),
            faceToFace: v.optional(
              v.object({
                ww: v.number(),
                pt: v.number(),
                majorExam: v.number(),
              })
            ),
            modular: v.optional(
              v.object({
                ww: v.number(),
                pt: v.number(),
              })
            ),
            other: v.optional(
              v.array(
                v.object({
                  component: v.union(
                    v.literal("Written Works"),
                    v.literal("Performance Tasks"),
                    v.literal("Major Exam")
                  ),
                  percentage: v.number(),
                })
              )
            ),
          }),

          // FOR SHS
          category: v.optional(
            v.union(
              v.literal("core"),
              v.literal("specialized"),
              v.literal("applied")
            )
          ),
        })
      )
    ),

    // FOR ADVISER

    sections: v.optional(
      v.array(
        v.object({
          name: v.string(),
          gradeLevel: v.union(
            v.literal("Grade 7"),
            v.literal("Grade 8"),
            v.literal("Grade 9"),
            v.literal("Grade 10"),
            v.literal("Grade 11"),
            v.literal("Grade 12")
          ),
          schoolYear: v.string(),
          semester: v.optional(
            v.union(v.literal("1st semester"), v.literal("2nd semester"))
          ),
        })
      )
    ),

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
    const { error } = UserForm.safeParse(args);
    if (error) {
      throw new ConvexError(error.format());
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
      },
    });

    // if no response throw an error
    if (!accountResponse?.user?._id) {
      throw new ConvexError("Failed to create account");
    }
    const newUserId = accountResponse.user?._id;

    // ! Array to store created section IDs
    const createdSectionsMap = new Map<number, Id<"sections">>();
    if (
      (args.role === "adviser" || args.role === "adviser/subject-teacher") &&
      sections
    ) {
      for (const [index, section] of sections.entries()) {
        const isSHS = ["Grade 11", "Grade 12"].includes(
          section.gradeLevel
        );

        if (isSHS) {
          // Create two sections for SHS, one for each semester
          const sectionBase = {
            adviserId: newUserId,
            name: section.name,
            gradeLevel: section.gradeLevel,
            schoolYear: section.schoolYear,
            subjects: [], // Initialize subjects array
          };

          // 1st Semester Section
          await ctx.db.insert("sections", {
            ...sectionBase,
            semester: "1st semester",
          });

          // 2nd Semester Section
          await ctx.db.insert("sections", {
            ...sectionBase,
            semester: "2nd semester",
          });
        } else {
          // Create one section for JHS
          const newSectionId = await ctx.db.insert("sections", {
            adviserId: newUserId,
            name: section.name,
            gradeLevel: section.gradeLevel,
            schoolYear: section.schoolYear,
            semester: undefined,
            subjects: [],
          });

          createdSectionsMap.set(index, newSectionId);
        }
      }
    }

    // Handle subjects (Teacher roles) - Focus on CREATION
    const subjectTaughtMap = new Map<string, Id<"subjectTaught">>();
    if (
      (args.role === "subject-teacher" ||
        args.role === "adviser/subject-teacher") &&
      subjectsTaught
    ) {
      for (const subject of subjectsTaught) {
        let subjectTaughtId: Id<"subjectTaught">;
        const isSenior = seniorHighGrades.includes(
          subject.gradeLevel as GradeLevelsTypes
        );

        // --- Find or Create subjectTaught record ---
        const subjectKey = `${subject.subjectName}_${subject.gradeLevel}`;
        const existingSubjectTaughtId = subjectTaughtMap.get(subjectKey);

        if (existingSubjectTaughtId) {
          subjectTaughtId = existingSubjectTaughtId;
        } else {
          const dbSubject = await ctx.db
            .query("subjectTaught")
            .withIndex("teacherId", (q) => q.eq("teacherId", newUserId))
            .filter((q) => q.eq(q.field("subjectName"), subject.subjectName))
            .filter((q) => q.eq(q.field("gradeLevel"), subject.gradeLevel))
            .first();

          if (dbSubject) {
            subjectTaughtId = dbSubject._id;
          } else {
            // Create new subjectTaught record
            subjectTaughtId = await ctx.db.insert("subjectTaught", {
              teacherId: newUserId,
              subjectName: subject.subjectName,
              gradeLevel: subject.gradeLevel,
              category: subject.category,
              semester: isSenior ? subject.semester : undefined,
              gradeWeights: subject.gradeWeights,
              quarter: subject.quarter,
            });
          }
          subjectTaughtMap.set(subjectKey, subjectTaughtId);
        }
        // --- End Find or Create subjectTaught record ---


        // --- Determine Target Section(s) ---
        let targetSectionIds: Id<"sections">[] = [];
        // sectionDetailsForLoadCreation is used later for load creation, initialize it
        let sectionDetailsForLoadCreation: { id: Id<"sections">, semester?: SemesterType } | null = null;

        if (subject.sectionId.startsWith("pending-section-")) {
          const pendingIndex = parseInt(
            subject.sectionId.replace("pending-section-", "")
          );

          if (isSenior) {
            // For pending SHS sections, query based on properties
            const originalSectionInput = sections?.[pendingIndex];
            if (!originalSectionInput) {
              throw new ConvexError(`Could not find original section input for pending index ${pendingIndex}`);
            }
            const shsSections = await ctx.db.query("sections")
              .withIndex("adviserId", q => q.eq("adviserId", newUserId))
              .filter(q => q.eq(q.field("name"), originalSectionInput.name))
              .filter(q => q.eq(q.field("gradeLevel"), originalSectionInput.gradeLevel))
              .filter(q => q.eq(q.field("schoolYear"), originalSectionInput.schoolYear))
              .collect();

            if (shsSections.length === 0) {
              throw new ConvexError(`Could not resolve pending SHS sections for index ${pendingIndex}`);
            }
            // Allow proceeding even if only 1 is found initially, warn if not 2
            if (shsSections.length !== 2) {
              console.warn(`Expected 2 sections for pending SHS index ${pendingIndex}, found ${shsSections.length}. Name: ${originalSectionInput.name}, Grade: ${originalSectionInput.gradeLevel}`);
            }

            const firstSemSection = shsSections.find(s => s.semester === "1st semester");
            const secondSemSection = shsSections.find(s => s.semester === "2nd semester");

            // Add section IDs to target list based on the subject's intended semesters
            if (subject.semester?.includes("1st semester") && firstSemSection) {
              targetSectionIds.push(firstSemSection._id);
              // Set details for load creation (prioritize 1st sem if available)
              sectionDetailsForLoadCreation = { id: firstSemSection._id, semester: "1st semester" };
            }
            if (subject.semester?.includes("2nd semester") && secondSemSection) {
              targetSectionIds.push(secondSemSection._id);
              // If 1st sem wasn't selected/found, use 2nd sem details for load creation
              if (!sectionDetailsForLoadCreation) {
                sectionDetailsForLoadCreation = { id: secondSemSection._id, semester: "2nd semester" };
              }
            }
            if (targetSectionIds.length === 0) {
              throw new ConvexError(`Could not find matching semester sections for pending SHS index ${pendingIndex} and selected semesters ${subject.semester?.join(', ')}`);
            }

          } else {
            // JHS pending section - use the map
            const actualId = createdSectionsMap.get(pendingIndex);
            if (!actualId) {
              throw new ConvexError(`Could not resolve pending JHS section: ${subject.sectionId}`);
            }
            targetSectionIds.push(actualId);
            sectionDetailsForLoadCreation = { id: actualId, semester: undefined };
          }
        } else {
          try {
            const directSectionId = subject.sectionId as Id<"sections">;
            const sectionDoc = await ctx.db.get(directSectionId);
            if (!sectionDoc) {
              throw new ConvexError(`Section ${directSectionId} not found.`);
            }

            if (isSenior) {
              // SHS: Find the direct section and potentially its sibling
              const requiredSemesters = new Set(subject.semester ?? []);
              if (requiredSemesters.size === 0) {
                throw new ConvexError(`SHS Subject ${subject.subjectName} must specify at least one semester.`);
              }

              let firstSemSectionId: Id<"sections"> | undefined;
              let secondSemSectionId: Id<"sections"> | undefined;

              // Find the pair based on the provided directSectionId
              if (sectionDoc.semester === "1st semester") {
                firstSemSectionId = sectionDoc._id;
                const sibling = await ctx.db.query("sections")
                  .withIndex("adviserId", q => q.eq("adviserId", sectionDoc.adviserId)) // Assuming same adviser
                  .filter(q => q.eq(q.field("name"), sectionDoc.name))
                  .filter(q => q.eq(q.field("gradeLevel"), sectionDoc.gradeLevel))
                  .filter(q => q.eq(q.field("schoolYear"), sectionDoc.schoolYear))
                  .filter(q => q.eq(q.field("semester"), "2nd semester"))
                  .first();
                secondSemSectionId = sibling?._id;
              } else { // sectionDoc.semester === "2nd semester"
                secondSemSectionId = sectionDoc._id;
                const sibling = await ctx.db.query("sections")
                  .withIndex("adviserId", q => q.eq("adviserId", sectionDoc.adviserId)) // Assuming same adviser
                  .filter(q => q.eq(q.field("name"), sectionDoc.name))
                  .filter(q => q.eq(q.field("gradeLevel"), sectionDoc.gradeLevel))
                  .filter(q => q.eq(q.field("schoolYear"), sectionDoc.schoolYear))
                  .filter(q => q.eq(q.field("semester"), "1st semester"))
                  .first();
                firstSemSectionId = sibling?._id;
              }

              // Add target IDs based on required semesters
              if (requiredSemesters.has("1st semester")) {
                if (!firstSemSectionId) throw new ConvexError(`Could not find 1st semester section for ${sectionDoc.name} ${sectionDoc.gradeLevel}`);
                targetSectionIds.push(firstSemSectionId);
                sectionDetailsForLoadCreation = { id: firstSemSectionId, semester: "1st semester" };
              }
              if (requiredSemesters.has("2nd semester")) {
                if (!secondSemSectionId) throw new ConvexError(`Could not find 2nd semester section for ${sectionDoc.name} ${sectionDoc.gradeLevel}`);
                targetSectionIds.push(secondSemSectionId);
                if (!sectionDetailsForLoadCreation) { // If only 2nd sem was required
                  sectionDetailsForLoadCreation = { id: secondSemSectionId, semester: "2nd semester" };
                }
              }
              if (targetSectionIds.length === 0) {
                throw new ConvexError(`Could not find matching semester sections for direct ID ${directSectionId} and selected semesters ${subject.semester?.join(', ')}`);
              }

            } else {
              targetSectionIds.push(directSectionId);
              sectionDetailsForLoadCreation = { id: directSectionId, semester: undefined };
            }

          } catch (e: any) {
            throw new ConvexError(`Invalid section ID format or lookup failed: ${subject.sectionId}. Error: ${e.message}`);
          }
        }
        if (!sectionDetailsForLoadCreation) {
          throw new ConvexError(`Failed to determine section details for load creation for subject ${subject.subjectName} and section ID ${subject.sectionId}`);
        }



        // --- Link subjectTaught to Section(s) ---
        // Add the subjectTaught ID to the `subjects` array on the target section document(s).
        for (const sectionId of targetSectionIds) {
          try {
            // Use internal mutation to handle potential concurrent updates safely
            await ctx.runMutation(internal.sections.addSubjectTaught, {
              sectionId: sectionId,
              id: subjectTaughtId,
            });
          } catch (error) {
            console.error(
              `Failed to add subject ${subjectTaughtId} to section ${sectionId}:`,
              error
            );
          }
        }


        // --- Create TeachingLoad records ---
        // One record per quarter the subject is taught in a specific section.
        const quartersToLoad = subject.quarter || [];
        const intendedSemesters = new Set(subject.semester ?? []); // Semesters this subject applies to

        for (const quarter of quartersToLoad) {
          let loadSemester: SemesterType | undefined = undefined;
          let targetSectionIdForLoad: Id<"sections">;

          if (isSenior) {
            // Determine the semester this quarter belongs to
            if (["1st quarter", "2nd quarter"].includes(quarter)) {
              loadSemester = "1st semester";
            } else if (["3rd quarter", "4th quarter"].includes(quarter)) {
              loadSemester = "2nd semester";
            } else {
              console.warn(`Invalid quarter value encountered: ${quarter}. Skipping load creation.`);
              continue;
            }

            // Ensure the subject is *intended* to be taught in this semester
            if (!intendedSemesters.has(loadSemester)) {
              console.warn(
                `Quarter ${quarter} selected, but subject ${subject.subjectName} is not assigned to semester ${loadSemester}. Skipping teaching load creation.`
              );
              continue;
            }

            const sectionDocs = await Promise.all(targetSectionIds.map(id => ctx.db.get(id)));
            const sectionForThisSemester = sectionDocs.find(sec => sec?.semester === loadSemester);

            if (!sectionForThisSemester) {
              throw new ConvexError(`Could not find the target SHS section document for semester ${loadSemester} among resolved IDs: ${targetSectionIds.join(', ')}`);
            }
            targetSectionIdForLoad = sectionForThisSemester._id;

          } else {
            // JHS: semester is undefined, use the single target section ID determined earlier
            targetSectionIdForLoad = sectionDetailsForLoadCreation.id;
            loadSemester = undefined;
          }

          // Handle MAPEH components separately
          if (subject.subjectName.toLowerCase() === "mapeh") {
            const mapehComponents = [
              "Music", "Arts", "Physical Education", "Health",
            ] as const;

            for (const component of mapehComponents) {
              const existingLoad = await ctx.db
                .query("teachingLoad")
                .withIndex("subjectTaughtId", (q) => q.eq("subjectTaughtId", subjectTaughtId))
                .filter((q) => q.eq(q.field("sectionId"), targetSectionIdForLoad))
                .filter((q) => q.eq(q.field("quarter"), quarter))
                .filter((q) => q.eq(q.field("subComponent"), component))
                .filter((q) => q.eq(q.field("semester"), loadSemester))
                .first();

              if (!existingLoad) {
                await ctx.db.insert("teachingLoad", {
                  subjectTaughtId: subjectTaughtId,
                  sectionId: targetSectionIdForLoad,
                  quarter: quarter,
                  semester: loadSemester,
                  subComponent: component,
                });
              }
              else { console.log(`Load exists for MAPEH ${component}, Q${quarter}, Sec ${targetSectionIdForLoad}`); }
            }
          } else {
            const existingLoad = await ctx.db
              .query("teachingLoad")
              .withIndex("subjectTaughtId", (q) => q.eq("subjectTaughtId", subjectTaughtId))
              .filter((q) => q.eq(q.field("sectionId"), targetSectionIdForLoad))
              .filter((q) => q.eq(q.field("quarter"), quarter))
              .filter((q) => q.eq(q.field("semester"), loadSemester))
              .filter((q) => q.eq(q.field("subComponent"), undefined))
              .first();

            if (!existingLoad) {
              await ctx.db.insert("teachingLoad", {
                subjectTaughtId: subjectTaughtId,
                sectionId: targetSectionIdForLoad,
                quarter: quarter,
                semester: loadSemester,
              });
            }
            else { console.log(`Load exists for ${subject.subjectName}, Q${quarter}, Sec ${targetSectionIdForLoad}`); }
          }
        }
      }
    }
    // Special handling for MAPEH subjects
    // if (subject.subjectName.toLowerCase() === "mapeh") {
    //   const mapehComponents = [
    //     "Music",
    //     "Arts",
    //     "Physical Education",
    //     "Health",
    //   ] as const;

    //   // Create teaching loads for each MAPEH component and quarter
    //   for (const component of mapehComponents) {
    //     for (const quarter of quartersToLoad) {
    //       let loadSemester: SemesterType | undefined = undefined;
    //       if (isSenior) {
    //         if (["1st quarter", "2nd quarter"].includes(quarter)) {
    //           loadSemester = "1st semester";
    //         } else if (["3rd quarter", "4th quarter"].includes(quarter)) {
    //           loadSemester = "2nd semester";
    //         }
    //         // Ensure the semester is actually selected in the input if SHS
    //         if (!subject.semester?.includes(loadSemester!)) {
    //           console.warn(
    //             `Quarter ${quarter} selected for SHS subject ${subject.subjectName} but semester ${loadSemester} was not.`
    //           );
    //           continue; // Skip creating load if semester doesn't match quarter
    //         }
    //       }

    //       // Check if a teaching load already exists for this combination
    //       const existingLoad = await ctx.db
    //         .query("teachingLoad")
    //         .withIndex("subjectTaughtId", (q) =>
    //           q.eq("subjectTaughtId", subjectTaughtId)
    //         )
    //         .filter((q) => q.eq(q.field("sectionId"), resolvedSectionId))
    //         .filter((q) => q.eq(q.field("quarter"), quarter))
    //         .filter((q) => q.eq(q.field("subComponent"), component))
    //         .first();

    //       if (!existingLoad) {
    //         await ctx.db.insert("teachingLoad", {
    //           subjectTaughtId: subjectTaughtId,
    //           sectionId: resolvedSectionId,
    //           quarter: quarter,
    //           semester: loadSemester, // Set semester if SHS
    //           subComponent: component, // Set the MAPEH component
    //         });
    //       }
    //     }
    //   }
    // } else {
    //   // Regular subject handling (non-MAPEH)
    //   for (const q of quartersToLoad) {
    //     let loadSemester: SemesterType | undefined = undefined;
    //     if (isSenior) {
    //       if (["1st quarter", "2nd quarter"].includes(q)) {
    //         loadSemester = "1st semester";
    //       } else if (["3rd quarter", "4th quarter"].includes(q)) {
    //         loadSemester = "2nd semester";
    //       }
    //       // Ensure the semester is actually selected in the input if SHS
    //       if (!subject.semester?.includes(loadSemester!)) {
    //         console.warn(
    //           `Quarter ${q} selected for SHS subject ${subject.subjectName} but semester ${loadSemester} was not.`
    //         );
    //         continue; // Skip creating load if semester doesn't match quarter
    //       }
    //     }

    //     await ctx.db.insert("teachingLoad", {
    //       subjectTaughtId: subjectTaughtId,
    //       sectionId: resolvedSectionId,
    //       quarter: q,
    //       semester: loadSemester, // Set semester if SHS
    //     });
    //   }
    // }
    return accountResponse.user;
  },
});

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
      };
    });
  },
});

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
        .withIndex("adviserId", (q) => q.eq("adviserId", args.userId))
        .collect();
    }

    // Get subjects taught if subject-teacher role
    let subjectsTaught: SubjectTaughtQueryResult[] = [];
    if (
      user.role === "subject-teacher" ||
      user.role === "adviser/subject-teacher"
    ) {
      const subjects = await ctx.db
        .query("subjectTaught")
        .withIndex("teacherId", (q) => q.eq("teacherId", args.userId))
        .collect();

      for (const subject of subjects) {
        const teachingLoads = await ctx.db
          .query("teachingLoad")
          .withIndex("subjectTaughtId", (q) =>
            q.eq("subjectTaughtId", subject._id)
          )
          .collect();

        // Group teaching loads by section to handle teaching the same subject in multiple sections
        const sectionGroups = teachingLoads.reduce<
          Record<
            string,
            {
              quarters: Set<string>;
              semesters: Set<string>;
              sectionId: Id<"sections">;
            }
          >
        >((acc, load) => {
          const sectionIdStr = load.sectionId.toString(); // Use string as key
          if (!acc[sectionIdStr]) {
            acc[sectionIdStr] = {
              quarters: new Set(),
              semesters: new Set(),
              sectionId: load.sectionId,
            };
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
    principalType: v.optional(
      v.union(
        v.literal("junior-department"),
        v.literal("senior-department"),
        v.literal("entire-school")
      )
    ),
    subjectsTaught: v.optional(
      v.array(
        v.object({
          // _id: v.optional(v.string()),
          // subjectThoughtId: v.optional(v.id("subjectThought")),
          subjectName: v.string(),
          gradeLevel: v.union(
            v.literal("Grade 7"),
            v.literal("Grade 8"),
            v.literal("Grade 9"),
            v.literal("Grade 10"),
            v.literal("Grade 11"),
            v.literal("Grade 12")
          ),
          sectionId: v.string(),
          semester: v.optional(v.array(semesterType)),
          quarter: v.array(quarterType),
          gradeWeights: v.object({
            type: v.union(
              v.literal("Face to face"),
              v.literal("Modular"),
              v.literal("Other")
            ),
            faceToFace: v.optional(
              v.object({
                ww: v.number(),
                pt: v.number(),
                majorExam: v.number(),
              })
            ),
            modular: v.optional(
              v.object({
                ww: v.number(),
                pt: v.number(),
              })
            ),
            other: v.optional(
              v.array(
                v.object({
                  component: v.union(
                    v.literal("Written Works"),
                    v.literal("Performance Tasks"),
                    v.literal("Major Exam")
                  ),
                  percentage: v.number(),
                })
              )
            ),
          }),
          category: v.optional(
            v.union(
              v.literal("core"),
              v.literal("specialized"),
              v.literal("applied")
            )
          ),
        })
      )
    ),
    sections: v.optional(
      v.array(
        v.object({
          // _id: v.optional(v.id("sections")),
          sectionId: v.optional(v.string()), // zod type kaya string lang, iccast nalang siya sa functions as Id of section sa baba
          adviserId: v.optional(v.string()),
          name: v.string(),
          gradeLevel: v.union(
            v.literal("Grade 7"),
            v.literal("Grade 8"),
            v.literal("Grade 9"),
            v.literal("Grade 10"),
            v.literal("Grade 11"),
            v.literal("Grade 12")
          ),
          schoolYear: v.string(),
          semester: v.optional(
            v.union(v.literal("1st semester"), v.literal("2nd semester"))
          ),
        })
      )
    ),
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
        });
      } catch (error) {
        console.error("Failed to update password in auth", error);
        throw new ConvexError("Failed to update password");
      }
    }

    // Extract user data
    const {
      userId,
      password,
      subjectsTaught: submittedSubjectsInput,
      sections: submittedSectionsInput,
      ...userData
    } = args;

    // Update basic user info
    await ctx.db.patch(userId, userData);

    const createdSectionsMap = new Map<number, { firstSemId?: Id<"sections">, secondSemId?: Id<"sections">, jhsId?: Id<"sections"> }>();

    // ! ADVISER ROLE
    if (args.role === "adviser" || args.role === "adviser/subject-teacher") {
      const submittedSections = args.sections || [];
      const submittedSectionIds = new Set(submittedSections.map(s => s.sectionId).filter(Boolean) as Id<"sections">[]);

      const existingAdvisedSections = await ctx.db
        .query("sections")
        .withIndex("adviserId", (q) => q.eq("adviserId", userId))
        .collect();

      const newSectionsToCreate: typeof submittedSections = [];

      // Update or mark existing sections
      for (const submittedSection of submittedSections) {
        if (submittedSection.sectionId && submittedSectionIds.has(submittedSection.sectionId as Id<"sections">)) {
          // Update existing section if needed (name, gradeLevel, schoolYear)
          const existing = existingAdvisedSections.find(e => e._id === submittedSection.sectionId);
          if (existing && (existing.name !== submittedSection.name || existing.gradeLevel !== submittedSection.gradeLevel || existing.schoolYear !== submittedSection.schoolYear)) {
            await ctx.db.patch(submittedSection.sectionId as Id<"sections">, {
              name: submittedSection.name,
              gradeLevel: submittedSection.gradeLevel,
              schoolYear: submittedSection.schoolYear,
              // Ensure adviserId is correct (though it should be)
              adviserId: userId,
            });
          }
        } else if (!submittedSection.sectionId) {
          // Mark for creation
          newSectionsToCreate.push(submittedSection);
        }
      }

      // Create new sections (handle SHS pair creation)
      const createdSectionsMap = new Map<number, { firstSemId?: Id<"sections">, secondSemId?: Id<"sections">, jhsId?: Id<"sections"> }>(); // Store created IDs for pending subjects
      for (const [index, sectionToCreate] of newSectionsToCreate.entries()) {
        const isSHS = seniorHighGrades.includes(sectionToCreate.gradeLevel);
        if (isSHS) {
          const base = { name: sectionToCreate.name, gradeLevel: sectionToCreate.gradeLevel, schoolYear: sectionToCreate.schoolYear, adviserId: userId, subjects: [] };
          const firstSemId = await ctx.db.insert("sections", { ...base, semester: "1st semester" });
          const secondSemId = await ctx.db.insert("sections", { ...base, semester: "2nd semester" });
          createdSectionsMap.set(index, { firstSemId, secondSemId });
        } else {
          const jhsId = await ctx.db.insert("sections", { name: sectionToCreate.name, gradeLevel: sectionToCreate.gradeLevel, schoolYear: sectionToCreate.schoolYear, adviserId: userId, subjects: [], semester: undefined });
          createdSectionsMap.set(index, { jhsId });
        }
      }

      // Delete sections no longer advised by this user
      for (const existingSection of existingAdvisedSections) {
        if (!submittedSectionIds.has(existingSection._id)) {
          // Consider implications before deleting (e.g., students enrolled)
          // Maybe just remove adviserId instead? For now, deleting as per previous logic.
          console.warn(`Deleting section ${existingSection._id} as it's no longer advised by ${userId}.`);
          await ctx.db.delete(existingSection._id);
        }
      }
    } else {
      // If role is NOT adviser, remove user as adviser from any sections they currently advise
      const currentlyAdvised = await ctx.db
        .query("sections")
        .withIndex("adviserId", q => q.eq("adviserId", userId))
        .collect();
      for (const section of currentlyAdvised) {
        console.warn(`Removing user ${userId} as adviser from section ${section._id} due to role change.`);
        await ctx.db.patch(section._id, { adviserId: undefined }); // Or handle differently
      }

      // if (submittedSections.length > 0) {
      //   // Get existing sections for this adviser
      //   const existingSections = await ctx.db
      //     .query("sections")
      //     .withIndex("adviserId", (q) => q.eq("adviserId", userId))
      //     .collect();

      //   // Create a map of existing sections by their ID for easier lookup
      //   const existingSectionsMap = new Map(
      //     existingSections.map((section) => [section._id, section])
      //   );

      //   // Process each submitted section
      //   for (const submittedSection of submittedSections) {
      //     const sectionId = submittedSection.sectionId as Id<"sections">;

      //     if (existingSectionsMap.has(sectionId)) {
      //       // Update existing section
      //       await ctx.db.patch(sectionId, {
      //         name: submittedSection.name,
      //         gradeLevel: submittedSection.gradeLevel,
      //         schoolYear: submittedSection.schoolYear,
      //         adviserId: userId,
      //       });
      //     } else {
      //       // Create new section
      //       await ctx.db.insert("sections", {
      //         name: submittedSection.name,
      //         gradeLevel: submittedSection.gradeLevel,
      //         schoolYear: submittedSection.schoolYear,
      //         adviserId: userId,
      //         subjects: [],
      //       });
      //     }
      //   }

      //   // Remove adviser from sections that are no longer assigned
      //   for (const existingSection of existingSections) {
      //     if (
      //       !submittedSections.some((s) => s.sectionId === existingSection._id)
      //     ) {
      //       await ctx.db.delete(existingSection._id);
      //     }
      //   }
      // }
    }

    // ! Subject-Teacher ROLE

    // * Handle Subjects & Teaching Loads (For teacher roles)
    const existingSubjectDocs = await ctx.db
      .query("subjectTaught")
      .withIndex("teacherId", (q) => q.eq("teacherId", userId))
      .collect();

    const existingSubjectIds = existingSubjectDocs.map((s) => s._id);
    const existingLoadDocs = existingSubjectIds.length > 0
      ? (await Promise.all(existingSubjectIds.map(id => ctx.db.query("teachingLoad").withIndex("subjectTaughtId", q => q.eq("subjectTaughtId", id)).collect()))).flat()
      : [];

    // Map existing subjects by key for easy lookup
    const existingSubjectsMap = new Map<string, Doc<"subjectTaught">>(
      existingSubjectDocs.map((doc) => [`${doc.subjectName}_${doc.gradeLevel}`, doc])
    );

    // const existingSubjectIds = existingSubjectDocs.map((s) => s._id);
    // const existingLoadDocs =
    //   existingSubjectIds.length > 0
    //     ? (
    //       await Promise.all(
    //         existingSubjectIds.map((subjectId) =>
    //           ctx.db
    //             .query("teachingLoad")
    //             .withIndex("subjectTaughtId", (q) =>
    //               q.eq("subjectTaughtId", subjectId)
    //             )
    //             .collect()
    //         )
    //       )
    //     ).flat()
    //     : [];

    // const existingSubjectsMap = new Map<string, Doc<"subjectTaught">>(
    //   existingSubjectDocs.map((doc) => [
    //     `${doc.subjectName}_${doc.gradeLevel}`,
    //     doc,
    //   ])
    // );

    // Map: subjectTaughtId -> sectionId -> quarter -> loadId
    // const existingLoadsMap = new Map<
    //   Id<"subjectTaught">,
    //   Map<Id<"sections">, Map<QuarterType, Id<"teachingLoad">>>
    // >();
    // for (const load of existingLoadDocs) {
    //   if (!existingLoadsMap.has(load.subjectTaughtId)) {
    //     existingLoadsMap.set(load.subjectTaughtId, new Map());
    //   }
    //   const sectionMap = existingLoadsMap.get(load.subjectTaughtId)!;
    //   if (!sectionMap.has(load.sectionId)) {
    //     sectionMap.set(load.sectionId, new Map());
    //   }
    //   sectionMap.get(load.sectionId)!.set(load.quarter!, load._id);
    // }

    // --- Process Submitted State ---

    const previousSectionLinks = new Map<Id<"subjectTaught">, Set<Id<"sections">>>();
    for (const load of existingLoadDocs) {
      if (!previousSectionLinks.has(load.subjectTaughtId)) {
        previousSectionLinks.set(load.subjectTaughtId, new Set());
      }
      previousSectionLinks.get(load.subjectTaughtId)!.add(load.sectionId);
    }

    const keptSubjectTaughtIds = new Set<Id<"subjectTaught">>();
    const processedLoadIds = new Set<Id<"teachingLoad">>();
    // Map final desired state: subjectTaughtId -> Set<sectionId>
    const finalSectionLinks = new Map<Id<"subjectTaught">, Set<Id<"sections">>>();

    // if (
    //   (args.role === "subject-teacher" ||
    //     args.role === "adviser/subject-teacher") &&
    //   submittedSubjectsInput
    // ) {
    //   for (const submittedSubject of submittedSubjectsInput) {
    //     let subjectTaughtId: Id<"subjectTaught">;
    //     let resolvedSectionId: Id<"sections">;

    //     // Resolve section ID (handle pending)
    //     if (submittedSubject.sectionId.startsWith("pending-section-")) {
    //       const pendingIndex = parseInt(
    //         submittedSubject.sectionId.replace("pending-section-", "")
    //       );
    //       const actualId = createdSectionsMap.get(pendingIndex);
    //       if (!actualId) {
    //         // If we can't find the section, try to find it in the database
    //         const section = await ctx.db
    //           .query("sections")
    //           .filter((q) => q.eq(q.field("name"), submittedSubject.sectionId))
    //           .first();

    //         if (!section) {
    //           throw new ConvexError(
    //             `Could not resolve section: ${submittedSubject.sectionId}`
    //           );
    //         }
    //         resolvedSectionId = section._id;
    //       } else {
    //         resolvedSectionId = actualId;
    //       }
    //     } else {
    //       try {
    //         resolvedSectionId = submittedSubject.sectionId as Id<"sections">;
    //       } catch (e) {
    //         throw new ConvexError(
    //           `Invalid section ID format: ${submittedSubject.sectionId}`
    //         );
    //       }
    //     }

    //     // Find or Create subjectTaught
    //     const subjectKey = `${submittedSubject.subjectName}_${submittedSubject.gradeLevel}`;
    //     const existingSubjectDoc = existingSubjectsMap.get(subjectKey);
    //     const isSenior = seniorHighGrades.includes(
    //       submittedSubject.gradeLevel as GradeLevelsTypes
    //     );
    //     const submittedSemesters = isSenior
    //       ? submittedSubject.semester
    //       : undefined;

    //     if (existingSubjectDoc) {
    //       subjectTaughtId = existingSubjectDoc._id;
    //       keptSubjectTaughtIds.add(subjectTaughtId);

    //       // Patch if gradeWeights, category, or semester list changed
    //       const needsPatch =
    //         JSON.stringify(existingSubjectDoc.gradeWeights) !==
    //         JSON.stringify(submittedSubject.gradeWeights) ||
    //         existingSubjectDoc.category !== submittedSubject.category ||
    //         JSON.stringify(existingSubjectDoc.semester) !==
    //         JSON.stringify(submittedSemesters); // Compare semesters

    //       if (needsPatch) {
    //         await ctx.db.patch(subjectTaughtId, {
    //           gradeWeights: submittedSubject.gradeWeights,
    //           category: submittedSubject.category,
    //           semester: submittedSemesters, // Update semester list
    //         });
    //       }
    //     } else {
    //       // Insert new subjectTaught
    //       subjectTaughtId = await ctx.db.insert("subjectTaught", {
    //         teacherId: userId,
    //         gradeLevel: submittedSubject.gradeLevel,
    //         subjectName: submittedSubject.subjectName,
    //         gradeWeights: submittedSubject.gradeWeights,
    //         category: submittedSubject.category,
    //         semester: submittedSemesters, // Store semesters if SHS
    //         quarter: submittedSubject.quarter,
    //       });
    //       keptSubjectTaughtIds.add(subjectTaughtId);
    //     }

    //     // Link subjectTaught to section
    //     try {
    //       await ctx.runMutation(internal.sections.addSubjectTaught, {
    //         sectionId: resolvedSectionId,
    //         id: subjectTaughtId,
    //       });
    //     } catch (error) {
    //       console.error(
    //         `Failed to add subject ${subjectTaughtId} to section ${resolvedSectionId}:`,
    //         error
    //       );
    //     }

    //     // --- Sync Teaching Loads for this Subject/Section ---
    //     const submittedQuarters = new Set(submittedSubject.quarter || []);
    //     const existingQuarterMap = existingLoadsMap
    //       .get(subjectTaughtId)
    //       ?.get(resolvedSectionId);

    //     // Process submitted quarters
    //     for (const submittedQuarter of submittedQuarters) {
    //       let loadSemester: SemesterType | undefined = undefined;
    //       if (isSenior) {
    //         if (["1st quarter", "2nd quarter"].includes(submittedQuarter))
    //           loadSemester = "1st semester";
    //         else if (["3rd quarter", "4th quarter"].includes(submittedQuarter))
    //           loadSemester = "2nd semester";

    //         // Ensure semester matches quarter for SHS
    //         if (!submittedSemesters?.includes(loadSemester!)) {
    //           console.warn(
    //             `Skipping load creation: Quarter ${submittedQuarter} submitted but semester ${loadSemester} was not selected for SHS subject ${subjectKey}.`
    //           );
    //           continue;
    //         }
    //       }

    //       // Special handling for MAPEH subjects
    //       if (submittedSubject.subjectName.toLowerCase() === "mapeh") {
    //         const mapehComponents = [
    //           "Music",
    //           "Arts",
    //           "Physical Education",
    //           "Health",
    //         ] as const;

    //         // For MAPEH, we need to check each quarter separately
    //         for (const quarter of submittedQuarters) {
    //           let loadSemester: SemesterType | undefined = undefined;
    //           if (isSenior) {
    //             if (["1st quarter", "2nd quarter"].includes(quarter)) {
    //               loadSemester = "1st semester";
    //             } else if (["3rd quarter", "4th quarter"].includes(quarter)) {
    //               loadSemester = "2nd semester";
    //             }
    //             // Ensure the semester is actually selected in the input if SHS
    //             if (!submittedSemesters?.includes(loadSemester!)) {
    //               console.warn(
    //                 `Quarter ${quarter} selected for SHS subject ${submittedSubject.subjectName} but semester ${loadSemester} was not.`
    //               );
    //               continue; // Skip creating load if semester doesn't match quarter
    //             }
    //           }

    //           // Create or update teaching loads for each MAPEH component
    //           for (const component of mapehComponents) {
    //             // Check if a teaching load already exists for this specific combination
    //             const existingLoad = await ctx.db
    //               .query("teachingLoad")
    //               .withIndex("subjectTaughtId", (q) =>
    //                 q.eq("subjectTaughtId", subjectTaughtId)
    //               )
    //               .filter((q) => q.eq(q.field("sectionId"), resolvedSectionId))
    //               .filter((q) => q.eq(q.field("quarter"), quarter))
    //               .filter((q) => q.eq(q.field("subComponent"), component))
    //               .first();

    //             if (existingLoad) {
    //               // Load exists, mark it as processed
    //               processedLoadIds.add(existingLoad._id);
    //               // Update if semester changed
    //               if (existingLoad.semester !== loadSemester) {
    //                 await ctx.db.patch(existingLoad._id, {
    //                   semester: loadSemester,
    //                 });
    //               }
    //             } else {
    //               // Create new teaching load for this combination
    //               const newLoadId = await ctx.db.insert("teachingLoad", {
    //                 subjectTaughtId: subjectTaughtId,
    //                 sectionId: resolvedSectionId,
    //                 quarter: quarter,
    //                 semester: loadSemester,
    //                 subComponent: component,
    //               });
    //               processedLoadIds.add(newLoadId);
    //             }
    //           }
    //         }
    //       } else {
    //         // Regular subject handling (non-MAPEH)
    //         const existingLoadId = existingQuarterMap?.get(submittedQuarter);

    //         if (existingLoadId) {
    //           // Load exists, mark it as processed
    //           processedLoadIds.add(existingLoadId);
    //           // Optional: Check if semester needs updating on existing load
    //           const existingLoadDoc = existingLoadDocs.find(
    //             (l) => l._id === existingLoadId
    //           );
    //           if (
    //             existingLoadDoc &&
    //             existingLoadDoc.semester !== loadSemester
    //           ) {
    //             await ctx.db.patch(existingLoadId, { semester: loadSemester });
    //           }
    //         } else {
    //           // Load is new, insert it
    //           const newLoadId = await ctx.db.insert("teachingLoad", {
    //             subjectTaughtId: subjectTaughtId,
    //             sectionId: resolvedSectionId,
    //             quarter: submittedQuarter,
    //             semester: loadSemester,
    //           });
    //           processedLoadIds.add(newLoadId);
    //         }
    //       }
    //     }
    //     // --- End Sync Teaching Loads ---
    //   }
    // }

    // --- Deletion Phase ---

    // // Delete Teaching Loads that were not processed (i.e., not in the final submitted state)
    // for (const load of existingLoadDocs) {
    //   if (!processedLoadIds.has(load._id)) {
    //     console.warn(
    //       `Deleting teaching load ${load._id}. Implement cleanup for class records, scores etc.`
    //     );

    //     await ctx.db.delete(load._id);
    //   }
    // }

    // // Delete subjectTaught documents that are no longer kept
    // for (const subjectDoc of existingSubjectDocs) {
    //   if (!keptSubjectTaughtIds.has(subjectDoc._id)) {
    //     // Double-check if any loads associated with this subject were somehow kept
    //     const associatedKeptLoads = existingLoadDocs.filter(
    //       (l) =>
    //         l.subjectTaughtId === subjectDoc._id && processedLoadIds.has(l._id)
    //     );

    //     if (associatedKeptLoads.length === 0) {
    //       console.warn(
    //         `Deleting subjectTaught ${subjectDoc._id} (${subjectDoc.subjectName}, ${subjectDoc.gradeLevel}). Removing from sections.`
    //       );

    //       // Find all sections that currently include this subjectTaughtId
    //       const sectionsToUpdate = await ctx.db
    //         .query("sections")
    //         // Consider adding an index on `subjects` if performance becomes an issue
    //         .filter((q) =>
    //           q.neq(q.field("subjects"), undefined) // Ensure subjects array exists
    //         )
    //         .collect(); // Collect all sections first (or filter more specifically if possible)

    //       for (const section of sectionsToUpdate) {
    //         if (section.subjects?.includes(subjectDoc._id)) {
    //           // Filter out the subjectTaughtId to be deleted
    //           const updatedSubjects = section.subjects.filter(
    //             (id) => id !== subjectDoc._id
    //           );
    //           // Patch the section document with the updated subjects array
    //           await ctx.db.patch(section._id, { subjects: updatedSubjects });
    //           console.log(`Removed subject ${subjectDoc._id} from section ${section._id}`);
    //         }
    //       }

    //       await ctx.db.delete(subjectDoc._id);

    //     } else {
    //       console.error(
    //         `Logic Error: Subject ${subjectDoc._id} marked for deletion but still has kept loads: ${associatedKeptLoads.map((l) => l._id).join(", ")}`
    //       );
    //     }
    //   }
    // }

    // // If role changed away from teacher, ensure all remaining subjects/loads are deleted
    // if (
    //   !(
    //     args.role === "subject-teacher" ||
    //     args.role === "adviser/subject-teacher"
    //   ) &&
    //   existingSubjectDocs.length > 0
    // ) {
    //   console.warn(`User ${userId} role changed away from teacher. Cleaning up subjects and loads.`);
    //   const finalSubjects = await ctx.db
    //     .query("subjectTaught")
    //     .withIndex("teacherId", (q) => q.eq("teacherId", userId))
    //     .collect();

    //   for (const subjectDoc of finalSubjects) {
    //     // Delete associated teaching loads first
    //     const loads = await ctx.db
    //       .query("teachingLoad")
    //       .withIndex("subjectTaughtId", (q) =>
    //         q.eq("subjectTaughtId", subjectDoc._id)
    //       )
    //       .collect();
    //     for (const load of loads) {
    //       console.warn(
    //         `Deleting teaching load ${load._id} due to role change. Implement cleanup.`
    //       );

    //       await ctx.db.delete(load._id);
    //     }

    //     console.warn(
    //       `Deleting subjectTaught ${subjectDoc._id} due to role change. Removing from sections.`
    //     );

    //     // --- START: Remove subjectTaughtId from sections (Role Change) ---
    //     const sectionsToUpdate = await ctx.db
    //       .query("sections")
    //       .filter((q) =>
    //         q.neq(q.field("subjects"), undefined)
    //       )
    //       .collect();

    //     for (const section of sectionsToUpdate) {
    //       if (section.subjects?.includes(subjectDoc._id)) {
    //         const updatedSubjects = section.subjects.filter(
    //           (id) => id !== subjectDoc._id
    //         );
    //         await ctx.db.patch(section._id, { subjects: updatedSubjects });
    //         console.log(`Removed subject ${subjectDoc._id} from section ${section._id} due to role change.`);
    //       }
    //     }
    //     // --- END: Remove subjectTaughtId from sections (Role Change) ---

    //     // Delete the subjectTaught document
    //     await ctx.db.delete(subjectDoc._id);
    //   }
    // }
    // // --- End Deletion Phase ---

    if (
      (args.role === "subject-teacher" || args.role === "adviser/subject-teacher") &&
      submittedSubjectsInput
    ) {
      for (const submittedSubject of submittedSubjectsInput) {
        let subjectTaughtId: Id<"subjectTaught">;
        const targetSectionIds = new Set<Id<"sections">>(); // Sections this subject should be linked to

        const isSenior = seniorHighGrades.includes(submittedSubject.gradeLevel as GradeLevelsTypes);
        const submittedSemesters = isSenior ? new Set(submittedSubject.semester ?? []) : new Set<SemesterType>();

        // --- Resolve Target Section ID(s) ---
        if (submittedSubject.sectionId.startsWith("pending-section-")) {
          const pendingIndex = parseInt(submittedSubject.sectionId.replace("pending-section-", ""));
          const createdIds = createdSectionsMap.get(pendingIndex); // Assumes adviser section creation happened above
          if (!createdIds) {
            throw new ConvexError(`Could not resolve pending section index: ${pendingIndex}`);
          }
          if (isSenior) {
            if (submittedSemesters.has("1st semester") && createdIds.firstSemId) targetSectionIds.add(createdIds.firstSemId);
            if (submittedSemesters.has("2nd semester") && createdIds.secondSemId) targetSectionIds.add(createdIds.secondSemId);
          } else {
            if (createdIds.jhsId) targetSectionIds.add(createdIds.jhsId);
          }
          if (targetSectionIds.size === 0 && (isSenior ? submittedSemesters.size > 0 : true)) {
            throw new ConvexError(`Failed to find created section IDs for pending index ${pendingIndex} and grade ${submittedSubject.gradeLevel}`);
          }
        } else {
          // Direct ID provided
          try {
            const directSectionId = submittedSubject.sectionId as Id<"sections">;
            const sectionDoc = await ctx.db.get(directSectionId);
            if (!sectionDoc) throw new ConvexError(`Section ${directSectionId} not found.`);

            if (isSenior) {
              // Find the pair (1st and 2nd sem sections)
              const sectionPair = await ctx.db.query("sections")
                .withIndex("adviserId", q => q.eq("adviserId", sectionDoc.adviserId)) // Or query by name/grade/year if adviser might change
                .filter(q => q.eq(q.field("name"), sectionDoc.name))
                .filter(q => q.eq(q.field("gradeLevel"), sectionDoc.gradeLevel))
                .filter(q => q.eq(q.field("schoolYear"), sectionDoc.schoolYear))
                .collect();

              const firstSemSection = sectionPair.find(s => s.semester === "1st semester");
              const secondSemSection = sectionPair.find(s => s.semester === "2nd semester");

              if (submittedSemesters.has("1st semester") && firstSemSection) targetSectionIds.add(firstSemSection._id);
              if (submittedSemesters.has("2nd semester") && secondSemSection) targetSectionIds.add(secondSemSection._id);

              if (targetSectionIds.size === 0 && submittedSemesters.size > 0) {
                throw new ConvexError(`Could not find matching SHS sections for ${sectionDoc.name} ${sectionDoc.gradeLevel} and submitted semesters.`);
              }
            } else {
              // JHS - just use the direct ID
              targetSectionIds.add(directSectionId);
            }
          } catch (e: any) {
            throw new ConvexError(`Invalid section ID format or lookup failed: ${submittedSubject.sectionId}. Error: ${e.message}`);
          }
        }
        // --- End Resolve Target Section ID(s) ---


        // --- Find or Create/Patch subjectTaught ---
        const subjectKey = `${submittedSubject.subjectName}_${submittedSubject.gradeLevel}`;
        const existingSubjectDoc = existingSubjectsMap.get(subjectKey);

        if (existingSubjectDoc) {
          subjectTaughtId = existingSubjectDoc._id;
          // Patch if details changed
          const needsPatch =
            JSON.stringify(existingSubjectDoc.gradeWeights) !== JSON.stringify(submittedSubject.gradeWeights) ||
            existingSubjectDoc.category !== submittedSubject.category ||
            JSON.stringify(existingSubjectDoc.semester ?? []) !== JSON.stringify(submittedSubject.semester ?? []) || // Compare semester arrays
            JSON.stringify(existingSubjectDoc.quarter ?? []) !== JSON.stringify(submittedSubject.quarter ?? []); // Compare quarter arrays

          if (needsPatch) {
            await ctx.db.patch(subjectTaughtId, {
              gradeWeights: submittedSubject.gradeWeights,
              category: submittedSubject.category,
              semester: isSenior ? submittedSubject.semester : undefined,
              quarter: submittedSubject.quarter, // Update quarters too
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
            semester: isSenior ? submittedSubject.semester : undefined,
            quarter: submittedSubject.quarter,
          });
        }
        keptSubjectTaughtIds.add(subjectTaughtId);
        // --- End Find or Create/Patch subjectTaught ---


        // --- Update Final Section Links Map ---
        if (!finalSectionLinks.has(subjectTaughtId)) {
          finalSectionLinks.set(subjectTaughtId, new Set());
        }
        const finalLinksForSubject = finalSectionLinks.get(subjectTaughtId)!;
        targetSectionIds.forEach(id => finalLinksForSubject.add(id));
        // --- End Update Final Section Links Map ---


        // --- Link subjectTaught to NEW Target Section(s) ---
        for (const sectionId of targetSectionIds) {
          try {
            // This mutation should ideally be idempotent or handle existing links gracefully
            await ctx.runMutation(internal.sections.addSubjectTaught, {
              sectionId: sectionId,
              id: subjectTaughtId,
            });
          } catch (error) {
            console.error(`Failed to add subject ${subjectTaughtId} to section ${sectionId}:`, error);
          }
        }
        // --- End Link subjectTaught to NEW Target Section(s) ---


        // --- Sync Teaching Loads for this Subject/Section Combination ---
        const submittedQuarters = new Set(submittedSubject.quarter || []);

        for (const targetSectionId of targetSectionIds) {
          const sectionDoc = await ctx.db.get(targetSectionId); // Get section to know its semester if SHS
          if (!sectionDoc) continue; // Should not happen if resolution worked

          const sectionSemester = sectionDoc.semester;

          // Determine which of the submitted quarters apply to *this specific* section
          const applicableQuarters = new Set<QuarterType>();
          if (isSenior) {
            if (sectionSemester === "1st semester") {
              if (submittedQuarters.has("1st quarter")) applicableQuarters.add("1st quarter");
              if (submittedQuarters.has("2nd quarter")) applicableQuarters.add("2nd quarter");
            } else if (sectionSemester === "2nd semester") {
              if (submittedQuarters.has("3rd quarter")) applicableQuarters.add("3rd quarter");
              if (submittedQuarters.has("4th quarter")) applicableQuarters.add("4th quarter");
            }
          } else {
            // JHS - all submitted quarters apply
            submittedQuarters.forEach(q => applicableQuarters.add(q as QuarterType));
          }


          // Find existing loads for *this specific* subjectTaughtId and targetSectionId
          const existingLoadsForThisCombo = existingLoadDocs.filter(l => l.subjectTaughtId === subjectTaughtId && l.sectionId === targetSectionId);

          for (const quarter of applicableQuarters) {
            // Handle MAPEH components
            if (submittedSubject.subjectName.toLowerCase() === "mapeh") {
              const mapehComponents = ["Music", "Arts", "Physical Education", "Health"] as const;
              for (const component of mapehComponents) {
                const existingLoad = existingLoadsForThisCombo.find(l => l.quarter === quarter && l.subComponent === component);
                if (existingLoad) {
                  processedLoadIds.add(existingLoad._id);
                  // Patch semester if needed (unlikely here as sectionSemester is fixed)
                  if (existingLoad.semester !== sectionSemester) {
                    await ctx.db.patch(existingLoad._id, { semester: sectionSemester });
                  }
                } else {
                  const newLoadId = await ctx.db.insert("teachingLoad", {
                    subjectTaughtId: subjectTaughtId,
                    sectionId: targetSectionId,
                    quarter: quarter,
                    semester: sectionSemester, // Use the section's semester
                    subComponent: component,
                  });
                  processedLoadIds.add(newLoadId);
                }
              }
            } else {
              // Regular subject
              const existingLoad = existingLoadsForThisCombo.find(l => l.quarter === quarter && !l.subComponent);
              if (existingLoad) {
                processedLoadIds.add(existingLoad._id);
                if (existingLoad.semester !== sectionSemester) {
                  await ctx.db.patch(existingLoad._id, { semester: sectionSemester });
                }
              } else {
                const newLoadId = await ctx.db.insert("teachingLoad", {
                  subjectTaughtId: subjectTaughtId,
                  sectionId: targetSectionId,
                  quarter: quarter,
                  semester: sectionSemester,
                });
                processedLoadIds.add(newLoadId);
              }
            }
          }
        }
        // --- End Sync Teaching Loads ---
      }
    }

    // --- Deletion/Cleanup Phase ---

    // 1. Unlink subjects from sections they are no longer taught in
    for (const [subjectTaughtId, previousSections] of previousSectionLinks.entries()) {
      const finalSections = finalSectionLinks.get(subjectTaughtId) ?? new Set<Id<"sections">>();
      for (const oldSectionId of previousSections) {
        if (!finalSections.has(oldSectionId)) {
          // Subject is no longer taught in oldSectionId, remove the link
          try {
            console.log(`Removing subject ${subjectTaughtId} from old section ${oldSectionId}`);
            await ctx.runMutation(internal.sections.removeSubjectTaught, {
              sectionId: oldSectionId,
              id: subjectTaughtId,
            });
          } catch (error) {
            console.error(`Failed to remove subject ${subjectTaughtId} from section ${oldSectionId}:`, error);
          }
        }
      }
    }

    // 2. Delete Teaching Loads that were not processed
    for (const load of existingLoadDocs) {
      if (!processedLoadIds.has(load._id)) {
        console.warn(`Deleting teaching load ${load._id}.`);
        // Add cleanup for related data (class records, scores) if necessary
        await ctx.db.delete(load._id);
      }
    }

    // 3. Delete subjectTaught documents that are no longer kept
    for (const subjectDoc of existingSubjectDocs) {
      if (!keptSubjectTaughtIds.has(subjectDoc._id)) {
        // Double-check: Ensure no loads remain (should have been deleted above)
        const remainingLoads = await ctx.db.query("teachingLoad").withIndex("subjectTaughtId", q => q.eq("subjectTaughtId", subjectDoc._id)).collect();
        if (remainingLoads.length === 0) {
          console.warn(`Deleting subjectTaught ${subjectDoc._id} (${subjectDoc.subjectName}, ${subjectDoc.gradeLevel}).`);
          // Links should have been removed in step 1, but as a fallback:
          await ctx.runMutation(internal.sections.removeSubjectTaughtFromAll, { subjectTaughtId: subjectDoc._id });
          await ctx.db.delete(subjectDoc._id);
        } else {
          console.error(`Logic Error: Subject ${subjectDoc._id} marked for deletion but still has loads: ${remainingLoads.map(l => l._id).join(", ")}`);
          // Force delete loads and subject anyway? Or throw error?
          for (const load of remainingLoads) await ctx.db.delete(load._id);
          await ctx.runMutation(internal.sections.removeSubjectTaughtFromAll, { subjectTaughtId: subjectDoc._id });
          await ctx.db.delete(subjectDoc._id);
        }
      }
    }

    // 4. If role changed away from teacher, ensure all remaining subjects/loads are deleted
    if (
      !(args.role === "subject-teacher" || args.role === "adviser/subject-teacher") &&
      existingSubjectDocs.length > 0 // Check if there were subjects initially
    ) {
      console.warn(`User ${userId} role changed away from teacher. Cleaning up any remaining subjects and loads.`);
      // Refetch subjects just in case some were missed or created unexpectedly
      const finalSubjects = await ctx.db
        .query("subjectTaught")
        .withIndex("teacherId", (q) => q.eq("teacherId", userId))
        .collect();

      for (const subjectDoc of finalSubjects) {
        // Delete associated teaching loads first
        const loads = await ctx.db.query("teachingLoad").withIndex("subjectTaughtId", q => q.eq("subjectTaughtId", subjectDoc._id)).collect();
        for (const load of loads) {
          console.warn(`Deleting teaching load ${load._id} due to role change.`);
          await ctx.db.delete(load._id);
        }

        console.warn(`Deleting subjectTaught ${subjectDoc._id} due to role change and removing from sections.`);
        // Remove from all sections
        await ctx.runMutation(internal.sections.removeSubjectTaughtFromAll, { subjectTaughtId: subjectDoc._id });
        // Delete the subjectTaught document
        await ctx.db.delete(subjectDoc._id);
      }
    }
    // --- End Deletion/Cleanup Phase ---

    return await ctx.db.get(userId); // Return updated user
  },
});

export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 1. Verify Authentication
    const adminId = await getAuthUserId(ctx);
    if (!adminId) {
      throw new ConvexError("Not authenticated");
    }

    const admin = await ctx.db.get(adminId);
    if (!admin || admin.role !== "admin") {
      throw new ConvexError("Unauthorized - Only admins can delete users");
    }

    // 2. Prevent Selft-Deletion
    if (adminId === args.userId) {
      throw new ConvexError("You cannot delete your own account");
    }

    // 3. Check if user to be deleted exists
    const userToDelete = await ctx.db.get(args.userId);
    if (!userToDelete) {
      throw new ConvexError("User not found");
    }

    // 4. Deleting related data

    // a) Sections for adviser role
    if (
      userToDelete.role === "adviser" ||
      userToDelete.role === "adviser/subject-teacher"
    ) {
      const sections = await ctx.db
        .query("sections")
        .withIndex("adviserId", (q) => q.eq("adviserId", args.userId))
        .collect();

      for (const section of sections) {
        await ctx.db.delete(section._id);
      }
    }

    // b) Subjects and Teaching Loads (if subject-teacher role)
    if (
      userToDelete.role === "subject-teacher" ||
      userToDelete.role === "adviser/subject-teacher"
    ) {
      const subjects = await ctx.db
        .query("subjectTaught")
        .withIndex("teacherId", (q) => q.eq("teacherId", args.userId))
        .collect();

      for (const subject of subjects) {
        const teachingLoads = await ctx.db
          .query("teachingLoad")
          .withIndex("subjectTaughtId", (q) =>
            q.eq("subjectTaughtId", subject._id)
          )
          .collect();

        for (const load of teachingLoads) {
          await ctx.db.delete(load._id);
        }

        await ctx.db.delete(subject._id);
      }
    }

    // 5. Delete the user account
    await ctx.db.delete(args.userId);

    return { success: true, deletedUserId: args.userId };
  },
});
