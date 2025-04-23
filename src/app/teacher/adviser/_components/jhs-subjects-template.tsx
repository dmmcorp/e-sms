import React from 'react'
import JrGradesTemplate from './jhs-grade-template'
import { StudentWithSectionStudent } from '@/lib/types'
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';

interface JhsSubjectsTemplateProps {
    student: StudentWithSectionStudent
}
function JhsSubjectsTemplate({
    student
}: JhsSubjectsTemplateProps) {
    const subjects = useQuery(api.students.getSubjects, {
        sectionSubjects: student.sectionDoc.subjects,
        studentId: student._id
    });

    const schoolYear = student.sectionDoc.schoolYear
    const section =  student.sectionDoc.name
    const adviser = student.adviser.fullName
    const gradeLevel = student.sectionDoc.gradeLevel
 
  return (
    <div>
        <div className="grid grid-cols-12 gap-x-2 text-[0.55rem] font-semibold px-2 pt-1 border-t-black border-t border-x-black border-x leading-3">
            <h1 className="col-span-5 flex items-baseline leading-3">School : <input type="text" value={"Tanjay National High School (OPAO)" } className='bg-transparent border-b capitalize w-5 font-normal border-b-black flex-1 px-3  h-3' /> </h1>
            <h1 className="col-span-2 flex items-baseline leading-3">School ID: <input type="number" value={"303280"} className='bg-transparent border-b uppercase border-b-black font-normal flex-1 px-3  w-5 h-3' /> </h1>
            <h1 className="col-span-4 flex items-baseline leading-3">District: <input type="text" value={"Tanjay City, Negros Oriental" } className='bg-transparent border-b capitalize font-normal border-b-black flex-1 px-3 w-5  h-3' /> </h1>
            <h1 className="col-span-1 flex items-baseline leading-3">Region: <input type="text" value={"VII"} className='bg-transparent border-b capitalize border-b-black font-normal flex-1 w-5 h-3' /> </h1>
        </div>
        <div className="grid grid-cols-12 gap-x-2 font-semibold px-2 text-[0.55rem] pb-1 border-b-black border-b border-x-black border-x">
            <h1 className="col-span-2 flex items-baseline leading-3">Classified as Grade: <input type="text" value={gradeLevel} className='bg-transparent border-b font-normal capitalize w-5 border-b-black flex-1 px-3  h-3' /> </h1>
            <h1 className="col-span-2 flex items-baseline leading-3">Section: <input type="text" value={section} className='bg-transparent border-b capitalize w-10 font-normal border-b-black flex-1 px-3  h-3' /> </h1>
            <h1 className="col-span-2 flex items-baseline leading-3">School Year: <input type="text" value={schoolYear} className='bg-transparent border-b capitalize w-10 font-normal border-b-black flex-1 px-3  h-3' /> </h1>
            <h1 className="col-span-4 flex items-baseline leading-3">Name of Advisor/Teacher: <input type="text" value={adviser} className='bg-transparent border-b capitalize font-normal w-10 border-b-black flex-1 px-3  h-3' /> </h1>
            <h1 className="col-span-2 flex items-baseline leading-3">Signature: <input type="text" value={""} className='bg-transparent border-b capitalize w-10 border-b-black font-normal flex-1 px-3  h-3' /> </h1>
        </div>
        <JrGradesTemplate student={student} sf10 />
    </div>
  )
}

export default JhsSubjectsTemplate