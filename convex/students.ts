import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
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
            return {
                ...enrollment,
                section: section
            }
        })
        const currentSection = enrollmentWithSection.find(e => e.status === "enrolled")
        return {
            ...student,
            enrollment: enrollmentWithSection,
            currentSection: currentSection
        }
    }
})