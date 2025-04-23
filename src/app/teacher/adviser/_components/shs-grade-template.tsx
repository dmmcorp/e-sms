'use client'
import React from 'react'
import { SemesterType, StudentWithSectionStudent, ShsSubject } from '@/lib/types'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { Doc } from '../../../../../convex/_generated/dataModel'
import { calculateQuarterlyAverage } from '@/lib/utils'

function SrGradesTemplate({
    student,
    sf9,
    sem
}:{
    student: StudentWithSectionStudent
   
    sem: SemesterType
    sf9?: boolean
}) {
    // Query to fetch remedial grades for the student in the current section
    const remedialGrades = useQuery(api.finalGrades.remedialGrades, {
        studentId: student._id,
        sectionId: student.sectionDoc?._id
    });

    // Query to fetch subjects for the student in the current section
    const subjects = useQuery(api.students.getSubjects, {
        sectionSubjects: student.sectionDoc.subjects,
        studentId: student._id
    }) as ShsSubject[] | undefined;



    // Function to get the remedial grade for a specific subject
    function getRemedialGrade(remedialGrade: Doc<'finalGrades'>, subjectName: string): number | null {
        const subject = remedialGrade?.subjects.find((s) => s.subjectName.toLowerCase() === subjectName.toLowerCase());
        return subject?.remedialGrade ?? null;
    }

    // Filter core subjects based on category and semester
    const coreSubjects = subjects?.filter(s => s.category === "core" && s.semester.includes(sem));

    // Filter applied and specialized subjects based on category and semester
    const appliedAndSpecialized = subjects?.filter(s => s.category === "specialized" && s.semester.includes(sem));

    // Combine all subjects into a single array
    const allSubjects = [...(coreSubjects || []), ...(appliedAndSpecialized || [])];

    // Function to calculate the average of quarterly grades
    function calculateQuarterlyAverage(grades: { "1st": number | undefined; "2nd": number | undefined; "3rd": number | undefined; "4th": number | undefined; } | undefined): number | null {
        if (!grades) return null;
        const validGrades = Object.values(grades).filter((grade): grade is number => grade !== undefined);
        if (validGrades.length === 0) return null;
        const sum = validGrades.reduce((acc, grade) => acc + grade, 0);
        return sum / validGrades.length;
    }

  return (
    <div className="max-w-full">
        {!sf9 && (
            <div className="flex justify-end">
             {/* <FinalizeGradesDialog student={student} averages={averages} generalAverage={genAve}/> */}
            </div>
        )}
        {!sf9 ? (
            <h1 className='text-center'>LEARNER&apos;S PROGRESS REPORT CARD</h1>
         ): (
            <h1 className='text-left text-xs font-semibold capitalize'>{sem}</h1>
         )}
        <div className={`max-w-full flex ${sf9 ? 'text-[0.6rem]' : 'text-lg'} bg-gray-200 border border-black`}>
            <div className="w-[60%] font-bold flex items-center justify-center">
                <h1>Subject</h1>
            </div>
            <div className="w-[25%] font-bold border-x border-x-black">
                <h1 className='text-center border-b border-b-black'>Quarter</h1>
                <div className="grid grid-cols-2 text-center">
                    <h1 className='h-full'>{sem === "1st semester" ? "1" : "3"}</h1>
                    <h1 className='border-l h-full border-l-black'>{sem === "1st semester" ? "2" : "4"}</h1>
                </div>
            </div>
            <div className="w-[15%] font-bold text-center">
                <h1>Semester</h1>
                <h1>Final Grade</h1>
            </div>
        </div>
        <div className={`max-w-full flex ${sf9 ? 'text-[0.6rem]' : 'text-lg'} font-bold bg-gray-200 border border-black`}>
            <div className="w-[60%] flex items-center justify-start px-2 py-1">
                <h1>Core Subjects</h1>
            </div>
        </div>
        {coreSubjects && coreSubjects.map((subject)=>(
            <div key={subject?._id} className={`max-w-full flex ${sf9 ? 'text-[0.6rem] leading-[0.65rem]' : 'text-lg'} border border-black`}>
                <div className="w-[60%] font-bold flex items-center justify-start py-1 px-2 border-r-black border-r">
                    <h1>{subject?.subjectName}</h1>
                </div>
                <div className="w-[25%] grid grid-cols-2 items-center font-bold border-r-black border-r">
                    <h1 className='text-center my-auto h-full content-center border-r-black border-r'>
                        {sem === "1st semester" ? subject?.grades["1st"] : subject?.grades["3rd"]}
                    </h1>
                    <h1 className='text-center my-auto h-full content-center'>
                         {sem === "1st semester" ? subject?.grades["2nd"] : subject?.grades["4th"]}
                    </h1>
                </div>
                <div className="w-[15%] font-bold text-center "> 
                    <h1 className='text-center my-auto h-full content-center'>{subject?.grades ? calculateQuarterlyAverage(subject.grades) : null}</h1>
                </div>
            </div>
        ))}
       
         <div className={`max-w-full flex ${sf9 ? 'text-[0.6rem]' : 'text-lg'} font-bold bg-gray-200 border border-black`}>
            <div className="w-[60%] flex items-center justify-start px-2 py-1">
                <h1>Applied & Specialized Subjects</h1>
            </div>
        </div>
        {appliedAndSpecialized && appliedAndSpecialized.map((subject)=>(
            <div key={subject?._id} className={`max-w-full flex ${sf9 ? 'text-[0.6rem] leading-[0.65rem]' : 'text-lg'} border border-black`}>
            <div className="w-[60%] font-bold flex items-center justify-start py-1 px-2 border-r-black border-r">
                <h1>{subject?.subjectName}</h1>
            </div>
            <div className="w-[25%] grid grid-cols-2 items-center font-bold border-r-black border-r">
                <h1 className='text-center my-auto h-full content-center border-r-black border-r'>
                    {sem === "1st semester" ? subject?.grades["1st"] : subject?.grades["3rd"]}
                </h1>
                <h1 className='text-center my-auto h-full content-center'>
                     {sem === "1st semester" ? subject?.grades["2nd"] : subject?.grades["4th"]}
                </h1>
            </div>
            <div className="w-[15%] font-bold text-center "> 
                <h1 className='text-center my-auto h-full content-center'>{subject?.grades ? calculateQuarterlyAverage(subject.grades) : null}</h1>
            </div>
        </div>
        ))}

        <div className={`max-w-full flex ${sf9 ? 'text-[0.6rem]' : 'text-lg'} font-bold border border-black `}>
            <div className={`w-[85%] text-right tracking-widest ${sf9 ? 'text-[0.6rem]' : 'text-xl'} border-r border-r-black px-2 py-1`}>General Average for this Semester</div>
            <div className="w-[15%] content-center text-center">{}</div>
        </div>
    </div>
  )
}

export default SrGradesTemplate