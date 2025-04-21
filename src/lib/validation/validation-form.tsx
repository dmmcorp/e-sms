import { z } from "zod"; 

export const ValuesFormSchema = z.object({
     studentId: z.string(),
     sectionStudentId: z.string(),
       makaDyos: z.object({
         first: z.object({
           first: z.string().optional(),
           second: z.string().optional(),
           third: z.string().optional(),
           fourth: z.string().optional()
         }),
         second: z.object({
           first: z.string().optional(),
           second: z.string().optional(),
           third: z.string().optional(),
           fourth: z.string().optional()
         })
       }),
       makaTao: z.object({
         first: z.object({
           first: z.string().optional(),
           second: z.string().optional(),
           third: z.string().optional(),
           fourth: z.string().optional()
         }),
         second: z.object({
           first: z.string().optional(),
           second: z.string().optional(),
           third: z.string().optional(),
           fourth: z.string().optional()
         })
       }),
       makakalikasan: z.object({
         first: z.object({
           first: z.string().optional(),
           second: z.string().optional(),
           third: z.string().optional(),
           fourth: z.string().optional()
         })
       }),
       makaBansa: z.object({
         first: z.object({
           first: z.string().optional(),
           second: z.string().optional(),
           third: z.string().optional(),
           fourth: z.string().optional()
         }),
         second: z.object({
           first: z.string().optional(),
           second: z.string().optional(),
           third: z.string().optional(),
           fourth: z.string().optional()
         })
       }),
  
})

export const AttendanceFormschema = z.object({
        studentId: z.string(),
        sectionStudentId: z.string(),
        june: z.object({
          totalSchooldays: z.coerce.number().optional(),
          daysAbsent: z.coerce.number().optional(),
          daysPresent: z.coerce.number().optional(),
        }),
        july: z.object({
          totalSchooldays: z.coerce.number().optional(),
          daysAbsent: z.coerce.number().optional(),
          daysPresent: z.coerce.number().optional(),
        }),
        august: z.object({
          totalSchooldays: z.coerce.number().optional(),
          daysAbsent: z.coerce.number().optional(),
          daysPresent: z.coerce.number().optional(),
        }),
        september: z.object({
          totalSchooldays: z.coerce.number().optional(),
          daysAbsent: z.coerce.number().optional(),
          daysPresent:z.coerce.number().optional(),
        }),
        october: z.object({
          totalSchooldays: z.coerce.number().optional(),
          daysAbsent: z.coerce.number().optional(),
          daysPresent: z.coerce.number().optional(),
        }),
        november: z.object({
          totalSchooldays: z.coerce.number().optional(),
          daysAbsent: z.coerce.number().optional(),
          daysPresent: z.coerce.number().optional(),
        }),
        december: z.object({
          totalSchooldays: z.coerce.number().optional(),
          daysAbsent: z.coerce.number().optional(),
          daysPresent: z.coerce.number().optional(),
        }),
        january: z.object({
          totalSchooldays: z.coerce.number().optional(),
          daysAbsent: z.coerce.number().optional(),
          daysPresent: z.coerce.number().optional(),
        }),
        february: z.object({
          totalSchooldays: z.coerce.number().optional(),
          daysAbsent: z.coerce.number().optional(),
          daysPresent: z.coerce.number().optional(),
        }),
        march: z.object({
          totalSchooldays: z.coerce.number().optional(),
          daysAbsent: z.coerce.number().optional(),
          daysPresent: z.coerce.number().optional(),
        }),
        april: z.object({
          totalSchooldays: z.coerce.number().optional(),
          daysAbsent: z.coerce.number().optional(),
          daysPresent: z.coerce.number().optional(),
        }),
        may: z.object({
          totalSchooldays: z.coerce.number().optional(),
          daysAbsent: z.coerce.number().optional(),
          daysPresent: z.coerce.number().optional(),
        }),
})