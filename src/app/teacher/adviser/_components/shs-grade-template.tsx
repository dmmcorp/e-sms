import React from 'react'
import { StudentWithSectionStudent } from '@/lib/types'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { Doc } from '../../../../../convex/_generated/dataModel'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getAverageForShs } from '@/lib/utils'

function SrGradesTemplate({
    student,
    sf9,
    sem
}:{
    student: StudentWithSectionStudent
   
    sem: string
    sf9?: boolean
}) {
    const remedialGrades = useQuery(api.finalGrades.remedialGrades,{
        studentId: student._id,
        sectionId: student.sectionDoc?._id
    })
    function getRemedialGrade(remedialGrade: Doc<'finalGrades'>, subjectName: string): number | null {
        const subject = remedialGrade?.subjects.find((s) => s.subjectName.toLowerCase() === subjectName.toLowerCase());
        return subject?.remedialGrade ?? null;
    }

    // const subject = shsSubjectsByStrand.find((subject)=> subject.strand === strand)
    const coreSubjects = student.subjects.filter(s => s.subject.subjectCategory === "core" && s.semester === sem)
    const appliedAndSpecialied = student.subjects.filter(s => s.subject.subjectCategory === "specialied" || s.subject.subjectCategory === "applied" && s.semester === sem)
    
    const allSubjects = [...coreSubjects, ...appliedAndSpecialied]

    const averages = allSubjects.map((s)=>{
        const subjectName = s.subject.name
        const finalGrade = getAverageForShs(
            getStudentGrade(student.quarterlyGrades, s._id, sem === "1st" ? "1st" : "3rd"),
            getStudentGrade(student.quarterlyGrades, s._id, sem === "1st" ? "2nd" : "4th")
            )
        return {
            classId: s._id,
            subjectName: subjectName,
            finalGrade: finalGrade
        }
    })

    const generalAverage = getStudentGeneralAverage(coreSubjects, appliedAndSpecialied, student, sem);
    const genAve = typeof generalAverage === 'number' ? Math.round(generalAverage) : generalAverage;

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
            <h1 className='text-left text-xs font-semibold'>{sem} Semester</h1>
         )}
        <div className={`max-w-full flex ${sf9 ? 'text-[0.6rem]' : 'text-lg'} bg-gray-200 border border-black`}>
            <div className="w-[60%] font-bold flex items-center justify-center">
                <h1>Subject</h1>
            </div>
            <div className="w-[25%] font-bold border-x border-x-black">
                <h1 className='text-center border-b border-b-black'>Quarter</h1>
                <div className="grid grid-cols-2 text-center">
                    <h1 className='h-full'>{sem === "1st" ? "1" : "3"}</h1>
                    <h1 className='border-l h-full border-l-black'>{sem === "1st" ? "2" : "4"}</h1>
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
        {coreSubjects && coreSubjects.map((clss)=>(
            <div key={clss._id} className={`max-w-full flex ${sf9 ? 'text-[0.6rem] leading-[0.65rem]' : 'text-lg'} border border-black`}>
                <div className="w-[60%] font-bold flex items-center justify-start py-1 px-2 border-r-black border-r">
                    <h1>{clss.subject.name}</h1>
                </div>
                <div className="w-[25%] grid grid-cols-2 items-center font-bold border-r-black border-r">
                    <h1 className='text-center my-auto  h-full content-center border-r-black border-r'>{getStudentGrade(student.quarterlyGrades, clss._id, sem === "1st" ? "1st" : "3rd")}</h1>
                    <h1 className='text-center my-auto h-full content-center'>{getStudentGrade(student.quarterlyGrades, clss._id, sem === "1st" ? "2nd" : "4th")}</h1>
                
                </div>
                <div className="w-[15%] font-bold text-center ">
                    {getRemedialGrade(remedialGrades as Doc<'finalGrades'>, clss.subject.name) === null ? (
                        <h1 className='text-center my-auto h-full content-center'>{getAverageForShs(
                        getStudentGrade(student.quarterlyGrades, clss._id,  sem === "1st" ? "1st" : "3rd"),
                        getStudentGrade(student.quarterlyGrades, clss._id, sem === "1st" ? "2nd" : "4th")
                        )}</h1>
                    ) :(
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h1 className='text-center text-red-500 my-auto h-full content-center'>{getAverageForShs(
                                    getStudentGrade(student.quarterlyGrades, clss._id, sem === "1st" ? "1st" : "3rd"),
                                    getStudentGrade(student.quarterlyGrades, clss._id, sem === "1st" ? "2nd" : "4th")
                                    )}</h1>
                            </TooltipTrigger>
                            <TooltipContent className=' bg-white p-5 space-y-2 shadow-md'>
                                <p>Summer/remedial class Final Grade: {getRemedialGrade(remedialGrades as Doc<'finalGrades'>, clss.subject.name)} </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider> 
                    )}
                  
                </div>
            </div>
        ))}
       
         <div className={`max-w-full flex ${sf9 ? 'text-[0.6rem]' : 'text-lg'} font-bold bg-gray-200 border border-black`}>
            <div className="w-[60%] flex items-center justify-start px-2 py-1">
                <h1>Applied & Specialized Subjects</h1>
            </div>
        </div>
        {appliedAndSpecialied && appliedAndSpecialied.map((s)=>(
            <div key={s._id} className={`max-w-full flex ${sf9 ? 'text-[0.6rem]' : 'text-lg'} border border-black`}>
                <div className="w-[60%] font-bold flex items-center justify-start py-1 px-2 border-r-black border-r">
                    <h1>{s.subject.name}</h1>
                </div>
                <div className="w-[25%] grid grid-cols-2 items-center font-bold border-r-black border-r">
                    <h1 className='text-center my-auto  h-full content-center border-r-black border-r'>{getStudentGrade(student.quarterlyGrades, s._id, sem === "1st" ? "1st" : "3rd")}</h1>
                    <h1 className='text-center my-auto h-full content-center'>{getStudentGrade(student.quarterlyGrades, s._id, sem === "1st" ? "2nd" : "4th")}</h1>
                
                </div>
                <div className="w-[15%] font-bold text-center">
                    {getRemedialGrade(remedialGrades as Doc<'finalGrades'>, s.subject.name) === null ? (
                        <h1 className='text-center my-auto h-full content-center'>{getAverageForShs(
                        getStudentGrade(student.quarterlyGrades, s._id,  sem === "1st" ? "1st" : "3rd"),
                        getStudentGrade(student.quarterlyGrades, s._id, sem === "1st" ? "2nd" : "4th")
                        )}</h1>
                    ) :(
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h1 className='text-center text-red-500 my-auto h-full content-center'>{getAverageForShs(
                                    getStudentGrade(student.quarterlyGrades, s._id, sem === "1st" ? "1st" : "3rd"),
                                    getStudentGrade(student.quarterlyGrades, s._id, sem === "1st" ? "2nd" : "4th")
                                    )}</h1>
                            </TooltipTrigger>
                            <TooltipContent className=' bg-white p-5 space-y-2 shadow-md'>
                                <p>Summer/remedial class Final Grade: {getRemedialGrade(remedialGrades as Doc<'finalGrades'>, s.subject.name)} </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider> 
                    )}
                </div>
            </div>
        ))}

        <div className={`max-w-full flex ${sf9 ? 'text-[0.6rem]' : 'text-lg'} font-bold border border-black `}>
            <div className={`w-[85%] text-right tracking-widest ${sf9 ? 'text-[0.6rem]' : 'text-xl'} border-r border-r-black px-2 py-1`}>General Average for this Semester</div>
            <div className="w-[15%] content-center text-center">{genAve}</div>
        </div>
    </div>
  )
}

export default SrGradesTemplate