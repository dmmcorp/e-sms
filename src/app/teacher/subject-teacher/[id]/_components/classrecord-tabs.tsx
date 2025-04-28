'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React, { useEffect, useRef, useState } from 'react'
import ClassRecordTemplate from './input-grades'
import { QuarterType, TeachingLoadType } from '@/lib/types'
import NeedsImprovement from './needs-intervention'
import { useReactToPrint } from "react-to-print";
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'
import { Id } from '../../../../../../convex/_generated/dataModel'
import { useRouter } from 'next/navigation'

interface ClassrecordTabsProps {
  teachingLoad: TeachingLoadType
}

function ClassrecordTabs({ teachingLoad }: ClassrecordTabsProps) {
  const componentRef = useRef(null);
  const router = useRouter();
  const [selectedComponent, setSelectedComponent] = useState<string | undefined>(teachingLoad.subComponent);

  // Get all teaching loads for this MAPEH subject
  const mapehLoads = useQuery(api.teachingLoad.getMapehLoads, {
    subjectTaughtId: teachingLoad.subjectTaughtId,
    sectionId: teachingLoad.sectionId,
    quarter: teachingLoad.quarter as QuarterType
  });

  // Get all students in the section
  const sectionStudents = useQuery(api.students.sectionStudents, {
    sectionId: teachingLoad.sectionId,
    teachingLoadId: teachingLoad._id
  });

  // Get all enrollments for the section
  const enrollments = useQuery(api.enrollment.getBySectionId, {
    sectionId: teachingLoad.sectionId
  });

  // Mutation to create class records
  const createClassRecords = useMutation(api.teachingLoad.createClassRecords);
  const createMapehClassRecords = useMutation(api.teachingLoad.createMapehClassRecords);

  const reactToPrintContent = () => {
    return componentRef.current;
  };
  const subjectName = teachingLoad.subjectTaught.subjectName
  const sectionName = teachingLoad.section.name
  const isMapeh = subjectName.toLowerCase() === 'mapeh';

  const handlePrint = useReactToPrint({
    documentTitle: `${subjectName}-${sectionName} Class record`,
  });

  // Get the current MAPEH component from the teaching load
  const currentComponent = teachingLoad.subComponent;

  // Handle component change
  const handleComponentChange = (value: string) => {
    setSelectedComponent(value);
    // Find the teaching load for the selected component
    const selectedLoad = mapehLoads?.find(load => load.subComponent === value);
    if (selectedLoad) {
      // Update the URL with the new teaching load ID
      router.push(`/teacher/subject-teacher/${selectedLoad._id}`);
    }
  };

  // If no students are found in the current teaching load, create class records for all students in the section
  useEffect(() => {
    if (isMapeh && teachingLoad && teachingLoad.classRecords.length === 0 && sectionStudents && enrollments) {
      // Create class records for all MAPEH components
      createMapehClassRecords({
        subjectTaughtId: teachingLoad.subjectTaughtId,
        sectionId: teachingLoad.sectionId,
        quarter: teachingLoad.quarter as QuarterType
      });
    }
  }, [isMapeh, teachingLoad, sectionStudents, enrollments, createMapehClassRecords]);

  return (
    <div>
      <Tabs defaultValue={"class-record"} className="w-full relative space-y-5 shadow-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-2">
            <TabsList className='w-fit md:block'>
              <TabsTrigger value="class-record" className='font-medium text-[0.5rem] md:text-sm shadow-md border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary'>Class Record</TabsTrigger>
              <TabsTrigger value="intervention" className='font-medium text-[0.5rem] md:text-sm shadow-md border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary'>Needs Intervention</TabsTrigger>
            </TabsList>
            {isMapeh && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Current Component:</span>
                <span className="text-sm font-semibold text-primary">{currentComponent}</span>
              </div>
            )}
          </div>

          {/* Add MAPEH component selector if the subject is MAPEH */}
          {isMapeh && (
            <div className="w-[200px]">
              <Select
                value={selectedComponent}
                onValueChange={handleComponentChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select MAPEH component" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Music" className="flex items-center gap-2">
                    <span className="font-medium">Music</span>
                  </SelectItem>
                  <SelectItem value="Arts" className="flex items-center gap-2">
                    <span className="font-medium">Arts</span>
                  </SelectItem>
                  <SelectItem value="Physical Education" className="flex items-center gap-2">
                    <span className="font-medium">Physical Education</span>
                  </SelectItem>
                  <SelectItem value="Health" className="flex items-center gap-2">
                    <span className="font-medium">Health</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <TabsContent value="class-record" className='border-2 p-5 overflow-auto'>
          <div className="w-full flex justify-between items-center mb-4">
            {isMapeh && (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-primary"></div>
                <span className="text-sm font-medium">{currentComponent} Component</span>
              </div>
            )}
            <Button variant={'default'} onClick={() => { handlePrint(reactToPrintContent) }} className='text-white flex gap-x-3'><Printer />Print</Button>
          </div>
          <div ref={componentRef} className="p-5">
            <ClassRecordTemplate
              teachingLoad={teachingLoad}
              selectedComponent={selectedComponent}
            />
          </div>
        </TabsContent>
        <TabsContent value="intervention" className='border-2 p-5 overflow-auto'>
          <NeedsImprovement teachingLoad={teachingLoad} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ClassrecordTabs