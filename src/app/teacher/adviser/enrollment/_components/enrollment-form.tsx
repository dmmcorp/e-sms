'use client'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {  CalendarIcon, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { useMutation } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'
import { toast } from 'sonner'
import { enrollmentSchema } from '@/lib/zod'
import { GradeLevelsTypes } from '@/lib/types'
import { gradeLevels } from '@/lib/constants'
import { CalendarRaw } from '@/components/DatePicker'
import { Id } from '../../../../../../convex/_generated/dataModel'

function EnrollmentForm() {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const searchParams = useSearchParams();
    const sectionId = searchParams.get('id') as Id<'sections'> | null;
    const addStudent  = useMutation(api.students.add)
    const router = useRouter();

    //default values of the form
    const form = useForm<z.infer<typeof enrollmentSchema>>({
        resolver: zodResolver(enrollmentSchema),
        defaultValues: {
          lastName: "",
          firstName: "",
          middleName: "",
          lrn: undefined,
          dateOfBirth: undefined,
          sex: "",
      
          elemGenAve: undefined,
          elemPrevSchoolName: "",
          elemPrevSchoolAddress: "",
          elemSchoolId: "",
      
          jnrGenAve: "",
          jnrPrevSchoolName: "",
          jnrPrevSchoolAddress: "",
          jnrDateOfAdmission: undefined,
      
          alsRating: "",
        },
      });

    //this fuction is used the user click the save button
    function onSubmit(values: z.infer<typeof enrollmentSchema>) {

        setIsSubmitting(true)
        toast.promise(addStudent({
          lastName: values.lastName,
          firstName: values.firstName,
          middleName: values.middleName,
          sex: values.sex as "male" | "female",
          lrn:  values.lrn.toString(),
          dateOfBirth: values.dateOfBirth.toDateString(),
          elementary: {
              genAve: values.elemGenAve.toString(),
              school: values.elemPrevSchoolName,
              address: values.elemPrevSchoolAddress,
              schoolId: values.elemSchoolId,
          },
          juniorHigh: {
            genAve: values.jnrGenAve || "",
            school: values.jnrPrevSchoolName || "",
            address: values.jnrPrevSchoolAddress || "",
          },
          juniorHighDateOfAdmission: values.jnrDateOfAdmission.toDateString(),
          alsRating: values.alsRating,
          enrollingIn: values.enrollingTo as GradeLevelsTypes
        }),{
          loading: "Adding student...",
          success: () =>{ 
            form.reset()
            router.back()
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

    useEffect(() => {
      const subscription = form.watch((value, { name, type }) => {
        console.log("Form Errors:", form.formState.errors);
      });
      return () => subscription.unsubscribe();
    }, [form]);


    if (isComplete) {
        return (
          <Card className="w-full">
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="text-2xl flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-6 w-6" />
                Adding Student Complete
              </CardTitle>
              <CardDescription>Your enrollment form has been successfully submitted.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-6">
                Thank you for submitting your enrollment form. Your application has been received and is being processed.
                You will receive a confirmation email shortly with further instructions.
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setIsComplete(false)
                    form.reset()
                    setStep(1)
                  }}
                >
                  Submit Another Enrollment
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      };


   return (
    <>
      <Card className="w-full">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Add Student Form</CardTitle>
              <CardDescription>
                Please fill out all required information to complete the adding student process
              </CardDescription>
            </div>
            <div className="hidden sm:block bg-white border rounded-lg px-3 py-1 text-sm">Step {step} of 3</div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-lg font-medium">Personal Information</div>
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
                        <FormItem className="">
                          <FormLabel>
                            Date of Birth <span className="text-red-500">*</span>
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
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarRaw
                                  mode="single"
                                  captionLayout="dropdown-buttons"
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(value) => {
                                      field.onChange(value)
                                  }}
                                  fromYear={1960}
                                  toYear={2030}
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
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
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
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-lg font-medium">Academic Information</div>
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
                            <Input type='number' placeholder="Enter learning reference number" {...field} />
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
                        <FormItem  className='flex flex-col'>
                          <FormLabel>
                            Grade Level for Enrollment  <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
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
                            Date of Admission <span className="text-red-500">*</span>
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
              )}

              {step === 3 && (
                <>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                {/* Elementary school information */}
                <div className="space-y-6">
                  <div className="text-lg font-medium">School Information <span className='italic'>(Elementary)</span></div>
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
                    name="elemSchoolId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          School Id <span className="text-red-500">*</span>
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
                          General Average <span className="text-red-500">*</span>
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
                  <div className="text-lg font-medium">School Information <span className='italic'>(Junior High School)</span></div>
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
                    name="jnrGenAve"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          General Average
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
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="font-medium text-amber-800 mb-2">Before submitting</h3>
                  <p className="text-amber-700 text-sm">
                    Please review all information carefully. By submitting this form, you confirm that all provided
                    information is accurate and complete.
                  </p>
                </div>
                </>
              )}
             

              <div className="flex justify-between pt-2">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    Previous
                  </Button>
                ) : step === 1 ? (
                  <Button type="button" variant="outline" onClick={() => router.back()} className='flex gap-x-2'>
                    <ChevronLeft/> Back to student list
                  </Button>
                ) : (
                  <div className="">

                  </div>
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (step === 1) {
                        const isValid = form.trigger(["firstName", "lastName", "dateOfBirth", "sex"])
                        isValid.then((valid) => {
                          if (valid) setStep(step + 1)
                        })
                      } else if (step === 2) {
                        const isValid = form.trigger(["lrn", "jnrDateOfAdmission"])
                        isValid.then((valid) => {
                          if (valid) setStep(step + 1)
                        })
                      }
                    }}
                    className="gap-1"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="gap-1">
                    {isSubmitting ? "Submitting..." : "Submit Enrollment"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}

export default EnrollmentForm