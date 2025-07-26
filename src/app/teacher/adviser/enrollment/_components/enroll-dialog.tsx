'use client'
import { useMutation, useQuery } from 'convex/react';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { api } from '../../../../../../convex/_generated/api';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { StudentTypes } from '@/lib/types';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface EnrollDialogProps {
    assignDialog: boolean;
    setAssignDialog: (value: boolean) => void;
    fullName: string;
    student: StudentTypes
}

interface ErrorState  {
    section?: string;
    subjects?: string;
    // Add more fields as needed
  };
function EnrollDialog({
    assignDialog,
    setAssignDialog,
    fullName,
    student,
}: EnrollDialogProps) {
    const createLogs = useMutation(api.logs.createUserLogs);
    const [subjects, setSubjects] = useState<Id<'subjectTaught'>[]>([]);
    const [selectedAll, setSelectedAll] = useState<boolean>(false);
    const [isReturning, setIsReturning] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors]= useState<ErrorState>({});

    const searchParams = useSearchParams();
    const sectionId = searchParams.get('id');
    
    const section = useQuery(api.sections.getSection,{sectionId: sectionId as Id<'sections'>})
    const sectionSubjects = useQuery(api.sections.getSectionSubject, {sectionId: sectionId as Id<'sections'>})
    const addToSection = useMutation(api.enrollment.addToSection)
    
    const handleEnroll = () =>{
        if(!section || section === null) {
            setErrors(prev => ({
                ...prev,
                section: "Error: No section found."
            }));
        };
        if(subjects.length === 0) {
            setErrors(prev => ({
                ...prev,
                subjects: "Select a subject first."
            }));
        };
      
        // Prevent further processing if any validation fails
        if (!section || subjects.length === 0 || section === null) {
            return;
        } else {
            setErrors({})
        }

        setIsLoading(true)
        toast.promise(
            addToSection({
              studentId: student._id,
              schoolYear: section.schoolYear,
              gradeLevel: section.gradeLevel,
              status: "enrolled",
              subjects: subjects,
              isReturning: isReturning,
              sectionId: section._id,
            }),
            {
              loading: 'Enrolling student...',
              success: async ()=>{ 
                setIsLoading(false)
                setAssignDialog(false)
                await createLogs({
                    action: "update",
                    details: `Enrolled ${fullName} to the section`,
                });
                return 'Student successfully enrolled!'},
              error: async (error)=>{
                setIsLoading(false)
                await createLogs({
                    action: "update",
                    details: `Failed to enroll ${fullName} to the section`,
                });
                const errorMes = error.data ? error.data : 'Failed to enroll student. Please try again.'
                return errorMes},
            }
        )
    }
    
    useEffect(()=>{
        const isSelectedAll =  sectionSubjects?.every(s=> {
            return subjects.includes(s._id)
         }) ?? false

         if(isSelectedAll) {
            setSelectedAll(true)
         } else {
            setSelectedAll(false)
         }
    },[subjects, sectionSubjects])
     
  return (
    <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
    <DialogContent >
        <DialogTitle>
            Are you sure you want to add this student to your section?
        </DialogTitle>
        <div className="">
            <h1 className='capitalize'>{fullName}</h1>
        </div>
        <h1 className="text-xs font-semibold">Select subjects to enroll: {errors.subjects && <span className='text-red-600 text-xs'>{errors.subjects}</span>}</h1>
        <div className="flex items-center justify-start w-full gap-2">
            {sectionSubjects?.map((subject, index) => (
                <Badge  
                    key={`${subject}-${index}`}
                    className={cn(subjects?.includes(subject._id) ? "" : "text-black bg-muted shadow-sm", "hover:cursor-pointer")}
                >
                <label className='hover:cursor-pointer'>
                <Checkbox
                    checked={subjects?.includes(subject._id) || false}
                    onCheckedChange={(checked) => {
                        if(checked){
                            setSubjects([...subjects, subject._id])
                        } else {
                            const remove = subjects.filter(s => s !== subject._id)
                            setSubjects(remove)
                        }
                    }}
                    className='hidden'
                    disabled={subject.semester && subject.semester.length > 0}
                />
                <span className='capitalize'>{subject.subjectName}</span>
                </label>
                </Badge>
            ))}
            <Badge  className={cn( selectedAll ? "" : "text-black bg-muted shadow-sm" ,"hover:cursor-pointer")}>
                <label className='hover:cursor-pointer' >
                    <Checkbox
                        checked={selectedAll}
                        onCheckedChange={(checked) => {
                            if(checked){
                                const ids = sectionSubjects?.map((s)=>{ return s._id}) ?? []
                                setSubjects(ids)
                                setSelectedAll(true)
                            } else {
                                setSubjects([])
                                setSelectedAll(false)
                            }
                            
                        }}
                        className='hidden'
                    />
                    <span className='capitalize'>Select All</span>
                </label>
            </Badge>
        </div>
        <div className="flex gap-5">
            <Label className="text-xs font-semibold">Returning student?</Label>
            <RadioGroup 
            defaultValue="no" 
            className='flex'
            onValueChange={(value)=> {
                value==="no" ? setIsReturning(false) : setIsReturning(true)
            }}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Yes</Label>
                </div>
            </RadioGroup>
        </div>
        
        <DialogFooter>
            <Button variant={'secondary'} onClick={()=> setAssignDialog(false)}> Cancel</Button>
            <Button variant={'default'} onClick={handleEnroll}><UserPlus /> {isLoading ? "Adding..." : "Yes"}</Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
  )
}

export default EnrollDialog