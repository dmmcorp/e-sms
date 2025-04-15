import { internalQuery, mutation, query, QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { convexToJson, v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { modules } from "../src/lib/constants";

const moduleNameValidator = v.union(
    ...modules.map(m => v.literal(m.id))
);

const moduleTableMap: Record<string, string> = {
    users: "users",
    systemSettings: "systemSettings",
    students: "students",
    enrollments: "enrollment",
    sections: "sections",
    subjects: "subjectThought",
    grades: "classRecords",
};

// helper functions
const fetchEnrichmentData = async (ctx: QueryCtx) => {
    // Get all users for adviser mapping
    const users = await ctx.db.query("users").collect();
    const userMap = new Map(users.map(user => [user._id, user.fullName]));

    // Count students per section
    const enrollments = await ctx.db.query("enrollment").collect();
    const sectionCounts = enrollments.reduce((counts, enrollment) => {
        const sectionId = enrollment.sectionId;
        counts.set(sectionId, (counts.get(sectionId) || 0) + 1);
        return counts;
    }, new Map());

    return {
        userMap,
        sectionCounts
    };
};

const transformForExport = (table: string, data: any[], enrichmentData?: any) => {
    const { userMap, sectionCounts } = enrichmentData || { userMap: new Map(), sectionCounts: new Map() };

    const removeInternalFields = (record: any) => {
        const { _creationTime, _id, ...rest } = record;
        return { ...rest, _creationTime, _id }; // Keep these for reference during transformation
    };

    let transformedData = data.map(removeInternalFields);

    switch (table) {
        case "sections":
            return transformedData.map(section => ({
                "Section Name": section.name,
                "Grade Level": section.gradeLevel,
                "School Year": section.schoolYear,
                "Adviser": userMap.get(section.adviserId) || "Not Assigned",
                "Students Count": sectionCounts.get(section._id) || 0,
                "Created": new Date(section._creationTime).toLocaleDateString(),
            }));

        case 'students':
            return transformedData.map(student => ({
                "Student Name": `${student.lastName}, ${student.firstName} ${student.middleName || ''}`,
                "LRN": student.lrn,
                "Gender": student.sex,
                // "Grade Level": student.currentGradeLevel,
                // "Section": student.sectionName || "Not Enrolled",
                // "Contact Number": student.contactNumber || "N/A",
                // "Address": student.address || "N/A",
                // "Guardian": student.guardianName || "N/A",
            }));

        case 'users':
            // Example transformation for users
            return transformedData.map(user => ({
                "Name": user.name,
                "Email": user.email,
                "Role": user.role,
                "Status": user.isActive ? "Active" : "Inactive",
            }));

        default:
            return transformedData.map(({ _creationTime, _id, ...rest }) => rest);
    }
};


export const fetchData = internalQuery({
    args: {
        tableName: v.string(),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query(args.tableName as any);

        // Apply date filtering if provided
        if (args.startDate || args.endDate) {
            query = query.filter((q) => {
                const creationTime = q.field("_creationTime");

                if (args.startDate && args.endDate) {
                    const endOfDay = args.endDate + (24 * 60 * 60 * 1000 - 1);
                    return q.and(
                        q.gte(creationTime, args.startDate),
                        q.lte(creationTime, endOfDay)
                    );
                } else if (args.startDate) {
                    return q.gte(creationTime, args.startDate);
                } else if (args.endDate) {
                    const endOfDay = args.endDate + (24 * 60 * 60 * 1000 - 1);
                    return q.lte(creationTime, endOfDay);
                }


                return q.eq(1, 1);
            });
        }

        return await query.collect();
    },
});

export const fetchRelatedTeachingLoads = internalQuery({
    args: {
        subjectIds: v.array(v.id("subjectTaught")),
    },
    handler: async (ctx, args) => {
        if (args.subjectIds.length === 0) return [];

        const teachingLoads = await Promise.all(
            args.subjectIds.map(id =>
                ctx.db
                    .query("teachingLoad")
                    .withIndex("subjectTaughtId", q => q.eq("subjectTaughtId", id))
                    .collect()
            )
        );

        return teachingLoads.flat()
    },
});

export const fetchRelatedScores = internalQuery({
    args: {
        classRecordIds: v.array(v.id("classRecords")),
    },
    handler: async (ctx, args) => {
        if (args.classRecordIds.length === 0) {
            return { writtenWorks: [], performanceTasks: [], majorExams: [] };
        }

        const [writtenWorks, performanceTasks, majorExams] = await Promise.all([
            Promise.all(args.classRecordIds.map(id => ctx.db
                .query("writtenWorks")
                .filter(q => q.eq(q.field("classRecordId"), id))
                .collect()
            )).then(res => res.flat()),

            Promise.all(args.classRecordIds.map(id => ctx.db
                .query("performanceTasks")
                .filter(q => q.eq(q.field("classRecordId"), id))
                .collect()
            )).then(res => res.flat()),

            Promise.all(args.classRecordIds.map(id => ctx.db
                .query("majorExams")
                .filter(q => q.eq(q.field("classRecordId"), id))
                .collect()
            )).then(res => res.flat())
        ])

        return { writtenWorks, performanceTasks, majorExams }
    }
});

export const exportData = mutation({
    args: {
        modules: v.array(moduleNameValidator),
        format: v.union(v.literal("json"), v.literal("csv")),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Authentication check
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new ConvexError("Not authenticated");
        }

        // Verify admin role
        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") {
            throw new ConvexError("Unauthorized: Only admins can export data");
        }

        // Validate inputs
        if (args.modules.length === 0) {
            throw new ConvexError("No modules selected for export");
        }

        const enrichmentData = await fetchEnrichmentData(ctx);

        let startTimestamp = args.startDate;
        let endTimestamp = args.endDate;

        const exportData: Record<string, any[]> = {};
        const relatedData: Record<string, any> = {};

        for (const moduleName of args.modules) {
            const tableName = moduleTableMap[moduleName];

            if (!tableName) {
                console.warn(`No table mapping found for module: ${moduleName}`);
                continue;
            }

            try {
                const data = await ctx.runQuery(internal.backup.fetchData, {
                    tableName,
                    startDate: startTimestamp,
                    endDate: endTimestamp,
                });

                // Store raw data for now
                exportData[moduleName] = data;

                // Fetch related data
                if (moduleName === 'subjects' && data.length > 0) {
                    const subjectIds = data.map((d: Doc<"subjectTaught">) => d._id);
                    relatedData.teachingLoads = await ctx.runQuery(internal.backup.fetchRelatedTeachingLoads, {
                        subjectIds
                    });
                }

                if (moduleName === 'grades' && data.length > 0) {
                    const classRecordIds = data.map((d: Doc<"classRecords">) => d._id);
                    relatedData.scores = await ctx.runQuery(internal.backup.fetchRelatedScores, {
                        classRecordIds
                    });
                }
            } catch (error: any) {
                console.error(`Error fetching data for module ${moduleName}:`, error);
                throw new ConvexError(`Failed to fetch data for ${moduleName}: ${error.message}`);
            }
        }

        if (relatedData.teachingLoads) {
            exportData.teachingLoads = relatedData.teachingLoads;
        }

        if (relatedData.scores) {
            exportData.writtenWorks = relatedData.scores.writtenWorks;
            exportData.performanceTasks = relatedData.scores.performanceTasks;
            exportData.majorExams = relatedData.scores.majorExams;
        }

        const humanReadableData: Record<string, any[]> = {};
        for (const [key, data] of Object.entries(exportData)) {
            const tableName = moduleTableMap[key] || key;
            humanReadableData[key] = transformForExport(tableName, data, enrichmentData);
        }

        try {
            if (args.format === "json" || args.format === "csv") {
                return JSON.stringify(humanReadableData, null, 2);
            } else {
                throw new ConvexError("Unsupported export format. Only JSON and CSV are supported.");
            }
        } catch (error) {
            console.error("Error formatting export data:", error);
            throw new ConvexError(`Failed to format export data: ${error}`);
        }
    }
})