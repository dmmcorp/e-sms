'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React, { useRef } from 'react'
import ClassRecordTemplate from './input-grades'
import { TeachingLoadType } from '@/lib/types'
import NeedsImprovement from './needs-intervention'
import { useReactToPrint } from "react-to-print";
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

interface ClassrecordTabsProps {
    teachingLoad: TeachingLoadType
}

function ClassrecordTabs({teachingLoad}: ClassrecordTabsProps) {
  const componentRef = useRef(null);
  const reactToPrintContent = () => {
    return componentRef.current;
  };
  const subjectName = teachingLoad.subjectTaught.subjectName
  const sectionName = teachingLoad.section.name
  const handlePrint = useReactToPrint({
    documentTitle: `${subjectName}-${sectionName} Class record`,

  });

  return (
    <div>
        <Tabs defaultValue={"class-record"} className="w-full relative  space-y-5  shadow-none">
          {/* <h1 className='text-xs text-foreground font-semibold'>Select tab to show: </h1> */}
          <TabsList className='w-fit md:block'> 
            {/* <TabsTrigger value="attendance" className='font-medium shadow-md border-b-2 data-[state=active]:border-b-primary' >Attendance</TabsTrigger> */}
            <TabsTrigger value="class-record" className='font-medium text-[0.5rem] md:text-sm  shadow-md border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary' >Class Record</TabsTrigger>
            <TabsTrigger value="intervention" className='font-medium text-[0.5rem] md:text-sm  shadow-md border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary'>Needs Intervention</TabsTrigger>
            <TabsTrigger value="remedial-class" className='font-medium text-[0.5rem] md:text-sm  shadow-md border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary'>For Summer Class</TabsTrigger>
          </TabsList>
          <TabsContent value="class-record" className='border-2 p-5 overflow-auto'>
            <div className="w-full flex justify-end">

              <Button variant={'default'} onClick={()=> {handlePrint(reactToPrintContent)}} className='text-white flex gap-x-3'><Printer />Print</Button>
            </div>
            <div ref={componentRef} className="p-5">
              <ClassRecordTemplate teachingLoad={teachingLoad}/>
            </div>
          </TabsContent>
          <TabsContent value="intervention" className='border-2 p-5 overflow-auto'>
              <NeedsImprovement teachingLoad={teachingLoad}/>
          </TabsContent>
        </Tabs>
    </div>
  )
}

export default ClassrecordTabs