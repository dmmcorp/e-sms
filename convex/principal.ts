import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { ConvexError, convexToJson, v } from "convex/values";

export const getTeachers = query({
    args: {},
    handler: async (ctx) => {
        // 1. Fetch users
        const users = await ctx.db
            .query("users")
            .order("desc")
            .collect()

        // Fetch all sections once for lookup
        const allSections = await ctx.db.query("sections").collect();
        const sectionMap = new Map(allSections.map(s => [s._id, s]));

        // Fetch all sectionStudents once for student counts
        const allSectionStudents = await ctx.db.query("sectionStudents").collect();
        const studentCounts: Record<string, number> = allSectionStudents.reduce((acc, record) => {
            acc[record.sectionId] = (acc[record.sectionId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)

        // 2. Filter users by teacher roles
        const advisers = users.filter(user => user.role === "adviser")
        const adviserSubjectTeacher = users.filter(user => user.role === "adviser/subject-teacher")
        const subjectTeachers = users.filter(user => user.role === "subject-teacher")

        // 3. get advisers section
        const adviserWithSection = await Promise.all(advisers.map(async (adviser) => {
            const sections = allSections.filter(s => s.adviserId === adviser._id);
            const sectionsWithCount = sections.map(section => ({
                ...section,
                studentCount: studentCounts[section._id] || 0,
            }))

            return {
                ...adviser,
                sections: sectionsWithCount,
            }
        }))

        // 4. Get adviserSubjectTeacher section and subject taught
        const adviserWithSectionAndSubjectTaught = await Promise.all(adviserSubjectTeacher.map(async (adviser) => {
            const advisorySections = allSections.filter(s => s.adviserId === adviser._id);
            const advisorySectionsWithCount = advisorySections.map(section => ({
                ...section,
                studentCount: studentCounts[section._id] || 0,
            }));

            const subjectTaughtDocs = await ctx.db
                .query("subjectTaught")
                .withIndex("teacherId", q => q.eq("teacherId", adviser._id))
                .collect();

            const allSubjectsTaughtList = [];

            for (const st of subjectTaughtDocs) {
                const sectionsWhereSubjectIsTaught = allSections.filter(section =>
                    section.subjects?.includes(st._id)
                );

                for (const section of sectionsWhereSubjectIsTaught) {
                    allSubjectsTaughtList.push({
                        key: `${st._id}-${section._id}`,
                        subjectName: st.subjectName,
                        sectionName: section.name,
                        gradeLevel: section.gradeLevel,
                        subjectSemester: st.semester,
                        semester: section.semester,
                    });
                }
            }

            const uniqueSubjectsTaught = Array.from(new Map(allSubjectsTaughtList.map(item => [item.key, item])).values());

            return {
                ...adviser,
                sections: advisorySectionsWithCount,
                allSubjectsTaught: uniqueSubjectsTaught,
            };
        }))

        // 5. subjectTeachers with ALL subjects taught (consistent structure)
        const subjectTeacherWithAllSubjectsTaught = await Promise.all(subjectTeachers.map(async (subjectTeacher) => {
            const subjectsTaughtByTeacher = await ctx.db
                .query("subjectTaught")
                .withIndex("teacherId", q => q.eq("teacherId", subjectTeacher._id))
                .collect();

            // Create the flat list: { subjectName, sectionName } for ALL subjects taught by this teacher
            const allSubjectsTaughtList = [];
            for (const st of subjectsTaughtByTeacher) {
                const sectionsWhereSubjectIsTaught = allSections.filter(section =>
                    section.subjects?.map(String).includes(String(st._id)) // Compare as strings
                );

                for (const section of sectionsWhereSubjectIsTaught) {
                    allSubjectsTaughtList.push({
                        key: `${st._id}-${section._id}`,
                        subjectName: st.subjectName,
                        sectionName: section.name,
                        gradeLevel: section.gradeLevel,
                        subjectSemester: st.semester,
                        semester: section.semester,
                    });
                }
            }
            const uniqueSubjectsTaught = Array.from(new Map(allSubjectsTaughtList.map(item => [item.key, item])).values());

            return {
                ...subjectTeacher,
                allSubjectsTaught: uniqueSubjectsTaught,
            };
        }));

        return {
            advisers: adviserWithSection,
            adviserSubjectTeacher: adviserWithSectionAndSubjectTaught,
            subjectTeachers: subjectTeacherWithAllSubjectsTaught,
        }
    }
})

export const getPrincipal = query({
    args: {},
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) {
            throw new ConvexError("Unauthorized")
        }

        return await ctx.db.get(userId)
    }
})

export const getSectionsGroupedByGrade = query({
    args: {},
    handler: async (ctx) => {
        const sections = await ctx.db
            .query("sections")
            .order("asc")
            .collect();

        const groupedSections = sections.reduce((acc, section) => {
            const grade = section.gradeLevel;
            if (!acc[grade]) {
                acc[grade] = [];
            }

            acc[grade].push(section);
            acc[grade].sort((a, b) => a.name.localeCompare(b.name));
            return acc;
        }, {} as Record<string, Doc<"sections">[]>);

        return groupedSections;
    },
});

export const getStudentsBySection = query({
    args: { sectionId: v.id("sections") },
    handler: async (ctx, args) => {
        if (!args.sectionId) {
            return []
        }

        const sectionStudentLinks = await ctx.db
            .query("sectionStudents")
            .withIndex("by_sectionId", q => q.eq("sectionId", args.sectionId))
            .collect()

        const studentIds = sectionStudentLinks.map((link) => link.studentId)

        if (studentIds.length === 0) {
            return []
        }

        const students = await Promise.all(
            studentIds.map((studentId) => ctx.db.get(studentId))
        )

        const validStudents = students
            .filter((student): student is Doc<"students"> => student !== null)
            .sort((a, b) => {
                const lastNameComparison = a.lastName.localeCompare(b.lastName);
                if (lastNameComparison !== 0) return lastNameComparison;
                return a.firstName.localeCompare(b.firstName);
            });

        const studentsWithStatus = await Promise.all(validStudents.map(async (student) => {
            const latestEnrollment = await ctx.db
                .query("enrollment")
                .withIndex("by_studentId", q => q.eq("studentId", student._id))
                .order("desc")
                .first();

            return {
                ...student,
                currentStatus: latestEnrollment?.status || "not-enrolled",
                enrollmentId: latestEnrollment?._id,
            };
        }));

        return studentsWithStatus;
    }
})

export const getStudentStatusDetails = query({
    args: {
        studentId: v.id("students"),
        enrollmentId: v.optional(v.id("enrollment"))
    },
    handler: async (ctx, args) => {
        if (!args.studentId || !args.enrollmentId) {
            return null;
        }

        const enrollment = await ctx.db.get(args.enrollmentId);

        return {
            studentId: args.studentId,
            overallStatus: enrollment?.status ?? "Unknown",
            // Placeholder for quarterly status
            quarterlyStatus: [
                { quarter: "1st quarter", status: "N/A" },
                { quarter: "2nd quarter", status: "N/A" },
                { quarter: "3rd quarter", status: "N/A" },
                { quarter: "4th quarter", status: "N/A" },
            ],
        };
    }
})