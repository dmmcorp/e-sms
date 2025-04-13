import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { asyncMap } from "convex-helpers";

export const getStudents = query({
    args:{

    },
    handler: async(ctx, args) =>{
        const students = await ctx.db.query('students')
        .filter(q => q.eq(q.field('isArchived'), false))
        .order('desc')
        .collect()
        return students
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
        juniorHigh: v.object({
            genAve: v.string(),
            school: v.string(),
            address: v.string(),
        }),
        juniorHighDateOfAdmission: v.string(),
        alsRating: v.optional(v.string()),
    },
    handler: async(ctx, args) => {
        const isExistingStudent = await ctx.db.query('students').filter(q=> q.eq(q.field('lrn'), args.lrn)).first()

        if(isExistingStudent !== null) {
            throw new ConvexError(`Student with the lrn:${isExistingStudent.lrn} is already exist.`)
        } else {
            await ctx.db.insert('students', {
                ...args
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