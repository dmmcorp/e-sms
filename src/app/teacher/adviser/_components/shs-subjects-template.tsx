'use client'
import { GradeLevelsTypes, SemesterType, StudentWithSectionStudent, ShsSubject } from '@/lib/types'
import { useQuery } from 'convex/react';
import React, { useState } from 'react'
import { api } from '../../../../../convex/_generated/api';
import { calculateQuarterlyAverage, getPassFailStatus } from '@/lib/utils';

interface ShsSubjectsTemplateProps {
    student: StudentWithSectionStudent;
    level: GradeLevelsTypes;
    sem: SemesterType;
}
function ShsSubjectsTemplate({ student, level, sem }: ShsSubjectsTemplateProps) {

    const subjects = useQuery(api.students.getSubjects, {
        sectionSubjects: student.sectionDoc.subjects,
        studentId: student._id
    }) as ShsSubject[] | undefined;
    const schoolYear = student.sectionDoc.schoolYear
    const semester = student.sectionDoc.semester
    const section = student.sectionDoc.name
    const trackStrand = "STEM"

    // Filter core subjects based on category and semester
    const coreSubjects = subjects?.filter(s => s?.category === "core").filter(s => s?.semester?.includes(sem));

    // Filter applied and specialized subjects based on category and semester
    const appliedAndSpecialized = subjects?.filter(s => s?.category === "specialized").filter(s => s?.semester?.includes(sem));

    // Combine all subjects into a single array
    const allSubjects = [...(coreSubjects || []), ...(appliedAndSpecialized || [])];

    const generalAverage = allSubjects?.reduce((acc, subject) => {
        const average = calculateQuarterlyAverage(subject.grades);
        if (average !== null) {
            return acc + average;
        }
        return acc;
    }, 0);
    return (
        <div>
            <div className="">

                <div className="grid grid-cols-12 gap-x-2 text-[0.6rem] font-semibold">
                    <div className='flex col-span-5 uppercase'>School: <input type="text" value={"TANJAY NATIONAL HIGH SCHOOL (OPAO)"} className='border-b border-b-black flex-1 px-3 h-5 p-0 uppercase' /></div>
                    <div className='flex col-span-2 uppercase'>School Id: <input type="text" value={"303280"} className='border-b w-10 border-b-black flex-1 uppercase h-5' /></div>
                    <div className='flex col-span-2 uppercase'>Grade Level: <span className='border-b border-b-black flex-1 px-3'>{level}</span></div>
                    <div className='flex col-span-2 uppercase'>SY: {schoolYear} </div>
                    <div className='flex col-span-1 uppercase'>SEM: {<span className='border-b border-b-black flex-1 px-3'>{semester}</span>}</div>
                </div>
                <div className="grid grid-cols-12 gap-x-2 text-[0.6rem] pt-1 font-semibold mt-[-4px]">
                    <div className='flex col-span-7 uppercase'>TRACK/STRAND: {<span className='border-b border-b-black flex-1 px-3'>{trackStrand}</span>} </div>
                    <div className='flex col-span-5 uppercase'>SECTION: {<span className='border-b border-b-black flex-1 px-3'>{section}</span>}</div>
                </div>
            </div>
            <div className="grid grid-cols-12 border-y-black border-y  text-[0.5rem] leading-3 bg-gray-300 font-semibold mt-1">
                <div className="col-span-2 text-center border-l-black border-l  flex items-center justify-center py-1"><p>Indicate if Subject is CORE, APPLIED, or Specialized</p></div>
                <div className="col-span-6 flex items-center justify-center border-x-black border-x"><h1 className='uppercase text-center my-auto'>Subject</h1></div>
                <div className="col-span-2 text-center">
                    <h1 className='text-center border-b-black border-b h-1/2'>Quarter</h1>
                    <div className="grid grid-cols-2">
                        <div className='col-span-1 h-full'>{sem === "1st semester" ? "1st" : "3rd"}</div>
                        <div className='col-span-1 border-l-black border-l h-full flex-1'>{sem === "1st semester" ? "2nd" : "4th"}</div>
                    </div>
                </div>
                <div className="col-span-1 text-center  border-l-black border-l  flex items-center justify-center">
                    <p className=''>SEM FINAL GRADE</p>
                </div>
                <div className="col-span-1 text-center border-l-black border-l border-r border-r-black  flex items-center justify-center">
                    <p>ACTION <br /> TAKEN</p>
                </div>
            </div>

            {allSubjects ? allSubjects?.map((subject, index) => (
                <div key={subject?._id + index} className="grid grid-cols-12 border-b-black border-b  text-[0.6rem] h-[0.95rem]">
                    <div className="col-span-2 text-center border-l-black border-l h-full uppercase"><p>{subject?.category}</p></div>
                    <div className="col-span-6 flex items-center justify-start px-2 border-x-black border-x h-full"><h1 className='uppercase text-center my-auto'>{subject?.subjectName}</h1></div>
                    <div className="col-span-2 tex-center h-full">
                        <div className="grid grid-cols-2 h-full text-center">
                            <div className='col-span-1 h-full'> {sem === "1st semester" ? subject?.grades["1st"] : subject?.grades["3rd"]}</div>
                            <div className='col-span-1 border-l-black border-l h-full flex-1'>{sem === "1st semester" ? subject?.grades["2nd"] : subject?.grades["4th"]}</div>
                        </div>
                    </div>
                    <div className="col-span-1 text-center border-l-black border-l h-full">
                        <p className=''>{subject?.grades ? calculateQuarterlyAverage(subject.grades) : null}</p>
                    </div>
                    <div className="col-span-1 text-center border-l-black border-l border-r border-r-black h-full">
                        <p>{getPassFailStatus(calculateQuarterlyAverage(subject.grades))}</p>
                    </div>
                </div>
            )) : Array.from({ length: 12 }).map((_, index) => (
                <GradesInputsTemplate key={index} />
            ))}
            <div className="grid grid-cols-12 border-b-black border-b  text-[0.6rem]">
                <div className="col-span-10 text-right pt-1 px-1 border-l border-l-black border-b-black border-b font-semibold bg-gray-300">
                    <span>Gen Ave. for the Semester:</span>
                </div>

                <div className="border-l-black border-l border-b-black border-b flex items-center justify-center">
                    {generalAverage}
                </div>

                <div className="border-x-black border-x border-b-black border-b flex items-center justify-center">
                    {getPassFailStatus(generalAverage)}
                </div>
            </div>
            <div className="">
                <h1 className='flex items-baseline text-[0.6rem] mt-1'>REMARKS: <input type="text" className='border-b border-b-black flex-1 h-3 px-1' /></h1>
                <div className="grid grid-cols-12 text-[0.55rem] gap-x-10 mt-1">
                    <h3 className='col-span-4 mt-[-5px]'>Prepared by</h3>
                    <h3 className='col-span-5 mt-[-5px]'>Certified True and Correct:</h3>
                    <h3 className='col-span-3 mt-[-5px]'>Date Checked (MM/DD/YYYY):</h3>
                    <input type="text" className='border-b-black border-b col-span-4 mt-2 text-center uppercase h-4' />
                    <input type="text" className='border-b-black border-b col-span-5 mt-2 text-center uppercase h-4' />
                    <input type="text" className='border-b-black border-b col-span-3 mt-2 text-center uppercase h-4' />
                    <h3 className='text-center col-span-4'>Signature of Adviser over Printed Name</h3>
                    <h3 className='text-center col-span-5'>Signature of Authorized Person over Printed Name, Designation</h3>
                    <h3 className='text-center col-span-3'></h3>
                </div>
            </div>
            <div className="">
                {/* <RemedialTemplate forRemedial={forRemedial} filteredFinalGrade={filteredFinalGrade} isSHS={level ? Number(level) > 10 ? true : false : false}/> */}
            </div>
        </div>
    )
};

function GradesInputsTemplate() {
    const [input1Value, setInput1Value] = useState<string>('');
    const [input2Value, setInput2Value] = useState<string>('');



    const average = (input1Value && input2Value) ? (parseFloat(input1Value) + parseFloat(input2Value)) / 2 : '';

    return (
        <div className="grid grid-cols-12 border-b-black border-b  text-[0.6rem] h-[0.95rem]">
            <input type="text" className='col-span-2 bg-transparent text-center border-l-black border-l h-[0.95rem]  pt-1 uppercase' />
            <input type="text" className='col-span-6 bg-transparent border-x-black border-x h-[0.95rem]  pt-1 uppercase' />

            <input type="number" value={input1Value} onChange={e => setInput1Value(e.target.value)} className='col-span-1 h-[0.95rem] bg-transparent border-none text-center pt-1' />
            <input type="number" value={input2Value} onChange={e => setInput2Value(e.target.value)} className='col-span-1 h-[0.95rem] bg-transparent border-l-black border-l pt-1  text-center' />

            <div className="col-span-1 text-center border-l-black border-l h-full">
                <p className=''>{average}</p>
            </div>
            <div className="col-span-1 text-center border-l-black border-l border-r border-r-black h-full">
                <p>{typeof average === 'number' ? average <= 74 ? "Failed" : "Passed" : ""}</p>
            </div>
        </div>
    )
}

export default ShsSubjectsTemplate