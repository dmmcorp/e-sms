'use client'
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudentWithEnrollment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { enrollmentSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { api } from '../../../../../../../convex/_generated/api';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';

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
    const router = useRouter();
    const updateStudent = useMutation(api.students.edit)
    const form = useForm<z.infer<typeof enrollmentSchema>>({
        resolver: zodResolver(enrollmentSchema),
        defaultValues: {
            lastName: student?.lastName || "",
            firstName:student?.firstName || "",
            middleName:student?.middleName || "",
            lrn:student?.lrn || "",
            dateOfBirth: student?.dateOfBirth ? new Date(student.dateOfBirth) : undefined,
            sex: student?.sex || "",
        
            elemGenAve: student?.elementary?.school || "",
            elemPrevSchoolName: student?.elementary?.school || "",
            elemPrevSchoolAddress: student?.elementary?.address || "",
        
            jnrGenAve: student?.juniorHigh?.genAve || "",
            jnrPrevSchoolName: student?.juniorHigh?.school || "",
            jnrPrevSchoolAddress:  student?.juniorHigh?.address || "",
            jnrDateOfAdmission: student?.juniorHighDateOfAdmission ? new Date(student.juniorHighDateOfAdmission) : undefined,
        
            alsRating: student?.alsRating || "",
        },
    });
        
    function onSubmit(values: z.infer<typeof enrollmentSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
        setIsSubmitting(true)
        toast.promise(updateStudent({
            studentId: student?._id,
            lastName: values.lastName,
            firstName: values.firstName,
            middleName: values.middleName,
            sex: values.sex as "male" | "female",
            lrn:  values.lrn,
            dateOfBirth: values.dateOfBirth.toDateString(),
            elementary: {
                genAve: values.elemGenAve,
                school: values.elemPrevSchoolName,
                address: values.elemPrevSchoolAddress,
            },
            juniorHigh: {
            genAve: values.jnrGenAve,
            school: values.jnrPrevSchoolName,
            address: values.jnrPrevSchoolAddress,
            },
            juniorHighDateOfAdmission: values.jnrDateOfAdmission.toDateString(),
            alsRating: values.alsRating,
        }),{
            loading: "Adding student...",
            success: () =>{ 
                form.reset()
                setEditDialog(false)
            return "Successfully Added a new student"
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
        <DialogContent className='max-h-screen overflow-auto md:max-w-1/2'>
            <DialogTitle>
                Edit Student
            </DialogTitle>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                        <div className="text-sm font-medium bg-muted w-full py-1 px-2">Personal Information</div>
                        <div className="grid gap-6 sm:grid-cols-3">
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

                        <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>
                                Date of Birth <span className="text-red-500">*</span>
                                </FormLabel>
                                <Popover>
                                <PopoverTrigger asChild className='z-50'>
                                    <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                                Sex <span className="text-red-500">*</span>
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
                    <div className="text-sm font-medium w-full bg-muted py-1 px-2">Academic Information</div>
                    <div className="grid gap-6 sm:grid-cols-2">
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
                        name="jnrDateOfAdmission"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>
                                    Date of Admission <span className="text-red-500">*</span>
                                </FormLabel>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                    </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                        {/* Elementary school information */}
                        <div className="space-y-6">
                            <div className="text-sm font-medium w-full bg-muted py-1 px-2">School Information <span className='italic'>(Elementary)</span></div>
                            <FormField
                            control={form.control}
                            name="elemPrevSchoolName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>
                                    School Name <span className="text-red-500">*</span>
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
                                        School Address <span className="text-red-500">*</span>
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
                                name="elemGenAve"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>
                                        General Average <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter general average" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                        </div>
                        {/* Junior High school information */}
                        <div className="space-y-6">
                            <div className="text-sm font-medium w-full bg-muted py-1 px-2">School Information <span className='italic'>(Junior High School)</span></div>
                            <FormField
                                control={form.control}
                                name="jnrPrevSchoolName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>
                                        School Name <span className="text-red-500">*</span>
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
                                        School Address <span className="text-red-500">*</span>
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
                                name="jnrGenAve"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>
                                        General Average <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter general average" {...field} />
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
                                onClick={()=> setEditDialog(false)}
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