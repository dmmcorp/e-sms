'use client'
import React, { useRef, useState } from 'react'
import { Id } from '../../../../../convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import KagawaranNgEdukasyon from '@/../public/kagawaran-ng-edukasyon-logo.png'
import DepedLogo from '@/../public/Logo-DepEd.png'
import { useReactToPrint } from 'react-to-print'
import Loading from '../../loading'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import ShsSubjectsTemplate from './shs-subjects-template'
import JhsSubjectsTemplate from './jhs-subjects-template'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import JhsEmptyGrades from './jhs-empty-grades'

interface SF10Types {
    sectionStudentId: Id<'sectionStudents'>
}

function SF10({sectionStudentId}: SF10Types) {
    const [activeTab, setActiveTab] = useState("front")
    const student = useQuery(api.students.getStudentSection, {
        sectionStudentId: sectionStudentId
    })

    const componentRef = useRef(null);
    const gradeLevel = student?.sectionDoc?.gradeLevel
    const isSHS = gradeLevel === "Grade 11" || gradeLevel === "Grade 12"

    const enrollments = useQuery(api.students.getStudentSubjectsByEnrollment, {
        sectionStudentId: sectionStudentId,
        isSHS: isSHS
    });

    console.log(enrollments)
    const handleTabChange = (value: string) => {
        setActiveTab(value);
      };

    const reactToPrintContent = () => {
        return componentRef.current;
      };
  
    const handlePrint = useReactToPrint({
      documentTitle: `School form 10 - ${activeTab === 'front' ? 'Front' : 'Back'}`,
    });
  

    if (!student) {
        return <Loading />
    }


    const formatDateString = (dateString: string) => {
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month < 10 ? '0' : ''}${month}/${day < 10 ? '0' : ''}${day}/${year}`;
    };
  return (
    <div className='max-w-5xl mx-auto p-4 bg-white'>
        <Tabs  defaultValue="front" className="w-full  overflow-auto" onValueChange={handleTabChange}>
        <div className="grid grid-cols-12">

            <TabsList className="col-span-9 grid w-[200px] grid-cols-2 mb-6">
            <TabsTrigger value="front">Front</TabsTrigger>
            <TabsTrigger value="back">Back</TabsTrigger>
            </TabsList>
            <div className="flex justify-end col-span-3">

            <Button size={'icon'} onClick={()=> {handlePrint(reactToPrintContent)}}><Printer/></Button>
            </div>
        </div>
            <TabsContent value='front' className='min-w-[1000px] md:min-w-full'>
            <div ref={componentRef} className='border-2 p-6 text-black text-sm'>
                <div className="grid grid-cols-12 h-fit text-sm ">
                    <div className="col-span-2 flex justify-center">
                        <Image src={KagawaranNgEdukasyon} alt='' className='object-contain size-14 ' />
                    </div>
                    <div className={cn(isSHS ? "text-sm" : "text-xs", "col-span-8 ")}>
                        <h1 className='uppercase text-center'>Republic of the Philippines</h1>
                        <h1 className='uppercase text-center'>Department of Education</h1>
                        {isSHS ? (
                            <h1 className='uppercase text-center font-semibold text-sm'>Senior High School Student Permanent Record</h1>
                        ) : (
                            <div className="text-xs">
                                <h1 className='uppercase text-center font-semibold text-xs'>Learner&apos;s Permanent Academic Record for Junior High School(SF10)</h1>
                                <p className='italic text-[0.6rem] text-center'>(Formerly Form 137)</p>
                            </div>
                        )}
                    </div>
                    <div className="col-span-2 flex  justify-center">
                        <Image src={DepedLogo} alt='' className='object-contain w-20 h-14 ' />
                    </div>
                </div>

                <div className="pb-1">
                    <h1 className='uppercase text-center font-semibold bg-gray-300 text-[0.7rem]'>Learner&apos;s Information</h1>
                    {isSHS ? (
                        <>
                            <div className="grid grid-cols-3 gap-x-2 uppercase text-[0.55rem] ">
                                <h1 className=' flex'>Last Name: <span className='border-b-black border-b flex-1 px-1'>{student.lastName}</span></h1>
                                <h1 className=' flex'>First Name: <span className='border-b-black border-b flex-1 px-1'>{student.firstName}</span></h1>
                                <h1 className=' flex'>MIddle Name: <span className='border-b-black border-b flex-1 px-1'>{student.middleName}</span></h1>
                            </div>
                            <div className="grid grid-cols-12 gap-x-2 text-[0.55rem] mt-[-2px]">
                                <h1 className='flex col-span-2'>LRN: <span className='border-b-black border-b flex-1 px-1'>{student.lrn}</span></h1>
                                <h1 className='flex col-span-4'>Date of Birth (MM/DD/YYYY): <span className='border-b-black border-b flex-1 px-1'>{formatDateString(student.dateOfBirth)}</span></h1>
                                <h1 className='flex col-span-1'>Sex: <span className='border-b-black border-b flex-1 px-1'>{student.sex}</span></h1>
                                <h1 className='flex col-span-5'>Date of SHS Admission (MM/DD/YYYY): <span className='border-b-black border-b flex-1 px-1'>{student.seniorHighDateOfAdmission ? formatDateString(student.seniorHighDateOfAdmission) : ""}</span></h1>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-4 gap-x-2 uppercase text-[0.6rem] my-1">
                                <h1 className=' flex'>Last Name: <span className='border-b-black border-b flex-1 px-1 text-center'>{student.lastName}</span></h1>
                                <h1 className=' flex'>First Name: <span className='border-b-black border-b flex-1 px-1  text-center' text-center>{student.firstName}</span></h1>
                                <h1 className=' flex'>Name EXTN.(Jr,I,II): <span className='border-b-black border-b flex-1 px-1  text-center'>{}</span></h1>
                                <h1 className=' flex'>MIddle Name: <span className='border-b-black border-b flex-1 px-1  text-center'>{student.middleName}</span></h1>
                            </div>
                            <div className="grid grid-cols-12 gap-x-2  mt-[-2px] text-[0.6rem]">
                                <h1 className='flex col-span-5 capitalize'>Learner Reference Number (LRN): <span className='border-b-black border-b flex-1 px-1  text-center'>{student.lrn}</span></h1>
                                <h1 className='flex col-span-4'>Birthdate (MM/DD/YYYY): <span className='border-b-black border-b flex-1 px-1  text-center'>{formatDateString(student.dateOfBirth)}</span></h1>
                                <h1 className='flex col-span-3'>Sex: <span className='border-b-black border-b flex-1 px-1  text-center uppercase'>{student.sex}</span></h1>

                            </div>
                        </>
                    )}
                </div>
                <div className="">
                    <h1 className='uppercase text-center bg-gray-300 text-[0.7rem] font-semibold'>Eligibility for SHS Enrollment</h1>
                    <div className={cn(isSHS ? "border-none p-0 " : "border border-black p-1 mt-1", "")}>
                        {isSHS ? (
                            <div className="grid grid-cols-12 mt-1">
                                <div className="col-span-4 flex gap-x-5 text-[0.55rem]">

                                    <Checkbox
                                        id="highSchoolCompleter"
                                        className='rounded-none border-black border size-4 ml-0 '

                                    />
                                    <Label htmlFor="highSchoolCompleter" className='ml-[-15px] text-[0.6rem]'>High School Completer*</Label>

                                    <h1 className='flex w-1/3 items-baseline'>Gen. Ave: <span className='bg-transparent border-b border-b-black flex-1 w-1/3 px-3 h-3' >{}</span></h1>
                                </div>
                            <div className="col-span-5 flex gap-x-5 text-[0.55rem]">
                                <Checkbox
                                    id="juniorHighSchoolCompleter"
                                    className='rounded-none checked:bg-transparent bg-transparent'
                                    disabled={false}
                                    checked
                                />
                                <Label htmlFor="juniorHighSchoolCompleter" className='ml-[-15px] text-[0.6rem]'>Junior High School Completer*</Label>

                                <h1 className='flex w-1/3 items-baseline'>Gen. Ave: <span className='bg-transparent border-b border-b-black flex-1 w-1/3 px-3' >{student.juniorHigh?.genAve}</span></h1>
                            </div>
                    </div>
                    ):(
                    <div className="grid grid-cols-12 mt-1 text-[0.6rem]">
                        <div className="col-span-4 flex gap-x-5 text-[0.6rem] mb-1">
                            <Checkbox 
                                id="elemSchoolCompleter" 
                                className='rounded-none border-black border size-4 ml-0 '
                                checked 
                                
                            />
                            <Label htmlFor="elemSchoolCompleter" className='ml-[-15px] text-[0.6rem]'>Elementary School Completer*</Label>

                        
                        </div>
                        
                        <h1 className='col-span-4 flex gap-x-3 w-1/2 items-baseline '>Gen. Ave: <span className='bg-transparent border-b border-b-black flex-1 text-center w-1/3 px-3 h-4'>{student.elementary?.genAve}</span></h1>
                        <h1 className='col-span-4 flex gap-x-3 items-baseline '>Citation(if Any): <span className='bg-transparent border-b border-b-black text-center flex-1 w-1/3 px-3 h-4'></span></h1>
                        
                    </div>
                    )}
                    {isSHS ? (
                    <div className="grid grid-cols-12 text-[0.55rem]  mt-[-4px]">
                        <h1 className='flex gap-x-1 items-baseline col-span-4'>Date of Gradeuation/Completion (MM/DD/YYYY): <span className='bg-transparent border-b border-b-black flex-1  h-4 w-1/3 px-3'>{student.juniorHigh?.completion ? formatDateString(student.juniorHigh?.completion) : ""}</span></h1>
                        <h1 className='flex gap-x-1 items-baseline col-span-4'>Name of School: <span className='bg-transparent border-b border-b-black line-clamp-1 flex-1 w-1/3 px-3 h-4'>{student.juniorHigh?.school}</span></h1>
                        <h1 className='flex gap-x-1 items-baseline col-span-4'>School Address: <span className='bg-transparent border-b line-clamp-1 border-b-black flex-1 w-1/3 px-3  h-4'>{student.juniorHigh?.address}</span></h1>
                    </div>
                    ):(
                    <div className="grid grid-cols-12 gap-x-5 text-[0.6rem] ">
                        <h1 className='flex gap-x-1 col-span-5 pl-5'>Name of Elementary School: <span className='bg-transparent border-b border-b-black flex-1 h-4 w-1/3 px-3'>{student.elementary?.school}</span></h1>
                        <h1 className='flex gap-x-1  col-span-3'>School ID: <span className='bg-transparent border-b border-b-black line-clamp-1 flex-1 w-1/3 px-3 h-4'>{student.elementary?.schoolId}</span></h1>
                        <h1 className='flex gap-x-1  col-span-4'>Address of School: <span className='bg-transparent border-b line-clamp-1 border-b-black flex-1 w-1/3 px-3 h-4'>{student.elementary?.address}</span></h1>
                    </div>    
                    )}
                </div>
                {!isSHS && (
                    <h1 className='text-[0.6rem] '>Other Credential Presented</h1>
                )}
                <div className={cn(!isSHS && "px-2" ,"grid grid-cols-12 pt-1  mt-[-2px]")}>
                    <div className="col-span-3 flex gap-x-5 text-[0.6rem]">
                        <Checkbox 
                            id="peptPasser" 
                            className='rounded-none ml-0 ' 
                            
                            />
                        <Label htmlFor="peptPasser" className='ml-[-15px] text-[0.6rem]'>PEPT Passer*</Label>

                            <h1 className='flex w-1/3 items-baseline'>Rating: <input type="text" className='bg-transparent border-b border-b-black flex-1 w-1/3 px-3 h-3' /></h1>
                        </div>
                        <div className="col-span-3 flex gap-x-5 text-[0.6rem]">
                            <Checkbox
                                id="alsAEPasser"
                                className='rounded-none ml-0 '

                            />
                            <Label htmlFor="alsAEPasser" className='ml-[-15px] text-[0.6rem]'>ALS A&E Passer*</Label>

                            <h1 className='flex w-1/3 items-baseline'>Rating: <input type="text" className='bg-transparent border-b border-b-black flex-1 w-1/3 px-3 h-3' /></h1>
                        </div>
                        <div className="col-span-6 flex text-[0.6rem]">
                            <div className='flex gap-x-5 col-span-2'>
                                <Checkbox
                                    id="others"
                                    className='rounded-none ml-0'

                                />
                                <Label htmlFor="others" className='ml-[-15px] text-[0.6rem]'>Others*</Label>
                            </div>

                            <h1 className='flex w-full items-baseline'>(Pls. specify): <input type="text"  className=' bg-transparent border-b border-b-black flex-1 w-1/3 px-3 h-3' /></h1>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-x-5 text-[0.6rem] mt-[-4px]">
                        <h1 className='flex col-span-6 items-baseline'>Date of Examination/Assessment (MM/DD/YYYY): <input type="text"  className=' bg-transparent border-b border-b-black flex-1 px-3 h-3' /></h1>
                        <h1 className='flex col-span-6 items-baseline'>Name and Address of Community Learning Center: <input type="text"  className=' bg-transparent border-b border-b-black flex-1 px-3 h-3' /></h1>
                    </div>
                    {isSHS ? (
                        <>
                            <div className="grid grid-cols-12 italic text-[0.5rem] mt-[-1px]">
                                <h4 className='col-span-6 italic'>*High School Completers are students who graduated from secondary school under the old curriculum</h4>
                                <h4 className='col-span-6 italic '>***ALS A&E - Alternative Learning System Accreditation and equivalency Test for JHS</h4>
                            </div>
                            <h4 className=' italic text-[0.5rem] mt-[-6px]'>**PEPT - Philippine educational Placement Test for JHS</h4>
                        </>
                    ) : (
                        <div className="mt-2"></div>
                    )}

                </div>
                {isSHS ? (
                    <div className="">
                        <h1 className='uppercase text-center bg-gray-300 text-[0.7rem] font-semibold'>Scholastic Record</h1>
                        {enrollments?.studentEnrollments.map((enrollment) => {
                            if (
                                enrollment.gradeLevel === "Grade 11 - 1st semester" ||
                                enrollment.gradeLevel === "Grade 11 - 2nd semester" 
                            )
                                return (
                                    <ShsSubjectsTemplate record={enrollment} />
                                );
                        })}
                    </div>
                ) : (
                    <div className="">
                        <h1 className='uppercase text-center bg-gray-300 text-[0.7rem] font-semibold'>Scholastic Record</h1>
                        {enrollments?.studentEnrollments.map((enrollment) => {
                            if(enrollment.gradeLevel === "Grade 7" || enrollment.gradeLevel === "Grade 8")
                            return (
                                <JhsSubjectsTemplate record={enrollment}/>
                            )
                        })}
                        <div className="mt-2 border border-black p-1">
                            <h1 className='text-center font-semibold text-xs mb-3'>Certification</h1>
                            <div className="grid grid-cols-12 gap-x-2">
                                <h1 className='text-[0.6rem] col-span-5 flex items-baseline'>I CERTIFY that this is true record of <input type="text" className=' bg-transparent border-b border-b-black flex-1 w-3 text-center' /></h1>
                                <h1 className='text-[0.6rem] col-span-2 flex items-baseline'>with LRN <input type="text" value={student.lrn} className=' bg-transparent border-b border-b-black flex-1 w-3 text-center' /></h1>
                                <h1 className='text-[0.6rem] col-span-5 flex items-baseline'>and that he/she is eligible for admission to Grade <input type="number" className=' bg-transparent border-b border-b-black flex-1 w-3 text-center' />.</h1>
                            </div>
                            <div className="grid grid-cols-12 gap-x-2">
                                <h1 className='text-[0.6rem] col-span-5 flex items-baseline'>Name of school: <input type="text" className=' bg-transparent border-b border-b-black flex-1 w-3' /></h1>
                                <h1 className='text-[0.6rem] col-span-3 flex items-baseline'>School ID: <input type="number" className=' bg-transparent border-b border-b-black flex-1 w-3' /></h1>
                                <h1 className='text-[0.6rem] col-span-4 flex items-baseline'>Last School Year Attended: <input type="text" className=' bg-transparent border-b border-b-black flex-1 w-3' /></h1>
                            </div>
                            <div className="grid grid-cols-12 gap-x-5 text-[0.6rem]">
                                <input type="text" className='col-span-4 border-b border-b-black text-center mt-3 bg-transparent ' />
                                <input type="text" className='col-span-5 border-b border-b-black text-center mt-3 bg-transparent' />
                                <h1 className='col-span-3 mt-3'></h1>
                                <h1 className='col-span-4 text-center '>Date</h1>
                                <h1 className='col-span-5 text-center'>Name of Principal/School Head over Printed Name</h1>
                                <h1 className='col-span-3 text-center'>(affix School seal heare)</h1>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            </TabsContent>


            <TabsContent value='back'>
                {isSHS ? (
                    <div ref={componentRef} className='border-2 p-6 text-black text-sm'>
                        <div className="text-[0.55rem] flex justify-between items-center border-b-black border-b-2 font-semibold">
                            <h1 className='uppercase'>Page 2 <span className='text-center h-3 inline-block  ml-10'>{student.lastName}, {student.firstName} {student.middleName} </span></h1>
                            <h1 className='uppercase'>SF10 JHS</h1>
                        </div>
                        <div className="">
                        {enrollments?.studentEnrollments.map((enrollment) => {
                            if (
                                enrollment.gradeLevel === "Grade 12 - 1st semester" ||
                                enrollment.gradeLevel === "Grade 12 - 2nd semester" 
                            )
                                return (
                                    <ShsSubjectsTemplate record={enrollment} />
                                );
                        })}
                        </div>
                        <div className='my-2 w-full h-2 bg-gray-300'></div>
                        <div className="grid grid-cols-12 gap-x-5 text-[0.6rem] font-semibold">
                            <h1 className='col-span-10 flex items-baseline'>Track/Strand Accomplished: <span className='border-b-black border-b flex-1 px-3 uppercase h-5'></span></h1>
                            <h1 className='col-span-2 flex items-baseline'>SHS Gen Average: <span className='border-b-black border-b flex-1 px-3 w-2 h-5 uppercase'></span></h1>
                        </div>
                        <div className="grid grid-cols-12 gap-x-5 text-[0.6rem]  font-semibold">
                            <h1 className='col-span-8 flex items-baseline'>Awards/Honors Received: <span className='border-b-black border-b flex-1 px-3 uppercase h-5'></span></h1>
                            <h1 className='col-span-4 flex items-baseline'>Date of SHS Graduation (MM/DD/YYYY): <span className='border-b-black border-b flex-1 w-1 h-5 uppercase'></span></h1>
                        </div>
                        <div className="grid grid-cols-12 gap-x-5 text-[0.6rem]  font-semibold">
                            <h1 className='col-span-6 flex items-baseline'>Certified By:</h1>
                            <h1 className='col-span-6 flex items-baseline'>Place School Seal Here:</h1>
                        </div>
                        <div className="grid grid-cols-2">
                            <div className="pr-5">
                                <div className="grid grid-cols-12 text-[0.6rem] gap-x-10">
                                    <span className='border-b-black border-b col-span-6 text-center uppercase'></span>
                                    <span className='border-b-black border-b col-span-4 text-center uppercase'></span>
                                    <h1 className='text-center col-span-6'>Signature of School Head Over Printed Name</h1>
                                    <h1 className='text-center col-span-4'>Date</h1>
                                </div>
                                <div className="p-2 border border-black text-[0.5rem]">
                                    <h1 className='text-xs font-semibold'>Note:</h1>
                                    <p className='leading-3'>This permanent record or a photocopy of this permanent record that bears the seal of the school and the original signature in ink of the school head shall be considered valid for all legal purposes. Any erasure or alteration made on this copy should be validated by the School head.</p>
                                    <p className='leading-3'>If the student transfers to another school, the originating school should produce one (1) certified true copy of this permanent record for safekeeping. The receiving school shall continue filling up the original form.</p>
                                    <p className='leading-3'>Upon graduation, the school from which the student graduated should keep the original form and produce one (1) certified true copy for the Division office.</p>
                                </div>
                            </div>
                            <div className="border-l-black border-l">

                            </div>
                        </div>
                    </div>
                ) : (
                    <div ref={componentRef} className='border-2 p-6 text-black text-sm'>
                        <div className="text-[0.55rem] flex justify-between items-center">
                            <h1 className='uppercase'>SF10 JHS</h1>
                            <h1 className='uppercase'>Page 2 of <span className='border-b border-b-black text-center h-3 inline-block w-10'></span></h1>
                        </div>
                        <div className="">
                            { enrollments?.studentEnrollments.map((enrollment) => {
                                if(enrollment.gradeLevel === "Grade 9" || enrollment.gradeLevel === "Grade 10")
                                return (
                                    <JhsSubjectsTemplate record={enrollment}/>
                                )
                            })}
                            <div className="">
                                <div className="grid grid-cols-12 gap-x-2 text-[0.55rem] font-semibold px-2 pt-1 border-t-black border-t border-x-black border-x leading-3">
                                    <h1 className="col-span-5 flex items-baseline leading-3">School : <span className='bg-transparent border-b capitalize w-full font-normal border-b-black flex-1 px-3 h-3'></span> </h1>
                                    <h1 className="col-span-2 flex items-baseline leading-3">School ID: <span className='bg-transparent border-b uppercase border-b-black font-normal flex-1 px-3 w-full h-3'></span> </h1>
                                    <h1 className="col-span-4 flex items-baseline leading-3">District: <span className='bg-transparent border-b capitalize font-normal border-b-black flex-1 px-3 w-full h-3'></span> </h1>
                                    <h1 className="col-span-1 flex items-baseline leading-3">Region: <span className='bg-transparent border-b capitalize border-b-black font-normal flex-1 w-full h-3'></span> </h1>
                                </div>
                                <div className="grid grid-cols-12 gap-x-2 font-semibold px-2 text-[0.55rem] pb-1 border-b-black border-b border-x-black border-x">
                                    <h1 className="col-span-2 flex items-baseline leading-3">Classified as Grade: <span className='bg-transparent border-b font-normal capitalize w-full border-b-black flex-1 px-3 h-3'></span> </h1>
                                    <h1 className="col-span-2 flex items-baseline leading-3">Section: <span className='bg-transparent border-b capitalize w-full font-normal border-b-black flex-1 px-3 h-3'></span> </h1>
                                    <h1 className="col-span-2 flex items-baseline leading-3">School Year: <span className='bg-transparent border-b capitalize w-full font-normal border-b-black flex-1 px-3 h-3'></span> </h1>
                                    <h1 className="col-span-4 flex items-baseline leading-3">Name of Advisor/Teacher: <span className='bg-transparent border-b capitalize font-normal w-full border-b-black flex-1 px-3 h-3'></span> </h1>
                                    <h1 className="col-span-2 flex items-baseline leading-3">Signature: <span className='bg-transparent border-b capitalize w-full border-b-black font-normal flex-1 px-3 h-3'></span> </h1>
                                </div>
                                <JhsEmptyGrades/>
                            </div>
                        </div>
                        <h1 className="font-bold text-[0.6rem] leading-4 mt-5">For Transfer Out / JHS Completer only</h1>
                        <div className=" border border-black p-1">
                            <h1 className='text-center font-semibold text-xs mb-1'>Certification</h1>
                            <div className="grid grid-cols-12 gap-x-2">
                                <h1 className='text-[0.6rem] col-span-6 flex items-baseline leading-3'>I CERTIFY that this is true record of <span className='border-b border-b-black flex-1 w-3 text-center h-3 inline-block'></span></h1>
                                <h1 className='text-[0.6rem] col-span-2 flex items-baseline leading-3'>with LRN <span className='border-b border-b-black flex-1 w-3 text-center h-3 inline-block'>{student.lrn}</span></h1>
                                <h1 className='text-[0.6rem] col-span-4 flex items-baseline leading-3'>and that he/she is eligible for admission to Grade <span className='border-b border-b-black flex-1 w-3 text-center h-3 inline-block'></span>.</h1>
                            </div>
                            <div className="grid grid-cols-12 gap-x-2 mt-1">
                                <h1 className='text-[0.6rem] col-span-5 flex items-baseline leading-3'>Name of school: <span className='border-b border-b-black flex-1 w-3 h-3 inline-block'></span></h1>
                                <h1 className='text-[0.6rem] col-span-3 flex items-baseline leading-3'>School ID: <span className='border-b border-b-black flex-1 w-3 h-3 inline-block'></span></h1>
                                <h1 className='text-[0.6rem] col-span-4 flex items-baseline leading-3'>Last School Year Attended: <span className='border-b border-b-black flex-1 w-3 h-3 inline-block'></span></h1>
                            </div>
                            <div className="grid grid-cols-12 gap-x-5 text-[0.6rem] mt-10">
                                <span className='col-span-4 border-b border-b-black text-center mt-3 inline-block'></span>
                                <span className='col-span-5 border-b border-b-black text-center mt-3 inline-block'></span>
                                <h1 className='col-span-3 mt-3'></h1>
                                <h1 className='col-span-4 text-center '>Date</h1>
                                <h1 className='col-span-5 text-center'>Name of Principal/School Head over Printed Name</h1>
                                <h1 className='col-span-3 text-center'>(affix School seal heare)</h1>
                            </div>
                        </div>
                    </div>
                )}

            </TabsContent>
        </Tabs>
    </div>
  )
}

export default SF10