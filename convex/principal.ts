import { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const getTeachers = query({
    args: {},
    handler: async (ctx) => {
        // 1. Fetch users
        const users = await ctx.db
            .query("users")
            .order("desc")
            .collect()

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
            const sections = await ctx.db
                .query("sections")
                .filter(q => q.eq(q.field("adviserId"), adviser._id))
                .collect()

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
            const sections = await ctx.db
                .query("sections")
                .filter(q => q.eq(q.field("adviserId"), adviser._id))
                .collect()

            const sectionsWithSubjects = await Promise.all(sections.map(async (section) => {
                let fetchedSubjects: (Doc<"subjectTaught"> | null)[] = []
                if (section.subjects && section.subjects.length > 0) {
                    fetchedSubjects = await Promise.all(section.subjects.map(async (subjectId) => {
                        const subjectTaught = await ctx.db.get(subjectId)
                        return subjectTaught
                    }))
                }

                return {
                    id: section._id,
                    name: section.name,
                    gradeLevel: section.gradeLevel,
                    schoolYear: section.schoolYear,
                    semester: section.semester,
                    subjects: fetchedSubjects.filter(subject => subject !== null),
                    studentCount: studentCounts[section._id] || 0,
                }
            }))

            return {
                ...adviser,
                sections: sectionsWithSubjects,

            }
        }))

        // 5. subjectTeachers with subject taught
        const subjectTeacherWithSubjectsAndSections = await Promise.all(subjectTeachers.map(async (subjectTeacher) => {
            const subjectsTaughtByTeacher = await ctx.db
                .query("subjectTaught")
                .withIndex("teacherId", q => q.eq("teacherId", subjectTeacher._id))
                .collect()

            const allSections = await ctx.db
                .query("sections")
                .collect()

            const subjectsWithTheirSections = subjectsTaughtByTeacher.map((subjectTaught) => {
                const sectionsWhereTaught = allSections.filter(section =>
                    section.subjects?.includes(subjectTaught._id)
                );

                return {
                    ...subjectTaught,
                    sections: sectionsWhereTaught.map(s => ({
                        id: s._id,
                        name: s.name,
                        gradeLevel: s.gradeLevel,
                        schoolYear: s.schoolYear,
                        semester: s.semester,
                        studentCount: studentCounts[s._id] || 0,
                    }))
                }
            });


            return {
                ...subjectTeacher,
                subjects: subjectsWithTheirSections,
            }
        }))

        return {
            advisers: adviserWithSection,
            adviserSubjectTeacher: adviserWithSectionAndSubjectTaught,
            subjectTeachers: subjectTeacherWithSubjectsAndSections,
        }
    }
})