import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { asyncMap } from "convex-helpers";
import { Doc } from "./_generated/dataModel";
import { AssessmentNoType } from "../src/lib/types";
import {
  calculateInitialGrade,
  calculatePercentageScore,
  calculateTotalScore,
  calculateWeightedScore,
  convertToTransmutedGrade,
  getTotalScore,
} from "../src/lib/utils";

export const getClassRecords = query({
  args: {},
  handler: async (ctx, args) => {
    return;
  },
});

export const createClassRecords = internalMutation({
  args: {
    teachingLoadId: v.id("teachingLoad"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const load = await ctx.db.get(args.teachingLoadId);
    if (load === null) return;

    const loadId = load._id;

    await ctx.db.insert("classRecords", {
      teachingLoadId: loadId,
      studentId: args.studentId,
    });
  },
});

export const createComponentScore = mutation({
  args: {
    classRecordId: v.optional(v.id("classRecords")),
    componentType: v.union(
      v.literal("Written Works"),
      v.literal("Performance Tasks"),
      v.literal("Major Exam")
    ),
    scores: v.array(
      v.object({
        assessmentNo: v.number(),
        score: v.number(),
      })
    ),
    learningMode: v.string(),
  },
  handler: async (ctx, args) => {
    const componentMap = {
      "Written Works": "writtenWorks",
      "Performance Tasks": "performanceTasks",
      "Major Exam": "majorExams",
    } as const;
    // Get the table name
    const componentType =
      componentMap[args.componentType as keyof typeof componentMap];
    let readyToSubmit = false;
    if (componentType && args.classRecordId) {
      const existingComponents = await ctx.db
        .query(componentType)
        .filter((q) => q.eq(q.field("classRecordId"), args.classRecordId))
        .collect();

      let ww = ctx.db
        .query("writtenWorks")
        .filter((q) => q.eq(q.field("classRecordId"), args.classRecordId));

      let pt = ctx.db
        .query("performanceTasks")
        .filter((q) => q.eq(q.field("classRecordId"), args.classRecordId));

      let me = ctx.db
        .query("majorExams")
        .filter((q) => q.eq(q.field("classRecordId"), args.classRecordId));

      for (const assessment of args.scores) {
        const existing = existingComponents.find(
          (c) => c.assessmentNo === assessment.assessmentNo
        );

        if (existing) {
          await ctx.db.patch(existing._id, {
            score: assessment.score,
          });
          const wwLength = (await ww.collect()).length;
          const ptLength = (await pt.collect()).length;
          const meLength = (await me.collect()).length;
          if (args.learningMode === "Face to face") {
            readyToSubmit = wwLength >= 1 && ptLength >= 1 && meLength >= 1;
          }
          if (args.learningMode === "Modular") {
            readyToSubmit = wwLength >= 1 && ptLength >= 1;
          }
          if (args.learningMode === "Others") {
            readyToSubmit = true;
          }
        } else {
          await ctx.db.insert(componentType, {
            classRecordId: args.classRecordId,
            assessmentNo: assessment.assessmentNo as AssessmentNoType,
            score: assessment.score,
          });

          const wwLength = (await ww.collect()).length;
          const ptLength = (await pt.collect()).length;
          const meLength = (await me.collect()).length;
          if (args.learningMode === "Face to face") {
            readyToSubmit = wwLength >= 1 && ptLength >= 1 && meLength >= 1;
          }
          if (args.learningMode === "Modular") {
            readyToSubmit = wwLength >= 1 && ptLength >= 1;
          }
          if (args.learningMode === "Others") {
            readyToSubmit = true;
          }
        }
      }

      return { readyToSubmit: readyToSubmit };
    } else {
      return { readyToSubmit: readyToSubmit };
    }
  },
});

export const saveQuarterlyGrades = mutation({
  args: {
    loadId: v.id("teachingLoad"), // ID of the teaching load
    studentId: v.optional(v.id("students")), // Optional ID of the student
    wwGradeWeights: v.number(), // Weight for Written Works grades
    ptGradeWeights: v.number(), // Weight for Performance Tasks grades
    meGradeWeights: v.number(), // Weight for Major Exam grades
    learningMode: v.string(), // Learning mode (e.g., Face to face, Modular)
  },
  handler: async (ctx, args) => {
    if (!args.studentId) return; // Return if studentId is not provided

    const teachingLoad = await ctx.db.get(args.loadId); // Fetch the teaching load by ID
    const student = await ctx.db.get(args.studentId); // Fetch the student by ID

    if (!teachingLoad || !student)
      throw new ConvexError("Unable to save grades."); // Throw error if teaching load or student is not found

    const subjectTaught = await ctx.db.get(teachingLoad.subjectTaughtId); // Fetch the subject taught by ID
    if (!subjectTaught) return; // Return if subject taught is not found

    const classRecord = await ctx.db
      .query("classRecords")
      .withIndex("by_teachingLoadId", (q) =>
        q.eq("teachingLoadId", teachingLoad._id)
      ) // Query class records by teaching load ID
      .filter((q) => q.eq(q.field("studentId"), student._id)) // Filter by student ID
      .first(); // Get the first matching record

    if (!classRecord) return; // Return if no class record is found

    const highestScores = await ctx.db
      .query("highestScores")
      .filter((q) => q.eq(q.field("teachingLoadId"), teachingLoad._id))
      .collect(); // Fetch the highest scores for the teaching load

    const wwhighestScores = highestScores
      ? highestScores.find((score) => score.componentType === "Written Works")
        ?.scores // Get highest scores for Written Works
      : undefined;

    const pthighestScores = highestScores
      ? highestScores.find(
        (score) => score.componentType === "Performance Tasks"
      )?.scores // Get highest scores for Performance Tasks
      : undefined;

    const mehighestScores = highestScores
      ? highestScores.find((score) => score.componentType === "Major Exam")
        ?.scores // Get highest scores for Major Exam
      : undefined;

    const wwTotal = getTotalScore(wwhighestScores); // Calculate total score for Written Works
    const ptTotal = getTotalScore(pthighestScores); // Calculate total score for Performance Tasks
    const meTotal = getTotalScore(mehighestScores); // Calculate total score for Major Exam

    const ww = await ctx.db
      .query("writtenWorks")
      .filter((q) => q.eq(q.field("classRecordId"), classRecord._id))
      .collect(); // Fetch Written Works scores for the class record

    const pt = await ctx.db
      .query("performanceTasks")
      .filter((q) => q.eq(q.field("classRecordId"), classRecord._id))
      .collect(); // Fetch Performance Tasks scores for the class record

    const me = await ctx.db
      .query("majorExams")
      .filter((q) => q.eq(q.field("classRecordId"), classRecord._id))
      .collect(); // Fetch Major Exam scores for the class record

    const wwTotalScore = calculateTotalScore(ww.map((w) => w.score)); // Calculate total score for Written Works
    const wwPercentageScore = calculatePercentageScore(wwTotalScore, wwTotal); // Calculate percentage score for Written Works
    const wwWeightedScore = calculateWeightedScore(
      wwPercentageScore,
      args.wwGradeWeights ?? 0
    ); // Calculate weighted score for Written Works

    const ptTotalScore = calculateTotalScore(pt.map((p) => p.score)); // Calculate total score for Performance Tasks
    const ptPercentageScore = calculatePercentageScore(ptTotalScore, ptTotal); // Calculate percentage score for Performance Tasks
    const ptWeightedScore = calculateWeightedScore(
      ptPercentageScore,
      args.ptGradeWeights ?? 0
    ); // Calculate weighted score for Performance Tasks

    const meTotalScore = calculateTotalScore(me.map((e) => e.score)); // Calculate total score for Major Exam
    const mePercentageScore = calculatePercentageScore(meTotalScore, meTotal); // Calculate percentage score for Major Exam
    const meWeightedScore = calculateWeightedScore(
      mePercentageScore,
      args.meGradeWeights ?? 0
    ); // Calculate weighted score for Major Exam

    const initialGrade = calculateInitialGrade(
      wwWeightedScore,
      ptWeightedScore,
      meWeightedScore
    ); // Calculate the initial grade based on weighted scores

    const transmutedGrade = convertToTransmutedGrade(
      initialGrade,
      subjectTaught.gradeLevel,
      args.learningMode,
      subjectTaught.category
    ); // Convert the initial grade to a transmuted grade

    if (!classRecord) throw new ConvexError("No class record found."); // Throw error if no class record is found

    await ctx.db.patch(classRecord._id, {
      needsIntervention: transmutedGrade <= 74 ? true : false, // Set intervention flag if grade is 74 or below
      quarterlyGrade: transmutedGrade, // Save the transmuted grade as the quarterly grade
    }); // Update the class record with the calculated grades
  },
});

// Mutation to save intervention grade for a class record
export const saveInterventionGrade = mutation({
  args: {
    id: v.optional(v.id("classRecords")), // Optional ID of the class record
    remarks: v.string(), // Remarks for the intervention
    interventionUsed: v.array(v.string()), // Array of interventions used
    interventionGrade: v.number(), // Grade achieved after intervention
  },
  handler: async (ctx, args) => {
    if (!args.id) return; // Return if no class record ID is provided

    const classRecord = await ctx.db.get(args.id); // Fetch the class record by ID

    if (classRecord) {
      // If the class record exists, update it with the intervention details
      await ctx.db.patch(classRecord._id, {
        interventionGrade: args.interventionGrade, // Save the intervention grade
        interventionUsed: args.interventionUsed, // Save the interventions used
        interventionRemarks: args.remarks, // Save the remarks for the intervention
      });
    }
  },
});
