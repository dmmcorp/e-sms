'use client'
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GradeLevelsTypes, StudentWithEnrollment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { enrollmentSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { api } from '../../../../../../../convex/_generated/api';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { gradeLevels } from '@/lib/constants';

interface EditStudentProps {
    student: StudentWithEnrollment;
    editDialog: boolean;
    setEditDialog: (value: boolean) => void;
}

function EditStudent({
    student,
    editDialog,
    setEditDialog
}:EditStudentProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const updateStudent = useMutation(api.students.edit)
    const form = useForm<z.infer<typeof enrollmentSchema>>({
        resolver: zodResolver(enrollmentSchema),
        defaultValues: {
            lastName: student?.lastName || "",
            firstName:student?.firstName || "",
            middleName:student?.middleName || "",
            lrn: Number(student.lrn) || undefined,
            dateOfBirth: student?.dateOfBirth ? new Date(student.dateOfBirth) : undefined,
            sex: student?.sex || "",
        
            elemGenAve: Number(student?.elementary?.genAve) || undefined,
            elemPrevSchoolName: student?.elementary?.school || "",
            elemPrevSchoolAddress: student?.elementary?.address || "",
            elemSchoolId: student?.elementary?.schoolId || "",

            jnrGenAve:  Number(student?.juniorHigh?.genAve) || undefined ,
            jnrPrevSchoolName: student?.juniorHigh?.school || "",
            jnrPrevSchoolAddress:  student?.juniorHigh?.address || "",
            jnrDateOfAdmission: (student.enrollingIn === "Grade 11" || student.enrollingIn === "Grade 12")
                ? (student.seniorHighDateOfAdmission ? new Date(student.seniorHighDateOfAdmission) : undefined)
                : (student.juniorHighDateOfAdmission ? new Date(student.juniorHighDateOfAdmission) : undefined),
            jnrDateOfCompletion: student.juniorHigh?.completion ? new Date(student.juniorHigh?.completion) : undefined,
            enrollingTo: student.enrollingIn,
            semesterEnrollingIn: student.semesterEnrollingIn,
            alsRating: student?.alsRating || "",
        },
    });
    const isSHS = form.watch("enrollingTo") === "Grade 11" || form.watch("enrollingTo") === "Grade 12";
    function onSubmit(values: z.infer<typeof enrollmentSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsSubmitting(true)
        toast.promise(updateStudent({
            studentId: student?._id,
            lastName: values.lastName,
            firstName: values.firstName,
            middleName: values.middleName,
            sex: values.sex as "male" | "female",
            lrn:  values.lrn.toString(),
            dateOfBirth: values.dateOfBirth.toDateString(),
            elementary: {
                genAve: values.elemGenAve ? values.elemGenAve.toString() : undefined,
                school: values.elemPrevSchoolName ?? "",
                address: values.elemPrevSchoolAddress ?? "",
                schoolId: values.elemSchoolId ?? ""
            } ,
            juniorHigh: {
                genAve: values.jnrGenAve?.toString() || "",
                school: values.jnrPrevSchoolName || "",
                address: values.jnrPrevSchoolAddress || "",
                completion: values.jnrDateOfCompletion?.toDateString() || ""
            },
            juniorHighDateOfAdmission: values.jnrDateOfAdmission ? values.jnrDateOfAdmission.toDateString() : undefined,
            alsRating: values.alsRating,
            enrollingIn: values.enrollingTo as GradeLevelsTypes,
            semesterEnrollingIn: values.semesterEnrollingIn || undefined,
        }),{
            loading: "Updating student information...",
            success: () => {
                setEditDialog(false)
            return "Updated student information"
            },
            error: (error) => {
            return (
                <div className="">{error.data}</div>
            )
            },
        })
        setIsSubmitting(false)
    }

  return (
    <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className='max-h-[80vh] overflow-auto md:max-w-5xl'>
            <DialogTitle>
                Edit Student
            </DialogTitle>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                        <div className="text-sm font-medium bg-primary/90 text-white w-full py-1 px-2">Personal Information</div>
                        <div className="grid gap-6 sm:grid-cols-3 items-start">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    First Name <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter first name" {...field} className='uppercase' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="middleName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Middle Name</FormLabel>
                                <FormControl>
                                <Input placeholder="Enter middle name" {...field} className='uppercase' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                Last Name <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                <Input placeholder="Enter last name" {...field} className='uppercase'/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 items-start">
                        <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>
                                Date of Birth <span className="text-red-500">*</span>
                                </FormLabel>
                                <Popover>
                                <PopoverTrigger className='z-50 w-full'>
                                    <FormControl>
                                    <Button
                                        type='button'
                            
                                        variant={"outline"}
                                        className={cn("pl-3 text-left font-normal w-full", !field.value && "text-muted-foreground")}
                                    >
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                    initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sex"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                Gender <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className='w-full'>
                                    <SelectValue placeholder="Select gender" className='w-full'/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>
                    </div>

                    <div className="space-y-6">
                    <div className="text-sm font-medium w-full bg-primary/90 text-white py-1 px-2">Academic Information</div>
                    <div className="grid gap-6 sm:grid-cols-2 items-start">
                        <FormField
                        control={form.control}
                        name="lrn"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>
                                Learning Reference Number <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Enter learning reference number" {...field} />
                            </FormControl>
                            <FormDescription>Your unique student identifier</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                            control={form.control}
                            name="enrollingTo"
                            render={({ field }) => (
                            <FormItem  className=''>
                                <FormLabel>
                                Grade Level for Enrollment  <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className='w-full'>
                                    <SelectValue placeholder="Select grade level" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {gradeLevels.map((level)=> (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                       
                        <FormField
                        control={form.control}
                        name="jnrDateOfAdmission"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>
                                    Date of Admission {form.watch("enrollingTo") === "Grade 11" ? "(SHS)" : "(JHS)" } <span className="text-red-500">*</span>
                                </FormLabel>
                                <Popover>
                                <PopoverTrigger >
                                    <FormControl>
                                    <Button
                                        variant={"outline"}
                                        type='button'
                                        className={cn("pl-3 text-left font-normal w-full", !field.value && "text-muted-foreground")}
                                    >
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                        initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        {form.watch("enrollingTo") === "Grade 11" || form.watch("enrollingTo") === "Grade 12" ? (
                         <FormField
                            control={form.control}
                            name="semesterEnrollingIn"
                            render={({ field }) => (
                            <FormItem  className=''>
                                <FormLabel>
                                Semester for Enrollment  <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className='w-full'>
                                    <SelectValue placeholder="Select semester" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem  value={"1st semester"}>1st semester</SelectItem>
                                    <SelectItem  value={"2nd semester"}>2nd semester</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        ) : (
                            <FormField
                                control={form.control}
                                name="semesterEnrollingIn"
                                render={({ field }) => (
                                    <FormItem className='hidden'>
                                        <FormControl>
                                            <Input type='hidden' {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                        {/* Elementary school information */}
                        <div className="space-y-6">
                            <div className="text-sm font-medium w-full bg-primary/90 text-white py-1 px-2">School Information <span className='italic'>(Elementary)</span></div>
                            <FormField
                            control={form.control}
                            name="elemPrevSchoolName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>
                                    School Name
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter previous school name" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="elemPrevSchoolAddress"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>
                                        School Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter previous school address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="elemSchoolId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>
                                        School Id
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter previous school Id" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="elemGenAve"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>
                                        General Average
                                    </FormLabel>
                                    <FormControl>
                                        <Input type='number' placeholder="Enter general average" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                        </div>
                        {/* Junior High school information */}
                        <div className="space-y-6">
                            <div className="text-sm font-medium w-full bg-primary/90 text-white py-1 px-2">School Information <span className='italic'>(Junior High School)</span></div>
                            <FormField
                                control={form.control}
                                name="jnrPrevSchoolName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>
                                        School Name 
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter previous school name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="jnrPrevSchoolAddress"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>
                                        School Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter previous school address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="jnrDateOfCompletion"
                                render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>
                                    Date of Completion
                                    </FormLabel>
                                    <Popover>
                                    <PopoverTrigger className='flex w-full'>
                                        <FormControl>
                                            <Button
                                            type='button'
                                            variant={"outline"}
                                            className={cn("pl-3 text-left font-normal w-full", !field.value && "text-muted-foreground")}
                                            >
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                                        <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                        initialFocus
                                        />
                                    </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="jnrGenAve"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>
                                        General Average 
                                    </FormLabel>
                                    <FormControl>
                                        <Input type='number' placeholder="Enter general average" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    
                    </div>
                    <Separator/>
                    <FormField
                        control={form.control}
                        name="alsRating"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>ALS Rating</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter ALS rating (if applicable)" className='w-1/4' {...field} />
                            </FormControl>
                            <FormDescription>Alternative Learning System rating (if applicable)</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter className="flex items-center justify-end">
                        <div className='flex items-center justify-evenly gap-5 ml-auto'>
                            <Button 
                                type='button'
                                onClick={()=> {
                                    form.reset()
                                    setEditDialog(false)
                                }}
                                variant={'secondary'}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type='submit' 
                                variant={'default'}
                                disabled={isSubmitting}
                            >
                            {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </Form>
          
        </DialogContent>
    </Dialog>
  )
}

export default EditStudent