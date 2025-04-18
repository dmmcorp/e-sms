'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'
import ClassRecordTemplate from './input-grades'
import { TeachingLoadType } from '@/lib/types'
import NeedsImprovement from './needs-intervention'

interface ClassrecordTabsProps {
    teachingLoad: TeachingLoadType
}

function ClassrecordTabs({teachingLoad}: ClassrecordTabsProps) {
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
              <ClassRecordTemplate teachingLoad={teachingLoad}/>
          </TabsContent>
          <TabsContent value="intervention" className='border-2 p-5 overflow-auto'>
              <NeedsImprovement teachingLoad={teachingLoad}/>
          </TabsContent>
        </Tabs>
    </div>
  )
}

export default ClassrecordTabs