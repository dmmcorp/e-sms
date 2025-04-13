'use client'
import { useQuery } from 'convex/react'
import React from 'react'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'
import { QuarterType } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import Chart from './chart'
import { Separator } from '@/components/ui/separator'
import CustomTooltip from '@/components/custom-tooltip'

interface JuniorHighProps {
  sectionId: Id<'sections'>;
  selectedQtr: QuarterType;
  sectionName: string;
}
function JuniorHigh({
  sectionId,
  selectedQtr,
  sectionName
}: JuniorHighProps) {
  const loads = useQuery(api.teachingLoad.getLoadUsingSectionId, {sectionId: sectionId, quarter: selectedQtr})
   
  return (
    <div className='grid grid-cols-3'>
      {loads?.map((load)=> (
        <Card key={load._id} className="">
        <CardContent>
          <div className="">
            <div className="">
              <Chart classRecords={load.classRecords}/>
            </div>
            <div className="grid grid-cols-2 py-1">
              
              <h1 className='text-xs md:text-sm  font-semibold'>{load.subject?.gradeLevel}</h1>
              <h1 className='text-xs md:text-sm text-right font-semibold'>{sectionName}</h1>
            </div>
            <Separator className='my-1'/>
            
            <div className="grid grid-cols-2 text-muted-foreground  mb-5">
              <h1 className='text-xs'>Students: {load.classRecords?.length}</h1>
              <div className="">
                {/* // Display the number of dropped students with a tooltip showing names of the students} */}
                <CustomTooltip 
                  trigger={<h1 className='text-xs'>Dropped: {load.droppedStud.length}</h1>}
                  content={
                    <div className="flex items-center justify-center min-h-56 min-w-56">
                      {load.droppedStud.length !== 0 ? load.droppedStud.map((student,index)=>(
                        <h3 key={"dropped" + student.student?._id}>{index + 1}.{student.student?.lastName}, {student.student?.firstName} {student.student?.middleName.charAt(0)} </h3>
                      )): (
                        <div className="flex items-center justify-center text-center w-full h-full">
                          No students has been dropped for this quarter.
                        </div>
                      )}
                    </div>
                  }
                  />
              </div>
              <div className="">
                {/* // Display the number of returning students with a tooltip showing names of the students} */}
                <CustomTooltip 
                  trigger={ <h1 className='text-xs'>Returning: {load.returningStud.length}</h1>}
                  content={
                    <div className="flex items-center justify-center min-h-56 min-w-56">
                      {load.returningStud.length !== 0 ? load.returningStud.map((student, index)=>(
                        <h3 key={"returning" + student.student?._id}>{index + 1}.{student.student?.lastName}, {student.student?.firstName} {student.student?.middleName.charAt(0)} </h3>
                      )): (
                        <div className="flex items-center justify-center text-center w-full h-full">
                          No students have returned for this quarter.
                        </div>
                      )}
                    </div>
                  }
                />
               </div>
              <div className="">
                {/* Display the number of students needing interventions with a tooltip showing names of the students */}
                <CustomTooltip 
                  trigger={ <h1 className='text-xs'>Needs interventions: {load.needsInterventions.length}</h1>}
                  content={
                    <div className="flex items-center justify-center min-h-56 min-w-56">
                      {load.needsInterventions.length !== 0 ? load.needsInterventions.map((student, index)=>(
                        <h3 key={"needsIntervention" + student.student?._id}>{index + 1}. {student.student?.lastName}, {student.student?.firstName} {student.student?.middleName.charAt(0)} </h3>
                      )): (
                        <div className="flex items-center justify-center text-center w-full h-full">
                          No students need intervention for this quarter.
                        </div>
                      )}
                    </div>
                  }
                />
               </div>
             
            </div>
            {/* <div className="flex items-center justify-end">

              <Link href={`/teacher/subject-teacher/${load._id}`}>
                <Button variant={'default'} className='hover:cursor-pointer'>Class Record <BiCaretRight/></Button>
              </Link>
            </div> */}
          </div>
        </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default JuniorHigh