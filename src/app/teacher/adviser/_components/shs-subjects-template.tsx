'use client'
import { OrganizedGrade } from '@/lib/types'
import { useQuery } from 'convex/react';
import React, { useState } from 'react'
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import SrGradesTemplate from './shs-grade-template';
import RemedialTemplate from './remedial-template';
import { convertSemesterToNumber } from '@/lib/utils';

interface ShsSubjectsTemplateProps {
   record: OrganizedGrade
}
function ShsSubjectsTemplate({ record }: ShsSubjectsTemplateProps) {
    const sectionStudentId = record.data?.sectionStudentId
    const student = useQuery(api.students.getStudentSection, {
        sectionStudentId: sectionStudentId as Id<'sectionStudents'>
    })
    const noRecord = !student || student == null
    const schoolYear = record.data?.schoolYear
    const section =  record.data?.name
    const adviser = record.data?.adviser?.fullName
    const gradeLevel = record.data?.gradeLevel
    const semester = record.data?.semester
    const isSHS = record.gradeLevel === "Grade 11 - 1st semester" || 
                record.gradeLevel === "Grade 11 - 2nd semester" ||
                record.gradeLevel === "Grade 12 - 1st semester" ||
                record.gradeLevel === "Grade 12 - 2nd semester"
  return (
    <div className='mt-2'>
        <div className="">
          
            <div className="grid grid-cols-12 gap-x-2 text-[0.6rem] font-semibold">
                <div className='flex col-span-5 uppercase'>School: <span className='border-b border-b-black flex-1 px-3 h-5 p-0 uppercase'>{noRecord ? "" : "TANJAY NATIONAL HIGH SCHOOL (OPAO)"}</span></div>
                <div className='flex col-span-2 uppercase'>School Id: <span className='border-b w-10 border-b-black flex-1 uppercase h-5'>{noRecord ? "" : "303280"}</span></div>
                <div className='flex col-span-2 uppercase'>Grade Level: <span className='border-b border-b-black flex-1 px-3'>{gradeLevel}</span></div>
                <div className='flex col-span-2 uppercase'>SY: <span className='border-b border-b-black flex-1 px-3'>{schoolYear}</span> </div>
                <div className='flex col-span-1 uppercase'>SEM: {<span className='border-b border-b-black flex-1 px-3'>{convertSemesterToNumber(semester)}</span>}</div>
            </div>
            <div className="grid grid-cols-12 gap-x-2 text-[0.6rem] pt-1 font-semibold mt-[-4px]">
                <div className='flex col-span-7 uppercase'>TRACK/STRAND: {<span className='border-b border-b-black flex-1 px-3'>{}</span>} </div>
                <div className='flex col-span-5 uppercase'>SECTION: {<span className='border-b border-b-black flex-1 px-3'>{section}</span>}</div>
            </div>
        </div>
        <div className="grid grid-cols-12 border-y-black border-y  text-[0.5rem] leading-3 bg-gray-300 font-semibold mt-1">
            <div className="col-span-2 text-center border-l-black border-l px-2  flex items-center justify-center py-1"><p>Indicate if Subject is CORE, APPLIED, or Specialized</p></div>
            <div className="col-span-6 flex items-center justify-center border-x-black border-x"><h1 className='uppercase text-center my-auto'>Subject</h1></div>
            <div className="col-span-2 text-center grid grid-cols-2">
                <h1 className='col-span-2 text-center border-b-black border-b'>Quarter</h1>
              
                <div className='col-span-1 h-full '>{semester === "1st semester" ? "1st" : "3rd"}</div>
                <div className='col-span-1 border-l border-l-black'>{semester === "1st semester" ? "2nd" : "4th"}</div>
               
            </div>
            <div className="col-span-1 text-center  border-l-black border-l  flex items-center justify-center">
                <p className=''>SEM FINAL GRADE</p>
            </div>
            <div className="col-span-1 text-center border-l-black border-l border-r border-r-black  flex items-center justify-center">
                <p>ACTION <br /> TAKEN</p>
            </div>
        </div>
        
        {!student || student === null?  Array.from({ length: 11 }).map((_, index) => (
           <GradesInputsTemplate key={index}/>
        )) : semester && (
            <SrGradesTemplate student={student} sem={semester} sf10/>
        )}
        <div className="">
            <h1 className='flex items-baseline text-[0.6rem] mt-1'>REMARKS: <span className='border-b border-b-black flex-1 h-3 px-1'></span></h1>
            <div className="grid grid-cols-12 text-[0.55rem] gap-x-10 mt-1">
            <h3 className='col-span-4 mt-[-5px]'>Prepared by</h3>
            <h3 className='col-span-5 mt-[-5px]'>Certified True and Correct:</h3>
            <h3 className='col-span-3 mt-[-5px]'>Date Checked (MM/DD/YYYY):</h3>
            <span className='border-b-black border-b col-span-4 mt-2 text-center uppercase h-4'></span>
            <span className='border-b-black border-b col-span-5 mt-2 text-center uppercase h-4'></span>
            <span className='border-b-black border-b col-span-3 mt-2 text-center uppercase h-4'></span>
            <h3 className='text-center col-span-4'>Signature of Adviser over Printed Name</h3>
            <h3 className='text-center col-span-5'>Signature of Authorized Person over Printed Name, Designation</h3>
            <h3 className='text-center col-span-3'></h3>
            </div>
        </div>
        <div className="">
           
            <RemedialTemplate isSHS={isSHS}/>
          
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