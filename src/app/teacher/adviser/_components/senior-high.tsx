'use client'
import { useQuery } from 'convex/react'
import React from 'react'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'
import { QuarterType, SemesterType } from '@/lib/types'

interface SeniorHighProps {
  sectionName: string;
  sectionId: Id<'sections'>;
  selectedQtr: QuarterType;
  selectedSem: SemesterType;
  
}
function SeniorHigh({
  sectionName,
  sectionId,
  selectedQtr,
  selectedSem
}: SeniorHighProps) {
  const loads = useQuery(api.teachingLoad.getLoadUsingSectionId, {
    sectionId: sectionId, 
    quarter: selectedQtr,
    semester: selectedSem,
  })
   
  return (
    <div>
      {loads?.map((load)=> (
        <div key={load._id} className="">
            {load.subject.subjectName}
        </div>
      ))}
    </div>
  )
}

export default SeniorHigh