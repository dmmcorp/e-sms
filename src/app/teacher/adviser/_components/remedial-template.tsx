
import { StudentWithSectionStudent } from '@/lib/types';
import { useQuery } from 'convex/react';
import React, { useState } from 'react'
import { api } from '../../../../../convex/_generated/api';

function RemedialTemplate({student, isSHS}:{
    student?: StudentWithSectionStudent,
    isSHS?: boolean
}) {
    const forRemedialSubjects = useQuery(api.finalGrades.getFinalGradesForSF10, {studentId: student?._id, sectionId:student?.sectionDoc._id})
    
    const formatDateString = (dateString?: string) => {
        if (!dateString || isNaN(new Date(dateString).getTime())) {
            return '';
        }
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month < 10 ? '0' : ''}${month}/${day < 10 ? '0' : ''}${day}/${year}`;
    };

    const remedialConductedFrom = forRemedialSubjects?.[0]?.remedialConductedFrom || '';
    const remedialConductedTo = forRemedialSubjects?.[0]?.remedialConductedTo || '';

  return (
    <div>
        {isSHS ? (
        <>
            <div className="grid grid-cols-12 border-y-black border-y mt-2 text-[0.5rem] bg-gray-300 font-semibold leading-3">
                <div className="col-span-2 text-center border-l-black border-l  flex items-center justify-center py-1 px-2"><p>Indicate if Subject is CORE, APPLIED, or Specialized</p></div>
                <div className="col-span-6 flex items-center justify-center border-x-black border-x">
                    <h1 className='uppercase text-center my-auto'>Subject</h1>
                </div>
                <div className="col-span-1 flex items-center justify-center text-center px-1">
                    <p className=''>SEM FINAL GRADE</p>
                </div>
                <div className="col-span-1 flex items-center justify-center text-center border-l-black border-l border-r border-r-black">
                    <p>REMEDIAL CLASS <br /> MARK</p>
                </div>
                <div className="col-span-1 text-center text-[0.5rem]  flex items-center justify-center">
                    <p>RECOMPUTED <br /> FINAL GRADE</p>
                </div>
                <div className="col-span-1 text-center border-l-black border-l border-r border-r-black flex items-center justify-center">
                    <p>ACTION <br /> TAKEN</p>
                </div>
            </div>
            {forRemedialSubjects ? Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid grid-cols-12 border-b-black border-b text-[0.6rem] font-semibold h-[0.95rem]">
                <div className="col-span-2 text-center border-l-black border-l  flex items-center justify-center"><p>{forRemedialSubjects[index]?.subject.category || ''}</p></div>
                <div className="col-span-6 flex items-center justify-center border-x-black border-x">
                    <h1 className='uppercase text-center my-auto'>{forRemedialSubjects[index]?.subject.subjectName || ''}</h1>
                </div>
                <div className="col-span-1 flex items-center justify-center text-center px-1">
                    <p className=''>{forRemedialSubjects[index]?.generalAverage || ''}</p>
                </div>
                <div className="col-span-1 flex items-center justify-center text-center border-l-black border-l border-r border-r-black">
                    <p>{forRemedialSubjects[index]?.remedialGrade || ''}</p>
                </div>
                <div className="col-span-1 text-center  flex items-center justify-center">
                    <p>{forRemedialSubjects[index] && typeof forRemedialSubjects[index].remedialGrade === 'number' ? Math.round((forRemedialSubjects[index].generalAverage + forRemedialSubjects[index].remedialGrade) / 2) : ''}</p>
                </div>
                <div className="col-span-1 text-center border-l-black border-l border-r border-r-black flex items-center justify-center">
                    <p>{forRemedialSubjects[index] ? Math.round((forRemedialSubjects[index].generalAverage + (forRemedialSubjects[index].remedialGrade ?? 0)) / 2) <= 74 ? "Failed" : "Passed" : ''}</p>
                </div>
            </div>
            )) :  Array.from({ length: 4 }).map((_, index) => (
            <InputGrades key={index}/>
            ))}
            <div className="grid grid-cols-12 gap-x-10 mt-1 text-[0.6rem]">
                <h1 className='col-span-8 flex items-baseline gap-x-2'>Name of Teacher/Adviser: <span className='border-b-black border-b flex-1 px-3 h-5 capitalize'>{student?.adviser.fullName}</span></h1>
                <h1 className='col-span-4 flex  gap-x-2'>Signature: <span className='border-b-black border-b flex-1 h-5'></span></h1>
            </div>
        </>
        ) : (
            <div className="text-xs border border-black text-[0.6rem]">
                <div className="grid grid-cols-12 font-semibold text-[0.6rem]">
                    <h1 className='col-span-4 text-center flex items-center justify-center'>Remedial Classes</h1>
                    <div className="col-span-8 flex border-l border-l-black px-2 py-1">
                        <h1 className='flex items-baseline flex-1'>Conducted from (mm/dd/yyyy) <span className='border-b border-b-black px-2 flex-1'>{formatDateString(remedialConductedFrom)}</span></h1>
                        <h1 className='flex items-baseline flex-1'>to (mm/dd/yyyy) <span className='border-b border-b-black flex-1 px-2'>{formatDateString(remedialConductedTo)}</span></h1>
                    </div>
                </div>
                <div className="grid grid-cols-12 border-y-black border-y font-semibold text-[0.6rem]">
                    <h1 className='text-center col-span-4 flex items-center justify-center'>Learning Areas</h1>
                    <h1 className='text-center col-span-2 border-l border-l-black flex items-center justify-center '>Final Rating</h1>
                    <h1 className='text-center col-span-2  border-l border-l-black flex items-center justify-center '>Remedial Class Mark</h1>
                    <h1 className='text-center col-span-2  border-l border-l-black flex items-center justify-center'>Recomputed Final Grade</h1>
                    <h1 className='text-center col-span-2  border-l border-l-black flex items-center justify-center '>Remarks</h1>

                </div>
                
                {forRemedialSubjects ? Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-12 items-center border-b-black border-b text-[0.6rem]">
                        <h1 className='text-center col-span-4 flex items-center justify-center h-3'>{forRemedialSubjects[index]?.subject.subjectName || ''}</h1>
                        <h1 className='text-center col-span-2 border-l border-l-black flex items-center justify-center  h-3'>{forRemedialSubjects[index]?.generalAverage || ''}</h1>
                        <h1 className='text-center col-span-2 border-l border-l-black flex items-center justify-center  h-3'>{forRemedialSubjects[index]?.remedialGrade ?? ''}</h1>
                        <h1 className='text-center col-span-2 border-l border-l-black flex items-center justify-center  h-3'>{forRemedialSubjects[index] && typeof forRemedialSubjects[index].remedialGrade === 'number' ? Math.round((forRemedialSubjects[index].generalAverage + forRemedialSubjects[index].remedialGrade) / 2) : ''}</h1>
                        <h1 className='text-center col-span-2 border-l border-l-black flex items-center justify-center  h-3'>{forRemedialSubjects[index] ? Math.round((forRemedialSubjects[index].generalAverage + (forRemedialSubjects[index].remedialGrade ?? 0)) / 2) <= 74 ? "Failed" : "Passed" : ''}</h1>
                    </div>
                )) : Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-12 items-center border-b-black border-b text-[0.6rem]">
                        <h1 className='text-center col-span-4 flex items-center justify-center h-3'></h1>
                        <h1 className='text-center col-span-2 border-l border-l-black flex items-center justify-center  h-3'></h1>
                        <h1 className='text-center col-span-2 border-l border-l-black flex items-center justify-center  h-3'></h1>
                        <h1 className='text-center col-span-2 border-l border-l-black flex items-center justify-center  h-3'></h1>
                        <h1 className='text-center col-span-2 border-l border-l-black flex items-center justify-center  h-3'></h1>
                    </div>
                ))}
            </div>
        )}
    
    </div>
  )
}

export default RemedialTemplate


function InputGrades () {
    const [input1Value, setInput1Value] = useState('')
    const [input2Value, setInput2Value] = useState('')

    const average = (input1Value && input2Value) ? (parseFloat(input1Value) + parseFloat(input2Value)) / 2 : '';
    return (
        <div  className="grid grid-cols-12 border-b-black border-b text-[0.6rem] font-semibold h-[0.95rem] ">
                <div className="col-span-2 text-center border-l-black border-l flex items-center justify-center"><input type="text" className='bg-transparent w-full uppercase h-[0.95rem] text-center' /></div>
                <div className="col-span-6 flex items-center justify-center border-x-black border-x">
                    <input type="text" className='uppercase text-left px-2 bg-transparent w-full h-full' />
                </div>
                <div className="col-span-1 flex items-center justify-center text-center px-1">
                    {/* input 1 */}
                    <input type="number" onChange={e => setInput1Value(e.target.value)} className='bg-transparent text-center size-full' />
                </div>
                <div className="col-span-1 flex items-center justify-center text-center border-l-black border-l border-r border-r-black">
                      {/* input 1 */}
                    <input type="number" onChange={e => setInput2Value(e.target.value)} className='bg-transparent text-center size-full' />
                </div>
                <div className="col-span-1 text-center flex items-center justify-center">
                    {/* recomputed final Grade */}
                    {average}
                </div>
                <div className="col-span-1 text-center border-l-black border-l border-r border-r-black flex items-center justify-center">
                    {/* Passed or failed */}
                    {typeof average === 'number' ? average <= 74 ? "Failed": "Passed" : ""}
                </div>
        </div>
    )
}