import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { gradeLevel } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";
import { asyncMap } from "convex-helpers";
import { internal } from "./_generated/api";

export const addToSection = mutation({
  args: {
    studentId: v.id("students"),
    schoolYear: v.string(),
    gradeLevel: gradeLevel,
    status: v.union(
      v.literal("enrolled"),
      v.literal("dropped"),
      v.literal("promoted"),
      v.literal("conditionally-promoted"),
      v.literal("retained")
    ),
    subjects: v.array(v.id("subjectTaught")),
    isReturning: v.boolean(),
    sectionId: v.id("sections"),
    semester: v.optional(
      v.union(v.literal("1st semester"), v.literal("2nd semester"))
    ),
  },
  handler: async (ctx, args) => {
    const adviserId = await getAuthUserId(ctx);
    if (adviserId === null) return;
    const student = await ctx.db.get(args.studentId);
    if (student === null) return;

    if (student.status === "enrolled") {
      throw new ConvexError("Student already enrolled.");
    }
    if (student.status === "graduated") {
      throw new ConvexError("Student already graduated.");
    }
    await ctx.db.insert("enrollment", {
      ...args,
    });
    await ctx.db.patch(args.studentId, {
      status: "enrolled",
    });
    await ctx.db.insert("sectionStudents", {
      sectionId: args.sectionId,
      studentId: args.studentId,
    });

    const loads = await asyncMap(args.subjects, async (subjectTaughtId) => {
      const teachingLoad = await ctx.db
        .query("teachingLoad")
        .withIndex("subjectTaughtId", (q) =>
          q.eq("subjectTaughtId", subjectTaughtId)
        )
        .filter((q) => q.eq(q.field("sectionId"), args.sectionId))
        .collect();
      return teachingLoad;
    });

    const flatLoads = loads.flat();
    const filteredLoads = flatLoads.filter((l) => l !== null);

    await asyncMap(filteredLoads, async (load) => {
      await ctx.runMutation(internal.classRecords.createClassRecords, {
        teachingLoadId: load._id,
        studentId: args.studentId,
      });
    });
  },
});

export const editSubjects = mutation({
  args: {
    enrollmentId: v.optional(v.id("enrollment")), // Optional enrollment ID to identify the enrollment record
    subjects: v.array(v.id("subjectTaught")), // Array of subject IDs to update
    studentId: v.id("students"), // ID of the student whose subjects are being modified
  },
  handler: async (ctx, args) => {
    if (!args.enrollmentId) return; // Exit if no enrollment ID is provided
    const enrollment = await ctx.db.get(args.enrollmentId); // Fetch the enrollment record
    if (enrollment === null) return; // Exit if the enrollment record does not exist
    if (enrollment.status !== "enrolled") {
      throw new ConvexError("Student not enrolled."); // Throw an error if the student is not currently enrolled
    }

    // Determine which subjects are being removed and added
    const removedSubjects = enrollment.subjects.filter(
      (subject) => !args.subjects.includes(subject)
    );
    const addedSubjects = args.subjects.filter(
      (subject) => !enrollment.subjects.includes(subject)
    );

    // Fetch teaching loads for the removed subjects
    const removedSubjectLoads = await asyncMap(removedSubjects, async (id) => {
      const load = await ctx.db
        .query("teachingLoad")
        .withIndex("subjectTaughtId", (q) => q.eq("subjectTaughtId", id))
        .collect();

      return load;
    });

    // Check if there are existing class records for the removed subjects
    const hasRecords = await asyncMap(removedSubjectLoads, async (subLoad) => {
      for (const load of subLoad) {
        const isExisting = await ctx.db
          .query("classRecords")
          .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
          .filter((q) => q.eq(q.field("teachingLoadId"), load._id))
          .unique();

        if (isExisting) {
          // Check for existing written works, performance tasks, or major exams
          const hasWW = await ctx.db
            .query("writtenWorks")
            .withIndex("by_classRecordId", (q) =>
              q.eq("classRecordId", isExisting._id)
            )
            .first();
          const hasPT = await ctx.db
            .query("performanceTasks")
            .withIndex("by_classRecordId", (q) =>
              q.eq("classRecordId", isExisting._id)
            )
            .first();
          const hasME = await ctx.db
            .query("majorExams")
            .withIndex("by_classRecordId", (q) =>
              q.eq("classRecordId", isExisting._id)
            )
            .first();
          if (hasME || hasPT || hasWW) {
            return true; // Return true if any records exist
          }
        }
        return false; // Return false if no records exist
      }
    });

    // Prevent modification if there are existing records for removed subjects
    if (hasRecords.some((record) => record)) {
      throw new ConvexError(
        "Cannot modify subjects, there are existing records."
      );
    }

    // Delete class records for removed subjects
    await asyncMap(removedSubjectLoads, async (subLoad) => {
      for (const load of subLoad) {
        const isExisting = await ctx.db
          .query("classRecords")
          .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
          .filter((q) => q.eq(q.field("teachingLoadId"), load._id))
          .unique();

        if (isExisting) {
          await ctx.db.delete(isExisting._id); // Delete the class record
        }
      }
    });

    // Fetch teaching loads for the added subjects
    const addedSubjectLoads = await asyncMap(addedSubjects, async (id) => {
      const load = await ctx.db
        .query("teachingLoad")
        .withIndex("subjectTaughtId", (q) => q.eq("subjectTaughtId", id))
        .collect();

      return load;
    });

    // Create class records for added subjects
    await asyncMap(addedSubjectLoads, async (subLoad) => {
      for (const load of subLoad) {
        const isExisting = await ctx.db
          .query("classRecords")
          .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
          .filter((q) => q.eq(q.field("teachingLoadId"), load._id))
          .unique();
        if (!isExisting) {
          await ctx.db.insert("classRecords", {
            teachingLoadId: load._id,
            studentId: args.studentId,
          });
        }
      }
    });

    // Update the enrollment record with the new subjects
    await ctx.db.patch(args.enrollmentId, {
      subjects: [
        ...enrollment.subjects.filter(
          (subject) => !removedSubjects.includes(subject)
        ),
        ...addedSubjects,
      ],
    });
  },
});

export const getBySectionId = query({
  args: {
    sectionId: v.id("sections"),
  },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollment")
      .filter((q) => q.eq(q.field("sectionId"), args.sectionId))
      .collect();
    return enrollments;
  },
});

export const dropStudent = mutation({
  args: {
    enrollmentId: v.id("enrollment"),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) throw new ConvexError("No Enrollment Found.");

    await ctx.db.patch(enrollment._id, {
      status: "dropped",
    });

    await ctx.db.patch(enrollment.studentId, {
      status: "not-enrolled",
    });
  },
});

export const isEnrolled = query({
  args: {
    enrollmentId: v.optional(v.id("enrollment")),
  },
  handler: async (ctx, args) => {
    if (!args.enrollmentId) throw new ConvexError("No enrollment ID.");

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) throw new ConvexError("No enrollment found in database.");

    return enrollment.status === "enrolled" ? true : false;
  },
});
