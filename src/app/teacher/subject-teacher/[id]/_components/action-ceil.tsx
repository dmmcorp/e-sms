import { StudentNeedsIntervention } from '@/lib/types'
import React, { useState } from 'react'
import InterventionDialog from './intervention-dialog'
interface ActionCeilProps {
    student: StudentNeedsIntervention
}
export default function ActionCeil({
    student
}: ActionCeilProps) {
    const [open, setOpen ] = useState<boolean>(false)
      
    const quarterlyGrade = student.classRecord?.quarterlyGrade
    const usedIntervention = student.classRecord?.interventionUsed

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