import { StudentNeedsIntervention } from '@/lib/types'
import React, { useState } from 'react'
import InterventionDialog from './intervention-dialog'
import { MultiSelect } from '@/components/ui/multi-select'
import { useQuery } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'
interface ActionCeilProps {
    student: StudentNeedsIntervention
}
export default function ActionCeil({
    student
}: ActionCeilProps) {
    const [open, setOpen ] = useState<boolean>(false)
      
    const quarterlyGrade = student.classRecord?.quarterlyGrade
    const usedIntervention = student.classRecord?.interventionUsed

       const interventions = useQuery(api.interventions.get)
        const interventionNames = interventions ? interventions.map(i => {
            return{
              label: i.name, 
              value: i.name,
              
            }
          }) : []

  return (
    <div className="">
        <InterventionDialog 
            quarterlyGrade={quarterlyGrade} 
            open={open} 
            setOpen={setOpen}
            usedIntervention={usedIntervention ?? []}
            classRecord={student.classRecord}
        />
    </div>
  )
}