'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import React, { useState } from 'react'
import { z } from 'zod'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { gradeLevels, schoolYears } from '@/lib/utils'
import { GradeLevelsTypes, SchoolYearTypes } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { containerVariants } from '../../_components/variants'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
    schoolYear: z.enum([
        "2024-2025",
        "2025-2026",
        "2026-2027",
        "2027-2028",
        "2028-2029",
        "2029-2030",
        "2030-2031",
        "2031-2032",
        "2032-2033",
        "2033-2034",
        "2034-2035",
        "2035-2036",
        "2036-2037",
        "2037-2038",
        "2038-2039",
        "2039-2040",
        "2040-2041",
        "2041-2042",
        "2042-2043",
        "2043-2044",
        "2044-2045",
      ]).optional(),
    gradeLevel: z.enum([ 
        "Grade 7",
        "Grade 8",
        "Grade 0",
        "Grade 10",
        "Grade 11",
        "Grade 12",
    ]).optional(),
    sectionName: z.string().min(1,'Section name is required'),
});

type FormData = z.infer<typeof formSchema>;


// This component renders a form for selecting a school year, grade level, and section name.
// It uses React state to manage form data and validation errors.
function AdviserForm() {
    // Define the initial form values with default values for each field
    const initialFormValues: FormData = {
        schoolYear: undefined, // No school year selected initially
        gradeLevel: undefined, // No grade level selected initially
        sectionName: '', // Section name is empty initially
    };

    // State to manage the form data
    const [formData, setFormData] = useState<FormData>(initialFormValues);

    // State to manage validation errors for the form fields
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Handle changes to input fields and update the form data state
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        // Update the specific field in the form data
        setFormData((prev) => ({ ...prev, [name]: value }))
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const result = formSchema.safeParse(formData)
        const fieldErrors: Record<string, string> = {}
        // Check if the form data passes validation using the schema
        if (!result.success) {
            // If validation fails, iterate through the errors and map them to field names
            result.error.errors.forEach((err) => {
            if (err.path[0]) {
                fieldErrors[err.path[0] as string] = err.message
            }
            })
            // Add custom error messages for missing grade level and school year
            if (formData.gradeLevel === undefined ) {
                fieldErrors.gradeLevel = 'Grade level is required';
            }
            if(formData.schoolYear === undefined) {
                fieldErrors.schoolYear = 'School year is required';
            }
            // Update the state with the validation errors
            setErrors(fieldErrors)
        } else {
            // If validation succeeds, clear any existing errors
            const fieldErrors: Record<string, string> = {}
            if (formData.gradeLevel === undefined ) {
                fieldErrors.gradeLevel = 'Grade level is required';
            }
            if(formData.schoolYear === undefined) {
                fieldErrors.schoolYear = 'School year is required';
            }

            // Clear the errors state
            setErrors({})
            // Log the successfully validated form data
            console.log('Form submitted successfully:', result.data)
        }
    }
    
  return (
    <form onSubmit={handleSubmit}>
        
    <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className='space-y-5 uppercase'
    >
        <Card className=''>
            <CardContent>
                <div className='flex items-center gap-x-3 w-full'>
                    <Label htmlFor='schoolYear' className='w-36 font-semibold'>
                        School Year:
                    </Label>
                    <div className="w-full">
                        <Select name="role" 
                            value={formData.schoolYear || ''} 
                            onValueChange={value => setFormData((prev)=> ({...prev, schoolYear: value as SchoolYearTypes})) }
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Select school year" />
                            </SelectTrigger>
                            <SelectContent>
                                {schoolYears.map((sy) => (
                                    <SelectItem key={sy} value={sy}>
                                        {sy}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.schoolYear && <p className='text-xs text-red-600'>{errors.schoolYear}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className=''>
            <CardContent className='space-y-3'>
                <div className='flex items-center gap-x-3 w-full'>

                    <Label className=''>School Year: </Label>
                    <Label className=''>{formData.schoolYear ?? "Not selected"} </Label>
                    
                </div>
                <div className='flex items-center gap-x-3 w-full'>
                    <Label htmlFor='' className='n text-nowrap'>Grade Level:</Label>
                    <div className="w-full">
                        <Select  
                            value={formData.gradeLevel || ''} 
                            onValueChange={value => setFormData((prev)=> ({...prev, gradeLevel: value as GradeLevelsTypes})) }
                        >
                            <SelectTrigger className='w-full' id="gradeLevel">
                                <SelectValue placeholder="Select grade level" />
                            </SelectTrigger>
                            <SelectContent>
                                {gradeLevels.map((level) => (
                                    <SelectItem key={level} value={level}>
                                        {level}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.gradeLevel && <p className='text-xs text-red-600'>{errors.gradeLevel}</p>}
                    </div>
                </div>
                <Label htmlFor='sectionName' className='underline text-xl'>Add Section</Label>
                <div className="w-3/4 mx-auto">
                   
                    <div className='flex items-center gap-x-3 w-full '>
                        <Label htmlFor='sectionName' className=' text-nowrap'>
                            Section Name
                        </Label>
                        <div className="w-full">
                            <Input 
                                type="text" 
                                placeholder='Enter section name' 
                                id='sectionName' 
                                name="sectionName" 
                                value={formData.sectionName} 
                                onChange={handleChange} className='w-full'
                            />
                            {errors.sectionName && <p className='text-xs normal-case text-red-600'>{errors.sectionName}</p>}
                        </div>               
                    </div>
                </div>
            </CardContent>
        </Card>
        <div className="flex justify-end mt-5">
            <Button type="submit" >Save</Button>
        </div>
    </motion.div>
    
    </form>
  )
}

export default AdviserForm