'use client'

import React, { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { Doc } from '../../../../../convex/_generated/dataModel'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { StudentWithSectionStudent } from '@/lib/types'
import { cn } from '@/lib/utils'
import CustomTooltip from './custom-tooltip'

interface JrGradesTemplateProps {
    student: StudentWithSectionStudent,
    sf9?: boolean
}
function JrGradesTemplate({student,sf9}:JrGradesTemplateProps) {
    const remedialGrades = useQuery(api.finalGrades.remedialGrades,{
        studentId: student._id,
        sectionId: student.sectionDoc?._id
    })
    const subjects = useQuery(api.students.getSubjects, {
        sectionSubjects: student.sectionDoc.subjects,
        studentId: student._id
    })

    console.log(subjects)
   
    function getRemedialGrade(remedialGrade: Doc<'finalGrades'>, subjectName: string): number | null {
        const subject = remedialGrade?.subjects.find((s) => s.subjectName.toLowerCase() === subjectName.toLowerCase());
        return subject?.remedialGrade ?? null;
    }

  function calculateQuarterlyAverage(grades: { "1st": number | undefined; "2nd": number | undefined; "3rd": number | undefined; "4th": number | undefined; } | undefined): number | null {
      if (!grades) return null;
      const validGrades = Object.values(grades).filter((grade): grade is number => grade !== undefined);
      if (validGrades.length === 0) return null;
      const sum = validGrades.reduce((acc, grade) => acc + grade, 0);
      return sum / validGrades.length;
  }

  function getPassFailStatus(quarterlyAverage: number | null): string {
      if (quarterlyAverage === null) return "";
      return quarterlyAverage > 74 ? "Passed" : "Failed";
  }

  return (
    <div className='text-sm md:text-sm w-full gap-x-10'>
        <h1 className={cn('text-lg font-semibold text-center ')}>REPORT ON LEARNING PROGRESS AND ACHIEVEMENT</h1>
    
        <div className="grid grid-cols-12 w-full  items-center text-center font-semibold text-sm md:text-sm ">
            <div className='col-span-4 h-full flex items-center justify-center border-x border-x-black border-b-black border-b border-t-black border-t'>Learning Areas</div>
            <div className="col-span-4 grid grid-cols-4 text-center items-center ">
                <div className={cn("col-span-4 border-b border-black border-r border-r-black border-y border-y-black", sf9 ? 'text-sm p-1' : 'p-2')}>Quarter</div>
                {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className={cn("col-span-1 border-b border-black border-r border-r-black", sf9 ? 'text-sm p-1' : 'p-2')}>
                        {i + 1}
                    </div>
                ))}
            </div>
            <h1 className='col-span-2 flex items-center border-y border-y-black border-r-black border-r justify-center h-full'>Final <br/> Rating</h1>
            <h1 className='col-span-2 flex items-center justify-center h-full border-y border-y-black border-r-black border-r '>Remarks</h1>
        </div>
        
        {subjects && subjects.map((subject) =>(
            <div key={subject?._id} className="grid grid-cols-12 w-full  items-center text-center font-semibold text-sm md:text-sm ">
                <div className='col-span-4 h-full flex items-center justify-center border-x border-x-black border-b-black border-b border-t-black border-t'>{subject?.subjectName}</div>
                
                {["1st", "2nd", "3rd", "4th"].map((quarter) => {
                    const interventionGrade = subject?.interventionGrade
                    const grade = subject?.grades[quarter as keyof typeof subject.grades];
                    return (
                        <div key={quarter} className={cn( 'col-span-1  border-b border-black border-r h-full')}>

                            {interventionGrade ? (
                                <CustomTooltip
                                    trigger={<span>{grade}</span>}
                                    interventionRemarks={subject.interventionRemarks || ""}
                                    interventionUsed={subject.interventionUsed || []}
                                />
                            ): grade ?? " "}
                        </div>
                    );
                })}
              
                <div className={cn( sf9 ? 'text-sm p-1' : 'p-2', 'h-full col-span-2 border-b border-black border-r ')}>
                    {subject?.grades ? calculateQuarterlyAverage(subject.grades) : null}
                </div>
                <div className={cn( sf9 ? 'text-sm p-1' : 'p-2', 'col-span-2 border-b border-black border-r h-full')}>{getPassFailStatus(calculateQuarterlyAverage(subject?.grades))}</div>
           </div>
        ))}

        {sf9 && (
            <div className="mt-5">
             <div className="grid grid-cols-3 font-semibold">
                 <h1>Descriptors</h1>
                 <h1>Grade Scaling</h1>
                 <h1>Remarks</h1>
             </div>
             <div className="grid grid-cols-3">
                <h1>Outstanding</h1>
                <h1>90-100</h1>
                <h1>Passed</h1>
             </div>
             <div className="grid grid-cols-3">
                <h1>Very Satisfactory</h1>
                <h1>85-89</h1>
                <h1>Passed</h1>
             </div>
             <div className="grid grid-cols-3">
                <h1>Satisfactory</h1>
                <h1>80-84</h1>
                <h1>Passed</h1>
             </div>
             <div className="grid grid-cols-3">
                <h1>Fairly Satisfactory</h1>
                <h1>75-79</h1>
                <h1>Passed</h1>
             </div>
             <div className="grid grid-cols-3">
                <h1>Did Not Meet Expect</h1>
                <h1>Below 76</h1>
                <h1>Failed</h1>
             </div>
         </div>
        )}
       
    </div>
  )
}

export default JrGradesTemplate