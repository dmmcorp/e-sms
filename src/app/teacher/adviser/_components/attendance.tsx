
'use client'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useMutation } from 'convex/react'
import { Edit, Save } from 'lucide-react'
import React, { useState } from 'react'
import { Doc, Id } from '../../../../../convex/_generated/dataModel'
import { api } from '../../../../../convex/_generated/api'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AttendanceFormschema } from '@/lib/validation/validation-form';
import { StudentWithSectionStudent } from '@/lib/types';
import InputAttendance from './input-attendance';

interface AttendanceProps{
    student: StudentWithSectionStudent,
    attendance: Doc<'attendance'>,
    edit?: boolean
}

function Attendance({student, attendance, edit}: AttendanceProps) {
    const [isEditing, setIsEditing] = useState(edit ?? false);
  
    const addAttendance = useMutation(api.attendance.add)

       const form = useForm<z.infer<typeof AttendanceFormschema>>({
            resolver: zodResolver(AttendanceFormschema),
            defaultValues:{
                studentId: student._id,
                sectionStudentId: student.sectionStudentId,
                june: {
                    totalSchooldays: attendance?.june.totalSchooldays,
                    daysAbsent:  attendance?.june.daysAbsent,
                    daysPresent: attendance?.june.daysPresent,
                },
                july:{
                    totalSchooldays: attendance?.july.totalSchooldays,
                    daysAbsent:  attendance?.july.daysAbsent,
                    daysPresent: attendance?.july.daysPresent,
                },
                august: {
                    totalSchooldays: attendance?.august.totalSchooldays,
                    daysAbsent:  attendance?.august.daysAbsent,
                    daysPresent: attendance?.august.daysPresent,
                },
                september:{
                  totalSchooldays: attendance?.september.totalSchooldays,
                  daysAbsent:  attendance?.september.daysAbsent,
                  daysPresent: attendance?.september.daysPresent,
                },
                october:{
                    totalSchooldays: attendance?.october.totalSchooldays,
                    daysAbsent:  attendance?.october.daysAbsent,
                    daysPresent: attendance?.october.daysPresent,
                },
                november:{
                  totalSchooldays:  attendance?.november.totalSchooldays,
                  daysAbsent:  attendance?.november.daysAbsent,
                  daysPresent:  attendance?.november.daysPresent,
                },
                december:{
                  totalSchooldays:  attendance?.december.totalSchooldays,
                  daysAbsent: attendance?.december.daysAbsent,
                  daysPresent:attendance?.december.daysPresent,
                },
                january: {
                  totalSchooldays: attendance?.january.totalSchooldays,
                  daysAbsent: attendance?.january.daysAbsent,
                  daysPresent: attendance?.january.daysPresent,
                },
                february: {
                  totalSchooldays: attendance?.february.totalSchooldays,
                  daysAbsent: attendance?.february.daysAbsent,
                  daysPresent: attendance?.february.daysPresent,
                },
                march: {
                  totalSchooldays: attendance?.march.totalSchooldays,
                  daysAbsent:  attendance?.march.daysAbsent,
                  daysPresent:  attendance?.march.daysPresent,
                },
                april:{
                  totalSchooldays: attendance?.april.totalSchooldays,
                  daysAbsent: attendance?.april.daysAbsent,
                  daysPresent:  attendance?.april.daysPresent,
                },
                may: {
                  totalSchooldays: attendance?.may.totalSchooldays,
                  daysAbsent: attendance?.may.daysAbsent,
                  daysPresent: attendance?.may.daysPresent,
                },
            }
        })

        const onSubmit = (data: z.infer<typeof AttendanceFormschema>) =>{
            toast.promise(addAttendance({
                ...data,
                studentId: data.studentId as Id<'students'>,
                sectionStudentId: data.sectionStudentId as Id<'sectionStudents'>
            }),{
                loading: "Saving your input",
                success: "Values marking save successfully :)",
                error: "Saving Values marking failed :("
            })
            setIsEditing(!isEditing);
        }

    const months = [
        "july", "august", "september", "october", "november", "december",
        "january", "february", "march", "april", "may", "june"
        ] as const;

    const calculateDays = ( type: "totalSchoolDays" | "daysPresent" | "daysAbsent") => {

        if(type === "totalSchoolDays"){
            const july = attendance?.july.totalSchooldays ?? 0
            const august = attendance?.august.totalSchooldays ?? 0
            const september = attendance?.september.totalSchooldays ?? 0
            const october = attendance?.october.totalSchooldays ?? 0
            const november = attendance?.november.totalSchooldays ?? 0
            const december = attendance?.december.totalSchooldays ?? 0
            const january = attendance?.january.totalSchooldays ?? 0
            const february = attendance?.february.totalSchooldays ?? 0
            const march = attendance?.march.totalSchooldays ?? 0
            const april = attendance?.april.totalSchooldays ?? 0
            const may = attendance?.may.totalSchooldays ?? 0
            const june = attendance?.june.totalSchooldays ?? 0
 
            return july + august + september + october + november + december + january + february + march + april + may + june
        }
        if(type === "daysPresent"){
            const july = attendance?.july.daysPresent ?? 0
            const august = attendance?.august.daysPresent ?? 0
            const september = attendance?.september.daysPresent ?? 0
            const october = attendance?.october.daysPresent ?? 0
            const november = attendance?.november.daysPresent ?? 0
            const december = attendance?.december.daysPresent ?? 0
            const january = attendance?.january.daysPresent ?? 0
            const february = attendance?.february.daysPresent ?? 0
            const march = attendance?.march.daysPresent ?? 0
            const april = attendance?.april.daysPresent ?? 0
            const may = attendance?.may.daysPresent ?? 0
            const june = attendance?.june.daysPresent ?? 0
            return july + august + september + october + november + december + january + february + march + april + may + june
        }
        if(type === "daysAbsent"){
            const july = attendance?.july.daysAbsent ?? 0
            const august = attendance?.august.daysAbsent ?? 0
            const september = attendance?.september.daysAbsent ?? 0
            const october = attendance?.october.daysAbsent ?? 0
            const november = attendance?.november.daysAbsent ?? 0
            const december = attendance?.december.daysAbsent ?? 0
            const january = attendance?.january.daysAbsent ?? 0
            const february = attendance?.february.daysAbsent ?? 0
            const march = attendance?.march.daysAbsent ?? 0
            const april = attendance?.april.daysAbsent ?? 0
            const may = attendance?.may.daysAbsent ?? 0
            const june = attendance?.june.daysAbsent ?? 0
            return july + august + september + october + november + december + january + february + march + april + may + june
        }
        
       
    };

    const totalSchooldays = calculateDays( "totalSchoolDays");
    const daysPresent = calculateDays("daysPresent");
    const daysAbsent = calculateDays("daysAbsent");
    
  return (
    <div className="">
    <Form {...form}> 
        <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex justify-end">
            {isEditing && (
                <Button
                    type="submit"
                    size="default"
                    variant="default"
                    className="h-7 text-white gap-1 py-2 ml-auto"
                    >
                <Save className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Save
                </span>
                </Button>
            )}
      </div>
        
    <h1 className={cn('mb-0 text-xs  md:text-lg uppercase font-semibold font-serif tracking-wide text-center ')}>ATTENDANCE RECORD</h1>
            <div className="overflow-x-auto text-xs md:text-sm">
                <div className="grid grid-cols-12">
                    <div className="col-span-3 border-y-black border-y p-1  border-x-black border-x">

                    </div>
                    <div className={cn("text-[0.5rem] border-y-black border-y col-span-7 grid grid-cols-12")}>
                        <div className="h-full border-r-black border-r text-center font-semibold p-1">Jul</div>
                        <div className="h-full border-r-black border-r text-center font-semibold p-1">Aug</div>
                        <div className="h-full border-r-black border-r text-center font-semibold p-1">Sep</div>
                        <div className="h-full border-r-black border-r text-center font-semibold p-1">Oct</div>
                        <div className="h-full border-r-black border-r text-center font-semibold p-1">Nov</div>
                        <div className="h-full border-r-black border-r text-center font-semibold p-1">Dec</div>
                        <div className="h-full border-r-black border-r text-center font-semibold p-1">Jan</div>
                        <div className="h-full border-r-black border-r text-center font-semibold p-1">Feb</div>
                        <div className="h-full border-r-black border-r text-center font-semibold p-1">Mar</div>
                        <div className="h-full border-r-black border-r text-center font-semibold p-1">Apr</div>
                        <div className="h-full border-r-black border-r text-center font-semibold p-1">May</div>
                        <div className="h-full border-r-black border-r text-center font-semibold p-1">Jun</div>
                    </div>
                    <div className="col-span-2 border-y-black border-y text-center p-1 font-semibold border-r-black border-r">
                        <div></div>
                    </div>
                    
                </div>
                <div className="grid grid-cols-12">
                    <div className="col-span-3 border-y-black border-y text-center text-sm p-1  font-semibold border-x-black border-x">
                        <div className="text-[0.5rem]">No. of School days</div>
                    </div>
                    { isEditing ? (
                        <div className="border-y-black border-y col-span-7 grid grid-cols-12">
                            {months.map((month) => (
                                <FormField
                                key={month}
                                name={`${month}.totalSchooldays`}
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormControl>
                                        <Input
                                        type="number"
                                        {...field}
                                        className="h-full border-r-black border-r text-center font-semibold p-1"
                                        />
                                    </FormControl>
                                    </FormItem>
                                )}
                                />
                            ))}
                        </div>
                    ): (
                        <div className="border-y-black border-y col-span-7 grid grid-cols-12">
                             {months.map((month) => (
                                <div key={month + "totalSchooldays"} className="h-full border-r-black border-r text-center font-semibold p-1 text-xs">{attendance?.[month].totalSchooldays}</div>
                             ))}
                        </div>
                    )}
                    
                    <div className="col-span-2 border-y-black border-y text-center p-1 font-semibold border-r-black border-r text-xs">
                        <div>{totalSchooldays}</div>
                    </div>
                    
                </div>
                <div className="grid grid-cols-12">
                    <div className="col-span-3 border-y-black border-y text-center text-sm p-1  font-semibold border-x-black border-x">
                        <div className="text-[0.5rem]">No. of days Present</div>
                    </div>
                    { isEditing ? (
                        <div className="border-y-black border-y col-span-7 grid grid-cols-12">
                            {months.map((month) => (
                                <FormField
                                key={month}
                                name={`${month}.daysPresent`}
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormControl>
                                        <Input
                                        type="number"
                                        {...field}
                                        className="h-full border-r-black border-r text-center font-semibold p-1"
                                        />
                                    </FormControl>
                                    </FormItem>
                                )}
                                />
                            ))}
                        </div>
                    ): (
                        <div className="border-y-black border-y col-span-7 grid grid-cols-12 text-xs">
                             {months.map((month) => (
                                <div key={month + "daysPresent"} className="h-full border-r-black border-r text-center font-semibold p-1">{attendance?.[month].daysPresent}</div>
                             ))}
                        </div>
                    )}
                    <div className="col-span-2 border-y-black border-y text-center p-1 font-semibold border-r-black border-r text-xs">
                        <div>{daysPresent}</div>
                    </div>
               
                </div>
                <div className="grid grid-cols-12">
                    <div className="col-span-3 border-y-black border-y text-center text-sm p-1  font-semibold border-x-black border-x">
                        <div className="text-[0.5rem]">No. of days Absent</div>
                    </div>
                    { isEditing ? (
                        <div className="border-y-black border-y col-span-7 grid grid-cols-12">
                            {months.map((month) => (
                                <FormField
                                key={month}
                                name={`${month}.daysAbsent`}
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormControl>
                                        <Input
                                        type="number"
                                        {...field}
                                        className="h-full border-r-black border-r text-center font-semibold p-1"
                                        />
                                    </FormControl>
                                    </FormItem>
                                )}
                                />
                            ))}
                        </div>
                    ): (
                        <div className="border-y-black border-y col-span-7 grid grid-cols-12 text-xs">
                             {months.map((month) => (
                                <div key={month + "daysAbsent"} className="h-full border-r-black border-r text-center font-semibold p-1 text-xs">{attendance?.[month].daysAbsent}</div>
                             ))}
                        </div>
                    )}
                    <div className="col-span-2 border-y-black border-y text-center p-1 font-semibold border-r-black border-r text-xs">
                        <div>{daysAbsent}</div>
                    </div>
                    
                </div>
            </div>
    </form>
    </Form>

   
    </div>
  )
}

export default Attendance