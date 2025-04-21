import { ConvexError, v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { asyncMap } from "convex-helpers";
import { gradeLevel } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";

export const getStudents = query({
    args:{
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
  
            return {
                ...student,
                sectionStudentId: sectionStudent._id
                // grades: gradesWithTeachingLoad
            };
        })
    );

    const filteredStudents = studentGrades.filter(s => s!=null)

    return filteredStudents;
}
});

export const getStudentSection = query({
    args:{
        sectionStudentId: v.id('sectionStudents')
    },
    handler: async(ctx, args) =>{
        const sectionStudent = await ctx.db.get(args.sectionStudentId);
        if (!sectionStudent) return null;
        const student = await ctx.db.get(sectionStudent.studentId);
        if (!student) return null;
        const section = await ctx.db.get(sectionStudent.sectionId)
        if (!section) return null;
        const adviser = await ctx.db.get(section.adviserId)
        if (!adviser) return null;

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
})

export const getStudentGrades = query({
    args:{
        studentId: v.id('students'),
        
    },
    handler: async(ctx, args) => {
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
    args:{
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
        juniorHigh: v.optional(v.object({
            genAve: v.string(),
            school: v.string(),
            address: v.string(),
        })),
        juniorHighDateOfAdmission: v.string(),
        alsRating: v.optional(v.string()),
        enrollingIn: gradeLevel
    },
    handler: async(ctx, args) => {
        const isExistingStudent = await ctx.db.query('students').filter(q=> q.eq(q.field('lrn'), args.lrn)).first()

        if(isExistingStudent !== null) {
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
    args:{
        studentId: v.optional(v.id('students')),
        lastName: v.string(),
        firstName: v.string(),
        middleName: v.string(),
        sex: v.union(v.literal('male'), v.literal('female')),
        lrn: v.string(),
        dateOfBirth: v.string(),
        elementary:v.object({
          genAve: v.string(),
          school: v.string(),
          address: v.string(),
        }),
        juniorHigh:v.object({
          genAve: v.string(),
          school: v.string(),
          address: v.string(),
        }),
        juniorHighDateOfAdmission: v.string(),
        alsRating: v.optional(v.string()),
        enrollingIn: gradeLevel
    },
    handler: async (ctx, args) =>{
        if(!args.studentId) return undefined;
        const student = await ctx.db.get(args.studentId)
      
        if(student === null) {
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
    args:{
        studentId: v.id('students')
    },
    handler: async(ctx, args) => {
        const student = await ctx.db.get(args.studentId)

        if(student === null) return

        await ctx.db.patch(student._id, {
            isArchived: true
        })
    }
})

export const getStudentById = query({
    args:{
        studentId: v.optional(v.id('students'))
    },
    handler: async(ctx, args) =>{
        if(!args.studentId) return undefined
        const student = await ctx.db.get(args.studentId)
        if(student === null) return undefined
        const enrollments = await ctx.db.query('enrollment').filter(q=> q.eq(q.field('studentId'), args.studentId )).order('desc').collect()
        const enrollmentWithSection = await asyncMap(enrollments, async(enrollment) =>{
            const section = await ctx.db.get(enrollment.sectionId)
            if(section === null) return undefined
            const selectedSubjects = await asyncMap(enrollment.subjects, async(id) => {
                const subjectTaught = await ctx.db.get(id)
                return {
                    subject: subjectTaught,
                }
            })
            const sectionSub = section.subjects ?? []
      
            const sectionSubjects = await asyncMap(sectionSub, async(id) => {
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
    args:{
        sectionId: v.optional(v.id('sections')),
        teachingLoadId: v.id('teachingLoad')
    },
    handler: async(ctx, args)=>{
        if(!args.sectionId) return undefined;

        const initStudents = await ctx.db.query('sectionStudents').filter((q) => q.eq(q.field('sectionId'), args.sectionId)).collect()

        const students = await asyncMap(initStudents, async(data)=>{

            const student = await ctx.db.get(data.studentId)
            if(student === null) return null;
           
            const classRecord = await ctx.db.query('classRecords')
            .withIndex('by_teachingLoadId', q => q.eq('teachingLoadId', args.teachingLoadId))
            .filter(q => q.eq(q.field('studentId'), student._id))
            .first()

            if(classRecord === null) return null;
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

            const sortedWritten = written.sort((a,b)=> a.assessmentNo - b.assessmentNo)
            const sortedPerformance = performance.sort((a,b)=> a.assessmentNo - b.assessmentNo)
            const sortedExam = exam.sort((a,b)=> a.assessmentNo - b.assessmentNo)
            const isSubmitted = classRecord.needsIntervention !== undefined && classRecord.needsIntervention !== null;
            
            return {
                ...student,
                written: sortedWritten,
                performance: sortedPerformance,
                exam: sortedExam,
                classRecord: classRecord,
                isSubmitted: isSubmitted
            }
        });

        return students

    }
});

export const needsIntervention = query({
    args:{
        sectionId: v.optional(v.id('sections')),
        teachingLoadId: v.id('teachingLoad')
    },
    handler: async(ctx, args) => {
        if(!args.sectionId) return undefined;
        const initStudents = await ctx.db.query('sectionStudents').filter((q) => q.eq(q.field('sectionId'), args.sectionId)).collect();
        const students = await asyncMap(initStudents, async(data)=>{
            const student = await ctx.db.get(data.studentId)
            if(student === null) return null;
           
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


export const getSubjects = query({
    args:{
        sectionSubjects: v.optional(v.array(v.id('subjectTaught'))),
        studentId: v.id('students')
    },
    handler: async(ctx, args) =>{
        if(!args.sectionSubjects) return
        const classsRecords = await ctx.db.query('classRecords').withIndex('by_studentId').collect()

        const ClassRecordsWithTeachingLoad = await asyncMap(classsRecords, async(record)=>{ 
            const load = await ctx.db.get(record.teachingLoadId)
            if(!load) return null

            return {
                ...record,
                teachingLoad: load
            }
        })

        const filteredCR = ClassRecordsWithTeachingLoad.filter(r => r !== null)

        const subjectWithGrades = await asyncMap(args.sectionSubjects, async(subjectId)=>{
            const subject = await ctx.db.get(subjectId);
          
            if(!subject) return null

            // Define the type for grades
            type QuarterGrades = {
                "1st": number | undefined; // or whatever type you expect
                "2nd": number | undefined;
                "3rd": number | undefined;
                "4th": number | undefined;
            };

            // Initialize the grades object with the defined type
            const grades: QuarterGrades = {
                "1st": undefined,
                "2nd": undefined,
                "3rd": undefined,
                "4th": undefined,
            };

            let interventionGrade: number | undefined = undefined;
            let interventionUsed: string[] | undefined = undefined;
            let interventionRemarks: string | undefined = undefined;

            for (const record of filteredCR) {
                if (record.teachingLoad.subjectTaughtId === subjectId) {
                    const quarter = record.teachingLoad.quarter?.replace(' quarter', '') as keyof QuarterGrades;
                    if (quarter && quarter in grades) {
                        grades[quarter] = record.quarterlyGrade;
                    }
                    if (record.needsIntervention) {
                        interventionGrade = record.interventionGrade;
                        interventionUsed = record.interventionUsed;
                        interventionRemarks = record.interventionRemarks;
                    }
                }
            }

            return {
                ...subject,
                grades: grades,
                interventionGrade: interventionGrade,
                interventionUsed: interventionUsed,
                interventionRemarks: interventionRemarks,
            }
        })

        return subjectWithGrades;
    }
})