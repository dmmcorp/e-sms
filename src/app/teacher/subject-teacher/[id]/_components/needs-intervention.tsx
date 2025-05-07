'use client'
import React from 'react'
import { DataTable } from '@/components/data-table'
import { StudentNeedsIntervention, TeachingLoadType } from '@/lib/types'
import { ColumnDef } from '@tanstack/react-table'
import { useQuery } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import ActionCeil from './action-ceil'

interface NeedsImprovementProps {
    teachingLoad: TeachingLoadType
}
function NeedsImprovement({
    teachingLoad
}:NeedsImprovementProps) {
    const section = teachingLoad.section;
    const students = useQuery(api.students.needsIntervention, {
        teachingLoadId: teachingLoad._id,
        sectionId: section._id
    });

    return (
        <div>
            <DataTable
                //@ts-ignore
                columns={forImprovementsColumns}
                data={students ?? []}
                filter='fullName' 
                placeholder='by name'
            />
        </div>  
    )
}

export default NeedsImprovement

const forImprovementsColumns: ColumnDef<StudentNeedsIntervention>[] = [
    { id: "fullName",
      accessorFn: (row) => {
        const { lastName, firstName, middleName } = row;
      
        // Construct the full name including optional middle and extension names
        return [
          firstName, 
          middleName, 
          lastName,
        ].filter(Boolean).join(" ");
      },
      header: "Full Name",
      cell: ({ row }) => {
        const  { firstName, middleName, lastName } = row.original
       const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`
       
        return (
          <div className="flex items-center gap-x-3 capitalize">
            <h1>{fullName}</h1>
          </div>
        )
      }
    },
    { accessorKey: "quarterlyGrade", header: "Quarterly Grade ",
      cell: ({ row }) => {
        const student = row.original
        const quarterlyGrade = student.classRecord?.quarterlyGrade
       
        return (
          <div className="flex items-center justify-center text-center gap-x-3 ">
           {quarterlyGrade}
          </div>
        )
      }
    },
    {
      id: "interventions",
      header: "Intervention details",
      cell: ({ row }) => {
        const interventionUsed = row.original.classRecord?.interventionUsed
        const modifiedGrade = row.original.classRecord?.interventionGrade
        const modGrade = modifiedGrade ?? "No modified grade"
        const remarks = row.original.classRecord?.interventionRemarks
        const remarksValue = remarks ?? "No remarks"
  
  
        return (
          <div className="flex flex-col items-start text-sm gap-y-3">
            <div className="text-left space-y-2 space-x-2">
              {interventionUsed ? interventionUsed.map((i, index)=> (
                <Badge key={i + index} className="capitalize text-xs text-white">{i}</Badge>
              )): (
               <p>No interventions used</p> 
              )}
              
            </div>
          
            <h1 className="font-semibold">Modified Grade : <span className="font-normal">{modGrade} {modifiedGrade ? modifiedGrade <= 74 ? (<span className="text-red-500 ml-2">Failed</span>) : ( <span className="ml-2 text-green-500">Passed</span>) : ""}</span> </h1>
            <div className="">
            <p className="">
              <span className="font-semibold">{interventionUsed ? interventionUsed.length > 1 ? "Remarks -" : interventionUsed && interventionUsed.length === 1 && `${interventionUsed[0]} - ` : ""}</span>
              <span className="text-wrap">{remarksValue} </span>
            </p>
  
            </div>
          </div>
        )
      }
    },
  
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => <ActionCeil student={row.original}/>
    },
  ]