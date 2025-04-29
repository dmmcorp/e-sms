import { ConvexError, v } from "convex/values";
import { internalQuery, mutation, query, QueryCtx } from "./_generated/server";
import { asyncMap } from "convex-helpers";
import { gradeLevel } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";
import { OrganizedGrade, Quarter, QuarterGrades, StudentEnrollmentSection } from "../src/lib/types";

export const getStudents = query({
    args: {
        sectionId: v.optional(v.id('sections'))
    },
    handler: async (ctx, args) => {
        const adviserId = await getAuthUserId(ctx);

        let section: Doc<'sections'> | null = null;

        if (!args.sectionId) {
            const sections = await ctx.db
                .query('sections')
                .filter(q => q.eq(q.field('adviserId'), adviserId))
                .order('desc')
                .collect();
            section = sections.sort((a, b) => b.schoolYear.localeCompare(a.schoolYear))[0];
            if (!section) {
                throw new Error("No section found for the current adviser.");
            }
        } else {
            section = await ctx.db.get(args.sectionId);

            if (!section) {
                throw new Error("Section not found.");
            }
        }

        const students = await ctx.db
            .query('students')
            .filter(q => q.eq(q.field('isArchived'), false))
            .filter(q => q.eq(q.field('enrollingIn'), section.gradeLevel))
            .order('desc')
            .collect();

        return students;
    }
})
export const getSectionStudents = query({
    args: {
        sectionId: v.id('sections')
    },
    handler: async (ctx, args) => {
        const sectionStudents = await ctx.db
            .query('sectionStudents')
            .filter(q => q.eq(q.field('sectionId'), args.sectionId))
            .collect();

        const studentGrades = await Promise.all(
            sectionStudents.map(async (sectionStudent) => {
                const student = await ctx.db.get(sectionStudent.studentId);
                if (!student) return null;
                const section = await ctx.db.get(sectionStudent.sectionId)
                if(!section) return null

                const enrollment = await ctx.db.query('enrollment')
                    .withIndex('by_studentId', q => q.eq('studentId', student._id))
                    .filter(q => q.eq(q.field('sectionId'), sectionStudent.sectionId))
                    .unique()

                return {
                    ...student,
                    sectionStudentId: sectionStudent._id,
                    enrollment: enrollment,
                    section: section
                    // grades: gradesWithTeachingLoad
                };
            })
        );

        const filteredStudents = studentGrades.filter(s => s != null)

        return filteredStudents;
    }
});


export const getStudentGrades = query({
    args: {
        studentId: v.id('students'),

    },
    handler: async (ctx, args) => {
        const grades = await ctx.db
            .query('classRecords')
            .filter(q => q.eq(q.field('studentId'), args.studentId))
            .collect();

        const gradesWithTeachingLoad = await Promise.all(
            grades.map(async (grade) => {
                const teachingLoad = await ctx.db.get(grade.teachingLoadId);
                return {
                    ...grade,
                    teachingLoad: teachingLoad ? teachingLoad : null
                };
            })
        );

        return gradesWithTeachingLoad
    }
})

export const add = mutation({
    args: {
        lastName: v.string(),
        firstName: v.string(),
        middleName: v.string(),
        sex: v.union(v.literal('male'), v.literal('female')),
        lrn: v.string(),
        dateOfBirth: v.string(),
        elementary: v.object({
            genAve: v.string(),
            school: v.string(),
            address: v.string(),
            schoolId: v.string()
        }),
        juniorHigh: v.optional(v.object({
            genAve: v.string(),
            school: v.string(),
            address: v.string(),
        })),
        juniorHighDateOfAdmission: v.string(),
        alsRating: v.optional(v.string()),
        enrollingIn: gradeLevel
    },
    handler: async (ctx, args) => {
        const isExistingStudent = await ctx.db.query('students').filter(q => q.eq(q.field('lrn'), args.lrn)).first()

        if (isExistingStudent !== null) {
            throw new ConvexError(`Student with the lrn:${isExistingStudent.lrn} is already exist.`)
        } else {
            await ctx.db.insert('students', {
                ...args,
                status: "not-enrolled",
                isArchived: false,
            })
        }

    }
})

export const edit = mutation({
    args: {
        studentId: v.optional(v.id('students')),
        lastName: v.string(),
        firstName: v.string(),
        middleName: v.string(),
        sex: v.union(v.literal('male'), v.literal('female')),
        lrn: v.string(),
        dateOfBirth: v.string(),
        elementary: v.object({
            genAve: v.string(),
            school: v.string(),
            address: v.string(),
        }),
        juniorHigh: v.object({
            genAve: v.string(),
            school: v.string(),
            address: v.string(),
        }),
        juniorHighDateOfAdmission: v.string(),
        alsRating: v.optional(v.string()),
        enrollingIn: gradeLevel
    },
    handler: async (ctx, args) => {
        if (!args.studentId) return undefined;
        const student = await ctx.db.get(args.studentId)

        if (student === null) {
            throw new ConvexError('No student data found.')
        }
        await ctx.db.patch(student._id, {
            lastName: args.lastName,
            firstName: args.firstName,
            middleName: args.middleName,
            sex: args.sex,
            lrn: args.lrn,
            dateOfBirth: args.dateOfBirth,
            elementary: {
                genAve: args.elementary.genAve,
                school: args.elementary.school,
                address: args.elementary.address,
            },
            juniorHigh: {
                genAve: args.juniorHigh.genAve,
                school: args.juniorHigh.school,
                address: args.juniorHigh.address,
            },
            juniorHighDateOfAdmission: args.juniorHighDateOfAdmission,
            alsRating: args.alsRating,
            enrollingIn: args.enrollingIn
        })
    }
})

export const archivedStudent = mutation({
    args: {
        studentId: v.id('students')
    },
    handler: async (ctx, args) => {
        const student = await ctx.db.get(args.studentId)

        if (student === null) return

        await ctx.db.patch(student._id, {
            isArchived: true
        })
    }
})

export const getStudentById = query({
    args: {
        studentId: v.optional(v.id('students'))
    },
    handler: async (ctx, args) => {
        if (!args.studentId) return undefined
        const student = await ctx.db.get(args.studentId)
        if (student === null) return undefined
        const enrollments = await ctx.db.query('enrollment').filter(q => q.eq(q.field('studentId'), args.studentId)).order('desc').collect();
        
        const enrollmentWithSection = await asyncMap(enrollments, async (enrollment) => {
            const section = await ctx.db.get(enrollment.sectionId)
            if (section === null) return undefined
            
            const selectedSubjects = await asyncMap(enrollment.subjects, async (id) => {
                const subjectTaught = await ctx.db.get(id)
                return {
                    subject: subjectTaught,
                }
            })
            const sectionSub = section.subjects ?? []

            const sectionSubjects = await asyncMap(sectionSub, async (id) => {
                const subjectTaught = await ctx.db.get(id)
                return {
                    subject: subjectTaught,
                }
            })

            return {
                ...enrollment,
                section: section,
                subjectsWithDetails: selectedSubjects,
                sectionSubjects: sectionSubjects,
            }
        })

        const currentSection = enrollmentWithSection.filter(e => e !== undefined).find(e => e.status === "enrolled")
        return {
            ...student,
            enrollment: enrollmentWithSection.filter(e => e !== undefined),
            currentSection: currentSection
        }
    }
})

export const sectionStudents = query({
    args: {
        sectionId: v.optional(v.id('sections')),
        teachingLoadId: v.id('teachingLoad')
    },
    handler: async (ctx, args) => {
        if (!args.sectionId) return undefined;

        const initStudents = await ctx.db.query('sectionStudents').filter((q) => q.eq(q.field('sectionId'), args.sectionId)).collect()

        const students = await asyncMap(initStudents, async (data) => {

            const student = await ctx.db.get(data.studentId)
            if (student === null) return null;

            const classRecord = await ctx.db.query('classRecords')
                .withIndex('by_teachingLoadId', q => q.eq('teachingLoadId', args.teachingLoadId))
                .filter(q => q.eq(q.field('studentId'), student._id))
                .first()

            if (classRecord === null) return null;
            // Fetching the assessment data for the student

            const written = await ctx.db.query('writtenWorks')
                .withIndex("by_classRecordId", q => q.eq("classRecordId", classRecord._id))
                .collect();

            const performance = await ctx.db.query('performanceTasks')
                .withIndex("by_classRecordId", q => q.eq("classRecordId", classRecord._id))
                .collect();

            const exam = await ctx.db.query('majorExams')
                .withIndex("by_classRecordId", q => q.eq("classRecordId", classRecord._id))
                .collect();

            const sortedWritten = written.sort((a, b) => a.assessmentNo - b.assessmentNo)
            const sortedPerformance = performance.sort((a, b) => a.assessmentNo - b.assessmentNo)
            const sortedExam = exam.sort((a, b) => a.assessmentNo - b.assessmentNo)
            const isSubmitted = classRecord.needsIntervention !== undefined && classRecord.needsIntervention !== null;

            const enrollment = await ctx.db.query('enrollment')
            .filter(q=> q.eq(q.field('studentId'), student._id ))
            .filter(q=> q.eq(q.field('sectionId'), data.sectionId ))
            .unique()
            
            if(enrollment === null) return null;
          
            return {
                ...student,
                enrollment: enrollment,
                written: sortedWritten,
                performance: sortedPerformance,
                exam: sortedExam,
                classRecord: classRecord,
                isSubmitted: isSubmitted
            }
        });

        const filteredStudents = students.filter(s => s !== null)

        return filteredStudents

    }
});

export const needsIntervention = query({
    args: {
        sectionId: v.optional(v.id('sections')),
        teachingLoadId: v.id('teachingLoad')
    },
    handler: async (ctx, args) => {
        if (!args.sectionId) return undefined;
        const initStudents = await ctx.db.query('sectionStudents').filter((q) => q.eq(q.field('sectionId'), args.sectionId)).collect();
        const students = await asyncMap(initStudents, async (data) => {
            const student = await ctx.db.get(data.studentId)
            if (student === null) return null;

            const classRecord = await ctx.db.query('classRecords')
                .withIndex('by_teachingLoadId', q => q.eq('teachingLoadId', args.teachingLoadId))
                .filter(q => q.eq(q.field('studentId'), student._id))
                .filter(q => q.eq(q.field('needsIntervention'), true))
                .first()

            return {
                ...student,
                classRecord: classRecord,
            }
        })

        const filteredStudents = students.filter(s => s?.classRecord !== null).filter(s => s?.classRecord?.needsIntervention === true)

        return filteredStudents
    }
})

export const getStudentSection = query({
    args:{
        sectionStudentId: v.optional(v.id('sectionStudents'))
    },
    handler: async(ctx, args) =>{
        if(!args.sectionStudentId) return null
        const data = await getStudentGradesData(ctx, args.sectionStudentId)
        return data;
    }
})

export const getSubjects = query({
    args: {
        sectionSubjects: v.optional(v.array(v.id('subjectTaught'))),
        studentId: v.id('students')
    },
    handler: async (ctx, args) => {

        const subjectsWithGrades = await getStudentSubjects(args.sectionSubjects, ctx, args.studentId);
        const filterSubjectsWithGrades = subjectsWithGrades?.filter(s => s !== null)
        return filterSubjectsWithGrades;
    }
})

const getStudentGradesData = async (
    ctx: QueryCtx, // Convex context
    sectionStudentId: Id<'sectionStudents'> // ID of the section student
) => {
    const sectionStudent = await ctx.db.get(sectionStudentId);
    if (!sectionStudent) return null;
    const student = await ctx.db.get(sectionStudent.studentId);
    if (!student) return null;
    const section = await ctx.db.get(sectionStudent.sectionId)
    if (!section) return null;
    const adviser = await ctx.db.get(section.adviserId)
    if (!adviser) return null;

    if(section.subjects)
    await asyncMap(section.subjects, async(s)=>{
        const subjectTaught = await ctx.db.get(s)
    })

    const classRecords = await ctx.db.query("classRecords")
    .filter(q => q.eq(q.field('studentId'), student._id))
    .collect()

    return {
        ...student,
        sectionStudentId: sectionStudent._id,
        sectionDoc: section,
        adviser: adviser,
        classRecords: classRecords,
    };
}

// Function to retrieve subjects along with grades and interventions for a student in a specific section
const getStudentSubjects = async (
    sectionSubjects: Id<'subjectTaught'>[] | undefined, // List of subject IDs for the section
    ctx: QueryCtx, // Convex context
    studentId: Id<'students'> // ID of the student
) => {
    if (!sectionSubjects) return;
    // Get all class records for the student
    const classRecords = await ctx.db.query('classRecords')
        .withIndex('by_studentId', (q)=> q.eq('studentId',studentId))
        .collect();

    // Get all teaching loads for these class records
    const classRecordsWithTeachingLoad = await asyncMap(classRecords, async (record) => {
        const load = await ctx.db.get(record.teachingLoadId);
        if (!load) return null;

        return {
            ...record,
            teachingLoad: load
        };
    });

    // Filter out null values from the mapped class records
    const filteredCR = classRecordsWithTeachingLoad.filter(r => r !== null);

    // Process each subject
    const subjectWithGrades = await asyncMap(sectionSubjects, async (subjectId) => {
        const subject = await ctx.db.get(subjectId);
        if (!subject) return null;


        // Initialize grades object
        const grades: QuarterGrades = {
            "1st": undefined,
            "2nd": undefined,
            "3rd": undefined,
            "4th": undefined,
        };

        // Initialize interventions object
        const interventions: {
            [key in Quarter]?: {
                grade: number;
                used: string[];
                remarks: string;
            };
        } = {
            "1st": undefined,
            "2nd": undefined,
            "3rd": undefined,
            "4th": undefined
        };

        // If this is MAPEH, we need to handle its components
        if (subject.subjectName.toLowerCase() === 'mapeh') {
            // Get all teaching loads for this subject
            const teachingLoads = await ctx.db.query('teachingLoad')
                .withIndex('subjectTaughtId', q => q.eq('subjectTaughtId', subjectId))
                .collect();

            // Group teaching loads by component
            const componentLoads = teachingLoads.reduce((acc, load) => {
                if (load.subComponent) {
                    if (!acc[load.subComponent]) {
                        acc[load.subComponent] = [];
                    }
                    acc[load.subComponent].push(load);
                }
                return acc;
            }, {} as Record<string, typeof teachingLoads>);

            // Create a subject entry for each MAPEH component
            const components = await Promise.all(
                Object.entries(componentLoads).map(async ([component, loads]) => {
                    const componentGrades: QuarterGrades = {
                        "1st": undefined,
                        "2nd": undefined,
                        "3rd": undefined,
                        "4th": undefined,
                    };

                    const componentInterventions: typeof interventions = {
                        "1st": undefined,
                        "2nd": undefined,
                        "3rd": undefined,
                        "4th": undefined
                    };

                    // Process each load for this component
                    for (const load of loads) {
                        const quarter = load.quarter?.replace(' quarter', '') as Quarter;
                        const record = filteredCR.find(r => r.teachingLoad._id === load._id);

                        if (record && quarter) {
                            componentGrades[quarter] = record.quarterlyGrade;
                            if (record.needsIntervention) {
                                componentInterventions[quarter] = {
                                    grade: record.interventionGrade ?? 0,
                                    used: record.interventionUsed || [],
                                    remarks: record.interventionRemarks || ''
                                };
                            }
                        }
                    }
                    return {
                        _id: `${subjectId}-${component}`,
                        subjectName: component,
                        grades: componentGrades,
                        interventions: componentInterventions,
                        isMapehComponent: true,
                    };
                })
            );
            return components;
        } else {
            // Populate grades and interventions for each quarter
            for (const record of filteredCR) {
                if (record.teachingLoad.subjectTaughtId === subjectId) {
                    const quarter = record.teachingLoad.quarter?.replace(' quarter', '') as Quarter;
                    if (quarter && quarter in grades) {
                        // Assign the quarterly grade
                        grades[quarter] = record.quarterlyGrade;

                        // If the record indicates intervention, populate the intervention details
                        if (record.needsIntervention) {
                            interventions[quarter] = {
                                grade: record.interventionGrade ?? 0,
                                used: record.interventionUsed || [],
                                remarks: record.interventionRemarks || ''
                            };
                        }
                    }
                }
            }

            // Return regular subject
            return {
                _id: subject._id,
                subjectName: subject.subjectName,
                category: subject.category,
                semester: subject.semester,
                grades,
                interventions
            };
        }
    });

    // Flatten the array since MAPEH subjects return an array of components
    return subjectWithGrades.flat().filter(Boolean);
};

// Function to retrieve subjects along with grades and interventions for a student in a specific section
const getSectionSubjects = async (
    ctx: QueryCtx,
    sectionSubjects: Id<'subjectTaught'>[] | undefined, // List of subject IDs for the section
    studentId: Id<'students'> // ID of the student
) => {
    if (!sectionSubjects) return;

    // Fetch all class records for the student
    const classsRecords = await ctx.db.query('classRecords').withIndex('by_studentId', (q) => q.eq('studentId', studentId)).collect();

    // Map class records to include teaching load details
    const ClassRecordsWithTeachingLoad = await asyncMap(classsRecords, async (record) => {
        const load = await ctx.db.get(record.teachingLoadId);
        if (!load) return null;

        return {
            ...record,
            teachingLoad: load
        };
    });

    // Filter out null values from the mapped class records
    const filteredCR = ClassRecordsWithTeachingLoad.filter(r => r !== null);

    // Map section subjects to include grades and interventions
    const subjectWithGrades = await asyncMap(sectionSubjects, async (subjectId) => {
        const subject = await ctx.db.get(subjectId);
        if (!subject) return null;

        // Define the type for grades
        type QuarterGrades = {
            "1st": number | undefined;
            "2nd": number | undefined;
            "3rd": number | undefined;
            "4th": number | undefined;
        };

        // Define the type for interventions
        type QuarterInterventions = {
            "1st": {
                grade: number | undefined;
                used: string[] | undefined;
                remarks: string | undefined;
            };
            "2nd": {
                grade: number | undefined;
                used: string[] | undefined;
                remarks: string | undefined;
            };
            "3rd": {
                grade: number | undefined;
                used: string[] | undefined;
                remarks: string | undefined;
            };
            "4th": {
                grade: number | undefined;
                used: string[] | undefined;
                remarks: string | undefined;
            };
        };

        // Initialize the grades object
        const grades: QuarterGrades = {
            "1st": undefined,
            "2nd": undefined,
            "3rd": undefined,
            "4th": undefined,
        };

        // Initialize the interventions object
        const interventions: QuarterInterventions = {
            "1st": { grade: undefined, used: undefined, remarks: undefined },
            "2nd": { grade: undefined, used: undefined, remarks: undefined },
            "3rd": { grade: undefined, used: undefined, remarks: undefined },
            "4th": { grade: undefined, used: undefined, remarks: undefined }
        };

        // Populate grades and interventions for each quarter
        for (const record of filteredCR) {
            if (record.teachingLoad.subjectTaughtId === subjectId) {
                const quarter = record.teachingLoad.quarter?.replace(' quarter', '') as keyof QuarterGrades;
                if (quarter && quarter in grades) {
                    grades[quarter] = record.quarterlyGrade;

                    if (record.needsIntervention) {
                        interventions[quarter] = {
                            grade: record.interventionGrade,
                            used: record.interventionUsed,
                            remarks: record.interventionRemarks
                        };
                    }
                }
            }
        }

        // Return the subject along with grades and interventions
        return {
            ...subject,
            grades: grades,
            interventions: interventions
        };
    });

    // Return the list of subjects with grades and interventions
    return subjectWithGrades;
};


// Query to get student grades by enrollment
export const getStudentSubjectsByEnrollment = query({
    args: {
        sectionStudentId: v.id('sectionStudents'), // ID of the section student
        isSHS: v.boolean()
    },
    handler: async (ctx, args) => {
        // Fetch the section student document
        const sectionStudent = await ctx.db.get(args.sectionStudentId);
        if (!sectionStudent) return null;

        // Fetch the student document
        const student = await ctx.db.get(sectionStudent.studentId);
        if (student === null) return null;

        // Fetch the current section document
        const currentSection = await ctx.db.get(sectionStudent.sectionId);
        if (currentSection === null) return null;

        // Fetch all enrollments for the student, ordered by ascending date
        const enrollments = await ctx.db.query('enrollment')
            .withIndex('by_studentId', (q) => q.eq('studentId', student._id))
            .order('asc')
            .collect();

        // Map through the enrollments to fetch section and grade data
        const studentEnrollments = await asyncMap(enrollments, async (e) => {
            // Fetch the section document for the enrollment
            const section = await ctx.db.get(e.sectionId);
            if (section === null) return null;
            const adviser = await ctx.db.get(section?.adviserId);
            const sectionStudent = await ctx.db.query('sectionStudents').
                withIndex('by_sectionId', (q) => q.eq('sectionId', section._id))
                .filter(q => q.eq(q.field('studentId'), student._id))
                .unique()
            if (sectionStudent === null) return null;
            if (args.isSHS && section.gradeLevel !== "Grade 11" && section.gradeLevel !== "Grade 12") return null;
            if (!args.isSHS && (section.gradeLevel === "Grade 11" || section.gradeLevel === "Grade 12")) return null;

            return {
                ...section,
                adviser: adviser,
                sectionSubjects: section.subjects,
                sectionStudentId: sectionStudent._id
            };
        });

        // Filter out null values from the mapped enrollments
        const filteredStudentGrades = studentEnrollments.filter(e => e !== null);

        const gradeLevels = [
            "Grade 7",
            "Grade 8",
            "Grade 9",
            "Grade 10",
            "Grade 11 - 1st semester",
            "Grade 11 - 2nd semester",
            "Grade 12 - 1st semester",
            "Grade 12 - 2nd semester"
        ];

        // Create a map for quick lookup by gradeLevel
        const gradeLevelMap: Record<string, StudentEnrollmentSection> = {};
        filteredStudentGrades.forEach(e => {
            if (e && e.gradeLevel) {
                gradeLevelMap[e.gradeLevel] = e;
            }
        });

        // Build the result array, ensuring all grade levels are present
        const organizedGrades: OrganizedGrade[] = gradeLevels.map(level => {
            if (gradeLevelMap[level]) {
            const data = gradeLevelMap[level];
            if ((level.includes("Grade 11") || level.includes("Grade 12")) && data.semester) {
                const semester = level.includes("1st semester") ? "1st semester" : "2nd semester";
                if (data.semester === semester) {
                return {
                    gradeLevel: level,
                    data: data
                };
                }
            } else if (!level.includes("semester")) {
                return { gradeLevel: level, data: gradeLevelMap[level] };
            }
            }
            return { gradeLevel: level, data: undefined };
        });

        // Return the current section and the filtered student grades
        return {
            currentSection: currentSection,
            studentEnrollments: organizedGrades,
        };
    }
});

export const getStudentSectionId = query({
    args: {
        studentId: v.id('students')
    },
    handler: async (ctx, args) => {
        const sectionStudent = await ctx.db
            .query('sectionStudents')
            .withIndex('by_studentId', q => q.eq('studentId', args.studentId))
            .first();

        return sectionStudent?._id;
    }
});