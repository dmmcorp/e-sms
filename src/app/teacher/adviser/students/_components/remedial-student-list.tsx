'use client'
import { useQuery } from 'convex/react'
import React from 'react'
import { api } from '../../../../../../convex/_generated/api'
import { Id } from '../../../../../../convex/_generated/dataModel';
import { useSearchParams } from 'next/navigation';

function RemedialStudentList() {
    const searchParams = useSearchParams();
    const sectionId = searchParams.get('id') as Id<'sections'> | null;
    const forRemedial = useQuery(api.finalGrades.forRemedial, {
        sectionId: sectionId === null ? undefined : sectionId
    })

  return (
    <div>
        
    </div>
  )
}

export default RemedialStudentList