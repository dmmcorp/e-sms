'use client'
import React, { useEffect, useState } from 'react'

import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { Doc } from '../../../../../convex/_generated/dataModel'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { StudentWithSectionStudent } from '@/lib/types'
import Attendance from './attendance'

interface SF9FrontTemplateProps{
    student: StudentWithSectionStudent
    
}
function SF9FrontTemplate({student}: SF9FrontTemplateProps) {
    const systemSettings = useQuery(api.systemSettings.get)
  
    const attendance = useQuery(api.attendance.get, {
        studentId: student?._id,
        sectionStudentId: student?.sectionStudentId
    })
    const [isSHS, setIsSHS] = useState<boolean>(false)
    const principal = useQuery(api.principal.getGradeLevelPrincipal, {
        type: isSHS ? "senior-high" : "junior-high"
    });


    useEffect(()=>{
        if(student.sectionDoc?.gradeLevel === "Grade 11" || student.sectionDoc?.gradeLevel === "Grade 12") {
            setIsSHS(true)
        }
    },[student])

    function getStudentAge(birthday: string): number {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
  return (
    <div className='grid grid-cols-2 gap-x-10 p-10  text-black  w-full border-2 rounded-2xl'>
        <div className={cn(isSHS ? "py-10" : "py-0")}>
            
            <Attendance attendance={attendance as Doc<'attendance'>}  student={student}/>

            <div className="my-5 space-y-2">
                <h1 className='uppercase font-semibold font-serif tracking-wide text-center'>Parent / Guardian Signature</h1>
                <div className="grid grid-cols-3 gap-x-3 px-10 items-baseline">
                    <h1 className=''>1st Quarter</h1>
                    <h1 className='border-b border-b-black col-span-2'></h1>
                </div>
                <div className="grid grid-cols-3 gap-x-3 px-10 items-baseline">
                    <h1 className=''>2nd Quarter</h1>
                    <h1 className='border-b border-b-black col-span-2'></h1>
                </div> 
                <div className="grid grid-cols-3 gap-x-3 px-10 items-baseline">
                    <h1 className=''>3rd Quarter</h1>
                    <h1 className='border-b border-b-black col-span-2'></h1>
                </div>
                <div className="grid grid-cols-3 gap-x-3 px-10 items-baseline">
                    <h1 className=''>4th Quarter</h1>
                    <h1 className='border-b border-b-black col-span-2'></h1>
                </div>
            </div>
            {!isSHS && (   
                <div className="font-serif">
                   <h1 className='text-center font-semibold font-serif'>Certificate of Transfer</h1>
                   <div className="grid grid-cols-2">
                          <h1 className='col-span-1 h-fit '>Admitted to Grade: _______</h1>
                          <h1 className='col-span-1 h-fit '>Section:_______________</h1> 
                          <h1 className='col-span-2 h-fit '>Eligibility for Admission to Grade: __________________</h1> 
                   </div>
                   <div className="">
                       <h1 className='my-7'>Approved:</h1>
                       <div className="grid grid-cols-2 gap-x-16 items-baseline">
                           <h1 className='border-b-black border-b'>{}</h1>
                           <h1 className='border-b-black border-b'>{}</h1>
                           <h1  className='text-center'>Principal</h1>
                           <h1  className='text-center'>Teacher</h1>
                       </div>
                   </div>
                   <div className="my-5">
                       <h1 className='text-center font-semibold font-serif'>Certificate of Transfer</h1>
                       <div className="grid grid-cols-2 gap-x-16 items-baseline">
                           <div className='flex items-baseline gap-x-2'>Admitted in: <h1 className='flex-1 border-b border-b-black'></h1></div>
                           <div className=""></div>
                           <div className='flex items-baseline gap-x-2'>Date: <h1 className='flex-1 border-b border-b-black'></h1></div>
                           <div className='flex items-baseline gap-x-2'><h1 className='flex-1 border-b border-b-black'></h1></div>
                           <div className=""></div>
                           <div className="text-center">Principal</div>
                       </div>
                   </div>
                </div>
            )}
         
        </div>
        <div className="font-serif">
            <div className="grid grid-cols-12 py-10">
                <div className="flex justify-end items-start col-span-2">
                    <Image src={systemSettings?.schoolImage || ""} alt='Division of Tanjay City' width={100} height={100} className='size-20 object-contain'/>
                </div>
                {isSHS ? (
                    <div className="col-span-8 text-center flex flex-col items-center text-xs ">
                       <h1 className='text-sm'>Republic of the Philippines</h1>
                       <h1 className='text-sm'>DEPARTMENT OF EDUCATION</h1>
                       <h1 className='text-center'>Region VII</h1>
                       <h1 className=' w-full'>Division of Tanjay City</h1>
                       <h1 className=' w-full font-semibold'>TANJAY NATIONAL HIGH SCHOOL (OPAO)</h1>
                       <h1 className='text-center mb-2 mt-1'>Barangay IX, Tanjay City</h1>
                    </div>
                ): (
                <div className="col-span-10 text-center flex flex-col items-center px-10 text-xs ">
                    <h1 className='text-lg'>Republic of the Philippines</h1>
                    <h1 className='mb-2 text-[1rem]'>DEPARTMENT OF EDUCATION</h1>
                    <h1 className='border-b-black border-b w-full'>Central Visayas</h1>
                    <h1 className='text-center mb-2  mt-1'>Region</h1>
                    <h1 className='border-b-black border-b w-full'>Division of Tanjay City</h1>
                    <h1 className='text-center mb-2  mt-1'>Division</h1>
                    <h1 className='border-b-black border-b w-full'>TANJAY NATIONAL HIGH SCHOOL (OPAO)</h1>
                    <h1 className='text-center mb-2 mt-1'>School</h1>
                </div>
                )}
                {isSHS && (
                    <div className="flex justify-end items-start col-span-2">
                     <Image src={systemSettings?.schoolImage || ""} alt='TanjayLogo' width={100} height={100} className='size-20 object-contain'/>
                    </div>
                )}
               
                <div className={cn(isSHS ?"pl-0" :"pl-20" ,"col-span-12 text-xs")}>
                    <h1 className='text-center font-semibold text-sm font-serif my-5'>LEARNER&apos;S PROGRESS REPORT CARD</h1>
                    <div className="grid grid-cols-12 gap-x-2 items-baseline gap-y-2 font-semibold">
                        <h1 className='col-span-12 flex gap-x-2 '>Name:  <span className='font-normal text-center border-b-black border-b flex-1 px-2 inline-block capitalize'>{student.firstName} {student.middleName} {student.lastName}</span></h1>
                        {!isSHS && (
                            <h1 className='col-span-12 flex gap-x-2 '>Learner&apos;s Reference Number:  <span className='font-normal text-center border-b-black border-b flex-1 px-2 inline-block capitalize'>{student.lrn}</span></h1>
                        )}
                        
                        <h1 className='col-span-8 flex gap-x-2'>Age:  <span className='font-normal border-b-black text-center border-b flex-1 px-2 inline-block'>{getStudentAge(student.dateOfBirth)}</span></h1>
                        <h1 className='col-span-4 flex gap-x-2'>Sex:  <span className='font-normal border-b-black text-center border-b flex-1 px-2 inline-block'>{student.sex}</span></h1>
                        <h1 className='col-span-5 flex gap-x-2'>Grade:  <span className='font-normal text-center  border-b-black border-b flex-1 px-2 inline-block'>{student.sectionDoc?.gradeLevel}</span></h1>
                        <h1 className='col-span-7 flex gap-x-2'>Section:  <span className='font-normal  text-center border-b-black border-b flex-1 px-2 inline-block'>{student.sectionDoc?.name}</span></h1>
                        <h1 className='col-span-12 flex gap-x-2'>School Year: <span className='font-normal text-center border-b-black border-b flex-1 px-2 inline-block'>{student.sectionDoc.schoolYear}</span></h1>
                        {/* {isSHS && (
                            <h1 className='col-span-12 flex gap-x-2'>Track/ Strand: <input className='font-normal text-center border-b-black border-b flex-1 px-2 inline-block' defaultValue={`${student.cLass?.track}/${student.strand}`} /></h1>
                        )} */}
                    </div>
                </div>
                <div className={cn(isSHS?"pl-0" :"pl-20" ,"col-span-12  font-semibold mt-10")}>
                    <h1>Dear Parent,</h1>
                    <p className="text-sm text-justify"><span className='mr-4'></span>This report card shows the ability and progress your child has made in different learning areas as well as his/her core values.  </p>
                    <p className="text-sm"><span className='mr-4'></span>The school welcomes you should you desire to know more about your child&apos;s progress.</p>
                    <div className="grid grid-cols-2 gap-x-10 mt-10">
                        <h1 className='border-b-black border-b text-center capitalize font-medium'>{principal?.fullName}</h1>
                        <h1 className='border-b-black border-b text-center capitalize font-medium'>{student.adviser.fullName}</h1>
                        <h1 className='text-center'>Principal</h1>
                        <h1 className='text-center'>Teacher</h1>
                    </div>
                </div>

            </div>
        </div>
    </div>
  )
}

export default SF9FrontTemplate