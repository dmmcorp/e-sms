import { gradeLevels } from "../src/lib/constants";
import { query } from "./_generated/server";

export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        // 1. Count Teachers
        const teacherRoles = ["adviser", "subject-teacher", "adviser/subject-teacher"];
        const users = await ctx.db.query("users").collect();
        const totalTeachers = users.filter(user => teacherRoles.includes(user.role)).length;

        // 2. Count Students per Grade Level (using enrollment table)
        const currentEnrollments = await ctx.db
            .query("enrollment")
            .filter(q => q.eq(q.field("status"), "enrolled"))
            .collect();

        const studentsPerGrade: Record<string, number> = {};
        gradeLevels.forEach(grade => {
            studentsPerGrade[grade] = 0;
        });

        // Count students in each grade based on their current enrollment
        currentEnrollments.forEach(enrollment => {
            if (studentsPerGrade.hasOwnProperty(enrollment.gradeLevel)) {
                studentsPerGrade[enrollment.gradeLevel]++;
            }
        });

        return {
            totalTeachers,
            studentsPerGrade,
        };
    },
});