import React from 'react'
import JrGradesTemplate from './jhs-grade-template'
import { OrganizedGrade } from '@/lib/types'
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import JhsEmptyGrades from './jhs-empty-grades';
import RemedialTemplate from './remedial-template';

interface JhsSubjectsTemplateProps {

    record: OrganizedGrade
}
function JhsSubjectsTemplate({

    record
}: JhsSubjectsTemplateProps) {
    const sectionStudentId = record.data?.sectionStudentId
    const student = useQuery(api.students.getStudentSection, {
        sectionStudentId: sectionStudentId as Id<'sectionStudents'>
    })
    const noRecord = !student || student == null
    const schoolYear = record.data?.schoolYear
    const section =  record.data?.name
    const adviser = record.data?.adviser?.fullName
    const gradeLevel = record.data?.gradeLevel
    const isSHS = record.gradeLevel === "Grade 11" || record.gradeLevel === "Grade 12" 
 
  return (
    <div className='mb-5 mt-1 border-t-black border-t'>
        <div className="grid grid-cols-12 gap-x-2 text-[0.55rem] font-semibold px-2 pt-1 border-t-black border-t border-x-black border-x leading-3">
            <h1 className="col-span-5 flex items-baseline leading-3">School : <span className='bg-transparent border-b capitalize w-full font-normal border-b-black flex-1 px-3 h-3'>{noRecord ? "" : "Tanjay National High School (OPAO)"}</span> </h1>
            <h1 className="col-span-2 flex items-baseline leading-3">School ID: <span className='bg-transparent border-b uppercase border-b-black font-normal flex-1 px-3 w-full h-3'>{noRecord ? "" : "303280"}</span> </h1>
            <h1 className="col-span-4 flex items-baseline leading-3">District: <span className='bg-transparent border-b capitalize font-normal border-b-black flex-1 px-3 w-full h-3'>{noRecord ? "" : "Tanjay City, Negros Oriental"}</span> </h1>
            <h1 className="col-span-1 flex items-baseline leading-3">Region: <span className='bg-transparent border-b capitalize border-b-black font-normal flex-1 w-full h-3'>{noRecord ? "" : "VII"}</span> </h1>
        </div>
        <div className="grid grid-cols-12 gap-x-2 font-semibold px-2 text-[0.55rem] pb-1 border-b-black border-b border-x-black border-x">
            <h1 className="col-span-2 flex items-baseline leading-3">Classified as Grade: <span className='bg-transparent border-b font-normal capitalize w-full border-b-black flex-1 px-3 h-3'>{gradeLevel}</span> </h1>
            <h1 className="col-span-2 flex items-baseline leading-3">Section: <span className='bg-transparent border-b capitalize w-full font-normal border-b-black flex-1 px-3 h-3'>{section}</span> </h1>
            <h1 className="col-span-2 flex items-baseline leading-3">School Year: <span className='bg-transparent border-b capitalize w-full font-normal border-b-black flex-1 px-3 h-3'>{schoolYear}</span> </h1>
            <h1 className="col-span-4 flex items-baseline leading-3">Name of Advisor/Teacher: <span className='bg-transparent border-b capitalize font-normal w-full border-b-black flex-1 px-3 h-3'>{adviser}</span> </h1>
            <h1 className="col-span-2 flex items-baseline leading-3">Signature: <span className='bg-transparent border-b capitalize w-full border-b-black font-normal flex-1 px-3 h-3'></span> </h1>
        </div>
        {(!student || student === null) ? (
            <>
                <JhsEmptyGrades />
                <RemedialTemplate />
            </>
        ): (
            <div className="">
                <JrGradesTemplate student={student} sf10 />
                <RemedialTemplate student={student} isSHS={isSHS}/>
            </div>
        ) }
      
        
    </div>
  )
}

export default JhsSubjectsTemplate